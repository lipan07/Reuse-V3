import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';

function getIconConfig(type, isDarkMode) {
  const d = isDarkMode;
  switch (type) {
    case 'success':
      return {
        name: 'check-circle',
        color: '#4CAF50',
        bg: d ? '#14532d' : '#E8F5E9',
      };
    case 'error':
      return {
        name: 'error-outline',
        color: '#f44336',
        bg: d ? '#450a0a' : '#FFEBEE',
      };
    case 'warning':
      return {
        name: 'warning',
        color: '#FF9800',
        bg: d ? '#422006' : '#FFF8E1',
      };
    default:
      return {
        name: 'info',
        color: '#2196F3',
        bg: d ? '#1e3a5f' : '#E3F2FD',
      };
  }
}

function createModalStyles(isDarkMode) {
  const d = isDarkMode;
  return StyleSheet.create({
    alertModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modernAlertContainer: {
      backgroundColor: d ? '#1e293b' : '#fff',
      borderRadius: 24,
      padding: 32,
      width: '100%',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: d ? 0.35 : 0.15,
      shadowRadius: 24,
      borderWidth: d ? 1 : 0,
      borderColor: d ? '#334155' : 'transparent',
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    modernAlertTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: d ? '#f1f5f9' : '#2d3436',
      marginBottom: 12,
      textAlign: 'center',
    },
    modernAlertMessage: {
      fontSize: 16,
      color: d ? '#94a3b8' : '#636e72',
      marginBottom: 28,
      textAlign: 'center',
      lineHeight: 24,
      fontWeight: '400',
    },
    modernAlertButton: {
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 44,
      overflow: 'hidden',
      alignSelf: 'stretch',
      alignItems: 'center',
    },
    modernAlertButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
}

const ModalScreen = ({ visible, type, title, message, onClose }) => {
  const { isDarkMode } = useTheme();
  const styles = useMemo(() => createModalStyles(isDarkMode), [isDarkMode]);
  const { name, color, bg } = getIconConfig(type, isDarkMode);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.alertModalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modernAlertContainer}>
              <View style={[styles.iconCircle, { backgroundColor: bg }]}>
                <MaterialIcons name={name} size={44} color={color} />
              </View>
              <Text style={styles.modernAlertTitle}>{title}</Text>
              <Text style={styles.modernAlertMessage}>{message}</Text>
              <TouchableOpacity
                style={[styles.modernAlertButton, { backgroundColor: color }]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.modernAlertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ModalScreen;
