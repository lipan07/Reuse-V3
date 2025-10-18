import { InteractionManager, PerformanceObserver } from 'react-native';
import CacheService from '../service/cacheService';

/**
 * Performance Monitoring Utility
 * Tracks app performance metrics and provides insights
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTimes: [],
      apiCalls: [],
      cacheHits: 0,
      cacheMisses: 0,
      screenTransitions: [],
    };
    this.timers = new Map();
  }

  /**
   * Start timing an operation
   */
  startTimer(label) {
    this.timers.set(label, Date.now());
  }

  /**
   * End timing and record metric
   */
  endTimer(label) {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer ${label} was not started`);
      return null;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);
    
    console.log(`⏱️ ${label}: ${duration}ms`);
    return duration;
  }

  /**
   * Track render time
   */
  trackRender(componentName, renderTime) {
    this.metrics.renderTimes.push({
      component: componentName,
      time: renderTime,
      timestamp: Date.now(),
    });

    // Keep only last 100 entries
    if (this.metrics.renderTimes.length > 100) {
      this.metrics.renderTimes.shift();
    }

    // Warn if render time is slow
    if (renderTime > 100) {
      console.warn(`⚠️ Slow render detected: ${componentName} took ${renderTime}ms`);
    }
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint, duration, cached = false) {
    this.metrics.apiCalls.push({
      endpoint,
      duration,
      cached,
      timestamp: Date.now(),
    });

    // Keep only last 50 entries
    if (this.metrics.apiCalls.length > 50) {
      this.metrics.apiCalls.shift();
    }

    if (cached) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    // Warn if API call is slow
    if (!cached && duration > 2000) {
      console.warn(`⚠️ Slow API call: ${endpoint} took ${duration}ms`);
    }
  }

  /**
   * Track screen transition
   */
  trackScreenTransition(fromScreen, toScreen, duration) {
    this.metrics.screenTransitions.push({
      from: fromScreen,
      to: toScreen,
      duration,
      timestamp: Date.now(),
    });

    // Keep only last 20 entries
    if (this.metrics.screenTransitions.length > 20) {
      this.metrics.screenTransitions.shift();
    }

    console.log(`📱 Screen transition: ${fromScreen} → ${toScreen} (${duration}ms)`);
  }

  /**
   * Get cache hit ratio
   */
  getCacheHitRatio() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (total === 0) return 0;
    return ((this.metrics.cacheHits / total) * 100).toFixed(2);
  }

  /**
   * Get average render time
   */
  getAverageRenderTime() {
    if (this.metrics.renderTimes.length === 0) return 0;
    const total = this.metrics.renderTimes.reduce((sum, item) => sum + item.time, 0);
    return (total / this.metrics.renderTimes.length).toFixed(2);
  }

  /**
   * Get average API call time
   */
  getAverageApiTime() {
    const nonCachedCalls = this.metrics.apiCalls.filter(call => !call.cached);
    if (nonCachedCalls.length === 0) return 0;
    const total = nonCachedCalls.reduce((sum, call) => sum + call.duration, 0);
    return (total / nonCachedCalls.length).toFixed(2);
  }

  /**
   * Get slow renders (> 100ms)
   */
  getSlowRenders() {
    return this.metrics.renderTimes.filter(render => render.time > 100);
  }

  /**
   * Get slow API calls (> 2000ms)
   */
  getSlowApiCalls() {
    return this.metrics.apiCalls.filter(call => !call.cached && call.duration > 2000);
  }

  /**
   * Get performance summary
   */
  async getPerformanceSummary() {
    const cacheStats = await CacheService.getStats();
    
    return {
      renders: {
        count: this.metrics.renderTimes.length,
        average: `${this.getAverageRenderTime()}ms`,
        slowCount: this.getSlowRenders().length,
      },
      api: {
        totalCalls: this.metrics.apiCalls.length,
        cacheHitRatio: `${this.getCacheHitRatio()}%`,
        averageTime: `${this.getAverageApiTime()}ms`,
        slowCount: this.getSlowApiCalls().length,
      },
      cache: cacheStats,
      screenTransitions: {
        count: this.metrics.screenTransitions.length,
      },
    };
  }

  /**
   * Print performance report
   */
  async printReport() {
    const summary = await this.getPerformanceSummary();
    
    console.log('\n==================== PERFORMANCE REPORT ====================');
    console.log('\n📊 RENDERS:');
    console.log(`   Total: ${summary.renders.count}`);
    console.log(`   Average: ${summary.renders.average}`);
    console.log(`   Slow (>100ms): ${summary.renders.slowCount}`);
    
    console.log('\n🌐 API CALLS:');
    console.log(`   Total: ${summary.api.totalCalls}`);
    console.log(`   Cache Hit Ratio: ${summary.api.cacheHitRatio}`);
    console.log(`   Average Time: ${summary.api.averageTime}`);
    console.log(`   Slow (>2000ms): ${summary.api.slowCount}`);
    
    console.log('\n💾 CACHE:');
    console.log(`   Total Keys: ${summary.cache?.totalKeys || 0}`);
    console.log(`   Valid: ${summary.cache?.validCount || 0}`);
    console.log(`   Expired: ${summary.cache?.expiredCount || 0}`);
    console.log(`   Size: ${summary.cache?.totalSize || '0 KB'}`);
    
    console.log('\n📱 SCREEN TRANSITIONS:');
    console.log(`   Total: ${summary.screenTransitions.count}`);
    
    console.log('\n===========================================================\n');
    
    return summary;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      renderTimes: [],
      apiCalls: [],
      cacheHits: 0,
      cacheMisses: 0,
      screenTransitions: [],
    };
    this.timers.clear();
    console.log('Performance metrics reset');
  }

  /**
   * Measure component render time
   */
  measureComponentRender(componentName) {
    const startTime = Date.now();
    
    return () => {
      const renderTime = Date.now() - startTime;
      this.trackRender(componentName, renderTime);
    };
  }

  /**
   * Measure async operation
   */
  async measureAsync(label, asyncFn) {
    this.startTimer(label);
    try {
      const result = await asyncFn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }

  /**
   * Wait for interactions to complete
   */
  async waitForInteraction() {
    return new Promise(resolve => {
      InteractionManager.runAfterInteractions(() => {
        resolve();
      });
    });
  }

  /**
   * Track memory warning
   */
  trackMemoryWarning() {
    console.warn('⚠️ Memory warning detected! Consider clearing cache.');
    // Automatically clean expired cache entries
    CacheService.cleanExpired();
  }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;

/**
 * HOC to measure component performance
 */
export const withPerformanceTracking = (Component, componentName) => {
  return (props) => {
    const endMeasure = performanceMonitor.measureComponentRender(componentName);
    
    React.useEffect(() => {
      endMeasure();
    }, []);

    return <Component {...props} />;
  };
};

