import { StyleSheet, Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;

export function normalize(size) {
    const newSize = size * scale;
    // Cap size for tablets - modern approach uses a max-scale
    const cappedSize = SCREEN_WIDTH > 600 ? size * 1.05 : newSize;
    return Math.round(PixelRatio.roundToNearestPixel(cappedSize));
}

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        // Use padding instead of margin to keep the scrollable area full-screen
        paddingTop: Platform.OS === 'ios' ? 0 : normalize(40),
        paddingBottom: normalize(60), // Extra padding at bottom for logout visibility
        flexGrow: 1,
    },
    mainContainer: {
        paddingHorizontal: 24,
        // This ensures the container stays centered on Tablets/Web
        alignSelf: 'center',
    },
    header: {
        alignItems: 'center',
        marginTop: normalize(20),
        marginBottom: normalize(35),
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: normalize(86),
        height: normalize(86),
        borderRadius: normalize(43),
        backgroundColor: '#f1f5f9',
    },
    badgeEdit: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1e293b',
        width: normalize(26),
        height: normalize(26),
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        // Subtle shadow for the badge
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    greeting: {
        fontSize: normalize(20),
        fontWeight: '800',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    subGreeting: {
        fontSize: normalize(13),
        color: '#64748b',
        marginTop: 4,
    },
    section: {
        marginBottom: 25,
    },
    sectionLabel: {
        fontSize: normalize(11),
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 12,
        marginLeft: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc', 
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: normalize(34),
        height: normalize(34),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        fontSize: normalize(15),
        fontWeight: '500',
        color: '#334155',
    },
    logoutBtn: {
        marginTop: normalize(20),
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: '#fff1f2', // Modern soft-red
        borderWidth: 1,
        borderColor: '#ffe4e6',
    },
    logoutText: {
        color: '#e11d48',
        fontWeight: '700',
        fontSize: normalize(14),
    }
});