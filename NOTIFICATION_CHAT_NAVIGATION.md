# Notification to Chat Navigation Implementation

## Overview
This feature enables users to open the ChatBox directly from push notifications and ensures proper back navigation to the Home screen instead of closing the app.

## Features Implemented

### 1. **Notification Click Handling**
- Users can tap on a notification to directly open the related chat
- Works in all app states:
  - ✅ Foreground (app is open)
  - ✅ Background (app is in background)
  - ✅ Killed (app is completely closed)

### 2. **Smart Back Navigation**
- When ChatBox is opened from a notification, pressing back (button or swipe) navigates to Home instead of closing the app
- Normal navigation history is preserved when navigating through the app normally

### 3. **Deep Linking Support**
- ChatBox can be opened via deep links: `reuseapp://chat/:chatId`
- Supports web URLs: `https://yourwebsite.com/chat/:chatId`

## Technical Implementation

### Files Modified

#### 1. `/App.js`
- Added navigation reference for programmatic navigation
- Added notification click handlers for foreground and background states
- Added deep linking configuration for ChatBox
- Checks for pending notification navigation on app start

**Key Changes:**
```javascript
// Navigation reference
export const navigationRef = React.createRef();

// Notification handler
const handleNotificationPress = (notification) => {
  const data = notification?.data || {};
  if (data.chat_id || data.chatId) {
    navigate('ChatBox', {
      chatId: data.chat_id || data.chatId,
      sellerId: data.seller_id || data.sellerId,
      buyerId: data.buyer_id || data.buyerId,
      postId: data.post_id || data.postId,
      postTitle: data.post_title || data.postTitle,
      postImage: data.post_image || data.postImage,
    });
  }
};

// Deep linking config
const linking = {
  prefixes: ['reuseapp://', 'https://yourwebsite.com'],
  config: {
    screens: {
      ChatBox: {
        path: 'chat/:chatId',
        parse: {
          chatId: (chatId) => `${chatId}`
        }
      },
      // ... other screens
    },
  },
};
```

#### 2. `/index.js`
- Added background notification handler
- Stores notification data in AsyncStorage for app cold start navigation

**Key Changes:**
```javascript
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    const data = notification?.data || {};
    if (data.chat_id || data.chatId) {
      await AsyncStorage.setItem('pendingNotificationNavigation', JSON.stringify({
        screen: 'ChatBox',
        params: { /* chat params */ }
      }));
    }
  }
});
```

#### 3. `/components/ChatBox.js`
- Added `BackHandler` import
- Implemented smart back navigation logic

**Key Changes:**
```javascript
useEffect(() => {
  const backAction = () => {
    const state = navigation.getState();
    
    // Check if this is the only screen (opened from notification)
    if (state.index === 0 || state.routes.length === 1) {
      // Navigate to Home instead of closing app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      return true; // Prevent default behavior
    }
    
    return false; // Allow normal back navigation
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  return () => backHandler.remove();
}, [navigation]);
```

## Notification Payload Format

For this feature to work, your push notifications must include the following data structure:

### Required Fields
```json
{
  "notification": {
    "title": "New Message",
    "body": "You have a new message"
  },
  "data": {
    "chat_id": "123",        // Required
    "seller_id": "456",      // Required
    "buyer_id": "789",       // Required
    "post_id": "999",        // Optional
    "post_title": "Product", // Optional
    "post_image": "url"      // Optional
  }
}
```

### Alternative Field Names (also supported)
The code supports both snake_case and camelCase:
- `chat_id` or `chatId`
- `seller_id` or `sellerId`
- `buyer_id` or `buyerId`
- `post_id` or `postId`
- `post_title` or `postTitle`
- `post_image` or `postImage`

## User Experience Flow

### Scenario 1: App is Foreground
1. User receives notification
2. User taps notification
3. App immediately navigates to ChatBox
4. User presses back → returns to previous screen (or Home if single screen)

### Scenario 2: App is Background
1. User receives notification
2. User taps notification
3. App comes to foreground
4. Navigation data is stored in AsyncStorage
5. App reads AsyncStorage and navigates to ChatBox
6. User presses back → navigates to Home

### Scenario 3: App is Killed
1. User receives notification
2. User taps notification
3. App launches
4. After 1 second delay (for app initialization), navigates to ChatBox
5. User presses back → navigates to Home (not close app)

## Testing

### Test Cases

#### 1. Foreground Notification
```bash
# Test foreground notification
adb shell am broadcast -a com.malaq.notify.TEST_NOTIFICATION \
  --es chat_id "123" \
  --es seller_id "456" \
  --es buyer_id "789"
```

#### 2. Background Notification
1. Put app in background
2. Send notification
3. Tap notification
4. Verify ChatBox opens
5. Press back
6. Verify navigates to Home

#### 3. Killed State
1. Force close app
2. Send notification
3. Tap notification
4. Wait for app to launch
5. Verify ChatBox opens after ~1 second
6. Press back
7. Verify navigates to Home (app stays open)

### Expected Behavior

✅ **Correct:**
- Notification tap opens ChatBox with correct data
- Chat loads messages properly
- Back button navigates to Home when opened from notification
- App doesn't close when pressing back from notification-opened ChatBox

❌ **Incorrect:**
- App closes when pressing back from ChatBox (opened from notification)
- Navigation doesn't happen
- Chat data is missing or incorrect

## Backend Requirements

Your backend should send notifications with the following structure:

### Firebase Cloud Messaging (FCM)
```javascript
// Node.js example
const message = {
  notification: {
    title: 'New Message',
    body: 'You have a new message from John',
  },
  data: {
    chat_id: chatId.toString(),
    seller_id: sellerId.toString(),
    buyer_id: buyerId.toString(),
    post_id: postId.toString(),
    post_title: postTitle,
    post_image: postImageUrl,
  },
  token: userFcmToken,
  android: {
    notification: {
      channelId: 'default',
      priority: 'high',
    }
  }
};

await admin.messaging().send(message);
```

### Laravel Example
```php
// Laravel with Firebase
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

$notification = Notification::create('New Message', 'You have a new message');

$data = [
    'chat_id' => (string) $chatId,
    'seller_id' => (string) $sellerId,
    'buyer_id' => (string) $buyerId,
    'post_id' => (string) $postId,
    'post_title' => $postTitle,
    'post_image' => $postImageUrl,
];

$message = CloudMessage::withTarget('token', $fcmToken)
    ->withNotification($notification)
    ->withData($data);

$messaging->send($message);
```

## Troubleshooting

### Issue: Notification doesn't navigate to ChatBox
**Solution:** 
- Check console logs for notification data
- Verify `chat_id` is present in notification payload
- Ensure notification data matches expected format

### Issue: App closes on back press
**Solution:**
- Verify BackHandler is properly set up in ChatBox.js
- Check navigation state in console
- Ensure navigation.reset() is being called

### Issue: Navigation happens but chat is empty
**Solution:**
- Verify all required parameters are passed (chatId, sellerId, buyerId)
- Check API calls in ChatBox component
- Verify user authentication token

### Issue: Deep link doesn't work
**Solution:**
- Verify deep linking is configured in App.js
- Check AndroidManifest.xml has intent filters
- Test with: `adb shell am start -W -a android.intent.action.VIEW -d "reuseapp://chat/123" com.malaq.notify`

## Benefits

1. **Improved User Engagement**: Users can quickly access their chats from notifications
2. **Better UX**: No app closures from back navigation
3. **Native Feel**: Supports both physical back button and swipe gestures
4. **Reliable**: Works in all app states (foreground, background, killed)
5. **Flexible**: Supports multiple notification formats

## Future Enhancements

Potential improvements:
- [ ] Add notification badges to specific chats
- [ ] Support group chat notifications
- [ ] Add notification action buttons (Reply, Mark as Read)
- [ ] Implement notification sound customization
- [ ] Add notification history/log

## Related Files

- `/App.js` - Main app configuration with navigation
- `/index.js` - Background notification handlers
- `/components/ChatBox.js` - Chat interface with back navigation
- `/context/NotificationContext.js` - Notification state management
- `/service/echo.js` - WebSocket real-time messaging

## See Also

- [Share Feature Guide](./SHARE_FEATURE_GUIDE.md)
- [Deep Link Back Navigation](./BACK_NAVIGATION_IMPLEMENTATION.md)

