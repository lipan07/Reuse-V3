import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

export default StyleSheet.create({
    container: { flex: 1 },
    formHeader: { fontSize: normalize(18), fontWeight: 'bold', marginBottom: normalizeVertical(16) },
    scrollViewContent: { padding: normalize(14), flexGrow: 1 },
    label: { fontSize: normalize(13), fontWeight: 'bold', marginBottom: normalizeVertical(7) },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: normalize(8),
        padding: normalize(10),
        marginBottom: normalizeVertical(14),
        fontSize: normalize(13),
        backgroundColor: '#fff',
    },
    optionContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: normalizeVertical(14) },
    optionButton: {
        borderWidth: 1,
        borderColor: '#007BFF',
        borderRadius: normalize(8),
        padding: normalize(10),
        marginRight: normalize(10),
        marginBottom: normalize(10),
    },
    selectedOption: { backgroundColor: '#007BFF' },
    optionText: { fontSize: normalize(13), color: '#007BFF' },
    selectedText: { color: '#fff' },
    imagePicker: {
        backgroundColor: '#007BFF',
        borderRadius: normalize(8),
        padding: normalize(10),
        alignItems: 'center',
        marginBottom: normalizeVertical(14),
    },
    imagePickerText: { color: '#fff', fontSize: normalize(13) },
    imagesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: normalizeVertical(40) },
    image: { width: normalize(80), height: normalize(80), marginRight: normalize(10), marginBottom: normalize(10) },
    imageWrapper: {
        position: 'relative',
        marginRight: normalize(10),
        marginBottom: normalize(10),
    },
    removeButton: {
        position: 'absolute',
        right: -5,
        top: -5,
        backgroundColor: 'red',
        borderRadius: normalize(10),
        width: normalize(20),
        height: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: normalize(13),
        lineHeight: normalize(16),
    },
    submitButton: {
        backgroundColor: '#007BFF',
        padding: normalize(12),
        borderRadius: normalize(8),
        alignItems: 'center',
        marginHorizontal: normalize(14),
        marginBottom: normalizeVertical(14),
    },
    submitButtonText: {
        color: '#fff',
        fontSize: normalize(14),
        fontWeight: 'bold',
    },
    uploadArea: {
        borderWidth: 1,
        borderColor: '#007BFF',
        borderRadius: normalize(8),
        paddingVertical: normalizeVertical(10),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        marginBottom: normalizeVertical(14),
        width: '100%',
        height: normalizeVertical(70),
        alignSelf: 'center',
    },
    uploadText: {
        marginTop: normalize(5),
        fontSize: normalize(12),
        color: '#007BFF',
        textAlign: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loaderText: {
        marginTop: normalizeVertical(8),
        fontSize: normalize(12),
        color: '#333',
    },
});