import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useFollowPost from '../../hooks/useFollowPost';
import styles from '../../assets/css/productDetailsCard.styles';

// Add these scaling functions at the top of your component file
const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const Bicycle = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Bicycle details are not available.</Text>;
    }

    const details = [
        { label: 'Brand', value: product.post_details?.brand, icon: 'bike' },
        { label: 'Year', value: product.post_details?.year, icon: 'calendar' },
        { label: 'KM Driven', value: product.post_details?.km_driven, icon: 'speedometer' },
        { label: 'Condition', value: product.post_details?.condition, icon: 'checkbox-marked-circle-outline' },
        { label: 'Frame Size', value: product.post_details?.frame_size, icon: 'ruler' },
        { label: 'Bike Type', value: product.post_details?.bike_type, icon: 'bike-fast' }
    ].filter(item => item.value);

    // Check if there's only one item
    const isSingleItem = details.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {details.map((item, index) => (
                    <View key={index} style={[
                        styles.detailItem,
                        isSingleItem && styles.fullWidthItem
                    ]}>
                        <View style={styles.iconContainer}>
                            <Icon name={item.icon} size={normalize(16)} color="#666" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{item.label}</Text>
                            <Text style={[
                                styles.value,
                                item.label === 'KM Driven' && parseInt(item.value) < 1000 ? styles.highlightValue : null,
                                item.label === 'Condition' && item.value === 'Excellent' ? styles.highlightValue : null
                            ]}>
                                {item.value}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default Bicycle;