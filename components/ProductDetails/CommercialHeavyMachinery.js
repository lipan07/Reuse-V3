import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useFollowPost from '../../hooks/useFollowPost';
import styles from '../../assets/css/productDetailsCard.styles';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const CommercialHeavyMachinery = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Machinery details are not available.</Text>;
    }

    const machineryDetails = [
        { label: 'Brand', value: product.post_details?.brand, icon: 'robot-industrial' },
        { label: 'Model', value: product.post_details?.model, icon: 'tag' },
        { label: 'Year', value: product.post_details?.year, icon: 'calendar' },
        { label: 'Hours', value: product.post_details?.hours, icon: 'clock' },
        { label: 'Condition', value: product.post_details?.condition, icon: 'checkbox-marked-circle-outline' },
        { label: 'Fuel Type', value: product.post_details?.fuel, icon: 'fuel' },
        { label: 'Weight', value: product.post_details?.weight, icon: 'weight' },
        { label: 'Dimensions', value: product.post_details?.dimensions, icon: 'ruler' },
        { label: 'Owners', value: product.post_details?.no_of_owner, icon: 'account-multiple' },
        { label: 'Location', value: product.post_details?.location, icon: 'map-marker' }
    ].filter(item => item.value);

    const contactDetails = [
        { label: 'Listed By', value: product.post_details?.listed_by, icon: 'account' },
        { label: 'Contact', value: product.post_details?.contact_name, icon: 'card-account-phone' },
        { label: 'Phone', value: product.post_details?.contact_phone, icon: 'phone' }
    ].filter(item => item.value);

    // Check if there's only one machinery detail
    const isSingleMachineryDetail = machineryDetails.length === 1;

    return (
        <View style={styles.container}>
            {/* Machinery Details Section */}
            <View style={[
                styles.gridContainer,
                isSingleMachineryDetail && styles.fullWidthContainer
            ]}>
                {machineryDetails.map((item, index) => (
                    <View
                        key={`machine-${index}`}
                        style={[
                            styles.detailItem,
                            isSingleMachineryDetail && styles.fullWidthItem
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <Icon
                                name={item.icon}
                                size={normalize(16)}
                                color={
                                    item.label === 'Condition' && item.value === 'Excellent' ? '#4CAF50' :
                                        item.label === 'Hours' && parseInt(item.value) < 2000 ? '#FF9800' : '#666'
                                }
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{item.label}</Text>
                            <Text style={[
                                styles.value,
                                item.label === 'Condition' && item.value === 'Excellent' && styles.highlightValue,
                                item.label === 'Hours' && parseInt(item.value) < 2000 && styles.highlightValue
                            ]}>
                                {item.value}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Contact Information Section */}
            {contactDetails.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <View style={[
                        styles.contactGrid,
                        contactDetails.length === 1 && styles.fullWidthContainer
                    ]}>
                        {contactDetails.map((item, index) => (
                            <View
                                key={`contact-${index}`}
                                style={[
                                    styles.contactItem,
                                    contactDetails.length === 1 && styles.fullWidthItem
                                ]}
                            >
                                <View style={styles.iconContainer}>
                                    <Icon name={item.icon} size={normalize(16)} color="#1976d2" />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.label}>{item.label}</Text>
                                    <Text style={[
                                        styles.value,
                                        item.label === 'Phone' && styles.phoneText
                                    ]}>
                                        {item.value}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Key Features Section */}
            {product.post_details?.features && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Key Features</Text>
                    <Text style={styles.featuresText}>
                        {product.post_details.features}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default CommercialHeavyMachinery;