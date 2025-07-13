import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ModalScreen from './SupportElement/ModalScreen.js'; // Adjust the path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage'; // assuming token might be needed


const { width, height } = Dimensions.get('window');
const scale = width / 375;
const verticalScale = height / 812;
const normalize = (size) => Math.round(scale * size);
const normalizeVertical = (size) => Math.round(verticalScale * size);

const HelpSupport = () => {
    const [issue, setIssue] = useState('');
    const [message, setMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('info');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [issueError, setIssueError] = useState('');
    const [messageError, setMessageError] = useState('');


    const handleSubmit = async () => {
        let hasError = false;

        if (issue.length > 50) {
            setIssueError('Issue type must be less than or equal to 50 characters.');
            hasError = true;
        } else {
            setIssueError('');
        }

        if (!message.trim()) {
            setMessageError('Please describe your issue.');
            hasError = true;
        } else if (message.length > 150) {
            setMessageError('Message must be less than or equal to 150 characters.');
            hasError = true;
        } else {
            setMessageError('');
        }

        if (hasError) {
            setModalType('error');
            setModalTitle('Validation Error');
            setModalMessage('Please fix the form validation errors before submitting.');
            setModalVisible(true);
            return;
        }

        try {
            const token = await AsyncStorage.getItem('authToken');
            const apiUrl = `${process.env.BASE_URL}/support-request`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    issue_type: issue,
                    message: message,
                }),
            });

            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong.');
            }

            setModalType('success');
            setModalTitle('Support Request Sent');
            setModalMessage('Our team will get back to you shortly.');
            setModalVisible(true);
            setIssue('');
            setMessage('');
        } catch (error) {
            setModalType('error');
            setModalTitle('Submission Failed');
            setModalMessage(error.message || 'Unable to send support request.');
            setModalVisible(true);
        }
    };


    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Solid Color Header (Replaced Linear Gradient) */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Icon name="support-agent" size={normalize(24)} color="#fff" />
                    <Text style={styles.title}>Help Center</Text>
                </View>
            </View>

            <Text style={styles.description}>
                Need help using Reuse? Whether you're buying or selling new or used items like mobiles, bikes, flats,
                electronics, services, or machinery — we're here to help!
            </Text>

            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Icon name="help-outline" size={normalize(20)} color="#0d6efd" />
                    <Text style={styles.sectionTitle}>Common Questions</Text>
                </View>

                {[
                    {
                        q: 'How do I post an ad?',
                        a: "Go to the 'Sell' tab and follow the steps to upload product details and images."
                    },
                    {
                        q: 'Is it free to post ads?',
                        a: 'Yes! Posting on Reuse is 100% free for everyone.'
                    },
                    {
                        q: 'What if I get scammed?',
                        a: 'Reuse encourages face-to-face deals in safe locations. If you suspect fraud, report the user immediately.'
                    },
                    {
                        q: 'Should I pay in advance before receiving the product?',
                        a: '❌ No. Reuse strongly advises users never to pay any advance money before inspecting and receiving the product. Always meet in person and verify the item before making any payment.',
                        warning: true
                    }
                ].map((item, index) => (
                    <View key={index} style={styles.questionContainer}>
                        <Icon
                            name={item.warning ? 'warning' : 'help'}
                            size={normalize(16)}
                            color={item.warning ? '#dc3545' : '#0d6efd'}
                            style={styles.icon}
                        />
                        <View style={styles.textWrapper}>
                            <Text style={[styles.question, item.warning && styles.warning]}>{item.q}</Text>
                            <Text style={styles.answer}>{item.a}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Icon name="contact-support" size={normalize(20)} color="#0d6efd" />
                    <Text style={styles.sectionTitle}>Still Need Help?</Text>
                </View>

                <Text style={styles.description}>
                    Fill out the form below and our support team will get in touch with you within 24 hours.
                </Text>

                {[
                    { icon: 'info', placeholder: 'Issue Type (optional)', value: issue, onChangeText: setIssue },
                ].map((item, index) => (
                    <View key={index} style={styles.inputContainer}>
                        <Icon name={item.icon} size={normalize(18)} color="#6c757d" style={styles.inputIcon} />
                        <TextInput
                            placeholder={item.placeholder}
                            placeholderTextColor="#adb5bd"
                            value={item.value}
                            onChangeText={(text) => {
                                setIssue(text);
                                if (text.length > 50) {
                                    setIssueError('Issue type must be under 50 characters.');
                                } else {
                                    setIssueError('');
                                }
                            }}
                            style={styles.input}
                            maxLength={60} // optional UI safety cap
                        />
                    </View>
                ))}
                {issueError ? <Text style={styles.errorText}>{issueError}</Text> : null}

                <View style={styles.inputContainer}>
                    <Icon
                        name="message"
                        size={normalize(18)}
                        color="#6c757d"
                        style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: normalizeVertical(12) }]}
                    />
                    <TextInput
                        placeholder="Describe your issue"
                        placeholderTextColor="#adb5bd"
                        value={message}
                        onChangeText={(text) => {
                            setMessage(text);
                            if (text.length > 150) {
                                setMessageError('Message must be under 150 characters.');
                            } else {
                                setMessageError('');
                            }
                        }}
                        style={[styles.input, styles.messageInput]}
                        multiline
                        textAlignVertical="top"
                        maxLength={200}
                    />
                </View>
                {messageError ? <Text style={styles.errorText}>{messageError}</Text> : null}


                <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                    <Text style={styles.buttonText}>Submit Request</Text>
                    <Icon name="send" size={normalize(16)} color="#fff" style={styles.buttonIcon} />
                </TouchableOpacity>
            </View>

            <View style={styles.contactInfo}>
                <View style={styles.sectionHeader}>
                    <Icon name="alternate-email" size={normalize(20)} color="#0d6efd" />
                    <Text style={styles.contactTitle}>Other Ways to Reach Us</Text>
                </View>

                {[
                    { icon: 'email', text: 'support@reuse.com' },
                    { icon: 'phone', text: '+1 (800) 123-4567' },
                    { icon: 'forum', text: 'Live Chat (available 24/7)' }
                ].map((item, index) => (
                    <View key={index} style={styles.contactRow}>
                        <Icon name={item.icon} size={normalize(16)} color="#0d6efd" />
                        <Text style={styles.contactText}>{item.text}</Text>
                    </View>
                ))}
            </View>
            <ModalScreen
                visible={modalVisible}
                type={modalType}
                title={modalTitle}
                message={modalMessage}
                onClose={() => setModalVisible(false)}
            />
        </ScrollView >
    );
};

const styles = StyleSheet.create({
    container: {
        padding: normalize(14),
        backgroundColor: '#f8f9fa',
        paddingBottom: normalizeVertical(30),
    },
    header: {
        borderRadius: normalize(12),
        marginBottom: normalizeVertical(16),
        marginTop: normalizeVertical(6),
        backgroundColor: '#0d6efd',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: normalize(14),
    },
    title: {
        fontSize: normalize(20),
        fontWeight: '700',
        color: '#fff',
        marginLeft: normalize(10),
    },
    description: {
        fontSize: normalize(14),
        color: '#495057',
        marginBottom: normalizeVertical(18),
        fontWeight: '400',
        lineHeight: normalizeVertical(20),
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: normalize(12),
        padding: normalize(14),
        marginBottom: normalizeVertical(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalizeVertical(14),
    },
    sectionTitle: {
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#212529',
        marginLeft: normalize(8),
    },
    questionContainer: {
        flexDirection: 'row',
        marginBottom: normalizeVertical(16),
        alignItems: 'flex-start',
    },
    icon: {
        marginRight: normalize(10),
        marginTop: normalizeVertical(3),
    },
    textWrapper: {
        flex: 1,
    },
    question: {
        fontWeight: '500',
        fontSize: normalize(14),
        marginBottom: normalizeVertical(4),
        color: '#212529',
    },
    warning: {
        color: '#dc3545',
    },
    answer: {
        fontSize: normalize(13),
        color: '#6c757d',
        lineHeight: normalizeVertical(18),
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: normalizeVertical(12),
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: normalize(12),
        top: normalize(12),
        zIndex: 1,
    },
    input: {
        flex: 1,
        height: normalizeVertical(44),
        backgroundColor: '#f8f9fa',
        borderRadius: normalize(10),
        paddingHorizontal: normalize(40),
        fontSize: normalize(13),
        borderColor: '#dee2e6',
        borderWidth: 1,
        color: '#212529',
    },
    messageInput: {
        height: normalizeVertical(100),
        paddingTop: normalizeVertical(12),
        paddingHorizontal: normalize(40),
    },
    button: {
        backgroundColor: '#0d6efd',
        paddingVertical: normalizeVertical(12),
        borderRadius: normalize(10),
        alignItems: 'center',
        marginTop: normalizeVertical(8),
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#0d6efd',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: normalize(14),
    },
    buttonIcon: {
        marginLeft: normalize(6),
    },
    contactInfo: {
        backgroundColor: '#fff',
        borderRadius: normalize(12),
        padding: normalize(16),
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    contactTitle: {
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#212529',
        marginLeft: normalize(8),
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: normalizeVertical(10),
        paddingLeft: normalize(4),
    },
    contactText: {
        fontSize: normalize(14),
        color: '#495057',
        marginLeft: normalize(10),
    },
    errorText: {
        color: '#dc3545',
        fontSize: normalize(12),
        marginBottom: normalizeVertical(8),
        marginLeft: normalize(8),
    },

});

export default HelpSupport;
