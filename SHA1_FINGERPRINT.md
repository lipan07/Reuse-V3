# SHA-1 Fingerprint for Google Cloud Console

## ✅ Debug Keystore SHA-1 (For Development/Testing)

**SHA-1 Fingerprint:**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**SHA-256 Fingerprint:**
```
FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
```

## 📋 How to Use in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click to edit it
4. Scroll to "Android apps" or "Authorized client IDs" section
5. Click "+ ADD ANDROID APP"
6. Enter:
   - **Package name:** `com.malaq.notify`
   - **SHA-1 certificate fingerprint:** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
7. Click **SAVE**

## 🔑 Production Keystore SHA-1

If you need the production SHA-1, run:
```bash
keytool -keystore android/app/my-upload-key.keystore -list -v -alias my-key-alias
```

**Note:** You'll need the keystore password to run this command.

**Production SHA-1 (from earlier):**
```
16:B0:BE:E4:A3:05:D8:F4:AF:39:B1:64:FF:59:32:0C:D9:DD:FB:98
```

## ✅ Quick Copy for Google Cloud Console

**Package name:**
```
com.malaq.notify
```

**SHA-1 (Debug - for testing):**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**SHA-1 (Production - for release builds):**
```
16:B0:BE:E4:A3:05:D8:F4:AF:39:B1:64:FF:59:32:0C:D9:DD:FB:98
```

## ⚠️ Important Notes

1. **Include colons (:)**: The SHA-1 must include colons
2. **Exact match**: Package name must match exactly: `com.malaq.notify`
3. **Wait time**: After adding, wait 5-10 minutes for changes to propagate
4. **Both SHA-1s**: You can add both debug and production SHA-1s to the same OAuth client

## 🔍 Verify Your SHA-1

To get SHA-1 again, run:
```bash
cd android
./gradlew signingReport
```

Or use keytool:
```bash
keytool -keystore android/app/debug.keystore -list -v -storepass android -alias androiddebugkey
```

