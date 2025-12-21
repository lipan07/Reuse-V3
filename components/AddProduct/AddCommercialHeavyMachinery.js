import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Switch, Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete.js';
import ModernSelectionModal from './SubComponent/ModernSelectionModal.js';
import styles from '../../assets/css/AddProductForm.styles.js';
import ModalScreen from '../SupportElement/ModalScreen.js';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const AddCommercialHeavyMachinery = ({ route, navigation }) => {
  const { category, subcategory, product, listingType } = route.params || {};
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    brand: '',
    year: currentYear.toString(),
    fuelType: 'Diesel',
    transmission: 'Manual',
    condition: 'Fair',
    owners: '1st',
    listedBy: 'Owner',
    adTitle: '',
    description: '',
    contact_name: '',
    contact_phone: '',
    amount: '',
    kmDriven: '',
    address: '',
    latitude: null,
    longitude: null,
    images: [],
    deletedImages: [],
    listingType: listingType || 'sell',
    show_phone: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!product);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showFuelTypeModal, setShowFuelTypeModal] = useState(false);
  const [showTransmissionModal, setShowTransmissionModal] = useState(false);
  const [showOwnersModal, setShowOwnersModal] = useState(false);
  const [showListedByModal, setShowListedByModal] = useState(false);

  // Fetch product details if editing
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!product) return;

      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('authToken');
        const apiURL = `${process.env.BASE_URL}/posts/${product.id}`;
        const response = await fetch(apiURL, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const productData = data.data;
          setFormData({
            id: productData.id,
            brand: productData.post_details?.brand || '',
            year: productData.post_details?.year?.toString() || currentYear.toString(),
            fuelType: productData.post_details?.fuel_type || 'Diesel',
            transmission: productData.post_details?.transmission || 'Manual',
            condition: productData.post_details?.condition || 'Fair',
            owners: productData.post_details?.owner || '1st',
            listedBy: productData.post_details?.listed_by || 'Owner',
            adTitle: productData.title || '',
            description: productData.post_details?.description || '',
            contact_name: productData.post_details?.contact_name || '',
            contact_phone: productData.post_details?.contact_phone || '',
            amount: productData.amount?.toString() || '',
            kmDriven: productData.post_details?.km_driven?.toString() || '',
            address: productData.address || '',
            latitude: productData.latitude || null,
            longitude: productData.longitude || null,
            images: productData.images?.map((url, index) => ({
              id: index,
              uri: url,
              isNew: false,
            })) || [],
            deletedImages: [],
            show_phone: productData.show_phone === true || productData.show_phone === 1 || productData.show_phone === '1',
            listingType: productData.type || 'sell',
          });
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetails();
  }, [product]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await submitForm(formData, subcategory);

      setModalType(response.alert.type);
      setModalTitle(response.alert.title);
      setModalMessage(response.alert.message);
      setIsModalVisible(true);

      setIsSubmitting(false);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateYears = () => {
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year.toString());
    }
    return years;
  };

  const handleConditionSelection = (condition) => {
    setFormData((prev) => ({
      ...prev,
      condition: condition,
    }));
  };

  const handleFuelSelection = (fuel) => {
    setFormData((prev) => ({
      ...prev,
      fuelType: fuel,
    }));
  };

  const handleTransmissionSelection = (trans) => {
    setFormData((prev) => ({
      ...prev,
      transmission: trans,
    }));
  };

  const handleOwnersSelection = (owner) => {
    setFormData((prev) => ({
      ...prev,
      owners: owner,
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={modernStyles.safeArea}>
        <View style={modernStyles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={modernStyles.loaderText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleToggleShowPhone = (value) => {
    setFormData((prev) => ({
      ...prev,
      show_phone: value,
    }));
  };

  return (
    <>
      <SafeAreaView style={modernStyles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={modernStyles.container}
        >
          {/* Modern Header */}
          <View style={modernStyles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={modernStyles.backButton}
            >
              <Icon name="arrow-back" size={normalize(24)} color="#333" />
            </TouchableOpacity>
            <View style={modernStyles.headerContent}>
              <Text style={modernStyles.headerTitle}>{subcategory?.name || 'Commercial Heavy Machinery'}</Text>
              <Text style={modernStyles.headerSubtitle}>Add your machinery details</Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={modernStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {/* Brand Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="construct-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Brand *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowBrandModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.brand || 'Select Brand'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Condition Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="checkmark-circle-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Condition *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowConditionModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.condition || 'Select Condition'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Year Dropdown */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="calendar-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Year *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowYearModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.year || 'Select Year'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Fuel Type Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="flash-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Fuel Type *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowFuelTypeModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.fuelType || 'Select Fuel Type'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Transmission Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="settings-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Transmission *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowTransmissionModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.transmission || 'Select Transmission'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* KM Driven Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="speedometer-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>KM Driven *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter KM driven"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={formData.kmDriven}
                  onChangeText={(value) => handleChange('kmDriven', value)}
                />
              </View>
            </View>

            {/* Number of Owners Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="people-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Number of Owners *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowOwnersModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.owners || 'Select Number of Owners'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Listed By */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="person-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Listed By *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowListedByModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.listedBy || 'Select Listed By'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Ad Title Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="text-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Ad Title *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter ad title"
                  placeholderTextColor="#999"
                  value={formData.adTitle}
                  onChangeText={(value) => handleChange('adTitle', value)}
                />
              </View>
            </View>

            {/* Description Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="document-text-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Description *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={[modernStyles.input, modernStyles.textArea]}
                  placeholder="Describe your machinery..."
                  placeholderTextColor="#999"
                  value={formData.description}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  onChangeText={(value) => handleChange('description', value)}
                />
              </View>
            </View>

            {/* Contact Name */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="person-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Contact Name *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter contact name"
                  placeholderTextColor="#999"
                  value={formData.contact_name}
                  onChangeText={(value) => handleChange('contact_name', value)}
                />
              </View>
            </View>

            {/* Contact Phone */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="call-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Contact Phone *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter contact phone"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={formData.contact_phone}
                  onChangeText={(value) => handleChange('contact_phone', value)}
                />
              </View>
            </View>

            {/* Amount Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="cash-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Amount *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter amount"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={(value) => handleChange('amount', value)}
                />
              </View>
            </View>

            {/* Address Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="location-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Address *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <AddressAutocomplete
                  initialAddress={formData.address}
                  initialLatitude={formData.latitude}
                  initialLongitude={formData.longitude}
                  onAddressSelect={handleAddressSelect}
                  styles={{
                    container: modernStyles.locationContainer,
                    inputWrapper: modernStyles.locationInputWrapper,
                    input: modernStyles.locationInput,
                    predictionsContainer: modernStyles.locationPredictions,
                    predictionItem: modernStyles.locationPredictionItem,
                    predictionText: modernStyles.locationPredictionText,
                  }}
                />
              </View>
            </View>

            {/* Show Phone Number Toggle */}
            <View style={[modernStyles.fieldContainer, modernStyles.toggleContainer]}>
              <View style={modernStyles.toggleContent}>
                <View style={modernStyles.toggleLeft}>
                  <Icon name="call-outline" size={normalize(20)} color="#666" style={modernStyles.toggleIcon} />
                  <View>
                    <Text style={modernStyles.toggleTitle}>Show Phone Number</Text>
                    <Text style={modernStyles.toggleDescription}>
                      Allow buyers to contact you directly
                    </Text>
                  </View>
                </View>
                <Switch
                  value={formData.show_phone}
                  onValueChange={handleToggleShowPhone}
                  trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                  thumbColor={formData.show_phone ? '#FFFFFF' : '#F4F3F4'}
                  ios_backgroundColor="#E0E0E0"
                />
              </View>
            </View>

            {/* Image Picker */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="images-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Upload Images (Optional)</Text>
              </View>
              <ImagePickerComponent
                formData={formData}
                setFormData={setFormData}
              />
            </View>
          </ScrollView>

          {/* Sticky Submit Button */}
          <View style={modernStyles.stickyButton}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[modernStyles.submitButton, (isSubmitting || isLoading) && modernStyles.disabledButton]}
              disabled={isSubmitting || isLoading}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="checkmark-circle-outline" size={normalize(20)} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={modernStyles.submitButtonText}>
                    {product ? 'Update Listing' : 'Submit Listing'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ModalScreen
        visible={isModalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => {
          setIsModalVisible(false);
          if (modalType === 'success') navigation.goBack();
        }}
      />

      {/* Selection Modals */}
      <ModernSelectionModal
        visible={showBrandModal}
        title="Select Brand"
        options={[
          'Caterpillar',
          'JCB',
          'Tata Hitachi',
          'Volvo',
          'Komatsu',
          'L&T Construction Equipment',
          'BEML (Bharat Earth Movers Limited)',
          'Hyundai Construction Equipment',
          'SANY',
          'Case Construction',
          'Doosan',
          'Mahindra Construction Equipment',
          'LiuGong',
          'John Deere',
          'XCMG',
          'Others',
        ]}
        selectedValue={formData.brand}
        onSelect={(value) => handleChange('brand', value)}
        onClose={() => setShowBrandModal(false)}
        searchable={true}
      />

      <ModernSelectionModal
        visible={showConditionModal}
        title="Select Condition"
        options={['New', 'Like new', 'Fair', 'Needs repair']}
        selectedValue={formData.condition}
        onSelect={(value) => handleConditionSelection(value)}
        onClose={() => setShowConditionModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showYearModal}
        title="Select Year"
        options={generateYears().map(year => ({ label: year, value: year }))}
        selectedValue={formData.year}
        onSelect={(value) => handleChange('year', value)}
        onClose={() => setShowYearModal(false)}
        searchable={true}
      />

      <ModernSelectionModal
        visible={showFuelTypeModal}
        title="Select Fuel Type"
        options={['Diesel', 'Electric', 'Petrol', 'Others']}
        selectedValue={formData.fuelType}
        onSelect={(value) => handleFuelSelection(value)}
        onClose={() => setShowFuelTypeModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showTransmissionModal}
        title="Select Transmission"
        options={['Automatic', 'Manual']}
        selectedValue={formData.transmission}
        onSelect={(value) => handleTransmissionSelection(value)}
        onClose={() => setShowTransmissionModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showOwnersModal}
        title="Number of Owners"
        options={['1st', '2nd', '3rd', '4th', '5th', '6th']}
        selectedValue={formData.owners}
        onSelect={(value) => handleOwnersSelection(value)}
        onClose={() => setShowOwnersModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showListedByModal}
        title="Select Listed By"
        options={['Dealer', 'Owner']}
        selectedValue={formData.listedBy}
        onSelect={(value) => handleChange('listedBy', value)}
        onClose={() => setShowListedByModal(false)}
        multiColumn={true}
      />

    </>
  );
};

const modernStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingTop: normalizeVertical(12),
    paddingBottom: normalizeVertical(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: normalizeVertical(2),
  },
  headerSubtitle: {
    fontSize: normalize(13),
    color: '#6B7280',
    fontWeight: '400',
  },
  scrollContent: {
    padding: normalize(20),
    paddingBottom: normalizeVertical(100),
  },
  fieldContainer: {
    marginBottom: normalizeVertical(24),
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalizeVertical(10),
  },
  labelIcon: {
    marginRight: normalize(8),
  },
  label: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.2,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalizeVertical(14),
    fontSize: normalize(15),
    color: '#1F2937',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: normalizeVertical(100),
    paddingTop: normalizeVertical(14),
    textAlignVertical: 'top',
  },
  addressInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalizeVertical(14),
    fontSize: normalize(15),
    color: '#1F2937',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalizeVertical(14),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  selectButtonText: {
    fontSize: normalize(15),
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  toggleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    padding: normalize(16),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    marginRight: normalize(12),
  },
  toggleTitle: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: '#374151',
    marginBottom: normalizeVertical(2),
  },
  toggleDescription: {
    fontSize: normalize(12),
    color: '#6B7280',
    fontWeight: '400',
  },
  stickyButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: normalize(20),
    paddingTop: normalizeVertical(12),
    paddingBottom: normalizeVertical(Platform.OS === 'ios' ? 20 : 16),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: normalize(12),
    paddingVertical: normalizeVertical(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loaderText: {
    marginTop: normalizeVertical(12),
    fontSize: normalize(15),
    color: '#6B7280',
    fontWeight: '500',
  },
  locationContainer: {
    marginBottom: 0,
    zIndex: 100,
  },
  locationInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingLeft: normalize(16),
    paddingRight: normalize(8),
    minHeight: normalizeVertical(48),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  locationInput: {
    flex: 1,
    paddingVertical: normalizeVertical(14),
    paddingRight: normalize(8),
    fontSize: normalize(15),
    color: '#1F2937',
    textAlign: 'left',
  },
  locationPredictions: {
    position: 'absolute',
    top: normalize(48),
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: normalize(180),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  locationPredictionItem: {
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationPredictionText: {
    fontSize: normalize(13),
    color: '#374151',
    lineHeight: normalize(18),
  },
});

export default AddCommercialHeavyMachinery;