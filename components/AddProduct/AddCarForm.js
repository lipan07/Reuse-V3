import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Switch, Dimensions, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import VideoPickerComponent from './SubComponent/VideoPickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete';
import { useAddProductFormStyles } from './useAddProductFormStyles';
import ModernSelectionModal from './SubComponent/ModernSelectionModal.js';
import ModalScreen from '../SupportElement/ModalScreen.js';

const { width, height } = Dimensions.get('window');
const shortSide = Math.min(width, height);
const longSide = Math.max(width, height);
const scale = Math.min(Math.max(shortSide / 375, 0.9), 1.08);
const verticalScale = Math.min(Math.max(longSide / 812, 0.9), 1.08);
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const BRAND_OPTIONS = [
  { label: 'Maruti Suzuki', value: 'Maruti Suzuki' },
  { label: 'Hyundai', value: 'Hyundai' },
  { label: 'Tata', value: 'Tata' },
  { label: 'Mahindra', value: 'Mahindra' },
  { label: 'Toyota', value: 'Toyota' },
  { label: 'Honda', value: 'Honda' },
  { label: 'BYD', value: 'BYD' },
  { label: 'Audi', value: 'Audi' },
  { label: 'Ambassador', value: 'Ambassador' },
  { label: 'Ashok', value: 'Ashok' },
  { label: 'Ashok Leyland', value: 'Ashok Leyland' },
  { label: 'Aston', value: 'Aston' },
  { label: 'Aston Martin', value: 'Aston Martin' },
  { label: 'Bajaj', value: 'Bajaj' },
  { label: 'Bentley', value: 'Bentley' },
  { label: 'Citroen', value: 'Citroen' },
  { label: 'McLaren', value: 'McLaren' },
  { label: 'Fisker', value: 'Fisker' },
  { label: 'BMW', value: 'BMW' },
  { label: 'Bugatti', value: 'Bugatti' },
  { label: 'Cadillac', value: 'Cadillac' },
  { label: 'Caterham', value: 'Caterham' },
  { label: 'Chevrolet', value: 'Chevrolet' },
  { label: 'Chrysler', value: 'Chrysler' },
  { label: 'Conquest', value: 'Conquest' },
  { label: 'Daewoo', value: 'Daewoo' },
  { label: 'Datsun', value: 'Datsun' },
  { label: 'Dc', value: 'Dc' },
  { label: 'Dodge', value: 'Dodge' },
  { label: 'Eicher Polaris', value: 'Eicher Polaris' },
  { label: 'Ferrari', value: 'Ferrari' },
  { label: 'Fiat', value: 'Fiat' },
  { label: 'Force Motors', value: 'Force Motors' },
  { label: 'Ford', value: 'Ford' },
  { label: 'Hummer', value: 'Hummer' },
  { label: 'ICML', value: 'ICML' },
  { label: 'Infiniti', value: 'Infiniti' },
  { label: 'Isuzu', value: 'Isuzu' },
  { label: 'Jaguar', value: 'Jaguar' },
  { label: 'Jeep', value: 'Jeep' },
  { label: 'Kia', value: 'Kia' },
  { label: 'Lamborghini', value: 'Lamborghini' },
  { label: 'Land Rover', value: 'Land Rover' },
  { label: 'Lexus', value: 'Lexus' },
  { label: 'Mahindra Renault', value: 'Mahindra Renault' },
  { label: 'Maserati', value: 'Maserati' },
  { label: 'Maybach', value: 'Maybach' },
  { label: 'Mazda', value: 'Mazda' },
  { label: 'Mercedes-Benz', value: 'Mercedes-Benz' },
  { label: 'MG', value: 'MG' },
  { label: 'Mini', value: 'Mini' },
  { label: 'Mitsubishi', value: 'Mitsubishi' },
  { label: 'Nissan', value: 'Nissan' },
  { label: 'Opel', value: 'Opel' },
  { label: 'Peugeot', value: 'Peugeot' },
  { label: 'Porsche', value: 'Porsche' },
  { label: 'Premier', value: 'Premier' },
  { label: 'Renault', value: 'Renault' },
  { label: 'Rolls-Royce', value: 'Rolls-Royce' },
  { label: 'San', value: 'San' },
  { label: 'Sipani', value: 'Sipani' },
  { label: 'Skoda', value: 'Skoda' },
  { label: 'Smart', value: 'Smart' },
  { label: 'Ssangyong', value: 'Ssangyong' },
  { label: 'Subaru', value: 'Subaru' },
  { label: 'Volkswagen', value: 'Volkswagen' },
  { label: 'Volvo', value: 'Volvo' },
  { label: 'Other Brands', value: 'Other Brands' },
];

const AddCarForm = ({ route, navigation }) => {
  const { modernStyles, placeholderColor, labelIconColor } = useAddProductFormStyles();
  const insets = useSafeAreaInsets();
  const bottomInset = insets?.bottom ?? 0;
  const { category, subcategory, product, listingType } = route.params || {};
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    listingType: listingType || 'sell',
    brand: '',
    year: currentYear.toString(),
    fuelType: 'Petrol',
    transmission: 'Automatic',
    kmDriven: '',
    owners: '1st',
    adTitle: '',
    description: '',
    amount: '',
    address: '',
    latitude: null,
    longitude: null,
    images: [],
    deletedImages: [],
    videoUrl: null,
    videoId: null,
    show_phone: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!product);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Selection Modal States
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showTransmissionModal, setShowTransmissionModal] = useState(false);
  const [showOwnersModal, setShowOwnersModal] = useState(false);

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
          console.log('Product data for editing:', productData);
          console.log('show_phone value:', productData.show_phone, 'type:', typeof productData.show_phone);
          console.log('show_phone converted:', productData.show_phone === true || productData.show_phone === 1 || productData.show_phone === '1');
          setFormData({
            id: productData.id,
            listingType: productData?.type || 'sell',
            brand: productData.post_details?.brand || '',
            year: productData.post_details?.year?.toString() || currentYear.toString(),
            fuelType: productData.post_details?.fuel || 'Petrol',
            transmission: productData.post_details?.transmission || 'Automatic',
            kmDriven: productData.post_details?.km_driven?.toString() || '',
            owners: productData.post_details?.no_of_owner || '1st',
            adTitle: productData.title || '',
            description: productData.post_details?.description || '',
            amount: productData.amount?.toString() || '',
            address: productData.address || '',
            latitude: productData.latitude || null,
            longitude: productData.longitude || null,
            images: productData.images?.map((url, index) => ({
              id: index,
              uri: url,
              isNew: false,
            })) || [],
            deletedImages: [],
            videoUrl: productData.videos?.[0] || productData.video_url || productData.videoUrl || null,
            videoId: productData.video_id || productData.videoId || null,
            show_phone: productData.show_phone === true || productData.show_phone === 1 || productData.show_phone === '1',
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
              <Text style={modernStyles.headerTitle}>{subcategory?.name || 'Car Listing'}</Text>
              <Text style={modernStyles.headerSubtitle}>Add your car details</Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[modernStyles.scrollContent, { paddingBottom: normalizeVertical(100) + bottomInset }]}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {/* Brand Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="car-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
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
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* Year Dropdown */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="calendar-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
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
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* Fuel Type Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="flash-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Fuel Type *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowFuelModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.fuelType || 'Select Fuel Type'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* Transmission Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="settings-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
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
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* KM Driven Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="speedometer-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>KM Driven *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter KM Driven"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numeric"
                  value={formData.kmDriven}
                  onChangeText={(value) => handleChange('kmDriven', value)}
                />
              </View>
            </View>

            {/* Number of Owners Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="people-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
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
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* Ad Title Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="text-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Ad Title *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter ad title"
                  placeholderTextColor={placeholderColor}
                  value={formData.adTitle}
                  onChangeText={(value) => handleChange('adTitle', value)}
                />
              </View>
            </View>

            {/* Description Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="document-text-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Description *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={[modernStyles.input, modernStyles.textArea]}
                  placeholder="Describe your car..."
                  placeholderTextColor={placeholderColor}
                  value={formData.description}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  onChangeText={(value) => handleChange('description', value)}
                />
              </View>
            </View>

            {/* Amount Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="cash-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Amount *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter amount"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={(value) => handleChange('amount', value)}
                />
              </View>
            </View>

            {/* Address Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="location-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
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
                  <Icon name="call-outline" size={normalize(20)} color={labelIconColor} style={modernStyles.toggleIcon} />
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
                <Icon name="images-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Upload Images (Optional)</Text>
              </View>
              <ImagePickerComponent
                formData={formData}
                setFormData={setFormData}
              />
            </View>

            {/* Video Picker */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="videocam-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Upload Video (Optional)</Text>
              </View>
              <VideoPickerComponent
                formData={formData}
                setFormData={setFormData}
                propertyTitle={formData.adTitle}
                onUploadStateChange={setIsVideoUploading}
                onShowAlert={(type, title, message) => {
                  setModalType(type);
                  setModalTitle(title);
                  setModalMessage(message);
                  setIsModalVisible(true);
                }}
              />
            </View>
          </ScrollView>

          {/* Sticky Submit Button */}
          <View style={[modernStyles.stickyButton, { bottom: bottomInset }]}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[modernStyles.submitButton, (isSubmitting || isLoading || isVideoUploading) && modernStyles.disabledButton]}
              disabled={isSubmitting || isLoading || isVideoUploading}
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
        options={BRAND_OPTIONS}
        selectedValue={formData.brand}
        onSelect={(value) => handleChange('brand', value)}
        onClose={() => setShowBrandModal(false)}
        searchable={true}
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
        visible={showFuelModal}
        title="Select Fuel Type"
        options={['CNG & Hybrids', 'Diesel', 'Electric', 'LPG', 'Petrol']}
        selectedValue={formData.fuelType}
        onSelect={(value) => handleChange('fuelType', value)}
        onClose={() => setShowFuelModal(false)}
      />

      <ModernSelectionModal
        visible={showTransmissionModal}
        title="Select Transmission"
        options={['Automatic', 'Manual']}
        selectedValue={formData.transmission}
        onSelect={(value) => handleChange('transmission', value)}
        onClose={() => setShowTransmissionModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showOwnersModal}
        title="Number of Owners"
        options={['1st', '2nd', '3rd', '4th', '5th', '6th']}
        selectedValue={formData.owners}
        onSelect={(value) => handleChange('owners', value)}
        onClose={() => setShowOwnersModal(false)}
        multiColumn={true}
      />

    </>
  );
};

export default AddCarForm;
