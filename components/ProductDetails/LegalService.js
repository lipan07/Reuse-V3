import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const LegalService = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Legal service details are not available.</Text>;
    }

    const serviceDetails = [
        { label: 'Service Type', value: product.post_details?.type, icon: 'scale-balance' },
        { label: 'Specialization', value: product.post_details?.specialization, icon: 'book-multiple' },
        { label: 'Experience', value: product.post_details?.experience, icon: 'chart-line' },
        { label: 'Languages', value: product.post_details?.languages, icon: 'translate' },
        { label: 'Consultation Fee', value: product.post_details?.fee, icon: 'cash' },
        { label: 'Availability', value: product.post_details?.availability, icon: 'calendar-clock' }
    ].filter(item => item.value);

    const isSingleItem = serviceDetails.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {serviceDetails.map((detail, index) => (
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
                                    detail.label === 'Consultation Fee' ? '#4CAF50' : '#666'
                                }
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{detail.label}</Text>
                            <Text style={[
                                styles.value,
                                detail.label === 'Experience' && parseInt(detail.value) > 10 && styles.highlightValue,
                                detail.label === 'Consultation Fee' && styles.serviceHighlight
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

export default LegalService;