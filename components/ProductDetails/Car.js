import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';

// Responsive scaling
const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const Car = ({ product, buyerId }) => {
    const details = [
        { label: 'Brand', value: product.post_details?.brand, icon: 'car' },
        { label: 'Model Year', value: product.post_details?.year, icon: 'calendar' },
        { label: 'Fuel Type', value: product.post_details?.fuel, icon: 'fuel' },
        { label: 'Transmission', value: product.post_details?.transmission, icon: 'cog' },
        { label: 'KM Driven', value: product.post_details?.km_driven, icon: 'speedometer' },
        { label: 'Owner', value: product.post_details?.no_of_owner, icon: 'account' }
    ].filter(item => item.value); // Filter out empty values

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
                                item.label === 'KM Driven' && parseInt(item.value) < 50000 && styles.highlightValue,
                                item.label === 'Owner' && item.value === '1' && styles.highlightValue
                            ]}>
                                {item.value || 'N/A'}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default Car;