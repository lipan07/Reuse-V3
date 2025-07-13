import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Profile = () => {
   const [userData, setUserData] = useState({ name: '', email: '' }); // Example user data

   const handleEditProfile = () => {
      // Logic to edit profile
      console.log('Edit profile');
   };

   return (
      <View style={styles.container}>
         <View style={styles.profileContainer}>
            <Text style={styles.profileText}>Name: {userData.name}</Text>
            <Text style={styles.profileText}>Email: {userData.email}</Text>
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
   profileContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
   },
   profileText: {
      fontSize: 18,
      marginBottom: 10,
   },
   editButton: {
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 5,
   },
});

export default Profile;
