import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotification } from '../context/NotificationContext';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

// Use only the system-reported bottom inset: gesture nav = 0 (bar at bottom, no margin);
// 3-button nav = system inset (bar sits above buttons). No extra minimum so gesture has no margin.
function getBottomInset(insets) {
  return insets?.bottom ?? 0;
}

const BottomNavBar = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const bottomInset = getBottomInset(insets);
  const { notificationCount } = useNotification();

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const navItems = [
    { key: 'Home', route: 'Home', icon: 'home-outline', color: '#4CAF50', size: normalize(30) },
    { key: 'My Ads', route: 'MyAdsPage', icon: 'briefcase-outline', color: '#FF9800', size: normalize(30) },
    { key: 'Add Product', route: 'ListingTypeSelection', icon: 'add-circle', color: '#E91E63', size: normalize(50), bump: true, showText: false },
    { key: 'Chat', route: 'ChatList', icon: 'chatbubble-ellipses-outline', color: '#2196F3', size: normalize(30) },
    { key: 'Account', route: 'AccountPage', icon: 'person-outline', color: '#9C27B0', size: normalize(30) },
  ];

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

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
    height: normalizeVertical(52),
    minHeight: 52,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: normalize(8),
    marginHorizontal: normalize(8),
    borderRadius: normalize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: normalize(8),
    color: '#555',
    marginTop: 2,
  },
  bump: {
    marginTop: -normalizeVertical(22),
    backgroundColor: '#fff',
    borderRadius: normalize(50),
    padding: normalize(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  iconWrapper: {
    position: 'relative',
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
});

export default BottomNavBar;
