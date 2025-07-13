import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    TextInput,
    FlatList,
    ActivityIndicator,
    Dimensions,
    StatusBar
} from 'react-native';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { AlertNotificationRoot, Toast, ALERT_TYPE } from 'react-native-alert-notification';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const LocationPicker = ({ navigation }) => {
    const [location, setLocation] = useState({
        latitude: 28.6139,
        longitude: 77.209,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
        addressText: 'New Delhi, India', // default
    });
    const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 20 : 24);
    const [searchQuery, setSearchQuery] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const skipNextApiCallRef = useRef(false); // Add this ref

    const API_KEY = process.env.GOOGLE_MAP_API_KEY;
    const DEBOUNCE_TIME = 300;

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (skipNextApiCallRef.current) {
                skipNextApiCallRef.current = false;
                return;
            }

            if (searchQuery.length >= 3) {
                fetchPredictions(searchQuery);
            } else {
                setPredictions([]);
            }
        }, DEBOUNCE_TIME);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchPredictions = async (text) => {
        setIsLoading(true);
        try {
            const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${API_KEY}&components=country:in`;
            const response = await fetch(url);
            const json = await response.json();
            setPredictions(json.predictions || []);
        } catch (error) {
            console.error('Prediction error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlaceSelect = async (placeId) => {
        try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;
            const response = await fetch(detailsUrl);
            const json = await response.json();

            if (json.result?.geometry?.location) {
                const { lat, lng } = json.result.geometry.location;
                const addressText = json.result.formatted_address || '';
                skipNextApiCallRef.current = true;
                setSearchQuery(addressText);
                setLocation({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                    addressText,
                });
                setPredictions([]);
            }
        } catch (error) {
            console.error('Details error:', error);
        }
    };

    const handleConfirmLocation = async () => {
        try {
            await AsyncStorage.setItem('defaultAddress', JSON.stringify(location));
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Location Saved',
                textBody: 'This address has been set as your default.',
            });
            setTimeout(() => navigation.navigate('Home'), 2000);
        } catch (error) {
            console.error('Error saving address:', error);
        }
    };

    return (
        <AlertNotificationRoot>
            <StatusBar backgroundColor="#007BFF" barStyle="light-content" translucent={true} />
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <MapView
                    key={`${location.latitude}_${location.longitude}`}
                    style={styles.map}
                    region={location}
                >
                    <Marker
                        coordinate={location}
                        draggable
                        onDragEnd={(e) => setLocation({
                            ...location,
                            latitude: e.nativeEvent.coordinate.latitude,
                            longitude: e.nativeEvent.coordinate.longitude
                        })}
                    />
                </MapView>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search location"
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            if (predictions.length > 0) setPredictions([]);
                        }}
                        placeholderTextColor="#666"
                    />

                    {isLoading && <ActivityIndicator style={styles.loader} />}

                    {predictions.length > 0 && (
                        <FlatList
                            style={styles.predictionsList}
                            data={predictions}
                            keyExtractor={(item) => item.place_id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.predictionItem}
                                    onPress={() => handlePlaceSelect(item.place_id)}
                                >
                                    <Text style={styles.predictionText}>{item.description}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.button, styles.cancelButton]}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleConfirmLocation} style={[styles.button, styles.confirmButton]}>
                        <Text style={styles.buttonText}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </AlertNotificationRoot>
    );
};

// Keep the same styles as previous version
const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    searchContainer: {
        position: 'absolute',
        top: Platform.select({
            ios: normalizeVertical(60), // increased from 40
            android: (StatusBar.currentHeight || 24) + normalizeVertical(20), // dynamic based on status bar
        }),
        width: '92%',
        alignSelf: 'center',
        backgroundColor: 'white',
        borderRadius: normalize(6),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 10,
    },

    searchInput: {
        padding: normalize(14),
        fontSize: normalize(12),
        color: '#333',
    },
    predictionsList: {
        maxHeight: normalizeVertical(100),
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    predictionItem: {
        padding: normalize(8),
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    predictionText: {
        fontSize: normalize(14),
        color: '#333',
    },
    loader: {
        position: 'absolute',
        right: normalize(10),
        top: normalizeVertical(10),
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    button: {
        flex: 1,
        paddingVertical: normalizeVertical(14),
        paddingHorizontal: 0,
        borderRadius: 0,
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 52, 52, 0.8)',
    },
    confirmButton: {
        backgroundColor: 'rgba(0, 128, 0, 0.8)',
    },
    buttonText: {
        color: 'white',
        fontSize: normalize(12),
        textAlign: 'center',
    },
});

export default LocationPicker;
