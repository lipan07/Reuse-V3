import React, { useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

// Optional haptic feedback - will work if available
let ReactNativeHapticFeedback = null;
try {
    ReactNativeHapticFeedback = require('react-native-haptic-feedback').default;
} catch (error) {
    console.log('Haptic feedback not available');
}

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const AnimatedUnfollowButton = ({
    onPress,
    style = {},
    text = "Following",
    size = "medium"
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [particles, setParticles] = useState([]);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const createParticles = () => {
        const newParticles = [];
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i * (360 / particleCount)) * (Math.PI / 180);
            const distance = normalize(20) + Math.random() * normalize(15);
            const size = normalize(4) + Math.random() * normalize(3);

            newParticles.push({
                id: i,
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                delay: i * 40,
                size: size,
                rotation: Math.random() * 360,
            });
        }
        setParticles(newParticles);
    };

    const animateButton = () => {
        setIsAnimating(true);

        // Haptic feedback (if available)
        if (ReactNativeHapticFeedback) {
            try {
                ReactNativeHapticFeedback.trigger('impactMedium');
            } catch (error) {
                console.log('Haptic feedback failed:', error);
            }
        }

        // Scale animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1.05,
                duration: 100,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();

        // Shake animation
        Animated.sequence([
            Animated.timing(shakeAnim, {
                toValue: 10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: -10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: 10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
            }),
        ]).start();

        // Create particles
        createParticles();

        // Reset animation state
        setTimeout(() => {
            setIsAnimating(false);
            setParticles([]);
        }, 800);
    };

    const handlePress = () => {
        animateButton();
        onPress();
    };

    const getButtonSize = () => {
        switch (size) {
            case 'small':
                return {
                    paddingHorizontal: normalize(8),
                    paddingVertical: normalize(4),
                    fontSize: normalize(12),
                    borderRadius: normalize(12),
                };
            case 'large':
                return {
                    paddingHorizontal: normalize(16),
                    paddingVertical: normalize(10),
                    fontSize: normalize(16),
                    borderRadius: normalize(20),
                };
            default: // medium
                return {
                    paddingHorizontal: normalize(12),
                    paddingVertical: normalize(6),
                    fontSize: normalize(14),
                    borderRadius: normalize(15),
                };
        }
    };

    const buttonSize = getButtonSize();

    return (
        <View style={[styles.container, style]}>
            <Animated.View
                style={[
                    styles.buttonContainer,
                    {
                        transform: [
                            { scale: scaleAnim },
                            { translateX: shakeAnim },
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.unfollowButton,
                        {
                            paddingHorizontal: buttonSize.paddingHorizontal,
                            paddingVertical: buttonSize.paddingVertical,
                            borderRadius: buttonSize.borderRadius,
                        }
                    ]}
                    onPress={handlePress}
                    activeOpacity={0.7}
                >
                    <Icon
                        name="heart"
                        size={normalize(12)}
                        color="#FF3B30"
                        style={styles.heartIcon}
                    />
                    <Text style={[
                        styles.unfollowButtonText,
                        { fontSize: buttonSize.fontSize }
                    ]}>
                        {text}
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Particle Effects */}
            {particles.map((particle) => (
                <Animatable.View
                    key={particle.id}
                    style={[
                        styles.particle,
                        {
                            left: buttonSize.paddingHorizontal + normalize(6),
                            top: buttonSize.paddingVertical + normalize(3),
                        },
                    ]}
                    animation={{
                        0: {
                            translateX: 0,
                            translateY: 0,
                            scale: 1,
                            opacity: 1,
                            rotate: '0deg',
                        },
                        1: {
                            translateX: particle.x,
                            translateY: particle.y,
                            scale: 0,
                            opacity: 0,
                            rotate: `${particle.rotation}deg`,
                        },
                    }}
                    duration={600}
                    delay={particle.delay}
                    easing="ease-out"
                >
                    <Icon
                        name="heart-broken"
                        size={particle.size}
                        color="#FF4444"
                    />
                </Animatable.View>
            ))}

            {/* Ripple Effect */}
            {isAnimating && (
                <Animatable.View
                    style={[
                        styles.ripple,
                        {
                            width: buttonSize.paddingHorizontal * 2 + normalize(40),
                            height: buttonSize.paddingVertical * 2 + normalize(20),
                            borderRadius: buttonSize.borderRadius,
                        }
                    ]}
                    animation={{
                        0: {
                            scale: 0,
                            opacity: 0.4,
                        },
                        1: {
                            scale: 1.5,
                            opacity: 0,
                        },
                    }}
                    duration={400}
                    easing="ease-out"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    unfollowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    heartIcon: {
        marginRight: normalize(4),
    },
    unfollowButtonText: {
        fontWeight: '500',
        color: '#333',
    },
    particle: {
        position: 'absolute',
        width: normalize(12),
        height: normalize(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    ripple: {
        position: 'absolute',
        backgroundColor: '#FF4444',
        opacity: 0.3,
    },
});

export default AnimatedUnfollowButton;
