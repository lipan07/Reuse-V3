import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const LandPlot = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Land plot details are not available.</Text>;
    }

    const plotDetails = [
        { label: 'Listed By', value: product.post_details?.listed_by, icon: 'account' },
        { label: 'Carpet Area', value: product.post_details?.carpet_area, icon: 'floor-plan' },
        { label: 'Length', value: product.post_details?.length, icon: 'ruler' },
        { label: 'Breadth', value: product.post_details?.breadth, icon: 'ruler-square' },
        { label: 'Facing', value: product.post_details?.facing, icon: 'compass' },
        { label: 'Project Name', value: product.post_details?.project_name, icon: 'domain' }
    ].filter(item => item.value);

    const isSingleItem = plotDetails.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {plotDetails.map((detail, index) => (
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

export default LandPlot;