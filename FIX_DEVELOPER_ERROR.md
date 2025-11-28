# Fix DEVELOPER_ERROR for YouTube API

## Error
`DEVELOPER_ERROR: Follow troubleshooting instructions`

This error means your SHA-1 fingerprint or package name doesn't match what's configured in Google Cloud Console.

## ✅ Verified Information

**Package Name:** `com.malaq.notify`  
**SHA-1 (Debug):** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`  
**SHA-1 (Production):** `16:B0:BE:E4:A3:05:D8:F4:AF:39:B1:64:FF:59:32:0C:D9:DD:FB:98`  
**Web Client ID:** `965583527872-ko5s12ge7nj8d06rl748v3r80pkom4u9.apps.googleusercontent.com`

## 🔧 Step-by-Step Fix

### Step 1: Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth 2.0 Client
1. Look for the OAuth 2.0 Client ID that contains your Web Client ID
2. Click on it to edit

### Step 3: Add Android Configuration
1. Scroll down to **"Authorized client IDs"** or **"Android apps"** section
2. Click **"+ ADD ANDROID APP"** or **"Add Android"**
3. Enter the following:

   **Package name:**
   ```
   com.malaq.notify
   ```
   ⚠️ Must match exactly (no spaces, no typos)

   **SHA-1 certificate fingerprint:**
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
   ⚠️ Must include colons (:) and match exactly

4. Click **SAVE**

### Step 4: Add Production SHA-1 (Optional but Recommended)
1. Click **"+ ADD ANDROID APP"** again
2. Enter the same package name: `com.malaq.notify`
3. Enter production SHA-1:
   ```
   16:B0:BE:E4:A3:05:D8:F4:AF:39:B1:64:FF:59:32:0C:D9:DD:FB:98
   ```
4. Click **SAVE**

### Step 5: Verify Configuration
Your OAuth 2.0 Client should show:
- ✅ Web application (with your Client ID)
- ✅ Android app 1: `com.malaq.notify` (Debug SHA-1)
- ✅ Android app 2: `com.malaq.notify` (Production SHA-1)

### Step 6: Wait for Propagation
- Changes can take **5-10 minutes** to propagate
- Don't test immediately after saving

### Step 7: Test Again
1. Close the app completely
2. Rebuild if needed: `npx react-native run-android`
3. Try uploading a video again

## 🔍 Verification Checklist

Before testing, verify:

- [ ] YouTube Data API v3 is **ENABLED**
- [ ] OAuth 2.0 Client ID exists with Web application type
- [ ] Android app added with package name: `com.malaq.notify`
- [ ] Debug SHA-1 added: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- [ ] OAuth consent screen is configured
- [ ] Required scopes are added:
  - `https://www.googleapis.com/auth/youtube.upload`
  - `https://www.googleapis.com/auth/youtube`

## 🚨 Common Mistakes

1. **Wrong SHA-1 format:**
   - ❌ Wrong: `5E8F16062EA3CD2C4A0D547876BAA6F38CABF625` (no colons)
   - ✅ Correct: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

2. **Package name typo:**
   - ❌ Wrong: `com.malaq.notify ` (extra space)
   - ❌ Wrong: `com.malaq.notify1` (wrong number)
   - ✅ Correct: `com.malaq.notify`

3. **Testing too soon:**
   - Wait 5-10 minutes after saving changes

4. **Wrong OAuth Client:**
   - Make sure you're editing the OAuth client that has your Web Client ID

## 📱 Alternative: Get Current SHA-1

If you're not sure about your SHA-1, run:

```bash
cd android
./gradlew signingReport
```

Look for the **SHA1** value under **Variant: debug**

## 🆘 Still Not Working?

1. **Double-check in Google Cloud Console:**
   - Go to your OAuth 2.0 Client
   - Verify Android apps section shows your package name and SHA-1

2. **Check OAuth Consent Screen:**
   - Must be configured (even if in testing mode)
   - Add test users if in testing mode

3. **Clear app data:**
   ```bash
   adb shell pm clear com.malaq.notify
   ```

4. **Rebuild the app:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

5. **Check console logs:**
   - Look for any additional error messages
   - Check if the error code is still `10` (DEVELOPER_ERROR)

## ✅ Success Indicators

When it's working, you should:
- ✅ See Google account picker
- ✅ Successfully sign in (no DEVELOPER_ERROR)
- ✅ Get access token
- ✅ Video upload starts

