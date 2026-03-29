import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Switch, Dimensions, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { submitForm } from '../../service/apiService';
import ImagePickerComponent from './SubComponent/ImagePickerComponent';
import VideoPickerComponent from './SubComponent/VideoPickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressAutocomplete from '../AddressAutocomplete.js';
import ModernSelectionModal from './SubComponent/ModernSelectionModal.js';
import { useAddProductFormStyles } from './useAddProductFormStyles';
import ModalScreen from '../SupportElement/ModalScreen.js';

const { width, height } = Dimensions.get('window');
const shortSide = Math.min(width, height);
const longSide = Math.max(width, height);
const scale = Math.min(Math.max(shortSide / 375, 0.9), 1.08);
const verticalScale = Math.min(Math.max(longSide / 812, 0.9), 1.08);
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const AddLegalDocumentationServicesGeneral = ({ route, navigation }) => {
  const { modernStyles, placeholderColor, labelIconColor } = useAddProductFormStyles();
    const insets = useSafeAreaInsets();
    const bottomInset = insets?.bottom ?? 0;
    const { category, subcategory, product } = route.params;
    const [formData, setFormData] = useState({
        type: 'Notary Services', // Default to Notary Services
        adTitle: '',
        description: '',
        address: '',
        latitude: null,
        longitude: null,
        images: [],
        deletedImages: [],
        videoUrl: null,
        videoId: null,
        deletedVideoUrl: null,
        deletedVideoId: null,
        show_phone: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(!!product);
    const [isVideoUploading, setIsVideoUploading] = useState(false);
    const [shouldNavigateOnClose, setShouldNavigateOnClose] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState('info');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    // Selection Modal State
    const [showTypeModal, setShowTypeModal] = useState(false);

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
                        type: productData.type || 'Notary Services',
                        adTitle: productData.title || '',
                        description: productData.post_details?.description || '',
                        address: productData.address || '',
                        latitude: productData.latitude || null,
                        longitude: productData.longitude || null,
                        images: productData.images?.map((url, index) => ({
                            id: index,
                            uri: url,
                            isNew: false,
                        })) || [],
                        deletedImages: [],
                        videoUrl: productData.videos?.[0] || productData.video_url || productData.videoUrl || null,
                        videoId: productData.video_id || productData.videoId || null,
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
            setShouldNavigateOnClose(true);
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
            <SafeAreaView style={modernStyles.safeArea}>
                <View style={modernStyles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={modernStyles.loaderText}>Loading product details...</Text>
                </View>
            </SafeAreaView>
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
            <SafeAreaView style={modernStyles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={modernStyles.container}
                >
                    {/* Modern Header */}
                    <View style={modernStyles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={modernStyles.backButton}
                        >
                            <Icon name="arrow-back" size={normalize(24)} color="#333" />
                        </TouchableOpacity>
                        <View style={modernStyles.headerContent}>
                            <Text style={modernStyles.headerTitle}>{subcategory?.name || 'Legal Documentation'}</Text>
                            <Text style={modernStyles.headerSubtitle}>Add your service details</Text>
                        </View>
                    </View>

                    <ScrollView
                        contentContainerStyle={[modernStyles.scrollContent, { paddingBottom: normalizeVertical(100) + bottomInset }]}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Type Selection */}
                        <View style={modernStyles.fieldContainer}>
                            <View style={modernStyles.labelContainer}>
                                <Icon name="options-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                                <Text style={modernStyles.label}>Service Type *</Text>
                            </View>
                            <TouchableOpacity
                                style={modernStyles.selectButton}
                                onPress={() => setShowTypeModal(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={modernStyles.selectButtonText}>
                                    {formData.type || 'Select Service Type'}
                                </Text>
                                <Icon name="chevron-down" size={normalize(18)} color={labelIconColor} />
                            </TouchableOpacity>
                        </View>

                        {/* Title Field */}
                        <View style={modernStyles.fieldContainer}>
                            <View style={modernStyles.labelContainer}>
                                <Icon name="text-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                                <Text style={modernStyles.label}>Service Title *</Text>
                            </View>
                            <View style={modernStyles.inputWrapper}>
                                <TextInput
                                    style={modernStyles.input}
                                    placeholder="Enter service title"
                                    placeholderTextColor={placeholderColor}
                                    value={formData.adTitle}
                                    onChangeText={(value) => handleChange('adTitle', value)}
                                />
                            </View>
                        </View>

                        {/* Description Field */}
                        <View style={modernStyles.fieldContainer}>
                            <View style={modernStyles.labelContainer}>
                                <Icon name="document-text-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                                <Text style={modernStyles.label}>Description *</Text>
                            </View>
                            <View style={modernStyles.inputWrapper}>
                                <TextInput
                                    style={[modernStyles.input, modernStyles.textArea]}
                                    placeholder="Describe your service..."
                                    placeholderTextColor={placeholderColor}
                                    value={formData.description}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    onChangeText={(value) => handleChange('description', value)}
                                />
                            </View>
                        </View>

                        {/* Address Field */}
                        <View style={modernStyles.fieldContainer}>
                            <View style={modernStyles.labelContainer}>
                                <Icon name="location-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                                <Text style={modernStyles.label}>Service Location *</Text>
                            </View>
                            <View style={modernStyles.inputWrapper}>
                                <AddressAutocomplete
                                    initialAddress={formData.address}
                                    initialLatitude={formData.latitude}
                                    initialLongitude={formData.longitude}
                                    onAddressSelect={handleAddressSelect}
                  styles={{
                    container: modernStyles.locationContainer,
                    inputWrapper: modernStyles.locationInputWrapper,
                    input: modernStyles.locationInput,
                    predictionsContainer: modernStyles.locationPredictions,
                    predictionItem: modernStyles.locationPredictionItem,
                    predictionText: modernStyles.locationPredictionText,
                  }}
                                />
                            </View>
                        </View>

                        {/* Show Phone Number Toggle */}
                        <View style={[modernStyles.fieldContainer, modernStyles.toggleContainer]}>
                            <View style={modernStyles.toggleContent}>
                                <View style={modernStyles.toggleLeft}>
                                    <Icon name="call-outline" size={normalize(20)} color={labelIconColor} style={modernStyles.toggleIcon} />
                                    <View>
                                        <Text style={modernStyles.toggleTitle}>Show Phone Number</Text>
                                        <Text style={modernStyles.toggleDescription}>
                                            Allow clients to contact you directly
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={formData.show_phone}
                                    onValueChange={handleToggleShowPhone}
                                    trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                                    thumbColor={formData.show_phone ? '#FFFFFF' : '#F4F3F4'}
                                    ios_backgroundColor="#E0E0E0"
                                />
                            </View>
                        </View>

                        {/* Image Picker */}
                        <View style={modernStyles.fieldContainer}>
                            <View style={modernStyles.labelContainer}>
                                <Icon name="images-outline" size={normalize(18)} color={labelIconColor} style={modernStyles.labelIcon} />
                                <Text style={modernStyles.label}>Upload Images (Optional)</Text>
                            </View>
                            <ImagePickerComponent
                                formData={formData}
                                setFormData={setFormData}
                            />

                            <Text style={[modernStyles.sectionTitle, { marginTop: 20 }]}>Upload Video (Optional)</Text>
                            <VideoPickerComponent
                                formData={formData}
                                setFormData={setFormData}
                                propertyTitle={formData.adTitle}
                                onUploadStateChange={setIsVideoUploading}
                                onShowAlert={(type, title, message) => {
                                    setModalType(type);
                                    setModalTitle(title);
                                    setModalMessage(message);
                                    setShouldNavigateOnClose(false);
                                    setIsModalVisible(true);
                                }}
                            />
                        </View>
                    </ScrollView>

                    {/* Sticky Submit Button */}
                    <View style={[modernStyles.stickyButton, { bottom: bottomInset }]}>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            style={[modernStyles.submitButton, (isSubmitting || isLoading || isVideoUploading) && modernStyles.disabledButton]}
                            disabled={isSubmitting || isLoading || isVideoUploading}
                            activeOpacity={0.8}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Icon name="checkmark-circle-outline" size={normalize(20)} color="#FFFFFF" style={{ marginRight: 8 }} />
                                    <Text style={modernStyles.submitButtonText}>
                                        {product ? 'Update Service' : 'Submit Service'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
            <ModalScreen
                visible={isModalVisible}
                type={modalType}
                title={modalTitle}
                message={modalMessage}
                onClose={() => {
                    setIsModalVisible(false);
                    if (modalType === 'success' && shouldNavigateOnClose) navigation.goBack();
                }}
            />

            {/* Modern Selection Modals */}
            <ModernSelectionModal
                visible={showTypeModal}
                title="Select Service Type"
                options={['RTO Related', 'KYC Related', 'Notary Services', 'Others']}
                selectedValue={formData.type}
                onSelect={(value) => {
                    handleSelection('type', value);
                    setShowTypeModal(false);
                }}
                onClose={() => setShowTypeModal(false)}
                multiColumn={true}
            />
        </>
    );
};

export default AddLegalDocumentationServicesGeneral;
