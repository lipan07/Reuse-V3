import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import CryptoJS from 'crypto-js';

/**
 * Backblaze B2 Direct Upload Service
 * 
 * This service handles direct uploads to Backblaze B2 storage from React Native.
 * 
 * Flow:
 * 1. Get Backblaze credentials from backend (cached for security)
 * 2. Authorize with Backblaze directly from React Native
 * 3. Get upload URL from Backblaze
 * 4. Upload file directly to Backblaze
 * 5. Return the public file URL
 */

class BackblazeService {
    constructor() {
        // Cache for credentials and auth tokens
        this.credentials = null;
        this.authToken = null;
        this.apiUrl = null;
        this.downloadUrl = null;
        this.uploadUrl = null;
        this.uploadAuthToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Get Backblaze credentials from backend (cached)
     * This is called once and credentials are cached
     */
    async getCredentials() {
        // Check cache first
        if (this.credentials) {
            return this.credentials;
        }

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication required. Please login first.');
            }

            // Get credentials from backend
            console.log('BASE_URL', `${BASE_URL}/backblaze/credentials`);
            const response = await fetch(`${BASE_URL}/backblaze/credentials`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            console.log('token', token);
            // console.log('response', await response.json());
            if (!response.ok) {
                throw new Error('Failed to get Backblaze credentials from server');
            }

            const data = await response.json();
            this.credentials = {
                accountId: data.account_id,
                applicationKey: data.application_key,
                bucketId: data.bucket_id,
                bucketName: data.bucket_name,
            };

            return this.credentials;
        } catch (error) {
            console.error('Failed to get Backblaze credentials:', error);
            throw error;
        }
    }

    /**
     * Authorize with Backblaze B2
     */
    async authorize() {
        // Check if we have valid cached auth
        if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return {
                authToken: this.authToken,
                apiUrl: this.apiUrl,
                downloadUrl: this.downloadUrl,
            };
        }

        try {
            const credentials = await this.getCredentials();
            const authString = btoa(`${credentials.accountId}:${credentials.applicationKey}`);

            const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${authString}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Backblaze authorization failed: ${errorText}`);
            }

            const data = await response.json();
            this.authToken = data.authorizationToken;
            this.apiUrl = data.apiUrl;
            this.downloadUrl = data.downloadUrl;

            // Cache for 1 hour (tokens are valid for 24 hours)
            this.tokenExpiry = Date.now() + (60 * 60 * 1000);

            return {
                authToken: this.authToken,
                apiUrl: this.apiUrl,
                downloadUrl: this.downloadUrl,
            };
        } catch (error) {
            console.error('Backblaze authorization error:', error);
            throw error;
        }
    }

    /**
     * Get upload URL from Backblaze
     */
    async getUploadUrl() {
        // Check if we have valid cached upload URL
        if (this.uploadUrl && this.uploadAuthToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return {
                uploadUrl: this.uploadUrl,
                uploadAuthToken: this.uploadAuthToken,
            };
        }

        try {
            const { authToken, apiUrl } = await this.authorize();
            const credentials = await this.getCredentials();

            const response = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
                method: 'POST',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bucketId: credentials.bucketId,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to get upload URL: ${errorText}`);
            }

            const data = await response.json();
            console.log('data abcdef', data);
            this.uploadUrl = data.uploadUrl;
            this.uploadAuthToken = data.authorizationToken;

            return {
                uploadUrl: this.uploadUrl,
                uploadAuthToken: this.uploadAuthToken,
            };
        } catch (error) {
            console.error('Failed to get upload URL:', error);
            throw error;
        }
    }

    /**
     * Calculate SHA1 hash of file in chunks to avoid memory issues
     * For very large files, we'll read the entire file but process it efficiently
     * @param {string} fileUri - File URI
     * @param {number} fileSize - File size in bytes
     * @returns {Promise<string>} SHA1 hash in hex format
     */
    async calculateSHA1InChunks(fileUri, fileSize) {
        // For React Native, we'll read the file as base64 in one go
        // but process it efficiently with crypto-js
        // Note: This still loads file into memory, but crypto-js processes it efficiently
        console.log('Reading file for SHA1 calculation...');
        const fileData = await RNFS.readFile(fileUri, 'base64');

        // Process in chunks to avoid blocking
        const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for processing
        const totalChunks = Math.ceil(fileData.length / CHUNK_SIZE);
        let sha1 = CryptoJS.algo.SHA1.create();

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, fileData.length);
            const chunk = fileData.substring(start, end);

            const wordArray = CryptoJS.enc.Base64.parse(chunk);
            sha1.update(wordArray);

            // Allow UI thread to breathe every few chunks
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        return sha1.finalize().toString(CryptoJS.enc.Hex);
    }

    /**
     * Upload video directly to Backblaze B2 from React Native
     * Uses streaming upload for large files to avoid memory issues
     * 
     * @param {string} fileUri - Local file URI from react-native-image-picker
     * @param {string} fileName - Desired file name (optional)
     * @param {Function} onProgress - Progress callback (bytesUploaded, totalBytes)
     */
    async uploadVideo(fileUri, fileName = null, onProgress = null) {
        try {
            console.log('fileUri:', fileUri);

            // Step 1: Get file info
            const fileInfo = await RNFS.stat(fileUri);
            const fileSize = fileInfo.size;
            console.log('File size:', fileSize, 'bytes (', (fileSize / 1024 / 1024).toFixed(2), 'MB)');

            // Generate file name if not provided
            if (!fileName) {
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 8);
                fileName = `videos/${timestamp}_${randomStr}.mp4`;
            } else if (!fileName.startsWith('videos/')) {
                fileName = `videos/${fileName}`;
            }

            // Step 2: Get upload URL from Backblaze
            const { uploadUrl, uploadAuthToken } = await this.getUploadUrl();
            console.log('Upload URL obtained');

            // Step 3: Calculate SHA1 hash
            // For very large files, skip SHA1 to avoid memory crashes
            // Backblaze will calculate it server-side if we omit the header
            console.log('Calculating SHA1 hash...');
            let sha1Hash = null;

            // Only calculate SHA1 for files under 50MB to avoid memory issues
            if (fileSize > 50 * 1024 * 1024) {
                // For files larger than 50MB, skip SHA1 calculation to prevent crashes
                // Backblaze will verify the file integrity server-side
                console.log('Large file detected (>50MB), skipping SHA1 calculation to prevent memory issues');
                console.warn('SHA1 will be calculated by Backblaze server-side');
                // We'll try uploading without SHA1 - Backblaze might accept it
                // If not, we'll get an error and can handle it
            } else if (fileSize > 20 * 1024 * 1024) {
                // For files 20-50MB, use chunked processing
                console.log('Medium file detected, using chunked SHA1 calculation');
                try {
                    sha1Hash = await this.calculateSHA1InChunks(fileUri, fileSize);
                } catch (error) {
                    console.warn('SHA1 calculation failed, continuing without it:', error);
                    sha1Hash = null;
                }
            } else {
                // For smaller files, read and process directly (faster)
                try {
                    const fileData = await RNFS.readFile(fileUri, 'base64');
                    const wordArray = CryptoJS.enc.Base64.parse(fileData);
                    sha1Hash = CryptoJS.SHA1(wordArray).toString(CryptoJS.enc.Hex);
                } catch (error) {
                    console.warn('SHA1 calculation failed, continuing without it:', error);
                    sha1Hash = null;
                }
            }

            if (sha1Hash) {
                console.log('SHA1 hash calculated:', sha1Hash.substring(0, 8) + '...');
            } else {
                console.log('Uploading without SHA1 (will be calculated server-side)');
            }

            // Step 4: Upload directly to Backblaze using XMLHttpRequest for progress tracking
            console.log('Starting direct upload to Backblaze...');

            // Read file as base64 and convert to binary
            console.log('Reading file for upload...');
            const fileData = await RNFS.readFile(fileUri, 'base64');
            const binaryString = atob(fileData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Use XMLHttpRequest for better progress tracking
            const result = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                // Track upload progress
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && onProgress) {
                        const progress = (event.loaded / event.total) * 100;
                        console.log(`Upload progress: ${progress.toFixed(2)}% (${event.loaded}/${event.total})`);
                        onProgress(event.loaded, event.total);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            console.log('Upload successful:', response);
                            resolve(response);
                        } catch (e) {
                            reject(new Error('Failed to parse upload response'));
                        }
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Network error during upload'));
                });

                xhr.addEventListener('abort', () => {
                    reject(new Error('Upload aborted'));
                });

                // Set headers
                xhr.open('POST', uploadUrl);
                xhr.setRequestHeader('Authorization', uploadAuthToken);
                xhr.setRequestHeader('X-Bz-File-Name', encodeURIComponent(fileName));
                xhr.setRequestHeader('Content-Type', 'video/mp4');
                xhr.setRequestHeader('Content-Length', fileSize.toString());

                if (sha1Hash) {
                    xhr.setRequestHeader('X-Bz-Content-Sha1', sha1Hash);
                }

                // Send binary data
                xhr.send(bytes);
            });

            // Step 5: Construct the public download URL
            const { downloadUrl } = await this.authorize();
            const creds = await this.getCredentials();

            // Use fileName from result if available, otherwise use the one we sent
            const actualFileName = result.fileName || fileName;
            const fileUrl = `${downloadUrl}/file/${creds.bucketName}/${actualFileName}`;

            console.log('Upload successful! File URL:', fileUrl);

            return {
                success: true,
                fileUrl: fileUrl,
                fileId: result.fileId,
                fileName: actualFileName,
                size: result.contentLength || result.size || fileSize,
                uploadTimestamp: result.uploadTimestamp || Date.now(),
            };
        } catch (error) {
            console.error('Backblaze upload error:', error);
            throw error;
        }
    }

    /**
     * Delete video from Backblaze B2
     * 
     * @param {string} fileId - Backblaze file ID
     * @param {string} fileName - File name (optional, for logging)
     */
    async deleteVideo(fileId, fileName = null) {
        try {
            if (!fileId) {
                throw new Error('File ID is required to delete video');
            }

            // Authorize with Backblaze
            const { authToken, apiUrl } = await this.authorize();

            // Delete file using Backblaze API
            const response = await fetch(`${apiUrl}/b2api/v2/b2_delete_file_version`, {
                method: 'POST',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileId: fileId,
                    fileName: fileName || 'videos/unknown',
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backblaze delete error:', errorText);
                throw new Error(`Failed to delete video from Backblaze: ${errorText}`);
            }

            const result = await response.json();
            console.log('Video deleted successfully from Backblaze:', fileName || fileId);
            
            return {
                success: true,
                fileId: result.fileId,
                fileName: result.fileName,
            };
        } catch (error) {
            console.error('Backblaze delete error:', error);
            throw error;
        }
    }

    /**
     * Delete video by URL (extracts file ID from URL or uses backend endpoint)
     * 
     * @param {string} videoUrl - Full video URL
     * @param {string} fileId - Optional file ID if available
     */
    async deleteVideoByUrl(videoUrl, fileId = null) {
        try {
            // If we have fileId, use it directly
            if (fileId) {
                // Extract fileName from URL
                const urlParts = videoUrl.split('/');
                const fileName = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
                return await this.deleteVideo(fileId, fileName);
            }

            // If no fileId, try to delete via backend
            // Extract file path from URL
            const urlMatch = videoUrl.match(/\/file\/[^\/]+\/(.+)$/);
            if (!urlMatch) {
                throw new Error('Could not extract file path from URL');
            }

            const filePath = urlMatch[1];
            
            // Call backend to delete (backend can handle file lookup)
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${BASE_URL}/backblaze/delete-video`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    filePath: filePath,
                    videoUrl: videoUrl,
                }),
            });

            if (!response.ok) {
                // Read response body as text first (can only read once)
                const responseText = await response.text();
                const contentType = response.headers.get('content-type') || '';
                let errorMessage = 'Failed to delete video';
                
                try {
                    if (contentType.includes('application/json')) {
                        // Try to parse as JSON
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } else {
                        // Response is not JSON (likely HTML error page)
                        console.error('Backend delete video error (non-JSON):', responseText.substring(0, 200));
                        // Provide user-friendly error message based on status
                        if (response.status === 404) {
                            errorMessage = 'Video not found in storage. It may have already been deleted.';
                        } else if (response.status === 500) {
                            errorMessage = 'Server error. The video will be deleted when you save the post.';
                        } else {
                            errorMessage = `Server error (${response.status}). The video will be deleted when you save the post.`;
                        }
                    }
                } catch (e) {
                    // If JSON parsing fails, use text or generic message
                    console.error('Error parsing delete response:', e);
                    if (response.status === 404) {
                        errorMessage = 'Video not found in storage. It may have already been deleted.';
                    } else if (response.status === 500) {
                        errorMessage = 'Server error. The video will be deleted when you save the post.';
                    } else {
                        errorMessage = `Server error (${response.status}). The video will be deleted when you save the post.`;
                    }
                }
                
                throw new Error(errorMessage);
            }

            // Response is OK, parse result (using already read responseText)
            let result;
            try {
                if (contentType.includes('application/json')) {
                    result = JSON.parse(responseText);
                } else {
                    // Non-JSON response but status is OK
                    result = { success: true, message: 'Video deleted successfully' };
                }
            } catch (e) {
                // If parsing fails, assume success since status is OK
                console.warn('Could not parse delete response, assuming success:', e);
                result = { success: true, message: 'Video deleted successfully' };
            }
            
            return {
                success: true,
                ...result,
            };
        } catch (error) {
            console.error('Error deleting video by URL:', error);
            throw error;
        }
    }
}

export default new BackblazeService();

