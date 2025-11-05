import React, { useEffect, useRef, useCallback } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import AppNavigator from './components/AppNavigator';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// Create a navigation reference
export const navigationRef = React.createRef();

export function navigate(name, params) {
    navigationRef.current?.navigate(name, params);
}

// ✅ This is the component that will live inside the Provider
const AppInner = () => {
    const heartbeatRef = useRef(null);
    const { incrementNotificationCount } = useNotification();

    // Function to handle notification press and navigate to ChatBox
    const handleNotificationPress = useCallback((notification) => {
        try {
            console.log('🔔 handleNotificationPress called');
            console.log('🔔 Full notification object:', JSON.stringify(notification, null, 2));

            const data = notification?.data || {};
            console.log('📬 Extracted notification data:', JSON.stringify(data, null, 2));

            // Navigate to ChatBox with the data from notification
            if (data.chat_id || data.chatId) {
                const chatParams = {
                    chatId: data.chat_id || data.chatId,
                    sellerId: data.seller_id || data.sellerId,
                    buyerId: data.buyer_id || data.buyerId,
                    postId: data.post_id || data.postId || '',
                    postTitle: data.post_title || data.postTitle || 'Chat',
                    postImage: data.post_image || data.postImage || '',
                };

                console.log('🚀 Navigating to ChatBox with params:', JSON.stringify(chatParams, null, 2));
                console.log('🚀 Navigation ref ready:', !!navigationRef.current);

                // Use setTimeout to ensure navigation happens after initial render
                setTimeout(() => {
                    if (navigationRef.current) {
                        console.log('✅ Attempting navigation to ChatBox...');
                        navigate('ChatBox', chatParams);
                    } else {
                        console.error('❌ Navigation ref is not ready!');
                    }
                }, 500);
            } else {
                console.warn('⚠️ No chat_id found in notification data');
            }
        } catch (error) {
            console.error('❌ Error handling notification press:', error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('📬 [FCM] Foreground message received:', remoteMessage);
            console.log('📬 [FCM] Message data:', JSON.stringify(remoteMessage.data, null, 2));
            incrementNotificationCount();
        });

        return unsubscribe;
    }, []);

    // Handle FCM notification opened when app is in background
    useEffect(() => {
        const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('📱 [FCM] Notification opened app from background:', remoteMessage);
            if (remoteMessage?.data) {
                handleNotificationPress({ data: remoteMessage.data });
            }
        });

        return unsubscribe;
    }, [handleNotificationPress]);

    // Check if app was opened from a notification (killed state)
    useEffect(() => {
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log('📱 [FCM] App opened from killed state by notification:', remoteMessage);
                    if (remoteMessage?.data) {
                        setTimeout(() => {
                            handleNotificationPress({ data: remoteMessage.data });
                        }, 1000);
                    }
                }
            });
    }, [handleNotificationPress]);

    // Handle notification clicks in foreground
    useEffect(() => {
        const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
            console.log('🔥 [Notifee] Foreground event triggered!');
            console.log('👉 Type:', type);
            console.log('👉 Detail:', detail);

            if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
                console.log('👆 Notification tapped in foreground:', detail.notification);
                handleNotificationPress(detail.notification);
            }
        });

        return () => unsubscribe();
    }, [handleNotificationPress]);

    // Handle notification clicks when app is in background or killed (Notifee)
    useEffect(() => {
        const checkInitialNotification = async () => {
            // Check for pending navigation from background notification
            try {
                const pendingNav = await AsyncStorage.getItem('pendingNotificationNavigation');
                if (pendingNav) {
                    const { screen, params } = JSON.parse(pendingNav);
                    console.log('📱 Pending notification navigation:', screen, params);
                    await AsyncStorage.removeItem('pendingNotificationNavigation');

                    setTimeout(() => {
                        navigate(screen, params);
                    }, 1000);
                    return;
                }
            } catch (error) {
                console.error('Error checking pending navigation:', error);
            }

            // Check for initial notification from Notifee
            const initialNotification = await notifee.getInitialNotification();
            if (initialNotification) {
                console.log('📱 [Notifee] App opened from notification (killed state):', initialNotification);
                handleNotificationPress(initialNotification.notification);
            }
        };

        checkInitialNotification();
    }, [handleNotificationPress]);

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

    // Deep linking configuration
    const linking = {
        prefixes: ['reuseapp://', 'https://yourwebsite.com'],
        config: {
            screens: {
                ProductDetails: {
                    path: 'product/:productId',
                    parse: {
                        productId: (productId) => `${productId}`
                    }
                },
                ChatBox: {
                    path: 'chat/:chatId',
                    parse: {
                        chatId: (chatId) => `${chatId}`
                    }
                },
                Home: '',
            },
        },
    };

    return (
        <NavigationContainer ref={navigationRef} linking={linking}>
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
