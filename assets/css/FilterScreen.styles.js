// FilterScreen.styles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    scrollContainer: {
        padding: normalize(10)
    },
    searchInput: {
        backgroundColor: '#fff',
        borderRadius: normalize(8),
        padding: normalize(10),
        marginBottom: normalizeVertical(10),
        fontSize: normalize(12),
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
    },
    // Location Search Section
    locationContainer: {
        marginBottom: normalizeVertical(16),
    },
    addressSearchContainer: {
        position: 'relative',
        zIndex: 3,
    },
    addressInput: {
        backgroundColor: '#fff',
        borderRadius: normalize(8),
        padding: normalize(10),
        fontSize: normalize(12),
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
    },
    locationTitle: {
        fontSize: normalize(14),
        fontWeight: '600',
        marginBottom: normalizeVertical(4),
        color: '#2c3e50',
    },
    locationSubtitle: {
        fontSize: normalize(12),
        color: '#666',
        marginBottom: normalizeVertical(8),
    },
    predictionsList: {
        position: 'absolute',
        top: normalizeVertical(38),
        width: '100%',
        maxHeight: normalizeVertical(100),
        backgroundColor: '#fff',
        borderRadius: normalize(8),
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 4,
        elevation: 5,
    },
    predictionItem: {
        padding: normalize(8),
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    predictionText: {
        fontSize: normalize(12),
        color: '#333',
    },
    loader: {
        position: 'absolute',
        right: normalize(10),
        top: normalizeVertical(10),
    },
    distanceTitle: {
        fontSize: normalize(14),
        fontWeight: '600',
        marginBottom: normalizeVertical(8),
        color: '#2c3e50',
    },
    filterListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: normalizeVertical(12),
        gap: normalize(6),
    },
    filterItem: {
        backgroundColor: '#fff',
        borderRadius: normalize(6),
        paddingVertical: normalizeVertical(10),
        paddingHorizontal: normalize(12),
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
    },
    filterItemSelected: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    filterText: {
        fontSize: normalize(12),
        color: '#333'
    },
    filterTextSelected: {
        color: '#fff'
    },
    sectionTitle: {
        fontSize: normalize(14),
        fontWeight: '600',
        marginVertical: normalizeVertical(10),
        color: '#2c3e50',
    },
    categoryListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: normalizeVertical(12),
        gap: normalize(6),
    },
    categoryItem: {
        backgroundColor: '#fff',
        borderRadius: normalize(6),
        padding: normalize(7),
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    categoryItemSelected: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    categoryIcon: {
        marginRight: normalize(5)
    },
    categoryText: {
        fontSize: normalize(12),
        color: '#333'
    },
    categoryTextSelected: {
        color: '#fff'
    },
    budgetInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalizeVertical(12),
        gap: normalize(6),
    },
    budgetInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: normalize(8),
        padding: normalize(10),
        fontSize: normalize(12),
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
    },
    toText: {
        fontSize: normalize(12),
        color: '#666'
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: normalizeVertical(16),
        left: normalize(10),
        right: normalize(10),
        flexDirection: 'row',
        gap: normalize(8),
        zIndex: 2,
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#6c757d',
        borderRadius: normalize(8),
        padding: normalize(10),
        alignItems: 'center',
        elevation: 3,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: normalize(12),
        fontWeight: '500',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#007bff',
        borderRadius: normalize(8),
        padding: normalize(10),
        alignItems: 'center',
        elevation: 3,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: normalize(12),
        fontWeight: '500',
    },
    scrollableContent: {
        flex: 1,
        marginBottom: normalizeVertical(70),
    },
});