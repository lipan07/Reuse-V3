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
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleCancel}
                    >
                        <Icon name="arrow-left" size={normalize(24)} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Select Location</Text>
                    <View style={styles.headerPlaceholder} />
                </View>

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
                    {/* 500-meter radius circle */}
                    <Circle
                        center={{
                            latitude: location.latitude,
                            longitude: location.longitude
                        }}
                        radius={500}
                        fillColor="rgba(0, 122, 255, 0.15)"
                        strokeColor="rgba(0, 122, 255, 0.5)"
                        strokeWidth={2}
                    />

                    {/* Custom Marker */}
                    {location.latitude && location.longitude && (
                        <Marker
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude
                            }}
                            draggable
                            onDragEnd={handleMarkerDragEnd}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.markerPulse} />
                                <View style={styles.markerPin}>
                                    <Icon name="map-marker" size={normalize(20)} color="#fff" />
                                </View>
                            </View>
                        </Marker>
                    )}
                </MapView>

                {/* Search Container */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Icon name="magnify" size={normalize(20)} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for a location..."
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
                                <Icon name="close-circle" size={normalize(18)} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {isLoading && (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="small" color="#007AFF" />
                        </View>
                    )}
                </View>

                {/* Predictions List */}
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
                                    <Icon name="map-marker-outline" size={normalize(18)} color="#007AFF" />
                                    <View style={styles.predictionTextContainer}>
                                        <Text style={styles.predictionPrimary} numberOfLines={1}>
                                            {item.structured_formatting?.main_text || item.description}
                                        </Text>
                                        <Text style={styles.predictionSecondary} numberOfLines={1}>
                                            {item.structured_formatting?.secondary_text}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            keyboardShouldPersistTaps="always"
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}

                {/* Selected Address Display */}
                <View style={styles.addressContainer}>
                    <View style={styles.addressHeader}>
                        <Icon name="check-circle" size={normalize(16)} color="#4CAF50" />
                        <Text style={styles.addressTitle}>Selected Location</Text>
                    </View>
                    <Text style={styles.addressText} numberOfLines={2}>
                        {searchQuery || location.addressText}
                    </Text>
                </View>

                {/* Action Button */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirmLocation}
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
            </View>
        </AlertNotificationRoot>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: normalize(20),
        paddingTop: Platform.OS === 'ios' ? normalizeVertical(50) : (StatusBar.currentHeight || 24) + normalizeVertical(16),
        paddingBottom: normalizeVertical(16),
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    backButton: {
        padding: normalize(4),
    },
    headerTitle: {
        fontSize: normalize(18),
        fontWeight: '600',
        color: '#333',
    },
    headerPlaceholder: {
        width: normalize(32),
    },
    map: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? normalizeVertical(120) : (StatusBar.currentHeight || 24) + normalizeVertical(86),
        left: normalize(16),
        right: normalize(16),
        zIndex: 10,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: normalize(16),
        paddingHorizontal: normalize(16),
        paddingVertical: normalizeVertical(14),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 0.5,
        borderColor: '#e8e8e8',
    },
    searchIcon: {
        marginRight: normalize(12),
    },
    searchInput: {
        flex: 1,
        fontSize: normalize(16),
        color: '#333',
        padding: 0,
    },
    clearButton: {
        padding: normalize(4),
        marginLeft: normalize(8),
    },
    loaderContainer: {
        position: 'absolute',
        right: normalize(16),
        top: normalizeVertical(14),
    },
    predictionsContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? normalizeVertical(190) : (StatusBar.currentHeight || 24) + normalizeVertical(156),
        left: normalize(20),
        right: normalize(20),
        backgroundColor: '#fff',
        borderRadius: normalize(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        maxHeight: normalizeVertical(200),
        borderWidth: 0.5,
        borderColor: '#e8e8e8',
        zIndex: 15,
    },
    predictionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: normalizeVertical(16),
    },
    predictionTextContainer: {
        flex: 1,
        marginLeft: normalize(12),
    },
    predictionPrimary: {
        fontSize: normalize(14),
        fontWeight: '500',
        color: '#333',
        marginBottom: normalizeVertical(2),
    },
    predictionSecondary: {
        fontSize: normalize(12),
        color: '#666',
    },
    separator: {
        height: 1,
        backgroundColor: '#f5f5f5',
        marginLeft: normalize(46),
    },
    addressContainer: {
        position: 'absolute',
        bottom: normalizeVertical(90),
        left: normalize(20),
        right: normalize(20),
        backgroundColor: '#fff',
        borderRadius: normalize(20),
        padding: normalizeVertical(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 0.5,
        borderColor: '#e8e8e8',
        zIndex: 10,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalizeVertical(8),
    },
    addressTitle: {
        fontSize: normalize(12),
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: normalize(6),
        textTransform: 'uppercase',
    },
    addressText: {
        fontSize: normalize(14),
        color: '#333',
        lineHeight: normalizeVertical(20),
    },
    actionContainer: {
        position: 'absolute',
        bottom: normalizeVertical(30),
        left: normalize(20),
        right: normalize(20),
        zIndex: 10,
    },
    confirmButton: {
        backgroundColor: '#007AFF',
        paddingVertical: normalizeVertical(12),
        paddingHorizontal: normalize(24),
        borderRadius: normalize(25),
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        minWidth: normalize(120),
    },
    confirmButtonText: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#fff',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerPulse: {
        width: normalize(32),
        height: normalizeVertical(32),
        borderRadius: normalize(16),
        backgroundColor: 'rgba(0, 122, 255, 0.15)',
        position: 'absolute',
    },
    markerPin: {
        width: normalize(40),
        height: normalizeVertical(40),
        borderRadius: normalize(20),
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 2,
        borderColor: '#fff',
    },
});

const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#f5f5f5" }]
    },
    {
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "on" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#f5f5f5" }]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#bdbdbd" }]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{ "color": "#eeeeee" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#e5e5e5" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9e9e9e" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#ffffff" }]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#dadada" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9e9e9e" }]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [{ "color": "#e5e5e5" }]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [{ "color": "#eeeeee" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#c9c9c9" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9e9e9e" }]
    }
];

export default LocationPicker;