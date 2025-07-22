import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete';
import styles from '../../assets/css/AddProductForm.styles.js';
import CustomPicker from './SubComponent/CustomPicker.js';
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
  const { category, subcategory, product } = route.params;
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!product);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

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
            fuelType: productData.post_details?.fuel || 'Petrol',
            transmission: productData.post_details?.transmission || 'Automatic',
            kmDriven: productData.post_details?.km_driven?.toString() || '',
            owners: productData.post_details?.no_of_owner || '1st',
            adTitle: productData.title || '',
            description: productData.post_details?.description || '',
            amount: productData.post_details?.amount?.toString() || '',
            address: productData.post_details?.address || '',
            latitude: productData.post_details?.latitude || null,
            longitude: productData.post_details?.longitude || null,
            images: productData.images?.map((url, index) => ({
              id: index,
              uri: url,
              isNew: false,
            })) || [],
            deletedImages: [],
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

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.formHeaderContainer}>
          <Text style={styles.formHeaderTitle}>{category?.name}</Text>
          <Text style={styles.formSubHeader}>Fill in details for your listing</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
          {/* Brand Field */}
          <Text style={styles.label}>Brand *</Text>
          <CustomPicker
            label="Select Brand"
            value={formData.brand}
            options={BRAND_OPTIONS}
            onSelect={value => handleChange('brand', value)}
          />

          {/* Year Dropdown */}
          <Text style={styles.label}>Year *</Text>
          <CustomPicker
            label="Select Year"
            value={formData.year}
            options={generateYears().map(year => ({ label: year, value: year }))}
            onSelect={value => handleChange('year', value)}
          />

          {/* Fuel Type Selection */}
          <Text style={styles.label}>Fuel Type *</Text>
          <View style={styles.optionContainer}>
            {['CNG & Hybrids', 'Diesel', 'Electric', 'LPG', 'Petrol'].map((fuel) => (
              <TouchableOpacity
                key={fuel}
                style={[styles.optionButton, formData.fuelType === fuel && styles.selectedOption]}
                onPress={() => handleChange('fuelType', fuel)}
              >
                <Text style={formData.fuelType === fuel ? styles.selectedText : styles.optionText}>{fuel}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Transmission Selection */}
          <Text style={styles.label}>Transmission *</Text>
          <View style={styles.optionContainer}>
            {['Automatic', 'Manual'].map((trans) => (
              <TouchableOpacity
                key={trans}
                style={[styles.optionButton, formData.transmission === trans && styles.selectedOption]}
                onPress={() => handleChange('transmission', trans)}
              >
                <Text style={formData.transmission === trans ? styles.selectedText : styles.optionText}>{trans}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
          <View style={styles.optionContainer}>
            {['1st', '2nd', '3rd', '4th', '5th', '6th'].map((owner) => (
              <TouchableOpacity
                key={owner}
                style={[styles.optionButton, formData.owners === owner && styles.selectedOption]}
                onPress={() => handleChange('owners', owner)}
              >
                <Text style={formData.owners === owner ? styles.selectedText : styles.optionText}>{owner}</Text>
              </TouchableOpacity>
            ))}
          </View>

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

    </>
  );
};

export default AddCarForm;