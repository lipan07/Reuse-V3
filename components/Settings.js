import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const SettingsPage = ({ navigation }) => {
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

    const handlePasswordChange = () => {
        navigation.navigate('ChangePassword');
    };

    const handleDeleteAccount = () => {
        setIsDeleteModalVisible(true);
    };

    const confirmDeletion = async () => {
        setIsDeleteModalVisible(false);
        try {
            const response = await fetch(`${process.env.BASE_URL}/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
            } else {
                Alert.alert('Error', 'There was an issue deleting your account.');
            }
        } catch (error) {
            console.error("Failed to delete account:", error);
            Alert.alert('Error', 'Failed to delete account. Please try again.');
        }
    };

    const handleLogoutAllDevices = () => {
        setIsLogoutModalVisible(true);
    };

    const confirmLogout = async () => {
        setIsLogoutModalVisible(false);
        try {
            const response = await fetch(`${process.env.BASE_URL}/logout-all-devices`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                Alert.alert('Logged Out', 'You have been logged out from all devices.');
            } else {
                Alert.alert('Error', 'There was an issue logging out from all devices.');
            }
        } catch (error) {
            console.error("Failed to logout from all devices:", error);
            Alert.alert('Error', 'Failed to logout from all devices. Please try again.');
        }
    };

    const handleUse2FA = () => {
        // Logic for enabling or managing 2FA
    };

    const renderSettingLink = (text, icon, color, onPress) => (
        <TouchableOpacity style={styles.linkItem} onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
                <Icon name={icon} size={normalize(22)} color={color} />
            </View>
            <Text style={styles.linkText}>{text}</Text>
            <Icon name="chevron-right" size={normalize(18)} color="#bbb" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* {renderSettingLink('Change Password', 'key-variant', '#D9534F', handlePasswordChange)} */}
            {renderSettingLink('Delete Account', 'delete-outline', '#4B9CD3', handleDeleteAccount)}
            {renderSettingLink('Logout from All Devices', 'logout-variant', '#F0AD4E', handleLogoutAllDevices)}
            {renderSettingLink('Use 2FA Authorization', 'shield-lock', '#5CB85C', handleUse2FA)}

            {/* Delete Confirmation Modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={isDeleteModalVisible}
                onRequestClose={() => setIsDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm Deletion</Text>
                        <Text style={styles.modalText}>Are you sure you want to delete this account permanently?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsDeleteModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={confirmDeletion}>
                                <Text style={styles.confirmButtonText}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Logout Confirmation Modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={isLogoutModalVisible}
                onRequestClose={() => setIsLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm Logout</Text>
                        <Text style={styles.modalText}>Are you sure you want to log out from all devices?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsLogoutModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={confirmLogout}>
                                <Text style={styles.confirmButtonText}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: normalize(30),
        marginTop: normalize(50),
        paddingHorizontal: normalize(18),
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalize(16),
        backgroundColor: '#FFFFFF',
        paddingVertical: normalize(14),
        paddingHorizontal: normalize(16),
        borderRadius: normalize(12),
        width: '100%',
        maxWidth: 420,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    iconCircle: {
        width: normalize(38),
        height: normalize(38),
        borderRadius: normalize(19),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: normalize(14),
    },
    linkText: {
        flex: 1,
        fontSize: normalize(16),
        color: '#222',
        fontWeight: '500',
        marginLeft: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: normalize(24),
        borderRadius: 12,
        width: '85%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: 'bold',
        marginBottom: normalize(10),
        color: '#222',
    },
    modalText: {
        fontSize: normalize(16),
        color: '#333',
        textAlign: 'center',
        marginBottom: normalize(20),
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#ccc',
        paddingVertical: normalize(12),
        borderRadius: 6,
        alignItems: 'center',
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#4B9CD3',
        paddingVertical: normalize(12),
        borderRadius: 6,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default SettingsPage;