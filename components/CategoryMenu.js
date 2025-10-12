import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const CategoryMenu = ({ onCategorySelect, selectedCategory }) => {
  const [showAll, setShowAll] = useState(false);

  const allCategories = [
    { id: null, name: 'All', icon: 'apps', color: '#2563eb', type: 'Ion' },         // Blue
    { id: '1', name: 'Cars', icon: 'car', color: '#dc2626', type: 'MC' },           // Red
    { id: '2', name: 'Properties', icon: 'home', color: '#16a34a', type: 'Ion' },     // Green
    { id: '7', name: 'Mobiles', icon: 'mobile-alt', color: '#f59e0b', type: 'Fontisto' }, // Amber
    { id: '8', name: 'Job', icon: 'briefcase', color: '#84cc16', type: 'Ion' },   // Lime
    { id: '24', name: 'Bikes', icon: 'motorbike', color: '#8b5cf6', type: 'MC' },   // Violet
    { id: '29', name: 'Electronics & Appliances', icon: 'laptop', color: '#0ea5e9', type: 'FA5' },      // Sky blue
    { id: '39', name: 'Vehicle', icon: 'truck', color: '#f97316', type: 'FA5' },         // Orange
    { id: '42', name: 'Machinery', icon: 'cog', color: '#8b5cf6', type: 'FA5' }, // Purple
    { id: '45', name: 'Furniture', icon: 'sofa', color: '#d97706', type: 'MC' },    // Warm yellow-brown
    { id: '51', name: 'Fashion', icon: 'tshirt-crew', color: '#ec4899', type: 'MC' }, // Pink
    { id: '55', name: 'Books, Sports & Hobbies', icon: 'menu-book', color: '#14b8a6', type: 'M' },    // Teal
    { id: '61', name: 'Pets', icon: 'paw', color: '#f97316', type: 'FA5' },         // Orange
    { id: '66', name: 'Services', icon: 'tools', color: '#06b6d4', type: 'FA5' },   // Cyan
    { id: '76', name: 'Others', icon: 'dots-horizontal', color: '#6b7280', type: 'MC' },   // Gray
  ];

  // Show only first 11 categories initially, rest when "Show All" is clicked
  // When expanded, show all parent categories + Other category
  const parentCategories = allCategories.filter(cat => cat.id !== '76');
  const otherCategory = allCategories.find(cat => cat.id === '76');

  const visibleCategories = showAll
    ? [...parentCategories, otherCategory]
    : parentCategories.slice(0, 11);

  const renderCategoryItem = (item) => {
    const isSelected = selectedCategory === item.id;

    let IconComponent;
    switch (item.type) {
      case 'M':
        IconComponent = MIcon;
        break;
      case 'FA6':
        IconComponent = FA6Icon;
        break;
      case 'FA5':
        IconComponent = FA5Icon;
        break;
      case 'Fontisto':
        IconComponent = Fontisto;
        break;
      case 'Ion':
        IconComponent = Ionicons;
        break;
      case 'MC':
      default:
        IconComponent = MCIcon;
        break;
    }

    return (
      <TouchableOpacity
        key={item.id?.toString() || 'all'}
        style={[
          styles.categoryItem,
          isSelected && styles.selectedItem
        ]}
        onPress={() => onCategorySelect(item.id)}
      >
        <View style={[
          styles.iconContainer,
          isSelected && styles.selectedIconContainer
        ]}>
          <IconComponent
            name={item.icon}
            size={normalize(22)}
            color={isSelected ? '#ffffff' : item.color}
            style={styles.icon}
          />
        </View>
        <Text style={[
          styles.categoryName,
          isSelected && styles.selectedText
        ]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderShowAllButton = () => {
    return (
      <TouchableOpacity
        key="show-all-button"
        style={styles.categoryItem}
        onPress={() => setShowAll(!showAll)}
      >
        <View style={styles.showAllIconContainer}>
          <MCIcon
            name={showAll ? 'chevron-up' : 'chevron-down'}
            size={normalize(22)}
            color="#007bff"
            style={styles.icon}
          />
        </View>
        <Text style={styles.showAllText} numberOfLines={1}>
          {showAll ? 'Show Less' : 'Show All'}
        </Text>
      </TouchableOpacity>
    );
  };

  // Create grid layout with 6 items per row
  const createGridRows = (items) => {
    const rows = [];
    for (let i = 0; i < items.length; i += 6) {
      rows.push(items.slice(i, i + 6));
    }
    return rows;
  };

  // Create items array with Show All/Show Less button
  const itemsWithButton = [...visibleCategories, { isButton: true }];
  const gridRows = createGridRows(itemsWithButton);

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {gridRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map((item, itemIndex) => {
              if (item.isButton) {
                return renderShowAllButton();
              }
              return renderCategoryItem(item);
            })}
            {/* Fill empty spaces in the last row if needed */}
            {row.length < 6 && Array.from({ length: 6 - row.length }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.emptyItem} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: normalize(8),
  },
  gridContainer: {
    paddingHorizontal: normalize(8),
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(8),
  },
  categoryItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: normalize(1),
  },
  emptyItem: {
    flex: 1,
    marginHorizontal: normalize(1),
  },
  iconContainer: {
    backgroundColor: '#f7f7f7ff',
    padding: normalize(8),
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(12),
    marginBottom: normalize(4),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIconContainer: {
    backgroundColor: '#007bff',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryName: {
    fontSize: normalize(10),
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    maxWidth: normalize(55),
  },
  selectedText: {
    color: '#007bff',
    fontWeight: '600',
  },
  selectedItem: {
    // Future enhancements can go here
  },
  icon: {
    textAlign: 'center',
  },
  showAllIconContainer: {
    backgroundColor: '#f8f9fa',
    padding: normalize(8),
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(12),
    marginBottom: normalize(4),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  showAllText: {
    fontSize: normalize(10),
    fontWeight: '600',
    color: '#007bff',
    textAlign: 'center',
    maxWidth: normalize(55),
  },
});

export default CategoryMenu;
