import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, DeviceEventEmitter, Animated, RefreshControl, TouchableWithoutFeedback, Keyboard, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import CategoryMenu from './CategoryMenu';
import BottomNavBar from './BottomNavBar';
import { useFocusEffect, useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../assets/css/Home.styles';

import {
  BannerAd,
  BannerAdSize,
  TestIds,
  AppOpenAd,
  AdEventType,
} from 'react-native-google-mobile-ads';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const adUnitIdAppOpen = __DEV__ ? TestIds.APP_OPEN : process.env.G_APP_OPEN_AD_UNIT_ID;
const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : process.env.G_BANNER_AD_UNIT_ID;

const appOpenAd = AppOpenAd.createForAdRequest(adUnitIdAppOpen, {
  keywords: ['education', 'shipping', 'travel'],
});

const PAGE_SIZE = 15;

const Home = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [filters, setFilters] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(route.params?.filters?.category || null);
  const [search, setSearch] = useState(route.params?.filters?.search || '');
  const [showMenu, setShowMenu] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const searchRef = useRef(search);
  const selectedCategoryRef = useRef(selectedCategory);

  // In Home.js, add these new state variables near the top
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [hasShownInitialPopup, setHasShownInitialPopup] = useState(false);
  const locationCheckTimeout = useRef(null);

  const isFocused = useIsFocused();

  const lastScrollY = useRef(0);

  const [activeFilters, setActiveFilters] = useState({
    search: route.params?.filters?.search || '',
    category: route.params?.filters?.category || null,
    priceRange: route.params?.filters?.priceRange || [],
    sortBy: route.params?.filters?.sortBy || null,
    distance: route.params?.filters?.distance || 5,
    listingType: route.params?.filters?.listingType || null,
    latitude: route.params?.filters?.latitude || null,
    longitude: route.params?.filters?.longitude || null,
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

  const SORT_MAPPING = {
    'Relevance': null,
    'Recently Added': 'createdAt_desc',
    'Price: Low to High': 'price_asc',
    'Price: High to Low': 'price_desc'
  };

  useEffect(() => {
    if (route.params?.filters) {
      setActiveFilters(route.params.filters);
      setFilters(route.params.filters);
      setSearch(route.params.filters.search || '');
      setSelectedCategory(route.params.filters.category || null);
    }
    if (route.params?.products) {
      setProducts(route.params.products);
      setHasMore(false);
    }
  }, [route.params]);

  useFocusEffect(
    useCallback(() => {
      console.log('Home Screen Focused');
      const fetchInitialData = async () => {
        if (!route.params?.products) {
          await fetchProducts(true, cleanParams(activeFilters));
        }
      };

      const timer = setTimeout(fetchInitialData, 100); // Small delay to avoid race conditions
      return () => clearTimeout(timer);
    }, [activeFilters, route.params?.products])
  );

  const fetchProducts = useCallback(async (reset = false, param = null) => {
    // Prevent multiple simultaneous requests
    if (isLoading) return;
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      let apiURL = `${process.env.BASE_URL}/posts`;

      // Get location only if needed
      const location = param?.latitude ? null : await getStoredLocation();

      // Build base parameters
      const baseParams = {
        page: reset ? 1 : currentPage,
        limit: PAGE_SIZE,
        ...cleanParams(param || activeFilters) // Use activeFilters as fallback
      };

      // Convert sortBy display text to API value if needed
      if (baseParams.sortBy && typeof baseParams.sortBy === 'string') {
        baseParams.sortBy = SORT_MAPPING[baseParams.sortBy] || null;
      }

      // Only add location if it exists and wasn't already in params
      if (location && !param?.latitude) {
        baseParams.latitude = location.latitude;
        baseParams.longitude = location.longitude;
        baseParams.distance = baseParams.distance || 5;
      }

      // Create URLSearchParams correctly with array format for priceRange
      const queryParams = new URLSearchParams();

      Object.entries(baseParams).forEach(([key, value]) => {
        if (value != null && value !== '') {
          // Handle priceRange as array
          if (key === 'priceRange' && Array.isArray(value)) {
            value.forEach(item => {
              if (item !== null && item !== '') {
                queryParams.append(`${key}[]`, item);
              }
            });
          } else {
            queryParams.append(key, value);
          }
        }
      });

      apiURL += `?${queryParams.toString()}`;
      console.log('Fetching products from:', apiURL);

      const response = await fetch(apiURL, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const jsonResponse = await response.json();

      if (!jsonResponse.data || jsonResponse.data.length === 0) {
        setProducts(reset ? [] : products);
        setHasMore(false);
        return;
      }

      if (reset) {
        setProducts(jsonResponse.data);
        setCurrentPage(1);
      } else {
        setProducts(prev => [...prev, ...jsonResponse.data]);
        setCurrentPage(prev => prev + 1);
      }

      setHasMore(jsonResponse.data.length === PAGE_SIZE);

    } catch (error) {
      console.error('Failed to load products', error);
      Alert.alert('Error', 'Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [isLoading, currentPage, activeFilters, products]);

  const cleanParams = (params) => {
    return Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value) && value.length === 0) {
          return acc;
        }
        acc[key] = value;
      }
      return acc;
    }, {});
  };

  // Modified scroll handler for pagination
  const handleScrollEndReached = useCallback(() => {
    if (!isFocused) return;
    if (!isLoading && hasMore) {
      console.log('Loading more products...');
      fetchProducts(false, {
        search: activeFilters.search,
        category: activeFilters.category,
        page: currentPage + 1,
        ...activeFilters
      });
    }
  }, [isLoading, hasMore, activeFilters, fetchProducts]);


  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setIsLoggedIn(false);
        navigation.navigate('Login');
        return;
      }

      // No need to manually check location here
      if (!route.params?.products) {
        fetchProducts(true); // Location will be added automatically if exists
      }
    };

    checkLoginStatus();
  }, []);

  const handleInputChange = (text) => {
    setSearch(text);
    searchRef.current = text;
  };

  const handleCategorySelect = (categoryId) => {
    const newFilters = {
      ...activeFilters,
      category: categoryId
    };

    setSelectedCategory(categoryId);
    selectedCategoryRef.current = categoryId;
    setActiveFilters(newFilters);

    // Fetch with new filters
    fetchProducts(true, cleanParams(newFilters));
  };

  const handleSearchPress = async () => {
    const searchTerm = search.trim();
    // Update activeFilters with the current search term
    setActiveFilters(prev => ({
      ...prev,
      search: searchTerm
    }));

    const params = {
      search: searchTerm,
      ...(selectedCategory && { category: selectedCategory })
    };

    fetchProducts(true, params); // Location will be added automatically if exists
  };

  const handleRefresh = async () => {
    console.log('Handle refresh product fetch');
    setRefreshing(true);
    fetchProducts(true, {
      ...activeFilters,
      page: 1
      // No need to manually add location here
    });
  };

  const clearSearch = () => {
    setSearch('');
    // Also clear the search in activeFilters
    setActiveFilters(prev => ({
      ...prev,
      search: ''
    }));
    searchRef.current = '';
    const param = selectedCategory ? { category: selectedCategory } : {};
    fetchProducts(true, cleanParams(param));
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetails', { productDetails: item })}
    >
      <View style={styles.imageContainer}>
        {/* Add the tag container here */}
        <View style={[
          styles.productTag,
          item.type === 'rent' ? styles.rentTag : styles.sellTag
        ]}>
          <Text style={styles.tagText}>
            {item.type === 'rent' ? 'Rent' : 'Sell'}
          </Text>
        </View>

        <Swiper style={styles.swiper} showsPagination={false} autoplay autoplayTimeout={3}>
          {item.images && item.images.length > 0 ? (
            item.images.map((imageUri, index) => (
              <Image
                key={index}
                source={{ uri: imageUri }}
                style={styles.productImage}
                onError={() => console.warn('Failed to load image:', imageUri)}
              />
            ))
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                {item.category?.name || 'No image available'}
              </Text>
            </View>
          )}
        </Swiper>
      </View>

      {/* Compact Text Layout */}
      <View style={styles.textContainer}>
        <Text style={styles.productName} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.details} numberOfLines={2} ellipsizeMode="tail">
          {item.post_details.description}
        </Text>
        <View style={styles.priceAddressContainer}>
          <Text style={styles.price}>
            {!(item.category_id >= 9 && item.category_id <= 23) ? (
              <Text style={styles.priceText}>₹{item.post_details?.amount || 'N/A'}</Text>
            ) : (
              <Text style={styles.priceText}>
                ₹{item.post_details?.salary_from || 'N/A'} - ₹{item.post_details?.salary_to || 'N/A'}
              </Text>
            )}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {item.address || 'Address not available'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleOutsidePress = () => {
    setShowRecentSearches(false);
    Keyboard.dismiss();
  };

  useEffect(() => {
    const loadListener = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('App Open Ad loaded');
      // appOpenAd.show();
    });

    const errorListener = appOpenAd.addAdEventListener(AdEventType.ERROR, error => {
      console.log('App Open Ad failed to load:', error);
    });

    // appOpenAd.load();

    return () => {
      loadListener();
      errorListener();
    };
  }, []);

  useEffect(() => {
    const checkLocation = async () => {
      try {
        const location = await AsyncStorage.getItem('defaultLocation');
        const hasShownPopup = await AsyncStorage.getItem('hasShownLocationPopup');

        if (!location) {
          // Show immediately on first launch
          if (!hasShownPopup) {
            setShowLocationPopup(true);
            await AsyncStorage.setItem('hasShownLocationPopup', 'true');
            setHasShownInitialPopup(true);
          }
          // Show again after 5 seconds if still no location
          else {
            locationCheckTimeout.current = setTimeout(() => {
              setShowLocationPopup(true);
            }, 5000);
          }
        }
      } catch (error) {
        console.error('Error checking location:', error);
      }
    };

    checkLocation();

    return () => {
      if (locationCheckTimeout.current) {
        clearTimeout(locationCheckTimeout.current);
      }
    };
  }, []);

  const handleLocationPopupConfirm = () => {
    setShowLocationPopup(false);
    navigation.navigate('LocationPicker');
  };

  const getStoredLocation = async () => {
    try {
      const locationString = await AsyncStorage.getItem('defaultLocation');
      if (!locationString) return null;

      const location = JSON.parse(locationString);
      // Only return if we have valid coordinates
      if (location?.latitude && location?.longitude) {
        return location;
      }
      return null;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };




  useEffect(() => {
    let count = 0;
    if (activeFilters.search) count++;
    if (activeFilters.category) count++;
    if (activeFilters.distance !== 5) count++;
    if (activeFilters.listingType !== null) count++;
    if (activeFilters.priceRange[0] || activeFilters.priceRange[1]) count++;
    if (activeFilters.sortBy) count++;
    setActiveFilterCount(count);
  }, [activeFilters]);

  // Add this function to handle filter removal
  const handleRemoveFilter = (filterType) => {
    const newFilters = { ...activeFilters };

    switch (filterType) {
      case 'search':
        newFilters.search = '';
        setSearch('');
        break;
      case 'category':
        newFilters.category = null;
        setSelectedCategory(null);
        break;
      case 'distance':
        newFilters.distance = 5;
        break;
      case 'listingType':
        newFilters.listingType = null;
        break;
      case 'priceRange':
        newFilters.priceRange = [];
        break;
      case 'sortBy':
        newFilters.sortBy = null;
        break;
    }

    setActiveFilters(newFilters);
    fetchProducts(true, cleanParams(newFilters));
  };

  // Add this component just below the CategoryMenu in your FlatList ListHeaderComponent
  const FilterBar = ({ categories }) => (
    <View style={styles.filterBarContainer}>
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>Filters:</Text>
          {activeFilters.search && (
            <TouchableOpacity
              style={styles.filterPill}
              onPress={() => handleRemoveFilter('search')}
            >
              <Text style={styles.filterPillText}>Search: {activeFilters.search}</Text>
              <Icon name="close" size={normalize(10)} color="#fff" />
            </TouchableOpacity>
          )}
          {activeFilters.category && (
            <TouchableOpacity
              style={styles.filterPill}
              onPress={() => handleRemoveFilter('category')}
            >
              <Text style={styles.filterPillText}>
                Category: {categories.find(c => String(c.id) === String(activeFilters.category))?.name || 'Unknown'}
              </Text>
              <Icon name="close" size={normalize(10)} color="#fff" />
            </TouchableOpacity>
          )}
          {activeFilters.distance !== 5 && (
            <TouchableOpacity
              style={styles.filterPill}
              onPress={() => handleRemoveFilter('distance')}
            >
              <Text style={styles.filterPillText}>Radius: {activeFilters.distance}km</Text>
              <Icon name="close" size={normalize(10)} color="#fff" />
            </TouchableOpacity>
          )}
          {activeFilters.listingType !== null && (
            <TouchableOpacity
              style={styles.filterPill}
              onPress={() => handleRemoveFilter('listingType')}
            >
              <Text style={styles.filterPillText}>
                Type: {activeFilters.listingType ?
                  activeFilters.listingType.charAt(0).toUpperCase() + activeFilters.listingType.slice(1) :
                  'All'}
              </Text>
              <Icon name="close" size={normalize(10)} color="#fff" />
            </TouchableOpacity>
          )}
          {(activeFilters.priceRange[0] || activeFilters.priceRange[1]) && (
            <TouchableOpacity
              style={styles.filterPill}
              onPress={() => handleRemoveFilter('priceRange')}
            >
              <Text style={styles.filterPillText}>
                Price: {activeFilters.priceRange[0] ? `₹${activeFilters.priceRange[0]}` : 'Any'} -
                {activeFilters.priceRange[1] ? `₹${activeFilters.priceRange[1]}` : 'Any'}
              </Text>
              <Icon name="close" size={normalize(10)} color="#fff" />
            </TouchableOpacity>
          )}
          {activeFilters.sortBy !== null && (
            <TouchableOpacity
              style={styles.filterPill}
              onPress={() => handleRemoveFilter('sortBy')}
            >
              <Text style={styles.filterPillText}>Sort: {activeFilters.sortBy}</Text>
              <Icon name="close" size={normalize(10)} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.quickFilterButton}
            onPress={() => {
              const resetFilters = {
                search: '',
                category: null,
                priceRange: [],
                sortBy: null,
                distance: 5,
                listingType: null,
                latitude: null,
                longitude: null,
              };
              setActiveFilters(resetFilters);
              setSearch('');
              setSelectedCategory(null);
              fetchProducts(true, cleanParams(resetFilters));
            }}
          >
            <Icon name="refresh" size={normalize(16)} color="#007bff" />
            <Text style={styles.quickFilterText}>Reset All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );



  return (

    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.container}>
            {/* Banner Ad */}
            {/* <View style={styles.bannerAdContainer}>
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            style={styles.bannerAd}
          />
        </View> */}
            <View style={styles.searchContainer}>
              {/* Search Input */}
              <View style={styles.searchInputWrapper}>
                <TextInput
                  style={styles.searchInput}
                  onChangeText={handleInputChange}
                  value={search}
                  placeholder="Search products..."
                  placeholderTextColor="#888"
                  onFocus={() => setShowRecentSearches(true)}
                  onSubmitEditing={handleSearchPress}
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={clearSearch}
                    style={styles.clearButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="close" size={normalize(16)} color="#888" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Physical Search Button with Icon */}
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchPress}
                disabled={search.length === 0}
              >
                <View style={styles.searchButtonContent}>
                  <Icon name="search" size={normalize(16)} color="#fff" style={styles.searchButtonIcon} />
                </View>
              </TouchableOpacity>

              {/* Filter Button */}
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => navigation.navigate('FilterScreen', {
                  initialFilters: { ...activeFilters, search, category: selectedCategory }
                })}
              >
                <Icon name="filter-list" size={normalize(20)} color="#fff" />
                {activeFilterCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            {/* {isLoading && products.length === 0 && (
          <ActivityIndicator size="large" color="#007bff" style={styles.loaderTop} />
        )} */}
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => `${item.id}_${currentPage}`}
              numColumns={2}
              contentContainerStyle={styles.productList}
              ListHeaderComponent={
                <>
                  {/* Banner Ad if needed */}
                  <CategoryMenu
                    onCategorySelect={handleCategorySelect}
                    selectedCategory={selectedCategory}
                  />
                  <FilterBar categories={categories} />
                  <Text style={styles.recommendedText}>Recommended</Text>
                </>
              }
              ListEmptyComponent={() => (
                !isLoading && <Text style={styles.noProductsText}>No products found</Text>
              )}
              ListFooterComponent={
                hasMore && (
                  <ActivityIndicator
                    size="large"
                    color="#007bff"
                    style={styles.loaderBottom}
                  />
                )
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
              onEndReached={handleScrollEndReached}
              onEndReachedThreshold={0.5}
              removeClippedSubviews={true}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={21}
            />
            <BottomNavBar navigation={navigation} />
          </View>
        </TouchableWithoutFeedback>
        {showLocationPopup && (
          <View style={styles.popupOverlay}>
            <View style={styles.popupContainer}>
              <Text style={styles.popupTitle}>Location Required</Text>
              <Text style={styles.popupMessage}>
                Please set your location to find products near you
              </Text>
              <TouchableOpacity
                style={styles.popupButton}
                onPress={handleLocationPopupConfirm}
              >
                <Text style={styles.popupButtonText}>Set Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Home;
