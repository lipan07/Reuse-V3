# 16 KB Page Size Support - Fix Guide

## Current Issue
Google Play is rejecting the app because `libandroidlame.so` from `react-native-compressor` doesn't support 16 KB page sizes.

## Solutions

### Option 1: Exclude the Problematic Library (Recommended)
If you can use image compression without audio compression, exclude `libandroidlame.so`:

1. Edit `android/app/build.gradle` and uncomment the exclusion line:
```gradle
packaging {
    jniLibs {
        useLegacyPackaging = false
    }
    // Exclude libandroidlame.so which doesn't support 16 KB
    jniLibs.excludes += ['**/libandroidlame.so']
}
```

2. Rebuild the AAB:
```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

**Note:** This will disable audio compression features, but image compression should still work.

### Option 2: Use Alternative Compression Method
Modify `ImagePickerComponent.js` to use a compression method that doesn't require `libandroidlame.so`:

```javascript
const compressedUri = await Compressor.compress(asset.uri, {
    compressionMethod: 'manual', // Use manual instead of auto
    quality: 0.7,
    maxWidth: 1280,
    maxHeight: 720,
});
```

### Option 3: Replace react-native-compressor
Consider using an alternative library that supports 16 KB:
- `react-native-image-resizer` - For image compression
- `react-native-image-crop-picker` - Has built-in compression

### Option 4: Wait for Library Update
Monitor `react-native-compressor` for updates that add 16 KB support:
- GitHub: https://github.com/Shobbak/react-native-compressor
- Check for issues/PRs related to 16 KB support

## Verification Steps

1. Build AAB (not APK):
```bash
cd android
./gradlew bundleRelease
```

2. Upload the AAB to Google Play Console

3. Check Play Console for any remaining errors

## Current Configuration

✅ `useLegacyPackaging = false` - Enabled
✅ `android.enable16kPages=true` - Added to gradle.properties
✅ AAB format - Required for Google Play
❌ `libandroidlame.so` - Doesn't support 16 KB (needs exclusion or replacement)

