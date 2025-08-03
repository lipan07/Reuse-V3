import React from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const Electronics = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Product details are not available.</Text>;
    }

    // Common electronic product details with icons
    const productDetails = [
        { label: 'Type', value: product.post_details?.type, icon: 'devices' },
        { label: 'Brand', value: product.post_details?.brand, icon: 'tag' },
        { label: 'Model', value: product.post_details?.model, icon: 'chip' },
        { label: 'Condition', value: product.post_details?.condition, icon: 'checkbox-marked-circle-outline' },
        { label: 'Age', value: product.post_details?.age, icon: 'calendar' },
        { label: 'Warranty', value: product.post_details?.warranty, icon: 'shield-check' },
        { label: 'Color', value: product.post_details?.color, icon: 'palette' },
        { label: 'Storage', value: product.post_details?.storage, icon: 'database' }
    ].filter(item => item.value); // Only show fields with values

    // Check if there's only one detail to show
    const isSingleItem = productDetails.length === 1;

    return (
        <View style={styles.container}>
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
                                    detail.label === 'Condition' && detail.value === 'New' ? '#4CAF50' :
                                        detail.label === 'Warranty' && detail.value !== 'Expired' ? '#2196F3' : '#666'
                                }
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{detail.label}</Text>
                            <Text style={[
                                styles.value,
                                detail.label === 'Condition' && detail.value === 'New' && styles.highlightValue,
                                detail.label === 'Warranty' && detail.value !== 'Expired' && styles.highlightValue
                            ]}>
                                {detail.value}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Additional Features Section */}
            {product.post_details?.features && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Key Features</Text>
                    <Text style={styles.featuresText}>
                        {product.post_details.features}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default Electronics;