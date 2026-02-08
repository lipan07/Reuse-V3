import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Alert,
    StatusBar,
    ScrollView,
    Platform,
    Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Screens/Header';
import CustomStatusBar from './Screens/CustomStatusBar';
import styles from '../assets/css/Settings.styles';

const SettingsPage = ({ navigation }) => {
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const handleDeleteAccount = () => setIsDeleteModalVisible(true);
    const handleLogoutAllDevices = () => setIsLogoutModalVisible(true);
    const toggle2FA = () => setIs2FAEnabled(previousState => !previousState);
    const toggleDarkMode = () => setIsDarkMode(previousState => !previousState);

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
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            } else {
                Alert.alert('Error', 'There was an issue deleting your account.');
            }
        } catch (error) {
            console.error("Failed to delete account:", error);
            Alert.alert('Error', 'Failed to delete account. Please try again.');
        }
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
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            } else {
                Alert.alert('Error', 'There was an issue logging out from all devices.');
            }
        } catch (error) {
            console.error("Failed to logout from all devices:", error);
            Alert.alert('Error', 'Failed to logout from all devices. Please try again.');
        }
    };

    const renderSettingItem = (text, icon, color, onPress, isSwitch = false, value = false) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={!isSwitch ? onPress : null}
            activeOpacity={0.8}
        >
            <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
                <Icon name={icon} size={normalize(22)} color={color} />
            </View>
            <Text style={styles.settingText}>{text}</Text>
            {isSwitch ? (
                <Switch
                    trackColor={{ false: "#767577", true: color }}
                    thumbColor={value ? "#fff" : "#f4f3f4"}
                    onValueChange={onPress}
                    value={value}
                />
            ) : (
                <Icon name="chevron-right" size={normalize(20)} color="#bbb" />
            )}
        </TouchableOpacity>
    );

    return (
        <>
            <CustomStatusBar />
            <View style={[styles.container, isDarkMode && styles.darkContainer]}>
                {/* Header with proper spacing */}
                <Header
                    title="Settings"
                    navigation={navigation}
                    darkMode={darkMode}
                />

                <ScrollView
                    contentContainerStyle={[styles.scrollContainer, isDarkMode && styles.darkScrollContainer]}
                    showsVerticalScrollIndicator={false}
                >

                    <View style={styles.content}>
                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Appearance</Text>
                        {renderSettingItem(
                            'Dark Mode',
                            'weather-night',
                            '#6C757D',
                            toggleDarkMode,
                            true,
                            isDarkMode
                        )}

                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Security</Text>
                        {renderSettingItem(
                            'Two-Factor Authentication',
                            'shield-lock',
                            '#5CB85C',
                            toggle2FA,
                            true,
                            is2FAEnabled
                        )}
                        {renderSettingItem(
                            'Logout from All Devices',
                            'logout-variant',
                            '#F0AD4E',
                            handleLogoutAllDevices
                        )}

                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Account</Text>
                        {renderSettingItem(
                            'Delete Account',
                            'delete-outline',
                            '#D9534F',
                            handleDeleteAccount
                        )}
                    </View>
                </ScrollView>

                {/* Delete Confirmation Modal */}
                <Modal transparent animationType="fade" visible={isDeleteModalVisible}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContainer, isDarkMode && styles.darkModalContainer]}>
                            <Icon name="alert-circle-outline" size={normalize(40)} color="#D9534F" style={styles.modalIcon} />
                            <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>Delete Account?</Text>
                            <Text style={[styles.modalText, isDarkMode && styles.darkModalText]}>
                                This will permanently delete your account and all associated data. This action cannot be undone.
                            </Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.cancelButton, isDarkMode && styles.darkCancelButton]}
                                    onPress={() => setIsDeleteModalVisible(false)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.cancelButtonText, isDarkMode && styles.darkButtonText]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.confirmButton}
                                    onPress={confirmDeletion}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.confirmButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Logout Confirmation Modal */}
                <Modal transparent animationType="fade" visible={isLogoutModalVisible}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContainer, isDarkMode && styles.darkModalContainer]}>
                            <Icon name="logout-variant" size={normalize(40)} color="#F0AD4E" style={styles.modalIcon} />
                            <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>Logout Everywhere?</Text>
                            <Text style={[styles.modalText, isDarkMode && styles.darkModalText]}>
                                This will log you out from all devices where you're currently signed in.
                            </Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.cancelButton, isDarkMode && styles.darkCancelButton]}
                                    onPress={() => setIsLogoutModalVisible(false)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.cancelButtonText, isDarkMode && styles.darkButtonText]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.confirmButton, { backgroundColor: '#F0AD4E' }]}
                                    onPress={confirmLogout}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.confirmButtonText}>Logout</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    );
};

export default SettingsPage;