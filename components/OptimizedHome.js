import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions
} from 'react-native';
import CategoryMenu from './CategoryMenu';
import BottomNavBar from './BottomNavBar';
import OptimizedProduct from './OptimizedProduct';
import { useFocusEffect, useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../assets/css/Home.styles';
import OptimizedApiService from '../service/optimizedApiService';
import CacheService from '../service/cacheService';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const PAGE_SIZE = 15;

const OptimizedHome = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  // State management
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(route.params?.filters?.category || null);
  const [search, setSearch] = useState(route.params?.filters?.search || '');
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Refs for optimization
  const searchRef = useRef(search);
  const selectedCategoryRef = useRef(selectedCategory);
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef(null);

  // Active filters state
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

  // State for user location and product distances
  const [userLocation, setUserLocation] = useState(null);
  const [productDistances, setProductDistances] = useState({});

  // Categories data
  const categories = useMemo(() => [
    { id: null, name: 'All', icon: 'apps', color: '#2563eb', type: 'Ion' },
    { id: '1', name: 'Cars', icon: 'car', color: '#dc2626', type: 'MC' },
    { id: '2', name: 'Properties', icon: 'home', color: '#16a34a', type: 'Ion' },
    { id: '7', name: 'Mobiles', icon: 'mobile-alt', color: '#f59e0b', type: 'Fontisto' },
    { id: '8', name: 'Job', icon: 'briefcase', color: '#84cc16', type: 'Ion' },
    { id: '24', name: 'Bikes', icon: 'motorbike', color: '#8b5cf6', type: 'MC' },
    { id: '29', name: 'Electronics & Appliances', icon: 'laptop', color: '#0ea5e9', type: 'FA5' },
    { id: '39', name: 'Commercial Vehicle', icon: 'truck', color: '#f97316', type: 'FA5' },
    { id: '42', name: 'Commercial Machinery', icon: 'cog', color: '#8b5cf6', type: 'FA5' },
    { id: '45', name: 'Furniture', icon: 'sofa', color: '#d97706', type: 'MC' },
    { id: '51', name: 'Fashion', icon: 'tshirt-crew', color: '#ec4899', type: 'MC' },
    { id: '55', name: 'Books, Sports & Hobbies', icon: 'menu-book', color: '#14b8a6', type: 'M' },
    { id: '61', name: 'Pets', icon: 'paw', color: '#f97316', type: 'FA5' },
    { id: '66', name: 'Services', icon: 'tools', color: '#06b6d4', type: 'FA5' },
    { id: '76', name: 'Others', icon: 'dots-horizontal', color: '#6b7280', type: 'MC' },
  ], []);

  const SORT_MAPPING = useMemo(() => ({
    'Relevance': null,
    'Recently Added': 'createdAt_desc',
    'Price: Low to High': 'price_asc',
    'Price: High to Low': 'price_desc'
  }), []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      OptimizedApiService.cancelAllRequests();
    };
  }, []);

  // Update route params
  useEffect(() => {
    if (route.params?.filters) {
      setActiveFilters(route.params.filters);
      setSearch(route.params.filters.search || '');
      setSelectedCategory(route.params.filters.category || null);
    }
    if (route.params?.products) {
      setProducts(route.params.products);
      setHasMore(false);
    }
  }, [route.params]);

  // Focus effect for initial data fetch
  useFocusEffect(
    useCallback(() => {
      console.log('Home Screen Focused');
      const fetchInitialData = async () => {
        if (!route.params?.products) {
          await fetchProducts(true, cleanParams(activeFilters));
        }
      };

      // Debounce the fetch to avoid multiple calls
      fetchTimeoutRef.current = setTimeout(fetchInitialData, 100);

      return () => {
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
      };
    }, [activeFilters, route.params?.products])
  );

  // Memoized function to clean parameters
  const cleanParams = useCallback((params) => {
    return Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value) && value.length === 0) {
          return acc;
        }
        acc[key] = value;
      }
      return acc;
    }, {});
  }, []);

  // Get stored location
  const getStoredLocation = useCallback(async () => {
    try {
      const locationString = await AsyncStorage.getItem('defaultLocation');
      if (!locationString) return null;

      const location = JSON.parse(locationString);
      if (location?.latitude && location?.longitude) {
        return location;
      }
      return null;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }, []);

  // Fetch products with caching
  const fetchProducts = useCallback(async (reset = false, param = null) => {
    if (isLoading || !isMountedRef.current) return;

    setIsLoading(true);
    try {
      const location = param?.latitude ? null : await getStoredLocation();

      const baseParams = {
        page: reset ? 1 : currentPage,
        limit: PAGE_SIZE,
        ...cleanParams(param || activeFilters)
      };

      // Convert sortBy display text to API value
      if (baseParams.sortBy && typeof baseParams.sortBy === 'string') {
        baseParams.sortBy = SORT_MAPPING[baseParams.sortBy] || null;
      }

      // Add location if exists
      if (location && !param?.latitude) {
        baseParams.latitude = location.latitude;
        baseParams.longitude = location.longitude;
        baseParams.distance = baseParams.distance || 5;
      }

      // Use optimized API service with caching
      const jsonResponse = await OptimizedApiService.fetchPosts(
        baseParams,
        baseParams.page,
        baseParams.limit
      );

      if (!isMountedRef.current) return;

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
      if (!isMountedRef.current) return;
      console.error('Failed to load products', error);
      Alert.alert('Error', 'Failed to load products. Please try again later.');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, [isLoading, currentPage, activeFilters, products, cleanParams, getStoredLocation, SORT_MAPPING]);

  // Handle scroll end reached with debouncing
  const handleScrollEndReached = useCallback(() => {
    if (!isFocused || isLoading || !hasMore) return;

    console.log('Loading more products...');
    fetchProducts(false, {
      ...activeFilters,
      page: currentPage + 1,
    });
  }, [isFocused, isLoading, hasMore, activeFilters, currentPage, fetchProducts]);

  // Handle search input change
  const handleInputChange = useCallback((text) => {
    setSearch(text);
    searchRef.current = text;
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId) => {
    const newFilters = {
      ...activeFilters,
      category: categoryId
    };

    setSelectedCategory(categoryId);
    selectedCategoryRef.current = categoryId;
    setActiveFilters(newFilters);

    fetchProducts(true, cleanParams(newFilters));
  }, [activeFilters, cleanParams, fetchProducts]);

  // Handle search press
  const handleSearchPress = useCallback(async () => {
    const searchTerm = search.trim();
    setActiveFilters(prev => ({
      ...prev,
      search: searchTerm
    }));

    const params = {
      search: searchTerm,
      ...(selectedCategory && { category: selectedCategory })
    };

    fetchProducts(true, params);
  }, [search, selectedCategory, fetchProducts]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    console.log('Handle refresh product fetch');
    setRefreshing(true);
    // Clear cache on manual refresh
    await CacheService.clearPostsCache();
    fetchProducts(true, {
      ...activeFilters,
      page: 1
    });
  }, [activeFilters, fetchProducts]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearch('');
    setActiveFilters(prev => ({
      ...prev,
      search: ''
    }));
    searchRef.current = '';
    const param = selectedCategory ? { category: selectedCategory } : {};
    fetchProducts(true, cleanParams(param));
  }, [selectedCategory, cleanParams, fetchProducts]);

  // Memoized distance calculation functions
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const formatDistance = useCallback((distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }, []);

  // Load user location
  useEffect(() => {
    const loadUserLocation = async () => {
      try {
        const locationString = await AsyncStorage.getItem('defaultLocation');
        if (locationString) {
          const location = JSON.parse(locationString);
          if (location?.latitude && location?.longitude) {
            setUserLocation(location);
          }
        }
      } catch (error) {
        console.error('Error loading user location:', error);
      }
    };
    loadUserLocation();
  }, []);

  // Calculate distances when products or user location changes
  useEffect(() => {
    if (userLocation && products.length > 0) {
      const distances = {};
      products.forEach(product => {
        if (product.latitude && product.longitude) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            parseFloat(product.latitude),
            parseFloat(product.longitude)
          );
          distances[product.id] = formatDistance(distance);
        }
      });
      setProductDistances(distances);
    }
  }, [userLocation, products, calculateDistance, formatDistance]);

  // Memoized render item with optimized product component
  const renderProductItem = useCallback(({ item }) => {
    const distance = productDistances[item.id];
    return <OptimizedProduct item={item} distance={distance} />;
  }, [productDistances]);

  // Memoized key extractor
  const keyExtractor = useCallback((item) => `${item.id}_${currentPage}`, [currentPage]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilters.search) count++;
    if (activeFilters.category) count++;
    if (activeFilters.distance !== 5) count++;
    if (activeFilters.listingType !== null) count++;
    if (activeFilters.priceRange[0] || activeFilters.priceRange[1]) count++;
    if (activeFilters.sortBy) count++;
    return count;
  }, [activeFilters]);

  // Handle filter removal
  const handleRemoveFilter = useCallback((filterType) => {
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
  }, [activeFilters, cleanParams, fetchProducts]);

  // Memoized Filter Bar Component
  const FilterBar = useMemo(() => ({ categories }) => (
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
  ), [activeFilterCount, activeFilters, handleRemoveFilter, cleanParams, fetchProducts]);

  // Memoized list header component
  const ListHeaderComponent = useMemo(() => (
    <>
      <CategoryMenu
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />
      <FilterBar categories={categories} />
      <Text style={styles.recommendedText}>Recommended</Text>
    </>
  ), [selectedCategory, categories, handleCategorySelect]);

  // Memoized empty component
  const ListEmptyComponent = useMemo(() => () => (
    !isLoading && <Text style={styles.noProductsText}>No products found</Text>
  ), [isLoading]);

  // Memoized footer component
  const ListFooterComponent = useMemo(() => (
    hasMore && (
      <ActivityIndicator
        size="large"
        color="#007bff"
        style={styles.loaderBottom}
      />
    )
  ), [hasMore]);

  const handleOutsidePress = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleLocationPopupConfirm = useCallback(() => {
    setShowLocationPopup(false);
    navigation.navigate('LocationPicker');
  }, [navigation]);

  // Check for location on mount
  useEffect(() => {
    const checkLocation = async () => {
      try {
        const location = await AsyncStorage.getItem('defaultLocation');
        const hasShownPopup = await AsyncStorage.getItem('hasShownLocationPopup');

        if (!location && !hasShownPopup) {
          setShowLocationPopup(true);
          await AsyncStorage.setItem('hasShownLocationPopup', 'true');
        }
      } catch (error) {
        console.error('Error checking location:', error);
      }
    };

    checkLocation();
  }, []);

  // Prefetch data on mount
  useEffect(() => {
    OptimizedApiService.prefetchData();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        {/* Search Container */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <TextInput
              style={styles.searchInput}
              onChangeText={handleInputChange}
              value={search}
              placeholder="Search products..."
              placeholderTextColor="#888"
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

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchPress}
            disabled={search.length === 0}
          >
            <View style={styles.searchButtonContent}>
              <Icon name="search" size={normalize(18)} color="#fff" style={styles.searchButtonIcon} />
            </View>
          </TouchableOpacity>

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

        {/* Product List */}
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.productList}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007bff']}
            />
          }
          onEndReached={handleScrollEndReached}
          onEndReachedThreshold={0.5}
          // Performance optimizations
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
          updateCellsBatchingPeriod={50}
          getItemLayout={(data, index) => ({
            length: normalize(250), // Approximate item height
            offset: normalize(250) * index,
            index,
          })}
        />

        <BottomNavBar navigation={navigation} />

        {/* Location Popup */}
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

export default OptimizedHome;

