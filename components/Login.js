import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, TouchableWithoutFeedback, StatusBar, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import ModalScreen from './SupportElement/ModalScreen';
import { getMessaging, getToken, onMessage } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

import { BASE_URL } from '@env';

const countryCodes = [
   { code: '+1', name: 'United States', flag: '🇺🇸' },
   { code: '+91', name: 'India', flag: '🇮🇳' },
   { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
   { code: '+61', name: 'Australia', flag: '🇦🇺' },
   { code: '+81', name: 'Japan', flag: '🇯🇵' },
   { code: '+86', name: 'China', flag: '🇨🇳' },
   { code: '+49', name: 'Germany', flag: '🇩🇪' },
   { code: '+33', name: 'France', flag: '🇫🇷' },
   { code: '+39', name: 'Italy', flag: '🇮🇹' },
   { code: '+7', name: 'Russia', flag: '🇷🇺' },
   { code: '+55', name: 'Brazil', flag: '🇧🇷' },
   { code: '+27', name: 'South Africa', flag: '🇿🇦' },
   { code: '+34', name: 'Spain', flag: '🇪🇸' },
   { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
   { code: '+63', name: 'Philippines', flag: '🇵🇭' },
   { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
   { code: '+82', name: 'South Korea', flag: '🇰🇷' },
   { code: '+65', name: 'Singapore', flag: '🇸🇬' },
   { code: '+66', name: 'Thailand', flag: '🇹🇭' },
   { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
   { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
   { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
   { code: '+20', name: 'Egypt', flag: '🇪🇬' },
   { code: '+98', name: 'Iran', flag: '🇮🇷' },
   { code: '+90', name: 'Turkey', flag: '🇹🇷' },
   { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
   { code: '+32', name: 'Belgium', flag: '🇧🇪' },
   { code: '+46', name: 'Sweden', flag: '🇸🇪' },
   { code: '+47', name: 'Norway', flag: '🇳🇴' },
   { code: '+48', name: 'Poland', flag: '🇵🇱' },
   { code: '+351', name: 'Portugal', flag: '🇵🇹' },
   { code: '+30', name: 'Greece', flag: '🇬🇷' },
   { code: '+52', name: 'Mexico', flag: '🇲🇽' },
   { code: '+54', name: 'Argentina', flag: '🇦🇷' },
   { code: '+56', name: 'Chile', flag: '🇨🇱' },
   { code: '+57', name: 'Colombia', flag: '🇨🇴' },
   { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
   { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
   { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
   { code: '+93', name: 'Afghanistan', flag: '🇦🇫' },
   { code: '+964', name: 'Iraq', flag: '🇮🇶' },
   { code: '+972', name: 'Israel', flag: '🇮🇱' },
   { code: '+212', name: 'Morocco', flag: '🇲🇦' },
   { code: '+213', name: 'Algeria', flag: '🇩🇿' },
   { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
   { code: '+254', name: 'Kenya', flag: '🇰🇪' },
   { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
   { code: '+256', name: 'Uganda', flag: '🇺🇬' },
   { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
   { code: '+233', name: 'Ghana', flag: '🇬🇭' },
   { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
   { code: '+260', name: 'Zambia', flag: '🇿🇲' },
   { code: '+977', name: 'Nepal', flag: '🇳🇵' },
   { code: '+975', name: 'Bhutan', flag: '🇧🇹' },
   { code: '+960', name: 'Maldives', flag: '🇲🇻' },
   { code: '+673', name: 'Brunei', flag: '🇧🇳' },
   { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
   { code: '+856', name: 'Laos', flag: '🇱🇦' },
   { code: '+855', name: 'Cambodia', flag: '🇰🇭' },
   { code: '+679', name: 'Fiji', flag: '🇫🇯' },
   { code: '+678', name: 'Vanuatu', flag: '🇻🇺' },
   { code: '+682', name: 'Cook Islands', flag: '🇨🇰' },
   { code: '+685', name: 'Samoa', flag: '🇼🇸' },
   { code: '+686', name: 'Kiribati', flag: '🇰🇮' },
   { code: '+687', name: 'New Caledonia', flag: '🇳🇨' },
   { code: '+689', name: 'French Polynesia', flag: '🇵🇫' },
   { code: '+672', name: 'Antarctica', flag: '🇦🇶' },
   { code: '+501', name: 'Belize', flag: '🇧🇿' },
   { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
   { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
   { code: '+504', name: 'Honduras', flag: '🇭🇳' },
   { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
   { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
   { code: '+507', name: 'Panama', flag: '🇵🇦' },
   { code: '+509', name: 'Haiti', flag: '🇭🇹' },
   { code: '+592', name: 'Guyana', flag: '🇬🇾' },
   { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
   { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
   { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
   { code: '+599', name: 'Netherlands Antilles', flag: '🇧🇶' },
];

const Login = () => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [countryCode, setCountryCode] = useState('+91');
   const [phoneNumber, setPhoneNumber] = useState('');
   const [otp, setOtp] = useState('');
   const [showOtpField, setShowOtpField] = useState(false);
   const [isModalVisible, setIsModalVisible] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [showAlert, setShowAlert] = useState(false);
   const [alertType, setAlertType] = useState('info');
   const [alertTitle, setAlertTitle] = useState('');
   const [alertMessage, setAlertMessage] = useState('');
   const [timer, setTimer] = useState(0);
   const [showTimer, setShowTimer] = useState(false);
   const [resendCount, setResendCount] = useState(0);
   const [isResending, setIsResending] = useState(false);
   const navigation = useNavigation();
   const otpInputRef = useRef(null);

   useEffect(() => {
      const checkLoginStatus = async () => {
         const token = await AsyncStorage.getItem('authToken');
         if (token) {
            setIsLoggedIn(true);
            navigation.navigate('Home');
         }
      };
      checkLoginStatus();
   }, []);

   useEffect(() => {
      let interval;
      if (showTimer && timer > 0) {
         interval = setInterval(() => {
            setTimer(prevTimer => prevTimer - 1);
         }, 1000);
      } else if (timer === 0 && showTimer) {
         setShowTimer(false);
      }
      return () => clearInterval(interval);
   }, [showTimer, timer]);

   // Progressive resend timer intervals (in minutes)
   const getResendInterval = (count) => {
      const intervals = [2, 5, 10, 15, 20];
      const index = Math.min(count, intervals.length - 1);
      return intervals[index];
   };

   const sendOtp = async () => {
      try {
         const response = await fetch(`${BASE_URL}/send-otp`, {
            method: 'POST',
            headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               phoneNumber: phoneNumber,
               countryCode: countryCode,
            }),
         });

         const data = await response.json();

         if (response.ok) {
            setResendCount(data.resend_count || 0);
            const intervalMinutes = getResendInterval(data.resend_count || 0);
            setTimer(intervalMinutes * 60); // Convert to seconds
            setShowTimer(true);
            setShowOtpField(true);

            setAlertType('success');
            setAlertTitle('OTP Sent');
            setAlertMessage(`OTP sent successfully! Resend available in ${intervalMinutes} minutes.`);
            setShowAlert(true);

            setTimeout(() => {
               otpInputRef.current?.focus();
            }, 100);
         } else {
            setAlertType('error');
            setAlertTitle('Failed to Send OTP');
            setAlertMessage(data.message || 'Failed to send OTP. Please try again.');
            setShowAlert(true);
         }
      } catch (error) {
         setAlertType('error');
         setAlertTitle('Connection Error');
         setAlertMessage('Please check your internet connection');
         setShowAlert(true);
      }
   };

   const resendOtp = async () => {
      if (isResending || timer > 0) return;

      setIsResending(true);
      try {
         const response = await fetch(`${BASE_URL}/resend-otp`, {
            method: 'POST',
            headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               phoneNumber: phoneNumber,
               countryCode: countryCode,
            }),
         });

         const data = await response.json();

         if (response.ok) {
            setResendCount(data.resend_count || 0);
            const intervalMinutes = getResendInterval(data.resend_count || 0);
            setTimer(intervalMinutes * 60); // Convert to seconds
            setShowTimer(true);

            setAlertType('success');
            setAlertTitle('OTP Resent');
            setAlertMessage(`OTP resent successfully! Next resend available in ${intervalMinutes} minutes.`);
            setShowAlert(true);
         } else {
            setAlertType('error');
            setAlertTitle('Failed to Resend OTP');
            setAlertMessage(data.message || 'Failed to resend OTP. Please try again.');
            setShowAlert(true);
         }
      } catch (error) {
         setAlertType('error');
         setAlertTitle('Connection Error');
         setAlertMessage('Please check your internet connection');
         setShowAlert(true);
      } finally {
         setIsResending(false);
      }
   };

   const handlePhoneNumberSubmit = async () => {
      if (!phoneNumber || phoneNumber.length < 10) {
         setAlertType('error');
         setAlertTitle('Invalid Phone');
         setAlertMessage('Please enter a valid 10-digit phone number');
         setShowAlert(true);
         return;
      }

      await sendOtp();
   };

   const handleOtpSubmit = async () => {
      try {
         const messaging = getMessaging(getApp());
         const fcmToken = await getToken(messaging);

         const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               phoneNumber: `${phoneNumber}`,
               otp: `${otp}`,
               fcmToken: `${fcmToken}`,
               platform: `${Platform.OS}`
            }),
         });

         const data = await response.json();

         if (response.ok) {
            await AsyncStorage.multiSet([
               ['authToken', data.token],
               ['userId', data.user.id.toString()],
               ['name', data.user.name],
               ['phoneNo', data.user.phone_no],
               ['userName', data.user.name || ''],
               ['userImage', data.user.images?.url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png']
            ]);
            setIsLoggedIn(true);
            navigation.navigate('Home');
         } else {
            setAlertType('error');
            setAlertTitle('Login Failed');
            setAlertMessage(data.message || 'Invalid credentials');
            setShowAlert(true);
         }
      } catch (error) {
         setAlertType('error');
         setAlertTitle('Connection Error');
         setAlertMessage('Please check your internet connection');
         setShowAlert(true);
      }
   };

   const handleLogout = async () => {
      await AsyncStorage.clear();
      setIsLoggedIn(false);
      setShowOtpField(false);
      setShowTimer(false);
      setCountryCode('+91');
      setPhoneNumber('');
      setOtp('');
      setResendCount(0);
      setTimer(0);
      setIsResending(false);
   };

   const filteredCountries = countryCodes.filter(country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.includes(searchQuery)
   );

   const renderCountryCodeItem = ({ item }) => (
      <TouchableOpacity
         style={styles.countryCodeItem}
         onPress={() => {
            setCountryCode(item.code);
            setIsModalVisible(false);
         }}
      >
         <Text style={styles.countryCodeText}>{item.flag} {item.name} ({item.code})</Text>
      </TouchableOpacity>
   );

   return (
      <>
         <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
         <View style={styles.container}>
            <ModalScreen
               visible={showAlert}
               type={alertType}
               title={alertTitle}
               message={alertMessage}
               onClose={() => setShowAlert(false)}
            />

            <Text style={styles.loginTitle}>Welcome to <Text style={styles.brandName}>Reuse</Text>!</Text>
            <Text style={styles.loginSubtitle}>Login to your account</Text>

            <View style={styles.phoneInputContainer}>
               <TouchableOpacity
                  style={styles.countryCodeInput}
                  onPress={() => setIsModalVisible(true)}
                  activeOpacity={0.8}
               >
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
               </TouchableOpacity>

               <TextInput
                  style={styles.phoneNumberInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="Phone number"
                  placeholderTextColor="#bbb"
               />
            </View>

            {showOtpField && (
               <>
                  <TextInput
                     ref={otpInputRef}
                     style={styles.input}
                     placeholder="Enter OTP"
                     placeholderTextColor="#bbb"
                     value={otp}
                     onChangeText={setOtp}
                     keyboardType="number-pad"
                     autoFocus
                  />
                  {showTimer && (
                     <Text style={styles.timerText}>
                        Resend available in: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                     </Text>
                  )}
                  {resendCount > 0 && (
                     <Text style={styles.resendCountText}>
                        Resend attempts: {resendCount}/5
                     </Text>
                  )}
               </>
            )}

            {/* Send OTP Button - Only show when OTP field is not visible */}
            {!showOtpField && (
               <TouchableOpacity
                  style={[
                     styles.loginButton,
                     isResending && styles.disabledButton
                  ]}
                  onPress={handlePhoneNumberSubmit}
                  activeOpacity={0.85}
                  disabled={isResending}
               >
                  <Text style={styles.buttonText}>
                     {isResending ? 'Sending...' : 'Send OTP'}
                  </Text>
               </TouchableOpacity>
            )}

            {/* Verify OTP Button - Show when OTP field is visible */}
            {showOtpField && (
               <TouchableOpacity
                  style={[
                     styles.loginButton,
                     isResending && styles.disabledButton
                  ]}
                  onPress={handleOtpSubmit}
                  activeOpacity={0.85}
                  disabled={isResending}
               >
                  <Text style={styles.buttonText}>
                     Verify OTP
                  </Text>
               </TouchableOpacity>
            )}

            {/* Resend OTP Button - Only show when OTP field is visible AND timer has expired */}
            {showOtpField && !showTimer && (
               <TouchableOpacity
                  style={[
                     styles.resendButton,
                     isResending && styles.disabledButton
                  ]}
                  onPress={resendOtp}
                  activeOpacity={0.85}
                  disabled={isResending}
               >
                  <Text style={[
                     styles.resendButtonText,
                     isResending && styles.disabledText
                  ]}>
                     {isResending ? 'Resending...' : 'Resend OTP'}
                  </Text>
               </TouchableOpacity>
            )}

            {isLoggedIn && (
               <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.buttonText}>Logout</Text>
               </TouchableOpacity>
            )}

            <Text style={styles.freeServiceText}>Always 100% free — no charges, no subscriptions, ever.</Text>

            <Modal visible={isModalVisible} transparent animationType="slide">
               <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                  <View style={styles.modalOverlay}>
                     <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                           <View style={styles.modalHeader}>
                              <Text style={styles.modalTitle}>Select Country</Text>
                              <TouchableOpacity
                                 onPress={() => setIsModalVisible(false)}
                                 style={styles.closeButton}
                              >
                                 <MaterialIcons name="close" size={24} color="#666" />
                              </TouchableOpacity>
                           </View>

                           <View style={styles.searchContainer}>
                              <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
                              <TextInput
                                 style={styles.searchInput}
                                 placeholder="Search country or code"
                                 placeholderTextColor="#aaa"
                                 value={searchQuery}
                                 onChangeText={setSearchQuery}
                              />
                           </View>

                           <FlatList
                              data={filteredCountries}
                              keyExtractor={(item) => item.code}
                              renderItem={renderCountryCodeItem}
                              keyboardDismissMode="on-drag"
                              contentContainerStyle={styles.countryList}
                           />
                        </View>
                     </TouchableWithoutFeedback>
                  </View>
               </TouchableWithoutFeedback>
            </Modal>
         </View>
      </>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 24,
      backgroundColor: '#f9fafb',
      justifyContent: 'center',
   },
   loginTitle: {
      fontSize: 30,
      fontWeight: '700',
      color: '#2d3436',
      marginBottom: 4,
      textAlign: 'center',
   },
   brandName: {
      color: '#0984e3',
   },
   loginSubtitle: {
      fontSize: 16,
      color: '#636e72',
      marginBottom: 28,
      textAlign: 'center',
   },
   freeServiceText: {
      textAlign: 'center',
      fontSize: 14,
      color: '#b2bec3',
      marginBottom: 28,
   },
   phoneInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: '#fff',
      borderRadius: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: '#dfe6e9',
   },
   countryCodeInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingRight: 10,
   },
   countryCodeText: {
      fontSize: 16,
      color: '#2d3436',
      fontWeight: '600',
   },
   phoneNumberInput: {
      flex: 1,
      height: 48,
      fontSize: 16,
      color: '#2d3436',
   },
   input: {
      height: 48,
      borderRadius: 12,
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      fontSize: 16,
      color: '#2d3436',
      borderWidth: 1,
      borderColor: '#dfe6e9',
      marginBottom: 10,
   },
   timerText: {
      textAlign: 'center',
      color: '#636e72',
      marginBottom: 10,
      fontSize: 14,
   },
   resendCountText: {
      textAlign: 'center',
      color: '#74b9ff',
      marginBottom: 15,
      fontSize: 12,
      fontWeight: '600',
   },
   resendButton: {
      backgroundColor: 'transparent',
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
      borderWidth: 2,
      borderColor: '#0984e3',
   },
   resendButtonText: {
      color: '#0984e3',
      fontSize: 16,
      fontWeight: '600',
   },
   disabledText: {
      color: '#b2bec3',
   },
   loginButton: {
      backgroundColor: '#0984e3',
      height: 52,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
   },
   disabledButton: {
      backgroundColor: '#b2bec3',
   },
   logoutButton: {
      backgroundColor: '#d63031',
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
   },
   buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
   },
   modalContainer: {
      backgroundColor: '#fff',
      height: '60%',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 16,
   },
   modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#ecf0f1',
   },
   modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#2d3436',
   },
   searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 16,
      backgroundColor: '#f1f2f6',
      borderRadius: 12,
      paddingHorizontal: 12,
   },
   searchIcon: {
      marginRight: 8,
   },
   searchInput: {
      flex: 1,
      height: 44,
      fontSize: 16,
      color: '#2d3436',
   },
   countryCodeItem: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#ecf0f1',
   },
   countryList: {
      paddingBottom: 20,
   },
});

export default Login;