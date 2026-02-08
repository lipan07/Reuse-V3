import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    Modal,
    Alert,
    Dimensions,
    SafeAreaView,
    Platform,
    ActivityIndicator,
    Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Screens/Header';
import CustomStatusBar from './Screens/CustomStatusBar';
import AnimatedFollowButton from './AnimatedFollowButton';
import styles from '../assets/css/FollowingPage.styles';

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
    const [showSweetAlert, setShowSweetAlert] = useState(false);
    const [sweetAlertMessage, setSweetAlertMessage] = useState('');
    const [sweetAlertOpacity] = useState(new Animated.Value(0));

    // Sweet Alert functions
    const showSweetAlertMessage = (message) => {
        setSweetAlertMessage(message);
        setShowSweetAlert(true);

        // Animate in
        Animated.timing(sweetAlertOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Auto hide after 1 second
        setTimeout(() => {
            hideSweetAlert();
        }, 1000);
    };

    const hideSweetAlert = () => {
        Animated.timing(sweetAlertOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowSweetAlert(false);
        });
    };

    const fetchData = async () => {
        setIsLoading(true);
        let endpoint = followingFilter === 'Post' ? `/post/likes` : `/user/following`;

        // Try to get BASE_URL from different sources
        const baseUrl = process.env.BASE_URL;
        const fullUrl = `${baseUrl}${endpoint}`;

        console.log('[FollowingPage] BASE_URL:', process.env.BASE_URL);
        console.log('[FollowingPage] Using URL:', fullUrl);
        console.log('[FollowingPage] Filter:', followingFilter);

        try {
            const authToken = await AsyncStorage.getItem('authToken');
            if (!authToken) {
                console.error('No auth token found');
                setIsLoading(false);
                return;
            }

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            });

            console.log('[FollowingPage] Response status:', response.status);
            console.log('[FollowingPage] Response headers:', response.headers);

            // Get response text first to check what we're dealing with
            const responseText = await response.text();
            console.log('[FollowingPage] Raw response:', responseText.substring(0, 200) + '...');

            if (!response.ok) {
                console.error('Failed to fetch data:', response.status);
                console.error('Error response:', responseText);
                Alert.alert('Error', `Server error: ${response.status}`);
                setIsLoading(false);
                return;
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Non-JSON response received:', responseText);
                Alert.alert('Error', 'Server returned invalid response format');
                setIsLoading(false);
                return;
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                console.error('Response that failed to parse:', responseText);
                Alert.alert('Error', 'Invalid response format from server');
                setIsLoading(false);
                return;
            }

            // Validate result structure
            if (!result) {
                console.error('Empty result received');
                setData([]);
                setIsLoading(false);
                return;
            }

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
                // Handle both array and object responses
                const dataArray = Array.isArray(result) ? result : (result.data || result.following || []);
                const formattedData = dataArray.map((item) => {
                    const source = item.post || item;

                    // Convert images from objects to URL strings (matching Home.js structure)
                    const imageUrls = source.images ? source.images.map(img => img.url) : [];

                    // Extract post_details based on category (matching Home.js logic)
                    let postDetails = {};
                    if (source.mobile) postDetails = source.mobile;
                    else if (source.car) postDetails = source.car;
                    else if (source.housesApartment) postDetails = source.housesApartment;
                    else if (source.landPlots) postDetails = source.landPlots;
                    else if (source.fashion) postDetails = source.fashion;
                    else if (source.bikes) postDetails = source.bikes;
                    else if (source.jobs) postDetails = source.jobs;
                    else if (source.pets) postDetails = source.pets;

                    return {
                        // Follow relationship ID (needed for unfollow)
                        followId: item.id,
                        // Basic product fields (matching Home.js structure exactly)
                        id: source.id,
                        category_id: source.category_id,
                        user_id: source.user_id,
                        title: source.title || 'No Title',
                        address: source.address || 'No Address',
                        latitude: source.latitude || null,
                        longitude: source.longitude || null,
                        amount: source.amount || 0,
                        type: source.type || 'sell',
                        status: source.status || 'active',
                        show_phone: source.show_phone || false,
                        post_time: source.post_time,
                        created_at: source.created_at,
                        updated_at: source.updated_at,

                        // Images as URL strings (matching Home.js)
                        images: imageUrls,

                        // User object (matching Home.js structure)
                        user: {
                            id: source.user?.id || source.user_id,
                            name: source.user?.name || 'Unknown User',
                            status: source.user?.status || 'offline',
                            last_activity: source.user?.last_activity || null,
                        },

                        // Category object (matching Home.js structure)
                        category: {
                            id: source.category?.id || source.category_id,
                            name: source.category?.name || 'Unknown Category',
                        },

                        // Follower status (always true for following page)
                        follower: true,

                        // Post details structure (matching Home.js)
                        post_details: postDetails
                    };
                });
                setData(formattedData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            console.error('Error details:', error.message);

            // Show empty data instead of blocking the user
            setData([]);

            // Only show alert for network errors, not for empty data
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                Alert.alert('Network Error', 'Please check your internet connection and try again.');
            }
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

            // For posts, we need to send the post_id, for users we send the user_id
            const itemId = followingFilter === 'Post' ? selectedItem.id : selectedItem.id;
            const baseUrl = process.env.BASE_URL;
            const response = await fetch(`${baseUrl}${endpoint}`, {
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
                        followingFilter === 'Post' ? item.followId !== selectedItem.followId : item.followId !== selectedItem.followId
                    )
                );
                // Show sweet alert success message
                showSweetAlertMessage(`${followingFilter === 'Post' ? 'Unliked post' : 'Unfollowed user'} successfully`);
            } else {
                // Handle non-JSON error responses
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await response.json();
                        Alert.alert('Error', errorData?.message || 'Failed to unfollow.');
                    } catch (jsonError) {
                        console.error('Error parsing error response:', jsonError);
                        Alert.alert('Error', 'Failed to unfollow.');
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Non-JSON error response:', errorText);
                    Alert.alert('Error', 'Failed to unfollow.');
                }
            }
        } catch (error) {
            console.error('Failed to unfollow:', error);
            Alert.alert('Error', 'Failed to unfollow. Please try again.');
        }
    };

    const handleItemPress = (item) => {
        if (followingFilter === 'Post') {
            // Navigate to ProductDetails - same as Home.js
            navigation.navigate('ProductDetails', { productDetails: item });
        } else {
            // Navigate to CompanyDetailsPage
            navigation.navigate('CompanyDetailsPage', {
                userId: item.id,
                user: item
            });
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.itemContainer, darkMode && styles.darkItemContainer]}>
            <TouchableOpacity
                style={styles.itemContent}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.imageContainer}>
                    {item.images?.[0] ? (
                        <Image
                            source={{ uri: item.images[0] }}
                            style={styles.itemImage}
                        />
                    ) : (
                        <View style={[styles.itemImage, styles.defaultIconContainer]}>
                            <Icon
                                name={followingFilter === 'Post' ? 'image' : 'domain'}
                                size={normalize(24)}
                                color={darkMode ? "#666" : "#999"}
                            />
                        </View>
                    )}
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
                        <Icon name="circle" size={normalize(8)} color={item.status === 'active' ? '#4CAF50' : '#FF9800'} />
                        <Text style={[styles.itemDistance, darkMode && styles.darkSubtitle]}>
                            {item.status === 'active' ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
            <AnimatedFollowButton
                isLiked={true} // Always true since this is the "Following" page
                onPress={() => handleUnfollow(item)}
                size={20}
                iconType={followingFilter === 'Post' ? 'heart' : 'plus'}
                style={styles.animatedFollowButton}
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
                                    Explore {followingFilter === 'Post' ? 'Posts' : 'Posts'}
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
                            {followingFilter === 'Post' ? 'Unlike Post?' : 'Unfollow User?'}
                        </Text>
                        <Text style={[styles.modalText, darkMode && styles.darkModalText]}>
                            {followingFilter === 'Post'
                                ? 'You won\'t see this post in your liked posts anymore.'
                                : 'You won\'t see updates from this user in your feed anymore.'
                            }
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
                                    <Icon
                                        name={followingFilter === 'Post' ? 'heart-broken' : 'account-minus'}
                                        size={normalize(16)}
                                        color="#fff"
                                        style={{ marginRight: normalize(6) }}
                                    />
                                    <Text style={styles.confirmButtonText}>
                                        {followingFilter === 'Post' ? 'Unlike' : 'Unfollow'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Sweet Alert */}
            {showSweetAlert && (
                <TouchableOpacity
                    style={styles.sweetAlertOverlay}
                    activeOpacity={1}
                    onPress={hideSweetAlert}
                >
                    <Animated.View
                        style={[
                            styles.sweetAlertContainer,
                            { opacity: sweetAlertOpacity }
                        ]}
                    >
                        <View style={styles.sweetAlertContent}>
                            <Icon
                                name="check-circle"
                                size={normalize(32)}
                                color="#4CAF50"
                                style={styles.sweetAlertIcon}
                            />
                            <Text style={styles.sweetAlertText}>
                                {sweetAlertMessage}
                            </Text>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

export default FollowingPage;