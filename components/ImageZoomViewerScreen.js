import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StatusBar,
    Platform,
    StyleSheet,
    Dimensions,
    FlatList,
    Image
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ImageZoomViewerScreen = ({ route, navigation }) => {
    // Support both old format (images array) and new format (mediaItems array)
    const {
        images = [],
        mediaItems = [],
        selectedIndex = 0,
        selectedImageIndex = 0
    } = route.params || {};

    // Use selectedImageIndex if selectedIndex is not provided (backward compatibility)
    const initialIndex = selectedIndex !== 0 ? selectedIndex : selectedImageIndex;

    // Convert old format to new format if needed
    const items = mediaItems.length > 0
        ? mediaItems
        : images.map(url => ({ type: 'image', url }));

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [playingVideoIndex, setPlayingVideoIndex] = useState(null);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [imageViewerIndex, setImageViewerIndex] = useState(0);
    const flatListRef = useRef(null);
    const videoRefs = useRef({});

    // Scroll to selected index on mount
    useEffect(() => {
        if (flatListRef.current && initialIndex > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: initialIndex,
                    animated: false
                });
            }, 100);
        }
    }, [initialIndex]);


    const handleClose = () => {
        // Pause all videos before closing
        Object.keys(videoRefs.current).forEach((key) => {
            if (videoRefs.current[key]) {
                videoRefs.current[key]?.setNativeProps({ paused: true });
            }
        });
        navigation.goBack();
    };

    const handleScroll = (event) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / SCREEN_WIDTH);

        if (index !== currentIndex && index >= 0 && index < items.length) {
            setCurrentIndex(index);

            // Auto-play video if it's a video, pause others
            if (items[index]?.type === 'video') {
                setPlayingVideoIndex(index);
            } else {
                setPlayingVideoIndex(null);
            }
        }
    };

    const handleImagePress = (index) => {
        // Only open image viewer for images
        if (items[index]?.type === 'image') {
            const imageItems = items.filter(item => item.type === 'image');
            const imageIndex = items.slice(0, index + 1).filter(item => item.type === 'image').length - 1;
            setImageViewerIndex(imageIndex);
            setShowImageViewer(true);
        }
    };

    const handleVideoLoad = (index) => {
        // Auto-play video when it loads if it's the current index
        if (index === currentIndex && items[index]?.type === 'video') {
            setPlayingVideoIndex(index);
        }
    };

    const handleVideoEnd = (index) => {
        // When video ends, stop playing
        if (playingVideoIndex === index) {
            setPlayingVideoIndex(null);
        }
    };

    const renderItem = ({ item, index }) => {
        if (item.type === 'video') {
            return (
                <View style={styles.mediaContainer}>
                    <Video
                        ref={(ref) => {
                            if (ref) {
                                videoRefs.current[index] = ref;
                            } else {
                                delete videoRefs.current[index];
                            }
                        }}
                        source={{ uri: item.url }}
                        style={styles.video}
                        controls={true}
                        resizeMode="contain"
                        paused={playingVideoIndex !== index}
                        onLoad={() => handleVideoLoad(index)}
                        onEnd={() => handleVideoEnd(index)}
                        ignoreSilentSwitch="ignore"
                        playInBackground={false}
                        playWhenInactive={false}
                    />
                </View>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.mediaContainer}
                    activeOpacity={1}
                    onPress={() => handleImagePress(index)}
                >
                    <Image
                        source={{ uri: item.url }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            );
        }
    };

    // Get image sources for ImageView (for zoom functionality)
    const imageSources = items
        .filter(item => item.type === 'image')
        .map(item => ({ uri: item.url }));

    // If no media, show error message
    if (items.length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="#000000"
                    barStyle="light-content"
                    translucent={Platform.OS === 'android'}
                />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No media available</Text>
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

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.counterContainer}>
                    <Text style={styles.counterText}>
                        {currentIndex + 1} / {items.length}
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

            {/* Media FlatList */}
            <FlatList
                ref={flatListRef}
                data={items}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.type}-${index}-${item.url}`}
                getItemLayout={(data, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
                initialScrollIndex={initialIndex}
                onScrollToIndexFailed={(info) => {
                    // Fallback if scroll to index fails
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                        flatListRef.current?.scrollToIndex({
                            index: info.index,
                            animated: false
                        });
                    });
                }}
            />

            {/* Footer with instructions */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {items[currentIndex]?.type === 'video'
                        ? 'Tap to play/pause • Swipe to navigate'
                        : 'Tap to zoom • Swipe to navigate'}
                </Text>
            </View>

            {/* Image Viewer Modal for zoom functionality */}
            {showImageViewer && imageSources.length > 0 && (
                <ImageView
                    images={imageSources}
                    imageIndex={imageViewerIndex}
                    visible={showImageViewer}
                    onRequestClose={() => setShowImageViewer(false)}
                    onImageIndexChange={setImageViewerIndex}
                    presentationStyle="overFullScreen"
                    animationType="fade"
                    doubleTapToZoomEnabled={true}
                    swipeToCloseEnabled={true}
                />
            )}
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
    mediaContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    video: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    footer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
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


