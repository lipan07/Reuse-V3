import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: normalize(50),
        paddingHorizontal: normalize(18),
        backgroundColor: '#F5F5F5',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(28),
        backgroundColor: '#fff',
        borderRadius: normalize(16),
        padding: normalize(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    profileImage: {
        width: normalize(80),
        height: normalize(80),
        borderRadius: normalize(40),
        marginRight: normalize(18),
        borderWidth: 2,
        borderColor: '#2196F3',
        backgroundColor: '#eaf1fa',
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    userName: {
        fontWeight: 'bold',
        fontSize: normalize(18),
        marginBottom: normalize(6),
        color: '#222',
    },
    editButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(7),
        borderRadius: normalize(8),
        alignSelf: 'flex-start',
        marginTop: normalize(2),
    },
    editButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: normalize(14),
        letterSpacing: 0.2,
    },
    linksWrapper: {
        width: '100%',
        marginTop: normalize(10),
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(14),
        backgroundColor: '#FFFFFF',
        paddingVertical: normalize(14),
        paddingHorizontal: normalize(16),
        borderRadius: normalize(12),
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    iconCircle: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(19),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(14),
    },
    linkText: {
        flex: 1,
        fontSize: normalize(16),
        color: '#222',
        fontWeight: '500',
        marginLeft: 2,
    },
});
