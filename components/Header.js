import React, { useState, useEffect } from 'react';
import {
   View,
   Text,
   StyleSheet,
   Image,
   Platform,
   StatusBar,
   TouchableOpacity,
   Dimensions,
   Alert,
   Linking,
   PermissionsAndroid
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);



const Header = () => {
   const navigation = useNavigation();
   const [address, setAddress] = useState("Set Location");
   const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 20 : 24);

   const handleNavigation = async () => {
      try {
         await AsyncStorage.removeItem('authToken');
         navigation.navigate('Login');
         console.log('Logged out successfully');
      } catch (error) {
         console.error('Error logging out:', error);
      }
   };

   // Request location permission
   const requestLocationPermission = async () => {
      if (Platform.OS !== 'android') {
         // iOS handles permissions automatically
         return true;
      }

      try {
         const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
               title: 'Location Permission',
               message: 'This app needs access to your location to show nearby products.',
               buttonNeutral: 'Ask Me Later',
               buttonNegative: 'Cancel',
               buttonPositive: 'OK',
            }
         );
         return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
         console.warn('Permission request error:', err);
         return false;
      }
   };

   // Get current device location
   const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
         Geolocation.getCurrentPosition(
            (position) => {
               resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
               });
            },
            (error) => {
               console.error('Error getting location:', error);
               reject(error);
            },
            {
               enableHighAccuracy: true,
               timeout: 15000,
               maximumAge: 10000,
            }
         );
      });
   };

   // Reverse geocode to get address from coordinates
   const getAddressFromCoordinates = async (latitude, longitude) => {
      try {
         const API_KEY = process.env.GOOGLE_MAP_API_KEY;
         const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;

         const response = await fetch(url);
         const data = await response.json();

         if (data.status === 'OK' && data.results.length > 0) {
            return data.results[0].formatted_address;
         }
         return `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
      } catch (error) {
         console.error('Error reverse geocoding:', error);
         return `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
      }
   };

   // Handle location container press - Navigate immediately, let LocationPicker handle location
   const handleLocationPress = async () => {
      // Navigate immediately to LocationPicker
      // LocationPicker will handle checking saved location and requesting device location
      navigation.navigate('LocationPicker');
   };

   // Fetch address from AsyncStorage
   useEffect(() => {
      const fetchAddress = async () => {
         try {
            const savedLocation = await AsyncStorage.getItem('defaultLocation');
            if (savedLocation) {
               const parsed = JSON.parse(savedLocation);
               setAddress(parsed.address || "Set Location");
            } else {
               setAddress("Set Location");
            }
         } catch (error) {
            console.error('Failed to load saved location:', error);
            setAddress("Set Location");
         }
      };

      fetchAddress();
   }, []);

   // Refresh address when screen is focused
   useFocusEffect(
      React.useCallback(() => {
         const fetchAddress = async () => {
            try {
               const savedLocation = await AsyncStorage.getItem('defaultLocation');
               if (savedLocation) {
                  const parsed = JSON.parse(savedLocation);
                  setAddress(parsed.address || "Set Location");
               } else {
                  setAddress("Set Location");
               }
            } catch (error) {
               console.error('Failed to load saved location:', error);
               setAddress("Set Location");
            }
         };
         fetchAddress();
      }, [])
   );


   return (
      <>
         <StatusBar
            backgroundColor="#007BFF"
            barStyle="light-content"
            translucent={true}
         />
         {/* Blue background for status bar area */}
         <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: statusBarHeight,
            backgroundColor: '#007BFF',
            zIndex: 1,
         }} />
         <View style={[styles.headerContainer, { paddingTop: statusBarHeight }]}>
            <View style={styles.contentContainer}>
               <View style={styles.logoContainer}>
                  <View style={styles.logoWrapper}>
                     <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                     />
                  </View>
                  <View style={styles.titleContainer}>
                     <View style={styles.appNameRow}>
                        <Text style={styles.appNameFirstLetter}>n</Text>
                        <Text style={styles.appNameRest}>earX</Text>
                     </View>
                     <Text style={styles.appSubName}>International</Text>
                  </View>
               </View>
               <View style={styles.rightIcons}>
                  <TouchableOpacity
                     style={styles.locationContainer}
                     onPress={handleLocationPress}
                  >
                     {/* Down arrow icon before address */}
                     <Ionicons
                        name="chevron-down-outline"
                        size={14}
                        color="#007BFF"
                        style={{ marginRight: 4, alignSelf: 'center' }}
                     />
                     <Text
                        style={styles.addressText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                     >
                        {address}
                     </Text>
                     <Ionicons
                        name="location-outline"
                        size={20}
                        color="#007BFF"
                        style={styles.locationIcon}
                     />
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </>
   );
};

const styles = StyleSheet.create({
   headerContainer: {
      backgroundColor: 'transparent',
      minHeight: Platform.select({
         ios: normalizeVertical(56),
         android: normalizeVertical(52),
         default: normalizeVertical(52)
      }),
      paddingHorizontal: normalize(12),
      justifyContent: 'center',
   },
   contentContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: normalizeVertical(4), // Reduced padding top and bottom
   },
   logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minHeight: normalizeVertical(40), // Ensure minimum height for proper alignment
   },
   logoWrapper: {
      width: normalize(36),
      height: normalize(36),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: normalize(10),
      borderColor: '#007BFF',
      borderWidth: 0.8,
      borderRadius: normalize(2), // Optional: slight border radius for better appearance
   },
   logo: {
      width: normalize(32),
      height: normalize(32),
      resizeMode: 'contain',
   },
   titleContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      height: normalizeVertical(36), // Match logo height for alignment
   },
   appNameRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      height: normalizeVertical(20), // Fixed height for consistent alignment
   },
   appNameFirstLetter: {
      fontSize: normalize(20),
      fontWeight: 'bold',
      fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
      color: '#007BFF',
      includeFontPadding: false,
      lineHeight: normalizeVertical(20),
   },
   appNameRest: {
      fontSize: normalize(14),
      fontWeight: 'bold',
      fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
      color: '#007BFF',
      includeFontPadding: false,
      lineHeight: normalizeVertical(20),
   },
   appSubName: {
      fontSize: normalize(11),
      color: '#007BFF',
      includeFontPadding: false,
      marginTop: normalizeVertical(1),
      lineHeight: normalizeVertical(14),
      height: normalizeVertical(14), // Fixed height for consistent spacing
   },
   rightIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 1,
      maxWidth: width * 0.6,
      minHeight: normalizeVertical(40), // Match logo container height
   },
   locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: normalize(8),
      paddingVertical: normalizeVertical(4), // Add vertical padding for better touch area
   },
   addressText: {
      color: '#007BFF',
      fontSize: normalize(12),
      maxWidth: width * 0.3,
      includeFontPadding: false,
      lineHeight: normalizeVertical(16),
   },
   locationIcon: {
      marginLeft: normalize(4),
      alignSelf: 'center', // Better vertical alignment
   },
});

export default Header;
