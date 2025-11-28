# Google Cloud Console Setup - Step by Step

## ⚠️ DEVELOPER_ERROR Fix

Error Code: **10** = DEVELOPER_ERROR  
This means your Android OAuth client is NOT configured in Google Cloud Console.

## 📋 Exact Steps to Fix

### Step 1: Open Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Make sure you're in the **correct project**
3. Click on **"APIs & Services"** in the left menu
4. Click on **"Credentials"**

### Step 2: Find Your OAuth 2.0 Client
1. Look for **"OAuth 2.0 Client IDs"** section
2. Find the client that has this Client ID:
   ```
   965583527872-ko5s12ge7nj8d06rl748v3r80pkom4u9.apps.googleusercontent.com
   ```
3. **Click on the name** (not the edit icon, click the actual name)

### Step 3: Add Android Configuration
1. You should see sections like:
   - **Application type:** Web application
   - **Authorized JavaScript origins**
   - **Authorized redirect URIs**
   - **Authorized client IDs** or **Android apps** (this is what we need!)

2. Scroll down to find **"Authorized client IDs"** or **"Android apps"** section

3. If you see **"+ ADD ANDROID APP"** or **"Add Android"** button, click it

4. If you DON'T see this option, it might be because:
   - You're looking at a Web application type client
   - You need to create a separate Android OAuth client
   - Try this: Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"** → Select **"Android"** as application type

### Step 4: Enter Android Details

**Option A: If adding to existing client**
- Package name: `com.malaq.notify`
- SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- Click **SAVE**

**Option B: If creating new Android client**
1. Application type: **Android**
2. Name: "Reuse App Android" (or any name)
3. Package name: `com.malaq.notify`
4. SHA-1 certificate fingerprint: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
5. Click **CREATE**

### Step 5: Verify Configuration

After saving, you should see:
- ✅ Your Web application client (with the Client ID)
- ✅ Android app entry with:
  - Package name: `com.malaq.notify`
  - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

### Step 6: Wait and Test

1. **Wait 5-10 minutes** for changes to propagate
2. **Close your app completely**
3. **Rebuild if needed:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```
4. **Try uploading video again**

## 🔍 Verification Checklist

Before testing, verify ALL of these:

- [ ] YouTube Data API v3 is **ENABLED**
  - Go to: APIs & Services → Library
  - Search "YouTube Data API v3"
  - Should show "API enabled"

- [ ] OAuth 2.0 Client exists with Web application type
  - Client ID: `965583527872-ko5s12ge7nj8d06rl748v3r80pkom4u9.apps.googleusercontent.com`

- [ ] Android app is added to the OAuth client
  - Package name: `com.malaq.notify` (exact match, no spaces)
  - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` (with colons)

- [ ] OAuth consent screen is configured
  - Go to: APIs & Services → OAuth consent screen
  - Should be configured (even if in testing mode)
  - Scopes should include:
    - `https://www.googleapis.com/auth/youtube.upload`
    - `https://www.googleapis.com/auth/youtube`

## 🚨 Common Issues

### Issue 1: Can't find "Add Android" button
**Solution:** You might need to create a separate Android OAuth client:
1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth 2.0 Client ID"**
3. Application type: **"Android"**
4. Enter package name and SHA-1
5. Click **CREATE**

### Issue 2: SHA-1 format error
**Correct format (with colons):**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**Wrong format (no colons):**
```
5E8F16062EA3CD2C4A0D547876BAA6F38CABF625
```

### Issue 3: Package name mismatch
**Must be exact:**
- ✅ Correct: `com.malaq.notify`
- ❌ Wrong: `com.malaq.notify ` (extra space)
- ❌ Wrong: `com.malaq.Notify` (capital N)
- ❌ Wrong: `com.malaq.notify1` (extra character)

### Issue 4: Changes not taking effect
- Wait **5-10 minutes** after saving
- **Close app completely** (not just minimize)
- **Rebuild the app** if needed
- Clear app data: `adb shell pm clear com.malaq.notify`

## 📱 Alternative: Create Separate Android Client

If you can't add Android to existing client:

1. Go to **Credentials** page
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth 2.0 Client ID"**
4. Application type: **"Android"**
5. Name: "Reuse App Android Client"
6. Package name: `com.malaq.notify`
7. SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
8. Click **CREATE**

**Note:** Even with separate clients, make sure both are in the same Google Cloud project.

## ✅ Success Indicators

When properly configured, you should:
- ✅ See Android app listed in OAuth client
- ✅ No DEVELOPER_ERROR when signing in
- ✅ Google account picker appears
- ✅ Sign-in succeeds
- ✅ Video upload works

## 🆘 Still Not Working?

1. **Double-check SHA-1:**
   ```bash
   cd android
   ./gradlew signingReport
   ```
   Verify the SHA1 matches exactly

2. **Check package name in build.gradle:**
   - File: `android/app/build.gradle`
   - Line: `applicationId "com.malaq.notify"`
   - Must match exactly

3. **Verify in Google Cloud Console:**
   - Go to your OAuth client
   - Check Android apps section
   - Verify package name and SHA-1 are correct

4. **Check OAuth consent screen:**
   - Must be configured
   - Add test users if in testing mode

5. **Wait longer:**
   - Sometimes takes 15-20 minutes to propagate

