import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const Others = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Product details are not available.</Text>;
    }

    // Flexible details display for miscellaneous products
    const productDetails = Object.entries(product.post_details)
        .filter(([key, value]) =>
            key !== 'id' &&
            key !== 'post_id' &&
            key !== 'amount' &&
            key !== 'description' &&
            key !== 'created_at' &&
            key !== 'updated_at' &&
            value !== null &&
            value !== '' &&
            value !== undefined &&
            typeof value !== 'object'
        )
        .map(([key, value]) => ({
            label: key.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            value: value,
            icon: getIconForField(key)
        }));

    function getIconForField(fieldName) {
        const iconMap = {
            condition: 'checkbox-marked-circle-outline',
            price: 'cash',
            color: 'palette',
            material: 'cube',
            size: 'ruler',
            weight: 'weight',
            quantity: 'numeric',
            location: 'map-marker',
            contact: 'phone',
            brand: 'tag',
            model: 'tag-outline',
            year: 'calendar',
            mileage: 'speedometer',
            fuel: 'fuel',
            transmission: 'cog',
            engine: 'engine',
            power: 'lightning-bolt',
            capacity: 'cube-outline',
            warranty: 'shield-check',
            features: 'star',
            accessories: 'package-variant',
            status: 'check-circle',
            availability: 'clock',
            delivery: 'truck-delivery',
            payment: 'credit-card',
            negotiable: 'handshake',
            urgent: 'alert',
            verified: 'check-decagram',
            default: 'tag'
        };
        return iconMap[fieldName] || iconMap.default;
    }

    // Don't show if only one item (as requested)
    if (productDetails.length <= 1) {
        return null;
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.othersGrid}>
                {productDetails.map((detail, index) => (
                    <View key={index} style={styles.othersItem}>
                        <View style={styles.othersIconContainer}>
                            <Icon
                                name={detail.icon}
                                size={normalize(14)}
                                color={getIconColor(detail.label || '')}
                            />
                        </View>
                        <View style={styles.othersTextContainer}>
                            <Text style={styles.othersLabel}>{detail.label || 'Unknown'}</Text>
                            <Text style={[
                                styles.othersValue,
                                detail.label && detail.label.toLowerCase().includes('price') && styles.othersHighlightValue
                            ]}>
                                {detail.value ? detail.value.toString() : 'N/A'}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    function getIconColor(label) {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('price') || lowerLabel.includes('amount')) return '#4CAF50';
        if (lowerLabel.includes('condition') || lowerLabel.includes('status')) return '#2196F3';
        if (lowerLabel.includes('brand') || lowerLabel.includes('model')) return '#FF9800';
        if (lowerLabel.includes('year') || lowerLabel.includes('mileage')) return '#9C27B0';
        if (lowerLabel.includes('warranty') || lowerLabel.includes('verified')) return '#4CAF50';
        return '#666';
    }
};

export default Others;