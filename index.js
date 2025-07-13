import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// 1️⃣ Register background tap handler
notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    if (type === EventType.ACTION_PRESS && pressAction.id === 'default') {
        console.log('✅ User tapped background notification:', notification);
        // You can trigger navigation or logic here
    }
});

// 2️⃣ Create notification channel (do once)
notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
});

// 3️⃣ Background FCM handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('🌙 [FCM] Background Message:', remoteMessage);

    const { title, body } = remoteMessage.notification || {};

    console.log('🌙 [FCM] Notification Title:', title);
    console.log('🌙 [FCM] Notification body:', body);

    // if (title || body) {
    //     await notifee.displayNotification({
    //         title: '✅ Notification from Notifee',
    //         body: 'This should appear in system tray',
    //         android: {
    //             channelId: 'default',
    //             smallIcon: 'ic_launcher', // optional but recommended
    //             importance: AndroidImportance.HIGH,
    //             pressAction: {
    //                 id: 'default',
    //             },
    //         },
    //     });
    // }
});

// 4️⃣ App entry
AppRegistry.registerComponent(appName, () => App);
