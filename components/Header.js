import React, { useState, useEffect, useMemo } from 'react';
import {
   View,
   Text,
   StyleSheet,
   Image,
   Platform,
   StatusBar,
   TouchableOpacity,
   Alert,
   Linking,
   PermissionsAndroid,
   useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { normalize, normalizeVertical } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';

const createHeaderStyles = (n, nV, safeWidth, safeHeight) =>
   StyleSheet.create({
      headerBar: {
         width: '100%',
         paddingHorizontal: n(14),
         paddingBottom: n(10),
         justifyContent: 'center',
      },
      contentContainer: {
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         paddingVertical: n(2),
      },
      logoContainer: {
         flexDirection: 'row',
         alignItems: 'center',
         flex: 1,
         minHeight: n(46),
      },
      logoWrapper: {
         width: n(42),
         height: n(42),
         justifyContent: 'center',
         alignItems: 'center',
         marginRight: n(12),
         borderRadius: n(12),
         borderWidth: StyleSheet.hairlineWidth * 2,
         overflow: 'hidden',
      },
      logo: {
         width: n(34),
         height: n(34),
         resizeMode: 'contain',
      },
      titleContainer: {
         flexDirection: 'column',
         justifyContent: 'center',
         minHeight: n(42),
      },
      appNameRow: {
         flexDirection: 'row',
         alignItems: 'baseline',
         minHeight: n(26),
      },
      appNameFirstLetter: {
         fontSize: n(20),
         fontWeight: 'bold',
         fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
         color: '#007BFF',
         includeFontPadding: false,
         lineHeight: n(26),
      },
      appNameRest: {
         fontSize: n(14),
         fontWeight: 'bold',
         fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
         color: '#007BFF',
         includeFontPadding: false,
         lineHeight: n(22),
      },
      appSubName: {
         fontSize: n(11),
         color: '#007BFF',
         includeFontPadding: false,
         marginTop: n(2),
         lineHeight: n(16),
         minHeight: n(16),
      },
      rightIcons: {
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'flex-end',
         flex: 1,
         maxWidth: safeWidth * 0.6,
         minHeight: n(46),
      },
      locationContainer: {
         flexDirection: 'row',
         alignItems: 'center',
         marginLeft: n(8),
         paddingVertical: n(4),
         minHeight: n(32),
      },
      addressText: {
         color: '#007BFF',
         fontSize: n(12),
         maxWidth: safeWidth * 0.3,
         includeFontPadding: false,
         lineHeight: n(18),
      },
      locationIcon: {
         marginLeft: n(4),
         alignSelf: 'center',
      },
   });

const Header = () => {
   const { isDarkMode } = useTheme();
   const { width, height } = useWindowDimensions();
   const safeWidth = Math.max(width || 375, 200);
   const safeHeight = Math.max(height || 812, 400);
   const n = (size) => normalize(size, safeWidth);
   const nV = (size) => normalizeVertical(size, safeHeight);
   const styles = useMemo(
      () => createHeaderStyles(n, nV, safeWidth, safeHeight),
      [safeWidth, safeHeight]
   );

   const navigation = useNavigation();
   const [address, setAddress] = useState("Set Location");
   const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 20 : 24);
   /** Full-width bar behind logo + location (not transparent — avoids white bleed in dark mode). */
   const headerBarColor = isDarkMode ? '#0f172a' : '#007BFF';
   /** Text/icons on the solid bar: white on blue (light), light slate on navy (dark). */
   const onBarPrimary = isDarkMode ? '#f8fafc' : '#ffffff';
   const onBarMuted = isDarkMode ? 'rgba(248,250,252,0.78)' : 'rgba(255,255,255,0.88)';
   const logoRingBorder = isDarkMode ? 'rgba(248,250,252,0.45)' : '#E5E7EB';
   /** Light mode: solid white tile behind logo on blue bar; dark: subtle glass on slate. */
   const logoRingBg = isDarkMode ? 'rgba(248,250,252,0.12)' : '#FFFFFF';

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
            backgroundColor={headerBarColor}
            barStyle="light-content"
            translucent={true}
         />
         <View
            style={[
               styles.headerBar,
               {
                  backgroundColor: headerBarColor,
                  paddingTop: statusBarHeight,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: isDarkMode ? '#334155' : 'rgba(255,255,255,0.22)',
               },
            ]}
         >
            <View style={styles.contentContainer}>
               <View style={styles.logoContainer}>
                  <View
                     style={[
                        styles.logoWrapper,
                        {
                           borderColor: logoRingBorder,
                           backgroundColor: logoRingBg,
                        },
                     ]}
                  >
                     <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                     />
                  </View>
                  <View style={styles.titleContainer}>
                     <View style={styles.appNameRow}>
                        <Text style={[styles.appNameFirstLetter, { color: onBarPrimary }]}>n</Text>
                        <Text style={[styles.appNameRest, { color: onBarPrimary }]}>earX</Text>
                     </View>
                     <Text style={[styles.appSubName, { color: onBarMuted }]}>International</Text>
                  </View>
               </View>
               <View style={styles.rightIcons}>
                  <TouchableOpacity
                     style={styles.locationContainer}
                     onPress={handleLocationPress}
                  >
                     <Ionicons
                        name="chevron-down-outline"
                        size={n(14)}
                        color={onBarPrimary}
                        style={{ marginRight: n(4), alignSelf: 'center' }}
                     />
                     <Text
                        style={[styles.addressText, { color: onBarPrimary }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                     >
                        {address}
                     </Text>
                     <Ionicons
                        name="location-outline"
                        size={n(20)}
                        color={onBarPrimary}
                        style={styles.locationIcon}
                     />
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </>
   );
};

export default Header;
