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
import MapView, { Marker, Circle } from 'react-native-maps';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import ModalScreen from '../components/SupportElement/ModalScreen';
import CustomStatusBar from './Screens/CustomStatusBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const LocationPicker = ({ navigation }) => {
    const defaultLocation = {
        latitude: 28.6139,
        longitude: 77.209,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
        addressText: 'New Delhi, India',
    };

    const [location, setLocation] = useState(defaultLocation);
    const [searchQuery, setSearchQuery] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const skipNextApiCallRef = useRef(false);
    const mapRef = useRef(null);

    const API_KEY = process.env.GOOGLE_MAP_API_KEY || 'your_fallback_key';
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
            const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${API_KEY}&components=country:in`;
            const response = await fetch(url);
            const json = await response.json();

            if (json.status === 'OK') {
                setPredictions(json.predictions || []);
            } else {
                console.warn('Places API returned status:', json.status);
                setPredictions([]);
            }
        } catch (error) {
            console.error('Prediction error:', error);
            setErrorMessage('Failed to fetch locations. Please check your internet connection.');
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlaceSelect = async (placeId) => {
        try {
            setIsLoading(true);
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;
            const response = await fetch(detailsUrl);
            const json = await response.json();

            if (json.result?.geometry?.location) {
                const { lat, lng } = json.result.geometry.location;
                const addressText = json.result.formatted_address || '';

                skipNextApiCallRef.current = true;
                setSearchQuery(addressText);

                const newLocation = {
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                    addressText,
                };

                setLocation(newLocation);
                setPredictions([]);

                // Animate map to new location
                if (mapRef.current) {
                    setTimeout(() => {
                        mapRef.current.animateToRegion(newLocation, 1000);
                    }, 100);
                }
            } else {
                throw new Error('Invalid location data received');
            }
        } catch (error) {
            console.error('Details error:', error);
            setErrorMessage('Failed to get location details. Please try again.');
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Removed: handleMapRegionChange was causing constant re-renders

    const handleMarkerDragEnd = (e) => {
        const newCoord = e.nativeEvent.coordinate;
        if (newCoord.latitude && newCoord.longitude) {
            const updatedLocation = {
                ...location,
                latitude: newCoord.latitude,
                longitude: newCoord.longitude
            };
            setLocation(updatedLocation);

            // Reverse geocode to get address when marker is dragged
            reverseGeocode(newCoord.latitude, newCoord.longitude);
        }
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
            const response = await fetch(url);
            const json = await response.json();

            if (json.status === 'OK' && json.results.length > 0) {
                const address = json.results[0].formatted_address;
                setSearchQuery(address);
                setLocation(prev => ({
                    ...prev,
                    addressText: address
                }));
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }
    };

    const handleConfirmLocation = async () => {
        if (!location?.addressText || location.addressText.trim() === '' || searchQuery.trim() === '') {
            setErrorMessage('Please select a valid location before confirming.');
            setShowErrorModal(true);
            return;
        }

        try {
            const locationData = {
                address: location.addressText,
                latitude: location.latitude,
                longitude: location.longitude
            };

            await AsyncStorage.setItem('defaultLocation', JSON.stringify(locationData));
            await AsyncStorage.setItem('defaultAddress', JSON.stringify(location));

            console.log('Location saved successfully:', locationData);
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error saving address:', error);
            setErrorMessage('Failed to save location. Please try again.');
            setShowErrorModal(true);
        }
    };

    const loadSavedLocation = async () => {
        try {
            const saved = await AsyncStorage.getItem('defaultLocation');
            console.log('Saved location from storage:', saved);

            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('Parsed saved location:', parsed);

                if (parsed?.latitude && parsed?.longitude) {
                    const savedLocation = {
                        latitude: parseFloat(parsed.latitude),
                        longitude: parseFloat(parsed.longitude),
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                        addressText: parsed.address || 'Selected Location',
                    };

                    setLocation(savedLocation);
                    setSearchQuery(parsed.address || 'Selected Location');

                    console.log('Setting location to saved location:', savedLocation);

                    // Animate to saved location when map is ready
                    if (mapRef.current) {
                        setTimeout(() => {
                            mapRef.current.animateToRegion(savedLocation, 1000);
                        }, 500);
                    }
                }
            } else {
                console.log('No saved location found, using default');
            }
        } catch (error) {
            console.error('Failed to load saved location:', error);
        }
    };

    useEffect(() => {
        loadSavedLocation();
    }, []);

    // Center map to location when map is ready
    useEffect(() => {
        if (mapReady && location && mapRef.current) {
            console.log('Map ready, animating to location:', location);
            setTimeout(() => {
                mapRef.current.animateToRegion(location, 1000);
            }, 300);
        }
    }, [mapReady]);

    const handleCancel = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Home');
        }
    };

    return (
        <AlertNotificationRoot>
            <CustomStatusBar />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={location}
                    customMapStyle={mapStyle}
                    onMapReady={() => {
                        console.log('Map is ready');
                        setMapReady(true);
                    }}
                    onError={(error) => {
                        console.log('Map error:', error);
                        setErrorMessage('Map loading failed. Please check your connection.');
                        setShowErrorModal(true);
                    }}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                >
                    {/* Marker - render first */}
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude
                        }}
                        draggable
                        onDragEnd={handleMarkerDragEnd}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.markerPin} />
                            <View style={styles.markerBase} />
                        </View>
                    </Marker>

                    {/* 500-meter radius circle - render after marker */}
                    <Circle
                        center={{
                            latitude: location.latitude,
                            longitude: location.longitude
                        }}
                        radius={500}
                        fillColor="rgba(74, 144, 226, 0.15)"
                        strokeColor="rgba(74, 144, 226, 0.7)"
                        strokeWidth={2}
                    />
                </MapView>

                {/* Search Container */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Icon name="magnify" size={normalize(20)} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search location..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                if (predictions.length > 0) setPredictions([]);
                            }}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => {
                                    setSearchQuery('');
                                    setPredictions([]);
                                }}
                                style={styles.clearButton}
                            >
                                <Icon name="close" size={normalize(16)} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {isLoading && (
                        <ActivityIndicator
                            size="small"
                            color="#4A90E2"
                            style={styles.loader}
                        />
                    )}

                    {predictions.length > 0 && (
                        <View style={styles.predictionsContainer}>
                            <FlatList
                                data={predictions}
                                keyExtractor={(item) => item.place_id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.predictionItem}
                                        onPress={() => handlePlaceSelect(item.place_id)}
                                    >
                                        <Icon name="map-marker" size={normalize(18)} color="#4A90E2" />
                                        <Text style={styles.predictionText} numberOfLines={2}>
                                            {item.description}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                ItemSeparatorComponent={() => <View style={styles.separator} />}
                                keyboardShouldPersistTaps="always"
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    )}
                </View>

                {/* Location Info Card */}
                {/* <View style={styles.locationInfoContainer}>
                    <View style={styles.locationInfo}>
                        <Icon name="information-outline" size={normalize(16)} color="#4A90E2" />
                        <Text style={styles.locationInfoText}>
                            Drag the marker or search to set your exact location. The circle shows 500-meter radius.
                        </Text>
                    </View>
                </View> */}

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={handleCancel}
                        style={styles.cancelButton}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleConfirmLocation}
                        style={styles.confirmButton}
                    >
                        <Text style={styles.confirmButtonText}>Confirm Location</Text>
                    </TouchableOpacity>
                </View>

                <ModalScreen
                    visible={showErrorModal}
                    type="error"
                    title="Error"
                    message={errorMessage}
                    onClose={() => setShowErrorModal(false)}
                />
            </KeyboardAvoidingView>
        </AlertNotificationRoot>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    searchContainer: {
        position: 'absolute',
        top: Platform.select({
            ios: normalizeVertical(50),
            android: (StatusBar.currentHeight || 24) + normalizeVertical(16),
        }),
        width: '90%',
        alignSelf: 'center',
        backgroundColor: 'white',
        borderRadius: normalize(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 10,
        padding: normalize(8),
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: normalize(8),
        paddingHorizontal: normalize(12),
    },
    searchIcon: {
        marginRight: normalize(8),
    },
    searchInput: {
        flex: 1,
        paddingVertical: normalize(12),
        fontSize: normalize(14),
        color: '#333',
    },
    clearButton: {
        padding: normalize(4),
    },
    predictionsContainer: {
        maxHeight: normalizeVertical(200),
        marginTop: normalizeVertical(8),
        borderRadius: normalize(8),
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    predictionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: normalize(12),
    },
    predictionText: {
        flex: 1,
        fontSize: normalize(14),
        color: '#333',
        marginLeft: normalize(8),
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: normalize(40),
    },
    loader: {
        position: 'absolute',
        right: normalize(16),
        top: normalize(12),
    },
    locationInfoContainer: {
        position: 'absolute',
        top: Platform.select({
            ios: normalizeVertical(130),
            android: (StatusBar.currentHeight || 24) + normalizeVertical(96),
        }),
        width: '90%',
        alignSelf: 'center',
        zIndex: 5,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: normalize(12),
        borderRadius: normalize(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    locationInfoText: {
        flex: 1,
        fontSize: normalize(12),
        color: '#666',
        marginLeft: normalize(8),
        lineHeight: normalize(16),
    },
    buttonContainer: {
        position: 'absolute',
        bottom: normalizeVertical(30),
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        alignSelf: 'center',
    },
    cancelButton: {
        backgroundColor: 'white',
        paddingVertical: normalizeVertical(12),
        paddingHorizontal: normalize(24),
        borderRadius: normalize(25),
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minWidth: normalize(100),
    },
    confirmButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: normalizeVertical(12),
        paddingHorizontal: normalize(24),
        borderRadius: normalize(25),
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
        minWidth: normalize(120),
    },
    cancelButtonText: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    confirmButtonText: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerPin: {
        width: normalize(20),
        height: normalize(20),
        borderRadius: normalize(10),
        backgroundColor: '#4A90E2',
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    markerBase: {
        width: normalize(12),
        height: normalize(12),
        borderRadius: normalize(6),
        backgroundColor: 'rgba(74, 144, 226, 0.4)',
        position: 'absolute',
        bottom: normalize(-6),
    },
});

const mapStyle = [
    {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e5e5e5"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dadada"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e5e5e5"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#c9c9c9"
            }
        ]
    }
];

export default LocationPicker;