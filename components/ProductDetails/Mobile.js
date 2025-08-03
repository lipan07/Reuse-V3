import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const Mobile = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Mobile details are not available.</Text>;
    }

    const mobileDetails = [
        { label: 'Brand', value: product.post_details?.brand, icon: 'cellphone' },
        { label: 'Model', value: product.post_details?.model, icon: 'tag' },
        { label: 'Year', value: product.post_details?.year, icon: 'calendar' },
        { label: 'RAM', value: product.post_details?.ram, icon: 'memory' },
        { label: 'Storage', value: product.post_details?.storage, icon: 'sd' },
        { label: 'Condition', value: product.post_details?.condition, icon: 'checkbox-marked-circle-outline' },
        { label: 'Battery Health', value: product.post_details?.battery_health, icon: 'battery' },
        { label: 'Warranty', value: product.post_details?.warranty, icon: 'shield-check' }
    ].filter(item => item.value);

    const isSingleItem = mobileDetails.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {mobileDetails.map((detail, index) => (
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
                                detail.label === 'Warranty' && detail.value !== 'Expired' && styles.highlightValue,
                                detail.label === 'Battery Health' && parseInt(detail.value) >= 90 && styles.highlightValue
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

export default Mobile;