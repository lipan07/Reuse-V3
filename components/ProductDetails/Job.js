import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const Job = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Job details are not available.</Text>;
    }

    const jobDetails = [
        {
            label: 'Salary Period',
            value: product.post_details?.salary_period,
            icon: 'calendar'
        },
        {
            label: 'Position Type',
            value: product.post_details?.position_type,
            icon: 'briefcase'
        },
        {
            label: 'Salary Range',
            value: product.post_details?.salary_from && product.post_details?.salary_to
                ? `$${product.post_details.salary_from} - $${product.post_details.salary_to}`
                : null,
            icon: 'cash'
        }
    ].filter(item => item.value);

    const isSingleItem = jobDetails.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {jobDetails.map((detail, index) => (
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

export default Job;