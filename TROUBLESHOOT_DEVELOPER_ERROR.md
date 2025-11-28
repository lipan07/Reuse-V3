# Troubleshoot DEVELOPER_ERROR - Still Getting Error After Adding Android App

If you've added the Android app configuration but still getting DEVELOPER_ERROR, follow these steps:

## 🔍 Step 1: Verify Configuration in Google Cloud Console

### Check 1: Correct OAuth Client
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find the OAuth 2.0 Client ID that has this Client ID:
   ```
   965583527872-ko5s12ge7nj8d06rl748v3r80pkom4u9.apps.googleusercontent.com
   ```
3. **Click on the NAME** (not edit icon) to view details

### Check 2: Android App is Listed
1. Scroll down to **"Android apps"** or **"Authorized client IDs"** section
2. You should see an entry with:
   - Package name: `com.malaq.notify`
   - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
3. **If you DON'T see it**, it wasn't saved properly - add it again

### Check 3: Exact Match
**Package name must be EXACT:**
- ✅ Correct: `com.malaq.notify`
- ❌ Wrong: `com.malaq.notify ` (extra space at end)
- ❌ Wrong: `com.malaq.Notify` (capital N)
- ❌ Wrong: `com.malaq.notify1` (extra character)

**SHA-1 must be EXACT with colons:**
- ✅ Correct: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- ❌ Wrong: `5E8F16062EA3CD2C4A0D547876BAA6F38CABF625` (no colons)
- ❌ Wrong: `5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25` (lowercase)

## 🔧 Step 2: Clear App Data and Rebuild

### Clear App Data
```bash
adb shell pm clear com.malaq.notify
```

### Rebuild the App
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## ⏰ Step 3: Wait for Propagation

**Important:** Google Cloud Console changes can take:
- Minimum: 5 minutes
- Average: 10-15 minutes
- Maximum: 30 minutes

**After adding Android app:**
1. Wait **at least 15 minutes**
2. Don't test immediately
3. Close the app completely
4. Rebuild if needed
5. Try again

## 🔍 Step 4: Verify Current SHA-1

Make sure your current SHA-1 matches:

```bash
cd android
./gradlew signingReport
```

Look for:
```
Variant: debug
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**If it's different**, update Google Cloud Console with the new SHA-1.

## 🚨 Step 5: Common Issues and Fixes

### Issue 1: Added to Wrong OAuth Client
**Problem:** You added Android app to a different OAuth client
**Fix:** 
- Find the OAuth client with your Web Client ID
- Add Android app to THAT client (not a different one)

### Issue 2: Multiple OAuth Clients
**Problem:** You have multiple OAuth clients and added to the wrong one
**Fix:**
- Check which OAuth client has your Web Client ID
- That's the one that needs Android app configuration

### Issue 3: Typo in Package Name
**Problem:** Package name has a typo or extra space
**Fix:**
- Delete the Android app entry
- Add it again with exact package name: `com.malaq.notify`
- Double-check for spaces before/after

### Issue 4: SHA-1 Format Wrong
**Problem:** SHA-1 copied without colons or with wrong format
**Fix:**
- Delete the Android app entry
- Add it again with exact SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- Make sure colons are included

### Issue 5: Changes Not Saved
**Problem:** You entered details but didn't click SAVE
**Fix:**
- Go back to Google Cloud Console
- Verify Android app is actually listed
- If not listed, add it again and click SAVE

## 🆕 Step 6: Alternative - Create Separate Android Client

If adding to existing client doesn't work, try creating a separate Android OAuth client:

1. Go to **Credentials** page
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth 2.0 Client ID"**
4. Application type: **"Android"**
5. Name: "Reuse App Android"
6. Package name: `com.malaq.notify`
7. SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
8. Click **CREATE**

**Note:** Even with separate clients, they must be in the same Google Cloud project.

## ✅ Step 7: Verification Checklist

Before testing again, verify ALL:

- [ ] Android app is listed in OAuth client (not just entered, but SAVED and VISIBLE)
- [ ] Package name is exact: `com.malaq.notify` (no typos, no spaces)
- [ ] SHA-1 is exact: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` (with colons)
- [ ] Added to the correct OAuth client (the one with Web Client ID)
- [ ] Waited at least 15 minutes after adding
- [ ] Cleared app data: `adb shell pm clear com.malaq.notify`
- [ ] Rebuilt the app
- [ ] YouTube Data API v3 is enabled

## 🔄 Step 8: Test Again

1. **Close app completely** (not just minimize)
2. **Clear app data:**
   ```bash
   adb shell pm clear com.malaq.notify
   ```
3. **Rebuild:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```
4. **Wait 2-3 minutes** after app starts
5. **Try uploading video again**

## 📞 Still Not Working?

If you've done ALL of the above and still getting DEVELOPER_ERROR:

1. **Double-check in Google Cloud Console:**
   - Take a screenshot of your OAuth client showing Android app
   - Verify package name and SHA-1 are exactly as shown above

2. **Check if you're using the right project:**
   - Make sure you're in the correct Google Cloud project
   - The OAuth client should be in the same project

3. **Try creating a completely new OAuth client:**
   - Create new Web application client
   - Create new Android client
   - Update your `.env` with new Web Client ID
   - Rebuild app

4. **Check OAuth consent screen:**
   - Must be configured
   - Add test users if in testing mode

5. **Verify YouTube Data API v3 is enabled:**
   - Go to APIs & Services → Library
   - Search "YouTube Data API v3"
   - Should show "API enabled"

