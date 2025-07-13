import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

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
    const [inputLayout, setInputLayout] = useState(null);
    const skipNextApiCallRef = useRef(false);

    useEffect(() => {
        setSearchQuery(initialAddress);
    }, [initialAddress]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (skipNextApiCallRef.current) {
                skipNextApiCallRef.current = false;
                return;
            }
            if (searchQuery.length >= 3) fetchPredictions(searchQuery);
            else setPredictions([]);
        }, DEBOUNCE_TIME);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchPredictions = async (text) => {
        try {
            const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_PLACES_API_KEY}&components=country:in`;
            const response = await fetch(url);
            const json = await response.json();
            setPredictions(json.predictions || []);
        } catch (error) {
            console.error('Prediction error:', error);
        }
    };

    const handlePlaceSelect = async (placeId) => {
        try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(detailsUrl);
            const json = await response.json();

            if (json.result?.geometry?.location) {
                const { lat, lng } = json.result.geometry.location;
                const address = json.result.formatted_address;

                skipNextApiCallRef.current = true;
                setSearchQuery(address);
                setPredictions([]);

                if (onAddressSelect) {
                    onAddressSelect({
                        address,
                        latitude: lat,
                        longitude: lng
                    });
                }
            }
        } catch (error) {
            console.error('Details error:', error);
        }
    };

    return (
        <View style={[localStyles.container, customStyles?.container]}>
            <TextInput
                style={[localStyles.input, customStyles?.input]}
                placeholder="Search Address"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onLayout={(event) => setInputLayout(event.nativeEvent.layout)}
            />

            {predictions.length > 0 && inputLayout && (
                <View style={[
                    localStyles.predictionsContainer,
                    { top: inputLayout.height + 4 },
                    customStyles?.predictionsContainer
                ]}>
                    <ScrollView
                        style={{ maxHeight: 200 }}
                        keyboardShouldPersistTaps="always"
                        nestedScrollEnabled={true}
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
                </View>
            )}
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        position: 'relative',
        marginBottom: 16,
        zIndex: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 12,
        fontSize: 16,
    },
    predictionsContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginTop: 4,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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