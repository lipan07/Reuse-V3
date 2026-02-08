/**
 * Request device location on first app launch (like notification permission).
 * If user grants, save to AsyncStorage so LocationPicker and rest of app can use it.
 * If user denies, we remember and don't auto-ask again in LocationPicker.
 */
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';

const STORAGE_KEY_INITIAL_REQUESTED = '@nearx_initial_location_requested';

const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    const options = {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 60000,
    };
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      reject,
      options
    );
  });
};

const reverseGeocode = async (lat, lng) => {
  const API_KEY = process.env.GOOGLE_MAP_API_KEY;
  if (!API_KEY || API_KEY === 'your_fallback_key') return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
    const response = await fetch(url);
    const json = await response.json();
    if (json.status === 'OK' && json.results?.length > 0) {
      return json.results[0].formatted_address;
    }
  } catch (e) {
    console.warn('Initial location: reverse geocode failed', e);
  }
  return null;
};

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted) return true;
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'nearX uses your location to show nearby listings and set your default location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Android location permission error:', err);
      return false;
    }
  }
  try {
    await Geolocation.requestAuthorization();
    await new Promise((r) => setTimeout(r, 300));
    return true;
  } catch (err) {
    console.warn('iOS location permission error:', err);
    return false;
  }
};

/**
 * Run once on app start. If we have not asked before (and no saved location),
 * request location permission, get position, reverse geocode, and save to AsyncStorage.
 * Does not block UI; runs in background.
 */
export const requestInitialLocationIfNeeded = async () => {
  try {
    const existing = await AsyncStorage.getItem('defaultLocation');
    if (existing) {
      return; // Already have a saved location
    }

    const requested = await AsyncStorage.getItem(STORAGE_KEY_INITIAL_REQUESTED);
    if (requested === 'granted' || requested === 'denied') {
      return; // Already ran once this install
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      await AsyncStorage.setItem(STORAGE_KEY_INITIAL_REQUESTED, 'denied');
      return;
    }

    const coords = await getCurrentPosition();
    if (!coords?.latitude || !coords?.longitude) {
      return;
    }

    const address = await reverseGeocode(coords.latitude, coords.longitude);
    const displayText = address || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;

    const locationData = {
      address: address || displayText,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
    const defaultAddress = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
      addressText: address || displayText,
    };

    await AsyncStorage.setItem('defaultLocation', JSON.stringify(locationData));
    await AsyncStorage.setItem('defaultAddress', JSON.stringify(defaultAddress));
    await AsyncStorage.setItem(STORAGE_KEY_INITIAL_REQUESTED, 'granted');
  } catch (e) {
    console.warn('Initial location request failed:', e);
  }
};

export const getInitialLocationRequestStatus = () =>
  AsyncStorage.getItem(STORAGE_KEY_INITIAL_REQUESTED);
