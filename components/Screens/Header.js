// components/Screens/Header.js – simple back + title header for secondary screens
import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import styles from '../../assets/css/Header.styles';

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
                <Text style={[styles.title, darkMode && styles.darkTitle]} numberOfLines={1}>
                    {title}
                </Text>
            </View>
        </View>
    );
};

export default Header;