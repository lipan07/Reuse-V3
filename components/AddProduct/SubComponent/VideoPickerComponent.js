import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import { Video } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import backblazeService from '../../../service/backblazeService';
import styles from '../../../assets/css/AddProductForm.styles.js';

const VideoPickerComponent = ({ formData, setFormData, propertyTitle = '' }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [compressionProgress, setCompressionProgress] = useState(0);

    const handleVideoPick = async () => {
        // Check if already has a video
        if (formData.videoUrl) {
            Alert.alert(
                'Video Already Uploaded',
                'You already have a video uploaded. Remove it first to upload a new one.',
                [{ text: 'OK' }]
            );
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
            Alert.alert('Error', result.errorMessage);
            return;
        }

        if (result.assets && result.assets[0]) {
            const selectedVideo = result.assets[0];

            // Validate video duration (3 minutes = 180 seconds = 180000 milliseconds)
            const maxDuration = 3 * 60 * 1000; // 3 minutes in milliseconds
            if (selectedVideo.duration && selectedVideo.duration > maxDuration) {
                Alert.alert(
                    'Video Too Long',
                    'Please select a video that is 3 minutes or less. Your video is ' +
                    Math.round(selectedVideo.duration / 1000) + ' seconds long.',
                    [{ text: 'OK' }]
                );
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
                Alert.alert('Error', 'Please login first');
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

                Alert.alert('Success', 'Video uploaded successfully!');
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

            Alert.alert('Upload Error', errorMessage);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleVideoRemove = () => {
        Alert.alert(
            'Remove Video',
            'Are you sure you want to remove this video?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setFormData((prev) => ({
                            ...prev,
                            videoUrl: null,
                            videoId: null,
                        }));
                    },
                },
            ]
        );
    };

    return (
        <>
            <Text style={styles.label}>Upload Video (Optional)</Text>
            <Text style={styles.hintText}>
                Video will be uploaded directly to Backblaze storage
            </Text>

            {!formData.videoUrl ? (
                <View style={styles.uploadArea}>
                    {(isUploading || isCompressing) ? (
                        <View style={customStyles.progressWrapper}>
                            {isCompressing ? (
                                <View style={customStyles.progressCard}>
                                    <View style={customStyles.progressHeader}>
                                        <View style={[customStyles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                                            <MaterialIcons name="compress" size={22} color="#FF9800" />
                                        </View>
                                        <View style={customStyles.progressHeaderText}>
                                            <Text style={customStyles.progressTitle}>Compressing Video</Text>
                                            <Text style={customStyles.progressSubtext}>Optimizing file size...</Text>
                                        </View>
                                        <View style={customStyles.percentContainer}>
                                            <Text style={[customStyles.progressPercent, { color: '#FF9800' }]}>
                                                {Math.round(compressionProgress)}%
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={customStyles.progressBarContainer}>
                                        <View style={[customStyles.progressBar, { width: `${compressionProgress}%`, backgroundColor: '#FF9800' }]} />
                                    </View>
                                </View>
                            ) : (
                                <View style={customStyles.progressCard}>
                                    <View style={customStyles.progressHeader}>
                                        <View style={[customStyles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                                            <MaterialIcons name="cloud-upload" size={22} color="#007BFF" />
                                        </View>
                                        <View style={customStyles.progressHeaderText}>
                                            <Text style={customStyles.progressTitle}>Uploading to Backblaze</Text>
                                            <Text style={customStyles.progressSubtext}>Uploading your video...</Text>
                                        </View>
                                        <View style={customStyles.percentContainer}>
                                            <Text style={[customStyles.progressPercent, { color: '#007BFF' }]}>
                                                {Math.round(uploadProgress)}%
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={customStyles.progressBarContainer}>
                                        <View style={[customStyles.progressBar, { width: `${uploadProgress}%`, backgroundColor: '#007BFF' }]} />
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
                            <View style={customStyles.uploadContent}>
                                <MaterialIcons name="videocam" size={32} color="#007BFF" />
                                <Text style={styles.uploadText}>Tap to select and upload video</Text>
                                <Text style={customStyles.hintText}>Video will be compressed to reduce size</Text>
                            </View>
                            </TouchableOpacity>
                    )}
                </View>
            ) : (
                <View style={customStyles.videoContainer}>
                    <View style={customStyles.videoInfo}>
                        <MaterialIcons name="check-circle" size={20} color="#28a745" />
                        <Text style={customStyles.videoUrlText} numberOfLines={1}>
                            Video uploaded successfully
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={customStyles.removeButton}
                        onPress={handleVideoRemove}
                    >
                        <MaterialIcons name="delete" size={20} color="#dc3545" />
                        <Text style={customStyles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
};

const customStyles = StyleSheet.create({
    progressWrapper: {
        width: '100%',
        paddingHorizontal: 4,
    },
    progressCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        flexShrink: 0,
    },
    progressHeaderText: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 8,
    },
    progressTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        letterSpacing: 0.1,
        marginBottom: 3,
        lineHeight: 20,
    },
    progressSubtext: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '400',
        lineHeight: 16,
    },
    percentContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        minWidth: 48,
        flexShrink: 0,
    },
    progressPercent: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
        lineHeight: 20,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
        width: '100%',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    uploadButton: {
        width: '100%',
        height: '100%',
    },
    uploadContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    videoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    videoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    videoUrlText: {
        color: '#166534',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
        gap: 6,
    },
    removeButtonText: {
        color: '#DC2626',
        fontSize: 13,
        fontWeight: '600',
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

