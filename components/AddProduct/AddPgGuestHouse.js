import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete.js';
import styles from '../../assets/css/AddProductForm.styles.js';
import ModalScreen from '../SupportElement/ModalScreen.js';

const AddPgGuestHouse = ({ route, navigation }) => {
  const { category, subcategory, product } = route.params;
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
            pgType: productData.post_details?.pg_type || 'PG',
            furnishing: productData.post_details?.furnishing || 'Unfurnished',
            listedBy: productData.post_details?.listed_by || 'Owner',
            carParking: productData.post_details?.car_parking || '1',
            isMealIncluded: productData.post_details?.is_meal_included || 'No',
            carpetArea: productData.post_details?.carpet_area || '',
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
          <Text style={styles.formHeaderTitle}>{subcategory?.name}</Text>
          <Text style={styles.formSubHeader}>Fill in details for your listing</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

          {/* Type Selection */}
          <Text style={styles.label}>Type *</Text>
          <View style={styles.optionContainer}>
            {['Guest House', 'PG', 'Roommate'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, formData.pgType === option && styles.selectedOption]}
                onPress={() => handleOptionSelection('pgType', option)}
              >
                <Text style={formData.pgType === option ? styles.selectedText : styles.optionText}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>


          {/* Furnishing */}
          <Text style={styles.label}>Furnishing *</Text>
          <View style={styles.optionContainer}>
            {['Furnished', 'Semi-Furnished', 'Unfurnished'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, formData.furnishing === option && styles.selectedOption]}
                onPress={() => handleOptionSelection('furnishing', option)}
              >
                <Text style={formData.furnishing === option ? styles.selectedText : styles.optionText}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Listed By */}
          <Text style={styles.label}>Listed By *</Text>
          <View style={styles.optionContainer}>
            {['Builder', 'Owner', 'Dealer'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, formData.listedBy === option && styles.selectedOption]}
                onPress={() => handleOptionSelection('listedBy', option)}
              >
                <Text style={formData.listedBy === option ? styles.selectedText : styles.optionText}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Furnishing */}
          <Text style={styles.label}>Furnishing *</Text>
          <View style={styles.optionContainer}>
            {['Furnished', 'Semi-Furnished', 'Unfurnished'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, formData.furnishing === option && styles.selectedOption]}
                onPress={() => handleOptionSelection('furnishing', option)}
              >
                <Text style={formData.furnishing === option ? styles.selectedText : styles.optionText}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Carpet Area */}
          <Text style={styles.label}>Carpet Area (ft²) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Carpet Area"
            keyboardType="numeric"
            value={formData.carpetArea}
            onChangeText={(value) => handleChange('carpetArea', value)}
          />

          {/* Car Parking */}
          <Text style={styles.label}>Car Parking *</Text>
          <View style={styles.optionContainer}>
            {['0', '1', '2', '3', '4', '5', '5+'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, formData.carParking === option && styles.selectedOption]}
                onPress={() => handleOptionSelection('carParking', option)}
              >
                <Text style={formData.carParking === option ? styles.selectedText : styles.optionText}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Meals Included */}
          <Text style={styles.label}>Meals Included *</Text>
          <View style={styles.optionContainer}>
            {['Yes', 'No'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, formData.isMealIncluded === option && styles.selectedOption]}
                onPress={() => handleOptionSelection('isMealIncluded', option)}
              >
                <Text style={formData.isMealIncluded === option ? styles.selectedText : styles.optionText}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Title"
            value={formData.adTitle}
            onChangeText={(value) => handleChange('adTitle', value)}
          />

          {/* Description */}
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Enter Description"
            value={formData.description}
            multiline
            onChangeText={(value) => handleChange('description', value)}
          />

          {/* Amount */}
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

          <ImagePickerComponent
            formData={formData}
            setFormData={setFormData}
          />
        </ScrollView>

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

export default AddPgGuestHouse;