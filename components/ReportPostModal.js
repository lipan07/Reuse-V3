import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    TextInput,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ModalScreen from './SupportElement/ModalScreen';

const { width } = Dimensions.get('window');

const ReportPostModal = ({ visible, onClose, onSubmit, postId }) => {
    const [reason, setReason] = useState('spam');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState('warning');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const reasons = [
        { label: 'Spam', value: 'spam', icon: 'alert-octagon' },
        { label: 'Inappropriate', value: 'inappropriate', icon: 'account-off' },
        { label: 'False Info', value: 'false_info', icon: 'cancel' },
        { label: 'Other', value: 'other', icon: 'dots-horizontal' },
    ];

    const handleSubmit = async () => {
        if (!description.trim()) {
            // Replace Dialog with ModalScreen state
            setAlertType('warning');
            setAlertTitle('Missing Information');
            setAlertMessage('Please provide a description for your report');
            setAlertVisible(true);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                reason,
                description: description.trim(),
            });
        } finally {
            setIsSubmitting(false);
        }

    };

    return (
        <>
            <ModalScreen
                visible={alertVisible}
                type={alertType}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
            />
            <Modal
                visible={visible}
                animationType="fade"
                transparent
                onRequestClose={onClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Report This Post</Text>

                        <Text style={styles.subTitle}>Why are you reporting this post?</Text>

                        <View style={styles.reasonContainer}>
                            {reasons.map(({ label, value, icon }) => (
                                <TouchableOpacity
                                    key={value}
                                    style={[
                                        styles.reasonButton,
                                        reason === value && styles.selectedReason
                                    ]}
                                    onPress={() => setReason(value)}
                                >
                                    <Icon
                                        name={icon}
                                        size={20}
                                        color={reason === value ? '#fff' : '#007bff'}
                                    />
                                    <Text style={[
                                        styles.reasonText,
                                        reason === value && styles.selectedReasonText
                                    ]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Please describe the issue..."
                                placeholderTextColor="#999"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                style={styles.input}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <Text style={styles.charCount}>
                                {description.length}/500
                            </Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        Submit Report
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1,
        padding: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 8,
    },
    subTitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    reasonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 25,
    },
    reasonButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        borderWidth: 1.5,
        borderColor: '#e9ecef',
    },
    selectedReason: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    reasonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#495057',
    },
    selectedReasonText: {
        color: '#fff',
    },
    inputContainer: {
        marginBottom: 25,
        position: 'relative',
    },
    input: {
        minHeight: 120,
        maxHeight: 200,
        width: '100%',
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        borderWidth: 1.5,
        borderColor: '#e9ecef',
        fontSize: 16,
        color: '#1a1a1a',
        textAlignVertical: 'top',
    },
    charCount: {
        position: 'absolute',
        bottom: 10,
        right: 15,
        color: '#6c757d',
        fontSize: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#6c757d',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        flex: 2,
        borderRadius: 12,
        backgroundColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ReportPostModal;