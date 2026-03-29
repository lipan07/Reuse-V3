import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { normalize, normalizeVertical } from '../utils/responsive';

// Use only the system-reported bottom inset: gesture nav = 0 (bar at bottom, no margin);
// 3-button nav = system inset (bar sits above buttons). No extra minimum so gesture has no margin.
function getBottomInset(insets) {
  return insets?.bottom ?? 0;
}

const BottomNavBar = () => {
  const { isDarkMode } = useTheme();
  const { width: rawWidth, height: rawHeight } = useWindowDimensions();
  const width = Math.max(rawWidth || 375, 200);
  const height = Math.max(rawHeight || 812, 400);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const bottomInset = getBottomInset(insets);
  const { notificationCount } = useNotification();

  const n = (size) => normalize(size, width);
  const nV = (size) => normalizeVertical(size, height);

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const navItems = useMemo(() => [
    { key: 'Home', route: 'Home', icon: 'home-outline', color: '#4CAF50', size: n(30) },
    { key: 'My Ads', route: 'MyAdsPage', icon: 'briefcase-outline', color: '#FF9800', size: n(30) },
    { key: 'Add Product', route: 'ListingTypeSelection', icon: 'add-circle', color: '#E91E63', size: n(50), bump: true, showText: false },
    { key: 'Chat', route: 'ChatList', icon: 'chatbubble-ellipses-outline', color: '#2196F3', size: n(30) },
    { key: 'Account', route: 'AccountPage', icon: 'person-outline', color: '#9C27B0', size: n(30) },
  ], [width]);

  const barBg = isDarkMode ? 'rgba(30, 41, 59, 0.92)' : 'rgba(255, 255, 255, 0.75)';
  const bumpBg = isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.82)';
  const barBorder = isDarkMode ? 'rgba(71, 85, 105, 0.9)' : 'rgba(224, 224, 224, 0.8)';

  const styles = useMemo(() => StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 999,
      elevation: 24,
    },
    bar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: barBg,
      height: nV(52),
      minHeight: 48,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: barBorder,
      paddingHorizontal: n(8),
      marginHorizontal: n(8),
      borderRadius: n(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: isDarkMode ? 0.35 : 0.08,
      shadowRadius: 8,
      elevation: 12,
    },
    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    navText: {
      fontSize: n(8),
      color: isDarkMode ? '#cbd5e1' : '#555',
      marginTop: 2,
    },
    bump: {
      marginTop: -nV(18),
      backgroundColor: bumpBg,
      borderRadius: n(32),
      width: n(64),
      height: n(64),
      minWidth: 56,
      minHeight: 56,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 6,
    },
    iconWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -10,
      backgroundColor: '#e53935',
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
    },
  }), [width, height, isDarkMode, barBg, bumpBg, barBorder]);

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom: bottomInset,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {navItems.map(({ key, route, icon, color, size, bump, showText }) => (
          <TouchableOpacity
            key={key}
            onPress={() => handleNavigation(route)}
            style={[styles.navItem, bump && styles.bump]}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Icon name={icon} size={size} color={color} />
              {key === 'Chat' && notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </View>
            {showText && <Text style={styles.navText}>{key}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default BottomNavBar;
