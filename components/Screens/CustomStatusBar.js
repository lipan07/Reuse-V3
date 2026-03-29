import React from 'react';
import { View, StatusBar as RNStatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * App status bar + optional top color strip when translucent (e.g. blue header under status bar).
 * Uses safe-area insets so height matches notched devices; no fixed 20/24px guess.
 */
const CustomStatusBar = ({
    backgroundColor = '#007BFF',
    barStyle = 'light-content',
    translucent = true,
    darkMode = false,
}) => {
    const insets = useSafeAreaInsets();
    const bg = darkMode ? '#1A1A1A' : backgroundColor;

    const androidBar = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) : 0;
    const topOverlayHeight =
        Platform.OS === 'ios'
            ? insets.top
            : translucent
              ? Math.max(insets.top, androidBar)
              : androidBar;

    return (
        <>
            <RNStatusBar
                backgroundColor={bg}
                barStyle={darkMode ? 'light-content' : barStyle}
                translucent={translucent}
            />
            {translucent && topOverlayHeight > 0 ? (
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: topOverlayHeight,
                        backgroundColor: bg,
                        zIndex: 1,
                    }}
                />
            ) : null}
        </>
    );
};

export default CustomStatusBar;
