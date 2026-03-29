import { StyleSheet } from 'react-native';
import { getAccountUiMetrics } from '../../utils/accountUiMetrics';

export function buildHelpSupportStyles(width, height) {
  const { n, nf, nv, contentMaxWidth } = getAccountUiMetrics(width, height);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F7FA',
    },
    scrollContainer: {
      padding: n(16),
      paddingBottom: nv(32),
      alignSelf: 'center',
      width: '100%',
      maxWidth: contentMaxWidth,
    },
    welcomeCard: {
      backgroundColor: '#fff',
      borderRadius: n(12),
      padding: n(20),
      marginBottom: n(16),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    welcomeTitle: {
      fontSize: nf(18),
      fontWeight: '600',
      color: '#333',
      marginTop: n(8),
      marginBottom: n(4),
    },
    welcomeText: {
      fontSize: nf(14),
      color: '#666',
      textAlign: 'center',
      lineHeight: nf(20),
    },
    sectionHeaderText: {
      fontSize: nf(16),
      fontWeight: '600',
      color: '#333',
      marginBottom: n(12),
      marginTop: n(8),
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: n(12),
      padding: n(16),
      marginBottom: n(16),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    questionContainer: {
      flexDirection: 'row',
      paddingVertical: n(12),
    },
    questionBorder: {
      borderBottomWidth: n(1),
      borderBottomColor: '#f0f0f0',
    },
    questionIcon: {
      marginRight: n(12),
      marginTop: n(2),
    },
    questionTextContainer: {
      flex: 1,
    },
    questionText: {
      fontWeight: '500',
      fontSize: nf(14),
      color: '#333',
      marginBottom: n(4),
    },
    warningText: {
      color: '#FF3B30',
    },
    answerText: {
      fontSize: nf(13),
      color: '#666',
      lineHeight: nf(18),
    },
    inputContainer: {
      marginBottom: n(16),
    },
    inputLabel: {
      fontSize: nf(13),
      color: '#666',
      marginBottom: n(6),
    },
    input: {
      backgroundColor: '#F5F7FA',
      borderRadius: n(8),
      padding: n(12),
      fontSize: nf(14),
      borderWidth: n(1),
      borderColor: '#E0E0E0',
      color: '#333',
    },
    messageInput: {
      height: nv(120),
    },
    charCounter: {
      fontSize: nf(11),
      color: '#999',
      textAlign: 'right',
      marginTop: n(4),
    },
    submitButton: {
      backgroundColor: '#007BFF',
      borderRadius: n(8),
      padding: n(14),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: n(8),
    },
    submitButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: nf(14),
      marginRight: n(8),
    },
    contactOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: n(12),
    },
    contactIcon: {
      marginRight: n(12),
    },
    contactText: {
      flex: 1,
      fontSize: nf(14),
      color: '#333',
    },
    contactArrow: {
      marginLeft: 'auto',
    },

    darkContainer: {
      backgroundColor: '#121212',
    },
    darkWelcomeCard: {
      backgroundColor: '#1e293b',
    },
    darkWelcomeTitle: {
      color: '#f1f5f9',
    },
    darkWelcomeText: {
      color: '#94a3b8',
    },
    darkSectionHeader: {
      color: '#f1f5f9',
    },
    darkCard: {
      backgroundColor: '#1e293b',
    },
    darkQuestionBorder: {
      borderBottomColor: '#334155',
    },
    darkQuestionText: {
      color: '#e2e8f0',
    },
    darkAnswerText: {
      color: '#94a3b8',
    },
    darkInputLabel: {
      color: '#cbd5e1',
    },
    darkInput: {
      backgroundColor: '#0f172a',
      borderColor: '#475569',
      color: '#f1f5f9',
    },
    darkCharCounter: {
      color: '#64748b',
    },
    darkContactText: {
      color: '#e2e8f0',
    },
  });

  return { styles, n, nf, nv, contentMaxWidth };
}
