import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const HouseApartment = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    const propertyDetails = [
        { label: 'Property Type', value: product.post_details?.propety_type, icon: 'home' },
        { label: 'Bedrooms', value: product.post_details?.bedrooms, icon: 'bed' },
        { label: 'Furnishing', value: product.post_details?.furnishing, icon: 'sofa' },
        { label: 'Construction Status', value: product.post_details?.construction_status, icon: 'home-edit' },
        { label: 'Listed By', value: product.post_details?.listed_by, icon: 'account' },
        { label: 'Super Built-up Area', value: product.post_details?.super_builtup_area, icon: 'floor-plan' },
        { label: 'Carpet Area', value: product.post_details?.carpet_area, icon: 'tape-measure' },
        { label: 'Monthly Maintenance', value: product.post_details?.monthly_maintenance, icon: 'cash' },
        { label: 'Total Floors', value: product.post_details?.total_floors, icon: 'office-building' },
        { label: 'Floor No', value: product.post_details?.floor_no, icon: 'stairs' },
        { label: 'Car Parking', value: product.post_details?.car_parking, icon: 'car' },
        { label: 'Facing', value: product.post_details?.facing, icon: 'compass' },
        { label: 'Project Name', value: product.post_details?.project_name, icon: 'domain' }
    ].filter(item => item.value);

    const isSingleItem = propertyDetails.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {propertyDetails.map((detail, index) => (
                    <View
                        key={index}
                        style={[
                            styles.detailItem,
                            isSingleItem && styles.fullWidthItem
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <Icon name={detail.icon} size={16} color="#666" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{detail.label}</Text>
                            <Text style={styles.value}>
                                {detail.value}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default HouseApartment;