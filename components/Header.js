import React, { useState, useEffect } from 'react';
import {
   View,
   Text,
   StyleSheet,
   Image,
   Platform,
   StatusBar,
   TouchableOpacity,
   Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
                  <Image
                     source={{ uri: 'https://i.pinimg.com/originals/92/4c/af/924cafad941065f4d5c03ca5423bfcd3.gif' }}
                     style={styles.logo}
                  />
                  <View style={styles.titleContainer}>
                     <Text style={styles.appName}>Reuse</Text>
                     <Text style={styles.appSubName}>Bharat</Text>
                  </View>
               </View>
               <View style={styles.rightIcons}>
                  <TouchableOpacity
                     style={styles.locationContainer}
                     onPress={() => navigation.navigate('LocationPicker')}
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
      height: Platform.select({
         ios: normalizeVertical(70),
         android: normalizeVertical(80),
         default: normalizeVertical(80)
      }),
      paddingHorizontal: normalize(12),
   },
   contentContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Platform.select({
         ios: normalizeVertical(4),
         android: normalizeVertical(1),
         default: normalizeVertical(1)
      }),
   },
   logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
   },
   logo: {
      width: normalize(32),
      height: normalize(32),
      resizeMode: 'contain',
      borderColor: '#007BFF',
      borderWidth: 1,
      marginRight: normalize(8),
   },
   titleContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
   },
   appName: {
      fontSize: normalize(16),
      fontWeight: 'bold',
      color: '#007BFF',
      includeFontPadding: false,
   },
   appSubName: {
      fontSize: normalize(12),
      color: '#007BFF',
      includeFontPadding: false,
      marginTop: -normalizeVertical(2),
   },
   rightIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 1,
      maxWidth: width * 0.6,
   },
   locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: normalize(8),
   },
   addressText: {
      color: '#007BFF',
      fontSize: normalize(12),
      maxWidth: width * 0.3,
      includeFontPadding: false,
   },
   locationIcon: {
      marginLeft: normalize(4),
      marginTop: normalizeVertical(1),
      fontSize: normalize(19), // Ionicons will use this if size prop is not set
   },
});

export default Header;
