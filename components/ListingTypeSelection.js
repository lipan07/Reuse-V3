import React from 'react';
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

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const ListingTypeSelection = () => {
  const navigation = useNavigation();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What would you like to do?</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {listingTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.optionCard, { borderColor: `${type.color}30` }]}
              onPress={() => handleSelection(type.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${type.color}15` }]}>
                <Icon name={type.icon} size={normalize(28)} color={type.color} />
              </View>
              <Text style={[styles.optionTitle, { color: type.color }]}>{type.title}</Text>
              <Text style={styles.optionDescription}>{type.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
};

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
  headerTitle: {
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
    fontSize: normalize(16),
    fontWeight: '600',
    marginBottom: normalizeVertical(4),
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: normalize(12),
    color: '#666',
    textAlign: 'center',
  },
});

export default ListingTypeSelection;

