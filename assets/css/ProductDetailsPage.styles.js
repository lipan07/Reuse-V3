import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scale = size => width / 360 * size; // 360 is standard mobile screen width
const verticalScale = size => height / 640 * size; // 640 is standard mobile screen height

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContainer: {
        paddingBottom: verticalScale(80), // Adjusted for button height
    },
    imageGallery: {
        height: width * 0.9, // 60% of screen width
    },
    galleryImage: {
        width: width,
        height: width * 0.9,
        resizeMode: 'cover',
    },
    detailsSection: {
        backgroundColor: '#ffffff',
        marginHorizontal: scale(16),
        marginVertical: verticalScale(8),
    },
    mapContainer: {
        height: verticalScale(180),
        marginHorizontal: scale(16),
        marginVertical: verticalScale(8),
        backgroundColor: '#fff',
        borderRadius: scale(8),
        overflow: 'hidden', // Ensures the map corners are rounded
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: scale(4),
        elevation: 2,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: scale(8), // Not strictly needed with overflow: 'hidden', but safe
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: scale(8),
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(10),
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -verticalScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: scale(4),
        elevation: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(10),
        borderRadius: scale(6),
    },
    buttonText: {
        color: '#fff',
        fontSize: scale(14),
        fontWeight: '600',
        marginLeft: scale(6),
    },
    chatButton: {
        backgroundColor: '#007bff',
    },
    callButton: {
        backgroundColor: '#27ae60',
    },
    // Loading states
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    loadingText: {
        marginTop: verticalScale(12),
        fontSize: scale(14),
        color: '#666',
    },
    // Product details
    priceText: {
        fontSize: scale(22),
        fontWeight: '700',
        color: '#2ecc71',
        marginVertical: verticalScale(8),
    },
    titleText: {
        fontSize: scale(20),
        fontWeight: '600',
        color: '#1a1a1a',
        marginVertical: verticalScale(8),
    },
    descriptionText: {
        fontSize: scale(15),
        color: '#444',
        lineHeight: scale(22),
        marginVertical: verticalScale(8),
    },
    specContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: verticalScale(4),
    },
    specLabel: {
        fontSize: scale(14),
        color: '#666',
        flex: 1,
    },
    specValue: {
        fontSize: scale(14),
        color: '#1a1a1a',
        flex: 1,
        textAlign: 'right',
    },
    sectionContainer: {
        marginHorizontal: scale(16),
        marginVertical: verticalScale(12),
        padding: scale(16),
        backgroundColor: '#ffffff',
        borderRadius: scale(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: scale(4),
        elevation: 2,
    },
    sectionTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: verticalScale(12),
    },
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerImage: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        marginRight: scale(12),
    },
    sellerInfo: {
        flex: 1,
    },
    sellerName: {
        fontSize: scale(16),
        fontWeight: '600',
        color: '#1a1a1a',
    },
    postedText: {
        fontSize: scale(12),
        color: '#666',
        marginTop: verticalScale(2),
    },
    followButton: {
        padding: scale(8),
    },
    addressContainer: {
        marginHorizontal: scale(16),
        marginVertical: verticalScale(8),
        width: '100%',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
    },
    mapAddressOverlay: {
        position: 'absolute',
        top: verticalScale(12),
        left: scale(12),
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(8),
        maxWidth: '80%',
        zIndex: 10,
    },
    mapAddressText: {
        color: '#222',
        fontSize: scale(13),
        fontWeight: '500',
    },
    // Add platform-specific styles where needed
    ...Platform.select({
        ios: {
            safeArea: {
                flex: 1,
                backgroundColor: '#007BFF',
            },
        },
        android: {
            safeArea: {
                flex: 1,
            },
        },
    }),
    noImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },

    noImageText: {
        color: '#7f8c8d',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 16,
    },

    reportLinkContainer: {
        alignItems: 'flex-end',
        marginTop: 8,
        marginRight: 16,
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 22,
        shadowColor: 'red',
        shadowOpacity: 0.18,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    reportButtonText: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 15,
        letterSpacing: 0.2,
    },

});

export default styles;