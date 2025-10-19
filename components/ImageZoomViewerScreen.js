import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StatusBar, Platform, StyleSheet } from 'react-native';
import ImageView from 'react-native-image-viewing';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ImageZoomViewerScreen = ({ route, navigation }) => {
    const { images = [], selectedIndex = 0 } = route.params || {};
    const [currentImageIndex, setCurrentImageIndex] = useState(selectedIndex);

    console.log('ImageZoomViewerScreen - Received images:', images);
    console.log('ImageZoomViewerScreen - Selected index:', selectedIndex);

    const imageSources = Array.isArray(images) 
        ? images.map((imageUrl) => ({ uri: imageUrl }))
        : [];

    console.log('ImageZoomViewerScreen - Processed imageSources:', imageSources);

    const handleClose = () => {
        navigation.goBack();
    };

    const renderHeader = (imageIndex) => (
        <View style={styles.header}>
            <View style={styles.counterContainer}>
                <Text style={styles.counterText}>
                    {imageIndex + 1} / {imageSources.length}
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

    // If no images, show error message
    if (imageSources.length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="#000000"
                    barStyle="light-content"
                    translucent={Platform.OS === 'android'}
                />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No images available</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Icon name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor="#000000"
                barStyle="light-content"
                translucent={Platform.OS === 'android'}
            />

            <ImageView
                images={imageSources}
                imageIndex={currentImageIndex}
                visible={true}
                onRequestClose={handleClose}
                onImageIndexChange={setCurrentImageIndex}
                presentationStyle="overFullScreen"
                animationType="fade"
                doubleTapToZoomEnabled={true}
                swipeToCloseEnabled={true}
                HeaderComponent={({ imageIndex }) => renderHeader(imageIndex)}
                FooterComponent={({ imageIndex }) => (
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Pinch to zoom • Double tap to zoom • Swipe to navigate
                        </Text>
                    </View>
                )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    errorText: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 20,
    },
    footer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
});

export default ImageZoomViewerScreen;


