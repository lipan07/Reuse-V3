import { StyleSheet } from 'react-native';
import { getAccountUiMetrics } from '../../utils/accountUiMetrics';

export function buildAccountPageStyles(width, height) {
  const { n, nf, nv, contentMaxWidth } = getAccountUiMetrics(width, height);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // Match Settings / Help / Feedback: gray body so white header bar reads as separate
      backgroundColor: '#F5F5F5',
    },
    darkContainer: {
      backgroundColor: '#121212',
    },
    safeArea: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: n(8),
      paddingBottom: n(28),
      flexGrow: 1,
      backgroundColor: '#F5F5F5',
    },
    scrollBody: {
      flex: 1,
      width: '100%',
      maxWidth: contentMaxWidth,
      alignSelf: 'center',
      paddingHorizontal: n(24),
    },
    logoutSpacer: {
      flexGrow: 1,
      minHeight: n(20),
    },
    darkScrollContent: {
      backgroundColor: '#121212',
    },
    mainContainer: {
      width: '100%',
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
      paddingHorizontal: n(14),
      marginBottom: n(10),
      backgroundColor: '#FFFFFF',
      borderRadius: n(12),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: '#E8E8E8',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
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
      marginTop: n(8),
      marginBottom: n(8),
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
    darkSafeArea: {
      backgroundColor: '#121212',
    },
    darkGreeting: {
      color: '#f1f5f9',
    },
    darkSubGreeting: {
      color: '#94a3b8',
    },
    darkSectionLabel: {
      color: '#64748b',
    },
    darkMenuItem: {
      backgroundColor: '#1E1E1E',
      borderColor: '#333333',
      shadowOpacity: 0.25,
    },
    darkMenuText: {
      color: '#e2e8f0',
    },
    darkLogoutBtn: {
      backgroundColor: '#2a1518',
      borderColor: '#4c0519',
    },
  });

  return { styles, n, nf, nv, contentMaxWidth };
}
