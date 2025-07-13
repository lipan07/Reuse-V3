import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dialog, ALERT_TYPE } from 'react-native-alert-notification';

// Function to handle follow/unfollow API call
export const toggleFollow = async (companyId, isFollowing, setIsFollowing) => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: 'Authentication Error',
                textBody: 'You need to log in first.',
                button: 'OK',
            });
            return;
        }

        const apiUrl = `${process.env.BASE_URL}/follow-user`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ following_id: companyId }),
        });

        const result = await response.json();

        if (response.ok) {
            setIsFollowing(!isFollowing); // Toggle the follow state
            Dialog.show({
                type: ALERT_TYPE.SUCCESS,
                title: isFollowing ? 'Unfollowed' : 'Followed',
                textBody: result.message,
                button: 'OK',
            });
        } else {
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: 'Warning',
                textBody: result.message || 'Something went wrong.',
                button: 'OK',
            });
        }
    } catch (error) {
        Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'Failed to update follow status. Please try again later.',
            button: 'OK',
        });
    }
};
