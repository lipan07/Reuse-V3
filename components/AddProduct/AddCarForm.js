import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete';
import styles from '../../assets/css/AddProductForm.styles.js';
import ModernSelectionModal from './SubComponent/ModernSelectionModal.js';
import ModalScreen from '../SupportElement/ModalScreen.js';

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
    show_phone: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!product);

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
            onPress={() => setShowFuelModal(true)}
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