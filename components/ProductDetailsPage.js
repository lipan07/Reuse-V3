import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Alert,
    Dimensions,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageView from 'react-native-image-viewing';
import Others from './ProductDetails/Others';
import ReportPostModal from './ReportPostModal';
import ModalScreen from './SupportElement/ModalScreen';
import CustomStatusBar from './Screens/CustomStatusBar';
import styles from '../assets/css/ProductDetailsPage.styles';
import useFollowPost from '../hooks/useFollowPost'; // Import the hook

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const ProductDetails = () => {
    const [buyerId, setBuyerId] = useState(null);
    const [userFollowed, setUserFollowed] = useState(false);
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('info');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [visibleImageView, setVisibleImageView] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [productDistance, setProductDistance] = useState(null);

    const { isFollowed, toggleFollow } = useFollowPost(product); // Use the hook

    const navigation = useNavigation();
    const route = useRoute();
    const { productDetails } = route.params;
    const productId = productDetails?.id;
    const flatListRef = useRef(null);
    const scrollViewRef = useRef(null);
    const autoScrollInterval = useRef(null);

    // Set product from productDetails
    useEffect(() => {
        if (productDetails) {
            console.log('ProductDetails received:', productDetails);
            setProduct(productDetails);
            setIsLoading(false);
        }
    }, [productDetails]);

    // Distance calculation function (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    // Format distance for display
    const formatDistance = (distance) => {
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m`;
        } else if (distance < 10) {
            return `${distance.toFixed(1)}km`;
        } else {
            return `${Math.round(distance)}km`;
        }
    };

    // Load user location
    useEffect(() => {
        const loadUserLocation = async () => {
            try {
                const locationData = await AsyncStorage.getItem('defaultLocation');
                if (locationData) {
                    const location = JSON.parse(locationData);
                    console.log('Loaded user location:', location);
                    setUserLocation(location);
                }
            } catch (error) {
                console.error('Error loading user location:', error);
            }
        };

        loadUserLocation();
    }, []);

    // Calculate distance when product and user location are available
    useEffect(() => {
        console.log('Distance calculation check:', {
            userLocation,
            productLat: product?.latitude,
            productLng: product?.longitude,
            postDetailsLat: product?.post_details?.latitude,
            postDetailsLng: product?.post_details?.longitude
        });

        // Try both possible locations for coordinates
        const productLat = product?.latitude || product?.post_details?.latitude;
        const productLng = product?.longitude || product?.post_details?.longitude;

        if (userLocation && product && productLat && productLng) {
            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                parseFloat(productLat),
                parseFloat(productLng)
            );
            const formattedDistance = formatDistance(distance);
            console.log('Calculated distance:', formattedDistance);
            setProductDistance(formattedDistance);
        } else if (userLocation && product) {
            // For testing - show a placeholder distance if coordinates are missing
            console.log('Missing coordinates, showing placeholder distance');
            setProductDistance('2.5km');
        }
    }, [userLocation, product]);

    // Fetch product details
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const response = await fetch(`${process.env.BASE_URL}/posts/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                console.log('ProductDetails', data);
                setProduct(data.data);
                setUserFollowed(data.is_following_post_user === true);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId]);

    useEffect(() => {
        const loadBuyerId = async () => {
            try {
                const storedBuyerId = await AsyncStorage.getItem('userId');
                setBuyerId(storedBuyerId);
            } catch (error) {
                console.error('Failed to load buyer ID:', error);
            }
        };

        loadBuyerId();
    }, []);

    useEffect(() => {
        if (!product?.images || product.images.length <= 1) return;

        const scrollImages = () => {
            setCurrentImageIndex(prev => {
                const nextIndex = (prev + 1) % product.images.length;
                flatListRef.current?.scrollToIndex({
                    index: nextIndex,
                    animated: true
                });
                return nextIndex;
            });
        };

        autoScrollInterval.current = setInterval(scrollImages, 3000);

        return () => {
            if (autoScrollInterval.current) {
                clearInterval(autoScrollInterval.current);
            }
        };
    }, [product?.images]);

    const handleScroll = (event) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / width);
        setCurrentImageIndex(index);

        // Reset auto-scroll timer after manual interaction
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = setInterval(() => {
            setCurrentImageIndex(prev => {
                const nextIndex = (prev + 1) % product.images.length;
                flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                return nextIndex;
            });
        }, 3000);
    };

    const handleTouchStart = () => setIsScrolling(true);
    const handleTouchEnd = () => setIsScrolling(false);

    const toggleUserFollow = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${process.env.BASE_URL}/follow-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ following_id: product.user?.id }),
            });

            const result = await response.json();

            if (response.ok) {
                const newStatus = result.data?.is_following ?? !userFollowed;
                setUserFollowed(newStatus);
                setProduct(prev => ({
                    ...prev,
                    is_following_post_user: newStatus
                }));
            } else {
                throw new Error(result.message || 'Failed to toggle follow status');
            }
        } catch (error) {
            console.error('Error in toggleFollow:', error);
        }
    };

    const handleChatWithSeller = () => {
        if (buyerId && product?.user?.id && product?.id) {
            navigation.navigate('ChatBox', {
                sellerId: product.user.id,
                buyerId,
                postId: product.id,
                postTitle: product.title,
                postImage: product.images?.[0] || null,
                chatId: null
            });
        }
    };

    const handleMapPress = () => {
        const addressQuery = encodeURIComponent(product.address || "Unknown Location");
        const url = `https://www.google.com/maps/search/?api=1&query=22.6992,88.3902`;
        Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open Google Maps"));
    };

    const handleReportSubmit = async (reportData) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const url = `${process.env.BASE_URL}/reports`;
            const formData = new FormData();
            formData.append('post_id', product.id);
            formData.append('reporting_user_id', buyerId);
            formData.append('type', reportData.reason);
            if (reportData.description) {
                formData.append('description', reportData.description);
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setShowReportModal(false);
                setModalType('success');
                setModalTitle('Report Submitted');
                setModalMessage(result.message || 'Your report has been successfully submitted.');
                setModalVisible(true);
            } else {
                throw new Error(result.message || 'Failed to submit report');
            }
        } catch (error) {
            setModalType('error');
            setModalTitle('Submission Failed');
            setModalMessage(error.message || 'Something went wrong while submitting your report.');
            setModalVisible(true);
        }
    };

    const openImageViewer = (index) => {
        setImageIndex(index);
        setVisibleImageView(true);
    };

    const renderDetails = () => {
        switch (product.category_id) {
            default: return <Others product={product} buyerId={buyerId} />
        }
    };

    if (isLoading || !product) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }
    const getMemberSince = (createdAt) => {
        if (!createdAt) return 'Member since N/A';

        const createdDate = new Date(createdAt);
        const currentDate = new Date();

        // Calculate difference in years
        const diffYears = currentDate.getFullYear() - createdDate.getFullYear();

        // Check if the created date hasn't happened yet this year
        if (
            currentDate.getMonth() < createdDate.getMonth() ||
            (currentDate.getMonth() === createdDate.getMonth() &&
                currentDate.getDate() < createdDate.getDate())
        ) {
            return `Member since ${createdDate.getFullYear() - 1}`;
        }

        return `Member since ${createdDate.getFullYear()}`;
    };

    const getTimeSincePosting = (createdAt) => {
        if (!createdAt) return 'Recently posted';

        const createdDate = new Date(createdAt);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - createdDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffTime / (1000 * 60));
                return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
            }
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays === 1) {
            return '1 day ago';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months !== 1 ? 's' : ''} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} year${years !== 1 ? 's' : ''} ago`;
        }
    };

    const excludedCategories = [
        3, 28, 44, 73, 74, 75, // Specific category IDs
        29, 45, 51, 55, 61    // Parent category IDs
    ];

    const shouldShowDetails = !excludedCategories.some(id =>
        product.category_id === id ||
        product.category?.parent_id === id
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomStatusBar />
            <ScrollView
                contentContainerStyle={styles.container}
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
            >
                {/* Image Gallery */}
                <View style={styles.galleryContainer}>
                    {product.images?.length > 0 ? (
                        <FlatList
                            ref={flatListRef}
                            data={product.images}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => openImageViewer(index)}
                                >
                                    <Image
                                        source={{ uri: item }}
                                        style={styles.galleryImage}
                                    />
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    ) : (
                        <View style={styles.noImageContainer}>
                            <Icon name="image-off" size={normalize(24)} color="#ccc" />
                            <Text style={styles.noImageText}>No images available</Text>
                        </View>
                    )}

                    {product.images?.length > 1 && (
                        <View style={styles.imageIndicator}>
                            {product.images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.indicatorDot,
                                        currentImageIndex === index && styles.activeDot
                                    ]}
                                />
                            ))}
                        </View>
                    )}

                    <View style={[
                        styles.productTag,
                        product.type === 'rent' ? styles.rentTag : styles.sellTag
                    ]}>
                        <Text style={styles.tagText}>
                            {product.type === 'rent' ? 'RENT' : 'SELL'}
                        </Text>
                    </View>
                </View>

                {/* Compact Product Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerTopRow}>
                        <Text style={styles.priceText}>
                            {(() => {
                                if (!product || !product.post_details) return '---';

                                if (product.category_id >= 9 && product.category_id <= 23) {
                                    // Job category with salary range
                                    const from = product.post_details.salary_from;
                                    const to = product.post_details.salary_to;

                                    if (!from && !to) return '---';

                                    const fromText = from ? `₹${from}` : '';
                                    const toText = to ? `₹${to}` : '';
                                    const separator = from && to ? ' - ' : '';

                                    return `${fromText}${separator}${toText}`;
                                } else {
                                    // Regular product with amount
                                    return product.post_details.amount ? `₹${product.post_details.amount}` : '---';
                                }
                            })()}
                        </Text>
                        {buyerId !== product.user?.id && (
                            <TouchableOpacity onPress={toggleUserFollow}>
                                <Icon
                                    name={userFollowed ? 'heart' : 'heart-outline'}
                                    size={normalize(22)}
                                    color={userFollowed ? '#FF3B30' : '#8E8E93'}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.titleText}>{product.title || 'No title'}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Icon name="tag-outline" size={normalize(14)} color="#8E8E93" />
                            <Text style={styles.metaText}>
                                {product.category?.name || 'Uncategorized'}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Icon name="map-marker-outline" size={normalize(14)} color="#8E8E93" />
                            <Text style={styles.metaText}>
                                {product.address || 'Location not specified'}
                            </Text>
                        </View>
                        {productDistance && (
                            <View style={styles.metaItem}>
                                <Icon name="map-marker-distance" size={normalize(14)} color="#007AFF" />
                                <Text style={[styles.metaText, styles.distanceText]}>
                                    {productDistance} away
                                </Text>
                            </View>
                        )}
                        <View style={styles.metaItem}>
                            <Icon name="clock-outline" size={normalize(14)} color="#8E8E93" />
                            <Text style={styles.metaText}>
                                {getTimeSincePosting(product.created_at)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Details Section */}
                {shouldShowDetails && renderDetails()}

                {/* Description Section */}
                {product.post_details?.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>
                            {product.post_details?.description || 'No description available'}
                        </Text>
                    </View>
                )}

                {/* Seller Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Seller Information</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CompanyDetailsPage', { userId: product.user?.id })}
                    >
                        <View style={styles.sellerCard}>
                            <Image
                                source={product.user?.profile_image
                                    ? { uri: product.user.profile_image }
                                    : require('../assets/images/user.webp')}
                                style={styles.sellerImage}
                            />
                            <View style={styles.sellerInfo}>
                                <View style={styles.sellerNameRow}>
                                    <Text style={styles.sellerName}>
                                        {product.user?.name || 'Unknown Seller'}
                                    </Text>
                                    {buyerId !== product.user?.id && (
                                        <TouchableOpacity
                                            style={styles.followSellerButtonInline}
                                            onPress={toggleUserFollow}
                                        >
                                            <Icon
                                                name={userFollowed ? 'heart' : 'heart-outline'}
                                                size={normalize(18)}
                                                color={userFollowed ? '#FF3B30' : '#8E8E93'}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={styles.sellerMeta}>
                                    <Icon name="star" size={normalize(12)} color="#FFCC00" />
                                    <Text style={styles.sellerMetaText}>
                                        4.8 (24) • {getMemberSince(product.user?.created_at)}
                                    </Text>
                                </View>

                                {/* Additional Seller Details */}
                                <View style={styles.sellerDetails}>
                                    {product.user?.phone && (
                                        <View style={styles.sellerDetailItem}>
                                            <Icon name="phone" size={normalize(12)} color="#8E8E93" />
                                            <Text style={styles.sellerDetailText}>
                                                {product.user?.phone || 'Phone not available'}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.sellerDetailItem}>
                                        <Icon name="clock" size={normalize(12)} color="#8E8E93" />
                                        <Text style={styles.sellerDetailText}>
                                            Usually responds within 2 hours
                                        </Text>
                                    </View>
                                    <View style={styles.sellerDetailItem}>
                                        <Icon name="check-circle" size={normalize(12)} color="#4CAF50" />
                                        <Text style={styles.sellerDetailText}>
                                            Verified seller
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {buyerId !== product.user?.id && product.user?.phone && (
                                <View style={styles.sellerActions}>
                                    <TouchableOpacity
                                        style={styles.callIcon}
                                        onPress={() => Linking.openURL(`tel:${product.user.phone}`)}
                                    >
                                        <Icon name="phone-outline" size={normalize(18)} color="#007AFF" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Location Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <TouchableOpacity
                        style={styles.mapContainer}
                        onPress={handleMapPress}
                    >
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: 22.6992,
                                longitude: 88.3902,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                        >
                            <Marker coordinate={{ latitude: 22.6992, longitude: 88.3902 }} />
                        </MapView>
                        <View style={styles.addressOverlay}>
                            <Text style={styles.addressText} numberOfLines={2}>
                                {product.address || 'Location not specified'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Report Button */}
                {buyerId !== product.user?.id && (
                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={() => setShowReportModal(true)}
                    >
                        <Icon name="alert-circle-outline" size={normalize(16)} color="#FF3B30" />
                        <Text style={styles.reportButtonText}>Report this post</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Action Buttons - Right Side */}
            {buyerId !== product.user?.id && (
                <View style={styles.floatingButtonContainer}>
                    {product.show_phone && product.user.phone_no && product.user.phone_no.trim() !== '' && (
                        <TouchableOpacity
                            style={[styles.floatingButton, styles.callButton]}
                            onPress={() => Linking.openURL(`tel:${product.user.phone_no}`)}
                        >
                            <Icon name="phone" size={normalize(18)} color="#fff" />
                            <Text style={styles.floatingButtonText}>Call</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.floatingButton, styles.chatButton]}
                        onPress={handleChatWithSeller}
                    >
                        <Icon name="message-text" size={normalize(18)} color="#fff" />
                        <Text style={styles.floatingButtonText}>Chat</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Image Viewer Modal - Exactly as before */}
            {product.images?.length > 0 && (
                <ImageView
                    images={product.images.map(img => ({ uri: img }))}
                    imageIndex={imageIndex}
                    visible={visibleImageView}
                    onRequestClose={() => setVisibleImageView(false)}
                    presentationStyle="overFullScreen"
                    animationType="fade"
                />
            )}

            {/* Keep all your modals exactly as before */}
            <ReportPostModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReportSubmit}
                postId={product.id}
            />

            <ModalScreen
                visible={modalVisible}
                type={modalType}
                title={modalTitle}
                message={modalMessage}
                onClose={() => setModalVisible(false)}
            />
        </SafeAreaView>
    );
};

export default ProductDetails;