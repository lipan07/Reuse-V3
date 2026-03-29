import { StyleSheet, Platform } from 'react-native';

/** Capped scaling for tablets / large windows — matches ChatBox responsive pattern. */
function computeMetrics(width, height) {
    const shortEdge = Math.min(width, height);
    const isLargeScreen = shortEdge >= 560 || width >= 600;
    const maxUiScale = isLargeScreen ? 1.12 : 1.34;
    const layoutScale = Math.min(width / 375, maxUiScale);
    const fontScale = Math.min(shortEdge / 375, maxUiScale);
    const vertScale = Math.min(height / 812, maxUiScale);
    const n = (size) => Math.round(layoutScale * size);
    const nf = (size) => Math.round(fontScale * size);
    const nv = (size) => Math.round(vertScale * size);
    const leftPanelWidth = isLargeScreen ? Math.min(width * 0.35, 220) : width * 0.35;
    /** Keeps Clear / Apply from stretching edge-to-edge on tablets; phones stay full width. */
    const bottomBarMaxWidth = isLargeScreen ? Math.min(width, 520) : width;
    /** Inset for scroll content: space above buttons + button row + buffer (safe area added in JS). */
    const scrollBottomPadding = n(10) + n(50) + n(20);
    return { n, nf, nv, leftPanelWidth, bottomBarMaxWidth, scrollBottomPadding };
}

export function buildFilterScreenStyles(width, height) {
    const { n, nf, nv, leftPanelWidth, bottomBarMaxWidth, scrollBottomPadding } = computeMetrics(width, height);

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        // Top inset comes from SafeAreaView (edges include top); do not add paddingTop here or it doubles.
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
        width: leftPanelWidth,
        backgroundColor: '#F8FAFC',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    panelTitle: {
        fontSize: nf(13),
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: n(12),
        paddingVertical: n(14),
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
        paddingVertical: n(12),
        paddingHorizontal: n(10),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        minHeight: n(48),
    },
    categoryItemSelected: {
        backgroundColor: '#2563eb',
        borderBottomColor: '#1D4ED8',
    },
    categoryIconWrapper: {
        width: n(32),
        height: n(32),
        borderRadius: n(8),
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: n(10),
        flexShrink: 0,
    },
    categoryTextContainer: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 0,
        paddingRight: n(4),
    },
    categoryText: {
        fontSize: nf(11),
        fontWeight: '500',
        color: '#374151',
        lineHeight: nf(16),
    },
    categoryTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    selectedIndicator: {
        width: n(18),
        height: n(18),
        borderRadius: n(9),
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Right Panel - Filters
    rightPanel: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: n(16),
    },
    filterSection: {
        marginTop: n(18),
    },
    sectionTitle: {
        fontSize: nf(13),
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: n(10),
        letterSpacing: 0.2,
    },

    // Search Input
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: n(10),
        paddingHorizontal: n(12),
        height: n(44),
    },
    searchIcon: {
        marginRight: n(8),
    },
    searchInput: {
        flex: 1,
        fontSize: nf(14),
        color: '#1F2937',
        paddingVertical: 0,
    },

    // Address/Location
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: n(10),
        paddingLeft: n(12),
        minHeight: n(44),
    },
    locationIcon: {
        marginRight: n(8),
    },
    addressInput: {
        flex: 1,
        fontSize: nf(14),
        color: '#1F2937',
        paddingVertical: n(12),
        paddingRight: n(12),
    },

    // Location Input
    locationContainer: {
        marginBottom: 0,
        zIndex: 100,
    },
    locationInput: {
        textAlign: 'left',
        paddingLeft: 0,
        paddingRight: 0,
    },
    locationPredictions: {
        position: 'absolute',
        top: n(48),
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: n(10),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: n(180),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
    },
    locationPredictionItem: {
        paddingVertical: n(12),
        paddingHorizontal: n(14),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    locationPredictionText: {
        fontSize: nf(13),
        color: '#374151',
        lineHeight: nf(18),
    },

    // Chips
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -n(4),
    },
    chip: {
        backgroundColor: '#F3F4F6',
        borderRadius: n(20),
        paddingVertical: n(8),
        paddingHorizontal: n(14),
        margin: n(4),
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    chipSelected: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    chipText: {
        fontSize: nf(12),
        fontWeight: '500',
        color: '#6B7280',
    },
    chipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Price Range Inputs
    priceInputContainer: {
        marginTop: n(8),
        flexDirection: 'row',
        gap: n(12),
    },
    priceInputRow: {
        marginBottom: n(16),
    },
    priceInputLabel: {
        fontSize: nf(13),
        fontWeight: '600',
        color: '#374151',
        marginBottom: n(8),
    },
    priceInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: n(12),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: n(14),
        height: n(48),
    },
    priceInputPrefix: {
        fontSize: nf(16),
        fontWeight: '600',
        color: '#374151',
        marginRight: n(8),
    },
    priceInput: {
        flex: 1,
        fontSize: nf(15),
        color: '#1F2937',
        padding: 0,
    },

    // Legacy price inputs
    priceRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceInputWrapper: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: n(10),
        paddingHorizontal: n(12),
        paddingVertical: n(8),
    },
    priceLabel: {
        fontSize: nf(10),
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: n(4),
    },
    priceInput: {
        fontSize: nf(15),
        fontWeight: '600',
        color: '#1F2937',
        paddingVertical: 0,
    },
    priceDivider: {
        paddingHorizontal: n(10),
    },
    priceDividerText: {
        fontSize: nf(16),
        color: '#9CA3AF',
    },

        // Bottom Actions — absolutely positioned so no white strip blocks the scroll; only buttons paint
        bottomActionsOuter: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            backgroundColor: 'transparent',
            paddingTop: n(10),
            zIndex: 20,
        },
        bottomActionsRow: {
        flexDirection: 'row',
            alignItems: 'stretch',
            alignSelf: 'center',
            width: '100%',
            paddingHorizontal: n(16),
            gap: n(12),
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: n(14),
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    clearButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: n(13),
        paddingHorizontal: n(10),
        gap: n(8),
    },
    clearButtonText: {
        fontSize: nf(15),
        fontWeight: '600',
        color: '#374151',
        letterSpacing: 0.2,
    },
    applyButton: {
        flex: 1.55,
        flexBasis: 0,
        minHeight: n(50),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#16a34a',
        borderRadius: n(12),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#15803d',
    },
    applyButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: n(13),
        paddingHorizontal: n(12),
        gap: n(8),
    },
    applyButtonText: {
        fontSize: nf(15),
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    buttonDisabled: {
        opacity: 0.6,
    },

    // Legacy styles (kept for compatibility)
    scrollContainer: {
        padding: n(20),
        paddingBottom: nv(80),
        backgroundColor: '#fff',
    },
    filterListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: nv(14),
    },
    filterItem: {
        backgroundColor: '#F5F7FA',
        borderRadius: n(14),
        paddingVertical: n(7),
        paddingHorizontal: n(15),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: n(10),
        marginBottom: n(10),
        minWidth: 90,
        alignItems: 'center',
    },
    filterItemSelected: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    filterText: {
        fontSize: nf(12),
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
        marginBottom: nv(14),
    },
    iconContainer: {
        marginRight: 8,
    },
    budgetInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: nv(16),
    },
    budgetInput: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        borderRadius: n(14),
        padding: n(12),
        fontSize: nf(12),
        color: '#222',
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
        marginRight: n(8),
    },
    toText: {
        fontSize: nf(14),
        color: '#6c757d',
        fontWeight: '500',
        marginHorizontal: n(4),
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: n(16),
        paddingVertical: n(12),
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        gap: n(12),
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#2563eb',
        borderRadius: n(12),
        padding: n(14),
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
        fontSize: nf(14),
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
    predictionsList: {
        position: 'absolute',
        top: n(56),
        width: '100%',
        maxHeight: 200,
        backgroundColor: '#fff',
        borderRadius: n(14),
        borderWidth: 1,
        borderColor: '#eee',
        zIndex: 100,
        elevation: 3,
    },
    predictionItem: {
        padding: n(14),
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
    },
    predictionText: {
        fontSize: nf(12),
        color: '#222',
    },

    // Subcategory Panel
    subcategoryPanel: {
        flex: 1,
    },
    subcategoryHeader: {
        paddingHorizontal: n(16),
        paddingTop: n(16),
        paddingBottom: n(12),
    },
    subcategoryTitle: {
        fontSize: nf(15),
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: n(4),
    },
    subcategorySubtitle: {
        fontSize: nf(12),
        color: '#6B7280',
    },
    subcategoryList: {
        paddingHorizontal: n(12),
    },
    subcategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: n(10),
        paddingVertical: n(12),
        paddingHorizontal: n(14),
        marginBottom: n(8),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    subcategoryItemSelected: {
        backgroundColor: '#F0FDF4',
        borderColor: '#16a34a',
    },
    subcategoryIconWrapper: {
        width: n(36),
        height: n(36),
        borderRadius: n(10),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: n(12),
        flexShrink: 0,
    },
    subcategoryIconWrapperSelected: {
        backgroundColor: '#DCFCE7',
    },
    subcategoryTextContainer: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
    },
    subcategoryText: {
        fontSize: nf(13),
        fontWeight: '500',
        color: '#374151',
        lineHeight: nf(18),
    },
    subcategoryTextSelected: {
        color: '#16a34a',
        fontWeight: '600',
    },
    subcategoryCheck: {
        width: n(20),
        height: n(20),
        borderRadius: n(10),
        backgroundColor: '#16a34a',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
        marginLeft: n(8),
    },
    skipButtonContainer: {
        paddingHorizontal: n(16),
        paddingVertical: n(12),
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        marginTop: n(8),
    },
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: n(12),
        backgroundColor: '#F8FAFC',
        borderRadius: n(10),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    skipButtonText: {
        color: '#6B7280',
        fontSize: nf(13),
        fontWeight: '500',
        marginRight: n(4),
    },

    darkContainer: { backgroundColor: '#121212' },
    darkLeftPanel: { backgroundColor: '#0f172a', borderRightColor: '#334155' },
    darkPanelTitle: {
        backgroundColor: '#1e293b',
        borderBottomColor: '#334155',
        color: '#94a3b8',
    },
    darkCategoryItem: {
        backgroundColor: '#1e293b',
        borderBottomColor: '#334155',
    },
    darkCategoryText: { color: '#e2e8f0' },
    darkRightPanel: { backgroundColor: '#121212' },
    darkSectionTitle: { color: '#f1f5f9' },
    darkSearchInputWrapper: { backgroundColor: '#334155' },
    darkSearchInput: { color: '#f1f5f9' },
    darkAddressContainer: {
        backgroundColor: '#334155',
        borderColor: '#475569',
    },
    darkAddressInput: { color: '#f1f5f9' },
    darkLocationPredictions: {
        backgroundColor: '#1e293b',
        borderColor: '#475569',
    },
    darkLocationPredictionItem: { borderBottomColor: '#334155' },
    darkLocationPredictionText: { color: '#e2e8f0' },
    darkSubcategoryPanel: { backgroundColor: 'transparent' },
    darkSubcategoryTitle: { color: '#f1f5f9' },
    darkSubcategorySubtitle: { color: '#94a3b8' },
    darkSubcategoryItem: {
        backgroundColor: '#1e293b',
        borderColor: '#475569',
    },
    darkSubcategoryText: { color: '#e2e8f0' },
    darkSkipButton: { backgroundColor: '#334155', borderColor: '#475569' },
    darkSkipButtonText: { color: '#94a3b8' },
    darkClearButton: { backgroundColor: '#334155', borderColor: '#475569' },
    darkClearButtonText: { color: '#e2e8f0' },
    darkFilterChip: { backgroundColor: '#334155', borderColor: '#475569' },
    darkFilterChipText: { color: '#e2e8f0' },
    darkPriceInputWrapper: {
        backgroundColor: '#334155',
        borderColor: '#475569',
    },
    darkPriceInput: { color: '#f1f5f9' },
    });

    return { styles, n, nf, nv, bottomBarMaxWidth, scrollBottomPadding };
}
