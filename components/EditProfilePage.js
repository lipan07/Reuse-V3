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
  TouchableWithoutFeedback,
  StatusBar
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
    profileImage: null,
    businessWebsite: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success'); // 'success', 'warning', 'danger'
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
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
          const [firstName, lastName] = profile.name.split(', ');
          setUserData({
            firstName: firstName || '',
            lastName: lastName || '',
            email: profile.email || '',
            phoneNumber: profile.phone_no || '',
            businessName: profile.company_detail?.name || '',
            businessType: profile.company_detail?.type || '',
            businessAddress: profile.company_detail?.address || '',
            businessWebsite: profile.company_detail?.website || '',
            profileImage: profile.images?.url || '',
            bio: profile.about_me || '',
          });
        }
      } catch (error) {
        // handle error
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

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userId = await AsyncStorage.getItem('userId');
      const apiUrl = `${process.env.BASE_URL}/users/${userId}`;
      const formDataToSend = new FormData();
      Object.keys(userData).forEach((key) => {
        if (key !== 'profileImage') {
          formDataToSend.append(key, userData[key]);
        }
      });
      if (userData.profileImage) {
        formDataToSend.append('profile_image', {
          uri: userData.profileImage,
          type: 'image/jpeg',
          name: `profile_${Date.now()}.jpg`,
        });
      }
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      const responseData = await response.json();
      if (response.ok) {
        setModalType('success');
        setModalTitle('Success');
        setModalMessage('Profile updated successfully!');
        setModalVisible(true);
        await AsyncStorage.setItem('userName', `${userData.firstName} ${userData.lastName}`);
        await AsyncStorage.setItem('userImage', userData.profileImage || '');
      } else {
        setModalType('warning');
        setModalTitle('Validation Error');
        setModalMessage(responseData.message || 'Something went wrong!');
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
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loaderText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <CustomStatusBar />
      <View style={styles.outerContainer}>
        {/* Custom Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.customModalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.customModalContainer}>
                  <Text style={[
                    styles.customModalTitle,
                    modalType === 'success' && { color: '#28a745' },
                    modalType === 'warning' && { color: '#ffc107' },
                    modalType === 'danger' && { color: '#dc3545' }
                  ]}>
                    {modalTitle}
                  </Text>
                  <Text style={styles.customModalText}>{modalMessage}</Text>
                  <TouchableOpacity
                    style={styles.customModalButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.customModalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.card}>
              <Text style={styles.header}>Edit Profile</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={handleChooseImage}>
                {userData.profileImage ? (
                  <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="camera" size={40} color="#bbb" />
                )}
              </TouchableOpacity>
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Personal Details</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { marginRight: 8 }]}
                    placeholder="First Name"
                    value={userData.firstName}
                    onChangeText={(text) => handleChange('firstName', text)}
                    placeholderTextColor="#aaa"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={userData.lastName}
                    onChangeText={(text) => handleChange('lastName', text)}
                    placeholderTextColor="#aaa"
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={userData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#aaa"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={userData.phoneNumber}
                  onChangeText={(text) => handleChange('phoneNumber', text)}
                  keyboardType="phone-pad"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Business Details</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Business Name"
                  value={userData.businessName}
                  onChangeText={(text) => handleChange('businessName', text)}
                  placeholderTextColor="#aaa"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Business Type"
                  value={userData.businessType}
                  onChangeText={(text) => handleChange('businessType', text)}
                  placeholderTextColor="#aaa"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Business Website"
                  value={userData.businessWebsite}
                  onChangeText={(text) => handleChange('businessWebsite', text)}
                  keyboardType="url"
                  autoCapitalize="none"
                  placeholderTextColor="#aaa"
                />
              </View>

              {/* Address Autocomplete Field */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Address</Text>
                <AddressAutocomplete
                  initialAddress={userData.businessAddress}
                  onAddressSelect={({ address }) => handleChange('businessAddress', address)}
                  styles={{
                    input: styles.input,
                    predictionText: { fontSize: 15, color: '#333' }
                  }}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionHeader}>About You</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us about yourself"
                  value={userData.bio}
                  onChangeText={(text) => handleChange('bio', text)}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>
          </ScrollView>
          <View style={styles.fixedButtonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView >
      </View >
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: normalize(18),
    paddingTop: normalize(50),
    elevation: 4,
  },
  header: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: normalizeVertical(18),
    letterSpacing: 0.5,
  },
  imagePicker: {
    width: normalize(90),
    height: normalize(90),
    borderRadius: normalize(45),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: normalizeVertical(18),
    borderWidth: 2,
    borderColor: '#007BFF',
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  section: {
    marginBottom: normalizeVertical(13),
  },
  sectionHeader: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#007BFF',
    marginBottom: normalizeVertical(8),
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalizeVertical(12),
  },
  input: {
    flex: 1,
    height: normalizeVertical(44),
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: normalize(10),
    marginBottom: normalizeVertical(12),
    paddingHorizontal: normalize(14),
    fontSize: normalize(15),
    backgroundColor: '#fafbfc',
    color: '#222',
  },
  textArea: {
    height: normalizeVertical(90),
    textAlignVertical: 'top',
    marginBottom: normalize(60),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loaderText: {
    marginTop: normalizeVertical(8),
    fontSize: normalize(13),
    color: '#555',
  },
  // Custom Modal Styles
  customModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customModalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  customModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  customModalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  customModalButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  customModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fixedButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: 'transparent',
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    paddingVertical: normalizeVertical(14),
    borderRadius: normalize(10),
    alignItems: 'center',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default EditProfilePage;
