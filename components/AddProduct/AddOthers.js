import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet, Switch
} from 'react-native';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete.js'; // Add this import
import styles from '../../assets/css/AddProductForm.styles.js';
import ModalScreen from '../SupportElement/ModalScreen.js';

const AddOthers = ({ route, navigation }) => {
  const { subcategory, product } = route.params;
  const [formData, setFormData] = useState({
    adTitle: '',
    description: '',
    amount: '',
    address: '',
    latitude: null,
    longitude: null,
    images: [],
    deletedImages: [],
    listingType: 'sell',
    show_phone: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Remove all address-related state and functions

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

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add address select handler
  const handleAddressSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude
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
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {/* Listing Type section */}
          <Text style={styles.label}>Listing Type *</Text>
          <View style={styles.optionContainer}>
            {['sell', 'rent'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  formData.listingType === type && styles.selectedOption,
                  { textTransform: 'capitalize' }
                ]}
                onPress={() => handleChange('listingType', type)}
              >
                <Text style={formData.listingType === type ? styles.selectedText : styles.optionText}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Title"
            value={formData.adTitle}
            onChangeText={(v) => setFormData({ ...formData, adTitle: v })}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Enter Description"
            value={formData.description}
            multiline
            onChangeText={v => handleChange('description', v)}
          />

          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Amount"
            keyboardType="numeric"
            value={formData.amount}
            onChangeText={v => handleChange('amount', v)}
          />

          {/* Replace address section with AddressAutocomplete */}
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

          <ImagePickerComponent formData={formData} setFormData={setFormData} />
        </ScrollView>

        <View style={styles.stickyButton}>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Processing...' : product ? 'Update' : 'Submit'}
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

// Remove localStyles as they're now in AddressAutocomplete component
export default AddOthers;