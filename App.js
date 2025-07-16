import React, { useEffect, useRef } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import AppNavigator from './components/AppNavigator';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// ✅ This is the component that will live inside the Provider
const AppInner = () => {
    const heartbeatRef = useRef(null);
    const { incrementNotificationCount } = useNotification();

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('📬 [FCM] Foreground message received:', remoteMessage);
            incrementNotificationCount();
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
            console.log('🔥 [Notifee] Foreground event triggered!');
            console.log('👉 Type:', type);
            console.log('👉 Detail:', detail);
            if (type === EventType.ACTION_PRESS) {
                console.log('👆 Notification tapped in foreground:', detail.notification);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        async function requestNotificationPermission() {
            const settings = await notifee.requestPermission();
            console.log('🔐 Notification permission status:', settings.authorizationStatus);

            if (settings.authorizationStatus === 0) {
                console.warn('❌ Notifications permission denied by user');
            }
        }

        requestNotificationPermission();
    }, []);

    // Track app state changes
    useEffect(() => {
        const updateStatus = async (status) => {
            console.log('updateStatus called with:', status);
            try {
                const token = await AsyncStorage.getItem('authToken');
                if (!token) return;

                await fetch(`${process.env.BASE_URL}/user/${status}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                console.log(`Status updated to: ${status}`);
            } catch (error) {
                console.error(`Error updating status to ${status}:`, error);
            }
        };

        const handleAppStateChange = async (nextState) => {
            console.log('App state changed to:', nextState);

            if (nextState === 'active') {
                await updateStatus('online');
                startHeartbeat();
            } else if (nextState === 'background' || nextState === 'inactive') {
                stopHeartbeat();
                await updateStatus('offline');
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        updateStatus('online');
        startHeartbeat();

        return () => {
            stopHeartbeat();
            updateStatus('offline');
            subscription.remove();
        };
    }, []);

    const startHeartbeat = () => {
        stopHeartbeat();

        heartbeatRef.current = setInterval(async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                if (!token) return;

                await fetch(`${process.env.BASE_URL}/user/online`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                console.log('Heartbeat: Status refreshed');
            } catch (error) {
                console.error('Heartbeat error:', error);
            }
        }, 30000);
    };

    const stopHeartbeat = () => {
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
        }
    };

    return (
        <NavigationContainer>
            <AppNavigator />
        </NavigationContainer>
    );
};

// ✅ Wrap AppInner with NotificationProvider
const App = () => {
    return (
        <NotificationProvider>
            <AppInner />
        </NotificationProvider>
    );
};

export default App;
