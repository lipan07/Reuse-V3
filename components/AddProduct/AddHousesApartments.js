import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete';
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!product);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

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


  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.formHeader}>{product ? 'Edit' : 'Add'} Houses/Apartments</Text>


          {/* Property Type Selection */}
          <Text style={styles.label}>Property Type *</Text>
          <View style={styles.optionContainer}>
            {['Apartments', 'Builder Floors', 'Farm Houses', 'Houses & Villas'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionButton, formData.propertyType === type && styles.selectedOption]}
                onPress={() => handleSelection('propertyType', type)}
              >
                <Text style={formData.propertyType === type ? styles.selectedText : styles.optionText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bedroom Selection */}
          <Text style={styles.label}>Bedroom *</Text>
          <View style={styles.optionContainer}>
            {['1', '2', '3', '4', '4+'].map((bedroom) => (
              <TouchableOpacity
                key={bedroom}
                style={[styles.optionButton, formData.bedroom === bedroom && styles.selectedOption]}
                onPress={() => handleSelection('bedroom', bedroom)}
              >
                <Text style={formData.bedroom === bedroom ? styles.selectedText : styles.optionText}>{bedroom}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bathroom Selection */}
          <Text style={styles.label}>Bathroom *</Text>
          <View style={styles.optionContainer}>
            {['1', '2', '3', '4', '4+'].map((bathroom) => (
              <TouchableOpacity
                key={bathroom}
                style={[styles.optionButton, formData.bathroom === bathroom && styles.selectedOption]}
                onPress={() => handleSelection('bathroom', bathroom)}
              >
                <Text style={formData.bathroom === bathroom ? styles.selectedText : styles.optionText}>{bathroom}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Facing Selection */}
          <Text style={styles.label}>Facing *</Text>
          <View style={styles.optionContainer}>
            {['East', 'North', 'South', 'West', 'North-East', 'North-West', 'South-East', 'South-West'].map((facing) => (
              <TouchableOpacity
                key={facing}
                style={[styles.optionButton, formData.facing === facing && styles.selectedOption]}
                onPress={() => handleSelection('facing', facing)}
              >
                <Text style={formData.facing === facing ? styles.selectedText : styles.optionText}>{facing}</Text>
              </TouchableOpacity>
            ))}
          </View>


          {/* Furnishing Selection */}
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

          {/* Construction Status Selection */}
          <Text style={styles.label}>Construction Status *</Text>
          <View style={styles.optionContainer}>
            {['New Launch', 'Under Construction', 'Ready to Move'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, formData.constructionStatus === option && styles.selectedOption]}
                onPress={() => handleOptionSelection('constructionStatus', option)}
              >
                <Text style={formData.constructionStatus === option ? styles.selectedText : styles.optionText}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Listed By Selection */}
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

          {/* Car Parking Selection */}
          <Text style={styles.label}>Car Parking *</Text>
          <View style={styles.optionContainer}>
            {['0', '1', '2', '3', '3+'].map((parking) => (
              <TouchableOpacity
                key={parking}
                style={[styles.optionButton, formData.carParking === parking && styles.selectedOption]}
                onPress={() => handleOptionSelection('carParking', parking)}
              >
                <Text style={formData.carParking === parking ? styles.selectedText : styles.optionText}>{parking}</Text>
              </TouchableOpacity>
            ))}
          </View>

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

export default AddHousesApartments;