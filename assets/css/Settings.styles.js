import { StyleSheet, Platform, StatusBar } from 'react-native';
import { getAccountUiMetrics } from '../../utils/accountUiMetrics';

export function buildSettingsStyles(width, height) {
  const { n, nf, contentMaxWidth } = getAccountUiMetrics(width, height);

  const styles = StyleSheet.create({
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
        paddingTop: n(50),
        paddingBottom: n(30),
    },
    darkScrollContainer: {
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: n(18),
        paddingBottom: n(12),
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    darkHeader: {
        borderBottomColor: '#333',
    },
    backButton: {
        marginRight: n(15),
    },
    title: {
        fontSize: nf(20),
        fontWeight: 'bold',
        color: '#333',
    },
    darkTitle: {
        color: '#fff',
    },
    content: {
        paddingHorizontal: n(16),
        alignSelf: 'center',
        width: '100%',
        maxWidth: contentMaxWidth,
    },
    sectionTitle: {
        fontSize: nf(14),
        color: '#666',
        marginTop: n(20),
        marginBottom: n(10),
        marginLeft: n(8),
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    darkSectionTitle: {
        // Match Account darkSectionLabel
        color: '#64748b',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: n(16),
        paddingHorizontal: n(16),
        borderRadius: n(12),
        width: '100%',
        marginBottom: n(12),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    darkSettingItem: {
        // Match Account darkMenuItem
        backgroundColor: '#1E1E1E',
        borderColor: '#333333',
        shadowOpacity: 0.25,
    },
    iconCircle: {
        width: n(40),
        height: n(40),
        borderRadius: n(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: n(14),
    },
    settingText: {
        flex: 1,
        fontSize: nf(16),
        color: '#222',
        fontWeight: '500',
    },
    darkSettingText: {
        // Match Account darkMenuText
        color: '#e2e8f0',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: n(20),
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: n(24),
        borderRadius: n(12),
        width: '100%',
        maxWidth: n(320),
        alignItems: 'center',
    },
    darkModalContainer: {
        backgroundColor: '#1E1E1E',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#333333',
    },
    modalIcon: {
        marginBottom: n(12),
    },
    modalTitle: {
        fontSize: nf(20),
        fontWeight: 'bold',
        marginBottom: n(8),
        color: '#222',
        textAlign: 'center',
    },
    darkModalTitle: {
        color: '#fff',
    },
    modalText: {
        fontSize: nf(15),
        color: '#555',
        textAlign: 'center',
        marginBottom: n(24),
        lineHeight: nf(22),
    },
    darkModalText: {
        color: '#94a3b8',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#eee',
        paddingVertical: n(14),
        borderRadius: n(8),
        alignItems: 'center',
        marginRight: n(10),
    },
    darkCancelButton: {
        backgroundColor: '#333',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: nf(15),
    },
    darkButtonText: {
        color: '#fff',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#D9534F',
        paddingVertical: n(14),
        borderRadius: n(8),
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: nf(15),
    },
  });

  return { styles, n, nf, contentMaxWidth };
}
