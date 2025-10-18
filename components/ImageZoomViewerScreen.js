import React from 'react';
import { View, TouchableOpacity, Text, StatusBar, Platform, StyleSheet } from 'react-native';
import ImageView from 'react-native-image-viewing';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ImageZoomViewerScreen = ({ route, navigation }) => {
    const { images = [], selectedIndex = 0 } = route.params || {};

    const imageSources = Array.isArray(images)
        ? images.map((uri) => ({ uri }))
        : [];

    const handleClose = () => {
        navigation.goBack();
    };

    const renderHeader = (currentIndex) => (
        <View style={styles.header}>
            <View style={styles.counterContainer}>
                <Text style={styles.counterText}>
                    {currentIndex + 1} / {imageSources.length}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
                <Icon name="close" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor="#000000"
                barStyle="light-content"
                translucent={Platform.OS === 'android'}
            />

            <ImageView
                images={imageSources}
                imageIndex={selectedIndex}
                visible={true}
                onRequestClose={handleClose}
                presentationStyle="overFullScreen"
                animationType="fade"
                HeaderComponent={({ imageIndex }) => renderHeader(imageIndex)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    counterText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ImageZoomViewerScreen;


