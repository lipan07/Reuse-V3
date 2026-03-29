import { StyleSheet } from 'react-native';
import { getAccountUiMetrics } from '../../utils/accountUiMetrics';

export function buildFeedbackStyles(width, height) {
  const { n, nf, nv, contentMaxWidth } = getAccountUiMetrics(width, height);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    darkContainer: {
      backgroundColor: '#121212',
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: '#E0E0E0',
    },
    darkSeparator: {
      backgroundColor: '#333',
    },
    scrollContainer: {
      flexGrow: 1,
      paddingTop: n(10),
      paddingBottom: nv(30),
      alignSelf: 'center',
      width: '100%',
      maxWidth: contentMaxWidth,
    },
    darkScrollContainer: {
      backgroundColor: '#121212',
    },
    content: {
      padding: n(20),
      alignItems: 'center',
    },
    iconContainer: {
      width: n(100),
      height: n(100),
      borderRadius: n(50),
      backgroundColor: '#E8F5E9',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: n(20),
    },
    feedbackIcon: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    subtitle: {
      fontSize: nf(18),
      fontWeight: '600',
      marginBottom: n(20),
      color: '#333',
      textAlign: 'center',
    },
    rating: {
      marginBottom: n(30),
      paddingVertical: n(10),
    },
    label: {
      alignSelf: 'flex-start',
      fontSize: nf(16),
      fontWeight: '500',
      marginBottom: n(10),
      color: '#333',
    },
    input: {
      width: '100%',
      minHeight: nv(120),
      borderWidth: n(1),
      borderColor: '#ddd',
      borderRadius: n(8),
      padding: n(15),
      marginBottom: n(25),
      fontSize: nf(16),
      textAlignVertical: 'top',
    },
    submitButton: {
      width: '100%',
      backgroundColor: '#4CAF50',
      padding: n(15),
      borderRadius: n(8),
      alignItems: 'center',
    },
    submitButtonText: {
      color: '#fff',
      fontSize: nf(16),
      fontWeight: 'bold',
    },
  });

  return { styles, n, nf, nv, contentMaxWidth };
}
