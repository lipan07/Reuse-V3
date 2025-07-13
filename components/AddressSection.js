import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../assets/css/ProductDetailsPage.styles';

const AddressSection = ({ address, handleMapPress }) => {
    const bounceAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const bounce = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bounceAnim, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bounceAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        bounce();
    }, [bounceAnim]);

    return (
        <TouchableOpacity
            style={styles.addressContainer}
            onPress={handleMapPress}
        >
            <View style={styles.addressRow}>
                <Text style={styles.addressHeader}>Address: </Text>
                <Text
                    style={styles.addressText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {"Agarpara, Kolkata-700109"}
                </Text>
                <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                    <Icon name="map-marker" size={24} color="#007bff" style={styles.mapIcon} />
                </Animated.View>
            </View>
        </TouchableOpacity>
    );
};

export default AddressSection;