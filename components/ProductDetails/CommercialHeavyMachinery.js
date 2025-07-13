import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const CommercialHeavyMachinery = ({ product }) => {
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

            {/* Machinery Details */}
            <View style={styles.detailsContainer}>
                {renderDetailRow('Brand', product.post_details?.brand)}
                {renderDetailRow('Model Year', product.post_details?.year)}
                {renderDetailRow('Condition', product.post_details?.condition)}
                {renderDetailRow('Fuel Type', product.post_details?.fuel)}
                {renderDetailRow('Owner', product.post_details?.owner)}
                {renderDetailRow('KM Driven', product.post_details?.km_driven)}
                {renderDetailRow('No. of Owners', product.post_details?.no_of_owner)}
                {renderDetailRow('Listed By', product.post_details?.listed_by)}
                {renderDetailRow('Contact Name', product.post_details?.contact_name)}
                {renderDetailRow('Contact Phone', product.post_details?.contact_phone)}
            </View>

            {/* Description Section */}
            <View style={styles.descriptionContainer}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.description}>{product.post_details?.description || 'No description available'}</Text>
            </View>

            {/* Price Display */}
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

export default CommercialHeavyMachinery;
