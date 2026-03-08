import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { normalize, isTablet } from '../utils/responsive';

const ITEMS_PER_ROW_MOBILE = 6;

const CategoryMenu = ({ onCategorySelect, selectedCategory }) => {
  const { width } = useWindowDimensions();
  const [showAll, setShowAll] = useState(false);
  const tablet = isTablet(width);

  const n = (size) => normalize(size, width);

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
            size={n(22)}
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
            size={n(22)}
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

  // Mobile: grid with 6 per row, 2 rows + Show all button
  const createGridRows = (items) => {
    const rows = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_ROW_MOBILE) {
      rows.push(items.slice(i, i + ITEMS_PER_ROW_MOBILE));
    }
    return rows;
  };
  const itemsWithButton = [...visibleCategories, { isButton: true }];
  const gridRows = tablet ? [] : createGridRows(itemsWithButton);

  const styles = useMemo(() => ({
    container: {
      backgroundColor: '#ffffff',
      paddingVertical: n(8),
    },
    // Tablet: single horizontal row
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: n(8),
      paddingVertical: n(4),
    },
    // Mobile: grid container and row
    gridContainer: {
      paddingHorizontal: n(8),
    },
    gridRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: n(8),
    },
    categoryItem: tablet
      ? { alignItems: 'center', marginRight: n(6), minWidth: n(56) }
      : { alignItems: 'center', flex: 1, marginHorizontal: n(1) },
    emptyItem: {
      flex: 1,
      marginHorizontal: n(1),
    },
    iconContainer: {
      backgroundColor: '#f7f7f7ff',
      padding: n(8),
      width: n(50),
      height: n(50),
      borderRadius: n(12),
      marginBottom: n(4),
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
      fontSize: n(10),
      fontWeight: '500',
      color: '#64748b',
      textAlign: 'center',
      maxWidth: n(55),
    },
    selectedText: {
      color: '#007bff',
      fontWeight: '600',
    },
    selectedItem: {},
    icon: { textAlign: 'center' },
    showAllIconContainer: {
      backgroundColor: '#f8f9fa',
      padding: n(8),
      width: n(50),
      height: n(50),
      borderRadius: n(12),
      marginBottom: n(4),
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
      fontSize: n(10),
      fontWeight: '600',
      color: '#007bff',
      textAlign: 'center',
      maxWidth: n(55),
    },
  }), [width, tablet]);

  // Tablet: single horizontal scrollable row with Show all at end
  if (tablet) {
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {visibleCategories.map((item) => renderCategoryItem(item))}
          {renderShowAllButton()}
        </ScrollView>
      </View>
    );
  }

  // Mobile: two rows (6 per row) with Show all button
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
            {row.length < ITEMS_PER_ROW_MOBILE &&
              Array.from({ length: ITEMS_PER_ROW_MOBILE - row.length }).map((_, index) => (
                <View key={`empty-${index}`} style={styles.emptyItem} />
              ))}
          </View>
        ))}
      </View>
    </View>
  );
};

export default CategoryMenu;
