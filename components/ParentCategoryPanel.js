import React, { memo } from 'react';
import { View, Text, TouchableHighlight, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
  const rainbowColors = ['#FF0000', '#FF7F00', '#4B0082', '#00FF00', '#0000FF', '#FFFFF', '#9400D3'];

  const renderItem = ({ item, index }) => {
    const iconInfo = iconMapping[item.guard_name] || { name: 'tag', type: 'MC' };

    let IconComponent;
    switch (iconInfo.type) {
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
      <TouchableHighlight
        underlayColor="#F0F0F0"
        style={styles.itemContainer}
        onPress={() => onSelectCategory(item)}
      >
        <View style={styles.itemContent}>
          <View style={styles.iconWrapper}>
            <IconComponent
              name={iconInfo.name}
              size={24}
              color={rainbowColors[index % rainbowColors.length]}
              solid
            />
          </View>
          <Text style={styles.itemText}>{item.name}</Text>
          <MCIcon
            name="chevron-right"
            size={20}
            color="#888888"
            style={styles.arrow}
          />
        </View>
      </TouchableHighlight>
    );
  };

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;
    return <ActivityIndicator size="large" color="#4A90E2" style={styles.loadingIndicator} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* ✅ Header like SubCategoryPanel */}
      <View style={styles.header}>
        <Text style={styles.headerText}>All Categories</Text>
        <Text style={styles.subHeaderText}>Select a parent category</Text>
      </View>

      <FlatList
        data={categories}
        renderItem={({ item, index }) => renderItem({ item, index })}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={renderFooter}
        refreshing={isRefreshing}
        onRefresh={() => { }} // implement if needed
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isError ? 'Failed to load categories.' : 'No categories available'}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
});


const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 16,
  },
  arrow: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#888888',
    fontSize: 16,
  },

  iconWrapper: {
    width: 32, // enough space for icons to align consistently
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },

  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },

  subHeaderText: {
    fontSize: 14,
    color: '#888888',
  },

});

export default ParentCategoryPanel;