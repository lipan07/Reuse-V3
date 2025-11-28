import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import styles from '../../../assets/css/AddProductForm.styles.js';

const VideoPickerComponent = ({ formData, setFormData, propertyTitle = '' }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

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

            // Upload directly to server (which will upload to your YouTube channel)
            uploadVideoToServer(selectedVideo);
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

            const title = propertyTitle || formData.adTitle || 'Property Video';

            // Create FormData
            const formData = new FormData();
            formData.append('video', {
                uri: videoAsset.uri,
                type: videoAsset.type || 'video/mp4',
                name: videoAsset.fileName || `video_${Date.now()}.mp4`,
            });
            formData.append('title', title);
            formData.append('description', 'Property video uploaded from Reuse App');
            formData.append('privacy', 'unlisted');

            console.log('Uploading video to server...', {
                uri: videoAsset.uri,
                title: title,
                size: videoAsset.fileSize,
            });

            // Upload to server
            console.log('Uploading to:', `${BASE_URL}/youtube/upload`);

            const response = await fetch(`${BASE_URL}/youtube/upload`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type for FormData, let browser set it with boundary
                },
                body: formData,
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            // Handle 413 error specifically
            if (response.status === 413) {
                Alert.alert(
                    'File Too Large',
                    `The video file is too large for upload.\n\n` +
                    `Current limits:\n` +
                    `• Maximum file size: 1GB\n\n` +
                    `Please try:\n` +
                    `1. Compress the video\n` +
                    `2. Use a shorter video\n` +
                    `3. Contact support if you need to upload larger files`,
                    [{ text: 'OK' }]
                );
                setIsUploading(false);
                return;
            }

            // Get response text first to check if it's JSON
            const responseText = await response.text();
            console.log('Response text (first 500 chars):', responseText.substring(0, 500));

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError);
                console.error('Response was:', responseText);

                // If it's HTML, it's likely an error page
                if (responseText.trim().startsWith('<')) {
                    Alert.alert(
                        'Server Error',
                        `Server returned an error page (Status: ${response.status}).\n\n` +
                        `This usually means:\n` +
                        `1. The endpoint doesn't exist (404)\n` +
                        `2. Server error (500)\n` +
                        `3. Authentication failed\n\n` +
                        `Check server logs for details.`,
                        [{ text: 'OK' }]
                    );
                } else {
                    Alert.alert('Error', `Server response error: ${responseText.substring(0, 200)}`);
                }
                setIsUploading(false);
                return;
            }

            console.log('Server response:', result);

            if (result.success) {
                // Update form data with video URL
                setFormData((prev) => ({
                    ...prev,
                    videoUrl: result.video_url,
                    videoId: result.video_id,
                }));

                Alert.alert('Success', 'Video uploaded to YouTube successfully!');
            } else {
                Alert.alert('Upload Failed', result.error || 'Failed to upload video to YouTube');
            }
        } catch (error) {
            console.error('Video upload error:', error);
            Alert.alert('Error', 'Failed to upload video. Please check your internet connection and try again.');
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
                Video will be uploaded to our YouTube channel as unlisted
            </Text>

            {!formData.videoUrl ? (
                <TouchableOpacity
                    style={[styles.uploadArea, isUploading && styles.uploadAreaDisabled]}
                    onPress={handleVideoPick}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <View style={customStyles.uploadingContainer}>
                            <ActivityIndicator size="small" color="#007BFF" />
                            <Text style={styles.uploadText}>
                                Uploading... {Math.round(uploadProgress)}%
                            </Text>
                        </View>
                    ) : (
                        <>
                            <MaterialIcons name="videocam" size={24} color="#007BFF" />
                            <Text style={styles.uploadText}>Tap to select and upload video</Text>
                        </>
                    )}
                </TouchableOpacity>
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
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    videoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        marginTop: 8,
    },
    videoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    videoUrlText: {
        color: '#2e7d32',
        fontSize: 14,
        flex: 1,
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        gap: 4,
    },
    removeButtonText: {
        color: '#dc3545',
        fontSize: 14,
        fontWeight: '500',
    },
    uploadAreaDisabled: {
        opacity: 0.6,
    },
});

export default VideoPickerComponent;

