import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AddressAutocomplete from './AddressAutocomplete';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomStatusBar from './Screens/CustomStatusBar';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const EditProfilePage = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessWebsite: '',
    contactPersonName: '',
    contactPersonRole: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    profileImage: null,
    bio: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [businessExpanded, setBusinessExpanded] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        const apiUrl = `${process.env.BASE_URL}/get-my-profile`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const responseData = await response.json();
        if (response.ok) {
          const profile = responseData.data;
          const [firstName, lastName] = profile.name?.split(', ') || ['', ''];

          setUserData({
            firstName: firstName || '',
            lastName: lastName || '',
            email: profile.email || '',
            phoneNumber: profile.phone_no || '',
            profileImage: profile.images?.url || null,
            bio: profile.about_me || '',
            businessName: profile.company_detail?.name || '',
            businessType: profile.company_detail?.type || '',
            businessAddress: profile.company_detail?.address || '',
            businessWebsite: profile.company_detail?.website || '',
            contactPersonName: profile.company_detail?.contact_person_name || '',
            contactPersonRole: profile.company_detail?.contact_person_role || '',
            contactPersonEmail: profile.company_detail?.contact_person_email || '',
            contactPersonPhone: profile.company_detail?.contact_person_phone || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setModalType('danger');
        setModalTitle('Error');
        setModalMessage('Failed to load profile data');
        setModalVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleChooseImage = async () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };
    const result = await launchImageLibrary(options);
    if (result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      setUserData({ ...userData, profileImage: selectedImage });
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!userData.firstName.trim()) errors.push('First name is required');
    if (!userData.lastName.trim()) errors.push('Last name is required');
    if (!userData.phoneNumber.trim()) errors.push('Phone number is required');

    // Email validation if provided
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Please enter a valid email address');
    }

    // Website validation if provided
    if (userData.businessWebsite && !userData.businessWebsite.startsWith('http')) {
      errors.push('Website must start with http:// or https://');
    }

    return errors;
  };

  const handleSave = async () => {
    // Validate form before submission
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setModalType('warning');
      setModalTitle('Validation Error');
      setModalMessage(validationErrors.join('\n'));
      setModalVisible(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userId = await AsyncStorage.getItem('userId');
      const apiUrl = `${process.env.BASE_URL}/users/${userId}`;

      const formData = new FormData();

      // Personal details
      formData.append('first_name', userData.firstName);
      formData.append('last_name', userData.lastName);
      formData.append('email', userData.email);
      formData.append('phone_no', userData.phoneNumber);
      formData.append('about_me', userData.bio);

      // Business details
      formData.append('company_detail[name]', userData.businessName);
      formData.append('company_detail[type]', userData.businessType);
      formData.append('company_detail[address]', userData.businessAddress);
      formData.append('company_detail[website]', userData.businessWebsite);

      // Contact person details
      formData.append('company_detail[contact_person_name]', userData.contactPersonName);
      formData.append('company_detail[contact_person_role]', userData.contactPersonRole);
      formData.append('company_detail[contact_person_email]', userData.contactPersonEmail);
      formData.append('company_detail[contact_person_phone]', userData.contactPersonPhone);

      // Handle profile image upload
      if (userData.profileImage && userData.profileImage.startsWith('file://')) {
        formData.append('profile_image', {
          uri: userData.profileImage,
          type: 'image/jpeg',
          name: `profile_${Date.now()}.jpg`,
        });
      }

      const response = await fetch(apiUrl, {
        method: 'POST', // Keep as POST but add _method override
        body: formData,
        headers: {
          Accept: 'application/json',
          // Don't set Content-Type for FormData, let browser set it
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();
      console.log('API Response:', responseData); // For debugging

      if (response.ok) {
        setModalType('success');
        setModalTitle('Success');
        setModalMessage('Profile updated successfully!');
        setModalVisible(true);

        // Update local storage with new data
        await AsyncStorage.setItem('userName', `${userData.firstName} ${userData.lastName}`);
        if (userData.profileImage) {
          await AsyncStorage.setItem('userImage', userData.profileImage);
        }

        // Update local state with response data if needed
        if (responseData.user) {
          const updatedUser = responseData.user;
          // Update profile image URL if returned from server
          if (updatedUser.images?.url) {
            setUserData(prev => ({ ...prev, profileImage: updatedUser.images.url }));
          }
        }
      } else {
        // Handle validation errors
        let errorMessage = responseData.message || 'Something went wrong!';

        // Handle Laravel validation errors
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors).flat();
          errorMessage = errorMessages.join('\n');
        }

        setModalType('warning');
        setModalTitle('Validation Error');
        setModalMessage(errorMessage);
        setModalVisible(true);
      }
    } catch (error) {
      setModalType('danger');
      setModalTitle('Network Error');
      setModalMessage('Failed to connect to the server');
      setModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loaderText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <CustomStatusBar />
      <View style={styles.container}>
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={[
                  styles.modalIconContainer,
                  modalType === 'success' && styles.successIcon,
                  modalType === 'warning' && styles.warningIcon,
                  modalType === 'danger' && styles.dangerIcon
                ]}>
                  <Ionicons
                    name={
                      modalType === 'success' ? 'checkmark' :
                        modalType === 'warning' ? 'warning' : 'close'
                    }
                    size={24}
                    color="#fff"
                  />
                </View>
                <Text style={styles.modalTitle}>{modalTitle}</Text>
                <Text style={styles.modalMessage}>{modalMessage}</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <Text style={styles.headerSubtitle}>Update your personal and business information</Text>
            </View>

            {/* Profile Image */}
            <View style={styles.avatarSection}>
              <TouchableOpacity style={styles.avatarContainer} onPress={handleChooseImage}>
                {userData.profileImage ? (
                  <Image source={{ uri: userData.profileImage }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={32} color="#6366F1" />
                    </View>
                )}
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Personal Information */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-outline" size={20} color="#6366F1" />
                <Text style={styles.cardTitle}>Personal Information</Text>
              </View>

              <View style={styles.nameRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter first name"
                    value={userData.firstName}
                    onChangeText={(text) => handleChange('firstName', text)}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter last name"
                    value={userData.lastName}
                    onChangeText={(text) => handleChange('lastName', text)}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  value={userData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  value={userData.phoneNumber}
                  onChangeText={(text) => handleChange('phoneNumber', text)}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Business Address</Text>
                <AddressAutocomplete
                  initialAddress={userData.businessAddress}
                  onAddressSelect={({ address }) => handleChange('businessAddress', address)}
                  styles={{
                    input: styles.input,
                    predictionText: { fontSize: 14, color: '#333' }
                  }}
                />
              </View>
            </View>

            {/* About Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle-outline" size={20} color="#6366F1" />
                <Text style={styles.cardTitle}>About</Text>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Tell us about yourself..."
                  value={userData.bio}
                  onChangeText={(text) => handleChange('bio', text)}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Business Information */}
            <TouchableOpacity
              style={[styles.card, styles.businessCard]}
              onPress={() => setBusinessExpanded(!businessExpanded)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="business-outline" size={20} color="#6366F1" />
                <Text style={styles.cardTitle}>Business Information</Text>
                <MaterialIcons
                  name={businessExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color="#6366F1"
                />
              </View>
            </TouchableOpacity>

            {businessExpanded && (
              <View style={styles.card}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Business Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter business name"
                    value={userData.businessName}
                    onChangeText={(text) => handleChange('businessName', text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Business Type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter business type"
                    value={userData.businessType}
                    onChangeText={(text) => handleChange('businessType', text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Website</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://example.com"
                    value={userData.businessWebsite}
                    onChangeText={(text) => handleChange('businessWebsite', text)}
                    keyboardType="url"
                  />
                </View>

                <View style={styles.divider} />

                <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Primary Contact</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Contact Person Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter contact person name"
                    value={userData.contactPersonName}
                    onChangeText={(text) => handleChange('contactPersonName', text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Role/Position</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter role/position"
                    value={userData.contactPersonRole}
                    onChangeText={(text) => handleChange('contactPersonRole', text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
                    value={userData.contactPersonEmail}
                    onChangeText={(text) => handleChange('contactPersonEmail', text)}
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    value={userData.contactPersonPhone}
                    onChangeText={(text) => handleChange('contactPersonPhone', text)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}

            {/* Spacer for button */}
            <View style={styles.spacer} />
          </ScrollView>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loaderText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: normalize(28),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: normalizeVertical(35),
  },
  headerSubtitle: {
    fontSize: normalize(14),
    color: '#64748B',
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#6366F1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  businessCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: normalize(14),
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: normalize(15),
    color: '#1F2937',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  spacer: {
    height: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    backgroundColor: '#10B981',
  },
  warningIcon: {
    backgroundColor: '#F59E0B',
  },
  dangerIcon: {
    backgroundColor: '#EF4444',
  },
  modalTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: normalize(15),
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: normalize(16),
  },
});

export default EditProfilePage;