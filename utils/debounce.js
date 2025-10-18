/**
 * Debounce utility function
 * Delays execution of a function until after a specified time has passed since the last call
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle utility function
 * Ensures a function is called at most once in a specified time period
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Debounce with leading edge
 * Executes immediately on the first call, then debounces subsequent calls
 */
export const debounceLeading = (func, wait = 300) => {
  let timeout;
  let isLeading = true;
  
  return function executedFunction(...args) {
    if (isLeading) {
      func(...args);
      isLeading = false;
    }
    
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      isLeading = true;
    }, wait);
  };
};

export default {
  debounce,
  throttle,
  debounceLeading,
};

