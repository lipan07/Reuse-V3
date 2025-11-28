# Fix "Unauthorized" Error for YouTube Upload

## ✅ Progress Made
- ✅ DEVELOPER_ERROR fixed (Android OAuth client configured)
- ✅ NETWORK_ERROR fixed (connection working)
- ✅ Sign-in successful
- ❌ Getting "Unauthorized" when uploading

## 🔍 What "Unauthorized" Means

The "Unauthorized" error means your access token doesn't have permission to upload videos to YouTube. This is usually because:

1. **YouTube Data API v3 is not enabled**
2. **OAuth consent screen doesn't have the required scopes**
3. **Access token doesn't have the right scopes**

## 🔧 Step-by-Step Fix

### Step 1: Enable YouTube Data API v3

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** → **Library**
4. Search for **"YouTube Data API v3"**
5. Click on it
6. Click **"ENABLE"** button
7. Wait for it to enable (should show "API enabled")

### Step 2: Configure OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Make sure it's configured:
   - **User Type:** External (or Internal if using Google Workspace)
   - **App name:** Your app name
   - **User support email:** Your email
   - **Developer contact:** Your email

3. **Add Required Scopes:**
   - Click **"ADD OR REMOVE SCOPES"**
   - Search and add these scopes:
     - `https://www.googleapis.com/auth/youtube.upload`
     - `https://www.googleapis.com/auth/youtube`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

4. **Add Test Users (if in Testing mode):**
   - Go to **"Test users"** section
   - Click **"+ ADD USERS"**
   - Add the Google account email you're using to test
   - Click **"ADD"**

5. **Publish (if ready):**
   - If you want anyone to use it, click **"PUBLISH APP"**
   - If testing, keep it in "Testing" mode and add test users

### Step 3: Verify Scopes in Code

The code should request these scopes (already configured):
```javascript
scopes: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
]
```

### Step 4: Re-sign In

After configuring OAuth consent screen:
1. **Clear app data:**
   ```bash
   adb shell pm clear com.malaq.notify
   ```
2. **Rebuild app:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```
3. **Sign in again** (this will request the new scopes)
4. **Try uploading video**

## ✅ Verification Checklist

Before testing, verify:

- [ ] YouTube Data API v3 is **ENABLED**
  - Go to: APIs & Services → Library
  - Search "YouTube Data API v3"
  - Should show "API enabled"

- [ ] OAuth consent screen is **CONFIGURED**
  - Go to: APIs & Services → OAuth consent screen
  - Should show your app name and email

- [ ] Required scopes are **ADDED**
  - `https://www.googleapis.com/auth/youtube.upload`
  - `https://www.googleapis.com/auth/youtube`
  - Should be listed in "Scopes" section

- [ ] Test user added (if in Testing mode)
  - Your Google account email should be in test users list

- [ ] App data cleared and rebuilt
  - Cleared app data
  - Rebuilt app
  - Signed in again

## 🚨 Common Issues

### Issue 1: API Not Enabled
**Symptom:** "Unauthorized" error  
**Fix:** Enable YouTube Data API v3 in API Library

### Issue 2: Scopes Not Added
**Symptom:** "Unauthorized" error  
**Fix:** Add required scopes in OAuth consent screen

### Issue 3: Testing Mode Without Test User
**Symptom:** "Unauthorized" error  
**Fix:** Add your Google account email to test users list

### Issue 4: Old Token Without Scopes
**Symptom:** "Unauthorized" error  
**Fix:** Clear app data, rebuild, sign in again to get new token with scopes

## 📱 After Fixing

1. **Clear app data:**
   ```bash
   adb shell pm clear com.malaq.notify
   ```

2. **Rebuild:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

3. **Sign in again** (will request new scopes)

4. **Try uploading video**

## ✅ Success Indicators

When properly configured:
- ✅ YouTube Data API v3 shows "API enabled"
- ✅ OAuth consent screen shows required scopes
- ✅ Sign-in requests permission for YouTube access
- ✅ Video upload succeeds
- ✅ Video appears on YouTube (as unlisted)

