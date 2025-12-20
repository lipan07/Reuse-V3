import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const LEFT_PANEL_WIDTH = width * 0.32;

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'ios' ? normalizeVertical(50) : normalize(12),
    },

    // Content
    content: {
        flex: 1,
    },
    splitContainer: {
        flex: 1,
        flexDirection: 'row',
    },

    // Left Panel - Categories
    leftPanel: {
        width: LEFT_PANEL_WIDTH,
        backgroundColor: '#F8FAFC',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    panelTitle: {
        fontSize: normalize(13),
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(14),
        backgroundColor: '#F1F5F9',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    categoryScroll: {
        flex: 1,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: normalize(12),
        paddingHorizontal: normalize(10),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    categoryItemSelected: {
        backgroundColor: '#2563eb',
        borderBottomColor: '#1D4ED8',
    },
    categoryIconWrapper: {
        width: normalize(32),
        height: normalize(32),
        borderRadius: normalize(8),
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: normalize(8),
    },
    categoryText: {
        flex: 1,
        fontSize: normalize(11),
        fontWeight: '500',
        color: '#374151',
    },
    categoryTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    selectedIndicator: {
        width: normalize(18),
        height: normalize(18),
        borderRadius: normalize(9),
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Right Panel - Filters
    rightPanel: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: normalize(16),
    },
    filterSection: {
        marginTop: normalize(18),
    },
    sectionTitle: {
        fontSize: normalize(13),
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: normalize(10),
        letterSpacing: 0.2,
    },

    // Search Input
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: normalize(10),
        paddingHorizontal: normalize(12),
        height: normalize(44),
    },
    searchIcon: {
        marginRight: normalize(8),
    },
    searchInput: {
        flex: 1,
        fontSize: normalize(14),
        color: '#1F2937',
        paddingVertical: 0,
    },

    // Address/Location
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: normalize(10),
        paddingLeft: normalize(12),
        minHeight: normalize(44),
    },
    locationIcon: {
        marginRight: normalize(8),
    },
    addressInput: {
        flex: 1,
        fontSize: normalize(14),
        color: '#1F2937',
        paddingVertical: normalize(12),
        paddingRight: normalize(12),
    },

    // Location Input
    locationContainer: {
        marginBottom: 0,
        zIndex: 100,
    },
    locationInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: normalize(10),
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(12),
        fontSize: normalize(14),
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    locationPredictions: {
        position: 'absolute',
        top: normalize(48),
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(10),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: normalize(180),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
    },
    locationPredictionItem: {
        paddingVertical: normalize(12),
        paddingHorizontal: normalize(14),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    locationPredictionText: {
        fontSize: normalize(13),
        color: '#374151',
        lineHeight: normalize(18),
    },

    // Chips
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -normalize(4),
    },
    chip: {
        backgroundColor: '#F3F4F6',
        borderRadius: normalize(20),
        paddingVertical: normalize(8),
        paddingHorizontal: normalize(14),
        margin: normalize(4),
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    chipSelected: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    chipText: {
        fontSize: normalize(12),
        fontWeight: '500',
        color: '#6B7280',
    },
    chipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Price Range Slider
    priceDisplayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(16),
    },
    priceDisplayBox: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: normalize(10),
        paddingVertical: normalize(10),
        paddingHorizontal: normalize(12),
        alignItems: 'center',
    },
    priceDisplayLabel: {
        fontSize: normalize(10),
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: normalize(2),
    },
    priceDisplayValue: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#1F2937',
    },
    priceDisplayDash: {
        fontSize: normalize(16),
        color: '#9CA3AF',
        marginHorizontal: normalize(10),
    },
    sliderContainer: {
        height: normalize(40),
        justifyContent: 'center',
        position: 'relative',
    },
    sliderTrack: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: normalize(4),
        backgroundColor: '#E5E7EB',
        borderRadius: normalize(2),
    },
    sliderFill: {
        position: 'absolute',
        height: normalize(4),
        backgroundColor: '#2563eb',
        borderRadius: normalize(2),
    },
    sliderThumb: {
        position: 'absolute',
        width: normalize(24),
        height: normalize(24),
        borderRadius: normalize(12),
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
        marginLeft: -normalize(12),
    },
    thumbInner: {
        width: normalize(10),
        height: normalize(10),
        borderRadius: normalize(5),
        backgroundColor: '#2563eb',
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: normalize(8),
    },
    sliderLabelText: {
        fontSize: normalize(11),
        color: '#9CA3AF',
        fontWeight: '500',
    },

    // Legacy price inputs
    priceRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceInputWrapper: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: normalize(10),
        paddingHorizontal: normalize(12),
        paddingVertical: normalize(8),
    },
    priceLabel: {
        fontSize: normalize(10),
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: normalize(4),
    },
    priceInput: {
        fontSize: normalize(15),
        fontWeight: '600',
        color: '#1F2937',
        paddingVertical: 0,
    },
    priceDivider: {
        paddingHorizontal: normalize(10),
    },
    priceDividerText: {
        fontSize: normalize(16),
        color: '#9CA3AF',
    },

    // Bottom Actions
    bottomActions: {
        flexDirection: 'row',
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(14),
        paddingBottom: Platform.OS === 'ios' ? normalizeVertical(30) : normalize(14),
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
        gap: normalize(12),
    },
    clearButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: normalize(12),
        paddingVertical: normalize(14),
        borderWidth: 1.5,
        borderColor: '#2563eb',
        gap: normalize(6),
    },
    clearButtonText: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#2563eb',
    },
    applyButton: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563eb',
        borderRadius: normalize(12),
        paddingVertical: normalize(14),
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        gap: normalize(6),
    },
    applyButtonText: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },

    // Legacy styles (kept for compatibility)
    scrollContainer: {
        padding: normalize(20),
        paddingBottom: normalizeVertical(80),
        backgroundColor: '#fff',
    },
    filterListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: normalizeVertical(14),
    },
    filterItem: {
        backgroundColor: '#F5F7FA',
        borderRadius: normalize(14),
        paddingVertical: normalize(7),
        paddingHorizontal: normalize(15),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: normalize(10),
        marginBottom: normalize(10),
        minWidth: 90,
        alignItems: 'center',
    },
    filterItemSelected: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    filterText: {
        fontSize: normalize(12),
        color: '#6B7280',
        fontWeight: '500',
    },
    filterTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    categoryListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: normalizeVertical(14),
    },
    iconContainer: {
        marginRight: 8,
    },
    budgetInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalizeVertical(16),
    },
    budgetInput: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        borderRadius: normalize(14),
        padding: normalize(12),
        fontSize: normalize(12),
        color: '#222',
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
        marginRight: normalize(8),
    },
    toText: {
        fontSize: normalize(14),
        color: '#6c757d',
        fontWeight: '500',
        marginHorizontal: normalize(4),
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(12),
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        gap: normalize(12),
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#2563eb',
        borderRadius: normalize(12),
        padding: normalize(14),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: normalize(14),
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
    predictionsList: {
        position: 'absolute',
        top: normalize(56),
        width: '100%',
        maxHeight: 200,
        backgroundColor: '#fff',
        borderRadius: normalize(14),
        borderWidth: 1,
        borderColor: '#eee',
        zIndex: 100,
        elevation: 3,
    },
    predictionItem: {
        padding: normalize(14),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
    },
    predictionText: {
        fontSize: normalize(12),
        color: '#222',
    },

    // Subcategory Panel
    subcategoryPanel: {
        flex: 1,
    },
    subcategoryHeader: {
        paddingHorizontal: normalize(16),
        paddingTop: normalize(16),
        paddingBottom: normalize(12),
    },
    subcategoryTitle: {
        fontSize: normalize(15),
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: normalize(4),
    },
    subcategorySubtitle: {
        fontSize: normalize(12),
        color: '#6B7280',
    },
    subcategoryList: {
        paddingHorizontal: normalize(12),
    },
    subcategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: normalize(10),
        paddingVertical: normalize(12),
        paddingHorizontal: normalize(14),
        marginBottom: normalize(8),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    subcategoryItemSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: '#2563eb',
    },
    subcategoryIconWrapper: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(10),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(12),
    },
    subcategoryIconWrapperSelected: {
        backgroundColor: '#DBEAFE',
    },
    subcategoryText: {
        flex: 1,
        fontSize: normalize(13),
        fontWeight: '500',
        color: '#374151',
    },
    subcategoryTextSelected: {
        color: '#2563eb',
        fontWeight: '600',
    },
    subcategoryCheck: {
        width: normalize(20),
        height: normalize(20),
        borderRadius: normalize(10),
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    skipButtonContainer: {
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(12),
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        marginTop: normalize(8),
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: normalize(12),
        backgroundColor: '#F8FAFC',
        borderRadius: normalize(10),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    skipButtonText: {
        color: '#6B7280',
        fontSize: normalize(13),
        fontWeight: '500',
        marginRight: normalize(4),
    },
});
