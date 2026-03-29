import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../context/ThemeContext';

function createModernSelectionStyles(width, height, isDarkMode) {
  const d = isDarkMode;
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  const scale = Math.min(Math.max(shortSide / 375, 0.9), 1.08);
  const verticalScale = Math.min(Math.max(longSide / 812, 0.9), 1.08);
  const normalize = (size) => Math.round(scale * size);
  const normalizeVertical = (size) => Math.round(verticalScale * size);
  const mutedIcon = d ? '#94a3b8' : '#999';
  const emptyIcon = d ? '#475569' : '#DDD';

  return {
    styles: StyleSheet.create({
      overlay: {
        flex: 1,
        position: 'relative',
      },
      modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modernBottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
      },
      bottomSheet: {
        backgroundColor: d ? '#1e293b' : '#FFFFFF',
        borderTopLeftRadius: normalize(20),
        borderTopRightRadius: normalize(20),
        paddingTop: normalizeVertical(8),
        paddingBottom: 0,
        maxHeight: height * 0.75,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: d ? 0.35 : 0.1,
        shadowRadius: 12,
        elevation: 20,
        width: '100%',
        marginBottom: 0,
      },
      handleBar: {
        width: normalize(36),
        height: normalizeVertical(3),
        backgroundColor: d ? '#475569' : '#DDD',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: normalizeVertical(12),
      },
      header: {
        paddingHorizontal: normalize(20),
        paddingBottom: normalizeVertical(12),
      },
      title: {
        fontSize: normalize(20),
        fontWeight: '700',
        color: d ? '#f1f5f9' : '#1A1A1A',
        marginBottom: normalizeVertical(12),
        textAlign: 'center',
      },
      searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: d ? '#0f172a' : '#F5F5F5',
        borderRadius: normalize(10),
        paddingHorizontal: normalize(12),
        paddingVertical: normalizeVertical(10),
        borderWidth: d ? 1 : 0,
        borderColor: d ? '#334155' : 'transparent',
      },
      searchIcon: {
        marginRight: normalize(8),
      },
      searchInput: {
        flex: 1,
        fontSize: normalize(14),
        color: d ? '#f1f5f9' : '#333',
        paddingVertical: 0,
      },
      scrollView: {
        maxHeight: height * 0.5,
      },
      scrollContent: {
        paddingHorizontal: normalize(20),
        paddingBottom: normalizeVertical(12),
      },
      listContainer: {
        width: '100%',
      },
      listOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: normalizeVertical(14),
        paddingHorizontal: normalize(16),
        backgroundColor: d ? '#0f172a' : '#F8F8F8',
        borderRadius: normalize(10),
        marginBottom: normalizeVertical(8),
        borderWidth: 1,
        borderColor: d ? '#334155' : 'transparent',
      },
      listOptionText: {
        fontSize: normalize(15),
        color: d ? '#e2e8f0' : '#333',
        fontWeight: '500',
        flex: 1,
      },
      selectedOption: {
        backgroundColor: d ? '#14532d' : '#E8F5E9',
        borderColor: '#4CAF50',
      },
      selectedText: {
        color: d ? '#86efac' : '#2E7D32',
        fontWeight: '600',
      },
      gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      },
      gridOption: {
        width: '48%',
        paddingVertical: normalizeVertical(14),
        paddingHorizontal: normalize(12),
        backgroundColor: d ? '#0f172a' : '#F8F8F8',
        borderRadius: normalize(10),
        marginBottom: normalizeVertical(10),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: d ? '#334155' : 'transparent',
      },
      gridOptionText: {
        fontSize: normalize(14),
        color: d ? '#e2e8f0' : '#333',
        fontWeight: '500',
        textAlign: 'center',
      },
      emptyContainer: {
        paddingVertical: normalizeVertical(40),
        alignItems: 'center',
      },
      emptyText: {
        fontSize: normalize(14),
        color: d ? '#94a3b8' : '#999',
        marginTop: normalizeVertical(12),
      },
      closeButton: {
        backgroundColor: d ? '#334155' : '#F5F5F5',
        paddingVertical: normalizeVertical(14),
        marginHorizontal: normalize(20),
        borderRadius: normalize(12),
        alignItems: 'center',
        marginBottom: normalizeVertical(12),
        marginTop: normalizeVertical(8),
      },
      closeButtonText: {
        fontSize: normalize(15),
        fontWeight: '600',
        color: d ? '#cbd5e1' : '#666',
      },
    }),
    normalize,
    mutedIcon,
    emptyIcon,
  };
}

const ModernSelectionModal = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  searchable = false,
  multiColumn = false,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  const { styles, normalize, mutedIcon, emptyIcon } = useMemo(
    () => createModernSelectionStyles(width, height, isDarkMode),
    [width, height, isDarkMode]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const placeholderColor = isDarkMode ? '#64748b' : '#999';

  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const filteredOptions = searchable
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : normalizedOptions;

  const handleSelect = (value) => {
    onSelect(value);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.modernBottomSheet} pointerEvents="box-none">
            <View style={styles.bottomSheet}>
              <View style={styles.handleBar} />

              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {searchable && (
                  <View style={styles.searchContainer}>
                    <Icon name="search" size={normalize(14)} color={mutedIcon} style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search..."
                      placeholderTextColor={placeholderColor}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="times-circle" size={normalize(16)} color={mutedIcon} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={multiColumn ? styles.gridContainer : styles.listContainer}>
                  {filteredOptions.map((option, index) => {
                    const isSelected = selectedValue === option.value;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          multiColumn ? styles.gridOption : styles.listOption,
                          isSelected && styles.selectedOption,
                        ]}
                        onPress={() => handleSelect(option.value)}
                      >
                        <Text
                          style={[
                            multiColumn ? styles.gridOptionText : styles.listOptionText,
                            isSelected && styles.selectedText,
                          ]}
                          numberOfLines={1}
                        >
                          {option.label}
                        </Text>
                        {isSelected && !multiColumn && (
                          <Icon name="check" size={normalize(16)} color="#4CAF50" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {filteredOptions.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Icon name="search" size={normalize(40)} color={emptyIcon} />
                    <Text style={styles.emptyText}>No results found</Text>
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
              {insets.bottom > 0 && <View style={{ height: insets.bottom }} />}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default ModernSelectionModal;
