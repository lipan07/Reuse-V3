import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Frontend Cache Service
 * Mirrors backend caching strategy to improve app performance
 */

class CacheService {
    // Cache duration in milliseconds
    static CACHE_DURATIONS = {
        CATEGORIES: 24 * 60 * 60 * 1000, // 24 hours
        USER_PROFILE: 30 * 60 * 1000,     // 30 minutes
        POSTS: 15 * 60 * 1000,            // 15 minutes
        USER_STATUS: 5 * 60 * 1000,       // 5 minutes
        DEFAULT: 60 * 60 * 1000,          // 1 hour
    };

    // Cache key prefixes
    static KEYS = {
        CATEGORIES: 'cache:categories',
        USER_PROFILE: 'cache:user_profile',
        POSTS: 'cache:posts',
        USER_STATUS: 'cache:user_status',
        DEFAULT_LOCATION: 'cache:default_location',
    };

    /**
     * Generate cache key with timestamp
     */
    static generateCacheKey(prefix, identifier = '') {
        return identifier ? `${prefix}:${identifier}` : prefix;
    }

    /**
     * Set cache with expiry
     */
    static async set(key, value, duration = this.CACHE_DURATIONS.DEFAULT) {
        try {
            const cacheData = {
                value,
                timestamp: Date.now(),
                expiry: Date.now() + duration,
            };
            await AsyncStorage.setItem(key, JSON.stringify(cacheData));
            return true;
        } catch (error) {
            console.error('Error setting cache:', error);
            return false;
        }
    }

    /**
     * Get cache if not expired
     */
    static async get(key) {
        try {
            const cached = await AsyncStorage.getItem(key);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);

            // Check if expired
            if (Date.now() > cacheData.expiry) {
                await this.remove(key);
                return null;
            }

            return cacheData.value;
        } catch (error) {
            console.error('Error getting cache:', error);
            return null;
        }
    }

    /**
     * Remove cache
     */
    static async remove(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing cache:', error);
            return false;
        }
    }

    /**
     * Clear all cache with pattern
     */
    static async clearPattern(pattern) {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const matchingKeys = keys.filter(key => key.startsWith(pattern));
            await AsyncStorage.multiRemove(matchingKeys);
            return true;
        } catch (error) {
            console.error('Error clearing cache pattern:', error);
            return false;
        }
    }

    /**
     * Cache posts with filters
     */
    static async cachePosts(filters, posts) {
        const filtersHash = this.hashObject(filters);
        const key = this.generateCacheKey(this.KEYS.POSTS, filtersHash);
        return await this.set(key, posts, this.CACHE_DURATIONS.POSTS);
    }

    /**
     * Get cached posts
     */
    static async getCachedPosts(filters) {
        const filtersHash = this.hashObject(filters);
        const key = this.generateCacheKey(this.KEYS.POSTS, filtersHash);
        return await this.get(key);
    }

    /**
     * Cache categories
     */
    static async cacheCategories(categories) {
        return await this.set(this.KEYS.CATEGORIES, categories, this.CACHE_DURATIONS.CATEGORIES);
    }

    /**
     * Get cached categories
     */
    static async getCachedCategories() {
        return await this.get(this.KEYS.CATEGORIES);
    }

    /**
     * Cache user profile
     */
    static async cacheUserProfile(userId, profile) {
        const key = this.generateCacheKey(this.KEYS.USER_PROFILE, userId);
        return await this.set(key, profile, this.CACHE_DURATIONS.USER_PROFILE);
    }

    /**
     * Get cached user profile
     */
    static async getCachedUserProfile(userId) {
        const key = this.generateCacheKey(this.KEYS.USER_PROFILE, userId);
        return await this.get(key);
    }

    /**
     * Cache user status
     */
    static async cacheUserStatus(userId, status) {
        const key = this.generateCacheKey(this.KEYS.USER_STATUS, userId);
        return await this.set(key, status, this.CACHE_DURATIONS.USER_STATUS);
    }

    /**
     * Get cached user status
     */
    static async getCachedUserStatus(userId) {
        const key = this.generateCacheKey(this.KEYS.USER_STATUS, userId);
        return await this.get(key);
    }

    /**
     * Clear user-related cache
     */
    static async clearUserCache(userId) {
        await this.remove(this.generateCacheKey(this.KEYS.USER_PROFILE, userId));
        await this.remove(this.generateCacheKey(this.KEYS.USER_STATUS, userId));
        return true;
    }

    /**
     * Clear all posts cache
     */
    static async clearPostsCache() {
        return await this.clearPattern(this.KEYS.POSTS);
    }

    /**
     * Clear all cache
     */
    static async clearAll() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith('cache:'));
            await AsyncStorage.multiRemove(cacheKeys);
            return true;
        } catch (error) {
            console.error('Error clearing all cache:', error);
            return false;
        }
    }

    /**
     * Get cache statistics
     */
    static async getStats() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith('cache:'));

            let totalSize = 0;
            let validCount = 0;
            let expiredCount = 0;

            for (const key of cacheKeys) {
                const value = await AsyncStorage.getItem(key);
                if (value) {
                    totalSize += value.length;
                    const cacheData = JSON.parse(value);
                    if (Date.now() > cacheData.expiry) {
                        expiredCount++;
                    } else {
                        validCount++;
                    }
                }
            }

            return {
                totalKeys: cacheKeys.length,
                validCount,
                expiredCount,
                totalSize: (totalSize / 1024).toFixed(2) + ' KB',
            };
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return null;
        }
    }

    /**
     * Clean expired cache entries
     */
    static async cleanExpired() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith('cache:'));

            let cleanedCount = 0;
            for (const key of cacheKeys) {
                const value = await AsyncStorage.getItem(key);
                if (value) {
                    const cacheData = JSON.parse(value);
                    if (Date.now() > cacheData.expiry) {
                        await AsyncStorage.removeItem(key);
                        cleanedCount++;
                    }
                }
            }

            console.log(`Cleaned ${cleanedCount} expired cache entries`);
            return cleanedCount;
        } catch (error) {
            console.error('Error cleaning expired cache:', error);
            return 0;
        }
    }

    /**
     * Simple hash function for objects
     */
    static hashObject(obj) {
        const str = JSON.stringify(obj);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Preload frequently accessed data
     */
    static async warmUpCache(authToken) {
        try {
            console.log('Warming up cache...');

            // Check if categories are already cached
            const cachedCategories = await this.getCachedCategories();
            if (!cachedCategories) {
                // Fetch and cache categories
                const response = await fetch(`${process.env.BASE_URL}/category`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                if (response.ok) {
                    const categories = await response.json();
                    await this.cacheCategories(categories);
                    console.log('Categories cached');
                }
            }

            return true;
        } catch (error) {
            console.error('Error warming up cache:', error);
            return false;
        }
    }
}

export default CacheService;

