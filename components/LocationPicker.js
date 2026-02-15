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
    StatusBar,
    Alert,
    Linking,
    PermissionsAndroid,
    Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInitialLocationRequestStatus } from '../service/initialLocationService';
import MapView, { Marker, Circle } from 'react-native-maps';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import ModalScreen from '../components/SupportElement/ModalScreen';
import CustomStatusBar from './Screens/CustomStatusBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const LocationPicker = ({ navigation }) => {
    const insets = useSafeAreaInsets();
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
    const [loadingMessage, setLoadingMessage] = useState('');
    const [mapReady, setMapReady] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [permissionRequested, setPermissionRequested] = useState(false);
    const skipNextApiCallRef = useRef(false);
    const isUserTypingRef = useRef(false); // Track if user is typing vs programmatic update
    const mapRef = useRef(null);

    const API_KEY = process.env.GOOGLE_MAP_API_KEY || 'your_fallback_key';
    const DEBOUNCE_TIME = 300;

    // Initialize Geolocation on component mount
    useEffect(() => {
        console.log('LocationPicker component initialized');
    }, []);

    // Check if location permission is granted
    const checkLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                return granted;
            } catch (err) {
                console.warn('Permission check error:', err);
                return false;
            }
        } else {
            // For iOS, we'll check by trying to get location
            // iOS permission status is checked automatically by Geolocation
            return true;
        }
    };

    // Request location permission
    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                // First check if permission is already granted
                const hasPermission = await checkLocationPermission();
                if (hasPermission) {
                    return true;
                }

                // Request permission
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'This app needs access to your location to show your current location on the map.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );

                const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
                console.log('Android permission result:', granted, 'Granted:', isGranted);
                return isGranted;
            } catch (err) {
                console.warn('Permission request error:', err);
                return false;
            }
        } else {
            // iOS - request authorization explicitly
            try {
                await Geolocation.requestAuthorization();
                console.log('iOS location authorization requested');
                // Small delay to ensure permission dialog is processed
                await new Promise(resolve => setTimeout(resolve, 300));
                return true;
            } catch (err) {
                console.warn('iOS permission request error:', err);
                return false;
            }
        }
    };

    // Get current device location with better error handling and retry logic
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            console.log('Attempting to get current location...');

            // Configure Geolocation options for better real device support
            // Using less strict options for better compatibility
            const options = {
                enableHighAccuracy: false, // Changed to false for faster response on some devices
                timeout: 30000, // Increased timeout to 30 seconds
                maximumAge: 60000, // Accept location up to 1 minute old (faster response)
                distanceFilter: 10, // Small filter to reduce unnecessary updates
            };

            let attempts = 0;
            const maxAttempts = 2;

            const tryGetLocation = () => {
                attempts++;
                console.log(`Location attempt ${attempts}/${maxAttempts}...`);

                Geolocation.getCurrentPosition(
                    (position) => {
                        console.log('Location received:', {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                        });
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    (error) => {
                        console.error(`Geolocation error (attempt ${attempts}):`, {
                            code: error.code,
                            message: error.message,
                        });

                        // Retry once with high accuracy if first attempt fails
                        if (attempts < maxAttempts && error.code !== 1) {
                            console.log('Retrying with high accuracy...');
                            const retryOptions = {
                                enableHighAccuracy: true,
                                timeout: 30000,
                                maximumAge: 0,
                                distanceFilter: 0,
                            };
                            setTimeout(() => {
                                Geolocation.getCurrentPosition(
                                    (position) => {
                                        console.log('Location received on retry:', {
                                            latitude: position.coords.latitude,
                                            longitude: position.coords.longitude,
                                        });
                                        resolve({
                                            latitude: position.coords.latitude,
                                            longitude: position.coords.longitude,
                                        });
                                    },
                                    (retryError) => {
                                        console.error('Retry also failed:', retryError);
                                        reject(retryError);
                                    },
                                    retryOptions
                                );
                            }, 1000);
                        } else {
                            reject(error);
                        }
                    },
                    options
                );
            };

            tryGetLocation();
        });
    };

    // Unified function to handle device location: request permission, get location, get address, update all states and AsyncStorage
    const handleDeviceLocation = async (showAlertOnDenial = true) => {
        console.log('Starting device location request...');

        try {
            // Request permission for both Android and iOS
            setIsLoading(true);
            setLoadingMessage('Requesting location permission...');
            const hasPermission = await requestLocationPermission();

            if (!hasPermission) {
                // User denied permission
                setIsLoading(false);
                setLoadingMessage('');
                console.log('Location permission denied by user');
                if (showAlertOnDenial) {
                    Alert.alert(
                        'Location Permission',
                        'Location permission was denied. You can still search and select a location manually.',
                        [
                            {
                                text: 'OK',
                                style: 'default',
                            },
                        ],
                        { cancelable: true }
                    );
                }
                return false;
            }
            console.log('Location permission granted');

            // Small delay to ensure permission is fully processed (especially for iOS)
            setLoadingMessage('Permission granted. Getting your location...');
            await new Promise(resolve => setTimeout(resolve, Platform.OS === 'ios' ? 1000 : 500));

            // Get current location
            setLoadingMessage('Finding your current location...');
            console.log('Fetching current location...');

            const currentLocation = await getCurrentLocation();

            if (!currentLocation || !currentLocation.latitude || !currentLocation.longitude) {
                throw new Error('Invalid location data received');
            }

            console.log('Current device location received:', currentLocation);

            // Get address from Google Places API, fallback to Geocoding API
            setLoadingMessage('Getting address for your location...');
            console.log('Getting address from Google Places API...');
            let address = await reverseGeocode(
                currentLocation.latitude,
                currentLocation.longitude,
                false
            );

            // If address not found, use lat/long as fallback
            const displayText = address || `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`;
            console.log('Address/Coordinates:', displayText);

            // Create location object
            const newLocation = {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
                addressText: address || displayText,
            };

            // Update all states
            setLocation(newLocation);
            skipNextApiCallRef.current = true; // Skip autocomplete API call
            isUserTypingRef.current = false; // Not user typing
            setSearchQuery(displayText);
            setPredictions([]);

            // Save to AsyncStorage
            const locationData = {
                address: address || displayText,
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude
            };

            await AsyncStorage.setItem('defaultLocation', JSON.stringify(locationData));
            await AsyncStorage.setItem('defaultAddress', JSON.stringify(newLocation));

            console.log('Location saved to AsyncStorage:', locationData);
            console.log('All states updated with device location');

            // Animate map to current location
            setLoadingMessage('Updating map...');
            if (mapRef.current) {
                setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.animateToRegion(newLocation, 1000);
                        console.log('Map animated to device location');
                    }
                }, 500);
            }

            setIsLoading(false);
            setLoadingMessage('');
            return true;
        } catch (error) {
            console.error('Error getting device location:', error);
            setIsLoading(false);
            setLoadingMessage('');

            // Handle different error types
            if (error.code === 1) {
                // Permission denied (iOS)
                console.log('iOS permission denied');
                if (showAlertOnDenial) {
                    Alert.alert(
                        'Location Permission',
                        'Location permission was denied. You can still search and select a location manually.',
                        [
                            {
                                text: 'OK',
                                style: 'default',
                            },
                        ],
                        { cancelable: true }
                    );
                }
            } else if (error.code === 2) {
                // Position unavailable
                console.warn('Position unavailable - GPS might be disabled');
                if (showAlertOnDenial) {
                    Alert.alert(
                        'Location Unavailable',
                        'Unable to get your current location. This might be because:\n\n• GPS is disabled\n• Location services are turned off\n• You are indoors or in an area with poor GPS signal\n\nPlease try again or search for a location manually.',
                        [
                            {
                                text: 'Try Again',
                                onPress: () => {
                                    setPermissionRequested(false);
                                    handleDeviceLocation(true);
                                },
                            },
                            {
                                text: 'Search Manually',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: true }
                    );
                }
            } else if (error.code === 3) {
                // Timeout
                console.warn('Location request timeout');
                if (showAlertOnDenial) {
                    Alert.alert(
                        'Location Timeout',
                        'Getting your location is taking longer than expected. This might be because:\n\n• GPS signal is weak\n• You are indoors or in an area with poor signal\n• Location services need more time\n\nWould you like to try again?',
                        [
                            {
                                text: 'Try Again',
                                onPress: () => {
                                    setPermissionRequested(false);
                                    handleDeviceLocation(true);
                                },
                            },
                            {
                                text: 'Search Manually',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: true }
                    );
                }
            } else {
                // Other errors
                console.warn('Unknown location error:', error);
                if (showAlertOnDenial) {
                    Alert.alert(
                        'Location Error',
                        'Unable to get your current location. Please try again or search for a location manually.',
                        [
                            {
                                text: 'Try Again',
                                onPress: () => {
                                    setPermissionRequested(false);
                                    handleDeviceLocation(true);
                                },
                            },
                            {
                                text: 'Search Manually',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: true }
                    );
                }
            }
            return false;
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Skip API call if it's a programmatic update (not user typing)
            if (skipNextApiCallRef.current) {
                skipNextApiCallRef.current = false;
                return;
            }

            // Only fetch predictions if user is actively typing (not when setting from saved/device location)
            if (isUserTypingRef.current && searchQuery.length >= 3) {
                fetchPredictions(searchQuery);
            } else {
                // Clear predictions if not user typing or query is too short
                if (!isUserTypingRef.current || searchQuery.length < 3) {
                    setPredictions([]);
                }
            }
        }, DEBOUNCE_TIME);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchPredictions = async (text) => {
        setIsLoading(true);
        try {
            // const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${API_KEY}&components=country:in`;
            const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${API_KEY}`;
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
        // Hide keyboard when user selects an address
        Keyboard.dismiss();

        try {
            setIsLoading(true);
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;
            const response = await fetch(detailsUrl);
            const json = await response.json();

            if (json.result?.geometry?.location) {
                const { lat, lng } = json.result.geometry.location;
                const addressText = json.result.formatted_address || '';

                skipNextApiCallRef.current = true; // Skip autocomplete API call
                isUserTypingRef.current = false; // Not user typing
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

    // Get address from Google Places Nearby Search (preferred for better place names)
    const getAddressFromPlaces = async (lat, lng) => {
        try {
            // First try to find nearby place using Places Nearby Search
            const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50&key=${API_KEY}`;
            const nearbyResponse = await fetch(nearbyUrl);
            const nearbyJson = await nearbyResponse.json();

            if (nearbyJson.status === 'OK' && nearbyJson.results.length > 0) {
                const place = nearbyJson.results[0];
                // Get place details for formatted address
                if (place.place_id) {
                    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_address,name&key=${API_KEY}`;
                    const detailsResponse = await fetch(detailsUrl);
                    const detailsJson = await detailsResponse.json();

                    if (detailsJson.result?.formatted_address) {
                        return detailsJson.result.formatted_address;
                    }
                }
            }
            return null;
        } catch (error) {
            console.error('Places API error:', error);
            return null;
        }
    };

    const reverseGeocode = async (lat, lng, updateState = true) => {
        try {
            // First try to get address from Places API for better place names
            let address = await getAddressFromPlaces(lat, lng);

            // Fall back to Geocoding API if Places API doesn't return a result
            if (!address) {
                const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
                const response = await fetch(url);
                const json = await response.json();

                if (json.status === 'OK' && json.results.length > 0) {
                    address = json.results[0].formatted_address;
                }
            }

            // If address found, return it
            if (address) {
                if (updateState) {
                    skipNextApiCallRef.current = true; // Skip autocomplete API call
                    isUserTypingRef.current = false; // Not user typing
                    setSearchQuery(address);
                    setLocation(prev => ({
                        ...prev,
                        addressText: address
                    }));
                }
                return address;
            }

            // If no address found, return null (caller will use lat/long)
            return null;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
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
                    skipNextApiCallRef.current = true; // Skip autocomplete API call
                    isUserTypingRef.current = false; // Not user typing
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
        // Initialize location when component loads
        const initializeLocation = async () => {
            console.log('LocationPicker component mounted, initializing location...');

            // Wait for component to be fully mounted and map ready
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if user has saved location (from app first-start or from here previously)
            const saved = await AsyncStorage.getItem('defaultLocation');
            console.log('Saved location check:', saved ? 'Found' : 'Not found');

            if (saved) {
                // User has saved location - load it, no modal or permission ask
                console.log('Loading saved location...');
                await loadSavedLocation();
            } else {
                // No saved location: only auto-request if we didn't already ask at app start and user denied
                const initialStatus = await getInitialLocationRequestStatus();
                if (initialStatus === 'denied') {
                    console.log('Location was already denied at app start - showing map with Use current location button');
                    setPermissionRequested(true);
                    return;
                }
                // First time or not yet asked: automatically ask for device location
                console.log('No saved location found - requesting device location automatically...');
                setPermissionRequested(true);
                await handleDeviceLocation(true);
            }
        };

        initializeLocation();
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
            <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
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
                    region={location}
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
                                // Mark as user typing to enable autocomplete
                                isUserTypingRef.current = true;
                                setSearchQuery(text);
                                // Clear predictions if user clears the input
                                if (text.length === 0) {
                                    setPredictions([]);
                                }
                            }}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => {
                                    isUserTypingRef.current = false; // Reset typing flag
                                    setSearchQuery('');
                                    setPredictions([]);
                                }}
                                style={styles.clearButton}
                            >
                                <Icon name="close-circle" size={normalize(18)} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Use Current Location Button */}
                    <TouchableOpacity
                        style={styles.currentLocationButton}
                        onPress={async () => {
                            setPermissionRequested(false); // Reset to allow new request
                            await handleDeviceLocation(true);
                        }}
                        disabled={isLoading}
                    >
                        <Icon
                            name="crosshairs-gps"
                            size={normalize(18)}
                            color={isLoading ? "#999" : "#007AFF"}
                        />
                        <Text style={[styles.currentLocationText, isLoading && styles.currentLocationTextDisabled]}>
                            {isLoading ? 'Getting Location...' : 'Use Current Location'}
                        </Text>
                    </TouchableOpacity>

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

                {/* Selected Address Display - positioned above Confirm button */}
                <View style={[
                    styles.addressContainer,
                    { bottom: (insets?.bottom ?? 0) + normalizeVertical(24) + normalizeVertical(52) + normalizeVertical(12) }
                ]}>
                    <View style={styles.addressHeader}>
                        <Icon name="check-circle" size={normalize(18)} color="#4CAF50" />
                        <Text style={styles.addressTitle}>Selected Location</Text>
                    </View>
                    <Text style={styles.addressText} numberOfLines={2}>
                        {searchQuery || location.addressText}
                    </Text>
                </View>

                {/* Action Button - positioned above safe area so it's always visible */}
                <View style={[styles.actionContainer, { bottom: (insets?.bottom ?? 0) + normalizeVertical(24) }]}>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirmLocation}
                    >
                        <Text style={styles.confirmButtonText}>Confirm Location</Text>
                    </TouchableOpacity>
                </View>

                {/* Loading Overlay */}
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>
                                {loadingMessage || 'Getting your location...'}
                            </Text>
                            <Text style={styles.loadingSubtext}>
                                This may take a few seconds
                            </Text>
                        </View>
                    </View>
                )}

                <ModalScreen
                    visible={showErrorModal}
                    type="error"
                    title="Error"
                    message={errorMessage}
                    onClose={() => setShowErrorModal(false)}
                />
            </SafeAreaView>
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
    currentLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: normalize(12),
        paddingVertical: normalizeVertical(10),
        paddingHorizontal: normalize(16),
        marginTop: normalizeVertical(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e8e8e8',
    },
    currentLocationText: {
        fontSize: normalize(14),
        fontWeight: '500',
        color: '#007AFF',
        marginLeft: normalize(8),
    },
    currentLocationTextDisabled: {
        color: '#999',
    },
    loaderContainer: {
        position: 'absolute',
        right: normalize(16),
        top: normalizeVertical(14),
    },
    predictionsContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? normalizeVertical(240) : (StatusBar.currentHeight || 24) + normalizeVertical(206),
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
        fontSize: normalize(11),
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: normalize(6),
        textTransform: 'uppercase',
    },
    addressText: {
        fontSize: normalize(12),
        color: '#333',
        lineHeight: normalizeVertical(18),
    },
    actionContainer: {
        position: 'absolute',
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
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        backgroundColor: '#fff',
        borderRadius: normalize(20),
        padding: normalize(30),
        alignItems: 'center',
        minWidth: normalize(250),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    loadingText: {
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#333',
        marginTop: normalizeVertical(16),
        textAlign: 'center',
    },
    loadingSubtext: {
        fontSize: normalize(12),
        color: '#666',
        marginTop: normalizeVertical(8),
        textAlign: 'center',
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