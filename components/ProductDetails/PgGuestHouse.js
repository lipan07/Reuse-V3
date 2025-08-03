import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const PgGuestHouse = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>PG/Guest House details are not available.</Text>;
    }

    const pgDetails = [
        { label: 'PG Type', value: product.post_details?.pg_type, icon: 'home-group' },
        { label: 'Furnishing', value: product.post_details?.furnishing, icon: 'sofa' },
        { label: 'Listed By', value: product.post_details?.listed_by, icon: 'account' },
        { label: 'Carpet Area', value: product.post_details?.carpet_area, icon: 'floor-plan' },
        { label: 'Meal Included', value: product.post_details?.meal_included, icon: 'food' },
        { label: 'Car Parking', value: product.post_details?.car_parking, icon: 'car' },
        { label: 'Occupancy', value: product.post_details?.occupancy, icon: 'account-multiple' },
        { label: 'Bathroom Type', value: product.post_details?.bathroom_type, icon: 'shower' }
    ].filter(item => item.value);

    const isSingleItem = pgDetails.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {pgDetails.map((detail, index) => (
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
                                    detail.label === 'Meal Included' && detail.value === 'Yes' ? '#4CAF50' :
                                        detail.label === 'Furnishing' && detail.value === 'Fully Furnished' ? '#FF9800' : '#666'
                                }
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{detail.label}</Text>
                            <Text style={[
                                styles.value,
                                detail.label === 'Meal Included' && detail.value === 'Yes' && styles.highlightValue,
                                detail.label === 'Furnishing' && detail.value === 'Fully Furnished' && styles.highlightValue
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

export default PgGuestHouse;