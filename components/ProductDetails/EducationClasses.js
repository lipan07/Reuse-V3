import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useFollowPost from '../../hooks/useFollowPost';
import styles from '../../assets/css/productDetailsCard.styles';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const EducationClasses = ({ product, buyerId }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product);

    if (!product?.post_details) {
        return <Text style={styles.errorText}>Education details are not available.</Text>;
    }

    const classDetails = [
        { label: 'Type', value: product.post_details?.type, icon: 'school' },
        { label: 'Subject', value: product.post_details?.subject, icon: 'book-open' },
        { label: 'Level', value: product.post_details?.level, icon: 'chart-bar' },
        { label: 'Mode', value: product.post_details?.mode, icon: 'monitor' },
        { label: 'Duration', value: product.post_details?.duration, icon: 'clock' },
        { label: 'Schedule', value: product.post_details?.schedule, icon: 'calendar' },
        { label: 'Batch Size', value: product.post_details?.batch_size, icon: 'account-group' },
        { label: 'Language', value: product.post_details?.language, icon: 'translate' }
    ].filter(item => item.value);

    const instructorDetails = [
        { label: 'Instructor', value: product.post_details?.instructor, icon: 'account-tie' },
        { label: 'Qualification', value: product.post_details?.qualification, icon: 'certificate' },
        { label: 'Experience', value: product.post_details?.experience, icon: 'chart-line' }
    ].filter(item => item.value);

    // Check for single item cases
    const isSingleClassDetail = classDetails.length === 1;
    const isSingleInstructorDetail = instructorDetails.length === 1;

    const handleContactPress = () => {
        if (product.post_details?.contact) {
            Linking.openURL(`tel:${product.post_details.contact}`);
        }
    };

    return (
        <View style={styles.container}>
            {/* Class Details Section */}
            <View style={[
                styles.gridContainer,
                isSingleClassDetail && styles.fullWidthContainer
            ]}>
                {classDetails.map((item, index) => (
                    <View
                        key={`class-${index}`}
                        style={[
                            styles.detailItem,
                            isSingleClassDetail && styles.fullWidthItem
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <Icon
                                name={item.icon}
                                size={normalize(16)}
                                color={
                                    item.label === 'Level' && item.value === 'Advanced' ? '#4CAF50' :
                                        item.label === 'Mode' && item.value === 'Online' ? '#2196F3' : '#666'
                                }
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>{item.label}</Text>
                            <Text style={[
                                styles.value,
                                item.label === 'Level' && item.value === 'Advanced' && styles.highlightValue,
                                item.label === 'Mode' && item.value === 'Online' && styles.highlightValue
                            ]}>
                                {item.value}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Instructor Details Section */}
            {instructorDetails.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Instructor Details</Text>
                    <View style={[
                        styles.instructorGrid,
                        isSingleInstructorDetail && styles.fullWidthContainer
                    ]}>
                        {instructorDetails.map((item, index) => (
                            <View
                                key={`instructor-${index}`}
                                style={[
                                    styles.detailItem,
                                    isSingleInstructorDetail && styles.fullWidthItem,
                                    styles.instructorItem
                                ]}
                            >
                                <View style={styles.iconContainer}>
                                    <Icon
                                        name={item.icon}
                                        size={normalize(16)}
                                        color="#5c6bc0"
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.label}>{item.label}</Text>
                                    <Text style={[
                                        styles.value,
                                        item.label === 'Experience' && parseInt(item.value) > 5 && styles.highlightValue,
                                        item.label === 'Qualification' && styles.highlightValue
                                    ]}>
                                        {item.value}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Course Syllabus Section */}
            {product.post_details?.syllabus && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Course Syllabus</Text>
                    <Text style={styles.descriptionText}>
                        {product.post_details.syllabus}
                    </Text>
                </View>
            )}

            {/* Contact Button */}
            {product.post_details?.contact && (
                <TouchableOpacity
                    style={styles.contactButton}
                    onPress={handleContactPress}
                    activeOpacity={0.8}
                >
                    <Icon name="phone" size={normalize(18)} color="#fff" style={styles.contactIcon} />
                    <Text style={styles.contactButtonText}>Contact Instructor</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default EducationClasses;