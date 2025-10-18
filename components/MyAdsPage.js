import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Modal, TouchableWithoutFeedback, ActivityIndicator, Dimensions, Animated } from 'react-native';
import BottomNavBar from './BottomNavBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const MyAdsPage = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isDeleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);

  const [showConfetti, setShowConfetti] = useState(false);
  const [showBoostSuccess, setShowBoostSuccess] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState([]);
  const confettiRef = useRef(null);

  useEffect(() => {
    fetchProducts(1, true); // Fetch the first page on component mount
  }, []);

  const fetchProducts = async (page = 1, isRefreshing = false) => {
    if (isLoading) return; // Prevent multiple simultaneous requests
    setIsLoading(true);
    if (isRefreshing) setIsRefreshing(true);

    const token = await AsyncStorage.getItem('authToken');
    try {
      const response = await fetch(`${process.env.BASE_URL}/my-post?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        const newProducts = jsonResponse.data || [];
        const nextPage = jsonResponse.links.next !== null;

        setProducts(prevProducts => (isRefreshing ? newProducts : [...prevProducts, ...newProducts]));
        setCurrentPage(page);
        setHasMorePages(nextPage);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Dialog.show({
        type: ALERT_TYPE.ERROR,
        title: 'Error',
        textBody: 'Failed to load products.',
        button: 'Try again',
        onPressButton: () => fetchProducts(page),
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const deleteProduct = async () => {
    const token = await AsyncStorage.getItem('authToken');
    try {
      const response = await fetch(`${process.env.BASE_URL}/posts/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setProducts(products.filter(item => item.id !== selectedProduct.id));
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Post deleted successfully.',
          button: 'OK',
        });
      } else {
        throw new Error('Failed to delete the post');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      Dialog.show({
        type: ALERT_TYPE.ERROR,
        title: 'Error',
        textBody: 'Failed to delete the post.',
        button: 'Try again',
      });
    }
  };

  const showPopup = (item) => {
    setSelectedProduct(item);
    setPopupVisible(true);
  };

  const hidePopup = () => {
    setPopupVisible(false);
  };

  const showDeleteConfirmModal = () => {
    setDeleteConfirmVisible(true);
  };

  const hideDeleteConfirmModal = () => {
    setDeleteConfirmVisible(false);
  };

  const confirmDelete = () => {
    hideDeleteConfirmModal();
    deleteProduct();
  };

  const renderProductItem = ({ item }) => {
    const hasImage = item.images && item.images.length > 0 && item.images[0];

    return (
      <TouchableOpacity style={styles.productItem} onPress={() => showPopup(item)}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.productImage}
            onError={() => console.warn('Failed to load image:', item.images[0])}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>
              {item.category?.name || 'No image found'}
            </Text>
          </View>
        )}
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.title}</Text>
          <Text style={styles.productDesc}>{item.post_details?.description || item.description || ''}</Text>
          <Text style={styles.price}>Price: ${item.post_details.amount}</Text>
        </View>
        <Icon name="angle-right" size={24} color="#007BFF" style={styles.arrowIcon} />
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;
    return <ActivityIndicator size="large" color="#007BFF" style={styles.loadingIndicator} />;
  };

  const handleLoadMore = () => {
    if (hasMorePages && !isLoading) {
      fetchProducts(currentPage + 1);
    }
  };

  const handleRefresh = () => {
    fetchProducts(1, true);
  };

  const categoryComponentMap = {
    'cars': 'AddCarForm',
    'houses_apartments': 'AddHousesApartments',
    'mobiles': 'AddMobileTablets',
    'heavy_machinery': 'AddHeavyMachinery',

    'land_plots': 'AddLandPlots',
    'pg_guest_houses': 'AddPgGuestHouse',
    'shop_offices': 'AddShopOffices',
    'data_entry_back_office': 'AddJob',
    'sales_marketing': 'AddJob',
    'bpo_telecaller': 'AddJob',
    'driver': 'AddJob',
    'office_assistant': 'AddJob',
    'delivery_collection': 'AddJob',
    'teacher': 'AddJob',
    'cook': 'AddJob',
    'receptionist_front_office': 'AddJob',
    'operator_technician': 'AddJob',
    'engineer_developer': 'AddJob',
    'hotel_travel_executive': 'AddJob',
    'accountant': 'AddJob',
    'designer': 'AddJob',
    'other_jobs': 'AddJob',

    'motorcycles': 'AddMotorcycles',
    'scooters': 'AddScooters',
    'bycycles': 'AddBycycles',

    'accessories': 'AddOthers',
    'computers_laptops': 'AddOthers',
    'tvs_video_audio': 'AddOthers',
    'acs': 'AddOthers',
    'fridges': 'AddOthers',
    'washing_machines': 'AddOthers',
    'cameras_lenses': 'AddOthers',
    'harddisks_printers_monitors': 'AddOthers',
    'kitchen_other_appliances': 'AddOthers',
    'sofa_dining': 'AddOthers',
    'beds_wardrobes': 'AddOthers',
    'home_decor_garden': 'AddOthers',
    'kids_furniture': 'AddOthers',
    'other_household_items': 'AddOthers',
    'mens_fashion': 'AddOthers',
    'womens_fashion': 'AddOthers',
    'kids_fashion': 'AddOthers',
    'books': 'AddOthers',
    'gym_fitness': 'AddOthers',
    'musical_instruments': 'AddOthers',
    'sports_instrument': 'AddOthers',
    'other_hobbies': 'AddOthers',
    'dogs': 'AddOthers',
    'fish_aquarium': 'AddOthers',
    'pets_food_accessories': 'AddOthers',
    'other_pets': 'AddOthers',
    'other_services': 'AddOthers',
    'packers_movers': 'AddOthers',
    'machinery_spare_parts': 'AddOthers',

    'education_classes': 'AddEducationClasses',
    'tours_travels': 'AddToursTravels',
    'electronics_repair_services': 'AddElectronicsRepairServices',
    'health_beauty': 'AddHealthBeauty',
    'home_renovation_repair': 'AddHomeRenovationRepair',
    'cleaning_pest_control': 'AddCleaningPestControl',
    'legal_documentation_sevices': 'AddLegalDocumentationServices',
    'commercial_heavy_vehicles': 'AddCommercialHeavyVehicle',
    'vehicle_spare_parts': 'AddVehicleSpareParts',
    'commercial_heavy_machinery': 'AddCommercialHeavyMachinery',

    'others': 'AddOthers',
  };

  const getComponentForCategory = (guard_name) => {
    return categoryComponentMap[guard_name] || 'AddOthers';
  };

  const ConfettiParticle = ({ particle }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const rotateValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const startAnimation = () => {
        Animated.parallel([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: Dimensions.get('window').height + 100,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.timing(rotateValue, {
              toValue: 1,
              duration: 1000 + Math.random() * 1000,
              useNativeDriver: true,
            })
          ),
        ]).start();
      };

      const timer = setTimeout(startAnimation, particle.delay);
      return () => clearTimeout(timer);
    }, [particle.delay]);

    const opacity = animatedValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

    const rotation = rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.confettiParticle,
          {
            left: particle.x,
            backgroundColor: particle.color,
            opacity,
            transform: [
              { translateY },
              { rotate: rotation },
              { scale: particle.scale },
            ],
          },
        ]}
      />
    );
  };

  const createConfettiParticles = () => {
    const particles = [];
    const colors = ['#FFD700', '#FFA500', '#007BFF', '#28A745', '#6F42C1', '#E83E8C'];
    const { width, height } = Dimensions.get('window');

    for (let i = 0; i < 50; i++) {
      particles.push({
        id: i,
        x: Math.random() * width,
        y: -50,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        delay: Math.random() * 1000,
      });
    }
    return particles;
  };

  const handleBoost = () => {
    const particles = createConfettiParticles();
    setConfettiParticles(particles);
    setShowConfetti(true);
    hidePopup();

    setTimeout(() => {
      setShowConfetti(false);
      setConfettiParticles([]);
      setShowBoostSuccess(true);
    }, 2000);
    setTimeout(() => setShowBoostSuccess(false), 5000);
  };

  return (
    <View style={styles.container}>
      {showConfetti && (
        <View style={styles.confettiContainer}>
          {confettiParticles.map((particle) => (
            <ConfettiParticle key={particle.id} particle={particle} />
          ))}
        </View>
      )}

      {/* Professional Boost Success Modal */}
      {showBoostSuccess && (
        <Modal
          visible={showBoostSuccess}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowBoostSuccess(false)}
        >
          <View style={styles.boostSuccessOverlay}>
            <View style={styles.boostSuccessContainer}>
              <View style={styles.boostSuccessIconContainer}>
                <Icon name="rocket" size={60} color="#FFD700" />
                <View style={styles.boostSuccessGlow} />
              </View>

              <Text style={styles.boostSuccessTitle}>🎉 Congratulations!</Text>
              <Text style={styles.boostSuccessMessage}>
                Your product "{selectedProduct?.title}" has been successfully boosted!
              </Text>

              <View style={styles.boostSuccessDetails}>
                <View style={styles.boostSuccessDetailItem}>
                  <Icon name="eye" size={20} color="#007BFF" />
                  <Text style={styles.boostSuccessDetailText}>Increased visibility</Text>
                </View>
                <View style={styles.boostSuccessDetailItem}>
                  <Icon name="trending-up" size={20} color="#28A745" />
                  <Text style={styles.boostSuccessDetailText}>Higher engagement</Text>
                </View>
                <View style={styles.boostSuccessDetailItem}>
                  <Icon name="star" size={20} color="#FFD700" />
                  <Text style={styles.boostSuccessDetailText}>Priority placement</Text>
                </View>
              </View>

              <Text style={styles.boostSuccessFooter}>
                Your ad will now appear at the top of search results for the next 24 hours.
              </Text>

              <TouchableOpacity
                style={styles.boostSuccessButton}
                onPress={() => setShowBoostSuccess(false)}
              >
                <Text style={styles.boostSuccessButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productList}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>You have not posted any item yet.</Text>
            </View>
          )
        }
      />
      <BottomNavBar navigation={navigation} />

      {/* Action Modal */}
      <Modal
        visible={isPopupVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={hidePopup}
      >
        <TouchableWithoutFeedback onPress={hidePopup}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.newPopupContainer}>
                <Text style={styles.newPopupTitle}>Select an Action</Text>
                <View style={styles.newPopupOptionsContainer}>
                  <TouchableOpacity
                    style={styles.newPopupOption}
                    onPress={() => {
                      hidePopup();
                      setTimeout(() => {
                        navigation.navigate('ProductDetails', { productDetails: selectedProduct });
                      }, 300);
                    }}
                  >
                    <Icon name="info-circle" size={20} color="#007BFF" style={styles.newPopupIcon} />
                    <Text style={styles.newPopupOptionText}>Details</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Icon name="angle-right" size={20} color="#888" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.newPopupOption}
                    onPress={() => {
                      hidePopup();
                      setTimeout(() => {
                        navigation.navigate('MyFollowersPage', { product: selectedProduct });
                      }, 300);
                    }}
                  >
                    <Icon name="users" size={20} color="#007BFF" style={styles.newPopupIcon} />
                    <Text style={styles.newPopupOptionText}>Followers</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Icon name="angle-right" size={20} color="#888" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.newPopupOption}
                    onPress={() => {
                      hidePopup();
                      setTimeout(() => {
                        const editComponent = getComponentForCategory(selectedProduct.category.guard_name);
                        navigation.navigate(editComponent, { category: [], subcategory: selectedProduct.category, product: selectedProduct });
                      }, 300);
                    }}
                  >
                    <Icon name="edit" size={20} color="#007BFF" style={styles.newPopupIcon} />
                    <Text style={styles.newPopupOptionText}>Edit</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Icon name="angle-right" size={20} color="#888" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.newPopupOption, styles.newBoostOption]}
                    onPress={handleBoost}
                  >
                    <Icon name="bolt" size={20} color="#FFD700" style={styles.newPopupIcon} />
                    <Text style={styles.newPopupOptionText}>Boost</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Icon name="angle-right" size={20} color="#888" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.newPopupOption, styles.newDeleteOption]}
                    onPress={() => {
                      hidePopup();
                      showDeleteConfirmModal();
                    }}
                  >
                    <Icon name="trash" size={20} color="#FF5C5C" style={styles.newPopupIcon} />
                    <Text style={styles.newPopupOptionText}>Delete</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Icon name="angle-right" size={20} color="#888" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideDeleteConfirmModal}
      >
        <TouchableWithoutFeedback onPress={hideDeleteConfirmModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmContainer}>
              <Text style={styles.confirmTitle}>Are you sure you want to delete this post?</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={hideDeleteConfirmModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={confirmDelete}>
                  <Text style={styles.confirmButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

// ... (keep all your existing styles exactly the same)

// Add these new styles:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  productList: {
    paddingBottom: 60,
  },
  productItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 5,
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  productDesc: {
    fontSize: 15,
    color: 'grey',
  },
  price: {
    fontSize: 14,
    color: 'green',
  },
  arrowIcon: {
    marginLeft: 10,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPopupContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  newPopupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  newPopupOptionsContainer: {
    width: '100%',
  },
  newPopupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginVertical: 8,
    width: '100%',
  },
  newPopupOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 10,
  },
  newPopupIcon: {
    marginRight: 10,
  },
  newDeleteOption: {
    backgroundColor: '#ffe6e6',
  },
  confirmContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  confirmTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#d9534f',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
  },
  confirmButtonText: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  emptyText: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 5,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  placeholderText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 4,
  },


  newBoostOption: {
    backgroundColor: '#fff8e1',
  },

  // Custom Confetti Styles
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -50,
  },

  // Boost Success Modal Styles
  boostSuccessOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  boostSuccessContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  boostSuccessIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  boostSuccessGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#FFD700',
    borderRadius: 50,
    opacity: 0.3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  boostSuccessTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  boostSuccessMessage: {
    fontSize: 16,
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  boostSuccessDetails: {
    width: '100%',
    marginBottom: 25,
  },
  boostSuccessDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginVertical: 4,
  },
  boostSuccessDetailText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 12,
    fontWeight: '500',
  },
  boostSuccessFooter: {
    fontSize: 13,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  boostSuccessButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  boostSuccessButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyAdsPage;