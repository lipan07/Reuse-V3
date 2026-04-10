import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { AD_SETTING_SLUGS } from '../constants/adSettingSlugs';
import { isAdTypeEnabled } from './adSettingsService';

/** Interstitial shown after successful new post creation */
const postCreateInterstitialUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : process.env.G_POST_CREATE_INTERSTITIAL_AD_UNIT_ID;

let isInterstitialFlowRunning = false;

const showPostCreateInterstitial = () => {
    if (!isAdTypeEnabled(AD_SETTING_SLUGS.POST_CREATE_INTERSTITIAL)) return;
    // In release, skip if no dedicated interstitial unit configured.
    if (!postCreateInterstitialUnitId) return;
    if (isInterstitialFlowRunning) return;

    isInterstitialFlowRunning = true;
    const interstitial = InterstitialAd.createForAdRequest(postCreateInterstitialUnitId);

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        try {
            interstitial.show();
        } catch (e) {
            console.warn('Interstitial show error:', e);
            cleanup();
        }
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (e) => {
        console.warn('Interstitial load error:', e);
        cleanup();
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        cleanup();
    });

    const cleanup = () => {
        unsubscribeLoaded?.();
        unsubscribeError?.();
        unsubscribeClosed?.();
        isInterstitialFlowRunning = false;
    };

    try {
        interstitial.load();
    } catch (e) {
        console.warn('Interstitial load call failed:', e);
        cleanup();
    }
};

export const submitForm = async (formData, subcategory) => {
    const token = await AsyncStorage.getItem('authToken');
    const formDataToSend = new FormData();

    // Append standard fields
    Object.keys(formData).forEach((key) => {
        if (!['images', 'deletedImages', 'videoId', 'deletedVideoUrl', 'deletedVideoId'].includes(key)) {
            formDataToSend.append(key, formData[key]);
        }
    });

    // Handle images
    if (formData.images) {
        // Append new images
        formData.images
            .filter(image => image.isNew)
            .forEach((image, index) => {
                formDataToSend.append('new_images[]', {
                    uri: image.uri,
                    type: 'image/jpeg',
                    name: `image_${Date.now()}_${index}.jpg`
                });
            });

        // Append existing image IDs
        formData.images
            .filter(image => !image.isNew)
            .map(image => image.uri)
            .forEach(uri => formDataToSend.append('existing_images[]', uri));
    }

    // Append deleted image IDs
    if (formData.deletedImages) {
        formData.deletedImages.forEach(id =>
            formDataToSend.append('deleted_images[]', id)
        );
    }

    // Handle deleted video
    if (formData.deletedVideoUrl || formData.deletedVideoId) {
        if (formData.deletedVideoUrl) {
            formDataToSend.append('deleted_video_url', formData.deletedVideoUrl);
        }
        if (formData.deletedVideoId) {
            formDataToSend.append('deleted_video_id', formData.deletedVideoId);
        }
    }

    // Common fields
    formDataToSend.append('category_id', subcategory.id);
    formDataToSend.append('guard_name', subcategory.guard_name);
    // formDataToSend.append('post_type', 'sell');

    // Determine API endpoint and method
    const isUpdate = !!formData.id;
    const apiUrl = isUpdate
        ? `${process.env.BASE_URL}/posts/${formData.id}`
        : `${process.env.BASE_URL}/posts`;
    console.log(apiUrl);
    console.log('Form Data:', formDataToSend);
    try {
        const response = await fetch(apiUrl, {
            method: isUpdate ? 'POST' : 'POST',
            body: formDataToSend,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
        });

        const responseData = await response.json();

        console.log('API Response:', {
            status: response.status,
            ok: response.ok,
            data: responseData
        });

        if (response.ok) {
            // Show ad only after successful new post creation (not on edit/update).
            if (!isUpdate) {
                showPostCreateInterstitial();
            }
            return {
                success: true,
                alert: {
                    type: 'success',
                    title: 'Success',
                    message: isUpdate ? 'Post updated successfully!' : 'Post created successfully!'
                },
                data: responseData
            };
        } else {
            return {
                success: false,
                alert: {
                    type: 'warning',
                    title: 'Validation Error',
                    message: responseData.message || 'Something went wrong!'
                },
                errors: responseData.errors
            };
        }
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            alert: {
                type: 'error',
                title: 'Network Error',
                message: 'Failed to connect to the server'
            },
            error: error.message
        };
    }
};