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
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from './BottomNavBar';
import Car from './ProductDetails/Car';
import Mobile from './ProductDetails/Mobile';
import Bycycle from './ProductDetails/Bycycle';
import CleaningPestControl from './ProductDetails/CleaningPestControl';
import CommercialHeavyMachinery from './ProductDetails/CommercialHeavyMachinery';
import EducationClasses from './ProductDetails/EducationClasses';
import Electronics from './ProductDetails/Electronics';
import HomeRenovation from './ProductDetails/HomeRenovation';
import HouseApartment from './ProductDetails/HouseApartment';
import Job from './ProductDetails/Job';
import LandPlot from './ProductDetails/LandPlot';
import LegalService from './ProductDetails/LegalService';
import Motorcycle from './ProductDetails/Motorcycle';
import PgGuestHouse from './ProductDetails/PgGuestHouse';
import Scooter from './ProductDetails/Scooter';
import ToursTravel from './ProductDetails/ToursTravel';
import VehicleSparePart from './ProductDetails/VehicleSparePart';
import Others from './ProductDetails/Others';
import styles from '../assets/css/ProductDetailsPage.styles';
import AddressSection from './AddressSection.js';
import ReportPostModal from './ReportPostModal.js';
import ModalScreen from './SupportElement/ModalScreen.js';


const { width } = Dimensions.get('window');

import {
    BannerAd,
    BannerAdSize,
    TestIds,
    AppOpenAd,
    AdEventType,
} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : process.env.G_BANNER_AD_UNIT_ID;

const ProductDetails = () => {
    const [buyerId, setBuyerId] = useState(null);
    const [userFollowed, setUserFollowed] = useState(false);
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // ✅ added for auto-scroll
    const scrollViewRef = useRef(null); // ✅ added for auto-scroll
    const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 20 : 24);
    const [showReportModal, setShowReportModal] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('info');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState(''); // Changed from modalText

    const navigation = useNavigation();
    const route = useRoute();
    const { productDetails } = route.params;
    const productId = productDetails.id;

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const apiURL = `${process.env.BASE_URL}/posts/${productId}`;
                const response = await fetch(apiURL, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    const product = data.data;

                    console.log('Product Details:', product);
                    setUserFollowed(data.is_following_post_user === true);
                    setProduct(product);
                }
            } catch (error) {
                console.error('Error fetching product details:', error);
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

    // ✅ Auto-scroll logic
    useEffect(() => {
        if (!product?.images || product.images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % product.images.length;
                const scrollToX = width * nextIndex;

                scrollViewRef.current?.scrollTo({ x: scrollToX, animated: true });
                return nextIndex;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [product?.images]);

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.notFoundContainer}>
                <Icon name="alert-circle-outline" size={50} color="gray" />
                <Text style={styles.notFoundText}>Product Not Found</Text>
            </View>
        );
    }

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
                // Update based on API response if available, otherwise toggle
                const newStatus = result.data?.is_following ?? !userFollowed;
                setUserFollowed(newStatus);

                // Also update the product object to keep consistency
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
                chatId: null // explicitly set as null to trigger first message logic
            });
        }
    };

    const handleMapPress = () => {
        const addressQuery = encodeURIComponent(product.address || "Unknown Location");
        const url = `https://www.google.com/maps/search/?api=1&query=22.6992,88.3902`;
        Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open Google Maps"));
    };

    // Add this function in your ProductDetails component
    const handleReportSubmit = async (reportData) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const url = `${process.env.BASE_URL}/reports`;
            console.log(url);
            const formData = new FormData();
            formData.append('post_id', product.id);
            formData.append('reporting_user_id', buyerId);
            formData.append('type', reportData.reason);
            if (reportData.description) {
                formData.append('description', reportData.description);
            }
            console.log(formData);
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
            setModalType('error'); // Changed from 'danger' to match your ModalScreen types
            setModalTitle('Submission Failed');
            setModalMessage(error.message || 'Something went wrong while submitting your report.');
            setModalVisible(true);
        }
    };


    const renderDetails = () => {
        switch (product.category_id) {
            case 1: return <Car product={product} />
            case 3: return <HouseApartment product={product} />
            case 4: return <LandPlot product={product} />
            case 5: return <PgGuestHouse product={product} />
            case 7: return <Mobile product={product} />
            case 27: return <Bycycle product={product} />
            case 72: return <CleaningPestControl product={product} />
            case 43: return <CommercialHeavyMachinery product={product} />
            case 67: return <EducationClasses product={product} />
            case 69: return <Electronics product={product} />
            case 71: return <HomeRenovation product={product} />
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
            case 19:
            case 20:
            case 21:
            case 22:
            case 23: return <Job product={product} />
            case 73: return <LegalService product={product} />
            case 25: return <Motorcycle product={product} />
            case 26: return <Scooter product={product} />
            case 68: return <ToursTravel product={product} />
            case 41: return <VehicleSparePart product={product} />
            default: return <Others product={product} />
        }
    };

    const handleReportButton = () => setShowReportModal(true);

    return (
        <>
            <StatusBar backgroundColor="#007BFF" barStyle="light-content" translucent={true} />
            {/* Blue background for status bar area */}
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: statusBarHeight,
                backgroundColor: '#007BFF',
                zIndex: 1,
            }} />
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* ✅ Auto-scrolling Image Gallery */}
                    {product.images?.length > 0 ? (
                        <ScrollView
                            ref={scrollViewRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            style={styles.imageGallery}
                            onMomentumScrollEnd={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                                setCurrentImageIndex(index);
                            }}
                        >
                            {product.images.map((img, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => navigation.navigate('ImageViewer', {
                                        images: product.images,
                                        selectedIndex: index
                                    })}
                                >
                                    <Image
                                        source={{ uri: img }}
                                        style={styles.galleryImage}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={[styles.galleryImage, styles.noImageContainer]}>
                            <Text style={styles.noImageText}>
                                {product.category.name
                                    ? `No image found for \n ${product.category.name}`
                                    : 'No product image available'}
                            </Text>
                        </View>
                    )}


                    {/* Product Details Section */}
                    <View style={styles.detailsSection}>{renderDetails()}</View>

                    {/* Seller Information */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Seller Information</Text>
                        <View style={styles.sellerCard}>
                            <View style={styles.sellerHeader}>
                                <Image
                                    source={product.user?.profile_image
                                        ? { uri: product.user.profile_image }
                                        : require('../assets/images/user.webp')}
                                    style={styles.sellerImage}
                                />
                                <View style={styles.sellerInfo}>
                                    <Text style={styles.sellerName}>
                                        {product.user?.name || 'Unknown Seller'}
                                    </Text>
                                    <Text style={styles.postedText}>Posted 2 days ago</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={toggleUserFollow}
                                    style={styles.followButton}
                                >
                                    <Icon
                                        name={userFollowed ? 'heart' : 'heart-outline'}
                                        size={28}
                                        color={userFollowed ? '#e74c3c' : '#7f8c8d'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Map with Address Overlay */}
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            onPress={handleMapPress}
                            initialRegion={{
                                latitude: 22.6992,
                                longitude: 88.3902,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                        >
                            <Marker
                                coordinate={{ latitude: 22.6992, longitude: 88.3902 }}
                                title="Product Location"
                            />
                        </MapView>
                        {/* Address overlay at top left */}
                        <View style={styles.mapAddressOverlay}>
                            <Text style={styles.mapAddressText} numberOfLines={2} ellipsizeMode="tail">
                                {'Agarpara, Kolkata-700109' || product.address}
                            </Text>
                        </View>
                    </View>


                    {/* Report Link */}
                    {buyerId !== product.user?.id && (
                        <>
                            <View style={styles.reportLinkContainer}>
                                <TouchableOpacity
                                    style={styles.reportButton}
                                    onPress={handleReportButton}
                                    activeOpacity={0.85}
                                >
                                    <Icon name="alert-circle-outline" size={18} color="red" style={{ marginRight: 8 }} />
                                    <Text style={styles.reportButtonText}>Report this post</Text>
                                </TouchableOpacity>
                            </View>

                            <ReportPostModal
                                visible={showReportModal}
                                onClose={() => setShowReportModal(false)}
                                onSubmit={handleReportSubmit}
                                postId={product.id}
                            />
                        </>
                    )}
                </ScrollView>

                {/* Chat/Call Buttons */}
                {buyerId !== product.user?.id && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.chatButton]}
                            onPress={handleChatWithSeller}
                        >
                            <Icon name="message-text" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Chat with Seller</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.callButton]}
                            onPress={() => Linking.openURL(`tel:${product.phone}`)}
                        >
                            <Icon name="phone" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Call Now</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* <BottomNavBar /> */}

                <ModalScreen
                    visible={modalVisible}
                    type={modalType}
                    title={modalTitle}
                    message={modalMessage}  // Changed from textBody
                    onClose={() => setModalVisible(false)}
                />
            </View>
        </>
    );
};

export default ProductDetails;
