import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import OptimizedImage from './OptimizedImage';
import { useTheme } from '../context/ThemeContext';

function createOptimizedProductStyles(width, isDarkMode) {
  const d = isDarkMode;
  const scale = width / 375;
  const normalize = (size) => Math.round(scale * size);
  const cardBg = d ? '#1e293b' : '#fff';
  const imageBg = d ? '#0f172a' : '#f0f0f0';
  const placeholderBg = d ? '#1e293b' : '#f5f5f5';

  return StyleSheet.create({
    productItem: {
      width: (width - 30) / 2,
      margin: 5,
      backgroundColor: cardBg,
      borderRadius: normalize(8),
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: d ? 0.35 : 0.1,
      shadowRadius: 4,
      borderWidth: d ? 1 : 0,
      borderColor: d ? '#334155' : 'transparent',
    },
    imageContainer: {
      width: '100%',
      height: normalize(150),
      backgroundColor: imageBg,
      position: 'relative',
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    placeholderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: placeholderBg,
    },
    placeholderText: {
      marginTop: 8,
      fontSize: normalize(12),
      color: d ? '#94a3b8' : '#999',
      textAlign: 'center',
    },
    videoPlaceholderContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
      position: 'relative',
    },
    videoIndicator: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: normalize(8),
      padding: normalize(16),
    },
    videoIndicatorText: {
      color: '#FFFFFF',
      fontSize: normalize(12),
      fontWeight: '600',
      marginTop: normalize(8),
      textAlign: 'center',
    },
    productTag: {
      position: 'absolute',
      top: normalize(8),
      left: normalize(8),
      paddingHorizontal: normalize(8),
      paddingVertical: normalize(4),
      borderRadius: normalize(4),
      zIndex: 2,
    },
    rentTag: {
      backgroundColor: 'rgba(59, 130, 246, 0.9)',
    },
    sellTag: {
      backgroundColor: 'rgba(34, 197, 94, 0.9)',
    },
    tagText: {
      color: '#fff',
      fontSize: normalize(10),
      fontWeight: 'bold',
    },
    imageCountBadge: {
      position: 'absolute',
      top: normalize(8),
      right: normalize(8),
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: normalize(6),
      paddingVertical: normalize(3),
      borderRadius: normalize(4),
      zIndex: 2,
    },
    imageCountText: {
      color: '#fff',
      fontSize: normalize(10),
      fontWeight: 'bold',
      marginLeft: 2,
    },
    distanceBadge: {
      position: 'absolute',
      bottom: normalize(8),
      right: normalize(8),
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: normalize(6),
      paddingVertical: normalize(3),
      borderRadius: normalize(4),
      zIndex: 2,
    },
    distanceText: {
      color: '#fff',
      fontSize: normalize(10),
      fontWeight: 'bold',
      marginLeft: 2,
    },
    textContainer: {
      padding: normalize(10),
    },
    productName: {
      fontSize: normalize(14),
      fontWeight: 'bold',
      color: d ? '#f1f5f9' : '#333',
      marginBottom: normalize(4),
    },
    details: {
      fontSize: normalize(12),
      color: d ? '#94a3b8' : '#666',
      marginBottom: normalize(6),
      lineHeight: normalize(16),
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: normalize(6),
    },
    address: {
      fontSize: normalize(11),
      color: d ? '#94a3b8' : '#888',
      marginLeft: 2,
      flex: 1,
    },
    priceContainer: {
      marginTop: normalize(4),
    },
    price: {
      fontWeight: 'bold',
    },
    priceText: {
      fontSize: normalize(14),
      color: d ? '#60a5fa' : '#007bff',
      fontWeight: 'bold',
    },
  });
}

/**
 * Optimized Product Card Component
 * - Memoized to prevent unnecessary re-renders
 * - Uses OptimizedImage for better image performance
 * - Simplified image handling (removed Swiper for performance)
 * - Only re-renders when product data changes
 */
const OptimizedProduct = memo(({ item, distance }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  const styles = useMemo(
    () => createOptimizedProductStyles(width, isDarkMode),
    [width, isDarkMode]
  );

  const handlePress = () => {
    navigation.navigate('ProductDetails', { productDetails: item });
  };

  const imageUri = item.images && item.images.length > 0
    ? item.images[0]
    : null;

  const imageCount = item.images?.length || 0;

  const hasVideo = !imageUri && item.videos && item.videos.length > 0;

  const scale = width / 375;
  const normalize = (size) => Math.round(scale * size);
  const locIcon = isDarkMode ? '#94a3b8' : '#888';

  return (
    <TouchableOpacity
      style={styles.productItem}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <View style={[
          styles.productTag,
          item.type === 'rent' ? styles.rentTag : styles.sellTag
        ]}>
          <Text style={styles.tagText}>
            {item.type === 'rent' ? 'Rent' : 'Sell'}
          </Text>
        </View>

        {imageCount > 1 && (
          <View style={styles.imageCountBadge}>
            <Icon name="photo-library" size={normalize(10)} color="#fff" />
            <Text style={styles.imageCountText}>{imageCount}</Text>
          </View>
        )}

        {distance && (
          <View style={styles.distanceBadge}>
            <Icon name="location-on" size={normalize(10)} color="#fff" />
            <Text style={styles.distanceText}>{distance}</Text>
          </View>
        )}

        {imageUri ? (
          <OptimizedImage
            uri={imageUri}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : hasVideo ? (
          <View style={styles.videoPlaceholderContainer}>
            <View style={styles.videoIndicator}>
              <Icon name="videocam" size={normalize(40)} color="#FFFFFF" />
              <Text style={styles.videoIndicatorText}>Video Available</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon name="image" size={normalize(40)} color={isDarkMode ? '#475569' : '#ccc'} />
            <Text style={styles.placeholderText}>
              {item.category?.name || 'No image'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.details} numberOfLines={2} ellipsizeMode="tail">
          {item.post_details?.description || 'No description'}
        </Text>

        <View style={styles.locationContainer}>
          <Icon name="location-on" size={normalize(12)} color={locIcon} />
          <Text style={styles.address} numberOfLines={1}>
            {item.address || 'Address not available'}
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
              <Text style={styles.priceText}>
              ₹{item.amount ?? item.post_details?.amount ?? 'N/A'}
            </Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
    prevProps.distance === nextProps.distance;
});

OptimizedProduct.displayName = 'OptimizedProduct';

export default OptimizedProduct;
