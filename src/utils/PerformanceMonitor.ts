/**
 * 性能监控工具类
 * 用于收集应用性能指标、错误信息和用户行为数据
 */

// 性能指标接口
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'loading' | 'rendering' | 'interaction' | 'memory' | 'network';
  metadata?: Record<string, any>;
}

// 错误信息接口
interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  category: 'javascript' | 'resource' | 'network' | 'audio' | 'image';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

// 用户行为事件接口
interface UserEvent {
  type: string;
  timestamp: number;
  data?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorReport[] = [];
  private userEvents: UserEvent[] = [];
  private isEnabled: boolean = true;
  private maxStorageSize: number = 1000; // 最大存储条目数
  private reportingEndpoint?: string;

  private constructor() {
    this.initializeMonitoring();
  }

  /**
   * 获取性能监控器单例
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 初始化性能监控
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // 监听JavaScript错误
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        category: 'javascript',
        severity: 'high',
        metadata: {
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // 监听Promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        category: 'javascript',
        severity: 'medium',
        metadata: {
          reason: event.reason,
        },
      });
    });

    // 监听资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        this.reportError({
          message: `Resource failed to load: ${target.tagName}`,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          category: 'resource',
          severity: 'medium',
          metadata: {
            tagName: target.tagName,
            src: (target as any).src || (target as any).href,
          },
        });
      }
    }, true);

    // 监听页面性能指标
    this.collectWebVitals();
  }

  /**
   * 收集Web Vitals性能指标
   */
  private collectWebVitals(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    // 页面加载完成后收集指标
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.recordMetric({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.fetchStart,
            timestamp: Date.now(),
            category: 'loading',
            metadata: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              firstPaint: this.getFirstPaint(),
              firstContentfulPaint: this.getFirstContentfulPaint(),
            },
          });
        }

        // 收集内存使用情况
        this.collectMemoryMetrics();
      }, 1000);
    });
  }

  /**
   * 获取首次绘制时间
   */
  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  /**
   * 获取首次内容绘制时间
   */
  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : null;
  }

  /**
   * 收集内存使用指标
   */
  private collectMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric({
        name: 'memory_usage',
        value: memory.usedJSHeapSize,
        timestamp: Date.now(),
        category: 'memory',
        metadata: {
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        },
      });
    }
  }

  /**
   * 记录性能指标
   */
  public recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);
    this.trimStorage();

    // 如果是关键指标，立即上报
    if (this.isCriticalMetric(metric)) {
      this.reportMetrics([metric]);
    }
  }

  /**
   * 报告错误
   */
  public reportError(error: ErrorReport): void {
    if (!this.isEnabled) return;

    this.errors.push(error);
    this.trimStorage();

    // 高严重性错误立即上报
    if (error.severity === 'high' || error.severity === 'critical') {
      this.reportErrors([error]);
    }
  }

  /**
   * 记录用户事件
   */
  public recordUserEvent(event: UserEvent): void {
    if (!this.isEnabled) return;

    this.userEvents.push(event);
    this.trimStorage();
  }

  /**
   * 记录音频相关错误
   */
  public reportAudioError(message: string, metadata?: Record<string, any>): void {
    this.reportError({
      message,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      category: 'audio',
      severity: 'medium',
      metadata,
    });
  }

  /**
   * 记录图片加载错误
   */
  public reportImageError(message: string, metadata?: Record<string, any>): void {
    this.reportError({
      message,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      category: 'image',
      severity: 'low',
      metadata,
    });
  }

  /**
   * 记录网络错误
   */
  public reportNetworkError(message: string, metadata?: Record<string, any>): void {
    this.reportError({
      message,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      category: 'network',
      severity: 'medium',
      metadata,
    });
  }

  /**
   * 测量函数执行时间
   */
  public measureFunction<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();

    this.recordMetric({
      name: `function_${name}`,
      value: endTime - startTime,
      timestamp: Date.now(),
      category: 'rendering',
    });

    return result;
  }

  /**
   * 测量异步函数执行时间
   */
  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();

    this.recordMetric({
      name: `async_function_${name}`,
      value: endTime - startTime,
      timestamp: Date.now(),
      category: 'rendering',
    });

    return result;
  }

  /**
   * 获取性能统计
   */
  public getPerformanceStats(): {
    metrics: PerformanceMetric[];
    errors: ErrorReport[];
    userEvents: UserEvent[];
    summary: {
      totalMetrics: number;
      totalErrors: number;
      totalUserEvents: number;
      averageLoadTime: number;
      errorRate: number;
    };
  } {
    const loadTimeMetrics = this.metrics.filter(m => m.name === 'page_load_time');
    const averageLoadTime = loadTimeMetrics.length > 0 
      ? loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length 
      : 0;

    const errorRate = this.errors.length / Math.max(this.metrics.length, 1);

    return {
      metrics: [...this.metrics],
      errors: [...this.errors],
      userEvents: [...this.userEvents],
      summary: {
        totalMetrics: this.metrics.length,
        totalErrors: this.errors.length,
        totalUserEvents: this.userEvents.length,
        averageLoadTime,
        errorRate,
      },
    };
  }

  /**
   * 清除所有数据
   */
  public clearData(): void {
    this.metrics = [];
    this.errors = [];
    this.userEvents = [];
  }

  /**
   * 设置上报端点
   */
  public setReportingEndpoint(endpoint: string): void {
    this.reportingEndpoint = endpoint;
  }

  /**
   * 启用/禁用监控
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 判断是否为关键指标
   */
  private isCriticalMetric(metric: PerformanceMetric): boolean {
    const criticalMetrics = ['page_load_time', 'memory_usage'];
    return criticalMetrics.includes(metric.name) || metric.value > 5000; // 超过5秒的操作
  }

  /**
   * 上报指标数据
   */
  private async reportMetrics(metrics: PerformanceMetric[]): Promise<void> {
    if (!this.reportingEndpoint) return;

    try {
      await fetch(this.reportingEndpoint + '/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics }),
      });
    } catch (error) {
      console.warn('Failed to report metrics:', error);
    }
  }

  /**
   * 上报错误数据
   */
  private async reportErrors(errors: ErrorReport[]): Promise<void> {
    if (!this.reportingEndpoint) return;

    try {
      await fetch(this.reportingEndpoint + '/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors }),
      });
    } catch (error) {
      console.warn('Failed to report errors:', error);
    }
  }

  /**
   * 限制存储大小
   */
  private trimStorage(): void {
    if (this.metrics.length > this.maxStorageSize) {
      this.metrics = this.metrics.slice(-this.maxStorageSize);
    }
    if (this.errors.length > this.maxStorageSize) {
      this.errors = this.errors.slice(-this.maxStorageSize);
    }
    if (this.userEvents.length > this.maxStorageSize) {
      this.userEvents = this.userEvents.slice(-this.maxStorageSize);
    }
  }
}

// 创建并导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();

export default PerformanceMonitor;
export type { PerformanceMetric, ErrorReport, UserEvent };