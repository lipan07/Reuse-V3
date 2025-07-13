import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dialog, ALERT_TYPE } from 'react-native-alert-notification';

const CompanyDetailsPage = ({ route }) => {
    const { userId } = route.params; // Assuming companyId is passed for API calls
    const [companyDetails, setCompanyDetails] = useState(null); // State to hold company details
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [isFollowing, setIsFollowing] = useState(false); // State to track follow status

    const dummyReviews = [
        { id: 1, user: 'John Doe', comment: 'Great company, excellent service!', rating: 5 },
        { id: 2, user: 'Jane Smith', comment: 'Good products, fast delivery.', rating: 4 },
    ];

    // Fetch user details on component mount
    useEffect(() => {
        const fetchCompanyDetails = async () => {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('authToken');

            try {
                console.log(`${process.env.BASE_URL}/users/${userId}`);
                const response = await fetch(`${process.env.BASE_URL}/users/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const result = await response.json();
                console.log(result);
                if (response.ok) {
                    setCompanyDetails(result.data); // Update company details
                    setIsFollowing(result.data.is_following); // Update follow status
                } else {
                    console.error('Failed to fetch company details:', result.message);
                }
            } catch (error) {
                console.error('Error fetching company details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanyDetails();
    }, [userId]);

    // Handle Follow/Unfollow logic
    const handleFollowToggle = async () => {
        const token = await AsyncStorage.getItem('authToken');
        console.log(`${process.env.BASE_URL}/follow-user`);
        console.log(companyDetails.id);
        try {
            const response = await fetch(`${process.env.BASE_URL}/follow-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ following_id: companyDetails.id }),
            });

            const result = await response.json();

            if (response.ok) {
                setIsFollowing(!isFollowing); // Toggle follow state
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: isFollowing ? 'Unfollowed' : 'Followed',
                    textBody: result.message,
                    button: 'OK',
                });
            } else {
                Dialog.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Warning',
                    textBody: result.message || 'Something went wrong.',
                    button: 'OK',
                });
            }
        } catch (error) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Failed to update follow status. Please try again later.',
                button: 'OK',
            });
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    if (!companyDetails) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load company details. Please try again later.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: companyDetails.logo || 'https://via.placeholder.com/100' }}
                    style={styles.logo}
                />
                <View style={styles.headerText}>
                    <Text style={styles.companyName}>{companyDetails.name || 'N/A'}</Text>
                    <TouchableOpacity
                        style={[styles.followButton, isFollowing ? styles.followedButton : styles.unfollowButton]}
                        onPress={handleFollowToggle}
                    >
                        <Text style={styles.followButtonText}>
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.about}>{companyDetails.about || 'No description available.'}</Text>
            <View style={styles.contactInfo}>
                <Text style={styles.infoTitle}>Address:</Text>
                <Text style={styles.infoText}>{companyDetails.address || 'N/A'}</Text>
                <Text style={styles.infoTitle}>Email:</Text>
                <Text style={styles.infoText}>{companyDetails.email || 'N/A'}</Text>
                <Text style={styles.infoTitle}>Phone:</Text>
                <Text style={styles.infoText}>{companyDetails.phone_no || 'N/A'}</Text>
                <Text style={styles.infoTitle}>Website:</Text>
                <Text style={styles.infoText}>{companyDetails.website || 'N/A'}</Text>
            </View>
            <View style={styles.ratingContainer}>
                <Text style={styles.rating}>
                    Rating: {companyDetails.rating || 'N/A'} ⭐
                </Text>
                <Text style={styles.reviews}>
                    Reviews: {companyDetails.reviews || 0}
                </Text>
            </View>
            <View style={styles.reviewsContainer}>
                <Text style={styles.reviewsTitle}>Recent Reviews:</Text>
                {dummyReviews.map((review) => (
                    <View key={review.id} style={styles.reviewItem}>
                        <View style={styles.reviewHeader}>
                            <Text style={styles.reviewUser}>{review.user}</Text>
                            <Text style={styles.reviewRating}>Rating: {review.rating} ⭐</Text>
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
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#ff0000',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 100,
        marginRight: 20,
        borderRadius: 10,
    },
    headerText: {
        flex: 1,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    followButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        alignItems: 'center',
    },
    followedButton: {
        backgroundColor: '#4caf50', // Green for "Following"
    },
    unfollowButton: {
        backgroundColor: '#007bff', // Blue for "Follow"
    },
    followButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    about: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
    },
    contactInfo: {
        marginBottom: 20,
    },
    infoTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    infoText: {
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    rating: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
    },
    reviewsContainer: {
        marginBottom: 20,
    },
    reviewsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    reviewItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 3,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    reviewUser: {
        fontWeight: 'bold',
    },
    reviewRating: {
        color: '#007bff',
    },
    reviewComment: {
        color: '#555',
        marginBottom: 10,
    },
});

export default CompanyDetailsPage;
