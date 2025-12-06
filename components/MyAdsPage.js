import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Modal, TouchableWithoutFeedback, ActivityIndicator, Dimensions, Animated, Platform, ScrollView } from 'react-native';
import BottomNavBar from './BottomNavBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

// Responsive scaling functions
const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

// Get safe area insets for different devices
const isIphoneX = Platform.OS === 'ios' && (height >= 812 || width >= 812);
const bottomSafeArea = isIphoneX ? 34 : 0;

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

        // Debug: Log first product structure
        if (newProducts.length > 0) {
          console.log('First product structure:', JSON.stringify(newProducts[0], null, 2));
          console.log('Amount location:', {
            'post_details.amount': newProducts[0].post_details?.amount,
            'amount': newProducts[0].amount,
            'price': newProducts[0].price
          });
        }

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
          title: 'Listing Removed',
          textBody: 'Your ad has been successfully removed from the marketplace.',
          button: 'OK',
        });
      } else {
        throw new Error('Failed to remove the listing');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      Dialog.show({
        type: ALERT_TYPE.ERROR,
        title: 'Unable to Remove',
        textBody: 'We couldn\'t remove your listing. Please check your connection and try again.',
        button: 'Retry',
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

    // Get amount from different possible locations
    const amount = item.post_details?.amount || item.amount || item.price || '0';

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
          <Text style={styles.price}>Price: ₹{amount}</Text>
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
    setShowBoostSuccess(true);
    hidePopup();

    setTimeout(() => {
      setShowConfetti(false);
      setConfettiParticles([]);
      setShowBoostSuccess(false);
    }, 3000);
  };

  return (
    <View style={styles.container}>
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

      {/* Modern Bottom Sheet Action Modal */}
      <Modal
        visible={isPopupVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={hidePopup}
      >
        <TouchableWithoutFeedback onPress={hidePopup}>
          <View style={styles.modernModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modernBottomSheet}>
                {/* Drag Handle */}
                <View style={styles.dragHandle} />

                {/* Product Preview Card */}
                {selectedProduct && (
                  <View style={styles.productPreviewCard}>
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <Image
                        source={{ uri: selectedProduct.images[0] }}
                        style={styles.previewImageLarge}
                      />
                    ) : (
                        <View style={styles.previewImageLargePlaceholder}>
                          <Icon name="image" size={40} color="#CCC" />
                      </View>
                    )}
                    <View style={styles.productInfoCard}>
                      <Text style={styles.productTitleLarge} numberOfLines={2}>
                        {selectedProduct.title}
                      </Text>
                      <View style={styles.priceTagContainer}>
                        <Text style={styles.priceTagLabel}>Price</Text>
                        <Text style={styles.priceTagValue}>
                          ₹{selectedProduct.post_details?.amount || selectedProduct.amount || selectedProduct.price || '0'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Quick Actions Title */}
                <Text style={styles.actionsTitle}>Quick Actions</Text>

                {/* Action Buttons - List Style */}
                <View style={styles.actionsList}>
                  <TouchableOpacity
                    style={styles.actionListItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      hidePopup();
                      setTimeout(() => {
                        navigation.navigate('ProductDetails', { productDetails: selectedProduct });
                      }, 300);
                    }}
                  >
                    <View style={[styles.actionListIcon, { backgroundColor: '#EBF5FF' }]}>
                      <Icon name="eye" size={20} color="#007BFF" />
                    </View>
                    <View style={styles.actionListContent}>
                      <Text style={styles.actionListTitle}>View Ad</Text>
                      <Text style={styles.actionListSubtitle}>See how others see it</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#CCC" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionListItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      hidePopup();
                      setTimeout(() => {
                        navigation.navigate('MyFollowersPage', { product: selectedProduct });
                      }, 300);
                    }}
                  >
                    <View style={[styles.actionListIcon, { backgroundColor: '#FCE8F3' }]}>
                      <Icon name="heart" size={20} color="#EC4899" />
                    </View>
                    <View style={styles.actionListContent}>
                      <Text style={styles.actionListTitle}>Interested Users</Text>
                      <Text style={styles.actionListSubtitle}>View who liked your ad</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#CCC" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionListItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      hidePopup();
                      setTimeout(() => {
                        const editComponent = getComponentForCategory(selectedProduct.category.guard_name);
                        navigation.navigate(editComponent, { category: [], subcategory: selectedProduct.category, product: selectedProduct });
                      }, 300);
                    }}
                  >
                    <View style={[styles.actionListIcon, { backgroundColor: '#ECFDF5' }]}>
                      <Icon name="pencil" size={20} color="#10B981" />
                    </View>
                    <View style={styles.actionListContent}>
                      <Text style={styles.actionListTitle}>Edit Listing</Text>
                      <Text style={styles.actionListSubtitle}>Update details & photos</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#CCC" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionListItem, styles.promoteBadge]}
                    activeOpacity={0.7}
                    onPress={handleBoost}
                  >
                    <View style={[styles.actionListIcon, { backgroundColor: '#FFF7ED' }]}>
                      <Icon name="rocket" size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.actionListContent}>
                      <View style={styles.promoteHeader}>
                        <Text style={styles.actionListTitle}>Promote Ad</Text>
                        <View style={styles.promoBadge}>
                          <Text style={styles.promoBadgeText}>24h</Text>
                        </View>
                      </View>
                      <Text style={styles.actionListSubtitle}>Get 10x more visibility</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="#CCC" />
                  </TouchableOpacity>
                </View>

                {/* Danger Zone */}
                <View style={styles.dangerZone}>
                  <TouchableOpacity
                    style={styles.deleteActionItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      hidePopup();
                      showDeleteConfirmModal();
                    }}
                  >
                    <Icon name="trash-o" size={20} color="#EF4444" />
                    <Text style={styles.deleteActionText}>Delete Listing</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modern Delete Confirmation Modal */}
      <Modal
        visible={isDeleteConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideDeleteConfirmModal}
      >
        <TouchableWithoutFeedback onPress={hideDeleteConfirmModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmContainer}>
              <View style={styles.confirmIconWrapper}>
                <Icon name="exclamation-triangle" size={36} color="#FF3B30" />
              </View>
              <Text style={styles.confirmTitle}>Remove Listing?</Text>
              <Text style={styles.confirmSubtitle}>This will permanently delete your ad. All views, likes, and messages associated with this listing will be lost.</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.confirmCancelButton} onPress={hideDeleteConfirmModal}>
                  <Text style={styles.confirmCancelButtonText}>Keep It</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={confirmDelete}>
                  <Text style={styles.confirmButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Confetti Overlay */}
      {showConfetti && (
        <View style={styles.confettiContainer}>
          {confettiParticles.map((particle) => (
            <ConfettiParticle key={particle.id} particle={particle} />
          ))}
        </View>
      )}

      {/* Modern Boost Success Modal */}
      {showBoostSuccess && (
        <Modal
          visible={showBoostSuccess}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowBoostSuccess(false)}
        >
          <View style={styles.boostSuccessOverlay}>
            <Animated.View style={styles.boostSuccessContainer}>
              {/* Rocket Icon with Pulse */}
              <View style={styles.boostIconCircle}>
                <Icon name="rocket" size={normalize(36)} color="#FFA000" />
              </View>

              <Text style={styles.boostSuccessTitle}>Ad Promoted!</Text>
              <Text style={styles.boostSuccessSubtitle}>
                Your listing is now featured at the top of search results
              </Text>

              {/* 24 Hour Badge */}
              <View style={styles.boostTimeBadge}>
                <Icon name="clock-o" size={normalize(16)} color="#FFA000" />
                <Text style={styles.boostTimeText}>Promoted for 24 hours</Text>
              </View>

              {/* Benefits Compact */}
              <View style={styles.boostBenefitsCompact}>
                <View style={styles.boostBenefitItem}>
                  <View style={styles.boostBenefitIcon}>
                    <Icon name="eye" size={normalize(14)} color="#007BFF" />
                  </View>
                  <Text style={styles.boostBenefitText}>10x visibility</Text>
                </View>
                <View style={styles.boostBenefitItem}>
                  <View style={styles.boostBenefitIcon}>
                    <Icon name="arrow-up" size={normalize(14)} color="#4CAF50" />
                  </View>
                  <Text style={styles.boostBenefitText}>Top position</Text>
                </View>
                <View style={styles.boostBenefitItem}>
                  <View style={styles.boostBenefitIcon}>
                    <Icon name="users" size={normalize(14)} color="#9C27B0" />
                  </View>
                  <Text style={styles.boostBenefitText}>More buyers</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.boostSuccessButton}
                onPress={() => setShowBoostSuccess(false)}
              >
                <Text style={styles.boostSuccessButtonText}>Awesome!</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      )}
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
  // Modern Bottom Sheet Styles
  modernModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modernBottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: normalize(24),
    borderTopRightRadius: normalize(24),
    paddingTop: normalizeVertical(12),
    paddingBottom: Platform.select({
      ios: normalizeVertical(20) + bottomSafeArea,
      android: normalizeVertical(20),
      default: normalizeVertical(20),
    }),
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  dragHandle: {
    width: normalize(40),
    height: normalizeVertical(4),
    backgroundColor: '#E5E7EB',
    borderRadius: normalize(2),
    alignSelf: 'center',
    marginBottom: normalizeVertical(20),
  },
  productPreviewCard: {
    marginHorizontal: normalize(20),
    marginBottom: normalizeVertical(20),
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: normalize(16),
    padding: normalize(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewImageLarge: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(12),
    backgroundColor: '#F3F4F6',
  },
  previewImageLargePlaceholder: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(12),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfoCard: {
    flex: 1,
    marginLeft: normalize(12),
    justifyContent: 'space-between',
  },
  productTitleLarge: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: '#111827',
    lineHeight: normalize(22),
  },
  priceTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: normalize(12),
    paddingVertical: normalizeVertical(6),
    borderRadius: normalize(8),
    alignSelf: 'flex-start',
  },
  priceTagLabel: {
    fontSize: normalize(11),
    fontWeight: '600',
    color: '#059669',
    marginRight: normalize(4),
  },
  priceTagValue: {
    fontSize: normalize(16),
    fontWeight: '800',
    color: '#047857',
  },
  actionsTitle: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#6B7280',
    marginLeft: normalize(20),
    marginBottom: normalizeVertical(12),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionsList: {
    marginHorizontal: normalize(20),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    overflow: 'hidden',
  },
  actionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalizeVertical(16),
    paddingHorizontal: normalize(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  promoteBadge: {
    borderBottomWidth: 0,
  },
  actionListIcon: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionListContent: {
    flex: 1,
    marginLeft: normalize(12),
  },
  actionListTitle: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: normalizeVertical(2),
  },
  actionListSubtitle: {
    fontSize: normalize(13),
    color: '#6B7280',
    lineHeight: normalize(18),
  },
  promoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: normalize(6),
    paddingVertical: normalizeVertical(2),
    borderRadius: normalize(4),
    marginLeft: normalize(6),
  },
  promoBadgeText: {
    fontSize: normalize(10),
    fontWeight: '700',
    color: '#D97706',
  },
  dangerZone: {
    marginTop: normalizeVertical(16),
    marginHorizontal: normalize(20),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: normalizeVertical(16),
  },
  deleteActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalizeVertical(14),
    backgroundColor: '#FEF2F2',
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deleteActionText: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: normalize(8),
  },
  confirmContainer: {
    backgroundColor: '#fff',
    padding: normalize(20),
    borderRadius: normalize(18),
    alignItems: 'center',
    width: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  confirmIconWrapper: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(32),
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalizeVertical(14),
  },
  confirmTitle: {
    fontSize: normalize(19),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: normalizeVertical(8),
    textAlign: 'center',
  },
  confirmSubtitle: {
    fontSize: normalize(13),
    color: '#666',
    textAlign: 'center',
    marginBottom: normalizeVertical(20),
    lineHeight: normalize(18),
    paddingHorizontal: normalize(8),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmCancelButton: {
    flex: 1,
    marginRight: normalize(6),
    paddingVertical: normalizeVertical(12),
    paddingHorizontal: normalize(12),
    backgroundColor: '#F5F5F5',
    borderRadius: normalize(10),
    alignItems: 'center',
  },
  confirmCancelButtonText: {
    color: '#666',
    fontSize: normalize(15),
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    marginLeft: normalize(6),
    paddingVertical: normalizeVertical(12),
    paddingHorizontal: normalize(12),
    backgroundColor: '#FF3B30',
    borderRadius: normalize(10),
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(15),
    fontWeight: '600',
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

  // Modern Boost Success Modal Styles
  boostSuccessOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  boostSuccessContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(20),
    padding: normalize(24),
    alignItems: 'center',
    width: '85%',
    maxWidth: normalize(340),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  boostIconCircle: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: normalize(36),
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalizeVertical(16),
    borderWidth: 3,
    borderColor: '#FFE082',
  },
  boostSuccessTitle: {
    fontSize: normalize(22),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: normalizeVertical(6),
    textAlign: 'center',
  },
  boostSuccessSubtitle: {
    fontSize: normalize(13),
    color: '#666',
    textAlign: 'center',
    marginBottom: normalizeVertical(16),
    lineHeight: normalize(18),
    paddingHorizontal: normalize(8),
  },
  boostTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingVertical: normalizeVertical(8),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(20),
    marginBottom: normalizeVertical(16),
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  boostTimeText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#F57C00',
    marginLeft: normalize(6),
  },
  boostBenefitsCompact: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: normalizeVertical(20),
  },
  boostBenefitItem: {
    alignItems: 'center',
    flex: 1,
  },
  boostBenefitIcon: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalizeVertical(4),
  },
  boostBenefitText: {
    fontSize: normalize(11),
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  boostSuccessButton: {
    backgroundColor: '#FFA000',
    paddingVertical: normalizeVertical(12),
    paddingHorizontal: normalize(48),
    borderRadius: normalize(24),
    shadowColor: '#FFA000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  boostSuccessButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '700',
  },
});

export default MyAdsPage;