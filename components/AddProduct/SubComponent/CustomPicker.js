import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

function createCustomPickerStyles(width, height, isDarkMode) {
  const d = isDarkMode;
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  const scale = Math.min(Math.max(shortSide / 375, 0.9), 1.08);
  const verticalScale = Math.min(Math.max(longSide / 812, 0.9), 1.08);
  const normalize = (size) => Math.round(scale * size);
  const normalizeVertical = (size) => Math.round(verticalScale * size);

  return StyleSheet.create({
    pickerContainer: {
      borderWidth: 1,
      borderColor: d ? '#475569' : '#ccc',
      borderRadius: normalize(8),
      paddingVertical: normalizeVertical(10),
      paddingHorizontal: normalize(10),
      backgroundColor: d ? '#1e293b' : '#fff',
      marginBottom: normalizeVertical(14),
      minHeight: normalizeVertical(44),
      justifyContent: 'center',
    },
    pickerText: {
      fontSize: normalize(13),
      color: d ? '#f1f5f9' : '#222',
    },
    pickerPlaceholder: {
      color: d ? '#64748b' : '#aaa',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      padding: normalize(24),
    },
    modalContent: {
      backgroundColor: d ? '#1e293b' : '#fff',
      borderRadius: normalize(10),
      maxHeight: normalizeVertical(320),
      overflow: 'hidden',
      borderWidth: d ? 1 : 0,
      borderColor: d ? '#334155' : 'transparent',
    },
    option: {
      paddingVertical: normalizeVertical(14),
      paddingHorizontal: normalize(18),
    },
    optionText: {
      fontSize: normalize(15),
      color: d ? '#e2e8f0' : '#222',
    },
    separator: {
      height: 1,
      backgroundColor: d ? '#334155' : '#eee',
      marginHorizontal: normalize(10),
    },
    modalHeader: {
      paddingVertical: normalizeVertical(14),
      paddingHorizontal: normalize(18),
      borderBottomWidth: 1,
      borderBottomColor: d ? '#334155' : '#eee',
      backgroundColor: d ? '#0f172a' : '#f8f8f8',
    },
    modalHeaderText: {
      fontSize: normalize(16),
      color: d ? '#60a5fa' : '#007BFF',
      fontWeight: '600',
      textAlign: 'center',
    },
    listContent: {
      paddingBottom: normalizeVertical(16),
    },
  });
}

const CustomPicker = ({ label, value, options, onSelect }) => {
  const [visible, setVisible] = useState(false);
  const { width, height } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  const styles = useMemo(
    () => createCustomPickerStyles(width, height, isDarkMode),
    [width, height, isDarkMode]
  );

  useEffect(() => {
    const backAction = () => {
      if (visible) {
        setVisible(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [visible]);

  return (
    <>
      <TouchableOpacity style={styles.pickerContainer} onPress={() => setVisible(true)}>
        <Text style={[styles.pickerText, !value && styles.pickerPlaceholder]}>
          {value ? options.find((opt) => opt.value === value)?.label : label}
        </Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Select from the list</Text>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default CustomPicker;
