import { StyleSheet, Platform, StatusBar } from 'react-native';
import { getAccountUiMetrics } from '../../utils/accountUiMetrics';

export function buildFollowingPageStyles(width, height) {
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
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: n(16),
        marginTop: n(12),
        borderRadius: n(8),
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    darkTabContainer: {
        backgroundColor: '#1E1E1E',
    },
    tabButton: {
        flex: 1,
        paddingVertical: n(12),
        alignItems: 'center',
    },
    activeTabButton: {
        backgroundColor: '#007bff',
    },
    tabButtonText: {
        fontSize: nf(14),
        fontWeight: '500',
        color: '#666',
    },
    darkTabButtonText: {
        color: '#999',
    },
    activeTabButtonText: {
        color: '#fff',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: n(16),
        paddingTop: n(12),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: nf(16),
        color: '#666',
        marginTop: n(12),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: n(20),
    },
    emptyIconContainer: {
        width: n(120),
        height: n(120),
        borderRadius: n(60),
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: n(20),
    },
    darkEmptyIconContainer: {
        backgroundColor: '#2A2A2A',
    },
    emptyText: {
        fontSize: nf(20),
        fontWeight: '600',
        color: '#666',
        marginBottom: n(8),
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: nf(14),
        color: '#999',
        textAlign: 'center',
        marginBottom: n(24),
        maxWidth: '80%',
        lineHeight: nf(20),
    },
    exploreButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: n(24),
        paddingVertical: n(12),
        borderRadius: n(25),
        shadowColor: '#007bff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    darkExploreButton: {
        backgroundColor: '#1A73E8',
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: nf(16),
        fontWeight: '600',
    },
    darkExploreButtonText: {
        color: '#fff',
    },
    listContent: {
        paddingBottom: n(20),
    },
    listHeader: {
        paddingVertical: n(12),
        paddingHorizontal: n(4),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: n(8),
    },
    listHeaderText: {
        fontSize: nf(14),
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: n(16),
        backgroundColor: '#fff',
        borderRadius: n(16),
        paddingHorizontal: n(16),
        marginBottom: n(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    darkItemContainer: {
        backgroundColor: '#1E1E1E',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
    },
    itemImage: {
        width: n(60),
        height: n(60),
        borderRadius: n(30),
        backgroundColor: '#eee',
    },
    defaultIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: n(20),
        height: n(20),
        borderRadius: n(10),
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    darkStatusIndicator: {
        borderColor: '#1E1E1E',
    },
    itemInfo: {
        flex: 1,
        marginLeft: n(16),
        marginRight: n(12),
    },
    itemTitle: {
        fontSize: nf(16),
        fontWeight: '600',
        color: '#333',
        marginBottom: n(6),
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: n(4),
    },
    itemSubtitle: {
        fontSize: nf(13),
        color: '#666',
        marginLeft: n(6),
        flex: 1,
    },
    itemDistance: {
        fontSize: nf(12),
        color: '#999',
        marginLeft: n(6),
    },
    animatedFollowButton: {
        alignSelf: 'flex-start',
    },
    darkText: {
        color: '#fff',
    },
    darkSubtitle: {
        color: '#aaa',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
    },
    darkSeparator: {
        backgroundColor: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        maxWidth: n(320),
        backgroundColor: '#fff',
        borderRadius: n(20),
        padding: n(28),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    darkModalContainer: {
        backgroundColor: '#1E1E1E',
    },
    modalIconContainer: {
        width: n(64),
        height: n(64),
        borderRadius: n(32),
        backgroundColor: '#FFE6E6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: n(16),
    },
    darkModalIconContainer: {
        backgroundColor: '#2A1A1A',
    },
    modalTitle: {
        fontSize: nf(22),
        fontWeight: '700',
        marginBottom: n(12),
        color: '#222',
        textAlign: 'center',
    },
    darkModalTitle: {
        color: '#fff',
    },
    modalText: {
        fontSize: nf(16),
        color: '#555',
        textAlign: 'center',
        marginBottom: n(28),
        lineHeight: nf(24),
    },
    darkModalText: {
        color: '#ccc',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: n(20),
        paddingVertical: n(12),
        borderRadius: n(12),
        marginHorizontal: n(6),
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    darkCancelButton: {
        backgroundColor: '#333',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: nf(16),
    },
    darkButtonText: {
        color: '#fff',
    },
    confirmButton: {
        backgroundColor: '#FF4444',
        shadowColor: '#FF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: nf(16),
    },
    confirmButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sweetAlertOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    sweetAlertContainer: {
        backgroundColor: '#fff',
        borderRadius: n(16),
        padding: n(24),
        marginHorizontal: n(40),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        maxWidth: n(280),
    },
    sweetAlertContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    sweetAlertIcon: {
        marginBottom: n(12),
    },
    sweetAlertText: {
        fontSize: nf(16),
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        lineHeight: nf(22),
    },
  });

  return { styles, n, nf, contentMaxWidth };
}
