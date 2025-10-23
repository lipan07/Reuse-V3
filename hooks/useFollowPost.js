import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useFollowPost = (product) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if (product) {
            console.log('[LIKE][POST] Initializing with product data:', {
                is_liked: product.is_liked,
                like_count: product.like_count
            });
            setIsLiked(product.is_liked || false);
            setLikeCount(Math.max(product.like_count || 0, 0));
        }
    }, [product]);

    const toggleFollow = async () => {
        console.log('[LIKE][POST] Toggling like for post:', product.id);
        console.log('[LIKE][POST] Current isLiked before toggle:', isLiked);
        console.log('[LIKE][POST] Current likeCount before toggle:', likeCount);
        console.log('########################################################');

        try {
            const token = await AsyncStorage.getItem('authToken');
            const url = `${process.env.BASE_URL}/follow-post`;
            const requestBody = { post_id: product.id };

            console.log('[LIKE][POST] Request →', url, requestBody);
            console.log('[LIKE][POST] Token available:', !!token);
            console.log('[LIKE][POST] Full URL:', url);
            console.log('[LIKE][POST] Request headers:', {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            console.log('[LIKE][POST] Response status:', response.status);
            console.log('[LIKE][POST] Response ok:', response.ok);

            if (response.ok) {
                const json = await response.json();
                console.log('[LIKE][POST] Response body:', json);

                setIsLiked(json.is_liked);
                setLikeCount(Math.max(json.like_count || 0, 0));

                console.log('[LIKE][POST] Updated isLiked to:', json.is_liked);
                console.log('[LIKE][POST] Updated likeCount to:', json.like_count);

                // Return the updated counts for parent component to use
                return {
                    is_liked: json.is_liked,
                    like_count: json.like_count
                    // Note: view_count should not be updated during like/unlike operations
                };
            } else {
                const text = await response.text();
                console.error('[LIKE][POST] Failed', {
                    status: response.status,
                    statusText: response.statusText,
                    body: text
                });
            }
        } catch (error) {
            console.error('[LIKE][POST] Error', error);
        }
    };

    return { isLiked, likeCount, toggleFollow };
};

export default useFollowPost;
