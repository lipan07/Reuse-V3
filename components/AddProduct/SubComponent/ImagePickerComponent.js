import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Platform, Linking, PermissionsAndroid } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Image as Compressor } from 'react-native-compressor';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs'; // Import react-native-fs
import styles from '../../../assets/css/AddProductForm.styles.js';

const MAX_IMAGES = 5; // Maximum number of images allowed

const ImagePickerComponent = ({ formData, setFormData }) => {
    const [isCompressing, setIsCompressing] = useState(false); // Track compression state

    const requestStoragePermission = async () => {
        if (Platform.OS !== 'android') {
            return true; // iOS handles permissions automatically
        }

        try {
            // For Android 13+ (API 33+), use READ_MEDIA_IMAGES
            if (Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to your photos to upload images.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                // For Android 12 and below, use READ_EXTERNAL_STORAGE
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to your storage to upload images.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
        } catch (err) {
            console.warn('Permission request error:', err);
            return false;
        }
    };

    const handleImagePick = async () => {
        if (formData.images.length >= MAX_IMAGES) {
            Alert.alert('Limit Reached', `You can only upload up to ${MAX_IMAGES} images.`);
            return;
        }

        // Request storage permissions before opening image picker (Android only)
        if (Platform.OS === 'android') {
            const hasPermission = await requestStoragePermission();

            if (!hasPermission) {
                Alert.alert(
                    'Permission Required',
                    'Storage permission is required to select images. Please grant permission in your device settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Open Settings',
                            onPress: () => {
                                Linking.openSettings();
                            }
                        }
                    ]
                );
                return;
            }
        }

        const options = {
            mediaType: 'photo',
            selectionLimit: MAX_IMAGES - formData.images.length, // Limit the number of images that can be selected
            quality: 1,
        };

        const result = await launchImageLibrary(options);

        if (result.didCancel) {
            console.log('User cancelled image picker');
        } else if (result.errorMessage) {
            console.error('ImagePicker Error:', result.errorMessage);
        } else if (result.assets?.length > 0) {
            setIsCompressing(true); // Start compression

            const compressedImages = await Promise.all(
                result.assets.map(async (asset) => {
                    try {
                        // Log original image size
                        const originalStats = await RNFS.stat(asset.uri);
                        console.log(`Original Image Size: ${originalStats.size / 1024} KB`);

                        // Compress the image
                        const compressedUri = await Compressor.compress(asset.uri, {
                            compressionMethod: 'auto', // Automatically determine the best compression
                            quality: 0.7, // Adjust quality (0.7 = 70%)
                            maxWidth: 1280, // Resize to a maximum width
                            maxHeight: 720, // Resize to a maximum height
                        });

                        // Log compressed image size
                        const compressedStats = await RNFS.stat(compressedUri);
                        console.log(`Compressed Image Size: ${compressedStats.size / 1024} KB`);

                        return {
                            uri: compressedUri,
                            isNew: true, // Mark new images
                        };
                    } catch (error) {
                        console.error('Compression Error:', error);
                        return null;
                    }
                })
            );

            // Filter out any null values (in case of compression errors)
            const validImages = compressedImages.filter((img) => img !== null);

            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...validImages],
            }));

            setIsCompressing(false); // End compression
        }
    };

    const handleImageRemove = (image) => {
        if (image.isNew) {
            // Remove new images directly
            setFormData((prev) => ({
                ...prev,
                images: prev.images.filter((img) => img.uri !== image.uri),
            }));
        } else {
            // Track deleted existing images
            setFormData((prev) => ({
                ...prev,
                images: prev.images.filter((img) => img.uri !== image.uri),
                deletedImages: [...prev.deletedImages, image.uri],
            }));
        }
    };

    return (
        <>
            <TouchableOpacity
                style={styles.uploadArea}
                onPress={handleImagePick}
                disabled={isCompressing} // Disable while compressing
            >
                <MaterialIcons name="cloud-upload" size={24} color={isCompressing ? '#ccc' : '#007BFF'} />
                <Text style={styles.uploadText}>
                    {isCompressing ? 'Compressing...' : 'Tap to upload'}
                </Text>
            </TouchableOpacity>

            <View style={styles.imagesContainer}>
                {formData.images.map((image, index) => (
                    <View key={index} style={styles.imageWrapper}>
                        <Image source={{ uri: image.uri || image }} style={styles.image} />
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleImageRemove(image)}
                        >
                            <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                        {!image.isNew && (
                            <View style={styles.existingBadge}>
                                <Text style={styles.existingBadgeText}>Existing</Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </>
    );
};

export default ImagePickerComponent;