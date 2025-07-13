import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
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
  const categories = [
    { id: null, name: 'All', icon: 'apps', color: '#2563eb', type: 'Ion' },         // Blue
    { id: '1', name: 'Cars', icon: 'car', color: '#dc2626', type: 'MC' },           // Red
    { id: '2', name: 'Property', icon: 'home', color: '#16a34a', type: 'Ion' },     // Green
    { id: '7', name: 'Phones', icon: 'mobile-alt', color: '#f59e0b', type: 'Fontisto' }, // Amber
    { id: '29', name: 'Tech', icon: 'laptop', color: '#0ea5e9', type: 'FA5' },      // Sky blue
    { id: '24', name: 'Bikes', icon: 'motorbike', color: '#8b5cf6', type: 'MC' },   // Violet
    { id: '45', name: 'Furniture', icon: 'sofa', color: '#d97706', type: 'MC' },    // Warm yellow-brown
    { id: '51', name: 'Fashion', icon: 'tshirt-crew', color: '#ec4899', type: 'MC' }, // Pink
    { id: '55', name: 'Books', icon: 'menu-book', color: '#14b8a6', type: 'M' },    // Teal
  ];

  const renderItem = ({ item }) => {
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
            size={normalize(24)}
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

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || 'all'}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="always"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: normalize(8),
  },
  listContent: {
    paddingHorizontal: normalize(12),
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: normalize(16),
  },
  iconContainer: {
    backgroundColor: '#f8fafc',
    padding: normalize(12),
    borderRadius: normalize(12),
    marginBottom: normalize(4),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    fontSize: normalize(11),
    fontWeight: '500',
    color: '#64748b',
    maxWidth: normalize(80),
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
});

export default CategoryMenu;
