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
    backgroundColor: '#e0e0e0',
    padding: normalize(6),
  },
  productItem: {
    flex: 1,
    margin: normalize(4),
    borderRadius: normalize(4),
    padding: normalize(6), // Reduced padding
    backgroundColor: '#F9F9F9',
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
    marginLeft: normalize(6),
    fontStyle: 'italic',
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

});