import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Switch, Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import VideoPickerComponent from './SubComponent/VideoPickerComponent';
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

const AddPgGuestHouse = ({ route, navigation }) => {
  const { category, subcategory, product, listingType } = route.params || {};
  const [formData, setFormData] = useState({
    pgType: 'PG',
    furnishing: 'Unfurnished',
    listedBy: 'Owner',
    carParking: '1',
    isMealIncluded: 'No',
    adTitle: '',
    carpetArea: '',
    description: '',
    amount: '',
    address: '', // Added address field
    latitude: null, // Added latitude
    longitude: null, // Added longitude
    images: [],
    deletedImages: [],
    videoUrl: null,
    videoId: null,
    listingType: listingType || 'sell',
    show_phone: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!product);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showPgTypeModal, setShowPgTypeModal] = useState(false);
  const [showFurnishingModal, setShowFurnishingModal] = useState(false);
  const [showListedByModal, setShowListedByModal] = useState(false);
  const [showCarParkingModal, setShowCarParkingModal] = useState(false);
  const [showMealsModal, setShowMealsModal] = useState(false);

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
            pgType: productData.post_details?.pg_type || 'PG',
            furnishing: productData.post_details?.furnishing || 'Unfurnished',
            listedBy: productData.post_details?.listed_by || 'Owner',
            carParking: productData.post_details?.car_parking || '1',
            isMealIncluded: productData.post_details?.is_meal_included || 'No',
            carpetArea: productData.post_details?.carpet_area || '',
            adTitle: productData.title || '',
            description: productData.post_details?.description || '',
            amount: productData.amount?.toString() || '',
            address: productData.address || '', // Initialize address
            latitude: productData.latitude || null, // Initialize latitude
            longitude: productData.longitude || null, // Initialize longitude
            images: productData.images?.map((url, index) => ({
              id: index,
              uri: url,
              isNew: false,
            })) || [],
            deletedImages: [],
            videoUrl: productData.videos?.[0] || productData.video_url || productData.videoUrl || null,
            videoId: productData.video_id || productData.videoId || null,
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

  const handleOptionSelection = (name, value) => {
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
              <Text style={modernStyles.headerTitle}>{subcategory?.name || 'PG & Guest House'}</Text>
              <Text style={modernStyles.headerSubtitle}>Add your property details</Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={modernStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {/* Type Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="home-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Type *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowPgTypeModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.pgType || 'Select Type'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Furnishing */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="cube-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Furnishing *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowFurnishingModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.furnishing || 'Select Furnishing'}
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

            {/* Carpet Area */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="square-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Carpet Area (ft²) *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter carpet area"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={formData.carpetArea}
                  onChangeText={(value) => handleChange('carpetArea', value)}
                />
              </View>
            </View>

            {/* Car Parking */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="car-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Car Parking *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowCarParkingModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.carParking || 'Select Car Parking'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Meals Included */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="restaurant-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Meals Included *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowMealsModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.isMealIncluded || 'Select Meals Included'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="text-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Title *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter title"
                  placeholderTextColor="#999"
                  value={formData.adTitle}
                  onChangeText={(value) => handleChange('adTitle', value)}
                />
              </View>
            </View>

            {/* Description */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="document-text-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Description *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={[modernStyles.input, modernStyles.textArea]}
                  placeholder="Describe your property..."
                  placeholderTextColor="#999"
                  value={formData.description}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  onChangeText={(value) => handleChange('description', value)}
                />
              </View>
            </View>

            {/* Amount */}
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

            {/* Address */}
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
                <Text style={modernStyles.label}>Photos</Text>
              </View>
              <ImagePickerComponent
                formData={formData}
                setFormData={setFormData}
              />
            </View>

            {/* Video Picker */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="videocam-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Video</Text>
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
          <View style={modernStyles.stickyButton}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[modernStyles.submitButton, (isSubmitting || isLoading) && modernStyles.disabledButton]}
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

      {/* Modern Selection Modals */}
      <ModernSelectionModal
        visible={showPgTypeModal}
        title="Select Type"
        options={['Guest House', 'PG', 'Roommate']}
        selectedValue={formData.pgType}
        onSelect={(value) => {
          handleOptionSelection('pgType', value);
          setShowPgTypeModal(false);
        }}
        onClose={() => setShowPgTypeModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showFurnishingModal}
        title="Select Furnishing"
        options={['Furnished', 'Semi-Furnished', 'Unfurnished']}
        selectedValue={formData.furnishing}
        onSelect={(value) => {
          handleOptionSelection('furnishing', value);
          setShowFurnishingModal(false);
        }}
        onClose={() => setShowFurnishingModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showListedByModal}
        title="Select Listed By"
        options={['Builder', 'Owner', 'Dealer']}
        selectedValue={formData.listedBy}
        onSelect={(value) => {
          handleOptionSelection('listedBy', value);
          setShowListedByModal(false);
        }}
        onClose={() => setShowListedByModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showCarParkingModal}
        title="Select Car Parking"
        options={['0', '1', '2', '3', '4', '5', '5+']}
        selectedValue={formData.carParking}
        onSelect={(value) => {
          handleOptionSelection('carParking', value);
          setShowCarParkingModal(false);
        }}
        onClose={() => setShowCarParkingModal(false)}
        searchable={false}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showMealsModal}
        title="Select Meals Included"
        options={['Yes', 'No']}
        selectedValue={formData.isMealIncluded}
        onSelect={(value) => {
          handleOptionSelection('isMealIncluded', value);
          setShowMealsModal(false);
        }}
        onClose={() => setShowMealsModal(false)}
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

export default AddPgGuestHouse;