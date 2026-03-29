import { StyleSheet, Dimensions } from 'react-native';

/**
 * Full add-product form styles (responsive + dark mode).
 * Use with useWindowDimensions + useTheme in screens.
 */
export function getAddProductFormStyles(width, height, isDarkMode = false) {
    const d = isDarkMode;
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    const scale = Math.min(Math.max(shortSide / 375, 0.9), 1.08);
    const verticalScale = Math.min(Math.max(longSide / 812, 0.9), 1.08);
    const normalize = (size) => Math.round(scale * size);
    const normalizeVertical = (size) => Math.round(verticalScale * size);
    const accent = d ? '#60a5fa' : '#007BFF';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: d ? '#121212' : '#fff',
        },
        formHeaderContainer: {
            paddingHorizontal: 28,
            paddingTop: 32,
            paddingBottom: 18,
            backgroundColor: d ? '#1e293b' : '#fff',
            borderBottomWidth: 1,
            borderBottomColor: d ? '#334155' : '#F3F4F6',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: d ? 0.25 : 0.04,
            shadowRadius: 4,
            elevation: 2,
        },
        formHeaderTitle: {
            fontSize: 24,
            fontWeight: '700',
            color: d ? '#f1f5f9' : '#222',
            marginBottom: 6,
            letterSpacing: 0.2,
        },
        formSubHeader: {
            fontSize: 15,
            color: d ? '#94a3b8' : '#888',
            fontWeight: '400',
        },
        scrollViewContent: {
            padding: normalize(20),
            flexGrow: 1,
            backgroundColor: d ? '#121212' : '#fff',
        },
        label: {
            fontSize: normalize(14),
            fontWeight: 'bold',
            marginBottom: normalizeVertical(7),
            color: d ? '#e2e8f0' : '#333',
            marginLeft: 2,
            letterSpacing: 0.1,
        },
        input: {
            borderWidth: 0,
            borderRadius: normalize(14),
            padding: normalize(12),
            marginBottom: normalizeVertical(18),
            fontSize: normalize(12),
            backgroundColor: d ? '#1e293b' : '#F5F7FA',
            color: d ? '#f1f5f9' : '#222',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: d ? 0.2 : 0.04,
            shadowRadius: 2,
            elevation: 1,
        },
        optionContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: normalizeVertical(14),
        },
        optionButton: {
            borderWidth: 1,
            borderColor: accent,
            borderRadius: normalize(14),
            paddingVertical: normalize(7),
            paddingHorizontal: normalize(15),
            marginRight: normalize(10),
            marginBottom: normalize(10),
            backgroundColor: d ? '#0f172a' : '#F5F7FA',
            minWidth: 90,
            alignItems: 'center',
        },
        selectedOption: {
            backgroundColor: accent,
            borderColor: accent,
        },
        optionText: {
            fontSize: normalize(14),
            color: accent,
            fontWeight: '500',
        },
        selectedText: {
            color: '#fff',
            fontWeight: 'bold',
        },
        imagePicker: {
            backgroundColor: accent,
            borderRadius: normalize(12),
            padding: normalize(13),
            alignItems: 'center',
            marginBottom: normalizeVertical(18),
            shadowColor: accent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 4,
            elevation: 2,
        },
        imagePickerText: {
            color: '#fff',
            fontSize: normalize(14),
            fontWeight: '500',
        },
        imagesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: normalizeVertical(32),
        },
        image: {
            width: normalize(84),
            height: normalize(84),
            marginRight: normalize(10),
            marginBottom: normalize(10),
            borderRadius: normalize(12),
            borderWidth: 1,
            borderColor: d ? '#334155' : '#eee',
            backgroundColor: d ? '#1e293b' : '#F5F7FA',
        },
        imageWrapper: {
            position: 'relative',
            marginRight: normalize(10),
            marginBottom: normalize(10),
        },
        removeButton: {
            position: 'absolute',
            right: -5,
            top: -5,
            backgroundColor: '#FF5C5C',
            borderRadius: normalize(14),
            width: normalize(24),
            height: normalize(24),
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#FF5C5C',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.12,
            shadowRadius: 2,
            elevation: 2,
        },
        removeButtonText: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: normalize(14),
            lineHeight: normalize(16),
        },
        submitButton: {
            backgroundColor: accent,
            paddingVertical: normalize(16),
            borderRadius: normalize(16),
            alignItems: 'center',
            marginHorizontal: normalize(20),
            marginBottom: normalizeVertical(20),
            shadowColor: accent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.09,
            shadowRadius: 4,
            elevation: 2,
        },
        disabledButton: {
            backgroundColor: '#A0AEC0',
        },
        submitButtonText: {
            color: '#fff',
            fontSize: normalize(16),
            fontWeight: 'bold',
            letterSpacing: 0.5,
        },
        uploadArea: {
            borderWidth: 1,
            borderColor: accent,
            borderRadius: normalize(12),
            paddingVertical: normalizeVertical(14),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: d ? '#0f172a' : '#F5F7FA',
            marginBottom: normalizeVertical(18),
            width: '100%',
            height: normalizeVertical(74),
            alignSelf: 'center',
            borderStyle: 'dashed',
        },
        uploadText: {
            marginTop: normalize(5),
            fontSize: normalize(13),
            color: accent,
            textAlign: 'center',
        },
        loaderContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: d ? '#121212' : '#FFFFFF',
        },
        loaderText: {
            marginTop: normalizeVertical(8),
            fontSize: normalize(14),
            color: d ? '#cbd5e1' : '#333',
        },
        stickyButton: {
            backgroundColor: d ? '#1e293b' : '#fff',
            paddingTop: 10,
            paddingBottom: 6,
            borderTopWidth: 1,
            borderTopColor: d ? '#334155' : '#F3F4F6',
            borderBottomLeftRadius: 18,
            borderBottomRightRadius: 18,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: d ? 0.2 : 0.04,
            shadowRadius: 4,
            elevation: 2,
        },
        selectButton: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: d ? '#0f172a' : '#F8F8F8',
            borderWidth: 1,
            borderColor: d ? '#334155' : '#E0E0E0',
            borderRadius: normalize(10),
            paddingHorizontal: normalize(16),
            paddingVertical: normalizeVertical(14),
            marginBottom: normalizeVertical(15),
        },
        selectButtonText: {
            fontSize: normalize(15),
            color: d ? '#e2e8f0' : '#333',
            fontWeight: '500',
            flex: 1,
        },
        existingBadge: {
            position: 'absolute',
            bottom: normalize(4),
            left: normalize(4),
            backgroundColor: d ? '#334155' : '#E5E7EB',
            paddingHorizontal: normalize(6),
            paddingVertical: normalize(2),
            borderRadius: normalize(4),
        },
        existingBadgeText: {
            fontSize: normalize(10),
            color: d ? '#e2e8f0' : '#374151',
            fontWeight: '600',
        },
    });
}

const dw = Dimensions.get('window');
export default getAddProductFormStyles(dw.width, dw.height, false);
