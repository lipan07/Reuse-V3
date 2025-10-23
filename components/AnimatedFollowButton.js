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

const AnimatedFollowButton = ({
    isLiked,
    onPress,
    size = 24,
    style = {},
    iconType = 'heart' // 'heart' for posts, 'plus' for users
}) => {

    const [isAnimating, setIsAnimating] = useState(false);
    const [particles, setParticles] = useState([]);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const createParticles = () => {
        const newParticles = [];
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i * (360 / particleCount)) * (Math.PI / 180);
            const distance = normalize(25) + Math.random() * normalize(15);
            const size = normalize(6) + Math.random() * normalize(4);

            newParticles.push({
                id: i,
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                delay: i * 30,
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
                ReactNativeHapticFeedback.trigger('impactLight');
            } catch (error) {
                console.log('Haptic feedback failed:', error);
            }
        }

        // Scale animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.3,
                duration: 150,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();

        // Rotation animation
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start(() => {
            rotateAnim.setValue(0);
        });

        // Create particles
        createParticles();

        // Reset animation state
        setTimeout(() => {
            setIsAnimating(false);
            setParticles([]);
        }, 1000);
    };

    const handlePress = () => {
        animateButton();
        onPress();
    };

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={[styles.container, style]}>
            <Animated.View
                style={[
                    styles.buttonContainer,
                    {
                        transform: [
                            { scale: scaleAnim },
                            { rotate: rotateInterpolate },
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    style={styles.followButton}
                    onPress={handlePress}
                    activeOpacity={0.7}
                >
                    <Icon
                        name={iconType === 'heart'
                            ? (isLiked ? 'heart' : 'heart-outline')
                            : (isLiked ? 'account-plus' : 'account-plus-outline')
                        }
                        size={normalize(size)}
                        color={isLiked ? '#FF3B30' : '#8E8E93'}
                    />
                </TouchableOpacity>
            </Animated.View>

            {/* Particle Effects */}
            {particles.map((particle) => (
                <Animatable.View
                    key={particle.id}
                    style={[
                        styles.particle,
                        {
                            left: normalize(12),
                            top: normalize(12),
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
                    duration={800}
                    delay={particle.delay}
                    easing="ease-out"
                >
                    <Icon
                        name={iconType === 'heart' ? 'heart' : 'account-plus'}
                        size={particle.size}
                        color={isLiked ? "#FF3B30" : "#FF6B6B"}
                    />
                </Animatable.View>
            ))}

            {/* Ripple Effect */}
            {isAnimating && (
                <Animatable.View
                    style={styles.ripple}
                    animation={{
                        0: {
                            scale: 0,
                            opacity: 0.6,
                        },
                        1: {
                            scale: 2,
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
    followButton: {
        width: normalize(48),
        height: normalize(48),
        borderRadius: normalize(24),
        backgroundColor: 'rgba(255, 255, 255, 0.74)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    particle: {
        position: 'absolute',
        width: normalize(16),
        height: normalize(16),
        alignItems: 'center',
        justifyContent: 'center',
    },
    ripple: {
        position: 'absolute',
        width: normalize(48),
        height: normalize(48),
        borderRadius: normalize(24),
        backgroundColor: '#FF3B30',
        opacity: 0.3,
    },
});

export default AnimatedFollowButton;
