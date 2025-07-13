import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../assets/css/productDetailsCard.styles';
import useFollowPost from '../../hooks/useFollowPost';

const LandPlot = ({ product }) => {
    const { isFollowed, toggleFollow } = useFollowPost(product); // Use the hook

    return (
        <View style={styles.container}>
            {/* Header with Title and Follow Icon */}
            <View style={styles.header}>
                <Text style={styles.productTitle}>{product.title || 'No Title'}</Text>
                <TouchableOpacity onPress={toggleFollow}>
                    <Icon
                        name={isFollowed ? 'heart' : 'heart-outline'}
                        size={30}
                        color={isFollowed ? 'red' : 'gray'}
                    />
                </TouchableOpacity>
            </View>

            {/* Property Details in a bordered box */}
            <View style={styles.detailsContainer}>
                {renderDetailRow('Listed By', product.post_details?.listed_by)}
                {renderDetailRow('Carpet Area', product.post_details?.carpet_area)}
                {renderDetailRow('Length', product.post_details?.length)}
                {renderDetailRow('Breadth', product.post_details?.breadth)}
                {renderDetailRow('Facing', product.post_details?.facing)}
                {renderDetailRow('Project Name', product.post_details?.project_name)}
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.description}>{product.post_details?.description || 'N/A'}</Text>
            </View>

            {/* Price */}
            <Text style={styles.price}>Price: ${product.post_details?.amount || 'N/A'}</Text>
        </View>
    );
};

/** Helper function to render property details */
const renderDetailRow = (label, value) => (
    <View style={styles.detailRow}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
);

export default LandPlot;
