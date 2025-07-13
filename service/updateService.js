import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

export const updateForm = async (formData, subcategory) => {
    const formDataToSend = new URLSearchParams();
    Object.keys(formData).forEach((key) => {
        if (key === 'images') {
            formData.images.forEach((imageUri, index) => {
                formDataToSend.append('images[]', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: `image_${index}.jpg`,
                });
            });
        } else {
            formDataToSend.append(key, formData[key]);
        }
    });

    formDataToSend.append('category_id', subcategory.id);
    formDataToSend.append('guard_name', subcategory.guard_name);
    formDataToSend.append('post_type', 'sell');
    formDataToSend.append('address', 'India');
    console.log(`${process.env.BASE_URL}/posts/${formData.id}`);
    const token = await AsyncStorage.getItem('authToken');
    try {
        const response = await fetch(`${process.env.BASE_URL}/posts/${formData.id}`, {
            method: 'PUT',
            body: formDataToSend,
            headers: {
                'Accept': 'application/json',
                // 'Content-Type': 'multipart/form-data',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        const responseData = await response.json();
        if (response.ok) {
            Dialog.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                textBody: 'Details updated successfully!',
                button: 'close',
            });
        } else {
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: 'Validation Error',
                textBody: responseData.message,
                button: 'close',
            });
        }

        return responseData;
    } catch (error) {
        Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'Error',
            textBody: 'There was an issue submitting the form.',
            button: 'close',
        });
        throw error;
    }
}