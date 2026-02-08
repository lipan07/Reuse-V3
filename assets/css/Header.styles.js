import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const statusBarHeight = Platform.select({
    ios: 44,
    android: StatusBar.currentHeight ?? 24,
    default: 24,
});

export default StyleSheet.create({
    headerContainer: {
        backgroundColor: '#FFFFFF',
        paddingTop: statusBarHeight + normalize(8),
        paddingBottom: normalize(12),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F5F5F5',
    },
    darkHeaderContainer: {
        backgroundColor: '#1A1A1A',
        borderBottomColor: '#333333',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: normalize(16),
        paddingVertical: normalize(10),
        minHeight: normalize(40),
    },
    backButton: {
        marginRight: normalize(15),
        padding: normalize(4),
    },
    title: {
        flex: 1,
        fontSize: normalize(20),
        fontWeight: '600',
        color: '#000000',
        ...(Platform.OS === 'android' && { includeFontPadding: false }),
    },
    darkTitle: {
        color: '#FFFFFF',
    },
});
