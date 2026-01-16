import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, TouchableWithoutFeedback, StatusBar, Platform, Animated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
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

const Toast = ({ visible, type, title, message, onClose }) => {
   const slideAnim = useRef(new Animated.Value(-100)).current;
   const opacityAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      if (visible) {
         // Slide in
         Animated.parallel([
            Animated.spring(slideAnim, {
               toValue: 0,
               tension: 50,
               friction: 8,
               useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
               toValue: 1,
               duration: 300,
               useNativeDriver: true,
            }),
         ]).start();

         // Auto dismiss after 4 seconds
         const timer = setTimeout(() => {
            hideToast();
         }, 4000);

         return () => clearTimeout(timer);
      }
   }, [visible]);

   const hideToast = () => {
      Animated.parallel([
         Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
         }),
         Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
         }),
      ]).start(() => {
         onClose();
      });
   };

   if (!visible) return null;

   const getToastStyles = () => {
      switch (type) {
         case 'success':
            return {
               backgroundColor: '#10b981',
               iconName: 'check-circle',
               iconColor: '#fff',
            };
         case 'error':
            return {
               backgroundColor: '#ef4444',
               iconName: 'error',
               iconColor: '#fff',
            };
         case 'info':
         default:
            return {
               backgroundColor: '#3b82f6',
               iconName: 'info',
               iconColor: '#fff',
            };
      }
   };

   const toastStyles = getToastStyles();

   return (
      <Animated.View
         style={[
            styles.toastContainer,
            {
               backgroundColor: toastStyles.backgroundColor,
               transform: [{ translateY: slideAnim }],
               opacity: opacityAnim,
            },
         ]}
      >
         <View style={styles.toastContent}>
            <MaterialIcons name={toastStyles.iconName} size={24} color={toastStyles.iconColor} />
            <View style={styles.toastTextContainer}>
               <Text style={styles.toastTitle}>{title}</Text>
               <Text style={styles.toastMessage}>{message}</Text>
            </View>
            <TouchableOpacity onPress={hideToast} style={styles.toastCloseButton}>
               <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
         </View>
      </Animated.View>
   );
};

const Login = () => {
   const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [isCheckingAuth, setIsCheckingAuth] = useState(true);

   // Login states
   const [loginEmail, setLoginEmail] = useState('');
   const [loginOtp, setLoginOtp] = useState('');
   const [loginShowOtpField, setLoginShowOtpField] = useState(false);
   const [loginTimer, setLoginTimer] = useState(0);
   const [loginShowTimer, setLoginShowTimer] = useState(false);
   const [loginResendCount, setLoginResendCount] = useState(0);

   // Signup states
   const [signupName, setSignupName] = useState('');
   const [signupEmail, setSignupEmail] = useState('');
   const [signupCountryCode, setSignupCountryCode] = useState('+91');
   const [signupPhoneNumber, setSignupPhoneNumber] = useState('');
   const [inviteToken, setInviteToken] = useState('');

   // Common states
   const [isModalVisible, setIsModalVisible] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [showAlert, setShowAlert] = useState(false);
   const [alertType, setAlertType] = useState('info');
   const [alertTitle, setAlertTitle] = useState('');
   const [alertMessage, setAlertMessage] = useState('');
   const [isResending, setIsResending] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const navigation = useNavigation();
   const route = useRoute();
   const otpInputRef = useRef(null);

   useEffect(() => {
      const checkLoginStatus = async () => {
         try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
               setIsLoggedIn(true);
               navigation.navigate('Home');
            }
         } catch (error) {
            console.error('Error checking login status:', error);
         } finally {
            setIsCheckingAuth(false);
         }
      };
      checkLoginStatus();
   }, []);

   // Check for invite token in route params
   useEffect(() => {
      if (route.params?.inviteToken) {
         setInviteToken(route.params.inviteToken);
         setActiveTab('signup'); // Switch to signup tab if invite token is present
      }
   }, [route.params]);

   useEffect(() => {
      let interval;
      if (loginShowTimer && loginTimer > 0) {
         interval = setInterval(() => {
            setLoginTimer(prevTimer => prevTimer - 1);
         }, 1000);
      } else if (loginTimer === 0 && loginShowTimer) {
         setLoginShowTimer(false);
      }
      return () => clearInterval(interval);
   }, [loginShowTimer, loginTimer]);

   // Progressive resend timer intervals (in minutes)
   const getResendInterval = (count) => {
      const intervals = [2, 5, 10, 15, 20];
      const index = Math.min(count, intervals.length - 1);
      return intervals[index];
   };

   // Reset login form when switching tabs
   useEffect(() => {
      if (activeTab === 'login') {
         setLoginShowOtpField(false);
         setLoginOtp('');
         setLoginTimer(0);
         setLoginShowTimer(false);
         setLoginResendCount(0);
      } else {
         setSignupName('');
         setSignupEmail('');
         setSignupPhoneNumber('');
         setSignupCountryCode('+91');
      }
   }, [activeTab]);

   // LOGIN FLOW FUNCTIONS
   const sendLoginOtp = async () => {
      if (!loginEmail || loginEmail.trim().length === 0) {
         setAlertType('error');
         setAlertTitle('Email Required');
         setAlertMessage('Please enter your email address');
         setShowAlert(true);
         return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginEmail.trim())) {
         setAlertType('error');
         setAlertTitle('Invalid Email');
         setAlertMessage('Please enter a valid email address');
         setShowAlert(true);
         return;
      }

      setIsSubmitting(true);
      try {
         const requestBody = {
            email: loginEmail.trim(),
         };

         const response = await fetch(`${BASE_URL}/send-otp`, {
            method: 'POST',
            headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
         });

         const data = await response.json();

         if (response.ok) {
            setLoginResendCount(data.resend_count || 0);
            const intervalMinutes = getResendInterval(data.resend_count || 0);
            setLoginTimer(intervalMinutes * 60); // Convert to seconds
            setLoginShowTimer(true);
            setLoginShowOtpField(true);

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
      } finally {
         setIsSubmitting(false);
      }
   };

   const resendLoginOtp = async () => {
      if (isResending || loginTimer > 0) return;

      setIsResending(true);
      try {
         const requestBody = {
            email: loginEmail.trim(),
         };

         const response = await fetch(`${BASE_URL}/resend-otp`, {
            method: 'POST',
            headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
         });

         const data = await response.json();

         if (response.ok) {
            setLoginResendCount(data.resend_count || 0);
            const intervalMinutes = getResendInterval(data.resend_count || 0);
            setLoginTimer(intervalMinutes * 60);
            setLoginShowTimer(true);
            setLoginShowOtpField(true);
            setLoginOtp(''); // Clear previous OTP

            setAlertType('success');
            setAlertTitle('OTP Resent');
            setAlertMessage(`OTP resent successfully! Next resend available in ${intervalMinutes} minutes.`);
            setShowAlert(true);

            setTimeout(() => {
               otpInputRef.current?.focus();
            }, 100);
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

   const handleLoginOtpSubmit = async () => {
      if (!loginOtp || loginOtp.trim().length < 4) {
         setAlertType('error');
         setAlertTitle('Invalid OTP');
         setAlertMessage('Please enter a valid OTP');
         setShowAlert(true);
         return;
      }

      setIsSubmitting(true);
      try {
         const messaging = getMessaging(getApp());
         const fcmToken = await getToken(messaging);

         const requestBody = {
            email: loginEmail.trim(),
            otp: loginOtp.trim(),
            fcmToken: `${fcmToken}`,
            platform: `${Platform.OS}`
         };

         const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
         });

         const data = await response.json();

         if (response.ok) {
            await AsyncStorage.multiSet([
               ['authToken', data.token],
               ['userId', data.user.id.toString()],
               ['name', data.user.name],
               ['phoneNo', data.user.phone_no || ''],
               ['userName', data.user.name || ''],
               ['userImage', data.user.images?.url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png']
            ]);
            setIsLoggedIn(true);
            navigation.navigate('Home');
         } else {
            setAlertType('error');
            setAlertTitle('Login Failed');
            setAlertMessage(data.message || 'Invalid OTP');
            setShowAlert(true);
         }
      } catch (error) {
         setAlertType('error');
         setAlertTitle('Connection Error');
         setAlertMessage('Please check your internet connection');
         setShowAlert(true);
      } finally {
         setIsSubmitting(false);
      }
   };

   // SIGNUP FLOW FUNCTIONS
   const handleSignup = async () => {
      // Validate name
      if (!signupName || signupName.trim().length === 0) {
         setAlertType('error');
         setAlertTitle('Name Required');
         setAlertMessage('Please enter your name');
         setShowAlert(true);
         return;
      }

      // Validate email
      if (!signupEmail || signupEmail.trim().length === 0) {
         setAlertType('error');
         setAlertTitle('Email Required');
         setAlertMessage('Please enter your email address');
         setShowAlert(true);
         return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupEmail.trim())) {
         setAlertType('error');
         setAlertTitle('Invalid Email');
         setAlertMessage('Please enter a valid email address');
         setShowAlert(true);
         return;
      }

      // Validate phone if provided
      if (signupPhoneNumber.trim().length > 0 && signupPhoneNumber.trim().length < 10) {
         setAlertType('error');
         setAlertTitle('Invalid Phone');
         setAlertMessage('Please enter a valid phone number (at least 10 digits)');
         setShowAlert(true);
         return;
      }

      setIsSubmitting(true);
      try {
         const requestBody = {
            name: signupName.trim(),
            email: signupEmail.trim(),
         };

         // Add optional phone if provided
         if (signupPhoneNumber.trim()) {
            requestBody.phoneNumber = signupPhoneNumber.trim();
            requestBody.countryCode = signupCountryCode;
         }

         // Add invite token if present
         if (inviteToken.trim()) {
            requestBody.invite_token = inviteToken.trim();
         }

         const response = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
         });

         const data = await response.json();

         if (response.ok) {
            setAlertType('success');
            setAlertTitle('Account Created');
            setAlertMessage('Your account has been created successfully! Please login with your email.');
            setShowAlert(true);

            // Switch to login tab and pre-fill email
            setTimeout(() => {
               setActiveTab('login');
               setLoginEmail(signupEmail.trim());
               setSignupName('');
               setSignupEmail('');
               setSignupPhoneNumber('');
            }, 1500);
         } else {
            setAlertType('error');
            setAlertTitle('Signup Failed');
            setAlertMessage(data.message || data.errors?.email?.[0] || 'Failed to create account. Please try again.');
            setShowAlert(true);
         }
      } catch (error) {
         setAlertType('error');
         setAlertTitle('Connection Error');
         setAlertMessage('Please check your internet connection');
         setShowAlert(true);
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleLogout = async () => {
      await AsyncStorage.clear();
      setIsLoggedIn(false);
      setLoginShowOtpField(false);
      setLoginEmail('');
      setLoginOtp('');
      setLoginResendCount(0);
      setLoginTimer(0);
      setLoginShowTimer(false);
      setIsResending(false);
      setIsSubmitting(false);
   };

   const filteredCountries = countryCodes.filter(country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.includes(searchQuery)
   );

   const renderCountryCodeItem = ({ item }) => (
      <TouchableOpacity
         style={styles.countryCodeItem}
         onPress={() => {
            if (activeTab === 'signup') {
               setSignupCountryCode(item.code);
            }
            setIsModalVisible(false);
         }}
      >
         <Text style={styles.countryCodeText}>{item.flag} {item.name} ({item.code})</Text>
      </TouchableOpacity>
   );

   // Don't render until auth check is complete
   if (isCheckingAuth) {
      return null;
   }

   return (
      <>
         <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
         <View style={styles.container}>
            <Toast
               visible={showAlert}
               type={alertType}
               title={alertTitle}
               message={alertMessage}
               onClose={() => setShowAlert(false)}
            />

            <Text style={styles.loginTitle}>Welcome to <Text style={styles.brandName}>nearX</Text>!</Text>
            <Text style={styles.loginSubtitle}>
               {activeTab === 'login' ? 'Login to your account' : 'Create your account'}
            </Text>

            {/* LOGIN FLOW */}
            {activeTab === 'login' && (
               <>
                  {/* Email Field */}
                  <TextInput
                     style={styles.input}
                     value={loginEmail}
                     onChangeText={setLoginEmail}
                     keyboardType="email-address"
                     placeholder="Email *"
                     placeholderTextColor="#bbb"
                     autoCapitalize="none"
                     editable={!loginShowOtpField}
                  />

                  {/* OTP Field - Show only when timer is active */}
                  {loginShowOtpField && loginShowTimer && (
                     <>
                        <TextInput
                           ref={otpInputRef}
                           style={styles.input}
                           placeholder="Enter OTP"
                           placeholderTextColor="#bbb"
                           value={loginOtp}
                           onChangeText={setLoginOtp}
                           keyboardType="number-pad"
                           autoFocus
                        />
                        <Text style={styles.timerText}>
                           Resend available in: {Math.floor(loginTimer / 60)}:{(loginTimer % 60).toString().padStart(2, '0')}
                        </Text>
                        {loginResendCount > 0 && (
                           <Text style={styles.resendCountText}>
                              Resend attempts: {loginResendCount}/5
                           </Text>
                        )}
                     </>
                  )}

                  {/* Send OTP Button - Show when OTP field is not visible */}
                  {!loginShowOtpField && (
                     <TouchableOpacity
                        style={[
                           styles.loginButton,
                           isSubmitting && styles.disabledButton
                        ]}
                        onPress={sendLoginOtp}
                        activeOpacity={0.85}
                        disabled={isSubmitting}
                     >
                        <Text style={styles.buttonText}>
                           {isSubmitting ? 'Sending...' : 'Send OTP'}
                        </Text>
                     </TouchableOpacity>
                  )}

                  {/* Login Button - Show when OTP field is visible AND timer is active */}
                  {loginShowOtpField && loginShowTimer && (
                     <TouchableOpacity
                        style={[
                           styles.loginButton,
                           isSubmitting && styles.disabledButton
                        ]}
                        onPress={handleLoginOtpSubmit}
                        activeOpacity={0.85}
                        disabled={isSubmitting}
                     >
                        <Text style={styles.buttonText}>
                           {isSubmitting ? 'Verifying...' : 'Login'}
                        </Text>
                     </TouchableOpacity>
                  )}

                  {/* Resend OTP Button - Show when OTP field is visible AND timer has expired */}
                  {loginShowOtpField && !loginShowTimer && (
                     <TouchableOpacity
                        style={[
                           styles.resendButton,
                           isResending && styles.disabledButton
                        ]}
                        onPress={resendLoginOtp}
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
               </>
            )}

            {/* SIGNUP FLOW */}
            {activeTab === 'signup' && (
               <>
                  {/* Name Field */}
                  <TextInput
                     style={styles.input}
                     value={signupName}
                     onChangeText={setSignupName}
                     placeholder="Name *"
                     placeholderTextColor="#bbb"
                     autoCapitalize="words"
                  />

                  {/* Email Field */}
                  <TextInput
                     style={styles.input}
                     value={signupEmail}
                     onChangeText={setSignupEmail}
                     keyboardType="email-address"
                     placeholder="Email *"
                     placeholderTextColor="#bbb"
                     autoCapitalize="none"
                  />

                  {/* Phone Number Field - Optional */}
                  <View style={styles.phoneInputContainer}>
                     <TouchableOpacity
                        style={styles.countryCodeInput}
                        onPress={() => setIsModalVisible(true)}
                        activeOpacity={0.8}
                     >
                        <Text style={styles.countryCodeText}>{signupCountryCode}</Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                     </TouchableOpacity>

                     <TextInput
                        style={styles.phoneNumberInput}
                        value={signupPhoneNumber}
                        onChangeText={setSignupPhoneNumber}
                        keyboardType="phone-pad"
                        placeholder="Phone Number (Optional)"
                        placeholderTextColor="#bbb"
                     />
                  </View>

                  {/* Signup Button */}
                  <TouchableOpacity
                     style={[
                        styles.loginButton,
                        isSubmitting && styles.disabledButton
                     ]}
                     onPress={handleSignup}
                     activeOpacity={0.85}
                     disabled={isSubmitting}
                  >
                     <Text style={styles.buttonText}>
                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                     </Text>
                  </TouchableOpacity>
               </>
            )}

            {/* Link to switch between Login and Signup */}
            {!isLoggedIn && (
               <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>
                     {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  </Text>
                  <TouchableOpacity
                     onPress={() => {
                        setActiveTab(activeTab === 'login' ? 'signup' : 'login');
                     }}
                     activeOpacity={0.7}
                  >
                     <Text style={styles.switchLink}>
                        {activeTab === 'login' ? 'Sign Up' : 'Login'}
                     </Text>
                  </TouchableOpacity>
               </View>
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
   switchContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 10,
   },
   switchText: {
      fontSize: 14,
      color: '#636e72',
   },
   switchLink: {
      fontSize: 14,
      color: '#0984e3',
      fontWeight: '600',
      textDecorationLine: 'underline',
   },
   freeServiceText: {
      textAlign: 'center',
      fontSize: 14,
      color: '#b2bec3',
      marginTop: 20,
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
      height: 52,
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
   // Toast Notification Styles
   toastContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 10,
      left: 16,
      right: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 9999,
   },
   toastContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
   },
   toastTextContainer: {
      flex: 1,
      marginLeft: 12,
      marginRight: 8,
   },
   toastTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 2,
   },
   toastMessage: {
      color: '#fff',
      fontSize: 14,
      opacity: 0.95,
      lineHeight: 18,
   },
   toastCloseButton: {
      padding: 4,
   },
});

export default Login;
