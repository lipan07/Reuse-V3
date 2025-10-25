import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Switch } from 'react-native';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete.js';
import styles from '../../assets/css/AddProductForm.styles.js';
import ModalScreen from '../SupportElement/ModalScreen.js';

const AddCleaningPestControl = ({ route, navigation }) => {
  const { category, subcategory, product } = route.params;
  const [formData, setFormData] = useState({
    type: 'Pest Control', // Default to Pest Control
    adTitle: '',
    description: '',
    amount: '',
    address: '', // Added address field
    latitude: null, // Added latitude
    longitude: null, // Added longitude
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
            type: productData.type || 'Pest Control',
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

          {/* Type Selection */}
          <Text style={styles.label}>Type *</Text>
          <View style={styles.optionContainer}>
            {['Home Cleaning', 'Pest Control', 'Car Cleaning', 'Others'].map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.optionButton, formData.type === val && styles.selectedOption]}
                onPress={() => handleSelection('type', val)}
              >
                <Text style={formData.type === val ? styles.selectedText : styles.optionText}>{val}</Text>
              </TouchableOpacity>
            ))}
          </View>

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

    </ >
  );
};

export default AddCleaningPestControl;