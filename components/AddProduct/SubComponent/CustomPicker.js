import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, BackHandler } from 'react-native';
const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const CustomPicker = ({ label, value, options, onSelect }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const backAction = () => {
            if (visible) {
                setVisible(false);
                return true; // Prevent default back behavior
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [visible]);

    return (
        <>
            <TouchableOpacity style={styles.pickerContainer} onPress={() => setVisible(true)}>
                <Text style={[styles.pickerText, !value && { color: '#aaa' }]}>
                    {value ? options.find(opt => opt.value === value)?.label : label}
                </Text>
            </TouchableOpacity>
            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setVisible(false)}>
                    <View style={styles.modalContent}>
                        {/* Updated header with matching styling */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderText}>
                                Select from the list
                            </Text>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={item => item.value}
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

const styles = StyleSheet.create({
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc', // Match other input border color
        borderRadius: normalize(8),
        paddingVertical: normalizeVertical(10),
        paddingHorizontal: normalize(10),
        backgroundColor: '#fff',
        marginBottom: normalizeVertical(14),
        minHeight: normalizeVertical(44),
        justifyContent: 'center',
    },
    pickerText: {
        fontSize: normalize(13),
        color: '#222',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        padding: normalize(24),
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: normalize(10),
        maxHeight: normalizeVertical(320), // Responsive modal height
        overflow: 'hidden',
    },
    option: {
        paddingVertical: normalizeVertical(14),
        paddingHorizontal: normalize(18),
    },
    optionText: {
        fontSize: normalize(15),
        color: '#222',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginHorizontal: normalize(10),
    },
    modalHeader: {
        paddingVertical: normalizeVertical(14),
        paddingHorizontal: normalize(18),
        borderBottomWidth: 1,
        borderBottomColor: '#eee', // Match separator color
        backgroundColor: '#f8f8f8', // Light background
    },
    modalHeaderText: {
        fontSize: normalize(16),
        color: '#007BFF', // Match your primary color
        fontWeight: '600',
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: normalizeVertical(16),
    },
});

export default CustomPicker;