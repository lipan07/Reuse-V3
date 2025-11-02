import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Switch } from 'react-native';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete.js';
import styles from '../../assets/css/AddProductForm.styles.js';
import ModalScreen from '../SupportElement/ModalScreen.js';

const AddShopOffices = ({ route, navigation }) => {
    const { category, subcategory, product } = route.params;
    const [formData, setFormData] = useState({
        furnishing: 'Unfurnished',
        constructionStatus: 'Ready to Move',
        listedBy: 'Owner',
        carParking: '1',
        superBuiltUpArea: '',
        carpetArea: '',
        maintenance: '',
        washroom: '',
        projectName: '',
        adTitle: '',
        description: '',
        amount: '',
        address: '', // Added address field
        latitude: null, // Added latitude
        longitude: null, // Added longitude
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
                        furnishing: productData.post_details?.furnishing || 'Unfurnished',
                        constructionStatus: productData.post_details?.construction_status || 'Ready to Move',
                        listedBy: productData.post_details?.listed_by || 'Owner',
                        carParking: productData.post_details?.car_parking || '1',
                        superBuiltUpArea: productData.post_details?.super_builtup_area || '',
                        carpetArea: productData.post_details?.carpet_area || '',
                        maintenance: productData.post_details?.maintenance || '',
                        washroom: productData.post_details?.washroom || '',
                        projectName: productData.post_details?.project_name || '',
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
                    {/* Existing form fields... */}
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

                    {/* Construction Status */}
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

                    {/* Listed By */}
                    <Text style={styles.label}>Listed By *</Text>
                    <View style={styles.optionContainer}>
                        {['Builder', 'Dealer', 'Owner'].map((option) => (
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
                    {/* Existing fields */}
                    <Text style={styles.label}>Super Built-up Area (ft²) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Super Built-up Area"
                        keyboardType="numeric"
                        value={formData.superBuiltUpArea}
                        onChangeText={(value) => handleChange('superBuiltUpArea', value)}
                    />

                    <Text style={styles.label}>Carpet Area (ft²) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Carpet Area"
                        keyboardType="numeric"
                        value={formData.carpetArea}
                        onChangeText={(value) => handleChange('carpetArea', value)}
                    />

                    <Text style={styles.label}>Maintenance (Monthly)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Maintenance"
                        keyboardType="numeric"
                        value={formData.maintenance}
                        onChangeText={(value) => handleChange('maintenance', value)}
                    />

                    <Text style={styles.label}>Washrooms</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Number of Washrooms"
                        keyboardType="numeric"
                        value={formData.washroom}
                        onChangeText={(value) => handleChange('washroom', value)}
                    />

                    <Text style={styles.label}>Project Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Project Name"
                        value={formData.projectName}
                        onChangeText={(value) => handleChange('projectName', value)}
                    />

                    <Text style={styles.label}>Ad Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Ad Title"
                        value={formData.adTitle}
                        onChangeText={(value) => handleChange('adTitle', value)}
                    />

                    <Text style={styles.label}>Description *</Text>
                    <TextInput
                        style={[styles.input, { height: 100 }]}
                        placeholder="Enter Description"
                        value={formData.description}
                        multiline
                        onChangeText={(value) => handleChange('description', value)}
                    />

                    <Text style={styles.label}>Amount *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Amount"
                        keyboardType="numeric"
                        value={formData.amount}
                        onChangeText={(value) => handleChange('amount', value)}
                    />

                    {/* Add Address Field */}
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

export default AddShopOffices;