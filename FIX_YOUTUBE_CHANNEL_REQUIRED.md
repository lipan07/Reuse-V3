# Fix "youtubeSignupRequired" Error

## 🔍 Error Details

**Error:** `youtubeSignupRequired`  
**Status:** 401 Unauthorized  
**Reason:** The Google account doesn't have a YouTube channel

## ✅ What This Means

The Google account you're using to sign in doesn't have a YouTube channel set up. YouTube requires a channel to upload videos.

## 🔧 How to Fix

### Option 1: Create YouTube Channel (Recommended)

1. **Open a web browser** (on your computer or phone)
2. **Go to:** https://www.youtube.com
3. **Sign in** with the same Google account you're using in the app
4. **If prompted to create a channel:**
   - Click **"Create Channel"** or **"Get Started"**
   - Follow the prompts to set up your YouTube channel
   - You can use your name or create a brand account
5. **Once channel is created**, come back to the app
6. **Try uploading video again**

### Option 2: Use Different Google Account

If you don't want to create a channel for this account:

1. **Sign out** from the current Google account in the app
2. **Sign in** with a different Google account that already has a YouTube channel
3. **Try uploading video again**

## 📋 Step-by-Step: Create YouTube Channel

1. **Open browser** → Go to youtube.com
2. **Sign in** with your Google account
3. **Click your profile icon** (top right)
4. **Click "Create Channel"** or **"Your Channel"**
5. **If creating new channel:**
   - Choose "Use your name" or "Use a custom name"
   - Click "Create Channel"
6. **Channel is now created!**
7. **Go back to your app**
8. **Try uploading video again**

## ✅ Verification

After creating the channel:
- ✅ You should be able to access youtube.com with that account
- ✅ You should see "Your Channel" in the YouTube menu
- ✅ The app should now be able to upload videos

## 🚨 Common Issues

### Issue 1: Channel Creation Blocked
**Symptom:** Can't create channel  
**Fix:** 
- Make sure you're signed in to the correct Google account
- Check if there are any restrictions on the account
- Try using a different Google account

### Issue 2: Still Getting Error After Creating Channel
**Fix:**
- Wait 2-3 minutes for YouTube to process the channel creation
- Clear app data and sign in again:
  ```bash
  adb shell pm clear com.malaq.notify
  ```
- Rebuild and try again

### Issue 3: Using Brand Account
**Fix:**
- If you created a brand account, make sure you're signed in to the right account
- The app needs to use the account that owns the channel

## 📱 After Creating Channel

1. **Wait 2-3 minutes** for YouTube to process
2. **Clear app data:**
   ```bash
   adb shell pm clear com.malaq.notify
   ```
3. **Rebuild app:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```
4. **Sign in again** with the account that has the YouTube channel
5. **Try uploading video**

## ✅ Success Indicators

When it's working:
- ✅ YouTube channel exists for the Google account
- ✅ Sign-in successful
- ✅ Video upload starts without "youtubeSignupRequired" error
- ✅ Video uploads successfully to YouTube

