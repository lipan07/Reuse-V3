# Notification Testing & Troubleshooting Guide

## Overview
This guide helps you test and debug notification-to-ChatBox navigation.

## Important Updates Made
✅ Added comprehensive logging throughout notification handlers
✅ Added FCM (Firebase Cloud Messaging) handlers for all app states
✅ Added Notifee handlers for local notifications
✅ Fixed function declaration order issues
✅ Added proper error handling and validation

## Testing Steps

### Step 1: Check Logs
When testing notifications, watch for these console logs:

#### When notification is received:
```
📬 [FCM] Foreground message received: {...}
📬 [FCM] Message data: {...}
```

#### When notification is tapped (Foreground):
```
🔥 [Notifee] Foreground event triggered!
👉 Type: 1
👉 Detail: {...}
👆 Notification tapped in foreground: {...}
🔔 handleNotificationPress called
📬 Extracted notification data: {...}
🚀 Navigating to ChatBox with params: {...}
🚀 Navigation ref ready: true
✅ Attempting navigation to ChatBox...
```

#### When notification is tapped (Background):
```
📱 [FCM] Notification opened app from background: {...}
🔔 handleNotificationPress called
📬 Extracted notification data: {...}
🚀 Navigating to ChatBox with params: {...}
```

#### When app opens from notification (Killed state):
```
📱 [FCM] App opened from killed state by notification: {...}
🔔 handleNotificationPress called
📬 Extracted notification data: {...}
🚀 Navigating to ChatBox with params: {...}
```

#### Background event (index.js):
```
🔔 [Background] Notification event type: 1
🔔 [Background] Notification: {...}
📬 [Background] Notification data: {...}
💾 [Background] Storing navigation data: {...}
✅ [Background] Navigation data stored successfully
```

### Step 2: Send Test Notification

You need to send a notification with the correct data structure. Here are examples:

#### Option A: Using Firebase Console
1. Go to Firebase Console → Cloud Messaging
2. Click "Send test message"
3. Add your FCM token
4. Fill in:
   - **Title**: "New Message"
   - **Body**: "You have a new message"
5. Click "Additional options" → "Custom data"
6. Add these key-value pairs:
   ```
   chat_id: 123
   seller_id: 456
   buyer_id: 789
   post_id: 999
   post_title: Test Product
   post_image: https://example.com/image.jpg
   ```

#### Option B: Using Backend API (Node.js Example)
```javascript
const admin = require('firebase-admin');

const message = {
  notification: {
    title: 'New Message',
    body: 'You have a new message from John'
  },
  data: {
    chat_id: '123',
    seller_id: '456',
    buyer_id: '789',
    post_id: '999',
    post_title: 'Test Product',
    post_image: 'https://example.com/image.jpg'
  },
  token: 'USER_FCM_TOKEN_HERE'
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
```

#### Option C: Using curl
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: Bearer YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "USER_FCM_TOKEN",
    "notification": {
      "title": "New Message",
      "body": "You have a new message"
    },
    "data": {
      "chat_id": "123",
      "seller_id": "456",
      "buyer_id": "789",
      "post_id": "999",
      "post_title": "Test Product",
      "post_image": "https://example.com/image.jpg"
    }
  }'
```

### Step 3: Test All Scenarios

#### Scenario 1: App is in Foreground
1. Open the app
2. Keep it in foreground
3. Send notification
4. Tap notification
5. **Expected**: ChatBox opens immediately
6. **Check logs**: Look for "🔔 handleNotificationPress called"

#### Scenario 2: App is in Background
1. Open the app
2. Press home button (minimize app)
3. Send notification
4. Tap notification
5. **Expected**: App comes to foreground, ChatBox opens
6. **Check logs**: Look for "📱 [FCM] Notification opened app from background"

#### Scenario 3: App is Killed
1. Force close the app completely
2. Send notification
3. Tap notification
4. **Expected**: App launches, wait ~1 second, ChatBox opens
5. **Check logs**: Look for "📱 [FCM] App opened from killed state"

#### Scenario 4: Back Navigation
1. After opening ChatBox from notification
2. Press physical back button or swipe back
3. **Expected**: Navigate to Home screen (app doesn't close)
4. **Check**: Verify you're on Home screen

## Common Issues & Solutions

### Issue 1: "⚠️ No chat_id found in notification data"
**Cause**: Notification doesn't have required `chat_id` field

**Solution**:
- Check your notification payload
- Ensure `chat_id` or `chatId` is present in the `data` object
- Verify backend is sending correct format

**Example of correct payload**:
```json
{
  "data": {
    "chat_id": "123",  // This is required!
    "seller_id": "456",
    "buyer_id": "789"
  }
}
```

### Issue 2: "❌ Navigation ref is not ready!"
**Cause**: Navigation hasn't initialized yet

**Solution**:
- The code already has a 500ms delay
- If still occurring, increase timeout in App.js:
```javascript
setTimeout(() => {
  navigate('ChatBox', chatParams);
}, 1000); // Increase to 1000ms
```

### Issue 3: No logs appearing
**Cause**: Notification not being received or handlers not registered

**Solution**:
1. Check FCM token is valid
2. Verify Firebase configuration
3. Check Android/iOS permissions
4. Run: `npx react-native log-android` or `npx react-native log-ios`

### Issue 4: Navigation happens but ChatBox is empty
**Cause**: Missing required parameters

**Solution**:
- Check logs for the parameters being passed
- Verify all required fields are present:
  - `chatId` (required)
  - `sellerId` (required)
  - `buyerId` (required)
  - `postId` (optional)
  - `postTitle` (optional)
  - `postImage` (optional)

### Issue 5: App crashes when opening from notification
**Cause**: Invalid data format or missing dependencies

**Solution**:
1. Check logs for error messages
2. Verify notification data is valid JSON
3. Ensure all navigation dependencies are installed
4. Check if ChatBox component has any errors

### Issue 6: Notification appears but nothing happens when tapped
**Cause**: Event handlers not properly registered

**Solution**:
1. Check if `notifee.onBackgroundEvent` is running in index.js
2. Verify `EventType` is imported correctly
3. Check AsyncStorage permissions
4. Look for errors in logs

## Debugging Commands

### Get FCM Token (for testing)
Add this to your app temporarily:
```javascript
import messaging from '@react-native-firebase/messaging';

async function getFCMToken() {
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
}

getFCMToken();
```

### View Android Logs
```bash
npx react-native log-android
# or
adb logcat | grep -i "notification\|fcm\|notifee"
```

### View iOS Logs
```bash
npx react-native log-ios
```

### Clear AsyncStorage (if needed)
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.clear().then(() => {
  console.log('AsyncStorage cleared');
});
```

### Test Deep Link Directly
```bash
# Android
adb shell am start -W -a android.intent.action.VIEW \
  -d "reuseapp://chat/123?sellerId=456&buyerId=789" \
  com.malaq.notify

# iOS
xcrun simctl openurl booted "reuseapp://chat/123?sellerId=456&buyerId=789"
```

## Checklist Before Testing

- [ ] Firebase is configured correctly
- [ ] FCM token is generated and available
- [ ] Notification permissions are granted
- [ ] Backend is sending correct data format
- [ ] App is properly installed (not in development mode only)
- [ ] Console logs are visible
- [ ] ChatBox screen works when navigated to normally

## Expected Log Flow (Complete Scenario)

### Foreground → Tap Notification
```
📬 [FCM] Foreground message received: {notification: {...}, data: {...}}
📬 [FCM] Message data: {"chat_id":"123",...}
🔥 [Notifee] Foreground event triggered!
👉 Type: 1
🔔 handleNotificationPress called
📬 Extracted notification data: {"chat_id":"123","seller_id":"456",...}
🚀 Navigating to ChatBox with params: {"chatId":"123","sellerId":"456",...}
🚀 Navigation ref ready: true
✅ Attempting navigation to ChatBox...
```

### Background → Tap Notification
```
🔔 [Background] Notification event type: 1
📬 [Background] Notification data: {"chat_id":"123",...}
💾 [Background] Storing navigation data: {...}
✅ [Background] Navigation data stored successfully
📱 Pending notification navigation: ChatBox {...}
✅ Attempting navigation to ChatBox...
```

### Killed → Tap Notification
```
📱 [FCM] App opened from killed state by notification: {...}
🔔 handleNotificationPress called
📬 Extracted notification data: {"chat_id":"123",...}
🚀 Navigating to ChatBox with params: {...}
✅ Attempting navigation to ChatBox...
```

## What to Report if Still Not Working

If notifications still don't work after following this guide, provide:

1. **Console logs** showing the entire flow
2. **Notification payload** you're sending
3. **App state** when testing (foreground/background/killed)
4. **Platform** (Android/iOS) and version
5. **Any error messages** from logs
6. **Screenshot** of Firebase Console notification settings

## Additional Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Notifee Documentation](https://notifee.app/react-native/docs/overview)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking)

## Quick Test Script

Save this as `test-notification.js` and run with `node test-notification.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const message = {
  notification: {
    title: 'Test Message',
    body: 'Testing notification navigation'
  },
  data: {
    chat_id: '123',
    seller_id: '456',
    buyer_id: '789',
    post_id: '999',
    post_title: 'Test Product',
    post_image: 'https://via.placeholder.com/150'
  },
  token: 'PASTE_FCM_TOKEN_HERE'
};

admin.messaging().send(message)
  .then(response => {
    console.log('✅ Successfully sent:', response);
  })
  .catch(error => {
    console.log('❌ Error:', error);
  });
```

## Success Criteria

✅ Notification appears in system tray
✅ Tapping notification opens ChatBox
✅ Chat loads with correct data
✅ Back button navigates to Home
✅ App doesn't close on back press
✅ Works in all app states (foreground/background/killed)

---

**Last Updated**: After comprehensive logging improvements
**Status**: Ready for testing

