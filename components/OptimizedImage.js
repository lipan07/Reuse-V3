import React, { useState, memo } from 'react';
import { Image, View, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Optimized Image Component
 * - Uses Image component with optimization props
 * - Shows loading indicator
 * - Handles errors gracefully
 * - Memoized to prevent unnecessary re-renders
 * 
 * To further improve: Install react-native-fast-image
 * npm install react-native-fast-image
 * Then replace Image with FastImage
 */

const OptimizedImage = memo(({
    uri,
    style,
    resizeMode = 'cover',
    priority = 'normal',
    ...props
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoadStart = () => {
        setLoading(true);
        setError(false);
    };

    const handleLoadEnd = () => {
        setLoading(false);
    };

    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    if (error) {
        return (
            <View style={[styles.container, style, styles.errorContainer]}>
                <View style={styles.errorPlaceholder} />
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <Image
                source={{
                    uri,
                    // Add caching headers
                    cache: 'force-cache',
                }}
                style={[StyleSheet.absoluteFill, style]}
                resizeMode={resizeMode}
                onLoadStart={handleLoadStart}
                onLoadEnd={handleLoadEnd}
                onError={handleError}
                // Performance optimizations
                progressiveRenderingEnabled={true}
                fadeDuration={100}
                {...props}
            />
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#007bff" />
                </View>
            )}
        </View>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return prevProps.uri === nextProps.uri &&
        prevProps.resizeMode === nextProps.resizeMode;
});

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    errorContainer: {
        backgroundColor: '#e0e0e0',
    },
    errorPlaceholder: {
        flex: 1,
        backgroundColor: '#d0d0d0',
    },
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

