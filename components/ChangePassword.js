import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const ChangePassword = () => {
    const { isDarkMode } = useTheme();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        // Basic validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: 'Error!',
                textBody: 'Please fill out all fields.',
                button: 'close',
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: 'Error!',
                textBody: 'New password and confirm password do not match.',
                button: 'close',
            });
            return;
        }
        if (newPassword.length < 8) {
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: 'Error!',
                textBody: 'New password must be at least 8 characters long.',
                button: 'close',
            });
            return;
        }

        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${process.env.BASE_URL}/settings/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: result.message,
                    button: 'close',
                });

                // Clear input fields after successful password change
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error!',
                    textBody: result.message || 'Something went wrong. Please try again.',
                    button: 'close',
                });
            }
        } catch (error) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error!',
                textBody: 'Network error. Please try again.',
                button: 'close',
            });
        }
    };

    const ph = isDarkMode ? '#64748b' : undefined;

    return (
        <View style={[styles.container, isDarkMode && styles.darkContainer]}>
            <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Change Password</Text>

            <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Current Password"
                placeholderTextColor={ph}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
            />

            <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="New Password"
                placeholderTextColor={ph}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />

            <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Confirm New Password"
                placeholderTextColor={ph}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    darkTitle: {
        color: '#f1f5f9',
    },
    darkInput: {
        backgroundColor: '#1e293b',
        borderColor: '#475569',
        color: '#f1f5f9',
    },
});

export default ChangePassword;
