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
        <Text style={styles.headerSubtitle}>Choose your listing type to get started</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {listingTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.optionCard, { borderColor: `${type.color}20` }]}
              onPress={() => handleSelection(type.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { 
                backgroundColor: `${type.color}12`,
                borderColor: `${type.color}25`
              }]}>
                <Icon name={type.icon} size={normalize(26)} color={type.color} />
              </View>
              <Text style={[styles.optionTitle, { color: type.color }]}>{type.title}</Text>
              <Text style={styles.optionDescription}>{type.description}</Text>
              <View style={[styles.arrowContainer, { backgroundColor: `${type.color}10` }]}>
                <Icon name="chevron-forward" size={normalize(16)} color={type.color} />
              </View>
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
  headerTitle: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: normalizeVertical(4),
    letterSpacing: -0.3,
  },
  headerSubtitle: {
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
    fontSize: normalize(15),
    fontWeight: '700',
    marginBottom: normalizeVertical(4),
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  optionDescription: {
    fontSize: normalize(11),
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: normalize(14),
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
});

export default ListingTypeSelection;

