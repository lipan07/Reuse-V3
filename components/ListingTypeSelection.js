import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from './BottomNavBar';
import { useTheme } from '../context/ThemeContext';
import { useAdSettings } from '../context/AdSettingsContext';
import { AD_SETTING_SLUGS } from '../constants/adSettingSlugs';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  TestIds,
} from 'react-native-google-mobile-ads';

/** Native Advanced (NativeAd) unit for this screen */
const listingTypeFeedNativeAdUnitId = __DEV__
  ? TestIds.NATIVE
  : (process.env.G_MY_ADS_FEED_NATIVE_AD_UNIT_ID || TestIds.NATIVE);

const { width, height } = Dimensions.get('window');
const shortSide = Math.min(width, height);
const longSide = Math.max(width, height);
const scale = Math.min(Math.max(shortSide / 375, 0.9), 1.08);
const verticalScale = Math.min(Math.max(longSide / 812, 0.9), 1.08);
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const ListingTypeSelection = () => {
  const navigation = useNavigation();
  const { isAdEnabled } = useAdSettings();
  const { isDarkMode } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: isDarkMode ? '#121212' : '#F8F9FA',
        },
        header: {
          paddingHorizontal: normalize(20),
          paddingTop: normalizeVertical(12),
          paddingBottom: normalizeVertical(12),
          backgroundColor: isDarkMode ? '#0f172a' : '#FFFFFF',
          borderBottomWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        },
        headerTitle: {
          fontSize: normalize(20),
          fontWeight: '700',
          color: isDarkMode ? '#f1f5f9' : '#1A1A1A',
          textAlign: 'center',
          marginBottom: normalizeVertical(4),
          letterSpacing: -0.3,
        },
        headerSubtitle: {
          fontSize: normalize(12),
          color: isDarkMode ? '#94a3b8' : '#6B7280',
          textAlign: 'center',
          fontWeight: '400',
        },
        scrollContent: {
          padding: normalize(12),
          paddingTop: normalizeVertical(16),
          paddingBottom: normalizeVertical(16),
        },
        gridContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          paddingHorizontal: normalize(4),
        },
        adWrap: {
          width: '100%',
          alignItems: 'center',
          marginVertical: normalizeVertical(6),
        },
        adContainer: {
          width: '100%',
          alignSelf: 'center',
        },
        nativeAdContainer: {
          width: '100%',
          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
          borderRadius: normalize(14),
          padding: normalize(12),
          borderWidth: 1,
          borderColor: isDarkMode ? '#334155' : '#E8E8E8',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        },
        nativeMedia: {
          width: '100%',
          height: normalizeVertical(120),
          borderRadius: normalize(12),
          backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
          marginBottom: normalizeVertical(8),
          overflow: 'hidden',
        },
        nativeHeadline: {
          fontSize: normalize(14),
          fontWeight: '800',
          color: isDarkMode ? '#F8FAFC' : '#0F172A',
          marginBottom: normalizeVertical(4),
        },
        nativeBody: {
          fontSize: normalize(12),
          color: isDarkMode ? '#94a3b8' : '#6B7280',
          marginBottom: normalizeVertical(8),
          lineHeight: normalize(15),
        },
        nativeCta: {
          alignSelf: 'flex-start',
          paddingVertical: normalizeVertical(8),
          paddingHorizontal: normalize(12),
          borderRadius: normalize(10),
          backgroundColor: '#007BFF',
        },
        nativeCtaText: {
          alignSelf: 'flex-start',
          color: '#FFFFFF',
          fontWeight: '800',
          fontSize: normalize(12),
          paddingVertical: normalizeVertical(8),
          paddingHorizontal: normalize(12),
          borderRadius: normalize(10),
          backgroundColor: '#007BFF',
        },
        optionCard: {
          width: (shortSide - normalize(40)) / 2,
          backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF',
          borderRadius: normalize(12),
          padding: normalize(14),
          marginBottom: normalizeVertical(10),
          borderWidth: 1,
          alignItems: 'center',
          position: 'relative',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
        },
        iconContainer: {
          width: normalize(52),
          height: normalize(52),
          borderRadius: normalize(16),
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: normalizeVertical(8),
          borderWidth: 1,
        },
        optionTitle: {
          fontSize: normalize(15),
          fontWeight: '700',
          marginBottom: normalizeVertical(4),
          textAlign: 'center',
          letterSpacing: -0.2,
        },
        optionDescription: {
          fontSize: normalize(11),
          color: isDarkMode ? '#94a3b8' : '#6B7280',
          textAlign: 'center',
          fontWeight: '400',
          lineHeight: normalize(14),
        },
        arrowContainer: {
          position: 'absolute',
          top: normalize(8),
          right: normalize(8),
          width: normalize(20),
          height: normalize(20),
          borderRadius: normalize(10),
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    [isDarkMode]
  );

  const listingTypes = [
    {
      id: 'sell',
      title: 'Sell',
      description: 'List your item',
      icon: 'cash-outline',
      color: '#4CAF50',
    },
    {
      id: 'rent',
      title: 'Rent',
      description: 'Rent out item',
      icon: 'calendar-outline',
      color: '#2196F3',
    },
    {
      id: 'donate',
      title: 'Donate',
      description: 'Give away free',
      icon: 'heart-outline',
      color: '#E91E63',
    },
    {
      id: 'post_requirement',
      title: 'Post Requirement',
      description: 'Looking for?',
      icon: 'search-outline',
      color: '#FF9800',
    },
  ];

  const handleSelection = (listingType) => {
    if (listingType === 'post_requirement' || listingType === 'donate') {
      // Navigate directly to AddOthers for post requirement and donate
      navigation.navigate('AddOthers', {
        category: { id: 76, guard_name: 'others', name: 'Others' },
        subcategory: { id: 76, guard_name: 'others', name: 'Others' },
        listingType: listingType,
      });
    } else {
      // Navigate to ProductAddPage with listingType for sell and rent
      navigation.navigate('ProductAddPage', {
        listingType: listingType,
      });
    }
  };

  const NativeAdvancedAdSlot = () => {
    const [nativeAd, setNativeAd] = React.useState(null);

    React.useEffect(() => {
      let isMounted = true;
      let adInstance = null;

      const load = async () => {
        try {
          adInstance = await NativeAd.createForAdRequest(listingTypeFeedNativeAdUnitId);
          if (isMounted) setNativeAd(adInstance);
        } catch (e) {
          console.warn('NativeAd load failed:', e);
        }
      };

      load();

      return () => {
        isMounted = false;
        try {
          adInstance?.destroy?.();
        } catch (_) {}
      };
    }, []);

    if (!nativeAd) return null;

    return (
      <View style={styles.nativeAdContainer}>
        <NativeAdView nativeAd={nativeAd}>
          <NativeAsset assetType={NativeAssetType.IMAGE}>
            <NativeMediaView style={styles.nativeMedia} resizeMode="cover" />
          </NativeAsset>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text style={styles.nativeHeadline} numberOfLines={1} />
          </NativeAsset>
          <NativeAsset assetType={NativeAssetType.BODY}>
            <Text style={styles.nativeBody} numberOfLines={2} />
          </NativeAsset>
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Text style={styles.nativeCtaText} />
          </NativeAsset>
        </NativeAdView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What would you like to do?</Text>
        <Text style={styles.headerSubtitle}>Choose your listing type to get started</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {listingTypes.map((type, index) => (
            <React.Fragment key={type.id}>
              <TouchableOpacity
                style={[styles.optionCard, { borderColor: `${type.color}20` }]}
                onPress={() => handleSelection(type.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: `${type.color}12`,
                      borderColor: `${type.color}25`,
                    },
                  ]}
                >
                  <Icon name={type.icon} size={normalize(26)} color={type.color} />
                </View>
                <Text style={[styles.optionTitle, { color: type.color }]}>{type.title}</Text>
                <Text style={styles.optionDescription}>{type.description}</Text>
                <View style={[styles.arrowContainer, { backgroundColor: `${type.color}10` }]}>
                  <Icon name="chevron-forward" size={normalize(16)} color={type.color} />
                </View>
              </TouchableOpacity>

              {/* Insert native advanced ad after the last selection card (after 4 cards) */}
              {index === 3 && isAdEnabled(AD_SETTING_SLUGS.LISTING_TYPE_NATIVE) && (
                <View style={styles.adWrap}>
                  <View style={styles.adContainer}>
                    <NativeAdvancedAdSlot />
                  </View>
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
};

export default ListingTypeSelection;

