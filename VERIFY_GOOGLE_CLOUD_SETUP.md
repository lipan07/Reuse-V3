# Verify Google Cloud Console Setup - Step by Step

## ✅ Confirmed SHA-1 Fingerprints

**Debug SHA-1:** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`  
**Production SHA-1:** `16:B0:BE:E4:A3:05:D8:F4:AF:39:B1:64:FF:59:32:0C:D9:DD:FB:98`  
**Package Name:** `com.malaq.notify`  
**Web Client ID:** `965583527872-ko5s12ge7nj8d06rl748v3r80pkom4u9.apps.googleusercontent.com`

## 🔍 Step-by-Step Verification

### Step 1: Open Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Make sure you're in the **correct project**
3. Click **"APIs & Services"** → **"Credentials"**

### Step 2: Find Your OAuth 2.0 Client
1. Look for **"OAuth 2.0 Client IDs"** section
2. Find the client with this Client ID:
   ```
   965583527872-ko5s12ge7nj8d06rl748v3r80pkom4u9.apps.googleusercontent.com
   ```
3. **Click on the NAME** (the text, not the edit icon) to view details

### Step 3: Check Android Apps Section
1. Scroll down in the OAuth client details page
2. Look for **"Android apps"** or **"Authorized client IDs"** section
3. **You should see an entry listed there**

### Step 4: Verify the Entry
The Android app entry should show:
- **Package name:** `com.malaq.notify`
- **SHA-1 certificate fingerprint:** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

**Check for these common mistakes:**
- ❌ Package name has extra space: `com.malaq.notify ` (space at end)
- ❌ Package name has typo: `com.malaq.notify1` or `com.malaq.Notify`
- ❌ SHA-1 missing colons: `5E8F16062EA3CD2C4A0D547876BAA6F38CABF625`
- ❌ SHA-1 lowercase: `5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25`
- ❌ Wrong SHA-1 (different fingerprint)

### Step 5: If Android App is NOT Listed

**Option A: Add to Existing Client**
1. Click **"EDIT"** (pencil icon) on the OAuth client
2. Scroll to **"Android apps"** section
3. Click **"+ ADD ANDROID APP"**
4. Enter:
   - Package name: `com.malaq.notify`
   - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
5. Click **"SAVE"** (important!)
6. Verify it appears in the list

**Option B: Create Separate Android Client**
1. Go back to Credentials page
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth 2.0 Client ID"**
4. Application type: **"Android"**
5. Name: "Reuse App Android"
6. Package name: `com.malaq.notify`
7. SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
8. Click **"CREATE"**

## ⚠️ Common Issues

### Issue 1: Entry Not Saved
**Symptom:** You entered details but don't see it in the list  
**Fix:** 
- Make sure you clicked **"SAVE"** or **"CREATE"**
- Refresh the page
- Check if it appears now

### Issue 2: Wrong OAuth Client
**Symptom:** Added Android app but to a different OAuth client  
**Fix:**
- Find the OAuth client with your Web Client ID
- Add Android app to THAT client (not a different one)

### Issue 3: Typo in Package Name
**Symptom:** Package name doesn't match exactly  
**Fix:**
- Delete the entry
- Add again with exact: `com.malaq.notify`
- Copy-paste to avoid typos

### Issue 4: SHA-1 Format Wrong
**Symptom:** SHA-1 copied without colons or wrong format  
**Fix:**
- Delete the entry
- Add again with exact: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- Make sure colons are included

## ⏰ After Adding/Verifying

1. **Wait 15-20 minutes** for changes to propagate
2. **Clear app data:**
   ```bash
   adb shell pm clear com.malaq.notify
   ```
3. **Rebuild the app:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```
4. **Wait 2-3 minutes** after app starts
5. **Try uploading video again**

## ✅ Success Indicators

When properly configured, you should see in Google Cloud Console:
- ✅ OAuth 2.0 Client ID with your Web Client ID
- ✅ Android apps section showing:
  - Package name: `com.malaq.notify`
  - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

When testing the app:
- ✅ No DEVELOPER_ERROR
- ✅ Google account picker appears
- ✅ Sign-in succeeds
- ✅ Video upload works

## 📸 What to Check

Take a screenshot or note down:
1. The OAuth client name/ID
2. Whether Android apps section shows your entry
3. The exact package name shown
4. The exact SHA-1 shown

Compare these with:
- Package: `com.malaq.notify`
- SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

If they don't match exactly, that's the problem!

