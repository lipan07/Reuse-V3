import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');
const scale = width / 375;
export const normalize = (size) => Math.round(scale * size);

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    statusBarBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 24),
        backgroundColor: '#007BFF',
        zIndex: 1,
    },
    darkStatusBar: {
        backgroundColor: '#1A1A1A',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingTop: normalize(50),
        paddingBottom: normalize(30),
    },
    darkScrollContainer: {
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(18),
        paddingBottom: normalize(12),
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    darkHeader: {
        borderBottomColor: '#333',
    },
    backButton: {
        marginRight: normalize(15),
    },
    title: {
        fontSize: normalize(20),
        fontWeight: 'bold',
        color: '#333',
    },
    darkTitle: {
        color: '#fff',
    },
    content: {
        paddingHorizontal: normalize(16),
    },
    sectionTitle: {
        fontSize: normalize(14),
        color: '#666',
        marginTop: normalize(20),
        marginBottom: normalize(10),
        marginLeft: normalize(8),
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    darkSectionTitle: {
        color: '#999',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: normalize(16),
        paddingHorizontal: normalize(16),
        borderRadius: normalize(12),
        width: '100%',
        marginBottom: normalize(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    darkSettingItem: {
        backgroundColor: '#1E1E1E',
    },
    iconCircle: {
        width: normalize(40),
        height: normalize(40),
        borderRadius: normalize(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(14),
    },
    settingText: {
        flex: 1,
        fontSize: normalize(16),
        color: '#222',
        fontWeight: '500',
    },
    darkSettingText: {
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: normalize(20),
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: normalize(24),
        borderRadius: normalize(12),
        width: '100%',
        maxWidth: normalize(320),
        alignItems: 'center',
    },
    darkModalContainer: {
        backgroundColor: '#1E1E1E',
    },
    modalIcon: {
        marginBottom: normalize(12),
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: 'bold',
        marginBottom: normalize(8),
        color: '#222',
        textAlign: 'center',
    },
    darkModalTitle: {
        color: '#fff',
    },
    modalText: {
        fontSize: normalize(15),
        color: '#555',
        textAlign: 'center',
        marginBottom: normalize(24),
        lineHeight: normalize(22),
    },
    darkModalText: {
        color: '#ccc',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#eee',
        paddingVertical: normalize(14),
        borderRadius: normalize(8),
        alignItems: 'center',
        marginRight: normalize(10),
    },
    darkCancelButton: {
        backgroundColor: '#333',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: normalize(15),
    },
    darkButtonText: {
        color: '#fff',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#D9534F',
        paddingVertical: normalize(14),
        borderRadius: normalize(8),
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: normalize(15),
    },
});
