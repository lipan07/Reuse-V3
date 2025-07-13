import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const PgGuestHouse = ({ product }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product); // Use the hook

    return (
        <View style={styles.container}>
            {/* Header with Title and Follow Icon */}
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

            {/* PG Guest House Details */}
            <View style={styles.detailsContainer}>
                {renderDetailRow('PG Type', product.post_details?.pg_type)}
                {renderDetailRow('Furnishing', product.post_details?.furnishing)}
                {renderDetailRow('Listed By', product.post_details?.listed_by)}
                {renderDetailRow('Carpet Area', product.post_details?.carpet_area)}
                {renderDetailRow('Meal Included', product.post_details?.meal_included)}
                {renderDetailRow('Car Parking', product.post_details?.car_parking)}
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.description}>{product.post_details?.description || 'No description available'}</Text>
            </View>

            {/* Price */}
            <Text style={styles.price}>Price: ${product.post_details?.amount || 'N/A'}</Text>
        </View>
    );
};

/** Reusable function to render detail rows */
const renderDetailRow = (label, value) => (
    <View style={styles.detailRow}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
);

export default PgGuestHouse;
