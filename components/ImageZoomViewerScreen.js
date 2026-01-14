import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StatusBar,
    Platform,
    StyleSheet,
    Dimensions,
    FlatList,
    Image,
    Animated,
    PanResponder,
    Easing,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Styles must be defined before components that use them
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 70 : 40,
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
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imageWrapper: {
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

// Zoomable Image Component using React Native's built-in Animated API
const ZoomableImage = ({ uri, index, onResetReady, isActive, onZoomChange }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const lastScale = useRef(1);
    const lastTranslateX = useRef(0);
    const lastTranslateY = useRef(0);
    const lastTap = useRef(0);
    const initialDistance = useRef(null);
    const initialScale = useRef(1); // Track scale at start of pinch
    const isZoomed = useRef(false);
    const isGestureActive = useRef(false);
    const panStartX = useRef(0);
    const panStartY = useRef(0);
    const panStartTranslateX = useRef(0); // Store translation at start of pan
    const panStartTranslateY = useRef(0); // Store translation at start of pan

    // Reset zoom function - ensure it's called properly
    const resetZoom = useCallback(() => {
        // Stop any ongoing animations
        scale.stopAnimation();
        translateX.stopAnimation();
        translateY.stopAnimation();

        // Flatten any offsets to get actual current values
        scale.setOffset(0);
        translateX.setOffset(0);
        translateY.setOffset(0);
        scale.flattenOffset();
        translateX.flattenOffset();
        translateY.flattenOffset();

        // Get current actual values from the animated values
        // We'll use the tracked refs which should match the actual values
        const currentScale = lastScale.current;
        const currentTranslateX = lastTranslateX.current;
        const currentTranslateY = lastTranslateY.current;

        // Set the current values directly first to ensure smooth animation from current position
        scale.setValue(currentScale);
        translateX.setValue(currentTranslateX);
        translateY.setValue(currentTranslateY);

        // Animate smoothly to center position (0, 0, scale 1)
        // Use timing animation for smoother, more controlled zoom out
        Animated.parallel([
            Animated.timing(scale, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateX, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start((finished) => {
            if (finished) {
                // Ensure values are exactly reset to center
                lastScale.current = 1;
                lastTranslateX.current = 0;
                lastTranslateY.current = 0;
                isZoomed.current = false;

                // Force exact center position (no drift)
                scale.setValue(1);
                translateX.setValue(0);
                translateY.setValue(0);

                // Notify parent that zoom is reset
                if (onZoomChange) {
                    onZoomChange(false);
                }
            }
        });
    }, [scale, translateX, translateY, onZoomChange]);

    // Reset when component becomes inactive or index changes
    useEffect(() => {
        if (!isActive) {
            resetZoom();
        }
    }, [isActive, resetZoom]);

    // Expose reset function to parent
    useEffect(() => {
        if (onResetReady) {
            onResetReady(index, resetZoom);
        }
        return () => {
            if (onResetReady) {
                onResetReady(index, null);
            }
        };
    }, [index, onResetReady, resetZoom]);

    // Calculate distance between two touches
    const getDistance = (touches) => {
        if (touches.length < 2) return 0;
        const [touch1, touch2] = touches;
        const dx = touch2.pageX - touch1.pageX;
        const dy = touch2.pageY - touch1.pageY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Handle double tap
    const handleDoubleTap = (evt) => {
        // Don't block if gesture just ended - allow double tap to work
        // Only block if gesture is actively happening
        if (isGestureActive.current && evt.nativeEvent.touches.length > 0) {
            return; // Don't handle if gesture is actively happening
        }

        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            // Stop any ongoing animations
            scale.stopAnimation();
            translateX.stopAnimation();
            translateY.stopAnimation();

            // Check if currently zoomed - check both isZoomed ref and lastScale
            // Also check if scale is actually greater than 1 (more reliable)
            const currentScaleValue = lastScale.current;
            const currentlyZoomed = isZoomed.current || currentScaleValue > 1.05;

            if (currentlyZoomed) {
                // Zoom out - call resetZoom
                resetZoom();
                return; // Exit early after reset
            } else {
                // Zoom in
                const newScale = 2.5;
                const focalX = evt.nativeEvent.pageX - SCREEN_WIDTH / 2;
                const focalY = evt.nativeEvent.pageY - SCREEN_HEIGHT / 2;

                // Flatten any offsets first to get actual current values
                scale.setOffset(0);
                translateX.setOffset(0);
                translateY.setOffset(0);
                scale.flattenOffset();
                translateX.flattenOffset();
                translateY.flattenOffset();

                // Ensure we start from center position (0, 0, scale 1) when not zoomed
                // This ensures zoom in always starts from the correct center position
                if (!isZoomed.current && lastScale.current <= 1.05) {
                    scale.setValue(1);
                    translateX.setValue(0);
                    translateY.setValue(0);
                    lastScale.current = 1;
                    lastTranslateX.current = 0;
                    lastTranslateY.current = 0;
                } else {
                    // If somehow zoomed, use tracked values
                    scale.setValue(lastScale.current);
                    translateX.setValue(lastTranslateX.current);
                    translateY.setValue(lastTranslateY.current);
                }

                // Calculate target translation based on tap location
                const targetTranslateX = -focalX * (newScale - 1);
                const targetTranslateY = -focalY * (newScale - 1);

                // Use timing animation for smoother, more controlled zoom in
                Animated.parallel([
                    Animated.timing(scale, {
                        toValue: newScale,
                        duration: 300,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateX, {
                        toValue: targetTranslateX,
                        duration: 300,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: targetTranslateY,
                        duration: 300,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                ]).start((finished) => {
                    if (finished) {
                        lastScale.current = newScale;
                        lastTranslateX.current = targetTranslateX;
                        lastTranslateY.current = targetTranslateY;
                        isZoomed.current = true;

                        // Ensure exact values
                        scale.setValue(newScale);
                        translateX.setValue(targetTranslateX);
                        translateY.setValue(targetTranslateY);

                        // Notify parent of zoom state change
                        if (onZoomChange) {
                            onZoomChange(true);
                        }
                    }
                });
            }
            lastTap.current = 0; // Reset to prevent triple tap
        } else {
            lastTap.current = now;
        }
    };

    // Pan responder for gestures
    const panResponder = useRef(
        PanResponder.create({
            // Capture phase - intercept gestures BEFORE FlatList can get them
            onStartShouldSetPanResponderCapture: (evt, gestureState) => {
                // Always capture if zoomed or if it's a pinch gesture
                // BUT: Don't capture single taps when zoomed - let TouchableOpacity handle them
                const isTwoFingers = evt.nativeEvent.touches.length === 2;
                if (isTwoFingers) {
                    return true; // Always capture pinch
                }
                // Only capture at start if zoomed AND it's not a single tap (wait for movement)
                if (isZoomed.current) {
                    return false; // Don't capture at start - let TouchableOpacity handle taps
                }
                return false;
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                // Capture movement if zoomed (pan) or pinch
                const isTwoFingers = evt.nativeEvent.touches.length === 2;
                if (isTwoFingers) {
                    return true; // Always capture pinch movement
                }
                // When zoomed, capture movement for panning (but not taps)
                if (isZoomed.current) {
                    const hasMovement = Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
                    return hasMovement; // Only capture if there's actual movement
                }
                return false;
            },
            onStartShouldSetPanResponder: (evt, gestureState) => {
                // Only capture if it's a pinch (2 touches) - don't capture single taps
                const isTwoFingers = evt.nativeEvent.touches.length === 2;
                return isTwoFingers; // Don't capture single taps at start
            },
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Only capture if it's a pinch or if zoomed AND moving (not just tapping)
                const isTwoFingers = evt.nativeEvent.touches.length === 2;
                if (isTwoFingers) {
                    return true; // Always capture pinch
                }
                // When zoomed, only capture if there's actual movement (pan, not tap)
                if (isZoomed.current) {
                    const hasMovement = Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
                    return hasMovement; // Only capture panning, not taps
                }
                return false;
            },
            onPanResponderGrant: (evt) => {
                isGestureActive.current = true;

                // Stop any ongoing animations
                scale.stopAnimation();
                translateX.stopAnimation();
                translateY.stopAnimation();

                // Always reset offsets first
                scale.setOffset(0);
                translateX.setOffset(0);
                translateY.setOffset(0);
                scale.flattenOffset();
                translateX.flattenOffset();
                translateY.flattenOffset();

                if (evt.nativeEvent.touches.length === 2) {
                    // Pinch gesture - track initial distance and current scale
                    initialDistance.current = getDistance(evt.nativeEvent.touches);
                    initialScale.current = lastScale.current; // Store scale at start of pinch
                    // If we're starting a pinch and already zoomed, ensure parent knows
                    if (isZoomed.current && onZoomChange) {
                        onZoomChange(true);
                    }
                } else if (isZoomed.current) {
                    // Single touch pan when zoomed
                    // Store the starting touch position and current translation values
                    panStartX.current = evt.nativeEvent.pageX;
                    panStartY.current = evt.nativeEvent.pageY;
                    panStartTranslateX.current = lastTranslateX.current;
                    panStartTranslateY.current = lastTranslateY.current;

                    // Ensure current tracked values match what's displayed
                    // Set the animated values to match our tracked refs
                    scale.setValue(lastScale.current);
                    translateX.setValue(lastTranslateX.current);
                    translateY.setValue(lastTranslateY.current);

                    // Ensure parent knows we're zoomed when panning starts
                    if (onZoomChange) {
                        onZoomChange(true);
                    }
                }
            },
            onPanResponderMove: (evt, gestureState) => {
                if (evt.nativeEvent.touches.length === 2) {
                    // Pinch to zoom
                    const currentDistance = getDistance(evt.nativeEvent.touches);
                    if (initialDistance.current && initialDistance.current > 0) {
                        const scaleFactor = currentDistance / initialDistance.current;
                        // Use the scale at the start of the pinch
                        const newScale = Math.max(1, Math.min(4, initialScale.current * scaleFactor));

                        scale.setValue(newScale);
                        lastScale.current = newScale; // Update as we go
                        isZoomed.current = newScale > 1.1;
                        // Notify parent of zoom state change
                        if (onZoomChange) {
                            onZoomChange(newScale > 1.1);
                        }
                    }
                } else if (isZoomed.current && lastScale.current > 1) {
                    // Pan when zoomed - direct, controlled movement
                    const currentScale = lastScale.current;

                    // Calculate maximum translation based on scale
                    // When image is scaled, we can move it by (scaledWidth - screenWidth) / 2
                    // This allows viewing all corners of the zoomed image
                    const scaledWidth = SCREEN_WIDTH * currentScale;
                    const scaledHeight = SCREEN_HEIGHT * currentScale;
                    const maxTranslateX = (scaledWidth - SCREEN_WIDTH) / 2;
                    const maxTranslateY = (scaledHeight - SCREEN_HEIGHT) / 2;

                    // Calculate new position from starting translation + gesture delta
                    // gestureState.dx and dy are cumulative from the start of the gesture
                    // This gives us direct, 1:1 control - finger moves, image moves
                    let newTranslateX = panStartTranslateX.current + gestureState.dx;
                    let newTranslateY = panStartTranslateY.current + gestureState.dy;

                    // Clamp translations to prevent moving beyond image bounds
                    // This ensures we can see all corners but not move past the edges
                    newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
                    newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));

                    // Apply the translation directly - follows finger 1:1 for precise control
                    translateX.setValue(newTranslateX);
                    translateY.setValue(newTranslateY);

                    // Update refs in real-time to keep track of current position
                    lastTranslateX.current = newTranslateX;
                    lastTranslateY.current = newTranslateY;
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                // Reset gesture active flag immediately
                isGestureActive.current = false;

                if (evt.nativeEvent.touches.length === 0) {
                    // Flatten any offsets
                    scale.setOffset(0);
                    translateX.setOffset(0);
                    translateY.setOffset(0);
                    scale.flattenOffset();
                    translateX.flattenOffset();
                    translateY.flattenOffset();

                    // Update scale from current value (already updated in onPanResponderMove)
                    // lastScale.current is already updated during the pinch gesture
                    isZoomed.current = lastScale.current > 1.1;
                    // Notify parent of zoom state change
                    if (onZoomChange) {
                        onZoomChange(isZoomed.current);
                    }

                    // Translations are already updated in real-time during onPanResponderMove
                    // Values are already clamped during panning, so just ensure they're set correctly
                    if (isZoomed.current && lastScale.current > 1) {
                        // Ensure the animated values match our tracked refs
                        translateX.setValue(lastTranslateX.current);
                        translateY.setValue(lastTranslateY.current);
                    }

                    // Snap back if scale is too small
                    if (lastScale.current < 1.1) {
                        resetZoom();
                        // Notify parent that zoom is reset
                        if (onZoomChange) {
                            onZoomChange(false);
                        }
                    } else {
                        // Clamp translations to bounds
                        const maxTranslateX = (SCREEN_WIDTH * lastScale.current - SCREEN_WIDTH) / 2;
                        const maxTranslateY = (SCREEN_HEIGHT * lastScale.current - SCREEN_HEIGHT) / 2;

                        if (Math.abs(lastTranslateX.current) > maxTranslateX) {
                            const clampedX = Math.sign(lastTranslateX.current) * maxTranslateX;
                            Animated.spring(translateX, {
                                toValue: clampedX,
                                useNativeDriver: true,
                                friction: 8,
                                tension: 40,
                            }).start();
                            lastTranslateX.current = clampedX;
                        } else {
                            // Ensure translateX is set to the correct value
                            translateX.setValue(lastTranslateX.current);
                        }

                        if (Math.abs(lastTranslateY.current) > maxTranslateY) {
                            const clampedY = Math.sign(lastTranslateY.current) * maxTranslateY;
                            Animated.spring(translateY, {
                                toValue: clampedY,
                                useNativeDriver: true,
                                friction: 8,
                                tension: 40,
                            }).start();
                            lastTranslateY.current = clampedY;
                        } else {
                            // Ensure translateY is set to the correct value
                            translateY.setValue(lastTranslateY.current);
                        }
                    }
                }
                initialDistance.current = null;
            },
            onPanResponderTerminate: () => {
                isGestureActive.current = false;
                initialDistance.current = null;
            },
            onPanResponderReject: () => {
                // If gesture is rejected, reset the flag
                isGestureActive.current = false;
            },
        })
    ).current;

    const animatedStyle = {
        transform: [
            { translateX },
            { translateY },
            { scale },
        ],
    };

    return (
        <View style={styles.mediaContainer} {...panResponder.panHandlers}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={handleDoubleTap}
                style={styles.imageContainer}
                delayPressIn={150}
                delayPressOut={0}
            >
                <Animated.View style={[styles.imageWrapper, animatedStyle]}>
                    <Image
                        source={{ uri }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

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
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const flatListRef = useRef(null);
    const videoRefs = useRef({});
    const imageResetRefs = useRef({});

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
        // Pause all videos before closing by setting playingVideoIndex to null
        // This will pause all videos since paused={playingVideoIndex !== index}
        setPlayingVideoIndex(null);
        navigation.goBack();
    };

    const handleScroll = (event) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / SCREEN_WIDTH);

        if (index !== currentIndex && index >= 0 && index < items.length) {
            // Reset zoom for the previous image BEFORE changing index
            if (items[currentIndex]?.type === 'image' && imageResetRefs.current[currentIndex]) {
                try {
                    imageResetRefs.current[currentIndex]();
                } catch (error) {
                    console.log('Error resetting zoom:', error);
                }
            }

            // Reset zoom state when changing images
            setIsImageZoomed(false);
            setCurrentIndex(index);

            // Auto-play video if it's a video, pause others
            if (items[index]?.type === 'video') {
                setPlayingVideoIndex(index);
            } else {
                setPlayingVideoIndex(null);
            }
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

    // Handle reset function registration from ZoomableImage
    const handleResetReady = useCallback((index, resetFn) => {
        if (resetFn) {
            imageResetRefs.current[index] = resetFn;
        } else {
            delete imageResetRefs.current[index];
        }
    }, []);

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
                <ZoomableImage
                    uri={item.url}
                    index={index}
                    onResetReady={handleResetReady}
                    isActive={index === currentIndex}
                    onZoomChange={index === currentIndex ? setIsImageZoomed : undefined}
                />
            );
        }
    };

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
        <GestureHandlerRootView style={styles.container}>
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
                    scrollEnabled={!isImageZoomed}
                    nestedScrollEnabled={false}
                    bounces={!isImageZoomed}
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
                            : 'Pinch to zoom • Double tap to zoom • Swipe to navigate'}
                    </Text>
                </View>
            </View>
        </GestureHandlerRootView>
    );
};

export default ImageZoomViewerScreen;


