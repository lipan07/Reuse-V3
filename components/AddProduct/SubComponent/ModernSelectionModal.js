import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Responsive scaling functions
const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

// Get safe area insets for different devices
const isIphoneX = Platform.OS === 'ios' && (height >= 812 || width >= 812);
const bottomSafeArea = isIphoneX ? 34 : 0;

const ModernSelectionModal = ({
  visible,
  title,
  options, // Array of { label, value } or just array of strings
  selectedValue,
  onSelect,
  onClose,
  searchable = false, // Enable search for long lists
  multiColumn = false, // Display options in grid for short options
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize options to always have label/value format
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  // Filter options based on search
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
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.bottomSheet}>
              {/* Handle bar */}
              <View style={styles.handleBar} />

              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {searchable && (
                  <View style={styles.searchContainer}>
                    <Icon name="search" size={normalize(14)} color="#999" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="times-circle" size={normalize(16)} color="#999" />
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
                    <Icon name="search" size={normalize(40)} color="#DDD" />
                    <Text style={styles.emptyText}>No results found</Text>
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    paddingTop: normalizeVertical(8),
    maxHeight: height * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: normalize(36),
    height: normalizeVertical(3),
    backgroundColor: '#DDD',
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
    color: '#1A1A1A',
    marginBottom: normalizeVertical(12),
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: normalize(10),
    paddingHorizontal: normalize(12),
    paddingVertical: normalizeVertical(10),
  },
  searchIcon: {
    marginRight: normalize(8),
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(14),
    color: '#333',
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
    backgroundColor: '#F8F8F8',
    borderRadius: normalize(10),
    marginBottom: normalizeVertical(8),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  listOptionText: {
    fontSize: normalize(15),
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  selectedOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  selectedText: {
    color: '#2E7D32',
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
    backgroundColor: '#F8F8F8',
    borderRadius: normalize(10),
    marginBottom: normalizeVertical(10),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  gridOptionText: {
    fontSize: normalize(14),
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: normalizeVertical(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: normalize(14),
    color: '#999',
    marginTop: normalizeVertical(12),
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: normalizeVertical(14),
    marginHorizontal: normalize(20),
    borderRadius: normalize(12),
    alignItems: 'center',
    marginBottom: Platform.select({
      ios: normalizeVertical(12) + bottomSafeArea,
      android: normalizeVertical(12),
      default: normalizeVertical(12),
    }),
    marginTop: normalizeVertical(8),
  },
  closeButtonText: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: '#666',
  },
});

export default ModernSelectionModal;

