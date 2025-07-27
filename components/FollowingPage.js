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
    Dimensions,
    StatusBar,
    SafeAreaView,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Screens/Header';
import CustomStatusBar from './Screens/CustomStatusBar';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const FollowingPage = ({ navigation }) => {
    const [followingFilter, setFollowingFilter] = useState('Post');
    const [data, setData] = useState([]);
    const [isUnfollowModalVisible, setIsUnfollowModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        let endpoint = followingFilter === 'Post' ? `/post/following` : `/user/following`;

        try {
            const authToken = await AsyncStorage.getItem('authToken');
            if (!authToken) {
                console.error('No auth token found');
                setIsLoading(false);
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
                setIsLoading(false);
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
            Alert.alert('Error', 'Failed to load following data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [followingFilter]);

    const handleUnfollow = (item) => {
        setSelectedItem(item);
        setIsUnfollowModalVisible(true);
    };

    const confirmUnfollow = async () => {
        setIsUnfollowModalVisible(false);

        try {
            const endpoint = followingFilter === 'Post' ? '/follow-post' : '/follow-user';
            const authToken = await AsyncStorage.getItem('authToken');

            if (!authToken) {
                console.error('No auth token found');
                Alert.alert('Error', 'Authentication token missing.');
                return;
            }

            const itemId = followingFilter === 'Post' ? selectedItem.postId : selectedItem.id;
            const response = await fetch(`${process.env.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [followingFilter === 'Post' ? 'post_id' : 'following_id']: itemId }),
            });

            if (response.ok) {
                setData((prevData) =>
                    prevData.filter((item) =>
                        followingFilter === 'Post' ? item.postId !== itemId : item.id !== itemId
                    )
                );
                Alert.alert('Success', `You have unfollowed this ${followingFilter === 'Post' ? 'post' : 'user'}`);
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData?.message || 'Failed to unfollow.');
            }
        } catch (error) {
            console.error('Failed to unfollow:', error);
            Alert.alert('Error', 'Failed to unfollow. Please try again.');
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.itemContainer, darkMode && styles.darkItemContainer]}>
            <Image
                source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/50' }}
                style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, darkMode && styles.darkText]} numberOfLines={1}>
                    {item.title || 'No Name'}
                </Text>
                <Text style={[styles.itemSubtitle, darkMode && styles.darkSubtitle]} numberOfLines={1}>
                    {item.address || 'No Address'}
                </Text>
                <Text style={[styles.itemDistance, darkMode && styles.darkSubtitle]}>
                    {item.distance} away
                </Text>
            </View>
            <TouchableOpacity
                style={styles.unfollowButton}
                onPress={() => handleUnfollow(item)}
                activeOpacity={0.7}
            >
                <Text style={styles.unfollowButtonText}>Following</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
            <CustomStatusBar />
            {/* Header */}
            <Header
                title="Following"
                navigation={navigation}
                darkMode={darkMode}
            />

            {/* Filter Tabs */}
            <View style={[styles.tabContainer, darkMode && styles.darkTabContainer]}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        followingFilter === 'Post' && styles.activeTabButton,
                    ]}
                    onPress={() => setFollowingFilter('Post')}
                >
                    <Text style={[
                        styles.tabButtonText,
                        followingFilter === 'Post' ? styles.activeTabButtonText : darkMode && styles.darkTabButtonText,
                    ]}>
                        Posts
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        followingFilter === 'Company' && styles.activeTabButton,
                    ]}
                    onPress={() => setFollowingFilter('Company')}
                >
                    <Text style={[
                        styles.tabButtonText,
                        followingFilter === 'Company' ? styles.activeTabButtonText : darkMode && styles.darkTabButtonText,
                    ]}>
                        Users
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={[styles.loadingText, darkMode && styles.darkText]}>Loading...</Text>
                    </View>
                ) : data.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="account-heart-outline" size={normalize(60)} color={darkMode ? "#555" : "#ccc"} />
                        <Text style={[styles.emptyText, darkMode && styles.darkText]}>No following found</Text>
                        <Text style={[styles.emptySubText, darkMode && styles.darkSubtitle]}>
                            When you follow {followingFilter === 'Post' ? 'posts' : 'users'}, they'll appear here
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={[styles.separator, darkMode && styles.darkSeparator]} />}
                    />
                )}
            </View>

            {/* Unfollow Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={isUnfollowModalVisible}
                onRequestClose={() => setIsUnfollowModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, darkMode && styles.darkModalContainer]}>
                        <Icon
                            name="heart-broken"
                            size={normalize(40)}
                            color="#FF4444"
                            style={styles.modalIcon}
                        />
                        <Text style={[styles.modalTitle, darkMode && styles.darkModalTitle]}>
                            Unfollow {followingFilter === 'Post' ? 'Post' : 'User'}?
                        </Text>
                        <Text style={[styles.modalText, darkMode && styles.darkModalText]}>
                            You won't see updates from this {followingFilter === 'Post' ? 'post' : 'user'} in your feed.
                        </Text>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, darkMode && styles.darkCancelButton]}
                                onPress={() => setIsUnfollowModalVisible(false)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.cancelButtonText, darkMode && styles.darkButtonText]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={confirmUnfollow}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.confirmButtonText}>Unfollow</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    statusBarBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 24),
        backgroundColor: '#007BFF',
        zIndex: 1,
    },
    darkStatusBar: {
        backgroundColor: '#1A1A1A',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: normalize(16),
        marginTop: normalize(12),
        borderRadius: normalize(8),
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    darkTabContainer: {
        backgroundColor: '#1E1E1E',
    },
    tabButton: {
        flex: 1,
        paddingVertical: normalize(12),
        alignItems: 'center',
    },
    activeTabButton: {
        backgroundColor: '#007bff',
    },
    tabButtonText: {
        fontSize: normalize(14),
        fontWeight: '500',
        color: '#666',
    },
    darkTabButtonText: {
        color: '#999',
    },
    activeTabButtonText: {
        color: '#fff',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: normalize(16),
        paddingTop: normalize(12),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: normalize(16),
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: normalize(20),
    },
    emptyText: {
        fontSize: normalize(18),
        fontWeight: '500',
        color: '#666',
        marginTop: normalize(16),
    },
    emptySubText: {
        fontSize: normalize(14),
        color: '#999',
        textAlign: 'center',
        marginTop: normalize(8),
        maxWidth: '80%',
    },
    listContent: {
        paddingBottom: normalize(20),
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: normalize(12),
        backgroundColor: '#fff',
        borderRadius: normalize(12),
        paddingHorizontal: normalize(16),
        marginBottom: normalize(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    darkItemContainer: {
        backgroundColor: '#1E1E1E',
    },
    itemImage: {
        width: normalize(50),
        height: normalize(50),
        borderRadius: normalize(25),
        backgroundColor: '#eee',
    },
    itemInfo: {
        flex: 1,
        marginLeft: normalize(12),
    },
    itemTitle: {
        fontSize: normalize(16),
        fontWeight: '500',
        color: '#333',
    },
    itemSubtitle: {
        fontSize: normalize(14),
        color: '#666',
        marginTop: normalize(4),
    },
    itemDistance: {
        fontSize: normalize(12),
        color: '#999',
        marginTop: normalize(4),
    },
    darkText: {
        color: '#fff',
    },
    darkSubtitle: {
        color: '#aaa',
    },
    unfollowButton: {
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(6),
        borderRadius: normalize(15),
        backgroundColor: '#f0f0f0',
    },
    darkUnfollowButton: {
        backgroundColor: '#333',
    },
    unfollowButtonText: {
        fontSize: normalize(14),
        fontWeight: '500',
        color: '#333',
    },
    darkUnfollowButtonText: {
        color: '#fff',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
    },
    darkSeparator: {
        backgroundColor: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: normalize(12),
        padding: normalize(24),
        alignItems: 'center',
    },
    darkModalContainer: {
        backgroundColor: '#1E1E1E',
    },
    modalIcon: {
        marginBottom: normalize(12),
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: 'bold',
        marginBottom: normalize(8),
        color: '#222',
        textAlign: 'center',
    },
    darkModalTitle: {
        color: '#fff',
    },
    modalText: {
        fontSize: normalize(15),
        color: '#555',
        textAlign: 'center',
        marginBottom: normalize(24),
        lineHeight: normalize(22),
    },
    darkModalText: {
        color: '#ccc',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
    },
    modalButton: {
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(8),
        borderRadius: normalize(6),
        marginLeft: normalize(12),
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    darkCancelButton: {
        backgroundColor: '#333',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '500',
    },
    darkButtonText: {
        color: '#fff',
    },
    confirmButton: {
        backgroundColor: '#FF4444',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
});

export default FollowingPage;