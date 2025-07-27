import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from './Screens/Header';
import CustomStatusBar from './Screens/CustomStatusBar';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;

const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const PackagePage = ({ navigation }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const packageData = [
    {
      id: '1',
      title: 'General Listing',
      price: '$9.99/month',
      icon: 'https://cdn.icon-icons.com/icons2/3233/PNG/512/empty_box_package_icon_197143.png',
      features: [
        'List up to 10 products',
        'Basic product visibility',
        'Standard customer support',
        '30-day listing duration',
        'Mobile & electronics focus'
      ],
      description: 'Perfect for individual sellers listing a few items occasionally'
    },
    {
      id: '2',
      title: 'Standard Seller',
      price: '$19.99/month',
      icon: 'https://cdn.icon-icons.com/icons2/3233/PNG/512/empty_box_package_icon_197143.png',
      features: [
        'List up to 50 products',
        'Enhanced search visibility',
        'Priority customer support',
        '90-day listing duration',
        'Special badges for your listings',
        'Machinery & vehicles category'
      ],
      description: 'Ideal for regular sellers with multiple items across categories'
    },
    {
      id: '3',
      title: 'Premium Vendor',
      price: '$29.99/month',
      icon: 'https://cdn.icon-icons.com/icons2/3233/PNG/512/empty_box_package_icon_197143.png',
      features: [
        'Unlimited product listings',
        'Top search priority placement',
        '24/7 dedicated support',
        'Featured in category highlights',
        'Professional storefront page',
        'Real estate & property focus',
        'Promotional email inclusion'
      ],
      description: 'For power sellers and businesses with high-volume listings'
    },
    {
      id: '4',
      title: 'Enterprise',
      price: 'Custom Pricing',
      icon: 'https://cdn.icon-icons.com/icons2/3233/PNG/512/empty_box_package_icon_197143.png',
      features: [
        'Customizable storefront',
        'API access for inventory sync',
        'Dedicated account manager',
        'Bulk listing tools',
        'Advanced analytics dashboard',
        'Cross-promotion opportunities',
        'White-glove onboarding',
        'Multi-user access'
      ],
      description: 'For large businesses and professional resellers'
    },
  ];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderPackageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.packageItem,
        expandedId === item.id && styles.expandedItem
      ]}
      onPress={() => toggleExpand(item.id)}
    >
      <View style={styles.packageHeader}>
        <Image source={{ uri: item.icon }} style={styles.packageIcon} />
        <View style={styles.titleContainer}>
          <Text style={styles.packageTitle}>{item.title}</Text>
          <Text style={styles.packagePrice}>{item.price}</Text>
        </View>
        <Icon
          name={expandedId === item.id ? 'expand-less' : 'expand-more'}
          size={normalize(20)}
          color="#555"
        />
      </View>

      {expandedId === item.id && (
        <View style={styles.detailsContainer}>
          <Text style={styles.descriptionText}>{item.description}</Text>

          <Text style={styles.featuresTitle}>Package Features:</Text>
          <View style={styles.featuresContainer}>
            {item.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Icon name="check-circle" size={normalize(16)} color="#27ae60" style={styles.featureIcon} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Select Package</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (

    <>
      <CustomStatusBar />
      {/* Header with proper spacing */}
      <View>
        <Header
          title="Packages"
          navigation={navigation}
          darkMode={darkMode}
        />
        <View style={[styles.separator, darkMode && styles.darkSeparator]} />
      </View>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seller Packages</Text>
          <Text style={styles.headerSubtitle}>Boost your sales with specialized seller packages</Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>Why Upgrade?</Text>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitCard}>
              <Icon name="visibility" size={normalize(20)} color="#3498db" />
              <Text style={styles.benefitText}>Increased Visibility</Text>
            </View>
            <View style={styles.benefitCard}>
              <Icon name="star" size={normalize(20)} color="#f39c12" />
              <Text style={styles.benefitText}>Premium Badges</Text>
            </View>
            <View style={styles.benefitCard}>
              <Icon name="trending-up" size={normalize(20)} color="#2ecc71" />
              <Text style={styles.benefitText}>Higher Sales</Text>
            </View>
            <View style={styles.benefitCard}>
              <Icon name="headset-mic" size={normalize(20)} color="#9b59b6" />
              <Text style={styles.benefitText}>Priority Support</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose Your Package</Text>
        <FlatList
          data={packageData}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />

        <View style={styles.faqContainer}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I switch packages later?</Text>
            <Text style={styles.faqAnswer}>Yes, you can upgrade or downgrade at any time. Your billing will be prorated accordingly.</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Do packages auto-renew?</Text>
            <Text style={styles.faqAnswer}>Packages renew automatically each month. You can cancel anytime in your account settings.</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
            <Text style={styles.faqAnswer}>We accept all major credit cards, PayPal, and bank transfers for enterprise accounts.</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: normalizeVertical(50),
  },
  contentContainer: {
    paddingHorizontal: normalize(16),
    paddingTop: normalizeVertical(16),
    paddingBottom: normalizeVertical(30),
  },
  header: {
    marginBottom: normalizeVertical(20),
    alignItems: 'center',
    paddingHorizontal: normalize(8),
  },
  headerTitle: {
    fontSize: normalize(22), // Reduced from 28
    fontWeight: '700', // Changed from 800
    color: '#2c3e50',
    marginBottom: normalizeVertical(6),
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: normalize(14), // Reduced from 16
    color: '#7f8c8d',
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: normalizeVertical(20),
  },
  sectionTitle: {
    fontSize: normalize(18), // Reduced from 20
    fontWeight: '600', // Changed from 700
    color: '#2c3e50',
    marginBottom: normalizeVertical(12), // Reduced from 16
  },
  benefitsContainer: {
    marginBottom: normalizeVertical(20),
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    width: (width - normalize(48)) / 2,
    backgroundColor: '#fff',
    borderRadius: normalize(10),
    padding: normalize(12), // Reduced from 16
    marginBottom: normalizeVertical(10), // Reduced from 12
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  benefitText: {
    fontSize: normalize(13), // Reduced from 14
    fontWeight: '500', // Changed from 600
    color: '#34495e',
    marginTop: normalizeVertical(6), // Reduced from 8
    textAlign: 'center',
  },
  packageItem: {
    backgroundColor: '#fff',
    borderRadius: normalize(14), // Reduced from 16
    padding: normalize(16), // Reduced from 20
    marginBottom: normalizeVertical(14), // Reduced from 16
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  expandedItem: {
    borderColor: '#3498db',
    borderWidth: 1.5, // Reduced from 2
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Reduced from 0.2
    shadowRadius: 6, // Reduced from 8
    elevation: 4,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packageIcon: {
    width: normalize(44), // Reduced from 50
    height: normalize(44), // Reduced from 50
    resizeMode: 'contain',
    marginRight: normalize(14), // Reduced from 16
  },
  titleContainer: {
    flex: 1,
  },
  packageTitle: {
    fontWeight: '600', // Changed from 700
    fontSize: normalize(16), // Reduced from 18
    color: '#2c3e50',
  },
  packagePrice: {
    fontWeight: '600',
    fontSize: normalize(14), // Reduced from 16
    color: '#3498db',
  },
  detailsContainer: {
    marginTop: normalizeVertical(16), // Reduced from 20
    paddingTop: normalizeVertical(16), // Reduced from 20
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  descriptionText: {
    fontSize: normalize(14), // Reduced from 15
    color: '#7f8c8d',
    marginBottom: normalizeVertical(14), // Reduced from 16
    lineHeight: normalizeVertical(20), // Reduced from 22
  },
  featuresTitle: {
    fontWeight: '600', // Changed from 700
    fontSize: normalize(15), // Reduced from 16
    color: '#2c3e50',
    marginBottom: normalizeVertical(10), // Reduced from 12
  },
  featuresContainer: {
    marginBottom: normalizeVertical(16), // Reduced from 20
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: normalizeVertical(8), // Reduced from 10
  },
  featureIcon: {
    marginRight: normalize(6), // Reduced from 8
    marginTop: normalizeVertical(2), // Reduced from 3
  },
  featureText: {
    flex: 1,
    fontSize: normalize(14), // Reduced from 15
    color: '#34495e',
  },
  selectButton: {
    backgroundColor: '#27ae60',
    paddingVertical: normalizeVertical(12), // Reduced from 14
    borderRadius: normalize(10), // Reduced from 12
    alignItems: 'center',
    marginTop: normalizeVertical(8), // Reduced from 10
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: '600', // Changed from 700
    fontSize: normalize(14), // Reduced from 16
  },
  faqContainer: {
    marginTop: normalizeVertical(6), // Reduced from 8
    marginBottom: normalizeVertical(24), // Reduced from 30
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: normalize(12), // Reduced from 16
    padding: normalize(14), // Reduced from 16
    marginBottom: normalizeVertical(10), // Reduced from 12
  },
  faqQuestion: {
    fontWeight: '600', // Changed from 700
    fontSize: normalize(15), // Reduced from 16
    color: '#2c3e50',
    marginBottom: normalizeVertical(6), // Reduced from 8
  },
  faqAnswer: {
    fontSize: normalize(13), // Reduced from 14
    color: '#7f8c8d',
    lineHeight: normalizeVertical(18), // Reduced from 20
  },
});

export default PackagePage;