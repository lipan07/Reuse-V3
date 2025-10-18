import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Text,
    StatusBar,
    Platform,
    ActivityIndicator,
    Animated,
    PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Simple Image Viewer with full zoom, pan, and swipe functionality
 * Fixed version with perfect swipe detection
 */
const SimpleImageViewer = ({ route, navigation }) => {
    const { images, selectedIndex = 0 } = route.params;

    const [currentIndex, setCurrentIndex] = useState(selectedIndex);
    const [imageLoading, setImageLoading] = useState(true);

    // Animated values
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    // For tracking gestures
    const lastScale = useRef(1);
    const lastTranslateX = useRef(0);
    const lastTranslateY = useRef(0);
    const lastTap = useRef(0);
    const initialDistance = useRef(null);
    const isZoomed = useRef(false);

    // Reset transformation
    const resetTransform = () => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 7,
            }),
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                friction: 7,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                friction: 7,
            }),
        ]).start();

        lastScale.current = 1;
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
        isZoomed.current = false;
    };

    // Handle swipe between images
    const handleSwipe = (direction) => {
        if (direction === 'left' && currentIndex < images.length - 1) {
            setCurrentIndex(prev => prev + 1);
            resetTransform();
            setImageLoading(true);
        } else if (direction === 'right' && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            resetTransform();
            setImageLoading(true);
        }
    };

    // Handle double tap
    const handleDoubleTap = (evt) => {
        if (isZoomed.current) {
            // Zoom out
            resetTransform();
        } else {
            // Zoom in to 2x at tap location
            const newScale = 2;

            // Calculate focal point relative to screen center
            const focalX = evt.pageX - SCREEN_WIDTH / 2;
            const focalY = evt.pageY - SCREEN_HEIGHT / 2;

            Animated.parallel([
                Animated.spring(scale, {
                    toValue: newScale,
                    useNativeDriver: true,
                    friction: 7,
                }),
                Animated.spring(translateX, {
                    toValue: -focalX * (newScale - 1),
                    useNativeDriver: true,
                    friction: 7,
                }),
                Animated.spring(translateY, {
                    toValue: -focalY * (newScale - 1),
                    useNativeDriver: true,
                    friction: 7,
                }),
            ]).start();

            lastScale.current = newScale;
            lastTranslateX.current = -focalX * (newScale - 1);
            lastTranslateY.current = -focalY * (newScale - 1);
            isZoomed.current = true;
        }
    };

    // Pan responder for gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Always respond to movement
                return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                // Capture for pinch (2 fingers) or significant movement
                return evt.nativeEvent.touches.length === 2 || Math.abs(gestureState.dx) > 10;
            },

            onPanResponderGrant: (evt) => {
                // Store current values
                lastTranslateX.current = translateX._value;
                lastTranslateY.current = translateY._value;
                lastScale.current = scale._value;
                isZoomed.current = scale._value > 1;

                // Check for double tap
                const now = Date.now();
                if (now - lastTap.current < 300) {
                    handleDoubleTap(evt.nativeEvent);
                }
                lastTap.current = now;
            },

            onPanResponderMove: (evt, gestureState) => {
                const touches = evt.nativeEvent.touches;

                // Handle pinch zoom (2 touches)
                if (touches.length === 2) {
                    const touch1 = touches[0];
                    const touch2 = touches[1];

                    const distance = Math.sqrt(
                        Math.pow(touch2.pageX - touch1.pageX, 2) +
                        Math.pow(touch2.pageY - touch1.pageY, 2)
                    );

                    if (!initialDistance.current) {
                        initialDistance.current = distance;
                    } else {
                        const newScale = (distance / initialDistance.current) * lastScale.current;
                        const constrainedScale = Math.max(0.5, Math.min(4, newScale));
                        scale.setValue(constrainedScale);
                        isZoomed.current = constrainedScale > 1;
                    }
                }
                // Handle pan/swipe (1 touch)
                else if (touches.length === 1) {
                    if (isZoomed.current && lastScale.current > 1) {
                        // Pan when zoomed
                        const maxTranslateX = (SCREEN_WIDTH * lastScale.current - SCREEN_WIDTH) / 2;
                        const maxTranslateY = (SCREEN_HEIGHT * lastScale.current - SCREEN_HEIGHT) / 2;

                        const newX = lastTranslateX.current + gestureState.dx;
                        const newY = lastTranslateY.current + gestureState.dy;

                        // Apply bounds
                        const boundedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newX));
                        const boundedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newY));

                        translateX.setValue(boundedX);
                        translateY.setValue(boundedY);
                    } else {
                        // Horizontal swipe for changing images (not zoomed)
                        // Only move horizontally if mostly horizontal movement
                        const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;

                        if (isHorizontalSwipe) {
                            translateX.setValue(gestureState.dx);
                        }
                    }
                }
            },

            onPanResponderRelease: (evt, gestureState) => {
                // Reset pinch state
                initialDistance.current = null;

                const currentScale = scale._value;

                // Handle image swipe (only when not zoomed)
                if (currentScale <= 1.1) {
                    const swipeThreshold = SCREEN_WIDTH * 0.25; // 25% of screen width
                    const swipeVelocity = Math.abs(gestureState.vx); // Velocity in x direction

                    // Check if it's a valid swipe (distance OR velocity)
                    const isSwipe = Math.abs(gestureState.dx) > swipeThreshold || swipeVelocity > 0.5;

                    if (isSwipe) {
                        if (gestureState.dx > 0) {
                            // Swipe right - go to previous
                            handleSwipe('right');
                        } else {
                            // Swipe left - go to next
                            handleSwipe('left');
                        }
                    } else {
                        // Not enough swipe - reset position
                        Animated.spring(translateX, {
                            toValue: 0,
                            useNativeDriver: true,
                            friction: 7,
                        }).start();
                    }
                } else {
                    // When zoomed, just save the pan position
                    lastTranslateX.current = translateX._value;
                    lastTranslateY.current = translateY._value;
                }

                // Constrain scale
                if (currentScale < 1) {
                    resetTransform();
                } else if (currentScale > 4) {
                    Animated.spring(scale, {
                        toValue: 4,
                        useNativeDriver: true,
                        friction: 7,
                    }).start(() => {
                        lastScale.current = 4;
                        isZoomed.current = true;
                    });
                } else {
                    lastScale.current = currentScale;
                    isZoomed.current = currentScale > 1;
                }
            },
        })
    ).current;

    const handleClose = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor="#000000"
                barStyle="light-content"
                translucent={Platform.OS === 'android'}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Icon name="close" size={28} color="#fff" />
                </TouchableOpacity>

                <View style={styles.counterContainer}>
                    <Text style={styles.counterText}>
                        {currentIndex + 1} / {images.length}
                    </Text>
                </View>
            </View>

            {/* Image with gestures */}
            <View style={styles.imageWrapper} {...panResponder.panHandlers}>
                <Animated.Image
                    source={{ uri: images[currentIndex] }}
                    style={[
                        styles.image,
                        {
                            transform: [
                                { translateX },
                                { translateY },
                                { scale },
                            ],
                        },
                    ]}
                    resizeMode="contain"
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                />

                {imageLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                )}
            </View>

            {/* Navigation hints - only show when not zoomed */}
            {!isZoomed.current && (
                <>
                    {currentIndex > 0 && (
                        <View style={styles.leftHint}>
                            <Icon name="chevron-left" size={40} color="rgba(255,255,255,0.5)" />
                        </View>
                    )}
                    {currentIndex < images.length - 1 && (
                        <View style={styles.rightHint}>
                            <Icon name="chevron-right" size={40} color="rgba(255,255,255,0.5)" />
                        </View>
                    )}
                </>
            )}

            {/* Instructions */}
            <View style={styles.footer}>
                <Text style={styles.instructionText}>
                    {isZoomed.current
                        ? '👆 Drag to pan • Pinch to zoom • Double tap to reset'
                        : '👆 Double tap to zoom • Swipe left/right to change image'}
                </Text>
            </View>
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
    imageWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    leftHint: {
        position: 'absolute',
        left: 10,
        top: '50%',
        marginTop: -20,
    },
    rightHint: {
        position: 'absolute',
        right: 10,
        top: '50%',
        marginTop: -20,
    },
    footer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 40 : 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    instructionText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
});

export default SimpleImageViewer;
