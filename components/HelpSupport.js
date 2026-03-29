import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Linking,
    ActivityIndicator,
    useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ModalScreen from './SupportElement/ModalScreen.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Header from './Screens/Header';
import CustomStatusBar from './Screens/CustomStatusBar';
import { buildHelpSupportStyles } from '../assets/css/HelpSupport.styles';
import { useTheme } from '../context/ThemeContext';

const HelpSupport = () => {
    const navigation = useNavigation();
    const { isDarkMode: darkMode } = useTheme();
    const { width, height } = useWindowDimensions();
    const { styles, nf } = useMemo(
        () => buildHelpSupportStyles(width, height),
        [width, height]
    );
    const [issue, setIssue] = useState('');
    const [message, setMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('info');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        if (!message.trim()) {
            setModalType('error');
            setModalTitle('Validation Error');
            setModalMessage('Please describe your issue before submitting.');
            setModalVisible(true);
            setIsSubmitting(false);
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

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong.');
            }

            setModalType('success');
            setModalTitle('Support Request Sent');
            setModalMessage('Our team will get back to you within 24 hours.');
            setModalVisible(true);
            setIssue('');
            setMessage('');
        } catch (error) {
            setModalType('error');
            setModalTitle('Submission Failed');
            setModalMessage(error.message || 'Unable to send support request. Please try again later.');
            setModalVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContactPress = (type) => {
        switch (type) {
            case 'email':
                Linking.openURL('mailto:support@reuse.com');
                break;
            case 'phone':
                Linking.openURL('tel:+18001234567');
                break;
            case 'chat':
                // Implement your chat functionality here
                Alert.alert('Live Chat', 'Connecting you to our support team...');
                break;
        }
    };

    const commonQuestions = [
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
            a: '❌ No. Reuse strongly advises users never to pay any advance money before inspecting and receiving the product.',
            warning: true
        }
    ];

    return (
        <>
            <CustomStatusBar darkMode={darkMode} />
            <View style={styles.container}>
                {/* Header with proper status bar spacing */}
                <Header
                    title="Help & Support"
                    navigation={navigation}
                    darkMode={darkMode}
                />

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Welcome Section */}
                    <View style={styles.welcomeCard}>
                        <Icon name="help-outline" size={nf(30)} color="#007BFF" />
                        <Text style={styles.welcomeTitle}>How can we help you?</Text>
                        <Text style={styles.welcomeText}>
                            Whether you're buying or selling items on Reuse, our support team is here to assist you.
                        </Text>
                    </View>

                    {/* Common Questions */}
                    <Text style={styles.sectionHeaderText}>Common Questions</Text>
                    <View style={styles.card}>
                        {commonQuestions.map((item, index) => (
                            <View key={index} style={[
                                styles.questionContainer,
                                index < commonQuestions.length - 1 && styles.questionBorder
                            ]}>
                                <Icon
                                    name={item.warning ? 'error-outline' : 'help-outline'}
                                    size={nf(20)}
                                    color={item.warning ? '#FF3B30' : '#007BFF'}
                                    style={styles.questionIcon}
                                />
                                <View style={styles.questionTextContainer}>
                                    <Text style={[styles.questionText, item.warning && styles.warningText]}>
                                        {item.q}
                                    </Text>
                                    <Text style={styles.answerText}>{item.a}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Contact Form */}
                    <Text style={styles.sectionHeaderText}>Contact Support</Text>
                    <View style={styles.card}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Issue Type (optional)</Text>
                            <TextInput
                                placeholder="E.g. Account issue, Payment problem..."
                                placeholderTextColor="#999"
                                value={issue}
                                onChangeText={setIssue}
                                style={styles.input}
                                maxLength={50}
                            />
                            <Text style={styles.charCounter}>{issue.length}/50</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Describe your issue *</Text>
                            <TextInput
                                placeholder="Please provide details about your problem..."
                                placeholderTextColor="#999"
                                value={message}
                                onChangeText={setMessage}
                                style={[styles.input, styles.messageInput]}
                                multiline
                                textAlignVertical="top"
                                maxLength={200}
                            />
                            <Text style={styles.charCounter}>{message.length}/200</Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            style={styles.submitButton}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.submitButtonText}>Submit Request</Text>
                                    <Icon name="send" size={nf(16)} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Contact Options */}
                    <Text style={styles.sectionHeaderText}>Other Ways to Reach Us</Text>
                    <View style={styles.card}>
                        {[
                            { icon: 'email', text: 'Email Support', type: 'email' },
                            { icon: 'phone', text: 'Call Support', type: 'phone' },
                            { icon: 'chat', text: 'Live Chat', type: 'chat' }
                        ].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.contactOption}
                                onPress={() => handleContactPress(item.type)}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name={item.icon}
                                    size={nf(20)}
                                    color="#007BFF"
                                    style={styles.contactIcon}
                                />
                                <Text style={styles.contactText}>{item.text}</Text>
                                <Icon
                                    name="chevron-right"
                                    size={nf(20)}
                                    color="#999"
                                    style={styles.contactArrow}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <ModalScreen
                    visible={modalVisible}
                    type={modalType}
                    title={modalTitle}
                    message={modalMessage}
                    onClose={() => setModalVisible(false)}
                />
            </View>
        </>
    );
};

export default HelpSupport;