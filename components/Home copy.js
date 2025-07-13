import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, DeviceEventEmitter,
  Animated, RefreshControl, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import Swiper from 'react-native-swiper';
import CategoryMenu from './CategoryMenu';
import BottomNavBar from './BottomNavBar';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Home = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [filters, setFilters] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [showMenu, setShowMenu] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  const lastScrollY = useRef(0);

  useEffect(() => {
    // Set filters from route.params when navigating with filters
    if (route.params?.filters) {
      setFilters(route.params.filters);
    }
  }, [route.params]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const storedSearches = await AsyncStorage.getItem('recentSearches');
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  };

  const addRecentSearch = async (searchText) => {
    if (searchText.trim()) {
      const updatedSearches = [searchText, ...recentSearches.filter((item) => item !== searchText)].slice(0, 5);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      setRecentSearches(updatedSearches);
    }
  };

  const fetchProducts = async (page, category, reset = false, search = null) => {
    const token = await AsyncStorage.getItem('authToken');
    if (isLoading) return;

    setIsLoading(true);
    const apiUrl = `${process.env.BASE_URL}/posts?page=${page}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`;
    const requestOptions = {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      const response = await fetch(apiUrl, requestOptions);
      const jsonResponse = await response.json();
      if (!jsonResponse.data || jsonResponse.data.length === 0) {
        setProducts([]);
        setHasMore(false);
      } else if (reset) {
        setProducts(jsonResponse.data);
      } else {
        setProducts((prevProducts) => [...prevProducts, ...jsonResponse.data]);
      }

      setCurrentPage(page);
      setHasMore(jsonResponse.data && jsonResponse.data.length === 15 && jsonResponse.links.next != null);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSelectedCategory(null);
      fetchProducts(1, null, true);
    }, [])
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('refreshHome', () => {
      setSelectedCategory(null);
      fetchProducts(1, null, true);
    });

    return () => {
      subscription.remove();
    };
  }, []);

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

  const handleScrollEndReached = () => {
    if (!isLoading && hasMore) {
      fetchProducts(currentPage + 1, selectedCategory);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(1, selectedCategory, true);
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

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchProducts(1, categoryId, true);
  };

  const handleInputChange = (text) => {
    setSearch(text);
    setShowRecentSearches(true);
  };

  const handleSearchPress = () => {
    fetchProducts(1, null, true, search);
    addRecentSearch(search);
    setShowRecentSearches(false);
  };

  const handleRecentSearchSelect = (searchText) => {
    setSearch(searchText);
    handleSearchPress();
  };

  const clearSearch = () => {
    setSearch('');
    setShowRecentSearches(false);
    fetchProducts(1, null, true);
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <View style={styles.imageContainer}>
        <Swiper style={styles.swiper} showsPagination autoplay autoplayTimeout={3}>
          {item.images.map((imageUri, index) => (
            <Image key={index} source={{ uri: imageUri }} style={styles.productImage} />
          ))}
        </Swiper>
      </View>
      <Text style={styles.productName}>{item.title}</Text>
      <Text style={styles.details} numberOfLines={2} ellipsizeMode="tail">
        {item.post_details.description}
      </Text>
      <Text style={styles.price}>Price: ${item.post_details.amount}</Text>
    </TouchableOpacity>
  );

  const handleOutsidePress = () => {
    setShowRecentSearches(false);
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
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
              <Icon name="close" size={20} color="#888" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('FilterScreen')}>
            <Icon name="filter-list" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
            <Icon name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* {showRecentSearches && recentSearches.length > 0 && (
          <View style={styles.recentSearchOverlay}>
            {recentSearches.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => handleRecentSearchSelect(item)}>
                <Text style={styles.recentSearchItem}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )} */}

        {showMenu && <CategoryMenu onCategorySelect={handleCategorySelect} />}

        {isLoading && products.length === 0 && (
          <ActivityIndicator size="large" color="#007bff" style={styles.loaderTop} />
        )}

        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          onEndReached={handleScrollEndReached}
          onEndReachedThreshold={0.1}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={() => (
            !isLoading && <Text style={styles.noProductsText}>No products found</Text>
          )}
          ListFooterComponent={
            products.length > 0 ? (
              isLoading && hasMore ? <ActivityIndicator size="large" color="#007bff" style={styles.loaderBottom} /> : null
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />

        <BottomNavBar navigation={navigation} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  clearButton: { position: 'absolute', right: 105, padding: 5 },
  searchButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  filterButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  recentSearchOverlay: {
    position: 'absolute',
    top: 70,
    left: 10,
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 10,
    opacity: 0.95,
    zIndex: 1,
  },
  recentSearchItem: {
    paddingVertical: 8,
    fontSize: 16,
    color: '#007bff',
  },
  productList: { paddingHorizontal: 5, paddingBottom: 60 },
  productItem: {
    flex: 1,
    margin: 5,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    shadowColor: '#565656',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  imageContainer: { height: 120, width: '100%', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  productName: { fontWeight: 'bold', textAlign: 'center' },
  details: { fontSize: 16, marginTop: 5, marginBottom: 10 },
  price: { fontSize: 16, fontWeight: 'bold' },
  loaderTop: { marginBottom: 10 },
  loaderBottom: { marginTop: 10 },
  noProductsText: { fontSize: 16, textAlign: 'center', marginTop: 20 },
});

export default Home;
