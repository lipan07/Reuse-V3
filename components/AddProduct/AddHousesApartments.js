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
import ModalScreen from '../SupportElement/ModalScreen';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const AddHousesApartments = ({ route, navigation }) => {
  const { category, subcategory, product, listingType } = route.params || {};
  const [formData, setFormData] = useState({
    propertyType: 'Apartments',
    bedroom: '2',
    bathroom: '1',
    furnishing: 'Unfurnished',
    constructionStatus: 'Ready to Move',
    listedBy: 'Owner',
    carParking: '1',
    facing: 'East',
    superBuiltupArea: '',
    carpetArea: '',
    maintenance: '',
    totalFloors: '',
    floorNo: '',
    projectName: '',
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
    deletedVideoUrl: null,
    deletedVideoId: null,
    show_phone: false,
    listingType: listingType || 'sell',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!product);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [shouldNavigateOnClose, setShouldNavigateOnClose] = useState(false);
  const [showPropertyTypeModal, setShowPropertyTypeModal] = useState(false);
  const [showBedroomModal, setShowBedroomModal] = useState(false);
  const [showBathroomModal, setShowBathroomModal] = useState(false);
  const [showFacingModal, setShowFacingModal] = useState(false);
  const [showFurnishingModal, setShowFurnishingModal] = useState(false);
  const [showConstructionStatusModal, setShowConstructionStatusModal] = useState(false);
  const [showListedByModal, setShowListedByModal] = useState(false);
  const [showCarParkingModal, setShowCarParkingModal] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    type: 'error',
    title: 'Error',
    message: 'Something went wrong.',
  });

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
            propertyType: productData.post_details?.property_type || 'Apartments',
            bedroom: productData.post_details?.bedrooms?.toString() || '2',
            bathroom: productData.post_details?.bathrooms?.toString() || '1',
            furnishing: productData.post_details?.furnishing || 'Unfurnished',
            constructionStatus: productData.post_details?.construction_status || 'Ready to Move',
            listedBy: productData.post_details?.listed_by || 'Owner',
            carParking: productData.post_details?.car_parking?.toString() || '1',
            facing: productData.post_details?.facing || 'East',
            superBuiltupArea: productData.post_details?.super_builtup_area?.toString() || '',
            carpetArea: productData.post_details?.carpet_area?.toString() || '',
            maintenance: productData.post_details?.maintenance?.toString() || '',
            totalFloors: productData.post_details?.total_floors?.toString() || '',
            floorNo: productData.post_details?.floor_no?.toString() || '',
            projectName: productData.post_details?.project_name || '',
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

  const handleSelection = (name, value) => {
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
      setShouldNavigateOnClose(true); // Only navigate back on form submission success
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
          <Text style={modernStyles.loaderText}>Loading property details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleOptionSelection = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
              <Text style={modernStyles.headerTitle}>{subcategory?.name || 'Property Listing'}</Text>
              <Text style={modernStyles.headerSubtitle}>Add your property details</Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={modernStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {/* Property Type Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="home-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Property Type *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowPropertyTypeModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.propertyType || 'Select Property Type'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Bedroom Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="bed-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Bedroom *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowBedroomModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.bedroom || 'Select Bedroom'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Bathroom Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="water-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Bathroom *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowBathroomModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.bathroom || 'Select Bathroom'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Facing Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="compass-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Facing *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowFacingModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.facing || 'Select Facing'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Furnishing Selection */}
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

            {/* Construction Status Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="construct-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Construction Status *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowConstructionStatusModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.constructionStatus || 'Select Construction Status'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Listed By Selection */}
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

            {/* Car Parking Selection */}
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

            {/* Super Builtup Area */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="resize-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Super Builtup Area (ft²)</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter super builtup area"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={formData.superBuiltupArea}
                  onChangeText={(value) => handleChange('superBuiltupArea', value)}
                />
              </View>
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

            {/* Maintenance */}
            {formData.maintenance !== undefined && (
              <View style={modernStyles.fieldContainer}>
                <View style={modernStyles.labelContainer}>
                  <Icon name="cash-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                  <Text style={modernStyles.label}>Maintenance</Text>
                </View>
                <View style={modernStyles.inputWrapper}>
                  <TextInput
                    style={modernStyles.input}
                    placeholder="Enter maintenance"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.maintenance}
                    onChangeText={(value) => handleChange('maintenance', value)}
                  />
                </View>
              </View>
            )}

            {/* Total Floors */}
            {formData.totalFloors !== undefined && (
              <View style={modernStyles.fieldContainer}>
                <View style={modernStyles.labelContainer}>
                  <Icon name="layers-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                  <Text style={modernStyles.label}>Total Floors</Text>
                </View>
                <View style={modernStyles.inputWrapper}>
                  <TextInput
                    style={modernStyles.input}
                    placeholder="Enter total floors"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.totalFloors}
                    onChangeText={(value) => handleChange('totalFloors', value)}
                  />
                </View>
              </View>
            )}

            {/* Floor No */}
            {formData.floorNo !== undefined && (
              <View style={modernStyles.fieldContainer}>
                <View style={modernStyles.labelContainer}>
                  <Icon name="arrow-up-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                  <Text style={modernStyles.label}>Floor No</Text>
                </View>
                <View style={modernStyles.inputWrapper}>
                  <TextInput
                    style={modernStyles.input}
                    placeholder="Enter floor number"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.floorNo}
                    onChangeText={(value) => handleChange('floorNo', value)}
                  />
                </View>
              </View>
            )}

            {/* Project Name */}
            {formData.projectName !== undefined && (
              <View style={modernStyles.fieldContainer}>
                <View style={modernStyles.labelContainer}>
                  <Icon name="business-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
                  <Text style={modernStyles.label}>Project Name</Text>
                </View>
                <View style={modernStyles.inputWrapper}>
                  <TextInput
                    style={modernStyles.input}
                    placeholder="Enter project name"
                    placeholderTextColor="#999"
                    value={formData.projectName}
                    onChangeText={(value) => handleChange('projectName', value)}
                  />
                </View>
              </View>
            )}

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

            {/* Video Picker */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="videocam-outline" size={normalize(18)} color="#666" style={modernStyles.labelIcon} />
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
                  setShouldNavigateOnClose(false); // Don't navigate back on video upload success
                  setIsModalVisible(true);
                }}
              />
            </View>
          </ScrollView>

          {/* Sticky Submit Button */}
          <View style={modernStyles.stickyButton}>
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
          // Only navigate back if it's a form submission success, not video upload success
          if (modalType === 'success' && shouldNavigateOnClose) {
            navigation.goBack();
          }
        }}
      />

      {/* Selection Modals */}
      <ModernSelectionModal
        visible={showPropertyTypeModal}
        title="Select Property Type"
        options={['Apartments', 'Builder Floors', 'Farm Houses', 'Houses & Villas']}
        selectedValue={formData.propertyType}
        onSelect={(value) => handleSelection('propertyType', value)}
        onClose={() => setShowPropertyTypeModal(false)}
      />

      <ModernSelectionModal
        visible={showBedroomModal}
        title="Select Bedroom"
        options={['1', '2', '3', '4', '4+']}
        selectedValue={formData.bedroom}
        onSelect={(value) => handleSelection('bedroom', value)}
        onClose={() => setShowBedroomModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showBathroomModal}
        title="Select Bathroom"
        options={['1', '2', '3', '4', '4+']}
        selectedValue={formData.bathroom}
        onSelect={(value) => handleSelection('bathroom', value)}
        onClose={() => setShowBathroomModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showFacingModal}
        title="Select Facing"
        options={['East', 'North', 'South', 'West', 'North-East', 'North-West', 'South-East', 'South-West']}
        selectedValue={formData.facing}
        onSelect={(value) => handleSelection('facing', value)}
        onClose={() => setShowFacingModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showFurnishingModal}
        title="Select Furnishing"
        options={['Furnished', 'Semi-Furnished', 'Unfurnished']}
        selectedValue={formData.furnishing}
        onSelect={(value) => handleOptionSelection('furnishing', value)}
        onClose={() => setShowFurnishingModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showConstructionStatusModal}
        title="Select Construction Status"
        options={['New Launch', 'Under Construction', 'Ready to Move']}
        selectedValue={formData.constructionStatus}
        onSelect={(value) => handleOptionSelection('constructionStatus', value)}
        onClose={() => setShowConstructionStatusModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showListedByModal}
        title="Select Listed By"
        options={['Builder', 'Owner', 'Dealer']}
        selectedValue={formData.listedBy}
        onSelect={(value) => handleOptionSelection('listedBy', value)}
        onClose={() => setShowListedByModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showCarParkingModal}
        title="Select Car Parking"
        options={['0', '1', '2', '3', '3+']}
        selectedValue={formData.carParking}
        onSelect={(value) => handleOptionSelection('carParking', value)}
        onClose={() => setShowCarParkingModal(false)}
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
});

export default AddHousesApartments;