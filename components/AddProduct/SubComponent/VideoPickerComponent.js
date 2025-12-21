import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import { Video } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import backblazeService from '../../../service/backblazeService';
import styles from '../../../assets/css/AddProductForm.styles.js';

const VideoPickerComponent = ({ formData, setFormData, propertyTitle = '', onUploadStateChange, onShowAlert }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [compressionProgress, setCompressionProgress] = useState(0);

    // Notify parent component of upload state changes
    useEffect(() => {
        if (onUploadStateChange) {
            onUploadStateChange(isUploading || isCompressing);
        }
    }, [isUploading, isCompressing, onUploadStateChange]);

    const handleVideoPick = async () => {
        // Check if already has a video
        if (formData.videoUrl) {
            if (onShowAlert) {
                onShowAlert('warning', 'Video Already Uploaded', 'You already have a video uploaded. Remove it first to upload a new one.');
            } else {
                Alert.alert(
                    'Video Already Uploaded',
                    'You already have a video uploaded. Remove it first to upload a new one.',
                    [{ text: 'OK' }]
                );
            }
            return;
        }

        const options = {
            mediaType: 'video',
            quality: 1,
            videoQuality: 'high',
        };

        const result = await launchImageLibrary(options);

        if (result.didCancel) {
            console.log('User cancelled video picker');
            return;
        }

        if (result.errorMessage) {
            if (onShowAlert) {
                onShowAlert('error', 'Error', result.errorMessage);
            } else {
                Alert.alert('Error', result.errorMessage);
            }
            return;
        }

        if (result.assets && result.assets[0]) {
            const selectedVideo = result.assets[0];

            // Validate video duration (3 minutes = 180 seconds = 180000 milliseconds)
            const maxDuration = 3 * 60 * 1000; // 3 minutes in milliseconds
            if (selectedVideo.duration && selectedVideo.duration > maxDuration) {
                if (onShowAlert) {
                    onShowAlert(
                        'warning',
                        'Video Too Long',
                        'Please select a video that is 3 minutes or less. Your video is ' +
                        Math.round(selectedVideo.duration / 1000) + ' seconds long.'
                    );
                } else {
                    Alert.alert(
                        'Video Too Long',
                        'Please select a video that is 3 minutes or less. Your video is ' +
                        Math.round(selectedVideo.duration / 1000) + ' seconds long.',
                        [{ text: 'OK' }]
                    );
                }
                return;
            }

            // Compress video first, then upload
            compressAndUploadVideo(selectedVideo);
        }
    };

    const compressAndUploadVideo = async (videoAsset) => {
        setIsCompressing(true);
        setCompressionProgress(0);
        setUploadProgress(0);

        try {
            console.log('Starting video compression with FFmpeg...', {
                uri: videoAsset.uri,
                originalSize: videoAsset.fileSize,
            });

            // Verify original file exists
            let originalFileInfo;
            try {
                originalFileInfo = await RNFS.stat(videoAsset.uri);
                console.log('Original file size:', originalFileInfo.size, 'bytes');

                if (!originalFileInfo || originalFileInfo.size === 0) {
                    throw new Error('Original video file is empty');
                }
            } catch (statError) {
                console.error('Failed to stat original file:', statError);
                throw new Error('Original video file not found');
            }

            // Determine compression settings based on file size
            const fileSizeMB = originalFileInfo.size / (1024 * 1024);
            let compressionConfig;

            if (fileSizeMB > 100) {
                // Very large files: Aggressive compression
                compressionConfig = {
                    compressionMethod: 'auto',
                    maxSize: 720, // 720p for large files
                    quality: 0.5, // 50% quality
                };
                console.log(`Large file (${fileSizeMB.toFixed(2)}MB) - Using 720p, 50% quality`);
            } else if (fileSizeMB > 50) {
                // Medium files: Balanced compression
                compressionConfig = {
                    compressionMethod: 'auto',
                    maxSize: 1080, // 1080p
                    quality: 0.6, // 60% quality
                };
                console.log(`Medium file (${fileSizeMB.toFixed(2)}MB) - Using 1080p, 60% quality`);
            } else {
                // Smaller files: Light compression
                compressionConfig = {
                    compressionMethod: 'auto',
                    maxSize: 1080, // 1080p
                    quality: 0.7, // 70% quality
                };
                console.log(`Small file (${fileSizeMB.toFixed(2)}MB) - Using 1080p, 70% quality`);
            }

            // Compress video using react-native-compressor
            setIsCompressing(true);
            setCompressionProgress(10);

            console.log('Starting video compression with react-native-compressor...');

            let compressedVideoUri;
            try {
                compressedVideoUri = await Video.compress(videoAsset.uri, {
                    ...compressionConfig,
                    minimumFileSizeForCompression: 0, // Compress all videos
                    getProgress: (progress) => {
                        const progressPercent = Math.min(100, Math.max(0, progress));
                        setCompressionProgress(progressPercent);
                        console.log(`Compression progress: ${progressPercent.toFixed(2)}%`);
                    },
                });

                if (!compressedVideoUri || compressedVideoUri.trim() === '') {
                    throw new Error('Compression returned empty URI');
                }

                console.log('Compression completed, URI:', compressedVideoUri);
                setCompressionProgress(100);
            } catch (compressError) {
                console.error('Compression failed:', compressError);
                throw new Error('Video compression failed: ' + compressError.message);
            }

            // Use compressed URI as output path
            const outputPath = compressedVideoUri;

            // Verify compressed file exists and has valid size
            let compressedFileInfo;
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                try {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    compressedFileInfo = await RNFS.stat(outputPath);

                    if (compressedFileInfo && compressedFileInfo.size > 0) {
                        console.log('Compressed file verified! Size:', compressedFileInfo.size, 'bytes');
                        break;
                    } else {
                        attempts++;
                        console.warn(`Compressed file is 0 bytes (attempt ${attempts}), waiting...`);
                    }
                } catch (statError) {
                    attempts++;
                    console.warn(`Failed to stat compressed file (attempt ${attempts}):`, statError.message);

                    if (attempts >= maxAttempts) {
                        throw new Error('Compressed file not found after compression');
                    }
                }
            }

            if (!compressedFileInfo || compressedFileInfo.size === 0) {
                throw new Error('Compressed file is empty');
            }

            const originalSizeMB = (originalFileInfo.size / 1024 / 1024).toFixed(2);
            const compressedSizeMB = (compressedFileInfo.size / 1024 / 1024).toFixed(2);
            const reductionPercent = ((1 - compressedFileInfo.size / originalFileInfo.size) * 100).toFixed(1);

            console.log(`Video compressed: ${originalSizeMB}MB → ${compressedSizeMB}MB (${reductionPercent}% reduction)`);

            // If compressed file is larger or same size, use original
            if (compressedFileInfo.size >= originalFileInfo.size) {
                console.warn('Compressed file is not smaller, using original');
                setIsCompressing(false);
                setCompressionProgress(0);
                setIsUploading(true);
                await uploadVideoToServer(videoAsset);
                return;
            }

            setIsCompressing(false);
            setCompressionProgress(0);
            setIsUploading(true);

            // Upload compressed video
            await uploadVideoToServer({
                ...videoAsset,
                uri: outputPath,
                fileSize: compressedFileInfo.size,
            });
        } catch (error) {
            console.error('Video compression error:', error);
            setIsCompressing(false);
            setCompressionProgress(0);

            // Fallback to original file
            console.log('Falling back to original video file:', error.message);
            setIsUploading(true);
            await uploadVideoToServer(videoAsset);
        }
    };

    const uploadVideoToServer = async (videoAsset) => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                if (onShowAlert) {
                    onShowAlert('error', 'Authentication Required', 'Please login first to upload videos.');
                } else {
                    Alert.alert('Error', 'Please login first');
                }
                setIsUploading(false);
                return;
            }

            console.log('Uploading video to Backblaze...', {
                uri: videoAsset.uri,
                size: videoAsset.fileSize,
                type: videoAsset.type,
            });

            // Generate file name
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const fileName = videoAsset.fileName || `video_${timestamp}_${randomStr}.mp4`;

            // Upload directly to Backblaze with progress tracking
            console.log('Starting upload to Backblaze...');
            const result = await backblazeService.uploadVideo(
                videoAsset.uri,
                fileName,
                (bytesUploaded, totalBytes) => {
                    const progress = Math.min(100, Math.max(0, (bytesUploaded / totalBytes) * 100));
                    setUploadProgress(progress);
                    console.log(`Upload progress: ${progress.toFixed(2)}% (${(bytesUploaded / 1024 / 1024).toFixed(2)}MB / ${(totalBytes / 1024 / 1024).toFixed(2)}MB)`);
                }
            );

            if (result && result.success && result.fileUrl) {
                // Verify file URL is valid
                if (!result.fileUrl || result.fileUrl.trim() === '') {
                    throw new Error('Upload succeeded but file URL is empty');
                }

                console.log('Upload successful! File URL:', result.fileUrl);

                // Update form data with video URL
                setFormData((prev) => ({
                    ...prev,
                    videoUrl: result.fileUrl,
                    videoId: result.fileId || null, // Store fileId for reference
                }));

                // No success modal needed - UI already shows success indicator
            } else {
                const errorMsg = result?.error || result?.message || 'Failed to upload video';
                console.error('Upload failed:', errorMsg);
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('Video upload error:', error);

            // Handle specific error types
            let errorMessage = 'Failed to upload video. Please try again.';
            if (error.message) {
                if (error.message.includes('Authentication required')) {
                    errorMessage = 'Please login first to upload videos.';
                } else if (error.message.includes('Failed to get upload URL')) {
                    errorMessage = 'Server error: Could not get upload permission. Please contact support.';
                } else if (error.message.includes('Upload failed')) {
                    errorMessage = 'Upload failed. Please check your internet connection and try again.';
                } else {
                    errorMessage = error.message;
                }
            }

            if (onShowAlert) {
                onShowAlert('error', 'Upload Error', errorMessage);
            } else {
                Alert.alert('Upload Error', errorMessage);
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleVideoRemove = async () => {
        const removeVideo = async () => {
            try {
                const currentVideoUrl = formData.videoUrl;
                const currentVideoId = formData.videoId;
                const isExistingVideo = currentVideoUrl && !currentVideoUrl.startsWith('file://');

                // If it's an existing video (from edit), mark it for deletion
                if (isExistingVideo) {
                    // Try to delete from Backblaze (but don't block if it fails)
                    // The backend will also try to delete it when the form is submitted
                    try {
                        if (currentVideoId) {
                            // Delete using file ID
                            await backblazeService.deleteVideo(currentVideoId);
                            console.log('Video deleted from Backblaze using file ID');
                        } else if (currentVideoUrl) {
                            // Delete using URL (via backend)
                            await backblazeService.deleteVideoByUrl(currentVideoUrl, currentVideoId);
                            console.log('Video deleted from Backblaze using URL');
                        }
                    } catch (deleteError) {
                        console.warn('Failed to delete video from Backblaze immediately:', deleteError.message || deleteError);
                        // Continue with removal even if Backblaze delete fails
                        // The video will still be removed from the form and backend will try to delete it
                    }

                    // Track deleted video for backend processing
                    setFormData((prev) => ({
                        ...prev,
                        videoUrl: null,
                        videoId: null,
                        deletedVideoUrl: currentVideoUrl, // Track for backend
                        deletedVideoId: currentVideoId, // Track for backend
                    }));
                } else {
                    // New video that wasn't uploaded yet, just remove it
                    setFormData((prev) => ({
                        ...prev,
                        videoUrl: null,
                        videoId: null,
                    }));
                }

                if (onShowAlert) {
                    onShowAlert('success', 'Video Removed', 'Video has been removed successfully.');
                }
            } catch (error) {
                console.error('Error removing video:', error);
                if (onShowAlert) {
                    onShowAlert('error', 'Error', 'Failed to remove video. Please try again.');
                } else {
                    Alert.alert('Error', 'Failed to remove video. Please try again.');
                }
            }
        };

        // Use Alert for confirmation since ModalScreen doesn't support confirm dialogs
        Alert.alert(
            'Remove Video',
            'Are you sure you want to remove this video? It will be deleted from storage.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: removeVideo
                }
            ]
        );
    };

    return (
        <View style={customStyles.container}>
            {!formData.videoUrl ? (
                <View style={customStyles.uploadArea}>
                    {(isUploading || isCompressing) ? (
                        <View style={customStyles.progressWrapper}>
                            {isCompressing ? (
                                <View style={customStyles.progressCard}>
                                    <View style={customStyles.progressContent}>
                                        <View style={customStyles.progressLeft}>
                                            <View style={customStyles.iconContainer}>
                                                <MaterialIcons name="settings" size={24} color="#007BFF" />
                                            </View>
                                            <View style={customStyles.progressTextContainer}>
                                                <Text style={customStyles.progressTitle}>Compressing Video</Text>
                                                <Text style={customStyles.progressSubtext}>Optimizing file size for faster upload</Text>
                                            </View>
                                        </View>
                                        <View style={customStyles.progressRight}>
                                            <Text style={customStyles.progressPercent}>
                                                {Math.round(compressionProgress)}%
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={customStyles.progressBarWrapper}>
                                        <View style={customStyles.progressBarContainer}>
                                            <View style={[customStyles.progressBar, { width: `${compressionProgress}%` }]} />
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={customStyles.progressCard}>
                                    <View style={customStyles.progressContent}>
                                        <View style={customStyles.progressLeft}>
                                            <View style={customStyles.iconContainer}>
                                                <MaterialIcons name="cloud-upload" size={24} color="#007BFF" />
                                            </View>
                                            <View style={customStyles.progressTextContainer}>
                                                <Text style={customStyles.progressTitle}>Uploading Video</Text>
                                                <Text style={customStyles.progressSubtext}>Sending to cloud storage</Text>
                                            </View>
                                        </View>
                                        <View style={customStyles.progressRight}>
                                            <Text style={customStyles.progressPercent}>
                                                {Math.round(uploadProgress)}%
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={customStyles.progressBarWrapper}>
                                        <View style={customStyles.progressBarContainer}>
                                            <View style={[customStyles.progressBar, { width: `${uploadProgress}%` }]} />
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleVideoPick}
                            disabled={false}
                            activeOpacity={0.7}
                            style={customStyles.uploadButton}
                        >
                            <MaterialIcons name="videocam" size={24} color="#007BFF" />
                            <Text style={customStyles.uploadText}>
                                {isCompressing ? 'Compressing...' : 'Tap to upload'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <View style={customStyles.videoContainer}>
                    <View style={customStyles.videoInfo}>
                        <View style={customStyles.successIconContainer}>
                            <MaterialIcons name="check-circle" size={24} color="#007BFF" />
                        </View>
                        <View style={customStyles.videoTextContainer}>
                            <Text style={customStyles.videoUrlText} numberOfLines={1}>
                                Video uploaded successfully
                            </Text>
                            <Text style={customStyles.videoSubtext}>Ready to publish</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={customStyles.removeButton}
                        onPress={handleVideoRemove}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="delete-outline" size={16} color="#DC2626" />
                        <Text style={customStyles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const customStyles = StyleSheet.create({
    container: {
        width: '100%',
    },
    uploadArea: {
        width: '100%',
    },
    progressWrapper: {
        width: '100%',
    },
    progressCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    progressContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    progressLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        flexShrink: 0,
    },
    progressTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    progressTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#007BFF',
        marginBottom: 4,
    },
    progressSubtext: {
        fontSize: 11,
        color: '#666',
        fontWeight: '400',
    },
    progressRight: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        minWidth: 50,
        flexShrink: 0,
    },
    progressPercent: {
        fontSize: 13,
        fontWeight: '600',
        color: '#007BFF',
    },
    progressBarWrapper: {
        width: '100%',
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        overflow: 'hidden',
        width: '100%',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: '#007BFF',
    },
    uploadButton: {
        borderWidth: 1,
        borderColor: '#007BFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F7FA',
        marginBottom: 18,
        width: '100%',
        height: 74,
        alignSelf: 'center',
        borderStyle: 'dashed',
    },
    uploadText: {
        marginTop: 5,
        fontSize: 13,
        color: '#007BFF',
        textAlign: 'center',
    },
    videoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        marginTop: 0,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#007BFF',
    },
    videoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    successIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        flexShrink: 0,
    },
    videoTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    videoUrlText: {
        color: '#007BFF',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    videoSubtext: {
        color: '#666',
        fontSize: 11,
        fontWeight: '400',
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FECACA',
        gap: 5,
    },
    removeButtonText: {
        color: '#DC2626',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    uploadAreaDisabled: {
        opacity: 0.6,
    },
    hintText: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '400',
        lineHeight: 16,
    },
});

export default VideoPickerComponent;

