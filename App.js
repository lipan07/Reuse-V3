import React, { useEffect, useRef } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { getApp } from '@react-native-firebase/app';
// import { getMessaging, getToken, onMessage, onTokenRefresh } from '@react-native-firebase/messaging';
import AppNavigator from './components/AppNavigator';

import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

const HomeScreen = () => {
    const heartbeatRef = useRef(null);

    // Initialize Firebase Messaging with modular API
    // useEffect(() => {
    //     const setupFirebase = async () => {
    //         try {
    //             const app = getApp();
    //             const messaging = getMessaging(app);

    //             // Request notification permissions (iOS only)
    //             if (Platform.OS === 'ios') {
    //                 await messaging.requestPermission();
    //             }

    //             // Get FCM token
    //             const token = await getToken(messaging);
    //             console.log('FCM Token:', token);
    //             await AsyncStorage.setItem('fcmToken', token);

    //             // Handle incoming foreground messages
    //             const unsubscribeMessage = onMessage(messaging, remoteMessage => {
    //                 Alert.alert(
    //                     remoteMessage.notification?.title || 'Notification',
    //                     remoteMessage.notification?.body || 'New message'
    //                 );
    //             });

    //             // Handle token refreshes
    //             const unsubscribeTokenRefresh = onTokenRefresh(messaging, async (newToken) => {
    //                 console.log('New FCM token:', newToken);
    //                 await AsyncStorage.setItem('fcmToken', newToken);
    //             });

    //             // Cleanup on unmount
    //             return () => {
    //                 unsubscribeMessage();
    //                 unsubscribeTokenRefresh();
    //             };
    //         } catch (error) {
    //             console.error('Firebase setup error:', error);
    //         }
    //     };

    //     setupFirebase();
    // }, []);

    useEffect(() => {
        const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
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

        // Handle app state changes
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

        // Initial status update
        updateStatus('online');
        startHeartbeat();

        return () => {
            stopHeartbeat();
            updateStatus('offline');
            subscription.remove();
        };
    }, []);

    // Heartbeat to maintain online status
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
        }, 30000); // Every 30 seconds
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

export default HomeScreen;