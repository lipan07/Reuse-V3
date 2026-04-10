import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from './App';
import { name as appName } from './app.json';

// 1️⃣ Register background tap handler (must not throw — this file runs before AppRegistry)
try {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        const { notification, pressAction } = detail;

        console.log('🔔 [Background] Notification event type:', type);
        console.log('🔔 [Background] Notification:', JSON.stringify(notification, null, 2));
        console.log('🔔 [Background] Press action:', JSON.stringify(pressAction, null, 2));

        if (type === EventType.PRESS || (type === EventType.ACTION_PRESS && pressAction?.id === 'default')) {
            console.log('✅ User tapped background notification');

            const data = notification?.data || {};
            console.log('📬 [Background] Notification data:', JSON.stringify(data, null, 2));

            if (data.chat_id || data.chatId) {
                const navData = {
                    screen: 'ChatBox',
                    params: {
                        chatId: data.chat_id || data.chatId,
                        sellerId: data.seller_id || data.sellerId,
                        buyerId: data.buyer_id || data.buyerId,
                        postId: data.post_id || data.postId || '',
                        postTitle: data.post_title || data.postTitle || 'Chat',
                        postImage: data.post_image || data.postImage || '',
                    }
                };

                console.log('💾 [Background] Storing navigation data:', JSON.stringify(navData, null, 2));
                await AsyncStorage.setItem('pendingNotificationNavigation', JSON.stringify(navData));
                console.log('✅ [Background] Navigation data stored successfully');
            } else {
                console.warn('⚠️ [Background] No chat_id found in notification');
            }
        }
    });
} catch (e) {
    console.warn('[Notifee] onBackgroundEvent registration failed:', e);
}

// 2️⃣ Create notification channel (do once)
notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
}).catch((e) => {
    console.warn('[Notifee] createChannel failed:', e);
});

// 3️⃣ Background FCM handler — getMessaging(getApp()) runs at bundle load; if native Firebase
//    isn't linked or default app isn't ready, this used to crash the whole app before any UI.
try {
    const messaging = getMessaging(getApp());
    setBackgroundMessageHandler(messaging, async remoteMessage => {
        console.log('🌙 [FCM] Background Message:', remoteMessage);

        const { title, body } = remoteMessage.notification || {};

        console.log('🌙 [FCM] Notification Title:', title);
        console.log('🌙 [FCM] Notification body:', body);
    });
} catch (e) {
    console.warn('[RNFB] setBackgroundMessageHandler not registered (Firebase unavailable):', e?.message || e);
}

// 4️⃣ App entry
AppRegistry.registerComponent(appName, () => App);
