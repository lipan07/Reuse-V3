// components/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const Header = ({ title, navigation, darkMode = false }) => {
    return (
        <View style={[styles.headerContainer, darkMode && styles.darkHeaderContainer]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <FontAwesome5
                        name="arrow-left"
                        size={normalize(20)}
                        color={darkMode ? '#FFFFFF' : '#000000'}
                    />
                </TouchableOpacity>
                <Text style={[styles.title, darkMode && styles.darkTitle]}>{title}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#FFFFFF', // Pure white background for light mode
        paddingTop: Platform.OS === 'ios' ? normalize(44) : normalize(24),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F5F5F5', // Light gray border for light mode
    },
    darkHeaderContainer: {
        backgroundColor: '#1A1A1A', // Dark background for dark mode
        borderBottomColor: '#333333', // Darker border for dark mode
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(12),
    },
    backButton: {
        marginRight: normalize(15),
    },
    title: {
        fontSize: normalize(20),
        fontWeight: '600',
        color: '#000000', // Black text for light mode
    },
    darkTitle: {
        color: '#FFFFFF', // Pure white text for dark mode
    },
});

export default Header;