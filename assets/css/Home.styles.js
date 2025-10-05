import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  bannerAdContainer: {
    marginHorizontal: -normalize(8),
    marginBottom: normalize(8),
  },
  bannerAd: {
    alignSelf: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(8),
    paddingVertical: normalizeVertical(3),
    marginTop: normalizeVertical(5),      // Add or adjust this for top margin
    marginBottom: normalizeVertical(5),   // Add or adjust this for bottom margin
    marginHorizontal: normalize(2),
  },
  searchInput: {
    flex: 1,
    height: normalizeVertical(38), // Slightly taller for all screens
    paddingHorizontal: normalize(12), // More horizontal padding
    fontSize: normalize(14), // Slightly larger font
    backgroundColor: '#fff',
    borderRadius: normalize(6),
    color: '#222',
    // Ensure placeholder is not cut off
    includeFontPadding: false,
    paddingVertical: 0, // Remove vertical padding for better alignment
  },
  clearButton: { position: 'absolute', right: normalize(85), padding: normalize(4) },
  searchButton: {
    backgroundColor: '#007bff',
    padding: normalize(8),
    borderRadius: normalize(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: normalize(4),
  },
  filterButton: {
    backgroundColor: '#007bff',
    padding: normalize(8),
    borderRadius: normalize(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: normalize(4),
  },
  recentSearchOverlay: {
    position: 'absolute',
    top: normalizeVertical(55),
    left: normalize(8),
    right: normalize(8),
    backgroundColor: '#FFF',
    borderRadius: normalize(4),
    padding: normalize(8),
    opacity: 0.95,
    zIndex: 1,
  },
  productList: {
    paddingHorizontal: normalize(4),
    paddingBottom: normalizeVertical(48),
    paddingTop: normalizeVertical(8),
  },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  noProductsText: { fontSize: normalize(11), textAlign: 'center', marginTop: normalizeVertical(12) },
  recentSearchItem: {
    paddingVertical: normalizeVertical(5),
    fontSize: normalize(11),
    color: '#007bff',
  },
  filterBadgeText: {
    color: '#fff',
    marginRight: normalize(5),
    fontSize: normalize(9),
  },
  loaderTop: { marginBottom: normalize(8) },
  loaderBottom: { marginTop: normalize(8) },
  filterBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: normalize(6),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    borderRadius: normalize(12),
    paddingVertical: normalizeVertical(3),
    paddingHorizontal: normalize(8),
    margin: normalize(3),
  },
  recommendedText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#666',
    marginVertical: normalizeVertical(12),
    marginHorizontal: normalize(12),
  },
  noImageContainer: {
    width: '100%',
    height: normalizeVertical(90),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    borderRadius: normalize(4),
    marginBottom: normalize(6),
  },
  noImageText: {
    color: '#777',
    fontSize: normalize(12),
    textAlign: 'center',
    paddingHorizontal: normalize(4),
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7ff',
    padding: normalize(6),
  },
  productItem: {
    flex: 1,
    margin: normalize(4),
    borderRadius: normalize(4),
    padding: normalize(6), // Reduced padding
    backgroundColor: '#f7f7f7ff',
    shadowColor: '#565656',
    shadowOffset: { width: 0, height: normalizeVertical(2) }, // Smaller shadow
    shadowOpacity: 0.1,
    shadowRadius: normalize(4),
    elevation: 4,
  },

  imageContainer: {
    height: normalizeVertical(100), // Reduced height
    width: '100%',
    borderRadius: normalize(4),
    overflow: 'hidden',
    marginBottom: normalize(4) // Reduced margin
  },

  textContainer: {
    paddingHorizontal: normalize(4),
  },

  productName: {
    fontWeight: '600',
    fontSize: normalize(14), // Smaller font
    marginTop: normalizeVertical(2),
    color: '#333',
  },

  details: {
    fontSize: normalize(12), // Smaller font
    marginTop: normalizeVertical(2),
    marginBottom: normalizeVertical(2),
    color: '#666',
    lineHeight: normalize(14),
  },

  priceAddressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalizeVertical(2),
  },

  price: {
    fontSize: normalize(13), // Smaller font
    fontWeight: 'bold',
    color: '#007bff',
  },

  address: {
    fontSize: normalize(10),
    color: '#888',
    flexShrink: 1,
    marginLeft: normalize(4),
    fontStyle: 'normal',
  },


  placeholderText: {
    fontSize: normalize(11), // Smaller font
    color: '#555',
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popupContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  popupButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  popupButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  productTag: {
    position: 'absolute',
    top: 3,
    left: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 2, // Make sure it appears above the image
  },
  rentTag: {
    backgroundColor: 'rgba(76, 175, 79, 0.53)', // Green with 80% opacity
  },
  sellTag: {
    backgroundColor: 'rgba(255, 86, 34, 0.54)', // Orange with 80% opacity
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Distance Badge Styles
  distanceBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 2,
  },

  distanceText: {
    color: '#fff',
    fontSize: normalize(9),
    fontWeight: 'bold',
    marginLeft: 2,
  },

  // Location and Distance Container
  locationDistanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalizeVertical(4),
    marginBottom: normalizeVertical(2),
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  distanceInfo: {
    fontSize: normalize(9),
    color: '#007bff',
    fontWeight: '600',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(8),
    overflow: 'hidden',
  },

  // Add to Home.styles.js
  filterBarContainer: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(8),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  activeFiltersText: {
    fontSize: normalize(12),
    color: '#666',
    marginRight: normalize(6),
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    borderRadius: normalize(12),
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(8),
    margin: normalize(3),
  },
  filterPillText: {
    color: '#fff',
    fontSize: normalize(10),
    marginRight: normalize(4),
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(6),
  },
  filterToggleText: {
    color: '#007bff',
    fontSize: normalize(12),
    fontWeight: '500',
    marginRight: normalize(4),
  },
  quickFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: normalize(8),
    paddingHorizontal: normalize(20),
  },
  quickFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(6),
  },
  quickFilterText: {
    color: '#007bff',
    fontSize: normalize(12),
    marginLeft: normalize(4),
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    backgroundColor: '#fff',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    marginRight: normalize(8),
    minHeight: normalize(40),
  },
  searchInput: {
    flex: 1,
    height: normalize(40),
    fontSize: normalize(14),
    color: '#333',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchButton: {
    paddingHorizontal: normalize(12),
    height: normalize(40),
    borderRadius: normalize(8),
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(8),
    minWidth: normalize(40),
  },
  searchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButtonIcon: {
    // marginRight: 6,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: normalize(14),
    fontWeight: '500',
  },
  filterButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(8),
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: normalize(10),
    fontWeight: 'bold',
  },
});