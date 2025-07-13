import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const HouseApartment = ({ product }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product); // Use the hook

    return (
        <View style={styles.container}>
            {/* Header with Follow Icon */}
            <View style={styles.header}>
                <Text style={styles.productTitle}>{product.title}</Text>
                <TouchableOpacity onPress={toggleFollow}>
                    <Icon name={isFollowed ? 'heart' : 'heart-outline'} size={30} color={isFollowed ? 'red' : 'gray'} />
                </TouchableOpacity>
            </View>

            {/* Property Details */}
            <View style={styles.detailsContainer}>
                {renderDetailRow('Property Type', product.post_details.propety_type)}
                {renderDetailRow('Bedroom', product.post_details.bedrooms)}
                {renderDetailRow('Furnishing', product.post_details.furnishing)}
                {renderDetailRow('Construction Status', product.post_details.construction_status)}
                {renderDetailRow('Listed By', product.post_details.listed_by)}
                {renderDetailRow('Super Built-up Area', product.post_details.super_builtup_area)}
                {renderDetailRow('Carpet Area', product.post_details.carpet_area)}
                {renderDetailRow('Monthly Maintenance', product.post_details.monthly_maintenance)}
                {renderDetailRow('Total Floor', product.post_details.total_floors)}
                {renderDetailRow('Floor No', product.post_details.floor_no)}
                {renderDetailRow('Car Parking', product.post_details.car_parking)}
                {renderDetailRow('Facing', product.post_details.facing)}
                {renderDetailRow('Project Name', product.post_details.project_name)}
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.description}>{product.post_details.description || 'N/A'}</Text>
            </View>

            {/* Price */}
            <Text style={styles.price}>Price: ${product.post_details.amount || 'N/A'}</Text>
        </View>
    );
};

/** Helper function to render detail rows */
const renderDetailRow = (label, value) => (
    <View style={styles.detailRow}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
);

export default HouseApartment;
