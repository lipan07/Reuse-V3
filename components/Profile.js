import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
   const { isDarkMode } = useTheme();
   const [userData, setUserData] = useState({ name: '', email: '' }); // Example user data

   const handleEditProfile = () => {
      // Logic to edit profile
      console.log('Edit profile');
   };

   return (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
         <View style={styles.profileContainer}>
            <Text style={[styles.profileText, isDarkMode && styles.darkProfileText]}>
               Name: {userData.name}
            </Text>
            <Text style={[styles.profileText, isDarkMode && styles.darkProfileText]}>
               Email: {userData.email}
            </Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
               <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
         </View>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#ffffff',
   },
   darkContainer: {
      backgroundColor: '#121212',
   },
   profileContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
   },
   profileText: {
      fontSize: 18,
      marginBottom: 10,
      color: '#1a1a1a',
   },
   darkProfileText: {
      color: '#f1f5f9',
   },
   editButton: {
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 5,
   },
   buttonText: {
      color: '#fff',
      fontWeight: '600',
   },
});

export default Profile;
