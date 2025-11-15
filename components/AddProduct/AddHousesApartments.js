import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete.js';
import ModernSelectionModal from './SubComponent/ModernSelectionModal.js';
import styles from '../../assets/css/AddProductForm.styles.js';
import ModalScreen from '../SupportElement/ModalScreen';

const AddHousesApartments = ({ route, navigation }) => {
  const { category, subcategory, product } = route.params;
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
    show_phone: false,
    listingType: 'sell',
    show_phone: false, 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!product);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Selection Modal States
  const [showListingTypeModal, setShowListingTypeModal] = useState(false);
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
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loaderText}>Loading property details...</Text>
      </View>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.formHeaderContainer}>
          <Text style={styles.formHeaderTitle}>{subcategory?.name}</Text>
          <Text style={styles.formSubHeader}>Fill in details for your listing</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
          {/* Listing Type section */}
          <Text style={styles.label}>Listing Type *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowListingTypeModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.listingType === 'sell' ? 'Sell' : 'Rent'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Property Type Selection */}
          <Text style={styles.label}>Property Type *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowPropertyTypeModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.propertyType || 'Select Property Type'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Bedroom Selection */}
          <Text style={styles.label}>Bedroom *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowBedroomModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.bedroom || 'Select Bedroom'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Bathroom Selection */}
          <Text style={styles.label}>Bathroom *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowBathroomModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.bathroom || 'Select Bathroom'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Facing Selection */}
          <Text style={styles.label}>Facing *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowFacingModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.facing || 'Select Facing'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Furnishing Selection */}
          <Text style={styles.label}>Furnishing *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowFurnishingModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.furnishing || 'Select Furnishing'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Construction Status Selection */}
          <Text style={styles.label}>Construction Status *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowConstructionStatusModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.constructionStatus || 'Select Construction Status'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Listed By Selection */}
          <Text style={styles.label}>Listed By *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowListedByModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.listedBy || 'Select Listed By'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Car Parking Selection */}
          <Text style={styles.label}>Car Parking *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCarParkingModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.carParking || 'Select Car Parking'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Super Builtup Area */}
          <Text style={styles.label}>Super Builtup Area (ft²)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Super Builtup Area"
            keyboardType="numeric"
            value={formData.superBuiltupArea}
            onChangeText={(value) => handleChange('superBuiltupArea', value)}
          />

          {/* Carpet Area */}
          <Text style={styles.label}>Carpet Area (ft²) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Carpet Area"
            keyboardType="numeric"
            value={formData.carpetArea}
            onChangeText={(value) => handleChange('carpetArea', value)}
          />


          {/* Ad Title Field */}
          <Text style={styles.label}>Ad Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Ad Title"
            value={formData.adTitle}
            onChangeText={(value) => handleChange('adTitle', value)}
          />

          {/* Description Field */}
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Enter Description"
            value={formData.description}
            multiline
            onChangeText={(value) => handleChange('description', value)}
          />

          {/* Amount Field */}
          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Amount"
            keyboardType="numeric"
            value={formData.amount}
            onChangeText={(value) => handleChange('amount', value)}
          />

          {/* Address Field */}
          <Text style={styles.label}>Address *</Text>
          <AddressAutocomplete
            initialAddress={formData.address}
            initialLatitude={formData.latitude}
            initialLongitude={formData.longitude}
            onAddressSelect={handleAddressSelect}
            styles={{
              input: styles.input,
              container: { marginBottom: 16 }
            }}
          />

          <Text style={styles.label}>Show Phone Number</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Switch
              value={formData.show_phone}
              onValueChange={handleToggleShowPhone}
            />
            <Text style={{ marginLeft: 10 }}>
              Allow buyers to contact me directly by phone
            </Text>
          </View>

          {/* Image Picker */}
          <ImagePickerComponent
            formData={formData}
            setFormData={setFormData}
          />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.stickyButton}>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              isSubmitting && styles.disabledButton,
            ]}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Processing...' : product ? 'Update' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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
        visible={showListingTypeModal}
        title="Select Listing Type"
        options={[
          { label: 'Sell', value: 'sell' },
          { label: 'Rent', value: 'rent' }
        ]}
        selectedValue={formData.listingType}
        onSelect={(value) => handleChange('listingType', value)}
        onClose={() => setShowListingTypeModal(false)}
        multiColumn={true}
      />

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

export default AddHousesApartments;