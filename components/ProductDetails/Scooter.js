import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useFollowPost from '../../hooks/useFollowPost';
import styles from '../../assets/css/productDetailsCard.styles';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const Scooter = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Scooter details are not available.</Text>;
    }

    const scooterDetails = [
        { label: 'Brand', value: product.post_details?.brand, icon: 'scooter', highlight: false },
        { label: 'Model', value: product.post_details?.model, icon: 'tag', highlight: false },
        { label: 'Year', value: product.post_details?.year, icon: 'calendar', highlight: false },
        {
            label: 'KM Driven', value: product.post_details?.km_driven, icon: 'speedometer',
            highlight: parseInt(product.post_details?.km_driven) < 1000
        },
        {
            label: 'Battery', value: product.post_details?.battery_type, icon: 'battery',
            highlight: product.post_details?.battery_type === 'Lithium'
        },
        {
            label: 'Range', value: `${product.post_details?.range} km`, icon: 'map-marker-distance',
            highlight: parseInt(product.post_details?.range) > 80
        },
        {
            label: 'Condition', value: product.post_details?.condition, icon: 'checkbox-marked-circle-outline',
            highlight: product.post_details?.condition === 'Excellent'
        },
        { label: 'Color', value: product.post_details?.color, icon: 'palette', highlight: false }
    ].filter(item => item.value);

    const isSingleItem = scooterDetails.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {scooterDetails.map((detail, index) => (
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
                                    detail.highlight ? '#4CAF50' : '#666'
                                }
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{detail.label}</Text>
                            <Text style={[
                                styles.value,
                                detail.highlight && styles.highlightValue
                            ]}>
                                {detail.value}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {product.post_details?.features && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Key Features</Text>
                    <Text style={styles.descriptionText}>
                        {product.post_details.features}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default Scooter;