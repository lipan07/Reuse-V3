import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        // marginVertical: 10,
        // marginHorizontal: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 8,
    },
    productTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,  // Ensures title stays inside the container
    },
    heartIcon: {
        padding: 5,
    },
    detailsContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        flexShrink: 1, // Prevents text from overflowing
    },
    value: {
        fontSize: 16,
        color: '#333',
        flex: 1, // Ensures text stays inside the container
        flexWrap: 'wrap', // Allows text to wrap inside the box
        textAlign: 'right', // Aligns text properly
    },
    descriptionContainer: {
        marginTop: 10,
    },
    description: {
        fontSize: 15,
        color: '#555',
        lineHeight: 20,
    },
    price: {
        fontSize: 18,
        fontWeight: '700',
        color: 'green',
        marginTop: 10,
        textAlign: 'center',
    },
});

export default styles;
