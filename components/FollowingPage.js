import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FollowingPage = () => {
    const [followingFilter, setFollowingFilter] = useState('Post'); // Sub-selection for Following
    const [data, setData] = useState([]); // Fetched data
    const [isUnfollowModalVisible, setIsUnfollowModalVisible] = useState(false); // Modal state
    const [selectedPost, setSelectedPost] = useState(null); // Post to unfollow

    const fetchData = async () => {
        let endpoint = followingFilter === 'Post' ? `/post/following` : `/user/following`; // Endpoint for following

        try {
            const authToken = await AsyncStorage.getItem('authToken');
            if (!authToken) {
                console.error('No auth token found');
                return;
            }

            const response = await fetch(`${process.env.BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                console.error('Failed to fetch data:', response.status);
                return;
            }

            const result = await response.json();

            if (followingFilter === 'Company') {
                const formattedData = (result.following || []).map((item) => ({
                    id: item.id,
                    title: item.name || 'No Name',
                    images: item.images || [],
                    address: item.address || 'No Address',
                    distance: '5km' || '10km',
                }));
                setData(formattedData);
            } else {
                const formattedData = result.map((item) => {
                    const source = item.post;
                    return {
                        id: item.id,
                        postId: item.post_id,
                        userId: item.user_id,
                        title: source.title,
                        address: source.address,
                        images: source.images || [],
                        distance: '5km' || '10km',
                        createdAt: source.created_at,
                    };
                });
                setData(formattedData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [followingFilter]); // Re-fetch when filter changes

    const handleUnfollow = (post) => {
        setSelectedPost(post); // Set the selected post to unfollow
        setIsUnfollowModalVisible(true); // Show modal
    };

    const confirmUnfollow = async () => {
        setIsUnfollowModalVisible(false);

        try {
            // Determine endpoint based on the followingFilter
            const endpoint = followingFilter === 'Post' ? '/follow-post' : '/follow-user';
            const authToken = await AsyncStorage.getItem('authToken');

            if (!authToken) {
                console.error('No auth token found');
                Alert.alert('Error', 'Authentication token missing.');
                return;
            }

            // Determine the correct ID to send in the request
            const itemId = followingFilter === 'Post' ? selectedPost.postId : selectedPost.id;
            console.log(`${process.env.BASE_URL}${endpoint}`);
            console.log({ [followingFilter === 'Post' ? 'post_id' : 'id']: itemId });
            const response = await fetch(`${process.env.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [followingFilter === 'Post' ? 'post_id' : 'following_id']: itemId }), // Send the appropriate ID
            });

            if (response.ok) {
                // Successfully unfollowed, remove the post/item from the list
                setData((prevData) =>
                    prevData.filter((item) =>
                        followingFilter === 'Post' ? item.postId !== itemId : item.id !== itemId
                    )
                );
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData?.message || 'Failed to unfollow this post.');
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
                    source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/50' }}
                    style={styles.userImage}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.title || 'No Name'}</Text>
                    <Text style={styles.userPhone}>{item.address || 'No Address'}</Text>
                    <Text style={styles.userStatus}>{`Distance: ${item.distance}`}</Text>
                </View>
                <TouchableOpacity style={styles.unfollowButton} onPress={() => handleUnfollow(item)}>
                    <Text style={styles.buttonText}>Unfollow</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.separator} />
        </>
    );

    return (
        <View style={styles.container}>
            {/* Sub-selection Links */}
            <View style={styles.subTabContainer}>
                <TouchableOpacity
                    style={[
                        styles.subTabButton,
                        followingFilter === 'Post' && styles.activeSubTabButton,
                    ]}
                    onPress={() => setFollowingFilter('Post')}
                >
                    <Text
                        style={[
                            styles.subTabButtonText,
                            followingFilter === 'Post' && styles.activeSubTabButtonText,
                        ]}
                    >
                        Post
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.subTabButton,
                        followingFilter === 'Company' && styles.activeSubTabButton,
                    ]}
                    onPress={() => setFollowingFilter('Company')}
                >
                    <Text
                        style={[
                            styles.subTabButtonText,
                            followingFilter === 'Company' && styles.activeSubTabButtonText,
                        ]}
                    >
                        User/Company
                    </Text>
                </TouchableOpacity>
            </View>

            {/* User List */}
            <View style={styles.container}>
                {data.length === 0 ? (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>No following found.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderUserItem}
                        contentContainerStyle={styles.userList}
                    />
                )}
            </View>
            {/* Unfollow Confirmation Modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={isUnfollowModalVisible}
                onRequestClose={() => setIsUnfollowModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm Unfollow</Text>
                        <Text style={styles.modalText}>Are you sure you want to unfollow this {followingFilter === 'Post' ? 'post' : 'user/company'}?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setIsUnfollowModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={confirmUnfollow}>
                                <Text style={styles.confirmButtonText}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    subTabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    subTabButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 5,
    },
    activeSubTabButton: { backgroundColor: '#007bff' },
    subTabButtonText: { fontSize: 16, color: '#555' },
    activeSubTabButtonText: { color: '#fff', fontWeight: 'bold' },
    userList: { padding: 10 },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        paddingHorizontal: 10,
    },
    userImage: { width: 50, height: 50, borderRadius: 25 },
    userInfo: { flex: 1, marginLeft: 10 },
    userName: { fontSize: 16, fontWeight: 'bold' },
    userPhone: { fontSize: 14, color: '#777' },
    userStatus: { fontSize: 12, color: '#999' },
    unfollowButton: { backgroundColor: '#ff3333', padding: 10, borderRadius: 8 },
    buttonText: { color: '#fff', fontWeight: '600' },
    noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    noDataText: { fontSize: 18, color: '#999' },
    separator: {
        height: 1,
        backgroundColor: '#b7c4ba',
        marginVertical: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    cancelButton: { flex: 1, padding: 10, margin: 4, backgroundColor: '#ccc', borderRadius: 8 },
    cancelButtonText: { textAlign: 'center', fontWeight: '600', color: '#333' },
    confirmButton: { flex: 1, padding: 10, margin: 4, backgroundColor: '#007bff', borderRadius: 8 },
    confirmButtonText: { textAlign: 'center', fontWeight: '600', color: '#fff' },
});

export default FollowingPage;
