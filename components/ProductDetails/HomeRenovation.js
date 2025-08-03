import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const HomeRenovation = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Home renovation details are not available.</Text>;
    }

    const renovationDetails = [
        { label: 'Type', value: product.post_details?.type, icon: 'home-renovate' },
        { label: 'Service Area', value: product.post_details?.area, icon: 'floor-plan' },
        { label: 'Duration', value: product.post_details?.duration, icon: 'clock' },
        { label: 'Materials', value: product.post_details?.materials, icon: 'hammer-wrench' },
        { label: 'Experience', value: product.post_details?.experience, icon: 'chart-line' },
        { label: 'License', value: product.post_details?.license, icon: 'certificate' },
        { label: 'Workers', value: product.post_details?.workers, icon: 'account-group' },
        { label: 'Guarantee', value: product.post_details?.guarantee, icon: 'shield-check' }
    ].filter(item => item.value);

    const isSingleItem = renovationDetails.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {renovationDetails.map((detail, index) => (
                    <View
                        key={index}
                        style={[
                            styles.detailItem,
                            isSingleItem && styles.fullWidthItem,
                            styles.renovationItem
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <Icon
                                name={detail.icon}
                                size={normalize(16)}
                                color={
                                    detail.label === 'License' && detail.value === 'Yes' ? '#4CAF50' :
                                        detail.label === 'Experience' && parseInt(detail.value) > 5 ? '#FF9800' : '#666'
                                }
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{detail.label}</Text>
                            <Text style={[
                                styles.value,
                                detail.label === 'License' && detail.value === 'Yes' && styles.highlightValue,
                                detail.label === 'Experience' && parseInt(detail.value) > 5 && styles.highlightValue,
                                detail.label === 'Guarantee' && styles.highlightValue
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

export default HomeRenovation;