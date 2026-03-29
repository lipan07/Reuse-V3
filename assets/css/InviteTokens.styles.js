import { StyleSheet } from 'react-native';
import { getAccountUiMetrics } from '../../utils/accountUiMetrics';

export function buildInviteTokensStyles(width, height) {
  const { n, nf, nv, contentMaxWidth } = getAccountUiMetrics(width, height);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: n(16),
      paddingBottom: nv(24),
      alignSelf: 'center',
      width: '100%',
      maxWidth: contentMaxWidth,
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: '#E3F2FD',
      padding: n(12),
      borderRadius: n(8),
      marginBottom: n(16),
      alignItems: 'flex-start',
    },
    infoText: {
      flex: 1,
      marginLeft: n(8),
      fontSize: nf(14),
      color: '#1976D2',
      lineHeight: nf(20),
    },
    inactiveBanner: {
      flexDirection: 'row',
      backgroundColor: '#FFF3E0',
      padding: n(12),
      borderRadius: n(8),
      marginBottom: n(16),
      alignItems: 'flex-start',
      borderLeftWidth: n(4),
      borderLeftColor: '#FF9800',
    },
    inactiveBannerText: {
      flex: 1,
      marginLeft: n(8),
      fontSize: nf(14),
      color: '#E65100',
      lineHeight: nf(20),
    },
    inactiveHint: {
      marginTop: n(12),
      fontSize: nf(13),
      color: '#FF9800',
      fontStyle: 'italic',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: nv(64),
    },
    emptyText: {
      marginTop: n(16),
      fontSize: nf(16),
      color: '#9E9E9E',
    },
    tokenCard: {
      backgroundColor: '#fff',
      borderRadius: n(12),
      padding: n(16),
      marginBottom: n(16),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    tokenHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: n(12),
    },
    tokenInfo: {
      flex: 1,
    },
    tokenLabel: {
      fontSize: nf(12),
      color: '#666',
      marginBottom: n(4),
    },
    tokenValue: {
      fontSize: nf(24),
      fontWeight: 'bold',
      color: '#333',
      letterSpacing: 2,
    },
    statusBadge: {
      paddingHorizontal: n(12),
      paddingVertical: n(6),
      borderRadius: n(16),
    },
    statusText: {
      fontSize: nf(12),
      fontWeight: '600',
    },
    tokenDetails: {
      marginTop: n(12),
      paddingTop: n(12),
      borderTopWidth: n(1),
      borderTopColor: '#E0E0E0',
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: n(8),
    },
    detailText: {
      marginLeft: n(8),
      fontSize: nf(14),
      color: '#666',
    },
    actionButtons: {
      flexDirection: 'row',
      marginTop: n(16),
      flexWrap: 'wrap',
      gap: n(8),
    },
    actionButton: {
      flex: 1,
      minWidth: n(90),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: n(10),
      paddingHorizontal: n(12),
      borderRadius: n(8),
      backgroundColor: '#F5F5F5',
      borderWidth: n(1),
      borderColor: '#E0E0E0',
    },
    copyButton: {},
    urlButton: {},
    shareButton: {},
    actionButtonText: {
      marginLeft: n(6),
      fontSize: nf(14),
      color: '#0984e3',
      fontWeight: '600',
    },
    darkContainer: {
      backgroundColor: '#121212',
    },
    darkLoadingContainer: {
      backgroundColor: '#121212',
    },
    darkInfoBox: {
      backgroundColor: '#1e3a5f',
    },
    darkInfoText: {
      color: '#93c5fd',
    },
    darkInactiveBanner: {
      backgroundColor: '#3d2a1a',
    },
    darkInactiveBannerText: {
      color: '#fdba74',
    },
    darkInactiveHint: {
      color: '#fb923c',
    },
    darkEmptyText: {
      color: '#94a3b8',
    },
    darkTokenCard: {
      backgroundColor: '#1e293b',
    },
    darkTokenLabel: {
      color: '#94a3b8',
    },
    darkTokenValue: {
      color: '#f1f5f9',
    },
    darkTokenDetails: {
      borderTopColor: '#334155',
    },
    darkDetailText: {
      color: '#cbd5e1',
    },
    darkActionButton: {
      backgroundColor: '#334155',
      borderColor: '#475569',
    },
    darkActionButtonText: {
      color: '#7dd3fc',
    },
  });

  return { styles, n, nf, nv, contentMaxWidth };
}
