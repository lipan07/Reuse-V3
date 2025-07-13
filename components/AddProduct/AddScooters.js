import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { submitForm } from '../../service/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AddressAutocomplete from '../AddressAutocomplete'; // Added import
import styles from '../../assets/css/AddProductForm.styles.js';
import CustomPicker from './SubComponent/CustomPicker';
import ModalScreen from '../SupportElement/ModalScreen.js';

const AddScooters = ({ route, navigation }) => {
  const { category, subcategory, product } = route.params;
  const [brands, setBrands] = useState([]);
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    brand: '',
    adTitle: '',
    year: currentYear.toString(),
    km_driven: '',
    description: '',
    amount: '',
    address: '', // Added address field
    latitude: null, // Added latitude
    longitude: null, // Added longitude
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
            km_driven: productData.post_details?.km_driven?.toString() || '',
            adTitle: productData.title || '',
            description: productData.post_details?.description || '',
            amount: productData.post_details?.amount?.toString() || '',
            address: productData.post_details?.address || '', // Initialize address
            latitude: productData.post_details?.latitude || null, // Initialize latitude
            longitude: productData.post_details?.longitude || null, // Initialize longitude
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

  // Fetch scooter brands
  useEffect(() => {
    const getScooterBrand = async () => {
      const token = await AsyncStorage.getItem('authToken');
      try {
        const response = await fetch(`${process.env.BASE_URL}/scooter/brand`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const responseData = await response.json();
        if (response.ok) {
          setBrands(responseData);
        }
      } catch (error) {
        console.error('Error fetching scooter brands:', error);
      }
    };
    getScooterBrand();
  }, []);

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
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.formHeader}>{product ? 'Edit' : 'Add'} {subcategory.name}</Text>

          {/* Brand Selection */}
          <Text style={styles.label}>Brand *</Text>
          <CustomPicker
            label="Select a brand"
            value={formData.brand}
            options={brands.map(brand => ({ label: brand, value: brand }))}
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

          {/* KM Driven Field */}
          <Text style={styles.label}>KM Driven *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter KM driven"
            keyboardType="numeric"
            value={formData.km_driven}
            onChangeText={(value) => handleChange('km_driven', value)}
          />

          {/* Title Field */}
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Title"
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

        {/* Fixed Submit Button */}
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

export default AddScooters;