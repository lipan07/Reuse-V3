import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    Dimensions,
    TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL } from '@env';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const COUNTRY_OPTIONS = ['India'];

const UploadScreenshotScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { productId, postTitle, amount } = route.params || {};

    const [screenshotUri, setScreenshotUri] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [country, setCountry] = useState('India');

    const pickImage = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1200,
            },
            (res) => {
                if (res.didCancel) return;
                if (res.errorCode) {
                    Alert.alert('Error', res.errorMessage || 'Failed to pick image');
                    return;
                }
                const uri = res.assets?.[0]?.uri;
                if (uri) setScreenshotUri(uri);
            }
        );
    };

    const submitPayment = async () => {
        if (!screenshotUri || !productId || amount == null) {
            Alert.alert('Error', 'Please select a payment screenshot.');
            return;
        }
        const street = (streetAddress || '').trim();
        const cityVal = (city || '').trim();
        const pin = (pinCode || '').replace(/\D/g, '').slice(0, 6);
        if (!street) {
            Alert.alert('Error', 'Please enter your street address.');
            return;
        }
        if (!cityVal) {
            Alert.alert('Error', 'Please enter your city.');
            return;
        }
        if (pin.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit PIN code.');
            return;
        }

        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Please log in again.');
                navigation.navigate('Login');
                return;
            }

            const formData = new FormData();
            formData.append('post_id', productId);
            formData.append('amount', String(amount));
            formData.append('street_address', street);
            formData.append('city', cityVal);
            formData.append('pin_code', pin);
            formData.append('country', country || 'India');
            formData.append('screenshot', {
                uri: screenshotUri,
                type: 'image/jpeg',
                name: 'payment_screenshot.jpg',
            });

            const response = await fetch(`${BASE_URL}/payments`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok && data.success) {
                Alert.alert('Success', 'Payment details submitted. Admin will verify and confirm.', [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('ProductDetails', { productId }),
                    },
                ]);
            } else {
                Alert.alert('Error', data.message || 'Failed to submit payment. Please try again.');
            }
        } catch (e) {
            console.error('Payment submit error:', e);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!productId || amount == null) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Missing product info.</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity style={styles.backBar} onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={normalize(24)} color="#333" />
                <Text style={styles.backBarText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.card}>
                <Text style={styles.title}>Upload Payment Screenshot</Text>
                <Text style={styles.subtitle}>{postTitle} — ₹{Number(amount).toFixed(2)}</Text>

                {screenshotUri ? (
                    <View style={styles.previewWrap}>
                        <Image source={{ uri: screenshotUri }} style={styles.preview} resizeMode="contain" />
                        <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
                            <Text style={styles.changeBtnText}>Change Image</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                        <Icon name="camera-plus" size={normalize(48)} color="#9ca3af" />
                        <Text style={styles.uploadText}>Tap to select screenshot</Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.sectionLabel}>Delivery Address</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Street address, building, apartment"
                    placeholderTextColor="#9ca3af"
                    value={streetAddress}
                    onChangeText={setStreetAddress}
                />
                <TextInput
                    style={styles.input}
                    placeholder="City"
                    placeholderTextColor="#9ca3af"
                    value={city}
                    onChangeText={setCity}
                />
                <TextInput
                    style={[styles.input, styles.inputPin]}
                    placeholder="PIN code (6 digits)"
                    placeholderTextColor="#9ca3af"
                    value={pinCode}
                    onChangeText={(t) => setPinCode(t.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                />
                <View style={styles.countryWrap}>
                    <Text style={styles.countryLabel}>Country</Text>
                    <View style={styles.countryRow}>
                        {COUNTRY_OPTIONS.map((c) => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.countryChip, country === c && styles.countryChipActive]}
                                onPress={() => setCountry(c)}
                            >
                                <Text style={[styles.countryChipText, country === c && styles.countryChipTextActive]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                    onPress={submitPayment}
                    disabled={submitting || !screenshotUri}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>Submit</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    content: {
        padding: normalize(20),
        paddingTop: normalize(56),
        paddingBottom: 40,
    },
    backBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
    },
    backBarText: {
        marginLeft: 8,
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#333',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: normalize(16),
        color: '#666',
        marginBottom: 16,
    },
    backBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#007BFF',
        borderRadius: 8,
    },
    backBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: normalize(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: normalize(20),
        fontWeight: '700',
        color: '#222',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: normalize(14),
        color: '#666',
        marginBottom: 24,
    },
    uploadArea: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: normalize(40),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    uploadText: {
        fontSize: normalize(14),
        color: '#6b7280',
        marginTop: 12,
    },
    previewWrap: {
        marginBottom: 24,
    },
    preview: {
        width: '100%',
        height: 280,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
    },
    changeBtn: {
        marginTop: 12,
        alignSelf: 'center',
    },
    changeBtnText: {
        color: '#007BFF',
        fontWeight: '600',
        fontSize: normalize(14),
    },
    sectionLabel: {
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#222',
        marginBottom: 12,
        marginTop: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: normalize(15),
        color: '#222',
        marginBottom: 12,
    },
    inputPin: {
        maxWidth: 160,
    },
    countryWrap: {
        marginBottom: 20,
    },
    countryLabel: {
        fontSize: normalize(14),
        color: '#666',
        marginBottom: 8,
    },
    countryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    countryChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    countryChipActive: {
        backgroundColor: '#007BFF',
        borderColor: '#007BFF',
    },
    countryChipText: {
        fontSize: normalize(14),
        color: '#374151',
        fontWeight: '500',
    },
    countryChipTextActive: {
        color: '#fff',
    },
    submitBtn: {
        backgroundColor: '#007BFF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        backgroundColor: '#9ca3af',
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: normalize(16),
    },
});

export default UploadScreenshotScreen;
