import AsyncStorage from '@react-native-async-storage/async-storage';
import CacheService from './cacheService';

/**
 * Optimized API Service
 * - Request caching
 * - Request deduplication
 * - Automatic retry logic
 * - Request cancellation support
 */

class OptimizedApiService {
  constructor() {
    this.pendingRequests = new Map();
    this.abortControllers = new Map();
  }

  /**
   * Get auth token
   */
  async getAuthToken() {
    return await AsyncStorage.getItem('authToken');
  }

  /**
   * Create request key for deduplication
   */
  createRequestKey(url, options) {
    return `${url}:${JSON.stringify(options)}`;
  }

  /**
   * Fetch with caching and deduplication
   */
  async fetchWithCache(url, options = {}, cacheOptions = {}) {
    const {
      useCache = true,
      cacheDuration = CacheService.CACHE_DURATIONS.DEFAULT,
      cacheKey = null,
    } = cacheOptions;

    // Generate cache key
    const finalCacheKey = cacheKey || CacheService.hashObject({ url, options });
    const cachePrefix = 'cache:api';
    const fullCacheKey = `${cachePrefix}:${finalCacheKey}`;

    // Try to get from cache first
    if (useCache) {
      const cached = await CacheService.get(fullCacheKey);
      if (cached) {
        console.log('Cache hit:', url);
        return cached;
      }
    }

    // Check if same request is already pending (deduplication)
    const requestKey = this.createRequestKey(url, options);
    if (this.pendingRequests.has(requestKey)) {
      console.log('Deduplicating request:', url);
      return this.pendingRequests.get(requestKey);
    }

    // Create AbortController for this request
    const abortController = new AbortController();
    this.abortControllers.set(requestKey, abortController);

    // Make the request
    const requestPromise = this.executeRequest(url, {
      ...options,
      signal: abortController.signal,
    });

    // Store pending request
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const response = await requestPromise;
      
      // Cache successful response
      if (useCache && response) {
        await CacheService.set(fullCacheKey, response, cacheDuration);
      }

      return response;
    } finally {
      // Clean up
      this.pendingRequests.delete(requestKey);
      this.abortControllers.delete(requestKey);
    }
  }

  /**
   * Execute HTTP request with retry logic
   */
  async executeRequest(url, options = {}, retries = 2) {
    const token = await this.getAuthToken();
    
    const defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const finalOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, finalOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // Retry logic for network errors
      if (retries > 0 && !options.signal?.aborted) {
        console.log(`Retrying request (${retries} attempts left):`, url);
        await this.delay(1000); // Wait 1 second before retry
        return this.executeRequest(url, options, retries - 1);
      }

      throw error;
    }
  }

  /**
   * Fetch posts with caching
   */
  async fetchPosts(filters = {}, page = 1, limit = 15) {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, page, limit }).forEach(([key, value]) => {
      if (value != null && value !== '') {
        if (key === 'priceRange' && Array.isArray(value)) {
          value.forEach(item => {
            if (item !== null && item !== '') {
              params.append(`${key}[]`, item);
            }
          });
        } else {
          params.append(key, value);
        }
      }
    });

    const url = `${process.env.BASE_URL}/posts?${params.toString()}`;
    
    return await this.fetchWithCache(url, { method: 'GET' }, {
      useCache: true,
      cacheDuration: CacheService.CACHE_DURATIONS.POSTS,
      cacheKey: CacheService.hashObject({ filters, page }),
    });
  }

  /**
   * Fetch categories with caching
   */
  async fetchCategories() {
    // Check cache first
    const cached = await CacheService.getCachedCategories();
    if (cached) return cached;

    const url = `${process.env.BASE_URL}/category`;
    const categories = await this.fetchWithCache(url, { method: 'GET' }, {
      useCache: true,
      cacheDuration: CacheService.CACHE_DURATIONS.CATEGORIES,
    });

    // Store in dedicated categories cache
    await CacheService.cacheCategories(categories);
    return categories;
  }

  /**
   * Fetch user profile with caching
   */
  async fetchUserProfile(userId) {
    // Check cache first
    const cached = await CacheService.getCachedUserProfile(userId);
    if (cached) return cached;

    const url = `${process.env.BASE_URL}/users/${userId}`;
    const profile = await this.fetchWithCache(url, { method: 'GET' }, {
      useCache: true,
      cacheDuration: CacheService.CACHE_DURATIONS.USER_PROFILE,
    });

    // Store in dedicated profile cache
    await CacheService.cacheUserProfile(userId, profile);
    return profile;
  }

  /**
   * Fetch current user profile
   */
  async fetchMyProfile() {
    const url = `${process.env.BASE_URL}/get-my-profile`;
    return await this.fetchWithCache(url, { method: 'GET' }, {
      useCache: true,
      cacheDuration: CacheService.CACHE_DURATIONS.USER_PROFILE,
    });
  }

  /**
   * Post form data (no caching for mutations)
   */
  async submitForm(formData, subcategory) {
    const token = await this.getAuthToken();
    const formDataToSend = new FormData();

    // Append standard fields
    Object.keys(formData).forEach((key) => {
      if (!['images', 'deletedImages'].includes(key)) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Handle images
    if (formData.images) {
      formData.images
        .filter(image => image.isNew)
        .forEach((image, index) => {
          formDataToSend.append('new_images[]', {
            uri: image.uri,
            type: 'image/jpeg',
            name: `image_${Date.now()}_${index}.jpg`
          });
        });

      formData.images
        .filter(image => !image.isNew)
        .map(image => image.uri)
        .forEach(uri => formDataToSend.append('existing_images[]', uri));
    }

    // Append deleted image IDs
    if (formData.deletedImages) {
      formData.deletedImages.forEach(id =>
        formDataToSend.append('deleted_images[]', id)
      );
    }

    formDataToSend.append('category_id', subcategory.id);
    formDataToSend.append('guard_name', subcategory.guard_name);

    const isUpdate = !!formData.id;
    const apiUrl = isUpdate
      ? `${process.env.BASE_URL}/posts/${formData.id}`
      : `${process.env.BASE_URL}/posts`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        // Clear posts cache after successful mutation
        await CacheService.clearPostsCache();
        
        return {
          success: true,
          alert: {
            type: 'success',
            title: 'Success',
            message: isUpdate ? 'Post updated successfully!' : 'Post created successfully!'
          },
          data: responseData
        };
      } else {
        return {
          success: false,
          alert: {
            type: 'warning',
            title: 'Validation Error',
            message: responseData.message || 'Something went wrong!'
          },
          errors: responseData.errors
        };
      }
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        alert: {
          type: 'error',
          title: 'Network Error',
          message: 'Failed to connect to the server'
        },
        error: error.message
      };
    }
  }

  /**
   * Cancel pending request
   */
  cancelRequest(url, options = {}) {
    const requestKey = this.createRequestKey(url, options);
    const controller = this.abortControllers.get(requestKey);
    
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestKey);
      this.pendingRequests.delete(requestKey);
      console.log('Request cancelled:', url);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests() {
    this.abortControllers.forEach((controller, key) => {
      controller.abort();
      console.log('Request cancelled:', key);
    });
    
    this.abortControllers.clear();
    this.pendingRequests.clear();
  }

  /**
   * Prefetch data for better UX
   */
  async prefetchData() {
    try {
      // Prefetch categories
      await this.fetchCategories();
      
      // Prefetch user profile
      await this.fetchMyProfile();
      
      console.log('Data prefetched successfully');
    } catch (error) {
      console.error('Error prefetching data:', error);
    }
  }

  /**
   * Utility: Delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    await CacheService.clearAll();
    console.log('All caches cleared');
  }
}

// Export singleton instance
export default new OptimizedApiService();

