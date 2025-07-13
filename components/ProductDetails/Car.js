import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost'; // Import the hook

const Car = ({ product }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product); // Use the hook

    return (
        <View style={styles.container}>
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

            {/* Car Details */}
            <View style={styles.detailsContainer}>
                {renderDetailRow('Brand', product.post_details?.brand)}
                {renderDetailRow('Model Year', product.post_details?.year)}
                {renderDetailRow('Fuel Type', product.post_details?.fuel)}
                {renderDetailRow('Transmission', product.post_details?.transmission)}
                {renderDetailRow('KM Driven', product.post_details?.km_driven)}
                {renderDetailRow('Owner', product.post_details?.no_of_owner)}
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

export default Car;
