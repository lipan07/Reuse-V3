import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Text,
    StatusBar,
    Platform,
    ActivityIndicator,
} from 'react-native';
import {
    GestureHandlerRootView,
    PinchGestureHandler,
    PanGestureHandler,
    TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    withSpring,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    runOnJS,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const EnhancedImageViewer = ({ route, navigation }) => {
    const { images, selectedIndex = 0 } = route.params;

    const [currentIndex, setCurrentIndex] = useState(selectedIndex);
    const [imageLoading, setImageLoading] = useState(true);

    const scale = useSharedValue(1);
    const baseScale = useSharedValue(1);
    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const horizontalOffset = useSharedValue(0);

    const doubleTapRef = useRef();

    const resetTransform = useCallback(() => {
        scale.value = withSpring(1);
        baseScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
    }, []);

    const handleSwipe = useCallback(
        (direction) => {
            if (direction === 'left' && currentIndex < images.length - 1) {
                setCurrentIndex((prev) => prev + 1);
                resetTransform();
                setImageLoading(true);
            } else if (direction === 'right' && currentIndex > 0) {
                setCurrentIndex((prev) => prev - 1);
                resetTransform();
                setImageLoading(true);
            }
        },
        [currentIndex, images.length, resetTransform]
    );

    // Pinch gesture
    const pinchHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startScale = baseScale.value;
        },
        onActive: (event, ctx) => {
            scale.value = ctx.startScale * event.scale;
            focalX.value = event.focalX;
            focalY.value = event.focalY;
        },
        onEnd: () => {
            if (scale.value < 1) {
                scale.value = withSpring(1);
                baseScale.value = 1;
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            } else if (scale.value > 4) {
                scale.value = withSpring(4);
                baseScale.value = 4;
            } else {
                baseScale.value = scale.value;
            }
        },
    });

    // Pan gesture
    const panHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startX = translateX.value;
            ctx.startY = translateY.value;
        },
        onActive: (event, ctx) => {
            if (scale.value > 1) {
                translateX.value = ctx.startX + event.translationX;
                translateY.value = ctx.startY + event.translationY;
            } else {
                horizontalOffset.value = event.translationX;
            }
        },
        onEnd: (event) => {
            if (scale.value <= 1) {
                if (Math.abs(event.translationX) > SCREEN_WIDTH * 0.3) {
                    runOnJS(handleSwipe)(event.translationX > 0 ? 'right' : 'left');
                }
                horizontalOffset.value = withSpring(0);
            } else {
                const maxTranslateX = (SCREEN_WIDTH * scale.value - SCREEN_WIDTH) / 2;
                const maxTranslateY = (SCREEN_HEIGHT * scale.value - SCREEN_HEIGHT) / 2;

                if (Math.abs(translateX.value) > maxTranslateX) {
                    translateX.value = withSpring(Math.sign(translateX.value) * maxTranslateX);
                }
                if (Math.abs(translateY.value) > maxTranslateY) {
                    translateY.value = withSpring(Math.sign(translateY.value) * maxTranslateY);
                }
            }
        },
    });

    // Double tap zoom
    const doubleTapHandler = useAnimatedGestureHandler({
        onActive: (event) => {
            if (scale.value > 1) {
                scale.value = withSpring(1);
                baseScale.value = 1;
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            } else {
                const newScale = 2;
                scale.value = withSpring(newScale);
                baseScale.value = newScale;

                const focalPointX = event.x - SCREEN_WIDTH / 2;
                const focalPointY = event.y - SCREEN_HEIGHT / 2;

                translateX.value = withSpring(-focalPointX * (newScale - 1));
                translateY.value = withSpring(-focalPointY * (newScale - 1));
            }
        },
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value + horizontalOffset.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
        };
    });

    const handleClose = () => navigation.goBack();

    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar
                backgroundColor="#000"
                barStyle="light-content"
                translucent={Platform.OS === 'android'}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Icon name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={styles.counterContainer}>
                    <Text style={styles.counterText}>
                        {currentIndex + 1} / {images.length}
                    </Text>
                </View>
            </View>

            <View style={styles.imageWrapper}>
                <TapGestureHandler
                    ref={doubleTapRef}
                    numberOfTaps={2}
                    onGestureEvent={doubleTapHandler}
                >
                    <Animated.View style={styles.gestureContainer}>
                        <PanGestureHandler onGestureEvent={panHandler}>
                            <Animated.View style={styles.gestureContainer}>
                                <PinchGestureHandler onGestureEvent={pinchHandler}>
                                    <Animated.View style={styles.imageContainer}>
                                        <Animated.Image
                                            source={{ uri: images[currentIndex] }}
                                            style={[styles.image, animatedStyle]}
                                            resizeMode="contain"
                                            onLoadStart={() => setImageLoading(true)}
                                            onLoadEnd={() => setImageLoading(false)}
                                        />
                                        {imageLoading && (
                                            <View style={styles.loadingContainer}>
                                                <ActivityIndicator size="large" color="#fff" />
                                            </View>
                                        )}
                                    </Animated.View>
                                </PinchGestureHandler>
                            </Animated.View>
                        </PanGestureHandler>
                    </Animated.View>
                </TapGestureHandler>
            </View>

            {scale.value <= 1 && (
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

            <View style={styles.footer}>
                <Text style={styles.instructionText}>
                    {'👆 Double tap to zoom • Pinch to zoom • Drag to pan • Swipe to change image'}
                </Text>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
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
    counterText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    imageWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    gestureContainer: {
        flex: 1,
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
    leftHint: { position: 'absolute', left: 10, top: '50%', marginTop: -20 },
    rightHint: { position: 'absolute', right: 10, top: '50%', marginTop: -20 },
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

export default EnhancedImageViewer;
