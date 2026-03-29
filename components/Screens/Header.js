// components/Screens/Header.js – simple back + title header for secondary screens
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { buildHeaderStyles } from '../../assets/css/Header.styles';

const Header = ({ title, navigation, darkMode = false }) => {
    const { width, height } = useWindowDimensions();
    const { styles, nf } = useMemo(
        () => buildHeaderStyles(width, height),
        [width, height]
    );

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
                        size={nf(18)}
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
