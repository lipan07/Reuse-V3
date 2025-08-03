import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const Motorcycle = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Motorcycle details are not available.</Text>;
    }

    const bikeDetails = [
        { label: 'Brand', value: product.post_details?.brand, icon: 'motorbike' },
        { label: 'Year', value: product.post_details?.year, icon: 'calendar' },
        { label: 'KM Driven', value: product.post_details?.km_driven, icon: 'speedometer' },
        { label: 'Engine CC', value: product.post_details?.engine_cc, icon: 'engine' },
        { label: 'Owner', value: product.post_details?.no_of_owner, icon: 'account' },
        { label: 'Color', value: product.post_details?.color, icon: 'palette' }
    ].filter(item => item.value);

    const isSingleItem = bikeDetails.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {bikeDetails.map((detail, index) => (
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
                                    detail.label === 'KM Driven' && parseInt(detail.value) < 10000 ? '#FF9800' :
                                        detail.label === 'Owner' && detail.value === '1st' ? '#4CAF50' : '#666'
                                }
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{detail.label}</Text>
                            <Text style={[
                                styles.value,
                                detail.label === 'KM Driven' && parseInt(detail.value) < 10000 && styles.highlightValue,
                                detail.label === 'Owner' && detail.value === '1st' && styles.highlightValue
                            ]}>
                                {detail.value}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default Motorcycle;