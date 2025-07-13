import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, DeviceEventEmitter,
  Animated, RefreshControl, TouchableWithoutFeedback, Keyboard, Dimensions
} from 'react-native';
import Swiper from 'react-native-swiper';
import CategoryMenu from './CategoryMenu';
import BottomNavBar from './BottomNavBar';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
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

  const lastScrollY = useRef(0);

  const [activeFilters, setActiveFilters] = useState({
    search: route.params?.filters?.search || '',
    category: route.params?.filters?.category || null,
    priceRange: route.params?.filters?.priceRange || [],
    sortBy: route.params?.filters?.sortBy || 'Recently Added',
    distance: route.params?.filters?.distance || 5,
    location: route.params?.filters?.location || null
  });

  const handleClearFilter = (filterKey) => {
    setActiveFilters(prev => {
      const updated = { ...prev };
      if (filterKey === 'priceRange') {
        updated[filterKey] = [];
      } else if (filterKey === 'sortBy') {
        updated[filterKey] = 'Recently Added';
      } else {
        updated[filterKey] = null;
      }
      return updated;
    });

    fetchProducts(true, { ...activeFilters, [filterKey]: null });
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

      // Only fetch products if route.params.products is empty
      if (!route.params?.products) {
        if (products.length === 0 || selectedCategoryRef.current !== selectedCategory || searchRef.current !== search) {
          const param = {};
          if (selectedCategoryRef.current) {
            param.category = selectedCategoryRef.current;
          }
          if (searchRef.current) {
            param.search = searchRef.current.trim();
          }
          fetchProducts(true, param);
        }
      }

      return () => {
        console.log('Home Screen Unfocused');
      };
    }, [products.length, selectedCategory, search, route.params?.products])
  );

  const fetchProducts = useCallback(async (reset = false, param = null) => {
    console.log('param- ', param);
    const token = await AsyncStorage.getItem('authToken');
    if (isLoading || (!reset && !hasMore)) return;

    setIsLoading(true);
    let apiURL = `${process.env.BASE_URL}/posts`;

    // Build query parameters with pagination
    const baseParams = {
      page: reset ? 1 : currentPage,
      limit: PAGE_SIZE,
      ...cleanParams(param || {}) // Clean the parameters
    };

    const queryParams = new URLSearchParams(baseParams).toString();
    apiURL += `?${queryParams}`;

    console.log('apiUrl- ', apiURL);

    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle response errors
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const jsonResponse = await response.json();

      // Handle empty response
      if (!jsonResponse.data || jsonResponse.data.length === 0) {
        setProducts(reset ? [] : products);
        setHasMore(false);
        return;
      }

      // Update products and pagination state
      if (reset) {
        setProducts(jsonResponse.data);
        setCurrentPage(1);
      } else {
        setProducts(prev => [...prev, ...jsonResponse.data]);
        setCurrentPage(prev => prev + 1);
      }

      // Determine if more pages exist
      setHasMore(jsonResponse.data.length === PAGE_SIZE);

    } catch (error) {
      console.error('Failed to load products', error);
      Alert.alert('Error', 'Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [isLoading, currentPage, hasMore, products]);

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
      }
    };
    checkLoginStatus();
  }, []);

  // const handleScrollEndReached = () => {
  //   if (!isLoading && hasMore) {
  //     console.log('Scrollend call');
  //     const param = { page: currentPage + 1 };
  //     fetchProducts(false, param);
  //   }
  // };

  const handleRefresh = () => {
    setRefreshing(true);
    console.log('Refresh call');
    fetchProducts(true, { ...activeFilters, page: 1 });
  };

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
      setShowMenu(false);
    } else if (currentScrollY <= 0) {
      setShowMenu(true);
    }
    lastScrollY.current = currentScrollY;
  };

  const handleInputChange = (text) => {
    setSearch(text);
    searchRef.current = text;
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    selectedCategoryRef.current = categoryId;
    const param = { category: categoryId };
    if (searchRef.current || search) {
      param.search = searchRef.current ?? search;
    }
    fetchProducts(true, cleanParams(param));
  };

  const handleSearchPress = () => {
    console.log('Search button pressed');
    const param = {};
    if (search) {
      param.search = search.trim();
    }
    if (selectedCategory) {
      param.category = selectedCategory;
    }
    console.log('Search Button Enter-', param);
    fetchProducts(true, cleanParams(param));
  };

  const clearSearch = () => {
    setSearch('');
    setActiveFilters(prevState => ({
      ...prevState,
      search: ''
    }));
    searchRef.current = '';
    const param = selectedCategory ? { category: selectedCategory } : {};
    console.log('Clear search called with params:', param);
    fetchProducts(true, cleanParams(param)); // Add cleanParams here
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetails', { productDetails: item })}
    >
      <View style={styles.imageContainer}>
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
          <Text style={styles.price}>₹{item.post_details.amount}</Text>
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


  return (
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
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            onChangeText={handleInputChange}
            value={search}
            placeholder="Search..."
            onFocus={() => setShowRecentSearches(true)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Icon name="close" size={normalize(13)} color="#888" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigation.navigate('FilterScreen', {
              initialFilters: { ...activeFilters, search, category: selectedCategory }
            })}
          >
            <Icon name="filter-list" size={normalize(20)} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
            <Icon name="search" size={normalize(20)} color="#fff" />
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
  );
};

export default Home;
