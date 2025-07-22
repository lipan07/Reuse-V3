import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, FlatList, Platform, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { useRoute, useNavigation } from '@react-navigation/native';
import AddressAutocomplete from './AddressAutocomplete';
import styles from '../assets/css/FilterScreen.styles.js';

const FilterScreen = ({ navigation }) => {
    const route = useRoute();
    const [formData, setFormData] = useState({
        address: route.params?.initialFilters?.location?.address || '',
        latitude: route.params?.initialFilters?.location?.coordinates?.[1] || 28.6139,
        longitude: route.params?.initialFilters?.location?.coordinates?.[0] || 77.209,
    });

    const [loading, setLoading] = useState(false);
    const [city, setCity] = useState(route.params?.initialFilters?.location?.city || '');
    const [state, setState] = useState(route.params?.initialFilters?.location?.state || '');
    const [country, setCountry] = useState(route.params?.initialFilters?.location?.country || '');

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

    const handleAddressSelect = useCallback((location) => {
        setFormData(prev => ({
            ...prev,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude
        }));
    }, []);

    // Existing filter handlers
    const handleCategorySelect = useCallback((categoryId) => {
        setSelectedCategory(categoryId);
    }, []);

    const handleDistanceSelect = useCallback((distance) => setSelectedDistance(distance), []);
    const handlePriceRangeSelect = useCallback((priceRange) => setSelectedPriceRange(priceRange), []);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setFormData({
            address: '',
            latitude: 28.6139,
            longitude: 77.209,
        });
        setSelectedCategory('');
        setSelectedDistance(5);
        setSelectedPriceRange('Recently Added');
        setMinBudget('');
        setMaxBudget('');
        setCity('');
        setState('');
        setCountry('');
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
            longitude: formData.longitude,
            latitude: formData.latitude,
            // location: {
            //     coordinates: [formData.longitude, formData.latitude],
            //     address: formData.address,
            //     city,
            //     state,
            //     country
            // }
        };

        const token = await AsyncStorage.getItem('authToken');
        const queryParams = new URLSearchParams({
            search: filters.search || '',
            category: filters.category || '',
            sortBy: filters.sortBy || '',
            distance: selectedDistance,
            longitude: formData.longitude,
            latitude: formData.latitude,
        }).toString();
        console.log('Query Params:', queryParams);
        console.log('Advanced Filter API URL:', `${process.env.BASE_URL}/posts?${queryParams}`);
        try {
            await AsyncStorage.setItem('defaultLocation', JSON.stringify({
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude
            }));
            const response = await fetch(`${process.env.BASE_URL}/posts?${queryParams}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                // console.log('Filtered Products:', jsonResponse.data);

                navigation.navigate('Home', {
                    filters,
                    products: jsonResponse.data
                });
            }
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedCategory, selectedPriceRange, minBudget, maxBudget, formData, city, state, country]);

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
                <Text style={styles.sectionTitle}>Enter an address or place to find products nearby</Text>
                <View style={styles.addressSearchContainer}>
                    <AddressAutocomplete
                        initialAddress={formData.address}
                        initialLatitude={formData.latitude}
                        initialLongitude={formData.longitude}
                        onAddressSelect={handleAddressSelect}
                        styles={{
                            input: styles.addressInput,
                            container: { marginBottom: 16 }
                        }}
                    />
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

export default FilterScreen;