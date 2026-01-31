import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const PAYMENT_UPI_ID = 'nearx@paytm'; // or from env
const TIMER_SECONDS = 2; // 2 minutes

const BuyPaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { productId, postTitle, amount } = route.params || {};

    const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
    const [confirmEnabled, setConfirmEnabled] = useState(false);

    useEffect(() => {
        if (!productId || amount == null) {
            return;
        }
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setConfirmEnabled(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [productId]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const upiString = `upi://pay?pa=${PAYMENT_UPI_ID}&pn=NearX&am=${Number(amount).toFixed(2)}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;

    const handleConfirmPayment = () => {
        if (!confirmEnabled) return;
        navigation.replace('UploadScreenshot', {
            productId,
            postTitle,
            amount: Number(amount),
        });
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
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBar} onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={normalize(24)} color="#333" />
                <Text style={styles.backBarText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.card}>
                <Text style={styles.title}>{postTitle || 'Product'}</Text>
                <Text style={styles.amount}>₹{Number(amount).toFixed(2)}</Text>
                <Text style={styles.hint}>Scan QR code to pay via UPI</Text>
                <View style={styles.qrWrap}>
                    <Image source={{ uri: qrUrl }} style={styles.qr} resizeMode="contain" />
                </View>
                <View style={styles.timerWrap}>
                    {!confirmEnabled ? (
                        <>
                            <Icon name="timer-outline" size={normalize(24)} color="#666" />
                            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
                            <Text style={styles.timerHint}>Confirm payment button will enable after 2 minutes</Text>
                        </>
                    ) : (
                        <>
                            <Icon name="check-circle" size={normalize(24)} color="#22c55e" />
                            <Text style={styles.timerReady}>You can now confirm payment</Text>
                        </>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.confirmBtn, !confirmEnabled && styles.confirmBtnDisabled]}
                    onPress={handleConfirmPayment}
                    disabled={!confirmEnabled}
                >
                    <Text style={styles.confirmBtnText}>Confirm Payment</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        padding: normalize(20),
        paddingTop: normalize(56),
        justifyContent: 'center',
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
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: normalize(18),
        fontWeight: '700',
        color: '#222',
        textAlign: 'center',
        marginBottom: 8,
    },
    amount: {
        fontSize: normalize(28),
        fontWeight: '800',
        color: '#007BFF',
        marginBottom: 8,
    },
    hint: {
        fontSize: normalize(14),
        color: '#666',
        marginBottom: 20,
    },
    qrWrap: {
        width: 220,
        height: 220,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    qr: {
        width: '100%',
        height: '100%',
    },
    timerWrap: {
        alignItems: 'center',
        marginBottom: 24,
    },
    timerText: {
        fontSize: normalize(32),
        fontWeight: '700',
        color: '#333',
        marginTop: 8,
    },
    timerHint: {
        fontSize: normalize(12),
        color: '#888',
        marginTop: 4,
    },
    timerReady: {
        fontSize: normalize(16),
        color: '#22c55e',
        fontWeight: '600',
        marginTop: 8,
    },
    confirmBtn: {
        backgroundColor: '#22c55e',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    confirmBtnDisabled: {
        backgroundColor: '#9ca3af',
    },
    confirmBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: normalize(16),
    },
});

export default BuyPaymentScreen;
