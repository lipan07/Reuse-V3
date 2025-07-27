import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Dimensions,
    StatusBar,
    Platform
} from 'react-native';
import { Rating } from 'react-native-ratings';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './Screens/Header';
import CustomStatusBar from './Screens/CustomStatusBar';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const Feedback = ({ navigation }) => {
    const [rating, setRating] = useState(3);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const handleSubmit = async () => {
        if (!feedback.trim()) {
            Alert.alert('Error', 'Please enter your feedback');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = await AsyncStorage.getItem('authToken');
            const userId = await AsyncStorage.getItem('userId');

            const response = await fetch(`${process.env.BASE_URL}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId,
                    rating,
                    comment: feedback,
                    date: new Date().toISOString()
                })
            });

            if (response.ok) {
                Alert.alert(
                    'Thank You!',
                    'Your feedback has been submitted successfully',
                    [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]
                );
            } else {
                throw new Error('Failed to submit feedback');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            Alert.alert('Error', 'Failed to submit feedback. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <CustomStatusBar />
            <View style={[styles.container, darkMode && styles.darkContainer]}>

                {/* Header with proper spacing */}
                <View>
                    <Header
                        title="Feedback"
                        navigation={navigation}
                        darkMode={darkMode}
                    />
                    <View style={[styles.separator, darkMode && styles.darkSeparator]} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons
                                name="feedback"
                                size={normalize(50)}
                                color="#4CAF50"
                                style={styles.feedbackIcon}
                            />
                        </View>

                        <Text style={styles.subtitle}>How would you rate your experience?</Text>

                        <Rating
                            type="star"
                            ratingCount={5}
                            imageSize={normalize(40)}
                            showRating
                            startingValue={rating}
                            fractions={1}
                            onFinishRating={setRating}
                            style={styles.rating}
                        />

                        <Text style={styles.label}>Your Feedback</Text>
                        <TextInput
                            style={styles.input}
                            multiline
                            numberOfLines={5}
                            placeholder="Tell us what you think..."
                            placeholderTextColor="#999"
                            value={feedback}
                            onChangeText={setFeedback}
                        />

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Feedback</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E0E0E0',
    },
    darkSeparator: {
        backgroundColor: '#333',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingTop: normalize(10),
        paddingBottom: normalize(30),
    },
    darkScrollContainer: {
        backgroundColor: '#121212',
    },
    content: {
        padding: normalize(20),
        alignItems: 'center',
    },
    iconContainer: {
        width: normalize(100),
        height: normalize(100),
        borderRadius: normalize(50),
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: normalize(20),
    },
    feedbackIcon: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    subtitle: {
        fontSize: normalize(18),
        fontWeight: '600',
        marginBottom: normalize(20),
        color: '#333',
        textAlign: 'center',
    },
    rating: {
        marginBottom: normalize(30),
        paddingVertical: normalize(10),
    },
    label: {
        alignSelf: 'flex-start',
        fontSize: normalize(16),
        fontWeight: '500',
        marginBottom: normalize(10),
        color: '#333',
    },
    input: {
        width: '100%',
        minHeight: normalize(120),
        borderWidth: normalize(1),
        borderColor: '#ddd',
        borderRadius: normalize(8),
        padding: normalize(15),
        marginBottom: normalize(25),
        fontSize: normalize(16),
        textAlignVertical: 'top',
    },
    submitButton: {
        width: '100%',
        backgroundColor: '#4CAF50',
        padding: normalize(15),
        borderRadius: normalize(8),
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: normalize(16),
        fontWeight: 'bold',
    },
});

export default Feedback;