import { StyleSheet } from 'react-native';
import { getAccountUiMetrics } from '../../utils/accountUiMetrics';

export function buildAccountPageStyles(width, height) {
  const { n, nf, nv, contentMaxWidth } = getAccountUiMetrics(width, height);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    scrollContent: {
      paddingTop: n(4),
      paddingBottom: n(28),
      flexGrow: 1,
    },
    mainContainer: {
      paddingHorizontal: n(24),
      alignSelf: 'center',
      width: '100%',
      maxWidth: contentMaxWidth,
    },
    header: {
      alignItems: 'center',
      marginTop: n(16),
      marginBottom: n(28),
    },
    imageContainer: {
      position: 'relative',
      marginBottom: n(12),
    },
    avatar: {
      width: n(86),
      height: n(86),
      borderRadius: n(43),
      backgroundColor: '#f1f5f9',
    },
    badgeEdit: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#1e293b',
      width: n(26),
      height: n(26),
      borderRadius: n(13),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFF',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    greeting: {
      fontSize: nf(20),
      fontWeight: '800',
      color: '#1e293b',
      letterSpacing: -0.5,
    },
    subGreeting: {
      fontSize: nf(13),
      color: '#64748b',
      marginTop: n(4),
    },
    section: {
      marginBottom: n(22),
    },
    sectionLabel: {
      fontSize: nf(11),
      fontWeight: '700',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: n(12),
      marginLeft: n(2),
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: n(14),
      borderBottomWidth: 1,
      borderBottomColor: '#f8fafc',
    },
    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      width: n(34),
      height: n(34),
      borderRadius: n(10),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: n(12),
    },
    menuText: {
      fontSize: nf(15),
      fontWeight: '500',
      color: '#334155',
    },
    logoutBtn: {
      marginTop: n(18),
      paddingVertical: n(16),
      alignItems: 'center',
      borderRadius: n(14),
      backgroundColor: '#fff1f2',
      borderWidth: 1,
      borderColor: '#ffe4e6',
    },
    logoutText: {
      color: '#e11d48',
      fontWeight: '700',
      fontSize: nf(14),
    },
  });

  return { styles, n, nf, nv, contentMaxWidth };
}
