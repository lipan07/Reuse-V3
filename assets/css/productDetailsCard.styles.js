import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

export default StyleSheet.create({
    container: {
        padding: normalize(12),
        backgroundColor: '#fff',
        borderRadius: normalize(12),
        marginVertical: normalizeVertical(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: normalizeVertical(2) },
        shadowOpacity: 0.1,
        shadowRadius: normalize(4),
        elevation: 3,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    detailItem: {
        width: '48%', // Two items per row with small gap
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: normalizeVertical(8),
        paddingHorizontal: normalize(4),
        marginBottom: normalizeVertical(8),
        backgroundColor: '#f9f9f9',
        borderRadius: normalize(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: normalizeVertical(1) },
        shadowOpacity: 0.05,
        shadowRadius: normalize(2),
        elevation: 2,
    },
    iconContainer: {
        width: normalize(32),
        height: normalize(32),
        borderRadius: normalize(16),
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(10),
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: normalize(12),
        color: '#666',
        marginBottom: normalizeVertical(2),
    },
    value: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#333',
    },
    // Additional styles for price display
    priceContainer: {
        marginTop: normalizeVertical(12),
        padding: normalize(10),
        backgroundColor: '#f5f5f5',
        borderRadius: normalize(8),
        alignItems: 'center',
    },
    priceText: {
        fontSize: normalize(18),
        fontWeight: '700',
        color: '#2e7d32',
    },
    // Tag styling
    tag: {
        paddingHorizontal: normalize(8),
        paddingVertical: normalizeVertical(4),
        borderRadius: normalize(4),
        alignSelf: 'flex-start',
    },
    tagText: {
        fontSize: normalize(12),
        fontWeight: '600',
        color: 'white',
    },
    // Special value styling
    highlightValue: {
        color: '#2e7d32',
        fontWeight: '700',
    },
    lowValue: {
        color: '#d32f2f',
        fontWeight: '700',
    },
    featuresContainer: {
        marginTop: normalizeVertical(12),
        padding: normalize(12),
        backgroundColor: '#f5f5f5',
        borderRadius: normalize(8),
    },
    sectionTitle: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#333',
        marginBottom: normalizeVertical(6),
    },
    featuresText: {
        fontSize: normalize(13),
        color: '#555',
        lineHeight: normalize(18),
    },
    electricHighlight: {
        color: '#3f51b5',
        fontWeight: '700',
    },

    pestControlItem: {
        backgroundColor: '#f3e5f5', // Light purple background for pest control items
    },
    descriptionContainer: {
        marginTop: normalizeVertical(12),
        padding: normalize(12),
        backgroundColor: '#f5f5f5',
        borderRadius: normalize(8),
    },
    descriptionText: {
        fontSize: normalize(13),
        color: '#555',
        lineHeight: normalize(18),
    },
    serviceHighlight: {
        color: '#4caf50',
        fontWeight: '700',
    },

    sectionContainer: {
        marginTop: normalizeVertical(12),
        padding: normalize(12),
        backgroundColor: '#f5f5f5',
        borderRadius: normalize(8),
    },
    contactGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    contactItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: normalizeVertical(6),
        marginBottom: normalizeVertical(6),
    },
    featuresText: {
        fontSize: normalize(13),
        color: '#555',
        lineHeight: normalize(18),
        marginTop: normalizeVertical(4),
    },
    machineryHighlight: {
        color: '#ff6d00',
        fontWeight: '700',
    },

    sectionContainer: {
        marginTop: normalizeVertical(12),
        padding: normalize(12),
        backgroundColor: '#f5f5f5',
        borderRadius: normalize(8),
    },
    instructorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    descriptionText: {
        fontSize: normalize(13),
        color: '#555',
        lineHeight: normalize(18),
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#5c6bc0',
        padding: normalize(12),
        borderRadius: normalize(8),
        marginTop: normalizeVertical(12),
    },
    contactButtonText: {
        color: '#fff',
        fontSize: normalize(14),
        fontWeight: '600',
        marginLeft: normalize(8),
    },
    educationHighlight: {
        color: '#5c6bc0',
        fontWeight: '700',
    },
    highlightValue: {
        color: '#2e7d32', // Green for positive highlights
        fontWeight: '600'
    },
    errorText: {
        color: '#d32f2f',
        textAlign: 'center',
        padding: 12
    },
    landPlotHighlight: {
        color: '#8d6e63',  // Earth tone for land-related highlights
        fontWeight: '700'
    },
    areaHighlight: {
        color: '#4caf50',  // Green for area measurements
        fontWeight: '600'
    },
    serviceHighlight: {
        color: '#3f51b5',  // Professional blue for legal services
        fontWeight: '700'
    },
    legalHighlight: {
        color: '#5c6bc0',  // Complementary blue for important info
        fontWeight: '600'
    },
    mobileHighlight: {
        color: '#2196f3',  // Blue for tech highlights
        fontWeight: '700'
    },
    batteryHighlight: {
        color: '#4caf50',  // Green for good battery
        fontWeight: '600'
    },
    detailItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginBottom: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    highlightValue: {
        color: '#2e7d32', // Green for positive highlights
        fontWeight: '700'
    },
    sectionContainer: {
        marginTop: normalizeVertical(12),
        padding: normalize(12),
        backgroundColor: '#f5f5f5',
        borderRadius: normalize(8)
    },
    sectionTitle: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#333',
        marginBottom: normalizeVertical(6)
    },
    descriptionText: {
        fontSize: normalize(13),
        color: '#555',
        lineHeight: normalize(18)
    },
    fullWidthContainer: {
        flexDirection: 'row', // Change from default grid layout
        width: '100%',       // Take full width
    },
    fullWidthItem: {
        width: '100%',       // Item takes full width
        flexDirection: 'row', // Align icon and text horizontally
        alignItems: 'center', // Center vertically
        paddingVertical: 12,  // Add some vertical padding
    },
    renovationItem: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    // Others component styles - using existing section styles
    section: {
        backgroundColor: '#FFFFFF',
        padding: normalize(16),
        marginHorizontal: normalize(16),
        marginTop: normalize(8),
        borderRadius: normalize(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#333',
        marginBottom: normalize(8),
    },
    othersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    othersItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: normalize(6),
        paddingHorizontal: normalize(6),
        marginBottom: normalize(6),
        backgroundColor: '#f8f9fa',
        borderRadius: normalize(6),
        borderWidth: 0.5,
        borderColor: '#e9ecef',
    },
    othersIconContainer: {
        width: normalize(24),
        height: normalize(24),
        borderRadius: normalize(12),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(6),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    othersTextContainer: {
        flex: 1,
    },
    othersLabel: {
        fontSize: normalize(9),
        color: '#6c757d',
        marginBottom: normalize(1),
        fontWeight: '500',
    },
    othersValue: {
        fontSize: normalize(11),
        fontWeight: '600',
        color: '#333',
    },
    othersHighlightValue: {
        color: '#28a745',
        fontWeight: '700',
    },
});