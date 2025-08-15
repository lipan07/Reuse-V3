import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CompanyDetailsPage = () => {
    const [isFollowing, setIsFollowing] = useState(false);

    const companyDetails = {
        id: 1,
        name: "TechVision Solutions",
        logo: "", // Empty means missing
        about: "We are a global technology solutions provider, delivering cutting-edge products and services to help businesses thrive in the digital era.",
        address: "123 Innovation Street, Bangalore, India",
        email: "contact@techvision.com",
        phone_no: "+91 98765 43210",
        website: "www.techvision.com",
        rating: 4.7,
        reviews: 245,
    };

    const dummyReviews = [
        { id: 1, user: 'John Doe', comment: 'Outstanding service and innovative products!', rating: 5 },
        { id: 2, user: 'Jane Smith', comment: 'Very professional team, highly recommend.', rating: 4 },
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Header Card */}
            <View style={styles.headerCard}>
                {companyDetails.logo ? (
                    <Image source={{ uri: companyDetails.logo }} style={styles.logo} />
                ) : (
                    <View style={styles.defaultLogo}>
                        <FontAwesome name="building" size={40} color="#007bff" />
                    </View>
                )}

                <View style={{ flex: 1 }}>
                    <Text style={styles.companyName}>{companyDetails.name}</Text>
                    <View style={styles.ratingRow}>
                        <FontAwesome name="star" size={18} color="#FFD700" />
                        <Text style={styles.ratingText}>
                            {companyDetails.rating} ({companyDetails.reviews} reviews)
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.followButton, isFollowing ? styles.following : styles.notFollowing]}
                        onPress={() => setIsFollowing(!isFollowing)}
                    >
                        <Text style={styles.followText}>{isFollowing ? "Following" : "Follow"}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* About Section */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.aboutText}>{companyDetails.about}</Text>
            </View>

            {/* Contact Info */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="location" size={20} color="#007bff" />
                    <Text style={styles.infoText}>{companyDetails.address}</Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="email" size={20} color="#007bff" />
                    <Text style={styles.infoText}>{companyDetails.email}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="call" size={20} color="#007bff" />
                    <Text style={styles.infoText}>{companyDetails.phone_no}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="globe" size={20} color="#007bff" />
                    <Text style={styles.infoText}>{companyDetails.website}</Text>
                </View>
            </View>

            {/* Reviews */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Recent Reviews</Text>
                {dummyReviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <Text style={styles.reviewUser}>{review.user}</Text>
                            <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
                        </View>
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f4f6f8",
        padding: 15,
    },
    headerCard: {
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
    },
    defaultLogo: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
    },
    companyName: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    ratingText: {
        marginLeft: 5,
        color: "#666",
        fontSize: 14,
    },
    followButton: {
        paddingVertical: 6,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    following: {
        backgroundColor: "#4caf50",
    },
    notFollowing: {
        backgroundColor: "#007bff",
    },
    followText: {
        color: "#fff",
        fontWeight: "bold",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    aboutText: {
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#555",
    },
    reviewCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    reviewUser: {
        fontWeight: "bold",
        fontSize: 14,
        color: "#333",
    },
    reviewRating: {
        fontSize: 14,
        color: "#007bff",
    },
    reviewComment: {
        fontSize: 13,
        color: "#555",
        lineHeight: 18,
    },
});

export default CompanyDetailsPage;
