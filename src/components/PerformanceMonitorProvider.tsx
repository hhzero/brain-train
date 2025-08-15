'use client';

import { useEffect } from 'react';
import { performanceMonitor } from '@/utils/PerformanceMonitor';

/**
 * 性能监控提供者组件
 * 在应用启动时初始化性能监控系统
 */
export function PerformanceMonitorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 记录应用启动指标
    performanceMonitor.recordMetric({
      name: 'app_startup',
      value: performance.now(),
      timestamp: Date.now(),
      category: 'loading',
      metadata: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    });

    // 监听页面卸载事件，生成性能报告
    const handleBeforeUnload = () => {
      const report = performanceMonitor.getPerformanceStats();
      console.log('性能报告:', report);
      
      // 在生产环境中，可以将报告发送到服务器
      if (process.env.NODE_ENV === 'production') {
        // 发送到分析服务
        // analytics.send(report);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // 清理函数
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return <>{children}</>;
}