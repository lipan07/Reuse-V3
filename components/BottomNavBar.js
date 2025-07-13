import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Responsive utility
const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const BottomNavBar = () => {
  const navigation = useNavigation();

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const navItems = [
    { key: 'Home', route: 'Home', icon: 'home-outline', color: '#4CAF50', size: normalize(28) },
    { key: 'My Ads', route: 'MyAdsPage', icon: 'briefcase-outline', color: '#FF9800', size: normalize(28) },
    { key: 'Add Product', route: 'ProductAddPage', icon: 'add-circle', color: '#E91E63', size: normalize(45), bump: true, showText: false },
    { key: 'Chat', route: 'ChatList', icon: 'chatbubble-ellipses-outline', color: '#2196F3', size: normalize(28) },
    { key: 'Account', route: 'AccountPage', icon: 'person-outline', color: '#9C27B0', size: normalize(28) }
  ];

  return (
    <View style={styles.bottomNav}>
      {navItems.map(({ key, route, icon, color, size, bump, showText }) => (
        <TouchableOpacity
          key={key}
          onPress={() => handleNavigation(route)}
          style={[
            styles.navItem,
            bump && styles.bump
          ]}
        >
          <Icon name={icon} size={size} color={color} />
          {showText && <Text style={styles.navText}>{key}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: normalizeVertical(38),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: normalize(4),
    marginBottom: normalizeVertical(6), // Add this line for consistent bottom margin
  },
  navText: {
    fontSize: normalize(8),
    color: '#555'
  },
  bump: {
    marginTop: -normalizeVertical(20),
    backgroundColor: '#fff',
    borderRadius: normalize(50),
    padding: normalize(5),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: normalizeVertical(1),
    },
    shadowOpacity: 0.18,
    shadowRadius: normalize(2),
    elevation: 3,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default BottomNavBar;
