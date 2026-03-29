import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import AddressAutocomplete from './AddressAutocomplete';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { buildFilterScreenStyles } from '../assets/css/FilterScreen.styles.js';
import { useTheme } from '../context/ThemeContext';

// Subcategory data for categories with children
const CATEGORY_SUBCATEGORIES = {
    '2': [ // Properties – icons match SubCategoryPanel
        { id: '3', name: 'Houses & Apartments', icon: 'home', guard_name: 'houses_apartments' },
        { id: '4', name: 'Land & Plots', icon: 'map', guard_name: 'land_plots' },
        { id: '5', name: 'PG & Guest Houses', icon: 'home-group', guard_name: 'pg_guest_houses' },
        { id: '6', name: 'Shop & Offices', icon: 'store', guard_name: 'shop_offices' },
    ],
    '8': [ // Job
        { id: '9', name: 'Data Entry & Back Office', icon: 'briefcase', guard_name: 'data_entry_back_office' },
        { id: '10', name: 'Sales & Marketing', icon: 'chart-line', guard_name: 'sales_marketing' },
        { id: '11', name: 'BPO & Telecaller', icon: 'phone', guard_name: 'bpo_telecaller' },
        { id: '12', name: 'Driver', icon: 'car', guard_name: 'driver' },
        { id: '13', name: 'Office Assistant', icon: 'monitor', guard_name: 'office_assistant' },
        { id: '14', name: 'Delivery & Collection', icon: 'truck', guard_name: 'delivery_collection' },
        { id: '15', name: 'Teacher', icon: 'school', guard_name: 'teacher' },
        { id: '16', name: 'Cook', icon: 'chef-hat', guard_name: 'cook' },
        { id: '17', name: 'Receptionist', icon: 'deskphone', guard_name: 'receptionist_front_office' },
        { id: '18', name: 'Operator & Technician', icon: 'wrench', guard_name: 'operator_technician' },
        { id: '19', name: 'IT Engineer & Developer', icon: 'code-tags', guard_name: 'engineer_developer' },
        { id: '20', name: 'Hotel & Travel', icon: 'airplane', guard_name: 'hotel_travel_executive' },
        { id: '21', name: 'Accountant', icon: 'calculator', guard_name: 'accountant' },
        { id: '22', name: 'Designer', icon: 'palette', guard_name: 'designer' },
        { id: '23', name: 'Other Jobs', icon: 'briefcase-outline', guard_name: 'other_jobs' },
    ],
    '24': [ // Bikes
        { id: '25', name: 'Motorcycles', icon: 'motorbike', guard_name: 'motorcycles' },
        { id: '26', name: 'Scooters', icon: 'scooter', guard_name: 'scooters' },
        { id: '27', name: 'Bicycles', icon: 'bicycle', guard_name: 'bycycles' },
        { id: '28', name: 'Accessories', icon: 'tag', guard_name: 'accessories' },
    ],
    '29': [ // Electronics & Appliances
        { id: '30', name: 'Computers & Laptops', icon: 'laptop', guard_name: 'computers_laptops' },
        { id: '31', name: 'TVs, Video & Audio', icon: 'television', guard_name: 'tvs_video_audio' },
        { id: '32', name: 'ACs', icon: 'air-conditioner', guard_name: 'acs' },
        { id: '33', name: 'Fridges', icon: 'fridge', guard_name: 'fridges' },
        { id: '34', name: 'Washing Machines', icon: 'washing-machine', guard_name: 'washing_machines' },
        { id: '35', name: 'Cameras & Lenses', icon: 'camera', guard_name: 'cameras_lenses' },
        { id: '36', name: 'Printers & Monitors', icon: 'printer', guard_name: 'harddisks_printers_monitors' },
        { id: '37', name: 'Kitchen Appliances', icon: 'microwave', guard_name: 'kitchen_other_appliances' },
    ],
    '39': [ // Commercial Vehicle
        { id: '40', name: 'Commercial Vehicles', icon: 'truck', guard_name: 'commercial_heavy_vehicles' },
        { id: '41', name: 'Spare Parts', icon: 'cog', guard_name: 'vehicle_spare_parts' },
    ],
    '42': [ // Commercial Machinery
        { id: '43', name: 'Heavy Machinery', icon: 'factory', guard_name: 'commercial_heavy_machinery' },
        { id: '44', name: 'Spare Parts', icon: 'cog', guard_name: 'machinery_spare_parts' },
    ],
    '45': [ // Furniture
        { id: '46', name: 'Sofa & Dining', icon: 'sofa', guard_name: 'sofa_dining' },
        { id: '47', name: 'Beds & Wardrobes', icon: 'bed', guard_name: 'beds_wardrobes' },
        { id: '48', name: 'Home Decor & Garden', icon: 'flower', guard_name: 'home_decor_garden' },
        { id: '49', name: 'Kids Furniture', icon: 'baby-carriage', guard_name: 'kids_furniture' },
        { id: '50', name: 'Other Household', icon: 'home-variant', guard_name: 'other_household_items' },
    ],
    '51': [ // Fashion – icons match SubCategoryPanel
        { id: '52', name: 'Men', icon: 'tshirt-crew', guard_name: 'mens_fashion' },
        { id: '53', name: 'Women', icon: 'human-female', guard_name: 'womens_fashion' },
        { id: '54', name: 'Kids', icon: 'baby-face-outline', guard_name: 'kids_fashion' },
    ],
    '55': [ // Books, Sports & Hobbies
        { id: '56', name: 'Books', icon: 'book-open', guard_name: 'books' },
        { id: '57', name: 'Gym & Fitness', icon: 'dumbbell', guard_name: 'gym_fitness' },
        { id: '58', name: 'Musical Instruments', icon: 'music', guard_name: 'musical_instruments' },
        { id: '59', name: 'Sports Equipment', icon: 'soccer', guard_name: 'sports_instrument' },
        { id: '60', name: 'Other Hobbies', icon: 'gamepad-variant', guard_name: 'other_hobbies' },
    ],
    '61': [ // Pets
        { id: '62', name: 'Dogs', icon: 'dog', guard_name: 'dogs' },
        { id: '63', name: 'Fish & Aquarium', icon: 'fish', guard_name: 'fish_aquarium' },
        { id: '64', name: 'Pet Food & Accessories', icon: 'bowl', guard_name: 'pets_food_accessories' },
        { id: '65', name: 'Other Pets', icon: 'paw', guard_name: 'other_pets' },
    ],
    '66': [ // Services
        { id: '67', name: 'Education & Classes', icon: 'school', guard_name: 'education_classes' },
        { id: '68', name: 'Tours & Travels', icon: 'airplane', guard_name: 'tours_travels' },
        { id: '69', name: 'Electronics Repair', icon: 'tools', guard_name: 'electronics_repair_services' },
        { id: '70', name: 'Health & Beauty', icon: 'spa', guard_name: 'health_beauty' },
        { id: '71', name: 'Home Renovation', icon: 'hammer-wrench', guard_name: 'home_renovation_repair' },
        { id: '72', name: 'Cleaning & Pest Control', icon: 'broom', guard_name: 'cleaning_pest_control' },
        { id: '73', name: 'Legal Services', icon: 'gavel', guard_name: 'legal_documentation_services' },
        { id: '74', name: 'Packers & Movers', icon: 'truck-delivery', guard_name: 'packers_movers' },
        { id: '75', name: 'Other Services', icon: 'tools', guard_name: 'other_services' },
    ],
};

// Subcategory icon colors – aligned with SubCategoryPanel
const SUBCATEGORY_COLOR_MAPPING = {
    houses_apartments: '#4CAF50',
    land_plots: '#4CAF50',
    pg_guest_houses: '#2196F3',
    shop_offices: '#FF9800',
    data_entry_back_office: '#2196F3',
    sales_marketing: '#FF9800',
    bpo_telecaller: '#4CAF50',
    driver: '#F44336',
    office_assistant: '#2196F3',
    delivery_collection: '#FF9800',
    teacher: '#4CAF50',
    cook: '#FF9800',
    receptionist_front_office: '#2196F3',
    operator_technician: '#F44336',
    engineer_developer: '#F44336',
    hotel_travel_executive: '#FF9800',
    accountant: '#2196F3',
    designer: '#F44336',
    other_jobs: '#4CAF50',
    motorcycles: '#F44336',
    scooters: '#4CAF50',
    bycycles: '#2196F3',
    accessories: '#FF9800',
    computers_laptops: '#2196F3',
    tvs_video_audio: '#2196F3',
    acs: '#2196F3',
    fridges: '#4CAF50',
    washing_machines: '#2196F3',
    cameras_lenses: '#F44336',
    harddisks_printers_monitors: '#2196F3',
    kitchen_other_appliances: '#FF9800',
    commercial_heavy_vehicles: '#FF9800',
    vehicle_spare_parts: '#F44336',
    commercial_heavy_machinery: '#F44336',
    machinery_spare_parts: '#F44336',
    sofa_dining: '#FF9800',
    beds_wardrobes: '#4CAF50',
    home_decor_garden: '#4CAF50',
    kids_furniture: '#2196F3',
    other_household_items: '#F44336',
    mens_fashion: '#2196F3',
    womens_fashion: '#F44336',
    kids_fashion: '#2196F3',
    books: '#2196F3',
    gym_fitness: '#4CAF50',
    musical_instruments: '#FF9800',
    sports_instrument: '#4CAF50',
    other_hobbies: '#F44336',
    dogs: '#F44336',
    fish_aquarium: '#2196F3',
    pets_food_accessories: '#FF9800',
    other_pets: '#4CAF50',
    education_classes: '#2196F3',
    tours_travels: '#4CAF50',
    electronics_repair_services: '#F44336',
    health_beauty: '#F44336',
    home_renovation_repair: '#FF9800',
    cleaning_pest_control: '#4CAF50',
    legal_documentation_services: '#2196F3',
    packers_movers: '#FF9800',
    other_services: '#2196F3',
};


const FilterScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const route = useRoute();
    const { width: winW, height: winH } = useWindowDimensions();
    const { styles, n, nf, bottomBarMaxWidth, scrollBottomPadding } = useMemo(
        () => buildFilterScreenStyles(winW, winH),
        [winW, winH]
    );
    const insets = useSafeAreaInsets();
    const scrollPadBottom = scrollBottomPadding + insets.bottom;
    const [loading, setLoading] = useState(false);
    const [showSubcategories, setShowSubcategories] = useState(false);

    // Initialize all filter states from route params or defaults
    const [filters, setFilters] = useState({
        search: route.params?.initialFilters?.search || '',
        category: route.params?.initialFilters?.category || null,
        subcategory: route.params?.initialFilters?.subcategory || null,
        priceRange: route.params?.initialFilters?.priceRange || [],
        sortBy: route.params?.initialFilters?.sortBy || 'Relevance',
        distance: route.params?.initialFilters?.distance || 5,
        listingType: route.params?.initialFilters?.listingType || null,
        latitude: route.params?.initialFilters?.latitude || null,
        longitude: route.params?.initialFilters?.longitude || null,
        address: route.params?.initialFilters?.address || '',
    });

    // Get subcategories for selected category
    const currentSubcategories = filters.category ? CATEGORY_SUBCATEGORIES[filters.category] || [] : [];

    // Price input state
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Initialize price inputs from filters
    useEffect(() => {
        if (filters.priceRange && filters.priceRange.length >= 2) {
            setMinPrice(filters.priceRange[0] || '');
            setMaxPrice(filters.priceRange[1] || '');
        }
    }, []);

    // Update filters when price inputs change
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            priceRange: [minPrice, maxPrice]
        }));
    }, [minPrice, maxPrice]);

    // Categories data – icons aligned with ParentCategoryPanel (Add Product) iconMapping
    const categories = [
        { id: null, name: 'All', icon: 'apps', color: '#2563eb', type: 'Ion' },
        { id: '1', name: 'Cars', icon: 'car', color: '#dc2626', type: 'MC' },
        { id: '2', name: 'Properties', icon: 'home', color: '#16a34a', type: 'Ion' },
        { id: '7', name: 'Mobiles', icon: 'mobile-alt', color: '#f59e0b', type: 'Fontisto' },
        { id: '8', name: 'Job', icon: 'people-carry-box', color: '#84cc16', type: 'FA6' },
        { id: '24', name: 'Bikes', icon: 'motorbike', color: '#8b5cf6', type: 'MC' },
        { id: '29', name: 'Electronics', icon: 'electrical-services', color: '#0ea5e9', type: 'M' },
        { id: '39', name: 'Commercial Vehicle', icon: 'tow-truck', color: '#f97316', type: 'MC' },
        { id: '42', name: 'Machinery', icon: 'truck-ramp-box', color: '#8b5cf6', type: 'FA6' },
        { id: '45', name: 'Furniture', icon: 'sofa', color: '#d97706', type: 'MC' },
        { id: '51', name: 'Fashion', icon: 'tshirt-crew', color: '#ec4899', type: 'MC' },
        { id: '55', name: 'Books & Sports', icon: 'menu-book', color: '#14b8a6', type: 'M' },
        { id: '61', name: 'Pets', icon: 'cat', color: '#f97316', type: 'FA6' },
        { id: '66', name: 'Services', icon: 'tools', color: '#06b6d4', type: 'MC' },
        { id: 'donate', name: 'Donate', icon: 'gift', color: '#e11d48', type: 'MC' },
        { id: '76', name: 'Others', icon: 'tag', color: '#6b7280', type: 'MC' },
    ];

    // Available options
    const distances = [5, 10, 15, 20, 25];
    const listingTypes = ['all', 'sell', 'rent'];

    // Check if Job or Donate category is selected
    const isJobCategory = filters.category === '8';
    const isDonateCategory = filters.category === 'donate';

    // Dynamic sort options based on category
    const sortOptions = isJobCategory
        ? ['Relevance', 'Recently Added', 'Salary: Low to High', 'Salary: High to Low']
        : isDonateCategory
            ? ['Relevance', 'Recently Added']
            : ['Relevance', 'Recently Added', 'Price: Low to High', 'Price: High to Low'];

    // Get icon component by type (matches ParentCategoryPanel for consistency)
    const getIconComponent = (type) => {
        switch (type) {
            case 'M': return MIcon;
            case 'FA5': return FA5Icon;
            case 'FA6': return FA6Icon;
            case 'Fontisto': return Fontisto;
            case 'Ion': return Ionicons;
            case 'MC':
            default: return MCIcon;
        }
    };

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
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Handle category selection
    const handleCategorySelect = (categoryId) => {
        const hasSubcategories = categoryId && CATEGORY_SUBCATEGORIES[categoryId] && CATEGORY_SUBCATEGORIES[categoryId].length > 0;
        setFilters(prev => ({
            ...prev,
            category: categoryId,
            subcategory: null // Reset subcategory when category changes
        }));
        setShowSubcategories(hasSubcategories);
    };

    // Handle subcategory selection
    const handleSubcategorySelect = (subcategoryId) => {
        setFilters(prev => ({ ...prev, subcategory: subcategoryId }));
        setShowSubcategories(false); // Show filters after subcategory selection
    };

    // Skip subcategories and go directly to filters
    const handleSkipSubcategories = () => {
        setShowSubcategories(false);
    };

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setLoading(true);
        const clearedFilters = {
            search: '',
            category: null,
            priceRange: [],
            sortBy: 'Relevance',
            distance: 5,
            listingType: null,
            latitude: null,
            longitude: null,
            address: '',
        };
        setFilters(clearedFilters);
        setMinPrice('');
        setMaxPrice('');
        navigation.navigate('Home', { filters: clearedFilters });
    }, [navigation]);

    // Submit filters
    const handleSubmit = useCallback(async () => {
        setLoading(true);
        try {
            const cleanFilters = {
                search: filters.search,
                category: filters.subcategory || filters.category, // Use subcategory if selected, otherwise category
                sortBy: filters.sortBy === 'Relevance' ? null : filters.sortBy,
                priceRange: filters.priceRange.filter(val => val !== ''),
                distance: filters.distance,
                latitude: filters.latitude,
                longitude: filters.longitude,
                listingType: filters.listingType,
                address: filters.address
            };

            if (filters.address) {
                await AsyncStorage.setItem('defaultLocation', JSON.stringify({
                    address: filters.address,
                    latitude: filters.latitude,
                    longitude: filters.longitude
                }));
            }

            navigation.navigate('Home', { filters: cleanFilters });
        } catch (error) {
            console.error('Error applying filters:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, navigation]);

    // Render category item
    const renderCategoryItem = (category) => {
        const IconComponent = getIconComponent(category.type);
        const isSelected = filters.category === category.id;

        return (
            <TouchableOpacity
                key={category.id || 'all'}
                style={[
                    styles.categoryItem,
                    isSelected && styles.categoryItemSelected,
                    !isSelected && isDarkMode && styles.darkCategoryItem,
                ]}
                onPress={() => handleCategorySelect(category.id)}
                activeOpacity={0.7}
            >
                <View style={[
                    styles.categoryIconWrapper,
                    isSelected && { backgroundColor: '#FFFFFF' }
                ]}>
                    <IconComponent
                        name={category.icon}
                        size={nf(20)}
                        color={isSelected ? category.color : category.color}
                    />
                </View>
                <View style={styles.categoryTextContainer}>
                    <Text
                        style={[
                            styles.categoryText,
                            isSelected && styles.categoryTextSelected,
                            !isSelected && isDarkMode && styles.darkCategoryText,
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {category.name}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // edges: no `top` — AppNavigator already shows Header under status bar; `top` added a double gap.
    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]} edges={['left', 'right']}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={isDarkMode ? '#121212' : '#FFFFFF'}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.splitContainer}>
                    {/* Left Panel - Categories */}
                    <View style={[styles.leftPanel, isDarkMode && styles.darkLeftPanel]}>
                        <Text style={[styles.panelTitle, isDarkMode && styles.darkPanelTitle]}>Categories</Text>
                        <ScrollView
                            style={styles.categoryScroll}
                            contentContainerStyle={{ paddingBottom: scrollPadBottom }}
                            showsVerticalScrollIndicator={false}
                        >
                            {categories.map(renderCategoryItem)}
                        </ScrollView>
                    </View>

                    {/* Right Panel - Subcategories or Filters */}
                    <ScrollView
                        style={[styles.rightPanel, isDarkMode && styles.darkRightPanel]}
                        contentContainerStyle={{ paddingBottom: scrollPadBottom }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Show Subcategories if available and showSubcategories is true */}
                        {showSubcategories && currentSubcategories.length > 0 ? (
                            <View style={[styles.subcategoryPanel, isDarkMode && styles.darkSubcategoryPanel]}>
                                <View style={styles.subcategoryHeader}>
                                    <Text style={[styles.subcategoryTitle, isDarkMode && styles.darkSubcategoryTitle]}>Select Subcategory</Text>
                                    <Text style={[styles.subcategorySubtitle, isDarkMode && styles.darkSubcategorySubtitle]}>Choose to refine your search</Text>
                                </View>
                                <View style={styles.subcategoryList}>
                                    {currentSubcategories.map((sub) => {
                                        const isSelected = filters.subcategory === sub.id;
                                        const iconColor = SUBCATEGORY_COLOR_MAPPING[sub.guard_name] || '#6B7280';
                                        return (
                                            <TouchableOpacity
                                                key={sub.id}
                                                style={[
                                                    styles.subcategoryItem,
                                                    isSelected && styles.subcategoryItemSelected,
                                                    !isSelected && isDarkMode && styles.darkSubcategoryItem,
                                                ]}
                                                onPress={() => handleSubcategorySelect(sub.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={[
                                                    styles.subcategoryIconWrapper,
                                                    isSelected && styles.subcategoryIconWrapperSelected,
                                                    !isSelected && { backgroundColor: `${iconColor}15`, borderColor: `${iconColor}30` }
                                                ]}>
                                                    <MCIcon
                                                        name={sub.icon}
                                                        size={nf(18)}
                                                        color={isSelected ? '#16a34a' : iconColor}
                                                    />
                                                </View>
                                                <View style={styles.subcategoryTextContainer}>
                                                    <Text style={[
                                                        styles.subcategoryText,
                                                        isSelected && styles.subcategoryTextSelected,
                                                        !isSelected && (isDarkMode ? styles.darkSubcategoryText : { color: '#374151' }),
                                                    ]} numberOfLines={2}>
                                                        {sub.name}
                                                    </Text>
                                                </View>
                                                {isSelected && (
                                                    <View style={[styles.subcategoryCheck, { backgroundColor: iconColor }]}>
                                                        <Ionicons name="checkmark" size={nf(12)} color="#FFFFFF" />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                <View style={styles.skipButtonContainer}>
                                    <TouchableOpacity onPress={handleSkipSubcategories} style={[styles.skipButton, isDarkMode && styles.darkSkipButton]}>
                                        <Text style={[styles.skipButtonText, isDarkMode && styles.darkSkipButtonText]}>Skip & Show All</Text>
                                        <Ionicons name="arrow-forward" size={nf(16)} color={isDarkMode ? '#94a3b8' : '#6B7280'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <>
                                    {/* Search */}
                                    <View style={styles.filterSection}>
                                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Search</Text>
                                        <View style={[styles.searchInputWrapper, isDarkMode && styles.darkSearchInputWrapper]}>
                                            <Ionicons name="search" size={nf(18)} color="#9CA3AF" style={styles.searchIcon} />
                                            <TextInput
                                                style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
                                                value={filters.search}
                                                onChangeText={(text) => handleInputChange('search', text)}
                                                placeholder="Search products..."
                                                placeholderTextColor="#9CA3AF"
                                            />
                                            {filters.search.length > 0 && (
                                                <TouchableOpacity onPress={() => handleInputChange('search', '')}>
                                                    <Ionicons name="close-circle" size={nf(18)} color="#9CA3AF" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>

                                    {/* Location */}
                                    <View style={[styles.filterSection, { zIndex: 100 }]}>
                                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Location</Text>
                                        <AddressAutocomplete
                                            initialAddress={filters.address}
                                            initialLatitude={filters.latitude}
                                            initialLongitude={filters.longitude}
                                            onAddressSelect={handleAddressSelect}
                                            styles={{
                                                container: styles.locationContainer,
                                                inputWrapper: [styles.addressContainer, isDarkMode && styles.darkAddressContainer],
                                                input: [styles.addressInput, styles.locationInput, isDarkMode && styles.darkAddressInput],
                                                predictionsContainer: [styles.locationPredictions, isDarkMode && styles.darkLocationPredictions],
                                                predictionItem: [styles.locationPredictionItem, isDarkMode && styles.darkLocationPredictionItem],
                                                predictionText: [styles.locationPredictionText, isDarkMode && styles.darkLocationPredictionText],
                                            }}
                                        />
                                    </View>

                                    {/* Listing Type - Hide for Job and Donate category */}
                                    {!isJobCategory && !isDonateCategory && (
                                        <View style={styles.filterSection}>
                                            <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Listing Type</Text>
                                            <View style={styles.chipContainer}>
                                                {listingTypes.map((type) => {
                                                    const isSelected = type === 'all'
                                                        ? filters.listingType === null
                                                        : filters.listingType === type;
                                                    return (
                                                        <TouchableOpacity
                                                            key={type}
                                                            style={[
                                                                styles.chip,
                                                                isSelected && styles.chipSelected,
                                                                !isSelected && isDarkMode && styles.darkFilterChip,
                                                            ]}
                                                            onPress={() => handleInputChange('listingType', type === 'all' ? null : type)}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.chipText,
                                                                    isSelected && styles.chipTextSelected,
                                                                    !isSelected && isDarkMode && styles.darkFilterChipText,
                                                                ]}
                                                            >
                                                                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    )}

                                    {/* Distance */}
                                    <View style={styles.filterSection}>
                                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Search Radius</Text>
                                        <View style={styles.chipContainer}>
                                            {distances.map((distance) => (
                                                <TouchableOpacity
                                                    key={distance}
                                                    style={[
                                                        styles.chip,
                                                        filters.distance === distance && styles.chipSelected,
                                                        filters.distance !== distance && isDarkMode && styles.darkFilterChip,
                                                    ]}
                                                    onPress={() => handleInputChange('distance', distance)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.chipText,
                                                            filters.distance === distance && styles.chipTextSelected,
                                                            filters.distance !== distance && isDarkMode && styles.darkFilterChipText,
                                                        ]}
                                                    >
                                                        {distance} km
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Sort By */}
                                    <View style={styles.filterSection}>
                                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Sort By</Text>
                                        <View style={styles.chipContainer}>
                                            {sortOptions.map((option) => (
                                                <TouchableOpacity
                                                    key={option}
                                                    style={[
                                                        styles.chip,
                                                        filters.sortBy === option && styles.chipSelected,
                                                        filters.sortBy !== option && isDarkMode && styles.darkFilterChip,
                                                    ]}
                                                    onPress={() => handleInputChange('sortBy', option)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.chipText,
                                                            filters.sortBy === option && styles.chipTextSelected,
                                                            filters.sortBy !== option && isDarkMode && styles.darkFilterChipText,
                                                        ]}
                                                    >
                                                        {option}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Price Range Inputs - Hide for Donate category */}
                                    {!isDonateCategory && (
                                        <View style={styles.filterSection}>
                                            <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>{isJobCategory ? 'Salary Range (₹)' : 'Price Range (₹)'}</Text>
                                            <View style={styles.priceInputContainer}>
                                                <View
                                                    style={[
                                                        styles.priceInputWrapper,
                                                        isDarkMode && styles.darkPriceInputWrapper,
                                                    ]}
                                                >
                                                    {/* <Text style={styles.priceInputPrefix}>₹</Text> */}
                                                    <TextInput
                                                        style={[styles.priceInput, isDarkMode && styles.darkPriceInput]}
                                                        value={minPrice}
                                                        onChangeText={(text) => {
                                                            // Allow only numbers
                                                            const numericValue = text.replace(/[^0-9]/g, '');
                                                            setMinPrice(numericValue);
                                                        }}
                                                        placeholder="Minimum"
                                                        placeholderTextColor={isDarkMode ? '#64748b' : '#9CA3AF'}
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                                <View
                                                    style={[
                                                        styles.priceInputWrapper,
                                                        isDarkMode && styles.darkPriceInputWrapper,
                                                    ]}
                                                >
                                                    {/* <Text style={styles.priceInputPrefix}>₹</Text> */}
                                                    <TextInput
                                                        style={[styles.priceInput, isDarkMode && styles.darkPriceInput]}
                                                        value={maxPrice}
                                                        onChangeText={(text) => {
                                                            // Allow only numbers
                                                            const numericValue = text.replace(/[^0-9]/g, '');
                                                            setMaxPrice(numericValue);
                                                        }}
                                                        placeholder="Maximum"
                                                        placeholderTextColor={isDarkMode ? '#64748b' : '#9CA3AF'}
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>

            {/* Floats above scroll — no full-width bar; touches pass through except on buttons */}
            <View
                style={[styles.bottomActionsOuter, { paddingBottom: insets.bottom + n(8) }]}
                pointerEvents="box-none"
            >
                <View style={[styles.bottomActionsRow, { maxWidth: bottomBarMaxWidth }]} pointerEvents="box-none">
                    <TouchableOpacity
                        style={[
                            styles.clearButton,
                            isDarkMode && styles.darkClearButton,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={handleClearFilters}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        <View style={styles.clearButtonContent}>
                            <Ionicons
                                name="refresh-outline"
                                size={nf(20)}
                                color={isDarkMode ? '#94a3b8' : '#6B7280'}
                            />
                            <Text style={[styles.clearButtonText, isDarkMode && styles.darkClearButtonText]}>
                                Clear All
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.applyButton, loading && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <View style={styles.applyButtonContent}>
                                    <Ionicons name="checkmark-circle" size={nf(20)} color="#FFFFFF" />
                                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default FilterScreen;
