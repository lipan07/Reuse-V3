import React, { useState } from 'react';
import 'react-native-get-random-values';
import { View, TouchableOpacity, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { AlertNotificationRoot, Toast, ALERT_TYPE } from 'react-native-alert-notification';

const LocationPicker = ({ navigation }) => {
    const [location, setLocation] = useState({
        latitude: 28.6139,
        longitude: 77.209,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const [address, setAddress] = useState('');
    const [mapInteractionsEnabled, setMapInteractionsEnabled] = useState(true);

    const handleConfirmLocation = async () => {
        try {
            await AsyncStorage.setItem('defaultAddress', address);
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                textBody: 'This address has been set for you.',
            });

            // Add a short delay to allow the toast to display before navigation
            setTimeout(() => {
                navigation.navigate('Home');
            }, 2000); // Delay for 1 second
        } catch (error) {
            console.error('Error saving address:', error);
        }
    };

    const handleCancel = () => {
        navigation.navigate('Home');
    };

    return (
        <AlertNotificationRoot>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.container}>
                    <MapView
                        style={StyleSheet.absoluteFillObject}
                        region={location}
                        scrollEnabled={mapInteractionsEnabled}
                        zoomEnabled={mapInteractionsEnabled}
                    >
                        <Marker
                            coordinate={location}
                            draggable
                            onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                        />
                    </MapView>

                    <GooglePlacesAutocomplete
                        placeholder="Search for an address"
                        onPress={(data, details = null) => {
                            setAddress(data.description);
                            setLocation({
                                latitude: details.geometry.location.lat,
                                longitude: details.geometry.location.lng,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            });
                            setMapInteractionsEnabled(true); // Re-enable map interactions after selection
                        }}
                        query={{
                            key: process.env.GOOGLE_MAP_API_KEY,
                            language: 'en',
                        }}
                        fetchDetails={true}
                        styles={{
                            container: styles.searchContainer,
                            textInputContainer: { width: '100%' },
                            listView: { backgroundColor: 'white', zIndex: 10 },
                        }}
                        onTouchStart={() => setMapInteractionsEnabled(false)} // Disable map interactions when using autocomplete
                        onEndEditing={() => setMapInteractionsEnabled(true)} // Re-enable map interactions when done
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={handleCancel} style={[styles.transparentButton, styles.cancelButton]}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleConfirmLocation} style={styles.transparentButton}>
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </AlertNotificationRoot>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: 10,
        width: '90%',
        alignSelf: 'center',
        zIndex: 10, // High zIndex to ensure it's above the map
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    transparentButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
    },
});

export default LocationPicker;
