import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete.js';
import ModernSelectionModal from './SubComponent/ModernSelectionModal.js';
import styles from '../../assets/css/AddProductForm.styles.js';
import ModalScreen from '../SupportElement/ModalScreen.js';

const AddCommercialHeavyMachinery = ({ route, navigation }) => {
  const { category, subcategory, product } = route.params;
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
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loaderText}>Loading product details...</Text>
      </View>
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

          {/* Brand Field */}
          <Text style={styles.label}>Brand *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowBrandModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.brand || 'Select Brand'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Condition Selection */}
          <Text style={styles.label}>Condition *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowConditionModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.condition || 'Select Condition'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Year Dropdown */}
          <Text style={styles.label}>Year *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowYearModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.year || 'Select Year'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Fuel Type Selection */}
          <Text style={styles.label}>Fuel Type *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowFuelTypeModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.fuelType || 'Select Fuel Type'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* Transmission Selection */}
          <Text style={styles.label}>Transmission *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowTransmissionModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.transmission || 'Select Transmission'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          {/* KM Driven Field */}
          <Text style={styles.label}>KM Driven *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter KM Driven"
            keyboardType="numeric"
            value={formData.kmDriven}
            onChangeText={(value) => handleChange('kmDriven', value)}
          />

          {/* Number of Owners Selection */}
          <Text style={styles.label}>Number of Owners *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowOwnersModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {formData.owners || 'Select Number of Owners'}
            </Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

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

          {/* Contact Name */}
          <Text style={styles.label}>Contact Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Contact Name"
            value={formData.contact_name}
            onChangeText={(value) => handleChange('contact_name', value)}
          />

          {/* Contact Phone */}
          <Text style={styles.label}>Contact Phone *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Contact Phone"
            keyboardType="phone-pad"
            value={formData.contact_phone}
            onChangeText={(value) => handleChange('contact_phone', value)}
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

export default AddCommercialHeavyMachinery;