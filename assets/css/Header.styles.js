import { StyleSheet, Platform, StatusBar } from 'react-native';
import { getAccountUiMetrics } from '../../utils/accountUiMetrics';

const baseStatusBarInset = Platform.select({
  ios: 44,
  android: StatusBar.currentHeight ?? 24,
  default: 24,
});

/**
 * Secondary screen header (back + title). Uses capped scaling so title and controls
 * stay compact on tablets and large phones.
 */
export function buildHeaderStyles(width, height) {
  const { n, nf, nv } = getAccountUiMetrics(width, height);

  const styles = StyleSheet.create({
    headerContainer: {
      backgroundColor: '#FFFFFF',
      paddingTop: baseStatusBarInset + n(4),
      paddingBottom: n(6),
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
      paddingHorizontal: n(12),
      paddingVertical: n(4),
      minHeight: nv(36),
    },
    backButton: {
      marginRight: n(10),
      padding: n(2),
    },
    title: {
      flex: 1,
      fontSize: nf(17),
      fontWeight: '600',
      color: '#000000',
      ...(Platform.OS === 'android' && { includeFontPadding: false }),
    },
    darkTitle: {
      color: '#FFFFFF',
    },
  });

  return { styles, n, nf, nv };
}
