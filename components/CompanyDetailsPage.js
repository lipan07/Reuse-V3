import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Dimensions,
    FlatList
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");
const scale = width / 375; // Base width for scaling (iPhone 6/7/8)

// ✅ Improved normalize (prevents oversized text on big screens)
const normalize = (size) => {
    const newSize = size * scale;
    return Math.round(Math.min(newSize, size * 1.2));
};

const CompanyDetailsPage = () => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState("products");

    // Mock data
    const company = {
        name: "NEXA Technologies",
        location: "San Francisco, CA",
        email: "contact@nexatech.com",
        phone: "+1 (555) 123-4567",
        website: "www.nexatech.com",
        postsActive: 47,
        postsSold: 128,
        responseTime: "2 hours", // Added response time
        profileImage: null,
        about: "Leading innovator in quantum computing and AI solutions. We're transforming industries with cutting-edge technology and neural interfaces."
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

    const handleFollow = () => setIsFollowing(!isFollowing);
    const handleCall = () => Linking.openURL(`tel:${company.phone}`);
    const handleEmail = () => Linking.openURL(`mailto:${company.email}`);
    const handleWebsite = () => Linking.openURL(`https://${company.website}`);

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
        <View style={styles.container}>
            {/* Background */}
            <View style={styles.backgroundSphere} />
            <View style={[styles.backgroundSphere, styles.sphereRight]} />

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
                        <Text style={styles.statNumber}>{company.responseTime}</Text>
                        <Text style={styles.statLabel}>Avg Response</Text>
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
                        <Text style={styles.sectionTitle}>Contact</Text>

                        <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                            <View style={styles.contactIcon}>
                                <Icon name="email" size={normalize(18)} color="#1A1A1A" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactLabel}>Email</Text>
                                <Text style={styles.contactValue}>{company.email}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                            <View style={styles.contactIcon}>
                                <Icon name="phone" size={normalize(18)} color="#1A1A1A" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactLabel}>Phone</Text>
                                <Text style={styles.contactValue}>{company.phone}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
                            <View style={styles.contactIcon}>
                                <Icon name="web" size={normalize(18)} color="#1A1A1A" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactLabel}>Website</Text>
                                <Text style={styles.contactValue}>{company.website}</Text>
                            </View>
                        </TouchableOpacity>
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
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF", paddingTop: 40 },
    backgroundSphere: {
        position: "absolute",
        width: normalize(250),
        height: normalize(250),
        borderRadius: normalize(125),
        backgroundColor: "rgba(26,26,26,0.03)",
        top: normalize(-120),
        left: normalize(-80),
    },
    sphereRight: {
        right: normalize(-120),
        top: height / 2,
    },
    scrollContent: {
        padding: normalize(16),
        paddingBottom: normalize(100),
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: normalize(20),
    },
    profileContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
    profileImage: { width: normalize(60), height: normalize(60), borderRadius: normalize(30) },
    profilePlaceholder: {
        width: normalize(60),
        height: normalize(60),
        borderRadius: normalize(30),
        backgroundColor: "rgba(26,26,26,0.05)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(26,26,26,0.1)",
    },
    headerTextContainer: { marginLeft: normalize(12), flex: 1 },
    companyName: { fontSize: normalize(20), fontWeight: "700", color: "#1A1A1A" },
    locationContainer: { flexDirection: "row", alignItems: "center" },
    locationText: { fontSize: normalize(13), marginLeft: normalize(4), color: "#1A1A1A", opacity: 0.7 },
    followButton: {
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(8),
        borderRadius: normalize(18),
        backgroundColor: "#007BFF",
    },
    followingButton: { backgroundColor: "rgba(26,26,26,0.1)" },
    followButtonText: { fontSize: normalize(13), fontWeight: "600", color: "#FFF" },
    followingButtonText: { color: "#1A1A1A" },

    statsContainer: {
        flexDirection: "row",
        backgroundColor: "rgba(26,26,26,0.03)",
        borderRadius: normalize(14),
        padding: normalize(10),
        marginBottom: normalize(16),
    },
    statItem: { flex: 1, alignItems: "center" },
    statNumber: { fontSize: normalize(18), fontWeight: "700", color: "#007BFF" },
    statLabel: { fontSize: normalize(12), opacity: 0.7 },
    statDivider: { width: 1, backgroundColor: "rgba(26,26,26,0.1)" },

    section: {
        backgroundColor: "rgba(26,26,26,0.02)",
        borderRadius: normalize(14),
        padding: normalize(16),
        marginBottom: normalize(16),
    },
    sectionTitle: { fontSize: normalize(16), fontWeight: "600", color: "#007BFF", marginBottom: 8 },
    aboutText: { fontSize: normalize(13), lineHeight: normalize(20), opacity: 0.8 },

    tabContainer: {
        flexDirection: "row",
        backgroundColor: "rgba(26,26,26,0.03)",
        borderRadius: normalize(12),
        marginBottom: normalize(16),
    },
    tab: { flex: 1, paddingVertical: normalize(10), alignItems: "center", borderRadius: normalize(10) },
    activeTab: { backgroundColor: "rgba(26,26,26,0.1)" },
    tabText: { fontSize: normalize(13), fontWeight: "500", color: "#1A1A1A" },
    activeTabText: { fontWeight: "600" },

    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    viewAllText: { fontSize: normalize(12), opacity: 0.7 },

    productItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: normalize(12),
        borderRadius: normalize(12),
        marginBottom: normalize(10),
        borderWidth: 1,
        borderColor: "rgba(26,26,26,0.05)",
    },
    productImageContainer: { marginRight: normalize(12) },
    productImage: { width: normalize(50), height: normalize(50), borderRadius: normalize(10) },
    productImagePlaceholder: {
        width: normalize(50),
        height: normalize(50),
        borderRadius: normalize(10),
        backgroundColor: "rgba(26,26,26,0.05)",
        justifyContent: "center",
        alignItems: "center",
    },
    productDetails: { flex: 1 },
    productTitle: { fontSize: normalize(14), fontWeight: "600", color: "#007BFF" },
    productDescription: { fontSize: normalize(12), opacity: 0.7 },
    productMeta: { flexDirection: "row", justifyContent: "space-between" },
    productCategory: {
        fontSize: normalize(11),
        backgroundColor: "rgba(26,26,26,0.05)",
        paddingHorizontal: normalize(6),
        borderRadius: normalize(10),
    },
    postedTime: { fontSize: normalize(11), opacity: 0.5 },
    productPrice: { fontSize: normalize(14), fontWeight: "700", color: "#007BFF" },
    productAction: { padding: normalize(6) },

    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: normalize(12),
        borderBottomWidth: 1,
        borderBottomColor: "rgba(26,26,26,0.05)",
    },
    contactIcon: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(19),
        backgroundColor: "rgba(26,26,26,0.05)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: normalize(12),
    },
    contactLabel: { fontSize: normalize(11), opacity: 0.7 },
    contactValue: { fontSize: normalize(14) },

    actionContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        padding: normalize(14),
        backgroundColor: "#FFF",
        borderTopWidth: 1,
        borderTopColor: "rgba(26,26,26,0.1)",
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#007BFF",
        paddingVertical: normalize(12),
        borderRadius: normalize(12),
        marginHorizontal: normalize(6),
    },
    messageButton: { backgroundColor: "#007BFF" },
    actionButtonText: { fontSize: normalize(14), fontWeight: "600", marginLeft: normalize(6), color: "#FFF" },

    bottomPadding: { height: normalize(20) },
});

export default CompanyDetailsPage;