import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import BottomNavBar from './BottomNavBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProductDetails = () => {
    const [buyerId, setBuyerId] = useState(null);
    const [isFollowed, setIsFollowed] = useState(false);
    const [postDetails, setPostDetails] = useState(null); // State to hold post details
    const navigation = useNavigation();
    const route = useRoute();
    const { product } = route.params; // Assuming productId is passed as a param

    useEffect(() => {
        const loadBuyerId = async () => {
            try {
                const storedBuyerId = await AsyncStorage.getItem('userId');
                setBuyerId(storedBuyerId);
            } catch (error) {
                console.error('Failed to load buyer ID:', error);
            }
        };

        const fetchPostDetails = async () => {
            console.log(`${process.env.BASE_URL}/posts/${product.id}`);
            try {
                const token = await AsyncStorage.getItem('authToken'); // Fetch token for authentication
                const response = await fetch(`${process.env.BASE_URL}/posts/${product.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const responseData = await response.json();
                    setPostDetails(responseData.data); // Update state with fetched post details
                } else {
                    console.error('Failed to fetch post details.');
                }
            } catch (error) {
                console.error('Error in fetchPostDetails:', error);
            }
        };

        loadBuyerId();
        fetchPostDetails(); // Fetch post details when the component loads
    }, [product.id]);

    const toggleFollow = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${process.env.BASE_URL}/post/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    post_id: product.id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
                setIsFollowed((prev) => !prev);
            } else {
                console.error('Failed to follow/unfollow the post.');
            }
        } catch (error) {
            console.error('Error in toggleFollow:', error);
        }
    };

    const handleChatWithSeller = () => {
        if (buyerId) {
            navigation.navigate('ChatBox', {
                sellerId: postDetails?.user_id,
                buyerId,
                postId: product.id,
            });
        } else {
            console.log('Buyer ID not found');
        }
    };

    const handleCallPress = () => {
        console.log('Calling functionality would be implemented here.');
    };

    const handleMapPress = () => {
        navigation.navigate('FullScreenMap', {
            latitude: postDetails?.latitude || 22.68036,
            longitude: postDetails?.longitude || 88.393776,
        });
    };

    if (!postDetails) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                    {postDetails.images.map((image, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() =>
                                navigation.navigate('ImageViewer', { images: postDetails.images, selectedImageIndex: index })
                            }
                        >
                            <Image source={{ uri: image }} style={styles.image} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.detailsCard}>
                    <View style={styles.companyHeader}>
                        <Text style={styles.companyName} onPress={() => navigation.navigate('CompanyDetailsPage', 'Malaq')}>
                            Company: {postDetails.companyName}
                        </Text>
                        <TouchableOpacity onPress={toggleFollow}>
                            <Icon
                                name={isFollowed ? 'heart' : 'heart-outline'}
                                size={28}
                                color={isFollowed ? 'red' : 'gray'}
                                style={styles.heartIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.productTitle}>{postDetails.title}</Text>
                    <Text style={styles.description}>{postDetails.post_details.description}</Text>
                    <Text style={styles.price}>Price: ${postDetails.post_details.amount}</Text>
                </View>

                <View style={styles.detailsCard}>
                    <View style={styles.mapAddressContainer}>
                        <View style={styles.addressContainer}>
                            <Text style={styles.addressHeader}>Location Details</Text>
                            <Text style={styles.addressText}>Latitude: {postDetails.latitude}</Text>
                            <Text style={styles.addressText}>Longitude: {postDetails.longitude}</Text>
                        </View>
                        <TouchableOpacity onPress={handleMapPress} style={styles.mapContainer} activeOpacity={0.9}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: postDetails.latitude || 22.5726,
                                    longitude: postDetails.longitude || 88.3639,
                                    latitudeDelta: 0.02,
                                    longitudeDelta: 0.02,
                                }}
                                provider="google"
                                scrollEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: postDetails.latitude || 22.5726,
                                        longitude: postDetails.longitude || 88.3639,
                                    }}
                                />
                            </MapView>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {buyerId && buyerId !== postDetails.user_id && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.chatButton} onPress={handleChatWithSeller}>
                        <Text style={styles.buttonText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.callButton} onPress={handleCallPress}>
                        <Text style={styles.buttonText}>Call</Text>
                    </TouchableOpacity>
                </View>
            )}

            <BottomNavBar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    imageContainer: { paddingVertical: 10, paddingHorizontal: 15 },
    image: { width: 250, height: 300, marginRight: 15, borderRadius: 10, resizeMode: 'cover' },
    detailsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        margin: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    companyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    companyName: { fontSize: 18, fontWeight: '600', color: '#007bff' },
    heartIcon: { marginLeft: 10 },
    productTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#343a40' },
    description: { fontSize: 16, color: '#6c757d', marginBottom: 15 },
    price: { fontSize: 20, fontWeight: 'bold', color: '#28a745' },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderColor: '#dee2e6',
    },
    chatButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    callButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    mapAddressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    addressContainer: {
        flex: 1,
        paddingRight: 10,
    },
    mapContainer: {
        height: 150,
        width: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        overflow: 'hidden',
    },
    addressHeader: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
    addressText: { fontSize: 16, marginBottom: 5 },
    map: { height: '100%', width: '100%' },
});

export default ProductDetails;
