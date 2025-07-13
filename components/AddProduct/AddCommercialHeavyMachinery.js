import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete';
import styles from '../../assets/css/AddProductForm.styles.js';
import CustomPicker from './SubComponent/CustomPicker';
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
            fuelType: productData.post_details?.fuel_type || 'Diesel',
            transmission: productData.post_details?.transmission || 'Manual',
            condition: productData.post_details?.condition || 'Fair',
            owners: productData.post_details?.owner || '1st',
            listedBy: productData.post_details?.listed_by || 'Owner',
            adTitle: productData.title || '',
            description: productData.post_details?.description || '',
            contact_name: productData.post_details?.contact_name || '',
            contact_phone: productData.post_details?.contact_phone || '',
            amount: productData.post_details?.amount?.toString() || '',
            kmDriven: productData.post_details?.km_driven?.toString() || '',
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

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.formHeader}>{product ? 'Edit' : 'Add'} {subcategory.name}</Text>

          {/* Brand Field */}
          <Text style={styles.label}>Brand *</Text>
          <CustomPicker
            label="Select Brand"
            value={formData.brand}
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
            ].map(brand => ({ label: brand, value: brand }))}
            onSelect={value => handleChange('brand', value)}
          />

          {/* Condition Selection */}
          <Text style={styles.label}>Condition *</Text>
          <View style={styles.optionContainer}>
            {['New', 'Like new', 'Fair', 'Needs repair'].map((condition) => (
              <TouchableOpacity
                key={condition}
                style={[styles.optionButton, formData.condition === condition && styles.selectedOption]}
                onPress={() => handleConditionSelection(condition)}
              >
                <Text style={formData.condition === condition ? styles.selectedText : styles.optionText}>{condition}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
            {['Diesel', 'Electric', 'Petrol', 'Others'].map((fuel) => (
              <TouchableOpacity
                key={fuel}
                style={[styles.optionButton, formData.fuelType === fuel && styles.selectedOption]}
                onPress={() => handleFuelSelection(fuel)}
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
                onPress={() => handleTransmissionSelection(trans)}
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
                onPress={() => handleOwnersSelection(owner)}
              >
                <Text style={formData.owners === owner ? styles.selectedText : styles.optionText}>{owner}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Listed By *</Text>
          <View style={styles.optionContainer}>
            {['Dealer', 'Owner'].map((listedByOption) => (
              <TouchableOpacity
                key={listedByOption}
                style={[styles.optionButton, formData.listedBy === listedByOption && styles.selectedOption]}
                onPress={() => handleChange('listedBy', listedByOption)}
              >
                <Text style={formData.listedBy === listedByOption ? styles.selectedText : styles.optionText}>
                  {listedByOption}
                </Text>
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

export default AddCommercialHeavyMachinery;