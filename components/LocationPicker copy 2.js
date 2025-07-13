import React, { useState } from 'react';
import 'react-native-get-random-values';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { AlertNotificationRoot, Dialog, ALERT_TYPE } from 'react-native-alert-notification';

const LocationPicker = ({ navigation }) => {
    const [location, setLocation] = useState({
        latitude: 28.6139,
        longitude: 77.209,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const [address, setAddress] = useState('');
    const [isAutocompleteFocused, setIsAutocompleteFocused] = useState(false); // Track focus state

    const handleConfirmLocation = async () => {
        try {
            await AsyncStorage.setItem('defaultAddress', address);
            Dialog.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                textBody: 'This address has been set for you.',
                button: 'Close',
                onHide: () => navigation.navigate('Home'),
            });
        } catch (error) {
            console.error('Error saving address:', error);
        }
    };

    const handleCancel = () => {
        navigation.navigate('Home');
    };

    const handleRegionChangeComplete = (region) => {
        setLocation(region);
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
                        scrollEnabled={!isAutocompleteFocused} // Disable scroll when autocomplete is active
                        zoomEnabled={!isAutocompleteFocused} // Disable zoom when autocomplete is active
                        pointerEvents={isAutocompleteFocused ? 'none' : 'auto'} // Ignore touches when autocomplete is focused
                        onRegionChangeComplete={handleRegionChangeComplete}
                    >
                        <Marker
                            coordinate={location}
                            draggable
                            onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                        />
                    </MapView>

                    <View style={styles.autocompleteContainer}>
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
                                setIsAutocompleteFocused(false); // Reset map interactions
                            }}
                            query={{
                                key: process.env.GOOGLE_MAP_API_KEY,
                                language: 'en',
                            }}
                            fetchDetails={true}
                            styles={{
                                container: { flex: 1 },
                                textInputContainer: {
                                    width: '100%',
                                },
                                listView: {
                                    backgroundColor: 'white',
                                    zIndex: 3, // Ensure dropdown is above other elements
                                },
                            }}
                            onTouchStart={() => setIsAutocompleteFocused(true)} // Disable map interactions on touch
                            onEndEditing={() => setIsAutocompleteFocused(false)} // Re-enable map interactions
                        />
                    </View>

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
    autocompleteContainer: {
        position: 'absolute',
        top: 10,
        width: '90%',
        alignSelf: 'center',
        zIndex: 3, // Higher zIndex to ensure it's above the map
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
