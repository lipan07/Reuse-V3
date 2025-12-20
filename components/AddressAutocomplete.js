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

                // await AsyncStorage.setItem('defaultLocation', JSON.stringify(locationData));
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
                <View style={localStyles.inputWrapper}>
                    <Ionicons name="location" size={18} color="#2563eb" style={localStyles.locationIcon} />
                    <TextInput
                        style={[localStyles.input, customStyles?.input]}
                        placeholder="Search location..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setTimeout(() => setFocused(false), 200)}
                        placeholderTextColor="#9CA3AF"
                    />
                    {loading && (
                        <ActivityIndicator
                            size="small"
                            color="#2563eb"
                            style={localStyles.loader}
                        />
                    )}
                    {searchQuery !== '' && !loading && (
                        <TouchableOpacity
                            style={localStyles.clearIcon}
                            onPress={clearAddress}
                        >
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {focused && predictions.length > 0 && (
                <ScrollView
                    style={[localStyles.predictionsContainer, customStyles?.predictionsContainer]}
                    keyboardShouldPersistTaps="always"
                    nestedScrollEnabled={true}
                >
                    {predictions.map((item) => (
                        <TouchableOpacity
                            key={item.place_id}
                            style={[localStyles.predictionItem, customStyles?.predictionItem]}
                            onPress={() => handlePlaceSelect(item.place_id)}
                        >
                            <Ionicons name="location-outline" size={16} color="#6B7280" style={{ marginRight: 10 }} />
                            <Text style={[localStyles.predictionText, customStyles?.predictionText]} numberOfLines={2}>
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
        zIndex: 100,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingLeft: 12,
        paddingRight: 8,
        minHeight: 48,
    },
    locationIcon: {
        marginRight: 10,
        flexShrink: 0,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingRight: 8,
        fontSize: 14,
        color: '#1F2937',
        textAlign: 'left',
    },
    clearIcon: {
        padding: 4,
        marginLeft: 4,
        flexShrink: 0,
    },
    loader: {
        marginLeft: 4,
        marginRight: 4,
        flexShrink: 0,
    },
    predictionsContainer: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
    },
    predictionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    predictionText: {
        flex: 1,
        fontSize: 13,
        color: '#374151',
        lineHeight: 18,
    },
});

export default AddressAutocomplete;
