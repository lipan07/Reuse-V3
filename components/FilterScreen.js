import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, FlatList, Platform, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { useRoute, useNavigation } from '@react-navigation/native';
import AddressAutocomplete from './AddressAutocomplete';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../assets/css/FilterScreen.styles.js';

const FilterScreen = ({ navigation }) => {
    const route = useRoute();
    const [loading, setLoading] = useState(false);

    // Initialize all filter states from route params or defaults
    const [filters, setFilters] = useState({
        search: route.params?.initialFilters?.search || '',
        category: route.params?.initialFilters?.category || null,
        priceRange: route.params?.initialFilters?.priceRange || [],
        sortBy: route.params?.initialFilters?.sortBy || 'Relevance',
        distance: route.params?.initialFilters?.distance || 5,
        listingType: route.params?.initialFilters?.listingType || null,
        latitude: route.params?.initialFilters?.latitude || null,
        longitude: route.params?.initialFilters?.longitude || null,
        address: route.params?.initialFilters?.address || '',
    });

    // Categories data
    const categories = [
        { id: null, name: 'All', icon: 'apps', color: '#2563eb', type: 'Ion' },
        { id: '1', name: 'Cars', icon: 'car', color: '#dc2626', type: 'MC' },
        { id: '2', name: 'Property', icon: 'home', color: '#16a34a', type: 'Ion' },
        { id: '7', name: 'Phones', icon: 'mobile-alt', color: '#f59e0b', type: 'Fontisto' },
        { id: '29', name: 'Tech', icon: 'laptop', color: '#0ea5e9', type: 'FA5' },
        { id: '24', name: 'Bikes', icon: 'motorbike', color: '#8b5cf6', type: 'MC' },
        { id: '45', name: 'Furniture', icon: 'sofa', color: '#d97706', type: 'MC' },
        { id: '51', name: 'Fashion', icon: 'tshirt-crew', color: '#ec4899', type: 'MC' },
        { id: '55', name: 'Books', icon: 'menu-book', color: '#14b8a6', type: 'M' },
    ];

    // Available options
    const distances = [5, 10, 15, 20, 25];
    const sortOptions = ['Relevance', 'Recently Added', 'Price: Low to High', 'Price: High to Low'];
    const listingTypes = ['all', 'sell', 'rent'];

    // Handle address selection from autocomplete
    const handleAddressSelect = useCallback((location) => {
        setFilters(prev => ({
            ...prev,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude
        }));
    }, []);

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setLoading(true);
        const clearedFilters = setFilters({
            search: '',
            category: null,
            priceRange: [],
            sortBy: 'Relevance', // Changed from 'Recently Added'
            distance: 5,
            listingType: null,
            latitude: null,
            longitude: null,
            address: '',
        });

        navigation.navigate('Home', {
            filters: clearedFilters,
        });
    }, [navigation]);

    // Submit filters and navigate back to Home
    // In FilterScreen.js, update the handleSubmit function:
    const handleSubmit = useCallback(async () => {
        setLoading(true);
        try {
            const cleanFilters = {
                search: filters.search,
                category: filters.category,
                sortBy: filters.sortBy === 'Relevance' ? null : filters.sortBy,
                priceRange: filters.priceRange.filter(val => val !== ''),
                distance: filters.distance,
                latitude: filters.latitude,
                longitude: filters.longitude,
                listingType: filters.listingType,
                address: filters.address
            };

            // Save location to AsyncStorage if address is provided
            if (filters.address) {
                await AsyncStorage.setItem('defaultLocation', JSON.stringify({
                    address: filters.address,
                    latitude: filters.latitude,
                    longitude: filters.longitude
                }));
            }
            console.log('Applying filters:', cleanFilters);
            // Navigate back to Home with the new filters
            navigation.navigate('Home', {
                filters: cleanFilters,
                // Don't pass products here - let Home fetch fresh data
            });

        } catch (error) {
            console.error('Error applying filters:', error);
            Alert.alert('Error', 'Failed to apply filters. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filters, navigation]);

    // Render distance selection options
    const renderDistanceSelection = () => (
        <>
            <Text style={styles.sectionTitle}>Search Radius (km)</Text>
            <View style={styles.filterListContainer}>
                {distances.map((distance) => (
                    <TouchableOpacity
                        key={distance}
                        style={[
                            styles.filterItem,
                            filters.distance === distance && styles.filterItemSelected,
                        ]}
                        onPress={() => handleInputChange('distance', distance)}
                    >
                        <Text style={[
                            styles.filterText,
                            filters.distance === distance && styles.filterTextSelected
                        ]}>
                            {distance}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );

    // Render price range inputs
    const renderPriceRangeInputs = () => (
        <>
            <Text style={styles.sectionTitle}>Price Range (₹)</Text>
            <View style={styles.budgetInputContainer}>
                <TextInput
                    style={styles.budgetInput}
                    value={filters.priceRange[0] || ''}
                    onChangeText={(text) => handleInputChange('priceRange', [text, filters.priceRange[1]])}
                    keyboardType="numeric"
                    placeholder="Min"
                    placeholderTextColor="#666"
                />
                <Text style={styles.toText}>to</Text>
                <TextInput
                    style={styles.budgetInput}
                    value={filters.priceRange[1] || ''}
                    onChangeText={(text) => handleInputChange('priceRange', [filters.priceRange[0], text])}
                    keyboardType="numeric"
                    placeholder="Max"
                    placeholderTextColor="#666"
                />
            </View>
        </>
    );

    // Render the filter screen header
    const renderHeader = () => (
        <>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2563eb', marginBottom: 16, textAlign: 'left' }}>
                Advanced Filter
            </Text>
            <TextInput
                style={styles.searchInput}
                value={filters.search}
                onChangeText={(text) => handleInputChange('search', text)}
                placeholder="Search products..."
                placeholderTextColor="#666"
            />

            {/* Location Search */}
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.addressSearchContainer}>
                <AddressAutocomplete
                    initialAddress={filters.address}
                    initialLatitude={filters.latitude}
                    initialLongitude={filters.longitude}
                    onAddressSelect={handleAddressSelect}
                    styles={{
                        input: styles.addressInput,
                        container: { marginBottom: 16 }
                    }}
                />
            </View>

            {/* Listing Type */}
            <Text style={styles.sectionTitle}>Listing Type</Text>
            <View style={styles.filterListContainer}>
                {listingTypes.map((type) => {
                    const isSelected = type === 'all'
                        ? filters.listingType === null
                        : filters.listingType === type;

                    return (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.filterItem,
                                isSelected && styles.filterItemSelected,
                            ]}
                            onPress={() => handleInputChange(
                                'listingType',
                                type === 'all' ? null : type
                            )}
                        >
                            <Text style={[
                                styles.filterText,
                                isSelected && styles.filterTextSelected
                            ]}>
                                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Distance Selection */}
            {renderDistanceSelection()}

            {/* Categories */}
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoryListContainer}>
                {categories.map((category) => {
                    let IconComponent;
                    switch (category.type) {
                        case 'M':
                            IconComponent = MIcon;
                            break;
                        case 'FA5':
                            IconComponent = FA5Icon;
                            break;
                        case 'Fontisto':
                            IconComponent = Fontisto;
                            break;
                        case 'Ion':
                            IconComponent = Ionicons;
                            break;
                        case 'MC':
                        default:
                            IconComponent = MCIcon;
                            break;
                    }

                    const isSelected = filters.category === category.id;
                    const isAllCategory = category.id === null;

                    return (
                        <TouchableOpacity
                            key={category.id || 'all'}
                            style={[
                                styles.categoryItem,
                                isSelected && styles.categoryItemSelected,
                                isAllCategory && styles.allCategoryItem // Add specific style for "All" category
                            ]}
                            onPress={() => handleInputChange('category', category.id)}
                        >
                            {!isAllCategory && (
                                <View style={styles.iconContainer}>
                                    <IconComponent
                                        name={category.icon}
                                        size={25}
                                        color={isSelected ? '#ffffff' : category.color}
                                    />
                                </View>
                            )}
                            <Text style={[
                                styles.categoryText,
                                isSelected && styles.categoryTextSelected,
                                isAllCategory && styles.allCategoryText // Add specific text style for "All"
                            ]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Sort By */}
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.filterListContainer}>
                {sortOptions.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.filterItem,
                            filters.sortBy === option && styles.filterItemSelected,
                        ]}
                        onPress={() => handleInputChange('sortBy', option)}
                    >
                        <Text style={[
                            styles.filterText,
                            filters.sortBy === option && styles.filterTextSelected
                        ]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Price Range */}
            {renderPriceRangeInputs()}
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

                {/* Fixed action buttons at bottom */}
                <View style={styles.fixedButtonContainer}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearFilters}
                        disabled={loading}
                    >
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