import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = (Dimensions.get('window').height) / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const iconMapping = {
  electronics: { name: 'television', type: 'MC' },
  fashion: { name: 'tshirt-crew', type: 'MC' },
  furniture: { name: 'sofa', type: 'MC' },
  cars: { name: 'car', type: 'MC' },
  bikes: {
    name: 'motorbike',
    type: 'MC'
  },
  mobiles: { name: 'mobile-alt', type: 'Fontisto' },
  services: { name: 'tools', type: 'MC' },
  commercial_vehicle_spare_part: { name: 'tow-truck', type: 'MC' },
  boks_sports_hobbies: { name: 'menu-book', type: 'M' },
  electronics_appliances: { name: 'electrical-services', type: 'M' },
  commercial_mechinery_spare_parts: { name: 'truck-ramp-box', type: 'FA6' },
  pets: { name: 'cat', type: 'FA6' },
  job: { name: 'people-carry-box', type: 'FA6' },
  properties: { name: 'home', type: 'Ion' },
};

const ParentCategoryPanel = memo(({ categories, onSelectCategory, isLoading, isError, isRefreshing }) => {
  const getIconComponent = (iconInfo) => {
    switch (iconInfo.type) {
      case 'M':
        return MIcon;
      case 'FA6':
        return FA6Icon;
      case 'FA5':
        return FA5Icon;
      case 'Fontisto':
        return Fontisto;
      case 'Ion':
        return Ionicons;
      case 'MC':
      default:
        return MCIcon;
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>All Categories</Text>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      </View>
    );
  }

  if (isError && categories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>All Categories</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Failed to load categories.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>All Categories</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={() => { }}
      >
        <View style={styles.gridContainer}>
          {categories.map((item) => {
            const iconInfo = iconMapping[item.guard_name] || { name: 'tag', type: 'MC' };
            const IconComponent = getIconComponent(iconInfo);
            const categoryColor = item.color || '#6b7280';

            return (
              <TouchableOpacity
                key={item.id.toString()}
                style={[styles.optionCard, { borderColor: `${categoryColor}30` }]}
                onPress={() => onSelectCategory(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
                  <IconComponent
                    name={iconInfo.name}
                    size={normalize(28)}
                    color={categoryColor}
                  />
                </View>
                <Text style={[styles.optionTitle, { color: categoryColor }]} numberOfLines={2}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
});


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: normalize(20),
    paddingTop: normalizeVertical(15),
    paddingBottom: normalizeVertical(15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  scrollContent: {
    padding: normalize(12),
    paddingTop: normalizeVertical(20),
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(4),
  },
  optionCard: {
    width: (width - normalize(48)) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalizeVertical(12),
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalizeVertical(10),
  },
  optionTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(32),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(32),
  },
  emptyText: {
    color: '#888888',
    fontSize: normalize(16),
  },
});

export default ParentCategoryPanel;