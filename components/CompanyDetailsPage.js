import React, { useState, useEffect } from "react";
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
    Alert
} from "react-native";
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

const CompanyDetailsPage = ({ route }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState("products");
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get user ID from route params or use a default
    const userId = route?.params?.userId || '01980f61-6523-7063-9b37-fd08da364792';

    // Fetch company details from API
    useEffect(() => {
        fetchCompanyDetails();
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
                    isFollowing: userData.isFollowing || false
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

    // Mock product data
    const products = [
        {
            id: '1',
            image: null,
            title: "Quantum Processor QX-7",
            description: "Next-gen quantum computing chip with 128 qubits",
            postedTime: "2 hours ago",
            price: "$4,299",
            category: "Electronics"
        },
        {
            id: '2',
            image: null,
            title: "Neural Interface Headset",
            description: "Direct brain-to-computer interface technology",
            postedTime: "1 day ago",
            price: "$2,499",
            category: "Wearables"
        },
        {
            id: '3',
            image: null,
            title: "Holographic Display Unit",
            description: "Full-color 3D holograms without special glasses",
            postedTime: "3 days ago",
            price: "$3,899",
            category: "Displays"
        },
        {
            id: '6',
            image: null,
            title: "Holographic Display Unit",
            description: "Full-color 3D holograms without special glasses",
            postedTime: "3 days ago",
            price: "$3,899",
            category: "Displays"
        },
        {
            id: '7',
            image: null,
            title: "Holographic Display Unit",
            description: "Full-color 3D holograms without special glasses",
            postedTime: "3 days ago",
            price: "$3,899",
            category: "Displays"
        },
        {
            id: '8',
            image: null,
            title: "Holographic Display Unit",
            description: "Full-color 3D holograms without special glasses",
            postedTime: "3 days ago",
            price: "$3,899",
            category: "Displays"
        },
        {
            id: '9',
            image: null,
            title: "Holographic Display Unit",
            description: "Full-color 3D holograms without special glasses",
            postedTime: "3 days ago",
            price: "$3,899",
            category: "Displays"
        },
        {
            id: '10',
            image: null,
            title: "Holographic Display Unit",
            description: "Full-color 3D holograms without special glasses",
            postedTime: "3 days ago",
            price: "$3,899",
            category: "Displays"
        },
    ];

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
        <TouchableOpacity style={styles.productItem}>
            <View style={styles.productImageContainer}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                ) : (
                    <View style={styles.productImagePlaceholder}>
                        <Icon name="image" size={normalize(26)} color="#1A1A1A" />
                    </View>
                )}
            </View>
            <View style={styles.productDetails}>
                <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.productMeta}>
                    <Text style={styles.productCategory}>{item.category}</Text>
                    <Text style={styles.postedTime}>{item.postedTime}</Text>
                </View>
                <Text style={styles.productPrice}>{item.price}</Text>
            </View>
            <TouchableOpacity style={styles.productAction}>
                <Icon name="chevron-right" size={normalize(20)} color="#1A1A1A" />
            </TouchableOpacity>
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
                            <Text style={styles.companyName}>{company.name}</Text>
                            <View style={styles.locationContainer}>
                                <Icon name="map-marker" size={normalize(14)} color="#1A1A1A" />
                                <Text style={styles.locationText}>{company.location}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.followButton, isFollowing && styles.followingButton]}
                        onPress={handleFollow}
                    >
                        <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                            {isFollowing ? "Following" : "Follow"}
                        </Text>
                    </TouchableOpacity>
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
                        <Icon name="clock-outline" size={normalize(20)} color="#1A1A1A" />
                            <Text style={styles.statNumberw}>{company.responseTime}</Text>
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
                            <TouchableOpacity>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={products}
                            renderItem={renderProductItem}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                            style={styles.productsList}
                        />
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

            {/* Bottom Actions */}
            <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                    <Icon name="phone" size={normalize(18)} color="#fff" />
                    <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.messageButton]} onPress={handleEmail}>
                    <Icon name="email" size={normalize(18)} color="#fff" />
                    <Text style={styles.actionButtonText}>Message</Text>
                </TouchableOpacity>
            </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F7FA", paddingTop: 40 },
    scrollContent: {
        padding: normalize(16),
        paddingBottom: normalize(100),
    },
    header: {
        backgroundColor: '#FFFFFF',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: normalize(16),
        padding: normalize(16),
        borderRadius: normalize(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    profileContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
    profileImage: { width: normalize(60), height: normalize(60), borderRadius: normalize(30) },
    profilePlaceholder: {
        width: normalize(60),
        height: normalize(60),
        borderRadius: normalize(30),
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTextContainer: { marginLeft: normalize(12), flex: 1 },
    companyName: { fontSize: normalize(20), fontWeight: "700", color: "#1A1A1A" },
    locationContainer: { flexDirection: "row", alignItems: "center" },
    locationText: { fontSize: normalize(13), marginLeft: normalize(4), color: "#666666" },
    followButton: {
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(8),
        borderRadius: normalize(18),
        backgroundColor: "#007BFF",
    },
    followingButton: { backgroundColor: "#F0F0F0" },
    followButtonText: { fontSize: normalize(13), fontWeight: "600", color: "#FFF" },
    followingButtonText: { color: "#333333" },

    statsContainer: {
        flexDirection: "row",
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        padding: normalize(16),
        marginBottom: normalize(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: { flex: 1, alignItems: "center" },
    statNumber: { fontSize: normalize(18), fontWeight: "700", color: "#007BFF" },
    statNumberw: { fontSize: normalize(10), fontWeight: "700", color: "#007BFF" },
    statLabel: { fontSize: normalize(12), color: '#6B7280', fontWeight: '500' },
    statDivider: { width: 1, backgroundColor: "#E9ECEF", marginHorizontal: normalize(12) },

    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(12),
        padding: normalize(16),
        marginBottom: normalize(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: { fontSize: normalize(16), fontWeight: "600", color: "#1A1A1A", marginBottom: normalize(12) },
    aboutText: { fontSize: normalize(13), lineHeight: normalize(20), color: '#4A4A4A' },

    tabContainer: {
        flexDirection: "row",
        backgroundColor: '#F8F9FA',
        borderRadius: normalize(12),
        marginBottom: normalize(16),
        padding: normalize(4),
    },
    tab: { flex: 1, paddingVertical: normalize(10), alignItems: "center", borderRadius: normalize(8) },
    activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    tabText: { fontSize: normalize(13), fontWeight: "500", color: "#6B7280" },
    activeTabText: { fontWeight: "600", color: '#1A1A1A' },

    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    viewAllText: { fontSize: normalize(12), color: '#007BFF', fontWeight: '500' },

    productItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: normalize(12),
        borderRadius: normalize(12),
        marginBottom: normalize(10),
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    productImageContainer: { marginRight: normalize(12) },
    productImage: { width: normalize(50), height: normalize(50), borderRadius: normalize(10) },
    productImagePlaceholder: {
        width: normalize(50),
        height: normalize(50),
        borderRadius: normalize(10),
        backgroundColor: '#FFFFFF',
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    productDetails: { flex: 1 },
    productTitle: { fontSize: normalize(14), fontWeight: "600", color: "#1A1A1A", marginBottom: normalize(4) },
    productDescription: { fontSize: normalize(12), color: '#6B7280', marginBottom: normalize(8) },
    productMeta: { flexDirection: "row", justifyContent: "space-between" },
    productCategory: {
        fontSize: normalize(11),
        backgroundColor: '#E3F2FD',
        color: '#007BFF',
        paddingHorizontal: normalize(6),
        paddingVertical: normalize(2),
        borderRadius: normalize(10),
        fontWeight: '500',
    },
    postedTime: { fontSize: normalize(11), color: '#9CA3AF', fontWeight: '500' },
    productPrice: { fontSize: normalize(14), fontWeight: "700", color: "#007BFF" },
    productAction: { padding: normalize(6) },

    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: normalize(12),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    contactIcon: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(19),
        backgroundColor: '#F8F9FA',
        justifyContent: "center",
        alignItems: "center",
        marginRight: normalize(12),
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    contactInfo: { flex: 1 },
    contactLabel: { fontSize: normalize(11), color: '#6B7280', fontWeight: '500', marginBottom: normalize(2) },
    contactValue: { fontSize: normalize(14), color: '#1A1A1A', fontWeight: '500' },

    actionContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        padding: normalize(14),
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: normalize(20),
        borderTopRightRadius: normalize(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#34C759',
        paddingVertical: normalize(12),
        borderRadius: normalize(12),
        marginHorizontal: normalize(6),
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    messageButton: { backgroundColor: '#007BFF', shadowColor: '#007BFF' },
    actionButtonText: { fontSize: normalize(14), fontWeight: "600", marginLeft: normalize(6), color: '#FFFFFF' },

    bottomPadding: { height: normalize(20) },
});

export default CompanyDetailsPage;