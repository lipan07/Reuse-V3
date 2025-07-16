import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAP_API_KEY;
const DEBOUNCE_TIME = 300;

const AddressAutocomplete = ({
    initialAddress = '',
    initialLatitude = null,
    initialLongitude = null,
    onAddressSelect,
    styles: customStyles
}) => {
    const [searchQuery, setSearchQuery] = useState(initialAddress);
    const [predictions, setPredictions] = useState([]);
    const [focused, setFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const skipNextApiCallRef = useRef(false);

    useEffect(() => {
        const loadSavedAddress = async () => {
            const saved = await AsyncStorage.getItem('defaultLocation');
            if (saved) {
                const location = JSON.parse(saved);
                setSearchQuery(location.address || '');
                if (onAddressSelect) {
                    onAddressSelect(location);
                }
            }
        };
        loadSavedAddress();
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (skipNextApiCallRef.current) {
                skipNextApiCallRef.current = false;
                return;
            }
            if (focused && searchQuery.length >= 3) {
                fetchPredictions(searchQuery);
            } else {
                setPredictions([]);
            }
        }, DEBOUNCE_TIME);

        return () => clearTimeout(delay);
    }, [searchQuery, focused]);

    const fetchPredictions = async (text) => {
        setLoading(true);
        try {
            const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_PLACES_API_KEY}&components=country:in`;
            const res = await fetch(url);
            const json = await res.json();
            setPredictions(json.predictions || []);
        } catch (err) {
            console.error('Autocomplete error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceSelect = async (placeId) => {
        try {
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}`;
            const res = await fetch(url);
            const json = await res.json();

            if (json.result?.geometry?.location) {
                const address = json.result.formatted_address;
                const { lat, lng } = json.result.geometry.location;
                const locationData = {
                    address,
                    latitude: lat,
                    longitude: lng,
                };

                skipNextApiCallRef.current = true;
                setSearchQuery(address);
                setPredictions([]);

                await AsyncStorage.setItem('defaultLocation', JSON.stringify(locationData));
                if (onAddressSelect) onAddressSelect(locationData);
            }
        } catch (err) {
            console.error('Place details error:', err);
        }
    };

    const clearAddress = () => {
        setSearchQuery('');
        setPredictions([]);
        if (onAddressSelect) {
            onAddressSelect({ address: '', latitude: null, longitude: null });
        }
    };

    return (
        <View style={[localStyles.container, customStyles?.container]}>
            <View style={{ position: 'relative' }}>
                <TextInput
                    style={[localStyles.input, customStyles?.input]}
                    placeholder="Search Address"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 150)} // allow press
                    placeholderTextColor="#888"
                />
                {searchQuery !== '' && !loading && (
                    <TouchableOpacity
                        style={localStyles.clearIcon}
                        onPress={clearAddress}
                    >
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
                {loading && (
                    <ActivityIndicator
                        size="small"
                        color="#999"
                        style={localStyles.loader}
                    />
                )}
            </View>

            {focused && predictions.length > 0 && (
                <ScrollView
                    style={localStyles.predictionsContainer}
                    keyboardShouldPersistTaps="always"
                >
                    {predictions.map((item) => (
                        <TouchableOpacity
                            key={item.place_id}
                            style={[localStyles.predictionItem, customStyles?.predictionItem]}
                            onPress={() => handlePlaceSelect(item.place_id)}
                        >
                            <Text style={[localStyles.predictionText, customStyles?.predictionText]}>
                                {item.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        position: 'relative',
        marginBottom: 16,
        zIndex: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 12,
        fontSize: 16,
        paddingRight: 34,
    },
    clearIcon: {
        position: 'absolute',
        right: 10,
        top: 12,
        zIndex: 1,
    },
    loader: {
        position: 'absolute',
        right: 10,
        top: 12,
    },
    predictionsContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginTop: 4,
        maxHeight: 180,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    predictionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    predictionText: {
        fontSize: 14,
        color: '#333',
    },
});

export default AddressAutocomplete;
