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
    Platform,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Screens/Header';
import CustomStatusBar from './Screens/CustomStatusBar';
import AnimatedUnfollowButton from './AnimatedUnfollowButton';

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
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/60' }}
                    style={styles.itemImage}
                />
                <View style={[styles.statusIndicator, darkMode && styles.darkStatusIndicator]}>
                    <Icon
                        name={followingFilter === 'Post' ? 'post' : 'account'}
                        size={normalize(8)}
                        color="#fff"
                    />
                </View>
            </View>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, darkMode && styles.darkText]} numberOfLines={1}>
                    {item.title || 'No Name'}
                </Text>
                <View style={styles.itemMeta}>
                    <Icon name="map-marker" size={normalize(12)} color={darkMode ? "#aaa" : "#666"} />
                    <Text style={[styles.itemSubtitle, darkMode && styles.darkSubtitle]} numberOfLines={1}>
                        {item.address || 'No Address'}
                    </Text>
                </View>
                <View style={styles.itemMeta}>
                    <Icon name="clock-outline" size={normalize(12)} color={darkMode ? "#aaa" : "#666"} />
                    <Text style={[styles.itemDistance, darkMode && styles.darkSubtitle]}>
                        {item.distance} away
                    </Text>
                </View>
            </View>
            <AnimatedUnfollowButton
                onPress={() => handleUnfollow(item)}
                text="Following"
                size="small"
                style={styles.animatedUnfollowButton}
            />
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
                        <ActivityIndicator size="large" color="#007bff" />
                        <Text style={[styles.loadingText, darkMode && styles.darkText]}>Loading your following...</Text>
                    </View>
                ) : data.length === 0 ? (
                    <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconContainer, darkMode && styles.darkEmptyIconContainer]}>
                                <Icon
                                    name={followingFilter === 'Post' ? "post-outline" : "account-heart-outline"}
                                    size={normalize(60)}
                                    color={darkMode ? "#555" : "#ccc"}
                                />
                            </View>
                            <Text style={[styles.emptyText, darkMode && styles.darkText]}>
                                No {followingFilter === 'Post' ? 'posts' : 'users'} followed yet
                            </Text>
                        <Text style={[styles.emptySubText, darkMode && styles.darkSubtitle]}>
                            When you follow {followingFilter === 'Post' ? 'posts' : 'users'}, they'll appear here
                        </Text>
                            <TouchableOpacity
                                style={[styles.exploreButton, darkMode && styles.darkExploreButton]}
                                onPress={() => navigation.navigate('Home')}
                            >
                                <Text style={[styles.exploreButtonText, darkMode && styles.darkExploreButtonText]}>
                                    Explore {followingFilter === 'Post' ? 'Posts' : 'Users'}
                                </Text>
                            </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={[styles.separator, darkMode && styles.darkSeparator]} />}
                                ListHeaderComponent={() => (
                                    <View style={styles.listHeader}>
                                        <Text style={[styles.listHeaderText, darkMode && styles.darkText]}>
                                            {data.length} {followingFilter === 'Post' ? 'posts' : 'users'} followed
                                        </Text>
                                    </View>
                                )}
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
                        <View style={[styles.modalIconContainer, darkMode && styles.darkModalIconContainer]}>
                            <Icon
                                name="heart-broken"
                                size={normalize(32)}
                                color="#FF4444"
                            />
                        </View>
                        <Text style={[styles.modalTitle, darkMode && styles.darkModalTitle]}>
                            Unfollow {followingFilter === 'Post' ? 'Post' : 'User'}?
                        </Text>
                        <Text style={[styles.modalText, darkMode && styles.darkModalText]}>
                            You won't see updates from this {followingFilter === 'Post' ? 'post' : 'user'} in your feed anymore.
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
                                <View style={styles.confirmButtonContent}>
                                    <Icon name="heart-broken" size={normalize(16)} color="#fff" style={{ marginRight: normalize(6) }} />
                                    <Text style={styles.confirmButtonText}>Unfollow</Text>
                                </View>
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
        marginTop: normalize(12),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: normalize(20),
    },
    emptyIconContainer: {
        width: normalize(120),
        height: normalize(120),
        borderRadius: normalize(60),
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: normalize(20),
    },
    darkEmptyIconContainer: {
        backgroundColor: '#2A2A2A',
    },
    emptyText: {
        fontSize: normalize(20),
        fontWeight: '600',
        color: '#666',
        marginBottom: normalize(8),
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: normalize(14),
        color: '#999',
        textAlign: 'center',
        marginBottom: normalize(24),
        maxWidth: '80%',
        lineHeight: normalize(20),
    },
    exploreButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: normalize(24),
        paddingVertical: normalize(12),
        borderRadius: normalize(25),
        shadowColor: '#007bff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    darkExploreButton: {
        backgroundColor: '#1A73E8',
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: normalize(16),
        fontWeight: '600',
    },
    darkExploreButtonText: {
        color: '#fff',
    },
    listContent: {
        paddingBottom: normalize(20),
    },
    listHeader: {
        paddingVertical: normalize(12),
        paddingHorizontal: normalize(4),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: normalize(8),
    },
    listHeaderText: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: normalize(16),
        backgroundColor: '#fff',
        borderRadius: normalize(16),
        paddingHorizontal: normalize(16),
        marginBottom: normalize(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    darkItemContainer: {
        backgroundColor: '#1E1E1E',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    imageContainer: {
        position: 'relative',
    },
    itemImage: {
        width: normalize(60),
        height: normalize(60),
        borderRadius: normalize(30),
        backgroundColor: '#eee',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: normalize(20),
        height: normalize(20),
        borderRadius: normalize(10),
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    darkStatusIndicator: {
        borderColor: '#1E1E1E',
    },
    itemInfo: {
        flex: 1,
        marginLeft: normalize(16),
        marginRight: normalize(12),
    },
    itemTitle: {
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#333',
        marginBottom: normalize(6),
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(4),
    },
    itemSubtitle: {
        fontSize: normalize(13),
        color: '#666',
        marginLeft: normalize(6),
        flex: 1,
    },
    itemDistance: {
        fontSize: normalize(12),
        color: '#999',
        marginLeft: normalize(6),
    },
    animatedUnfollowButton: {
        alignSelf: 'flex-start',
    },
    darkText: {
        color: '#fff',
    },
    darkSubtitle: {
        color: '#aaa',
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
        width: '85%',
        maxWidth: normalize(320),
        backgroundColor: '#fff',
        borderRadius: normalize(20),
        padding: normalize(28),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    darkModalContainer: {
        backgroundColor: '#1E1E1E',
    },
    modalIconContainer: {
        width: normalize(64),
        height: normalize(64),
        borderRadius: normalize(32),
        backgroundColor: '#FFE6E6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: normalize(16),
    },
    darkModalIconContainer: {
        backgroundColor: '#2A1A1A',
    },
    modalTitle: {
        fontSize: normalize(22),
        fontWeight: '700',
        marginBottom: normalize(12),
        color: '#222',
        textAlign: 'center',
    },
    darkModalTitle: {
        color: '#fff',
    },
    modalText: {
        fontSize: normalize(16),
        color: '#555',
        textAlign: 'center',
        marginBottom: normalize(28),
        lineHeight: normalize(24),
    },
    darkModalText: {
        color: '#ccc',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: normalize(20),
        paddingVertical: normalize(12),
        borderRadius: normalize(12),
        marginHorizontal: normalize(6),
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    darkCancelButton: {
        backgroundColor: '#333',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: normalize(16),
    },
    darkButtonText: {
        color: '#fff',
    },
    confirmButton: {
        backgroundColor: '#FF4444',
        shadowColor: '#FF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: normalize(16),
    },
    confirmButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default FollowingPage;