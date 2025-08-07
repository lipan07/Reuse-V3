// FilterScreen.styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 80
    },
    searchInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
        fontSize: 15,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    addressSearchContainer: {
        marginBottom: 16
    },
    addressInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
        color: '#212529',
        marginTop: 8
    },
    filterListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        gap: 8
    },
    filterItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    filterItemSelected: {
        backgroundColor: '#1a73e8',
        borderColor: '#1a73e8'
    },
    filterText: {
        fontSize: 14,
        color: '#495057'
    },
    filterTextSelected: {
        color: '#fff'
    },
    categoryListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        gap: 8
    },
    categoryItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e9ecef',
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryItemSelected: {
        backgroundColor: '#1a73e8',
        borderColor: '#1a73e8'
    },
    categoryText: {
        fontSize: 14,
        color: '#495057'
    },
    categoryTextSelected: {
        color: '#fff'
    },
    iconContainer: {
        marginRight: 8
    },
    budgetInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8
    },
    budgetInput: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 14,
        fontSize: 15,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    toText: {
        fontSize: 14,
        color: '#6c757d',
        fontWeight: '500'
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef'
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    clearButtonText: {
        color: '#495057',
        fontSize: 15,
        fontWeight: '500'
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#1a73e8',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500'
    },
    predictionsList: {
        position: 'absolute',
        top: 56,
        width: '100%',
        maxHeight: 200,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
        zIndex: 100,
        elevation: 3
    },
    predictionItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5'
    },
    predictionText: {
        fontSize: 15,
        color: '#212529'
    }
});