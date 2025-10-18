import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useFollowPost = (product) => {
    const [isFollowed, setIsFollowed] = useState(false);

    useEffect(() => {
        setIsFollowed(product?.follower || false);
    }, [product]);

    const toggleFollow = async () => {
        console.log('[FOLLOW][POST] Toggling follow for post:', product.id);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const url = `${process.env.BASE_URL}/follow-post`;
            console.log('[FOLLOW][POST] Request →', url, { post_id: product.id });
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ post_id: product.id }),
            });

            if (response.ok) {
                setIsFollowed((prev) => !prev);
                const json = await response.json().catch(() => null);
                console.log('[FOLLOW][POST] Response ←', { status: response.status, ok: response.ok, body: json });
            } else {
                const text = await response.text();
                console.error('[FOLLOW][POST] Failed', { status: response.status, body: text });
            }
        } catch (error) {
            console.error('[FOLLOW][POST] Error', error);
        }
    };

    return { isFollowed, toggleFollow };
};

export default useFollowPost;
