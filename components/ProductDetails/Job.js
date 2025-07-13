import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const Job = ({ product }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product); // Use the hook

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Job details are not available.</Text>;
    }

    return (
        <View style={styles.container}>
            {/* Header with Job Title & Follow Icon */}
            <View style={styles.header}>
                <Text style={styles.productTitle}>{product.title || 'No Title'}</Text>
                <TouchableOpacity onPress={toggleFollow}>
                    <Icon
                        name={isFollowed ? 'heart' : 'heart-outline'}
                        size={28}
                        color={isFollowed ? 'red' : 'gray'}
                        style={styles.heartIcon}
                    />
                </TouchableOpacity>
            </View>

            {/* Job Details */}
            <View style={styles.detailRow}>
                <Text style={styles.label}>Salary Period:</Text>
                <Text style={styles.value}>{product.post_details?.salary_period || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={styles.label}>Position Type:</Text>
                <Text style={styles.value}>{product.post_details?.position_type || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={styles.label}>Salary Range:</Text>
                <Text style={styles.value}>
                    {product.post_details?.salary_from && product.post_details?.salary_to
                        ? `$${product.post_details.salary_from} - $${product.post_details.salary_to}`
                        : 'N/A'}
                </Text>
            </View>

            {/* Job Description */}
            <View style={styles.descriptionContainer}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.description}>
                    {product.post_details?.description || 'No description available'}
                </Text>
            </View>
        </View>
    );
};

export default Job;
