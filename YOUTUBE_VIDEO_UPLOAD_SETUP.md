# YouTube Video Upload Feature Setup

This guide explains how to set up and use the YouTube video upload feature in your property add forms.

## ✅ What's Been Added

1. **YouTube Service** (`service/youtubeService.js`)
   - Handles Google Sign-In
   - Uploads videos to YouTube
   - Returns YouTube video URL

2. **Video Picker Component** (`components/AddProduct/SubComponent/VideoPickerComponent.js`)
   - UI for selecting and uploading videos
   - Progress tracking
   - Integrated into property forms

3. **Integration in AddHousesApartments**
   - Video upload section added
   - Video URL stored in form data
   - Automatically included in form submission

## 📋 Prerequisites

1. **YouTube API OAuth Client ID**
   - Create in Google Cloud Console
   - Use **Web application** type (not Android)
   - Add your package name: `com.malaq.notify`
   - Add SHA-1 fingerprint: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

2. **Environment Variable**
   Add to your `.env` file:
   ```env
   YOUTUBE_CLIENT_ID=your-web-client-id-here.apps.googleusercontent.com
   ```

3. **Dependencies** (Already installed)
   - `@react-native-google-signin/google-signin`
   - `react-native-fs`
   - `react-native-image-picker`

## 🚀 How It Works

1. **User selects a video** from their device
2. **System prompts** to upload to YouTube
3. **If not signed in**, automatically signs in with Google
4. **Video uploads** to YouTube as **unlisted**
5. **YouTube URL** is stored in `formData.videoUrl`
6. **URL is included** when submitting the property form

## 📝 Usage in Other Forms

To add video upload to other property forms (like `AddCarForm.js`, `AddShopOffices.js`, etc.):

### Step 1: Import the component
```javascript
import VideoPickerComponent from './SubComponent/VideoPickerComponent';
```

### Step 2: Add to formData state
```javascript
const [formData, setFormData] = useState({
  // ... existing fields
  videoUrl: null,
  videoId: null,
});
```

### Step 3: Add the component in the form
```javascript
{/* Video Picker */}
<View style={modernStyles.fieldContainer}>
  <View style={modernStyles.labelContainer}>
    <Icon name="videocam-outline" size={normalize(18)} color="#666" />
    <Text style={modernStyles.label}>Video</Text>
  </View>
  <VideoPickerComponent
    formData={formData}
    setFormData={setFormData}
    propertyTitle={formData.adTitle}
  />
</View>
```

### Step 4: Handle in edit mode (if applicable)
```javascript
// When fetching existing product data
videoUrl: productData.video_url || productData.videoUrl || null,
videoId: productData.video_id || productData.videoId || null,
```

## 🔧 Backend Requirements

Your backend API should accept:
- `videoUrl` - The YouTube video URL (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`)
- `videoId` - The YouTube video ID (optional, for easier reference)

Example backend field names:
- `video_url` or `videoUrl`
- `video_id` or `videoId`

## 📱 User Experience

1. User taps "Tap to select and upload video"
2. Video picker opens
3. User selects a video
4. Confirmation dialog appears
5. If not signed in, Google Sign-In appears
6. Upload progress shown (0-100%)
7. Success message when complete
8. Video URL stored in form
9. User can remove video if needed

## ⚙️ Configuration

### Video Privacy
Videos are uploaded as **unlisted** by default. To change this, edit `service/youtubeService.js`:

```javascript
status: {
  privacyStatus: 'unlisted', // Change to 'private' or 'public'
}
```

### Video Title
The video title uses the property's ad title. You can customize this in `VideoPickerComponent.js`:

```javascript
const result = await youtubeService.uploadVideo(
  videoAsset.uri,
  propertyTitle || formData.adTitle || 'Property Video', // Customize here
  onProgress
);
```

## 🐛 Troubleshooting

### "Please sign in to YouTube first"
- User needs to sign in with Google
- Check that `YOUTUBE_CLIENT_ID` is set correctly in `.env`
- Verify OAuth client is configured in Google Cloud Console

### Upload fails
- Check internet connection
- Verify YouTube Data API v3 is enabled in Google Cloud Console
- Check video file size (very large files may take time)
- Review error message in console

### Video URL not saving
- Ensure backend accepts `videoUrl` field
- Check form submission includes all formData fields
- Verify API response is successful

## 📊 API Quotas

YouTube Data API v3 has daily quotas:
- Default: 10,000 units per day
- Video upload: 1,600 units each
- Monitor usage in Google Cloud Console

## 🔒 Security Notes

- Videos are uploaded as **unlisted** (only people with link can view)
- OAuth tokens are stored securely in AsyncStorage
- Never commit `.env` file (already in `.gitignore`)
- Use different OAuth clients for dev/production

## ✅ Testing Checklist

- [ ] Add `YOUTUBE_CLIENT_ID` to `.env`
- [ ] Test video selection
- [ ] Test Google Sign-In flow
- [ ] Test video upload with progress
- [ ] Verify video URL is saved in form
- [ ] Test form submission includes video URL
- [ ] Test removing video
- [ ] Verify video appears on YouTube (unlisted)

## 📚 Additional Resources

- [YouTube Data API v3 Documentation](https://developers.google.com/youtube/v3)
- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [React Native Image Picker](https://github.com/react-native-image-picker/react-native-image-picker)

