import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Switch, Dimensions, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import VideoPickerComponent from './SubComponent/VideoPickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete.js';
import ModernSelectionModal from './SubComponent/ModernSelectionModal.js';
import { useAddProductFormStyles } from './useAddProductFormStyles';
import ModalScreen from '../SupportElement/ModalScreen.js';

const { width, height } = Dimensions.get('window');
const shortSide = Math.min(width, height);
const longSide = Math.max(width, height);
const scale = Math.min(Math.max(shortSide / 375, 0.9), 1.08);
const verticalScale = Math.min(Math.max(longSide / 812, 0.9), 1.08);
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const AddPgGuestHouse = ({ route, navigation }) => {
  const { modernStyles, placeholderColor, labelIconColor } = useAddProductFormStyles();
  const insets = useSafeAreaInsets();
  const bottomInset = insets?.bottom ?? 0;
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
            contentContainerStyle={[modernStyles.scrollContent, { paddingBottom: normalizeVertical(100) + bottomInset }]}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {/* Type Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="home-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
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
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* Furnishing */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="cube-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
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
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* Listed By */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="person-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
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
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* Carpet Area */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="square-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Carpet Area (ft²) *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter carpet area"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numeric"
                  value={formData.carpetArea}
                  onChangeText={(value) => handleChange('carpetArea', value)}
                />
              </View>
            </View>

            {/* Car Parking */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="car-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
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
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* Meals Included */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="restaurant-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
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
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="text-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Title *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter title"
                  placeholderTextColor={placeholderColor}
                  value={formData.adTitle}
                  onChangeText={(value) => handleChange('adTitle', value)}
                />
              </View>
            </View>

            {/* Description */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="document-text-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Description *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={[modernStyles.input, modernStyles.textArea]}
                  placeholder="Describe your property..."
                  placeholderTextColor={placeholderColor}
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

            {/* Address */}
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

export default AddPgGuestHouse;