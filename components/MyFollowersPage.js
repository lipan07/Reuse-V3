import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    Modal,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyFollowersPage = ({ route }) => {
    const [data, setData] = useState([]);
    const [isUnfollowModalVisible, setIsUnfollowModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const { product } = route.params || {};

    const fetchData = async () => {
        let endpoint = `/post/followers/${product.id}`;
        // console.log(`${process.env.BASE_URL}${endpoint}`);
        try {
            const authToken = await AsyncStorage.getItem('authToken');
            if (!authToken) return;

            const response = await fetch(`${process.env.BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            // console.log('API Product:', result);
            const formattedData = result.map((item) => {
                const source = item.user;
                return {
                    id: item.id,
                    postId: item.post_id,
                    userId: item.user_id,
                    title: source.name,
                    address: source.address,
                    images: source.images || [],
                    distance: '5km' || '10km',
                    createdAt: source.created_at,
                };
            });
            setData(formattedData);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUnfollow = (post) => {
        setSelectedPost(post);
        setIsUnfollowModalVisible(true);
    };

    const confirmUnfollow = async () => {
        setIsUnfollowModalVisible(false);
        try {
            const response = await fetch(`${process.env.BASE_URL}/follow-post`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id: selectedPost.postId }),
            });
            if (response.ok) {
                setData((prevData) => prevData.filter((item) => item.postId !== selectedPost.postId));
            } else {
                Alert.alert('Error', 'Failed to unfollow this post.');
            }
        } catch (error) {
            console.error('Failed to unfollow:', error);
            Alert.alert('Error', 'Failed to unfollow. Please try again.');
        }
    };

    const renderUserItem = ({ item }) => (
        <>
            <View style={styles.userItem}>
                <Image
                    source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/50' }}
                    style={styles.userImage}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.title}</Text>
                    <Text style={styles.userAddress}>{item.address}</Text>
                    <Text style={styles.userDistance}>{`Distance: ${item.distance}`}</Text>
                </View>
                <TouchableOpacity style={styles.unfollowButton} onPress={() => handleUnfollow(item)}>
                    <Text style={styles.unfollowButtonText}>Remove</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.separator} />
        </>
    );

    return (
        <View style={styles.container}>
            {data.length === 0 ? (
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No followers found.</Text>
                </View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderUserItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
            <Modal
                transparent
                animationType="fade"
                visible={isUnfollowModalVisible}
                onRequestClose={() => setIsUnfollowModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm Action</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to remove this user?
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalButtonCancel}
                                onPress={() => setIsUnfollowModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonConfirm}
                                onPress={confirmUnfollow}
                            >
                                <Text style={styles.modalButtonText}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    subTabContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff' },
    subTabButton: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
    activeSubTabButton: { backgroundColor: '#007bff' },
    subTabButtonText: { fontSize: 16, color: '#555' },
    activeSubTabButtonText: { color: '#fff', fontWeight: 'bold' },
    listContent: { padding: 10 },
    userItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 1, paddingRight: 10, paddingLeft: 10 },
    userImage: { width: 50, height: 50, borderRadius: 25 },
    userInfo: { flex: 1, marginLeft: 10 },
    userName: { fontSize: 16, fontWeight: 'bold' },
    userAddress: { fontSize: 14, color: '#666' },
    userDistance: { fontSize: 12, color: '#999' },
    noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    noDataText: { fontSize: 18, color: '#999' },
    separator: {
        height: 1,
        backgroundColor: '#b7c4ba', // Make sure this color is visible
        marginVertical: 10, // Adjust margin for spacing
    },
    unfollowButton: {
        backgroundColor: '#e63946',
        padding: 8,
        borderRadius: 8,
    },
    unfollowButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    modalMessage: { fontSize: 16, color: '#333', marginBottom: 20 },
    modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    modalButtonCancel: {
        flex: 1,
        padding: 10,
        backgroundColor: '#ccc',
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    modalButtonConfirm: {
        flex: 1,
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    modalButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default MyFollowersPage;
