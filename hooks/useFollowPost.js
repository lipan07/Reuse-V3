import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useFollowPost = (product) => {
    const [isFollowed, setIsFollowed] = useState(false);

    useEffect(() => {
        setIsFollowed(product?.follower || false);
    }, [product]);

    const toggleFollow = async () => {
        console.log('Toggling follow for post:', product.id);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${process.env.BASE_URL}/follow-post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ post_id: product.id }),
            });

            if (response.ok) {
                setIsFollowed((prev) => !prev);
            } else {
                console.error('Failed to follow/unfollow.');
            }
        } catch (error) {
            console.error('Error in toggleFollow:', error);
        }
    };

    return { isFollowed, toggleFollow };
};

export default useFollowPost;
