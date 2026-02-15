import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons';

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

const ParentCategoryPanel = memo(({ categories, onSelectCategory, isLoading, isError, isRefreshing, listBottomPadding = 0 }) => {
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
        <Text style={styles.headerText}>Browse Categories</Text>
        <Text style={styles.headerSubtext}>Select a category to continue</Text>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, listBottomPadding > 0 && { paddingBottom: listBottomPadding }]}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={() => { }}
      >
        <View style={styles.gridContainer}>
          {categories.map((item) => {
            const iconInfo = iconMapping[item.guard_name] || { name: 'tag', type: 'MC' };
            const IconComponent = getIconComponent(iconInfo);
            const categoryColor = item.color || '#6b7280';
            const hasChildren = item.children && item.children.length > 0;

            return (
              <TouchableOpacity
                key={item.id.toString()}
                style={[styles.optionCard, { borderColor: `${categoryColor}20` }]}
                onPress={() => onSelectCategory(item)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, { 
                  backgroundColor: `${categoryColor}12`,
                  borderColor: `${categoryColor}25`
                }]}>
                  <IconComponent
                    name={iconInfo.name}
                    size={normalize(26)}
                    color={categoryColor}
                  />
                </View>
                <Text style={[styles.optionTitle, { color: categoryColor }]} numberOfLines={2}>
                  {item.name}
                </Text>
                {hasChildren && (
                  <View style={[styles.badgeContainer, { backgroundColor: `${categoryColor}10` }]}>
                    <Text style={[styles.badgeText, { color: categoryColor }]}>
                      {item.children.length} {item.children.length === 1 ? 'option' : 'options'}
                    </Text>
                  </View>
                )}
                <View style={[styles.arrowContainer, { backgroundColor: `${categoryColor}10` }]}>
                  <Ionicons
                    name="chevron-forward"
                    size={normalize(16)}
                    color={categoryColor}
                  />
                </View>
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: normalize(20),
    paddingTop: normalizeVertical(12),
    paddingBottom: normalizeVertical(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerText: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: normalizeVertical(3),
    letterSpacing: -0.3,
  },
  headerSubtext: {
    fontSize: normalize(12),
    color: '#6B7280',
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
  optionCard: {
    width: (width - normalize(40)) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    padding: normalize(14),
    marginBottom: normalizeVertical(10),
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    fontSize: normalize(14),
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: normalize(18),
  },
  badgeContainer: {
    marginTop: normalizeVertical(6),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(10),
  },
  badgeText: {
    fontSize: normalize(10),
    fontWeight: '600',
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
    color: '#6B7280',
    fontSize: normalize(16),
    fontWeight: '500',
  },
});

export default ParentCategoryPanel;