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

const AddJob = ({ route, navigation }) => {
  const { modernStyles, placeholderColor, labelIconColor } = useAddProductFormStyles();
  const insets = useSafeAreaInsets();
  const bottomInset = insets?.bottom ?? 0;
  const { category, subcategory, product, listingType } = route.params || {};
  const [formData, setFormData] = useState({
    salaryPeriod: 'Monthly',
    positionType: 'Full-time',
    amount: '',
    adTitle: '',
    description: '',
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!product);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [shouldNavigateOnClose, setShouldNavigateOnClose] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Selection Modal States
  const [showSalaryPeriodModal, setShowSalaryPeriodModal] = useState(false);
  const [showPositionTypeModal, setShowPositionTypeModal] = useState(false);

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
            salaryPeriod: productData.post_details?.salary_period || 'Monthly',
            positionType: productData.post_details?.position_type || 'Full-time',
            amount: productData.amount?.toString() || '',
            adTitle: productData.title || '',
            description: productData.post_details?.description || '',
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
      setShouldNavigateOnClose(true);
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
          <Text style={modernStyles.loaderText}>Loading job details...</Text>
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
              <Text style={modernStyles.headerTitle}>{subcategory?.name || 'Job Listing'}</Text>
              <Text style={modernStyles.headerSubtitle}>Add your job details</Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[modernStyles.scrollContent, { paddingBottom: normalizeVertical(100) + bottomInset }]}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {/* Salary Period Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="calendar-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Salary Period *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowSalaryPeriodModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.salaryPeriod || 'Select Salary Period'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* Position Type Selection */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="briefcase-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Position Type *</Text>
              </View>
              <TouchableOpacity
                style={modernStyles.selectButton}
                onPress={() => setShowPositionTypeModal(true)}
                activeOpacity={0.7}
              >
                <Text style={modernStyles.selectButtonText}>
                  {formData.positionType || 'Select Position Type'}
                </Text>
                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
              </TouchableOpacity>
            </View>

            {/* Salary Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="cash-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Salary *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter salary amount"
                  placeholderTextColor={placeholderColor}
                  keyboardType="numeric"
                  value={String(formData.amount ?? '')}
                  onChangeText={(value) => handleChange('amount', value)}
                />
              </View>
            </View>

            {/* Title Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="text-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Title *</Text>
              </View>
              <View style={modernStyles.inputWrapper}>
                <TextInput
                  style={modernStyles.input}
                  placeholder="Enter job title"
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
                  placeholder="Describe the job position..."
                  placeholderTextColor={placeholderColor}
                  value={formData.description}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  onChangeText={(value) => handleChange('description', value)}
                />
              </View>
            </View>

            {/* Job Location Field */}
            <View style={modernStyles.fieldContainer}>
              <View style={modernStyles.labelContainer}>
                <Icon name="location-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                <Text style={modernStyles.label}>Job Location *</Text>
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
                      Allow applicants to contact you directly
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
                  setShouldNavigateOnClose(false);
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
                    {product ? 'Update Job' : 'Post Job'}
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
          if (modalType === 'success' && shouldNavigateOnClose) navigation.goBack();
        }}
      />

      {/* Modern Selection Modals */}
      <ModernSelectionModal
        visible={showSalaryPeriodModal}
        title="Select Salary Period"
        options={['Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly']}
        selectedValue={formData.salaryPeriod}
        onSelect={(value) => {
          handleSelection('salaryPeriod', value);
          setShowSalaryPeriodModal(false);
        }}
        onClose={() => setShowSalaryPeriodModal(false)}
        multiColumn={true}
      />

      <ModernSelectionModal
        visible={showPositionTypeModal}
        title="Select Position Type"
        options={['Contract', 'Full-time', 'Part-time', 'Temporary']}
        selectedValue={formData.positionType}
        onSelect={(value) => {
          handleSelection('positionType', value);
          setShowPositionTypeModal(false);
        }}
        onClose={() => setShowPositionTypeModal(false)}
        multiColumn={true}
      />
    </>
  );
};

export default AddJob;