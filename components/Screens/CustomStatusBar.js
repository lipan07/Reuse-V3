import React from 'react';
import { StatusBar, Platform } from 'react-native';

const CustomStatusBar = ({ backgroundColor = '#007BFF', barStyle = 'light-content' }) => (
    <StatusBar
        backgroundColor={backgroundColor}
        barStyle={barStyle}
        translucent={Platform.OS === 'android'}
    />
);

export default CustomStatusBar;