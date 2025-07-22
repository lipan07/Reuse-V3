import AsyncStorage from '@react-native-async-storage/async-storage';

export const submitForm = async (formData, subcategory) => {
    const token = await AsyncStorage.getItem('authToken');
    const formDataToSend = new FormData();

    // Append standard fields
    Object.keys(formData).forEach((key) => {
        if (!['images', 'deletedImages'].includes(key)) {
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

    // Common fields
    formDataToSend.append('category_id', subcategory.id);
    formDataToSend.append('guard_name', subcategory.guard_name);
    formDataToSend.append('post_type', 'sell');

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