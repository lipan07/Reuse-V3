# FFmpegKit Installation Guide

## Package Installation

1. Install the package:
```bash
cd Reuse-V3
npm install ffmpeg-kit-react-native
```

2. For iOS, install pods:
```bash
cd ios
pod install
cd ..
```

3. For Android, the package should auto-link. If not, you may need to rebuild:
```bash
cd android
./gradlew clean
cd ..
```

## Rebuild the App

After installation, rebuild your app:

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## Notes

- FFmpegKit is the maintained replacement for `react-native-ffmpeg`
- It provides FFmpeg functionality for video compression
- The package size is larger (~9MB) but provides powerful video processing capabilities
- Works on both real devices and simulators (though real devices are recommended for performance)

## Troubleshooting

If you encounter issues:
1. Clean and rebuild the project
2. Clear Metro bundler cache: `npm start -- --reset-cache`
3. For Android: `cd android && ./gradlew clean && cd ..`
4. For iOS: `cd ios && pod deintegrate && pod install && cd ..`

