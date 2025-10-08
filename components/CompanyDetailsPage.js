import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Dimensions,
    FlatList,
    ActivityIndicator,
    Alert,
    RefreshControl
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomStatusBar from "./Screens/CustomStatusBar";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");
const scale = width / 375; // Base width for scaling (iPhone 6/7/8)

// ✅ Improved normalize (prevents oversized text on big screens)
const normalize = (size) => {
    const newSize = size * scale;
    return Math.round(Math.min(newSize, size * 1.2));
};

// Function to convert timestamp to human readable format
const getHumanReadableTime = (timestamp) => {
    if (!timestamp || timestamp === 'Unknown') return 'Unknown';

    try {
        const now = new Date();
        const activityDate = new Date(timestamp);
        const diffInSeconds = Math.floor((now - activityDate) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        } else if (diffInSeconds < 31536000) {
            const months = Math.floor(diffInSeconds / 2592000);
            return `${months}mo ago`;
        } else {
            const years = Math.floor(diffInSeconds / 31536000);
            return `${years}y ago`;
        }
    } catch (error) {
        console.error('Error parsing timestamp:', error);
        return 'Unknown';
    }
};

// Function to format member since date
const formatMemberSince = (dateString) => {
    if (!dateString || dateString === 'Unknown') return 'Unknown';

    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' });
        return `Member since ${month} ${year}`;
    } catch (error) {
        return 'Member since Unknown';
    }
};

// Function to render star rating
const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars.push(
            <Icon key={i} name="star" size={normalize(14)} color="#FFD700" />
        );
    }

    if (hasHalfStar) {
        stars.push(
            <Icon key="half" name="star-half-full" size={normalize(14)} color="#FFD700" />
        );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars.push(
            <Icon key={`empty-${i}`} name="star-outline" size={normalize(14)} color="#E5E7EB" />
        );
    }

    return stars;
};

// Function to get color based on activity recency
const getActivityColor = (timestamp) => {
    if (!timestamp || timestamp === 'Unknown') return '#6B7280';

    try {
        const now = new Date();
        const activityDate = new Date(timestamp);
        const diffInSeconds = Math.floor((now - activityDate) / 1000);

        if (diffInSeconds < 3600) { // Less than 1 hour
            return '#10B981'; // Green - very recent
        } else if (diffInSeconds < 86400) { // Less than 1 day
            return '#007BFF'; // Blue - recent
        } else if (diffInSeconds < 604800) { // Less than 1 week
            return '#F59E0B'; // Amber - somewhat recent
        } else {
            return '#6B7280'; // Gray - not recent
        }
    } catch (error) {
        return '#6B7280';
    }
};

const CompanyDetailsPage = ({ route }) => {
    const navigation = useNavigation();
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState("products");
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Products state
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [hasMoreProducts, setHasMoreProducts] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasReachedEnd, setHasReachedEnd] = useState(false);
    const isLoadingRef = useRef(false);

    // Get user ID from route params or use a default
    const userId = route?.params?.userId || '01980f61-6523-7063-9b37-fd08da364792';

    // Fetch company details from API
    useEffect(() => {
        fetchCompanyDetails();
        fetchProducts();
    }, [userId]);

    const fetchCompanyDetails = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('authToken');
            console.log(userId);
            const apiUrl = `${process.env.BASE_URL}/seller-info/${userId}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const responseData = await response.json();

            if (response.ok) {
                const userData = responseData.data;

                // Transform API data to match component structure
                const companyData = {
                    name: userData.name || 'Unknown Company',
                    location: userData.company_detail?.address || 'Location not specified',
                    email: userData.email || userData.company_detail?.contact_person_email || 'Email not provided',
                    phone: userData.phone_no || userData.company_detail?.contact_person_phone || 'Phone not provided',
                    website: userData.company_detail?.website || 'Website not provided',
                    postsActive: userData.activePostCount || 0,
                    postsSold: userData.soldPostCount || 0,
                    responseTime: userData.last_activity || 'Unknown',
                    profileImage: userData.images?.url || null,
                    about: userData.about_me || 'No description available',
                    companyType: userData.company_detail?.type || 'Not specified',
                    contactPersonName: userData.company_detail?.contact_person_name || 'Not specified',
                    contactPersonRole: userData.company_detail?.contact_person_role || 'Not specified',
                    isFollowing: userData.isFollowing || false,
                    // Add rating and member since information
                    rating: userData.rating || 4.5, // Default rating if not available
                    totalReviews: userData.total_reviews || 0,
                    memberSince: userData.created_at || userData.updated_at || 'Unknown'
                };

                setCompany(companyData);
                setIsFollowing(companyData.isFollowing);
            } else {
                setError(responseData.message || 'Failed to fetch company details');
            }
        } catch (error) {
            console.error('Error fetching company details:', error);
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch products from API
    const fetchProducts = async (page = 1, refresh = false) => {
        // Prevent duplicate calls
        if (isLoadingRef.current && !refresh) {
            console.log('Already loading, skipping duplicate call');
            return;
        }

        try {
            isLoadingRef.current = true;
            if (refresh) {
                setRefreshing(true);
            } else {
                setIsLoadingProducts(true);
            }

            const token = await AsyncStorage.getItem('authToken');
            const apiUrl = `${process.env.BASE_URL}/posts?page=${page}&user_id=${userId}`;
            console.log('Products', apiUrl);
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const responseData = await response.json();
            // console.log('Products API Response:', responseData);

            if (response.ok) {
                // The data is directly in responseData.data (array)
                const newProducts = responseData.data || [];
                const meta = responseData.meta || {};
                const links = responseData.links || {};

                if (page === 1) {
                    setProducts(newProducts);
                    setHasReachedEnd(false); // Reset when refreshing
                } else {
                    setProducts(prev => [...prev, ...newProducts]);
                }

                // Use pagination info from API response
                const hasMore = links.next !== null && newProducts.length > 0;
                setHasMoreProducts(hasMore);
                setCurrentPage(page);

                // If we get an empty response or no next page, mark as reached end
                if (newProducts.length === 0 || links.next === null) {
                    setHasReachedEnd(true);
                    console.log('No more products available, stopping pagination');
                }

                console.log(`Loaded ${newProducts.length} products, hasMore: ${hasMore}, next: ${links.next}`);
            } else {
                console.error('Error fetching products:', responseData.message);
                // Stop pagination on error
                setHasMoreProducts(false);
                setHasReachedEnd(true);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            // Stop pagination on network error
            setHasMoreProducts(false);
            setHasReachedEnd(true);
        } finally {
            isLoadingRef.current = false;
            setIsLoadingProducts(false);
            setRefreshing(false);
        }
    };

    // Load more products for pagination
    const loadMoreProducts = () => {
        console.log('loadMoreProducts called:', {
            isLoadingRef: isLoadingRef.current,
            hasMoreProducts,
            hasReachedEnd,
            productsLength: products.length,
            currentPage
        });

        // Only load more if we're not already loading, there are more products available, and we haven't reached the end
        if (!isLoadingRef.current && hasMoreProducts && !hasReachedEnd && products.length > 0) {
            console.log('Loading more products, page:', currentPage + 1);
            fetchProducts(currentPage + 1);
        } else {
            console.log('Skipping load more:', {
                isLoadingRef: isLoadingRef.current,
                hasMoreProducts,
                hasReachedEnd,
                productsLength: products.length
            });
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchProducts(1, true);
    };

    const handleFollow = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const apiUrl = `${process.env.BASE_URL}/users/${userId}/follow`;
            const method = isFollowing ? 'DELETE' : 'POST';

            const response = await fetch(apiUrl, {
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);
                Alert.alert(
                    !isFollowing ? "Following" : "Unfollowed",
                    !isFollowing ? "You are now following this company." : "You have unfollowed this company."
                );
            } else {
                Alert.alert("Error", "Failed to update follow status");
            }
        } catch (error) {
            console.error('Error updating follow status:', error);
            Alert.alert("Error", "Network error. Please try again.");
        }
    };

    const handleCall = () => Linking.openURL(`tel:${company.phone}`);
    const handleEmail = () => Linking.openURL(`mailto:${company.email}`);
    const handleWebsite = () => Linking.openURL(`https://${company.website}`);

    // Loading state
    if (loading) {
        return (
            <>
                <CustomStatusBar />
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#007BFF" />
                    <Text style={{ marginTop: 16, fontSize: normalize(16), color: '#666' }}>
                        Loading company details...
                    </Text>
                </View>
            </>
        );
    }

    // Error state
    if (error) {
        return (
            <>
                <CustomStatusBar />
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                    <Icon name="alert-circle" size={normalize(48)} color="#FF6B6B" />
                    <Text style={{ marginTop: 16, fontSize: normalize(16), color: '#666', textAlign: 'center' }}>
                        {error}
                    </Text>
                    <TouchableOpacity
                        style={[styles.followButton, { marginTop: 20 }]}
                        onPress={fetchCompanyDetails}
                    >
                        <Text style={styles.followButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </>
        );
    }

    // No data state
    if (!company) {
        return (
            <>
                <CustomStatusBar />
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: normalize(16), color: '#666' }}>
                        No company data available
                    </Text>
                </View>
            </>
        );
    }

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productItem}
            onPress={() => {
                console.log('Navigating to ProductDetails with item:', item);
                navigation.navigate('ProductDetails', { productDetails: item });
            }}
            activeOpacity={0.8}
        >
            <View style={styles.productImageContainer}>
                {item.images && item.images.length > 0 ? (
                    <Image source={{ uri: item.images[0] }} style={styles.productImage} />
                ) : (
                    <View style={styles.productImagePlaceholder}>
                            <Icon name="image" size={normalize(20)} color="#9CA3AF" />
                    </View>
                )}
            </View>

            <View style={styles.productDetails}>
                <View style={styles.titleRow}>
                    <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={[styles.typeBadge, {
                        backgroundColor: item.type === 'sell' ? '#E8F5E8' : '#FFF3E0'
                    }]}>
                        <Text style={[styles.typeBadgeText, {
                            color: item.type === 'sell' ? '#2E7D32' : '#F57C00'
                        }]}>
                            {item.type === 'sell' ? 'Sell' : 'Rent'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.productDescription} numberOfLines={1}>
                    {item.post_details?.description || 'No description available'}
                </Text>

                <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>
                        {item.post_details?.amount ? `₹${parseInt(item.post_details.amount).toLocaleString()}` : 'Price not specified'}
                    </Text>
                    <Text style={styles.postedTime}>
                        {item.created_at ? getHumanReadableTime(item.created_at) : 'Unknown'}
                    </Text>
                </View>
            </View>

            <View style={styles.arrowContainer}>
                <Icon name="chevron-right" size={normalize(16)} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            <CustomStatusBar />
            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.profileContainer}>
                            {company.profileImage ? (
                                <Image source={{ uri: company.profileImage }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.profilePlaceholder}>
                                    <Icon name="office-building" size={normalize(34)} color="#1A1A1A" />
                                </View>
                            )}
                            <View style={styles.headerTextContainer}>
                                <View style={styles.nameAndFollowContainer}>
                                    <Text style={styles.companyName}>{company.name}</Text>
                                    <TouchableOpacity
                                        style={styles.followIconButton}
                                        onPress={handleFollow}
                                    >
                                        <Icon
                                            name={isFollowing ? "account-minus" : "account-plus"}
                                            size={normalize(20)}
                                            color={isFollowing ? "#6B7280" : "#007BFF"}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.locationContainer}>
                                    <Icon name="map-marker" size={normalize(14)} color="#1A1A1A" />
                                    <Text style={styles.locationText}>{company.location}</Text>
                                </View>

                                {/* Rating and Member Since */}
                                <View style={styles.ratingContainer}>
                                    <View style={styles.ratingStars}>
                                        {renderStars(company.rating)}
                                        <Text style={styles.ratingText}>{company.rating}</Text>
                                        {company.totalReviews > 0 && (
                                            <Text style={styles.reviewsText}>({company.totalReviews} reviews)</Text>
                                        )}
                                    </View>
                                    <Text style={styles.memberSinceText}>{formatMemberSince(company.memberSince)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Icon name="cube-send" size={normalize(20)} color="#1A1A1A" />
                            <Text style={styles.statNumber}>{company.postsActive}</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Icon name="check-circle" size={normalize(20)} color="#1A1A1A" />
                            <Text style={styles.statNumber}>{company.postsSold}</Text>
                            <Text style={styles.statLabel}>Sold</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Icon name="clock-outline" size={normalize(20)} color={getActivityColor(company.responseTime)} />
                            <Text style={[styles.statNumber, { color: getActivityColor(company.responseTime) }]}>{getHumanReadableTime(company.responseTime)}</Text>
                            <Text style={styles.statLabel}>Last Activity</Text>
                        </View>
                    </View>

                    {/* About */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.aboutText}>{company.about}</Text>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "products" && styles.activeTab]}
                            onPress={() => setActiveTab("products")}
                        >
                            <Text style={[styles.tabText, activeTab === "products" && styles.activeTabText]}>
                                Products
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "info" && styles.activeTab]}
                            onPress={() => setActiveTab("info")}
                        >
                            <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>
                                Info
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Products */}
                    {activeTab === "products" && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Active Products</Text>
                                {/* <TouchableOpacity>
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity> */}
                            </View>

                            {products.length > 0 ? (
                                products.map((item, index) => (
                                    <View key={item.id.toString()}>
                                        {renderProductItem({ item })}
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Icon name="package-variant" size={normalize(48)} color="#ccc" />
                                    <Text style={styles.emptyText}>No products found</Text>
                                    <Text style={styles.emptySubText}>This company hasn't posted any products yet</Text>
                                </View>
                            )}

                            {isLoadingProducts && (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#007bff" />
                                    <Text style={styles.loadingText}>Loading more products...</Text>
                                </View>
                            )}

                            {hasMoreProducts && !hasReachedEnd && products.length > 0 && !isLoadingProducts && (
                                <TouchableOpacity
                                    style={styles.loadMoreButton}
                                    onPress={loadMoreProducts}
                                >
                                    <Text style={styles.loadMoreButtonText}>Load More Products</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Info */}
                    {activeTab === "info" && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Company Information</Text>

                            {/* Company Type */}
                            <View style={styles.contactItem}>
                                <View style={styles.contactIcon}>
                                    <Icon name="domain" size={normalize(18)} color="#1A1A1A" />
                                </View>
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactLabel}>Company Type</Text>
                                    <Text style={styles.contactValue}>{company.companyType}</Text>
                                </View>
                            </View>

                            {/* Contact Person */}
                            <View style={styles.contactItem}>
                                <View style={styles.contactIcon}>
                                    <Icon name="account" size={normalize(18)} color="#1A1A1A" />
                                </View>
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactLabel}>Contact Person</Text>
                                    <Text style={styles.contactValue}>{company.contactPersonName}</Text>
                                </View>
                            </View>

                            {/* Contact Person Role */}
                            <View style={styles.contactItem}>
                                <View style={styles.contactIcon}>
                                    <Icon name="briefcase" size={normalize(18)} color="#1A1A1A" />
                                </View>
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactLabel}>Role</Text>
                                    <Text style={styles.contactValue}>{company.contactPersonRole}</Text>
                                </View>
                            </View>

                            {/* Email */}
                            {company.email !== 'Email not provided' && (
                                <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                                    <View style={styles.contactIcon}>
                                        <Icon name="email" size={normalize(18)} color="#1A1A1A" />
                                    </View>
                                    <View style={styles.contactInfo}>
                                        <Text style={styles.contactLabel}>Email</Text>
                                        <Text style={styles.contactValue}>{company.email}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {/* Phone */}
                            {company.phone !== 'Phone not provided' && (
                                <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                                    <View style={styles.contactIcon}>
                                        <Icon name="phone" size={normalize(18)} color="#1A1A1A" />
                                    </View>
                                    <View style={styles.contactInfo}>
                                        <Text style={styles.contactLabel}>Phone</Text>
                                        <Text style={styles.contactValue}>{company.phone}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {/* Website */}
                            {company.website !== 'Website not provided' && (
                                <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
                                    <View style={styles.contactIcon}>
                                        <Icon name="web" size={normalize(18)} color="#1A1A1A" />
                                    </View>
                                    <View style={styles.contactInfo}>
                                        <Text style={styles.contactLabel}>Website</Text>
                                        <Text style={styles.contactValue}>{company.website}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {/* Location */}
                            <View style={styles.contactItem}>
                                <View style={styles.contactIcon}>
                                    <Icon name="map-marker" size={normalize(18)} color="#1A1A1A" />
                                </View>
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactLabel}>Location</Text>
                                    <Text style={styles.contactValue}>{company.location}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={styles.bottomPadding} />
                </ScrollView>

                {/* Floating Action Buttons - Right Side */}
                <View style={styles.floatingButtonContainer}>
                    <TouchableOpacity style={[styles.floatingButton, styles.callButton]} onPress={handleCall}>
                        <Icon name="phone" size={normalize(18)} color="#fff" />
                        <Text style={styles.floatingButtonText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.floatingButton, styles.chatButton]} onPress={handleEmail}>
                        <Icon name="message-text" size={normalize(18)} color="#fff" />
                        <Text style={styles.floatingButtonText}>Chat</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F7FA", paddingTop: 20 },
    scrollContent: {
        padding: normalize(12),
        paddingBottom: normalize(80),
    },
    header: {
        backgroundColor: '#FFFFFF',
        flexDirection: "row",
        alignItems: "center",
        marginBottom: normalize(12),
        padding: normalize(12),
        borderRadius: normalize(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    profileContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
    profileImage: { width: normalize(50), height: normalize(50), borderRadius: normalize(25) },
    profilePlaceholder: {
        width: normalize(50),
        height: normalize(50),
        borderRadius: normalize(25),
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTextContainer: { marginLeft: normalize(10), flex: 1 },
    nameAndFollowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    companyName: { fontSize: normalize(18), fontWeight: "600", color: "#1A1A1A", flex: 1 },
    followIconButton: {
        padding: normalize(4),
        marginLeft: normalize(6),
    },
    locationContainer: { flexDirection: "row", alignItems: "center", marginBottom: normalize(6) },
    locationText: { fontSize: normalize(12), marginLeft: normalize(4), color: "#666666" },

    ratingContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: normalize(2),
    },
    ratingStars: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        fontSize: normalize(12),
        fontWeight: "600",
        color: "#1A1A1A",
        marginLeft: normalize(4),
    },
    reviewsText: {
        fontSize: normalize(10),
        color: "#6B7280",
        marginLeft: normalize(2),
    },
    memberSinceText: {
        fontSize: normalize(10),
        color: "#6B7280",
        fontWeight: "500",
    },

    statsContainer: {
        flexDirection: "row",
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(8),
        padding: normalize(12),
        marginBottom: normalize(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statItem: { flex: 1, alignItems: "center" },
    statNumber: { fontSize: normalize(16), fontWeight: "600", color: "#007BFF" },
    statLabel: { fontSize: normalize(11), color: '#6B7280', fontWeight: '500', marginTop: normalize(2) },
    lastActivityText: {
        fontSize: normalize(16),
        fontWeight: "600",
    },
    statDivider: { width: 1, backgroundColor: "#E9ECEF", marginHorizontal: normalize(12) },

    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(8),
        padding: normalize(12),
        marginBottom: normalize(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: { fontSize: normalize(15), fontWeight: "600", color: "#1A1A1A", marginBottom: normalize(8) },
    aboutText: { fontSize: normalize(12), lineHeight: normalize(18), color: '#4A4A4A' },

    tabContainer: {
        flexDirection: "row",
        backgroundColor: '#F8F9FA',
        borderRadius: normalize(8),
        marginBottom: normalize(12),
        padding: normalize(3),
    },
    tab: { flex: 1, paddingVertical: normalize(8), alignItems: "center", borderRadius: normalize(6) },
    activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    tabText: { fontSize: normalize(12), fontWeight: "500", color: "#6B7280" },
    activeTabText: { fontWeight: "600", color: '#1A1A1A' },

    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: normalize(8) },
    viewAllText: { fontSize: normalize(11), color: '#007BFF', fontWeight: '500' },

    productItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: normalize(10),
        borderRadius: normalize(8),
        marginBottom: normalize(8),
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F3F4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    productImageContainer: {
        marginRight: normalize(10),
    },
    productImage: {
        width: normalize(50),
        height: normalize(50),
        borderRadius: normalize(6)
    },
    productImagePlaceholder: {
        width: normalize(50),
        height: normalize(50),
        borderRadius: normalize(6),
        backgroundColor: '#F8F9FA',
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    productDetails: {
        flex: 1,
        paddingRight: normalize(8)
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: normalize(4)
    },
    productTitle: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#1A1A1A",
        flex: 1,
        marginRight: normalize(8)
    },
    productDescription: {
        fontSize: normalize(12),
        color: '#6B7280',
        marginBottom: normalize(6),
        lineHeight: normalize(16)
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    productPrice: {
        fontSize: normalize(13),
        fontWeight: "600",
        color: "#007BFF"
    },
    postedTime: {
        fontSize: normalize(10),
        color: '#9CA3AF',
        fontWeight: '500'
    },
    arrowContainer: {
        padding: normalize(4),
        justifyContent: 'center',
        alignItems: 'center'
    },
    typeBadge: {
        paddingHorizontal: normalize(6),
        paddingVertical: normalize(2),
        borderRadius: normalize(4),
    },
    typeBadgeText: {
        fontSize: normalize(8),
        fontWeight: '600',
        textAlign: 'center',
    },

    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: normalize(10),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    contactIcon: {
        width: normalize(32),
        height: normalize(32),
        borderRadius: normalize(16),
        backgroundColor: '#F8F9FA',
        justifyContent: "center",
        alignItems: "center",
        marginRight: normalize(10),
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    contactInfo: { flex: 1 },
    contactLabel: { fontSize: normalize(10), color: '#6B7280', fontWeight: '500', marginBottom: normalize(2) },
    contactValue: { fontSize: normalize(12), color: '#1A1A1A', fontWeight: '500' },

    floatingButtonContainer: {
        position: 'absolute',
        bottom: normalize(20),
        right: normalize(12),
        flexDirection: 'row',
        gap: normalize(8),
    },
    floatingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: normalize(10),
        paddingHorizontal: normalize(14),
        borderRadius: normalize(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minWidth: normalize(70),
    },
    callButton: {
        backgroundColor: '#34C759',
    },
    chatButton: {
        backgroundColor: '#007AFF',
    },
    floatingButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(11),
        fontWeight: '600',
        marginLeft: normalize(4),
    },

    bottomPadding: { height: normalize(20) },

    // Loading and empty states
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: normalize(16),
    },
    loadingText: {
        marginLeft: normalize(8),
        fontSize: normalize(14),
        color: '#6B7280',
    },
    loadMoreButton: {
        backgroundColor: '#007BFF',
        paddingVertical: normalize(12),
        paddingHorizontal: normalize(20),
        borderRadius: normalize(8),
        alignItems: 'center',
        marginTop: normalize(12),
    },
    loadMoreButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: normalize(30),
        paddingHorizontal: normalize(16),
    },
    emptyText: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#6B7280',
        marginTop: normalize(8),
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: normalize(12),
        color: '#9CA3AF',
        marginTop: normalize(4),
        textAlign: 'center',
    },
});

export default CompanyDetailsPage;