/**
 * Performance Configuration
 * Central configuration for all performance-related settings
 */

export const PerformanceConfig = {
  // Image Loading
  IMAGE: {
    // Image quality (0-100)
    QUALITY: 80,
    // Max image dimensions
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 1200,
    // Compression format
    FORMAT: 'JPEG',
    // Cache enabled
    CACHE_ENABLED: true,
  },

  // List Performance
  LIST: {
    // Number of items to render initially
    INITIAL_NUM_TO_RENDER: 10,
    // Number of items to render per batch
    MAX_TO_RENDER_PER_BATCH: 10,
    // Window size (number of pages to render)
    WINDOW_SIZE: 21,
    // Update cells batching period (ms)
    UPDATE_CELLS_BATCHING_PERIOD: 50,
    // Remove clipped subviews
    REMOVE_CLIPPED_SUBVIEWS: true,
    // On end reached threshold
    ON_END_REACHED_THRESHOLD: 0.5,
  },

  // API Configuration
  API: {
    // Request timeout (ms)
    TIMEOUT: 30000,
    // Max retry attempts
    MAX_RETRIES: 2,
    // Retry delay (ms)
    RETRY_DELAY: 1000,
    // Enable request deduplication
    ENABLE_DEDUPLICATION: true,
    // Enable caching
    ENABLE_CACHE: true,
  },

  // Cache Configuration
  CACHE: {
    // Cache durations in milliseconds
    DURATIONS: {
      CATEGORIES: 24 * 60 * 60 * 1000,  // 24 hours
      USER_PROFILE: 30 * 60 * 1000,      // 30 minutes
      POSTS: 15 * 60 * 1000,             // 15 minutes
      USER_STATUS: 5 * 60 * 1000,        // 5 minutes
      DEFAULT: 60 * 60 * 1000,           // 1 hour
    },
    // Auto clean expired cache
    AUTO_CLEAN: true,
    // Clean interval (ms)
    CLEAN_INTERVAL: 60 * 60 * 1000,      // 1 hour
  },

  // Animation Configuration
  ANIMATION: {
    // Enable animations
    ENABLED: true,
    // Animation duration (ms)
    DURATION: 200,
    // Use native driver
    USE_NATIVE_DRIVER: true,
  },

  // Network Configuration
  NETWORK: {
    // Enable offline mode
    OFFLINE_MODE: true,
    // Retry on network failure
    RETRY_ON_FAILURE: true,
    // Show network status
    SHOW_NETWORK_STATUS: true,
  },

  // Debug Configuration
  DEBUG: {
    // Enable performance logging
    ENABLE_LOGGING: __DEV__,
    // Log render times
    LOG_RENDERS: __DEV__,
    // Log API calls
    LOG_API_CALLS: __DEV__,
    // Show performance overlay
    SHOW_OVERLAY: false,
  },

  // Pagination
  PAGINATION: {
    // Page size
    PAGE_SIZE: 15,
    // Prefetch pages
    PREFETCH_PAGES: 1,
  },

  // Debounce/Throttle
  TIMINGS: {
    // Search input debounce (ms)
    SEARCH_DEBOUNCE: 300,
    // Scroll throttle (ms)
    SCROLL_THROTTLE: 100,
    // Button press debounce (ms)
    BUTTON_DEBOUNCE: 300,
  },
};

export default PerformanceConfig;

