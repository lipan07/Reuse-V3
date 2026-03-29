import { StyleSheet } from 'react-native';
import { getAccountUiMetrics } from '../../utils/accountUiMetrics';

export function buildEditProfileStyles(width, height) {
  const { n, nf, nv, contentMaxWidth } = getAccountUiMetrics(width, height);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      padding: n(16),
      alignSelf: 'center',
      width: '100%',
      maxWidth: contentMaxWidth,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
    },
    loaderText: {
      marginTop: n(16),
      color: '#64748B',
      fontSize: nf(16),
    },
    header: {
      alignItems: 'center',
      marginBottom: n(24),
    },
    headerTitle: {
      fontSize: nf(28),
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: n(8),
      marginTop: nv(35),
    },
    headerSubtitle: {
      fontSize: nf(14),
      color: '#64748B',
      textAlign: 'center',
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: n(24),
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: n(100),
      height: n(100),
      borderRadius: n(50),
      borderWidth: n(3),
      borderColor: '#E5E7EB',
    },
    avatarPlaceholder: {
      width: n(100),
      height: n(100),
      borderRadius: n(50),
      backgroundColor: '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: n(2),
      borderColor: '#E5E7EB',
    },
    cameraIcon: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundColor: '#6366F1',
      width: n(32),
      height: n(32),
      borderRadius: n(16),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: n(2),
      borderColor: '#fff',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: n(16),
      padding: n(20),
      marginBottom: n(16),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    businessCard: {
      marginBottom: n(16),
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: n(20),
    },
    cardTitle: {
      fontSize: nf(16),
      fontWeight: '600',
      color: '#1F2937',
      marginLeft: n(12),
      flex: 1,
    },
    inputContainer: {
      marginBottom: n(16),
    },
    inputLabel: {
      fontSize: nf(14),
      fontWeight: '500',
      color: '#374151',
      marginBottom: n(8),
    },
    input: {
      backgroundColor: '#F9FAFB',
      borderWidth: n(1),
      borderColor: '#E5E7EB',
      borderRadius: n(12),
      padding: n(16),
      fontSize: nf(15),
      color: '#1F2937',
    },
    bioInput: {
      height: nv(100),
      textAlignVertical: 'top',
    },
    nameRow: {
      flexDirection: 'row',
      gap: n(12),
    },
    divider: {
      height: n(1),
      backgroundColor: '#E5E7EB',
      marginVertical: n(20),
    },
    spacer: {
      height: n(20),
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      padding: n(16),
      borderTopWidth: n(1),
      borderTopColor: '#E5E7EB',
    },
    saveButton: {
      backgroundColor: '#6366F1',
      borderRadius: n(12),
      padding: n(18),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: n(8),
    },
    saveButtonDisabled: {
      backgroundColor: '#9CA3AF',
    },
    saveButtonText: {
      color: '#fff',
      fontSize: nf(16),
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: n(20),
    },
    modalContainer: {
      backgroundColor: '#fff',
      borderRadius: n(20),
      padding: n(24),
      width: '100%',
      maxWidth: n(400),
      alignItems: 'center',
    },
    modalIconContainer: {
      width: n(48),
      height: n(48),
      borderRadius: n(24),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: n(16),
    },
    successIcon: {
      backgroundColor: '#10B981',
    },
    warningIcon: {
      backgroundColor: '#F59E0B',
    },
    dangerIcon: {
      backgroundColor: '#EF4444',
    },
    modalTitle: {
      fontSize: nf(18),
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: n(8),
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: nf(15),
      color: '#64748B',
      marginBottom: n(24),
      textAlign: 'center',
      lineHeight: nf(22),
    },
    modalButton: {
      backgroundColor: '#6366F1',
      borderRadius: n(12),
      padding: n(16),
      width: '100%',
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: nf(16),
    },
  });

  return { styles, n, nf, nv, contentMaxWidth };
}
