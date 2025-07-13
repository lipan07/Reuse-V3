import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, FlatList, Platform, ActivityIndicator, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const FilterScreen = ({ navigation }) => {
    const route = useRoute();
    const [location, setLocation] = useState({
        latitude: 28.6139,
        longitude: 77.209,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState(route.params?.initialFilters?.location?.address || '');
    const [city, setCity] = useState(route.params?.initialFilters?.location?.city || '');
    const [state, setState] = useState(route.params?.initialFilters?.location?.state || '');
    const [country, setCountry] = useState(route.params?.initialFilters?.location?.country || '');

    // Custom Places Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
    const skipNextApiCallRef = useRef(false);
    const DEBOUNCE_TIME = 300;

    // Existing filter states
    const [searchTerm, setSearchTerm] = useState(route.params?.initialFilters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(route.params?.initialFilters?.category || '');
    const [selectedDistance, setSelectedDistance] = useState(route.params?.initialFilters?.distance || 5);
    const [selectedPriceRange, setSelectedPriceRange] = useState(route.params?.initialFilters?.sortBy || 'Recently Added');
    const [minBudget, setMinBudget] = useState(route.params?.initialFilters?.priceRange?.[0] || '');
    const [maxBudget, setMaxBudget] = useState(route.params?.initialFilters?.priceRange?.[1] || '');

    const categories = [
        { id: '', name: 'All', icon: 'list', color: '#8A2BE2' },
        { id: '1', name: 'Cars', icon: 'car', color: '#FF6347' },
        { id: '2', name: 'Properties', icon: 'home', color: '#4682B4' },
        { id: '7', name: 'Mobile', icon: 'phone-portrait', color: '#32CD32' },
        { id: '29', name: 'Electronics', icon: 'tv', color: '#FFD700' },
        { id: '24', name: 'Bikes', icon: 'bicycle', color: '#D2691E' },
        { id: '45', name: 'Furniture', icon: 'bed', color: '#8A2BE2' },
        { id: '51', name: 'Fashion', icon: 'shirt', color: '#FF69B4' },
        { id: '55', name: 'Books', icon: 'book', color: '#6495ED' },
    ];

    const distances = [5, 10, 15, 20, 25];
    const priceRanges = ['Recently Added', 'Price: Low to High', 'Price: High to Low'];

    // Places Autocomplete Logic
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
        setIsLoadingPredictions(true);
        try {
            const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${process.env.GOOGLE_MAP_API_KEY}&components=country:in`;
            const response = await fetch(url);
            const json = await response.json();
            setPredictions(json.predictions || []);
        } catch (error) {
            console.error('Prediction error:', error);
        } finally {
            setIsLoadingPredictions(false);
        }
    };

    const handlePlaceSelect = async (placeId) => {
        try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.GOOGLE_MAP_API_KEY}`;
            const response = await fetch(detailsUrl);
            const json = await response.json();

            if (json.result) {
                const { lat, lng } = json.result.geometry.location;
                const addressComponents = json.result.address_components;

                const getComponent = (type) =>
                    addressComponents.find(c => c.types.includes(type))?.long_name || '';

                skipNextApiCallRef.current = true;
                setSearchQuery(json.result.formatted_address);
                setLocation({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
                setAddress(json.result.formatted_address);
                setCity(getComponent('locality'));
                setState(getComponent('administrative_area_level_1'));
                setCountry(getComponent('country'));
                setPredictions([]);
            }
        } catch (error) {
            console.error('Details error:', error);
        }
    };

    // Existing filter handlers
    const handleCategorySelect = useCallback((categoryId) => {
        setSelectedCategory(categoryId);
    }, []);

    const handleDistanceSelect = useCallback((distance) => setSelectedDistance(distance), []);
    const handlePriceRangeSelect = useCallback((priceRange) => setSelectedPriceRange(priceRange), []);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setLocation({
            latitude: 28.6139,
            longitude: 77.209,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
        setSelectedCategory('');
        setSelectedDistance(5);
        setSelectedPriceRange('Recently Added');
        setMinBudget('');
        setMaxBudget('');
        setAddress('');
        setCity('');
        setState('');
        setCountry('');
        setSearchQuery('');
        navigation.navigate('Home', { filters: null });
    }, []);

    const handleSubmit = useCallback(async () => {
        setLoading(true);
        const selectedCategoryId = selectedCategory;

        const filters = {
            search: searchTerm,
            category: selectedCategoryId,
            sortBy: selectedPriceRange,
            priceRange: [minBudget, maxBudget],
            distance: selectedDistance,
            location: {
                coordinates: [location.longitude, location.latitude],
                address,
                city,
                state,
                country
            }
        };

        const token = await AsyncStorage.getItem('authToken');
        const queryParams = new URLSearchParams({
            search: filters.search || '',
            category: filters.category || '',
            sortBy: filters.sortBy || '',
            minPrice: filters.priceRange[0],
            maxPrice: filters.priceRange[1],
        }).toString();
        try {
            const response = await fetch(`${process.env.BASE_URL}/posts?${queryParams}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                navigation.navigate('Home', {
                    filters,
                    products: jsonResponse.data
                });
            }
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedCategory, selectedPriceRange, minBudget, maxBudget, location, address, city, state, country]);

    const renderHeader = () => (
        <>
            <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search products..."
                accessibilityLabel="Search input"
            />

            {/* Custom Address Search */}
            <View style={styles.locationContainer}>
                <View style={styles.addressSearchContainer}>
                    <TextInput
                        style={styles.addressInput}
                        placeholder="Search for an address"
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            if (predictions.length > 0) setPredictions([]);
                        }}
                        placeholderTextColor="#666"
                    />
                    {isLoadingPredictions && <ActivityIndicator style={styles.loader} />}

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
            </View>

            <Text style={styles.distanceTitle}>Search Radius</Text>
            <View style={styles.filterListContainer}>
                {distances.map((distance, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.filterItem,
                            selectedDistance === distance && styles.filterItemSelected,
                        ]}
                        onPress={() => handleDistanceSelect(distance)}
                    >
                        <Text style={[
                            styles.filterText,
                            selectedDistance === distance && styles.filterTextSelected
                        ]}>
                            {distance} km
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoryListContainer}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryItem,
                            selectedCategory === category.id && styles.categoryItemSelected,
                        ]}
                        onPress={() => handleCategorySelect(category.id)}
                    >
                        <Icon
                            name={category.icon}
                            style={[
                                styles.categoryIcon,
                                selectedCategory === category.id && { color: '#fff' },
                            ]}
                            size={25}
                            color={category.color}
                        />
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === category.id && styles.categoryTextSelected
                        ]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.filterListContainer}>
                {priceRanges.map((range, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.filterItem,
                            selectedPriceRange === range && styles.filterItemSelected,
                        ]}
                        onPress={() => handlePriceRangeSelect(range)}
                    >
                        <Text style={[
                            styles.filterText,
                            selectedPriceRange === range && styles.filterTextSelected
                        ]}>
                            {range}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.budgetInputContainer}>
                <TextInput
                    style={styles.budgetInput}
                    value={minBudget}
                    onChangeText={setMinBudget}
                    keyboardType="numeric"
                    placeholder="Min ₹"
                    placeholderTextColor="#666"
                />
                <Text style={styles.toText}>to</Text>
                <TextInput
                    style={styles.budgetInput}
                    value={maxBudget}
                    onChangeText={setMaxBudget}
                    keyboardType="numeric"
                    placeholder="Max ₹"
                    placeholderTextColor="#666"
                />
            </View>
        </>
    );

    return (
        <AlertNotificationRoot>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.scrollableContent}>
                    <FlatList
                        data={[]}
                        renderItem={null}
                        ListHeaderComponent={<View>{renderHeader()}</View>}
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
                <View style={styles.fixedButtonContainer}>
                    <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                        <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Apply Filters</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </AlertNotificationRoot>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    scrollContainer: {
        padding: normalize(10)
    },
    searchInput: {
        backgroundColor: '#fff',
        borderRadius: normalize(8),
        padding: normalize(10),
        marginBottom: normalizeVertical(10),
        fontSize: normalize(12),
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
    },
    locationContainer: {
        marginBottom: normalizeVertical(10)
    },
    addressSearchContainer: {
        position: 'relative',
        zIndex: 3,
    },
    addressInput: {
        backgroundColor: '#fff',
        borderRadius: normalize(8),
        padding: normalize(10),
        marginBottom: normalizeVertical(10),
        fontSize: normalize(12),
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
    },
    predictionsList: {
        position: 'absolute',
        top: normalizeVertical(38),
        width: '100%',
        maxHeight: normalizeVertical(100),
        backgroundColor: '#fff',
        borderRadius: normalize(8),
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 4,
        elevation: 5,
    },
    predictionItem: {
        padding: normalize(8),
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    predictionText: {
        fontSize: normalize(12),
        color: '#333',
    },
    loader: {
        position: 'absolute',
        right: normalize(10),
        top: normalizeVertical(10),
    },
    distanceTitle: {
        fontSize: normalize(14),
        fontWeight: '600',
        marginBottom: normalizeVertical(8),
        color: '#2c3e50',
    },
    filterListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: normalizeVertical(12),
        gap: normalize(6),
    },
    filterItem: {
        backgroundColor: '#fff',
        borderRadius: normalize(6),
        paddingVertical: normalizeVertical(10),
        paddingHorizontal: normalize(12),
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
    },
    filterItemSelected: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    filterText: {
        fontSize: normalize(12),
        color: '#333'
    },
    filterTextSelected: {
        color: '#fff'
    },
    sectionTitle: {
        fontSize: normalize(14),
        fontWeight: '600',
        marginVertical: normalizeVertical(10),
        color: '#2c3e50',
    },
    categoryListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: normalizeVertical(12),
        gap: normalize(6),
    },
    categoryItem: {
        backgroundColor: '#fff',
        borderRadius: normalize(6),
        padding: normalize(7),
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    categoryItemSelected: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    categoryIcon: {
        marginRight: normalize(5)
    },
    categoryText: {
        fontSize: normalize(12),
        color: '#333'
    },
    categoryTextSelected: {
        color: '#fff'
    },
    budgetInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalizeVertical(12),
        gap: normalize(6),
    },
    budgetInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: normalize(8),
        padding: normalize(10),
        fontSize: normalize(12),
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
    },
    toText: {
        fontSize: normalize(12),
        color: '#666'
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: normalizeVertical(16),
        left: normalize(10),
        right: normalize(10),
        flexDirection: 'row',
        gap: normalize(8),
        zIndex: 2,
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#6c757d',
        borderRadius: normalize(8),
        padding: normalize(10),
        alignItems: 'center',
        elevation: 3,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: normalize(12),
        fontWeight: '500',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#007bff',
        borderRadius: normalize(8),
        padding: normalize(10),
        alignItems: 'center',
        elevation: 3,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: normalize(12),
        fontWeight: '500',
    },
    scrollableContent: {
        flex: 1,
        marginBottom: normalizeVertical(70),
    },
});

export default FilterScreen;