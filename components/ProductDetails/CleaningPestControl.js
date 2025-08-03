import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useFollowPost from '../../hooks/useFollowPost';
import styles from '../../assets/css/productDetailsCard.styles';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const CleaningPestControl = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Service details are not available.</Text>;
    }

    const serviceDetails = [
        { label: 'Service Type', value: product.post_details?.type, icon: 'broom' },
        { label: 'Service Area', value: product.post_details?.area, icon: 'floor-plan' },
        { label: 'Frequency', value: product.post_details?.frequency, icon: 'calendar-sync' },
        { label: 'Experience', value: product.post_details?.experience, icon: 'chart-line' },
        { label: 'Certification', value: product.post_details?.certification, icon: 'certificate' },
        { label: 'Equipment', value: product.post_details?.equipment, icon: 'tools' }
    ].filter(item => item.value);

    const pestControlDetails = product.post_details?.pest_type ? [
        { label: 'Pest Type', value: product.post_details?.pest_type, icon: 'bug' },
        { label: 'Treatment', value: product.post_details?.treatment, icon: 'spray' },
        { label: 'Guarantee', value: product.post_details?.guarantee, icon: 'shield-check' }
    ].filter(item => item.value) : [];

    // Combine all details to check if there's only one item
    const allDetails = [...serviceDetails, ...pestControlDetails];
    const isSingleItem = allDetails.length === 1;

    return (
        <View style={styles.container}>
            <View style={[
                styles.gridContainer,
                isSingleItem && styles.fullWidthContainer
            ]}>
                {serviceDetails.map((item, index) => (
                    <View
                        key={`service-${index}`}
                        style={[
                            styles.detailItem,
                            isSingleItem && styles.fullWidthItem
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <Icon name={item.icon} size={normalize(16)} color="#666" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{item.label}</Text>
                            <Text style={[
                                styles.value,
                                item.label === 'Experience' && parseInt(item.value) > 5 && styles.highlightValue,
                                item.label === 'Certification' && styles.highlightValue
                            ]}>
                                {item.value}
                            </Text>
                        </View>
                    </View>
                ))}

                {pestControlDetails.map((item, index) => (
                    <View
                        key={`pest-${index}`}
                        style={[
                            styles.detailItem,
                            styles.pestControlItem,
                            isSingleItem && styles.fullWidthItem
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <Icon name={item.icon} size={normalize(16)} color="#8e24aa" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{item.label}</Text>
                            <Text style={[
                                styles.value,
                                item.label === 'Guarantee' && styles.highlightValue
                            ]}>
                                {item.value}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default CleaningPestControl;