import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const ToursTravel = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Tour details are not available.</Text>;
    }

    const tourDetails = [
        { label: 'Tour Type', value: product.post_details?.type, icon: 'airplane' },
        { label: 'Destination', value: product.post_details?.destination, icon: 'map-marker' },
        { label: 'Duration', value: product.post_details?.duration, icon: 'clock' },
        { label: 'Group Size', value: product.post_details?.group_size, icon: 'account-group' },
        { label: 'Includes', value: product.post_details?.includes, icon: 'check-circle' },
        { label: 'Departure Date', value: product.post_details?.departure_date, icon: 'calendar' },
        { label: 'Price', value: product.post_details?.price, icon: 'cash' },
        { label: 'Language', value: product.post_details?.language, icon: 'translate' }
    ].filter(item => item.value);

    const isSingleItem = tourDetails.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {tourDetails.map((detail, index) => (
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
                                color={detail.label === 'Price' ? '#4CAF50' : '#666'}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{detail.label}</Text>
                            <Text style={[
                                styles.value,
                                detail.label === 'Price' && styles.highlightValue
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

export default ToursTravel;