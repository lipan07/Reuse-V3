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
            value !== ''
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
            default: 'information'
        };
        return iconMap[fieldName] || iconMap.default;
    }

    const isSingleItem = productDetails.length === 1;

    return (
        <View style={styles.container}>
            {productDetails.length > 0 ? (
                <View style={[
                    styles.gridContainer,
                    isSingleItem && styles.fullWidthContainer
                ]}>
                    {productDetails.map((detail, index) => (
                        <View
                            key={index}
                            style={[
                                styles.detailItem,
                                isSingleItem && styles.fullWidthItem
                            ]}
                        >
                            <View style={styles.iconContainer}>
                                <Icon
                                    name={detail.icon}
                                    size={normalize(16)}
                                    color={
                                        detail.label.toLowerCase().includes('price') ? '#4CAF50' : '#666'
                                    }
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.label}>{detail.label}</Text>
                                <Text style={[
                                    styles.value,
                                    detail.label.toLowerCase().includes('price') && styles.highlightValue
                                ]}>
                                    {detail.value.toString()}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={styles.noDetailsText}>No detailed information available</Text>
            )}
        </View>
    );
};

export default Others;