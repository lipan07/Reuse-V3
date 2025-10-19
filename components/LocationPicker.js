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
    const mapRef = useRef(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const skipNextApiCallRef = useRef(false);

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
            setPredictions(json.predictions || []);
        } catch (error) {
            console.error('Prediction error:', error);
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

                // Animate map to new location immediately
                if (mapRef.current) {
                    mapRef.current.animateToRegion(newLocation, 1000);
                }
            }
        } catch (error) {
            console.error('Details error:', error);
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmLocation = async () => {
        if (!location?.addressText || location.addressText.trim() === '' || searchQuery.trim() === '') {
            setShowErrorModal(true);
            return;
        }

        try {
            await AsyncStorage.setItem('defaultLocation', JSON.stringify({
                address: location.addressText,
                latitude: location.latitude,
                longitude: location.longitude
            }));

            await AsyncStorage.setItem('defaultAddress', JSON.stringify(location));
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error saving address:', error);
            setShowErrorModal(true);
        }
    };

    useEffect(() => {
        const loadSavedLocation = async () => {
            try {
                const saved = await AsyncStorage.getItem('defaultLocation');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed?.latitude && parsed?.longitude) {
                        setLocation({
                            latitude: parsed.latitude,
                            longitude: parsed.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                            addressText: parsed.address || 'New Delhi, India',
                        });
                        setSearchQuery(parsed.address || '');
                    }
                }
            } catch (error) {
                console.error('Failed to load saved location:', error);
            }
        };

        loadSavedLocation();
    }, []);

    // Center map to location when map is ready
    useEffect(() => {
        if (mapReady && location && mapRef.current) {
            mapRef.current.animateToRegion(location, 1000);
        }
    }, [mapReady, location]);

    return (
        <AlertNotificationRoot>
            <CustomStatusBar />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {location && (
                    <MapView
                        ref={mapRef}
                        key={`${location.latitude}_${location.longitude}`}
                        style={styles.map}
                        region={location}
                        customMapStyle={mapStyle}
                        onMapReady={() => setMapReady(true)}
                        onError={(error) => {
                            console.log('Map error:', error);
                            setShowErrorModal(true);
                        }}
                    >
                        <Marker
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude
                            }}
                            draggable
                            onDragEnd={(e) => {
                                const newCoord = e.nativeEvent.coordinate;
                                if (newCoord.latitude && newCoord.longitude) {
                                    setLocation({
                                        ...location,
                                        latitude: newCoord.latitude,
                                        longitude: newCoord.longitude
                                    });
                                }
                            }}
                        >
                            <View style={styles.markerContainer}>
                                <View style={styles.markerPin} />
                                <View style={styles.markerBase} />
                            </View>
                        </Marker>

                        {/* Add this Circle component */}
                        <Circle
                            center={{
                                latitude: location.latitude,
                                longitude: location.longitude
                            }}
                            radius={200} // 1km in meters
                            fillColor="rgba(74, 144, 226, 0.2)" // Transparent blue
                            strokeColor="rgba(74, 145, 226, 0.3)" // Slightly more opaque for the border
                            strokeWidth={1}
                        />
                    </MapView>
                )}

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
                            />
                        </View>
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.cancelButton}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleConfirmLocation}
                        style={styles.confirmButton}
                    >
                        <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity>
                </View>

                <ModalScreen
                    visible={showErrorModal}
                    type="error"
                    title="Error"
                    message="An error occurred while processing your request. Please try again."
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
    buttonContainer: {
        position: 'absolute',
        bottom: normalizeVertical(30),
        flexDirection: 'row',
        justifyContent: 'flex-end', // Changed from 'space-between' to 'flex-end'
        width: '90%',
        alignSelf: 'center',
        gap: normalize(10), // Add some space between buttons
    },
    cancelButton: {
        backgroundColor: 'white',
        paddingVertical: normalizeVertical(10), // Reduced from 14
        paddingHorizontal: normalize(20), // Reduced from 24
        borderRadius: normalize(25),
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    confirmButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: normalizeVertical(10), // Reduced from 14
        paddingHorizontal: normalize(20), // Reduced from 24
        borderRadius: normalize(25),
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    cancelButtonText: {
        fontSize: normalize(13), // Reduced from 14
        fontWeight: '600',
        color: '#666',
    },
    confirmButtonText: {
        fontSize: normalize(13), // Reduced from 14
        fontWeight: '600',
        color: 'white',
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerPin: {
        width: normalize(8),
        height: normalize(8),
        borderRadius: normalize(4),
        backgroundColor: '#4A90E2',
    },
    markerBase: {
        width: normalize(24),
        height: normalize(24),
        borderRadius: normalize(12),
        backgroundColor: 'rgba(74, 144, 226, 0.2)',
        position: 'absolute',
        top: normalize(-8),
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