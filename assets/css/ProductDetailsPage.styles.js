import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    container: {
        paddingBottom: normalize(80),
    },
    galleryContainer: {
        height: normalize(250),
        position: 'relative',
    },
    galleryImage: {
        width: width,
        height: '100%',
        resizeMode: 'cover',
    },
    noImageContainer: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
    },
    noImageText: {
        marginTop: normalize(8),
        color: '#8E8E93',
        fontSize: normalize(14),
    },
    imageIndicator: {
        position: 'absolute',
        bottom: normalize(12),
        flexDirection: 'row',
        alignSelf: 'center',
    },
    indicatorDot: {
        width: normalize(6),
        height: normalize(6),
        borderRadius: normalize(3),
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: normalize(3),
    },
    activeDot: {
        backgroundColor: '#FFFFFF',
        width: normalize(10),
    },
    productTag: {
        position: 'absolute',
        top: normalize(16),
        left: normalize(16),
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(4),
        borderRadius: normalize(3),
        zIndex: 2,
    },
    rentTag: {
        backgroundColor: 'rgba(0, 184, 148, 0.9)',
    },
    sellTag: {
        backgroundColor: 'rgba(255, 71, 87, 0.9)',
    },
    tagText: {
        color: '#FFFFFF',
        fontSize: normalize(10),
        fontWeight: 'bold',
    },
    headerContainer: {
        padding: normalize(16),
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: normalize(8),
    },
    titleText: {
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: normalize(12),
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: normalize(4),
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: normalize(16),
        marginBottom: normalize(4),
    },
    metaText: {
        marginLeft: normalize(4),
        fontSize: normalize(12),
        color: '#8E8E93',
    },
    section: {
        backgroundColor: '#FFFFFF',
        padding: normalize(16),
        marginTop: normalize(8),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    detailsSection: {
        backgroundColor: '#FFFFFF',
        padding: normalize(16),
    },
    sectionTitle: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: normalize(12),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    descriptionText: {
        fontSize: normalize(13),
        lineHeight: normalize(18),
        color: '#3A3A3A',
    },
    sellerImage: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        marginRight: normalize(12),
    },
    sellerInfo: {
        flex: 1,
    },
    sellerName: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: normalize(2),
    },
    sellerMeta: {
        fontSize: normalize(12),
        color: '#8E8E93',
    },
    mapContainer: {
        height: normalize(150),
        borderRadius: normalize(8),
        overflow: 'hidden',
        marginTop: normalize(8),
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    addressOverlay: {
        position: 'absolute',
        bottom: normalize(8),
        left: normalize(8),
        right: normalize(8),
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: normalize(8),
        borderRadius: normalize(4),
    },
    addressText: {
        fontSize: normalize(12),
        color: '#1A1A1A',
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: normalize(12),
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: normalize(10),
        borderRadius: normalize(6),
        marginHorizontal: normalize(4),
    },
    chatButton: {
        backgroundColor: '#007AFF',
    },
    callButton: {
        backgroundColor: '#34C759',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(14),
        fontWeight: '500',
        marginLeft: normalize(6),
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: normalize(12),
        backgroundColor: '#FFFFFF',
    },
    reportButtonText: {
        color: '#FF3B30',
        fontSize: normalize(12),
        fontWeight: '500',
        marginLeft: normalize(6),
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },

    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: normalize(8),
        backgroundColor: '#F8F8F8',
        borderRadius: normalize(8),
    },
    sellerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto', // This pushes the actions to the right
    },
    followSellerButton: {
        padding: normalize(8),
        marginRight: normalize(8),
    },
    chatIcon: {
        padding: normalize(8),
    },


    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    priceContainer: {
        marginTop: 12,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        alignItems: 'center',
    },
    priceText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2e7d32', // dark green
    }
});

export default styles;