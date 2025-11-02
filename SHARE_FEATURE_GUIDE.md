# Share Feature Implementation Guide

## Overview

A comprehensive share feature has been implemented for the Product Details page, allowing users to share product links via any sharing method (WhatsApp, SMS, Email, etc.). When recipients click on the shared link, they are automatically redirected to the specific product's details page within the app.

---

## Features Implemented

### 1. **Share Button**

- Located in the top-right corner of the product images
- Circular button with a semi-transparent black background
- Uses Material Community Icons `share-variant` icon
- Always visible to all users (buyers and sellers)

### 2. **Share Functionality**

- Shares a formatted message with product details:
  - Product title
  - Price
  - Category
  - Location
  - Web link
  - Deep link (app link)

### 3. **Deep Linking**

- Configured for both Android and iOS
- Supports two URL schemes:
  - `reuseapp://product/{productId}` - Custom app scheme
  - `https://yourwebsite.com/product/{productId}` - Web URL (update with your actual domain)

---

## Implementation Details

### Files Modified

#### 1. **components/ProductDetailsPage.js**

- Added `Share` import from React Native
- Added `handleShare` function to generate and share product links
- Updated UI to include share button next to like button
- Modified to handle both navigation params and deep link params

#### 2. **assets/css/ProductDetailsPage.styles.js**

- Added `topRightActions` style for button container
- Added `actionButton` style for the share button
- Added `likeButtonContainer` style for proper layout

#### 3. **App.js**

- Added deep linking configuration with `linking` object
- Configured URL prefixes and screen mapping

#### 4. **android/app/src/main/AndroidManifest.xml**

- Added intent filters for deep linking:
  - Custom scheme: `reuseapp://`
  - Web URLs: `https://yourwebsite.com`

#### 5. **ios/Mustafa/Info.plist**

- Added `CFBundleURLTypes` for custom URL scheme
- Registered `reuseapp` scheme

---

## How It Works

### User Flow

1. **Sharing a Product:**

   - User opens a product details page
   - Taps the share icon in the top-right corner
   - Selects sharing method (WhatsApp, SMS, Email, etc.)
   - Message is sent with product details and links

2. **Opening a Shared Link:**
   - Recipient receives the shared message
   - Clicks on either the web link or app link
   - If app is installed: Opens directly to product details
   - If app is not installed: Opens web URL (configure your website)

### Deep Link Resolution

The app handles two types of incoming links:

```javascript
// Deep link configuration
const linking = {
  prefixes: ['reuseapp://', 'https://yourwebsite.com'],
  config: {
    screens: {
      ProductDetails: {
        path: 'product/:productId',
        parse: {
          productId: productId => `${productId}`,
        },
      },
      Home: '',
    },
  },
};
```

---

## Testing the Feature

### Testing Share Functionality

1. **Run the app:**

   ```bash
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

2. **Navigate to any product details page**

3. **Tap the share icon** (top-right corner)

4. **Select a sharing method** and share to yourself or another device

### Testing Deep Links

#### Android Testing:

1. **Using ADB (Android Debug Bridge):**

   ```bash
   # Test custom scheme
   adb shell am start -W -a android.intent.action.VIEW -d "reuseapp://product/123"

   # Test web URL
   adb shell am start -W -a android.intent.action.VIEW -d "https://yourwebsite.com/product/123"
   ```

2. **Using a real device:**
   - Share a product link to yourself via WhatsApp/SMS
   - Click on the link
   - App should open to the product details page

#### iOS Testing:

1. **Using Terminal:**

   ```bash
   xcrun simctl openurl booted "reuseapp://product/123"
   ```

2. **Using Safari:**
   - Open Safari in the simulator
   - Type: `reuseapp://product/123` in the address bar
   - Press Go

---

## Configuration Required

### Update Web URL

Replace `https://yourwebsite.com` with your actual website domain:

1. **In App.js:**

   ```javascript
   const linking = {
     prefixes: ['reuseapp://', 'https://yourdomain.com'],
     // ...
   };
   ```

2. **In ProductDetailsPage.js:**

   ```javascript
   const webLink = `https://yourdomain.com/product/${product.id}`;
   ```

3. **In AndroidManifest.xml:**
   ```xml
   <data android:scheme="https" android:host="yourdomain.com" />
   ```

### Custom App Scheme (Optional)

If you want to change the custom scheme from `reuseapp://`:

1. Update in all three locations:
   - `App.js`
   - `android/app/src/main/AndroidManifest.xml`
   - `ios/Mustafa/Info.plist`

---

## Share Message Format

The shared message includes:

```
Check out this [Product Title] on Reuse!

Price: ₹[Amount]
Category: [Category Name]
Location: [Address]

View details: https://yourwebsite.com/product/[ID]
Or open in app: reuseapp://product/[ID]
```

---

## Platform-Specific Behavior

### Android

- The Share API on Android shows the native share sheet
- Users can share via any installed app
- Deep links work automatically if the app is installed

### iOS

- The Share API shows the native share sheet
- The `url` parameter is specifically used for iOS
- Deep links require the app to be installed

---

## Troubleshooting

### Share Not Working

- Check that the `Share` import is correct in ProductDetailsPage.js
- Verify the product object has all required fields
- Check console logs for any errors

### Deep Links Not Working

**Android:**

- Verify intent filters in AndroidManifest.xml
- Check that `android:launchMode="singleTask"` is set in MainActivity
- Test with ADB first before testing with real links

**iOS:**

- Verify CFBundleURLTypes in Info.plist
- Rebuild the app after changing Info.plist
- Test in Safari or with `xcrun simctl openurl`

### Product Not Loading

- Check that the ProductDetailsPage properly handles both:
  - `productDetails` parameter (from navigation)
  - `productId` parameter (from deep link)
- Verify the API endpoint is working: `/posts/{productId}`

---

## Future Enhancements

Consider adding:

1. **Share Analytics:**

   - Track how many times products are shared
   - Track which sharing methods are most popular

2. **Share Preview:**

   - Generate Open Graph meta tags for better web previews
   - Add product image to shared links

3. **Referral System:**

   - Add referral codes to shared links
   - Track which user shared the product

4. **Social Media Integration:**
   - Direct sharing to specific platforms
   - Pre-formatted messages for different platforms

---

## Support

If you encounter any issues:

1. Check the console logs for errors
2. Verify all configuration files are updated
3. Rebuild the app after making configuration changes
4. Test on a real device if emulator/simulator doesn't work

---

## Summary

The share feature is now fully implemented and functional. Users can:

- ✅ Share products from the product details page
- ✅ Share via any installed app (WhatsApp, SMS, Email, etc.)
- ✅ Recipients can click links to open the product in the app
- ✅ Deep linking works on both Android and iOS

Remember to update the web URLs with your actual domain before deploying to production!
