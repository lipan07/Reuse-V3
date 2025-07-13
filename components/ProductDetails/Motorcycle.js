import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const Motorcycle = ({ product }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product); // Use the hook

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Product details are not available.</Text>;
    }

    return (
        <View style={styles.container}>
            {/* Header with Product Title & Follow Icon */}
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

            {/* Product Details */}
            <View style={styles.detailRow}>
                <Text style={styles.label}>Brand:</Text>
                <Text style={styles.value}>{product.post_details?.brand || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={styles.label}>Year:</Text>
                <Text style={styles.value}>{product.post_details?.year || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={styles.label}>KM Driven:</Text>
                <Text style={styles.value}>{product.post_details?.km_driven || 'N/A'}</Text>
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

export default Motorcycle;
