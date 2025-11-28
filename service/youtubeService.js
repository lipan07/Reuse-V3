import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { YOUTUBE_CLIENT_ID } from '@env';
import RNFS from 'react-native-fs';

// Console log to check if YOUTUBE_CLIENT_ID is loaded
console.log('YOUTUBE_CLIENT_ID:', YOUTUBE_CLIENT_ID);
console.log('YOUTUBE_CLIENT_ID type:', typeof YOUTUBE_CLIENT_ID);
console.log('YOUTUBE_CLIENT_ID length:', YOUTUBE_CLIENT_ID?.length);

// Configure Google Sign-In
// Note: For React Native, we use the Web Client ID, but the Android OAuth client
// must also be configured in Google Cloud Console with matching package name and SHA-1
GoogleSignin.configure({
    webClientId: YOUTUBE_CLIENT_ID, // From Google Cloud Console OAuth 2.0 Client ID (Web application)
    offlineAccess: true, // Required to get refresh token
    scopes: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
    ],
    // Force code for refresh token (optional but recommended)
    forceCodeForRefreshToken: true,
});

class YouTubeService {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
    }

    /**
     * Verify Google Cloud Console Configuration
     * This helps diagnose DEVELOPER_ERROR issues
     */
    getConfigurationInfo() {
        return {
            packageName: 'com.malaq.notify',
            debugSHA1: '5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25',
            productionSHA1: '16:B0:BE:E4:A3:05:D8:F4:AF:39:B1:64:FF:59:32:0C:D9:DD:FB:98',
            webClientId: YOUTUBE_CLIENT_ID,
            instructions: `
To fix DEVELOPER_ERROR, verify in Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth 2.0 Client ID: ${YOUTUBE_CLIENT_ID}
3. Click to edit it
4. Scroll to "Authorized client IDs" or "Android apps"
5. Click "+ ADD ANDROID APP"
6. Enter:
   Package name: com.malaq.notify
   SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
7. Click SAVE
8. Wait 5-10 minutes for changes to propagate
9. Try again

Current Configuration:
- Package: com.malaq.notify
- Web Client ID: ${YOUTUBE_CLIENT_ID}
- Debug SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
            `,
        };
    }

    /**
     * Sign in with Google and get access token
     */
    async signIn() {
        try {
            console.log('🔐 Starting Google Sign-In...');
            console.log('Using Web Client ID:', YOUTUBE_CLIENT_ID);

            await GoogleSignin.hasPlayServices();
            console.log('✅ Play Services available');

            const userInfo = await GoogleSignin.signIn();
            console.log('✅ Sign-in successful, user:', userInfo.user?.email);

            // Get access token
            const tokens = await GoogleSignin.getTokens();
            console.log('✅ Tokens retrieved');
            console.log('Access token exists:', !!tokens.accessToken);
            console.log('Access token length:', tokens.accessToken?.length);
            console.log('Refresh token exists:', !!tokens.refreshToken);

            this.accessToken = tokens.accessToken;
            this.refreshToken = tokens.refreshToken;

            // Store tokens securely
            await AsyncStorage.setItem('youtube_access_token', this.accessToken);
            if (this.refreshToken) {
                await AsyncStorage.setItem('youtube_refresh_token', this.refreshToken);
            }
            console.log('✅ Tokens stored');

            return {
                success: true,
                user: userInfo.user,
                accessToken: this.accessToken,
            };
        } catch (error) {
            console.error('❌ Google Sign-In Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            // Handle DEVELOPER_ERROR specifically
            if (error.code === 10 || error.message?.includes('DEVELOPER_ERROR')) {
                const configInfo = this.getConfigurationInfo();

                console.error('❌ DEVELOPER_ERROR Detected!');
                console.error('═══════════════════════════════════════');
                console.error('TROUBLESHOOTING STEPS:');
                console.error('═══════════════════════════════════════');
                console.error('');
                console.error('1. VERIFY in Google Cloud Console:');
                console.error('   → Go to: https://console.cloud.google.com/apis/credentials');
                console.error(`   → Find OAuth Client: ${YOUTUBE_CLIENT_ID}`);
                console.error('   → Click to edit it');
                console.error('   → Check "Android apps" section');
                console.error('');
                console.error('2. VERIFY Android app is added:');
                console.error('   → Package name: com.malaq.notify (exact match)');
                console.error('   → SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25');
                console.error('');
                console.error('3. COMMON ISSUES:');
                console.error('   → Typo in package name (check for spaces, capital letters)');
                console.error('   → SHA-1 missing colons (must have : between pairs)');
                console.error('   → Wrong OAuth client (must be the one with Web Client ID)');
                console.error('   → Changes not propagated (wait 10-15 minutes)');
                console.error('');
                console.error('4. TRY THESE FIXES:');
                console.error('   → Clear app data: adb shell pm clear com.malaq.notify');
                console.error('   → Rebuild app: cd android && ./gradlew clean && cd .. && npx react-native run-android');
                console.error('   → Wait 15 minutes after adding Android app');
                console.error('   → Double-check SHA-1: cd android && ./gradlew signingReport');
                console.error('═══════════════════════════════════════');

                return {
                    success: false,
                    error: 'DEVELOPER_ERROR: Verify Android app configuration in Google Cloud Console. See console for detailed steps.',
                    code: error.code,
                    troubleshooting: configInfo.instructions,
                    configInfo: configInfo,
                };
            }

            // Handle NETWORK_ERROR
            if (error.code === 7 || error.message?.includes('NETWORK_ERROR')) {
                console.error('❌ NETWORK_ERROR Detected!');
                console.error('Possible causes:');
                console.error('1. No internet connection');
                console.error('2. Google Play Services network issue');
                console.error('3. Device not signed in to Google account');
                console.error('4. Firewall or network restrictions');

                return {
                    success: false,
                    error: 'Network error. Please check your internet connection and try again.',
                    code: error.code,
                    troubleshooting: 'NETWORK_ERROR: Check internet connection, ensure device is signed in to Google account, and try again.',
                };
            }

            return {
                success: false,
                error: error.message || 'Sign-in failed',
                code: error.code,
            };
        }
    }

    /**
     * Check if user is already signed in
     */
    async isSignedIn() {
        try {
            const isSignedIn = await GoogleSignin.isSignedIn();
            if (isSignedIn) {
                const tokens = await GoogleSignin.getTokens();
                this.accessToken = tokens.accessToken;
            } else {
                // Try to get stored token
                const storedToken = await AsyncStorage.getItem('youtube_access_token');
                if (storedToken) {
                    this.accessToken = storedToken;
                }
            }
            return isSignedIn || !!this.accessToken;
        } catch (error) {
            console.error('Check Sign-In Error:', error);
            return false;
        }
    }

    /**
     * Get current access token
     */
    async getAccessToken() {
        if (this.accessToken) {
            return this.accessToken;
        }

        try {
            const isSignedIn = await GoogleSignin.isSignedIn();
            if (isSignedIn) {
                const tokens = await GoogleSignin.getTokens();
                this.accessToken = tokens.accessToken;
                return this.accessToken;
            }

            // Try to get from storage
            const storedToken = await AsyncStorage.getItem('youtube_access_token');
            if (storedToken) {
                this.accessToken = storedToken;
                return storedToken;
            }

            return null;
        } catch (error) {
            console.error('Get Access Token Error:', error);
            return null;
        }
    }

    /**
     * Upload video to YouTube and return the URL
     * @param {string} videoPath - Local file path to the video
     * @param {string} title - Video title (optional, defaults to property title)
     * @param {function} onProgress - Optional progress callback (bytesUploaded, totalBytes)
     * @returns {Promise<{success: boolean, videoUrl?: string, videoId?: string, error?: string}>}
     */
    async uploadVideo(videoPath, title = 'Property Video', onProgress = null) {
        try {
            // Check if signed in, if not, sign in first
            let accessToken = await this.getAccessToken();
            if (!accessToken) {
                const signInResult = await this.signIn();
                if (!signInResult.success) {
                    return {
                        success: false,
                        error: 'Please sign in to YouTube first',
                    };
                }
                accessToken = signInResult.accessToken;
            }

            // Step 1: Initialize resumable upload session
            const videoMetadata = {
                snippet: {
                    title: title || 'Property Video',
                    description: 'Property video uploaded from Reuse App',
                    tags: ['property', 'real-estate'],
                    categoryId: '22', // People & Blogs
                },
                status: {
                    privacyStatus: 'unlisted', // Unlisted so only people with link can see
                },
            };

            // Initialize resumable upload
            console.log('📤 Initializing YouTube upload...');
            console.log('Access token exists:', !!accessToken);
            console.log('Access token length:', accessToken?.length);

            const initResponse = await fetch(
                'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-Upload-Content-Type': 'video/*',
                    },
                    body: JSON.stringify(videoMetadata),
                }
            );

            console.log('Upload init response status:', initResponse.status);
            console.log('Upload init response ok:', initResponse.ok);

            if (!initResponse.ok) {
                const errorData = await initResponse.json();
                console.error('❌ Upload initialization failed:');
                console.error('Status:', initResponse.status);
                console.error('Error data:', JSON.stringify(errorData, null, 2));

                // Handle specific error cases
                if (initResponse.status === 401) {
                    // Check for specific YouTube errors
                    const errorReason = errorData.error?.errors?.[0]?.reason;

                    if (errorReason === 'youtubeSignupRequired') {
                        throw new Error('YouTube channel required: The Google account needs a YouTube channel. Please create a YouTube channel for this account at youtube.com or use an account that already has one.');
                    } else {
                        throw new Error('Unauthorized: Access token may be invalid or missing required scopes. Please sign in again.');
                    }
                } else if (initResponse.status === 403) {
                    throw new Error('Forbidden: YouTube Data API v3 may not be enabled or OAuth consent screen needs configuration.');
                } else {
                    throw new Error(errorData.error?.message || `Failed to initialize upload (Status: ${initResponse.status})`);
                }
            }

            const uploadUrl = initResponse.headers.get('Location');
            if (!uploadUrl) {
                throw new Error('Failed to get upload URL');
            }

            // Step 2: Upload video file using react-native-fs
            const fileInfo = await RNFS.stat(videoPath);
            const fileSize = fileInfo.size;

            // Use react-native-fs uploadFiles for resumable upload
            const uploadResult = await RNFS.uploadFiles({
                toUrl: uploadUrl,
                files: [
                    {
                        name: 'video',
                        filename: 'video.mp4',
                        filepath: videoPath,
                        filetype: 'video/mp4',
                    },
                ],
                method: 'PUT',
                headers: {
                    'Content-Type': 'video/*',
                    'Content-Length': fileSize.toString(),
                },
                begin: (res) => {
                    console.log('Upload started:', res);
                },
                progress: (res) => {
                    if (onProgress) {
                        onProgress(res.totalBytesSent, res.totalBytesExpectedToSend);
                    }
                },
            }).promise;

            if (uploadResult.statusCode === 200 || uploadResult.statusCode === 201) {
                try {
                    const result = JSON.parse(uploadResult.body);
                    const videoUrl = `https://www.youtube.com/watch?v=${result.id}`;

                    return {
                        success: true,
                        videoUrl: videoUrl,
                        videoId: result.id,
                        data: result,
                    };
                } catch (error) {
                    throw new Error('Failed to parse response');
                }
            } else {
                try {
                    const errorData = JSON.parse(uploadResult.body);
                    throw new Error(errorData.error?.message || 'Upload failed');
                } catch (error) {
                    throw new Error(`Upload failed with status ${uploadResult.statusCode}`);
                }
            }
        } catch (error) {
            console.error('Upload Video Error:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

export default new YouTubeService();

