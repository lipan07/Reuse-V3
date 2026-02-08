import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E0E0E0',
    },
    darkSeparator: {
        backgroundColor: '#333',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingTop: normalize(10),
        paddingBottom: normalize(30),
    },
    darkScrollContainer: {
        backgroundColor: '#121212',
    },
    content: {
        padding: normalize(20),
        alignItems: 'center',
    },
    iconContainer: {
        width: normalize(100),
        height: normalize(100),
        borderRadius: normalize(50),
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: normalize(20),
    },
    feedbackIcon: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    subtitle: {
        fontSize: normalize(18),
        fontWeight: '600',
        marginBottom: normalize(20),
        color: '#333',
        textAlign: 'center',
    },
    rating: {
        marginBottom: normalize(30),
        paddingVertical: normalize(10),
    },
    label: {
        alignSelf: 'flex-start',
        fontSize: normalize(16),
        fontWeight: '500',
        marginBottom: normalize(10),
        color: '#333',
    },
    input: {
        width: '100%',
        minHeight: normalize(120),
        borderWidth: normalize(1),
        borderColor: '#ddd',
        borderRadius: normalize(8),
        padding: normalize(15),
        marginBottom: normalize(25),
        fontSize: normalize(16),
        textAlignVertical: 'top',
    },
    submitButton: {
        width: '100%',
        backgroundColor: '#4CAF50',
        padding: normalize(15),
        borderRadius: normalize(8),
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: normalize(16),
        fontWeight: 'bold',
    },
});
