import React from 'react';
import { View, StatusBar as RNStatusBar, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const CustomStatusBar = ({
    backgroundColor = '#007BFF',
    barStyle = 'light-content',
    translucent = true,
    darkMode = false
}) => {
    const statusBarHeight = RNStatusBar.currentHeight || (Platform.OS === 'ios' ? 20 : 24);

    return (
        <>
            <RNStatusBar
                backgroundColor={darkMode ? '#1A1A1A' : backgroundColor}
                barStyle={darkMode ? "light-content" : barStyle}
                translucent={translucent}
            />
            {translucent && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: statusBarHeight,
                    backgroundColor: darkMode ? '#1A1A1A' : backgroundColor,
                    zIndex: 1,
                }} />
            )}
        </>
    );
};

export default CustomStatusBar;