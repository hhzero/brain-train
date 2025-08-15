// 性能监控调试脚本
// 在浏览器控制台中运行此脚本来检查性能监控数据

(function() {
  console.log('=== Brain Train 性能监控调试 ===');
  
  // 检查性能监控器是否存在
  if (typeof window !== 'undefined' && window.performanceMonitor) {
    const monitor = window.performanceMonitor;
    
    // 获取性能统计数据
    const stats = monitor.getPerformanceStats();
    
    console.log('📊 性能统计概览:');
    console.log('- 总指标数:', stats.summary.totalMetrics);
    console.log('- 总错误数:', stats.summary.totalErrors);
    console.log('- 用户事件数:', stats.summary.totalUserEvents);
    console.log('- 平均加载时间:', stats.summary.averageLoadTime.toFixed(2) + 'ms');
    console.log('- 错误率:', (stats.summary.errorRate * 100).toFixed(2) + '%');
    
    // 显示最近的错误
    if (stats.errors.length > 0) {
      console.log('\n🚨 最近的错误:');
      stats.errors.slice(-5).forEach((error, index) => {
        console.log(`${index + 1}. [${error.severity}] ${error.message}`);
        console.log(`   时间: ${new Date(error.timestamp).toLocaleString()}`);
        console.log(`   分类: ${error.category}`);
        if (error.stack) {
          console.log(`   堆栈: ${error.stack.split('\n')[0]}`);
        }
        console.log('---');
      });
    } else {
      console.log('\n✅ 没有发现错误记录');
    }
    
    // 显示性能指标
    if (stats.metrics.length > 0) {
      console.log('\n📈 最近的性能指标:');
      const recentMetrics = stats.metrics.slice(-10);
      recentMetrics.forEach(metric => {
        console.log(`- ${metric.name}: ${metric.value.toFixed(2)}ms [${metric.category}]`);
      });
    }
    
    // 显示用户事件
    if (stats.userEvents.length > 0) {
      console.log('\n👤 最近的用户事件:');
      stats.userEvents.slice(-5).forEach(event => {
        console.log(`- ${event.type} (${new Date(event.timestamp).toLocaleString()})`);
      });
    }
    
    // 检查内存使用情况
    if ('memory' in performance) {
      const memory = performance.memory;
      console.log('\n🧠 内存使用情况:');
      console.log('- 已使用:', (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB');
      console.log('- 总大小:', (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB');
      console.log('- 限制:', (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB');
      
      const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      if (memoryUsage > 80) {
        console.warn('⚠️ 内存使用率过高:', memoryUsage.toFixed(2) + '%');
      }
    }
    
    // 检查是否有未捕获的Promise拒绝
    let unhandledRejections = 0;
    window.addEventListener('unhandledrejection', (event) => {
      unhandledRejections++;
      console.error('🔥 未处理的Promise拒绝:', event.reason);
      monitor.reportError({
        message: 'Unhandled Promise Rejection: ' + event.reason,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        category: 'javascript',
        severity: 'high'
      });
    });
    
    // 监控页面崩溃
    window.addEventListener('beforeunload', () => {
      console.log('📤 页面即将卸载，记录最终状态');
      const finalStats = monitor.getPerformanceStats();
      localStorage.setItem('brain-train-crash-data', JSON.stringify({
        timestamp: Date.now(),
        stats: finalStats,
        url: window.location.href,
        userAgent: navigator.userAgent
      }));
    });
    
    // 检查是否有崩溃数据
    const crashData = localStorage.getItem('brain-train-crash-data');
    if (crashData) {
      try {
        const data = JSON.parse(crashData);
        const crashTime = new Date(data.timestamp);
        const timeSinceCrash = Date.now() - data.timestamp;
        
        if (timeSinceCrash < 60000) { // 1分钟内的崩溃
          console.log('\n💥 检测到最近的崩溃数据:');
          console.log('- 崩溃时间:', crashTime.toLocaleString());
          console.log('- 距离现在:', Math.round(timeSinceCrash / 1000) + '秒');
          console.log('- 崩溃时错误数:', data.stats.summary.totalErrors);
          console.log('- 崩溃时内存指标数:', data.stats.metrics.filter(m => m.category === 'memory').length);
          
          if (data.stats.errors && data.stats.errors.length > 0) {
            console.log('- 崩溃时最后的错误:');
            data.stats.errors.slice(-3).forEach((error, index) => {
              console.log(`  ${index + 1}. [${error.severity}] ${error.message}`);
            });
          }
          
          // 清除崩溃数据
          localStorage.removeItem('brain-train-crash-data');
        }
      } catch (error) {
        console.error('解析崩溃数据时出错:', error);
        localStorage.removeItem('brain-train-crash-data');
      }
    }
    
    // 提供手动清理功能
    window.clearPerformanceData = () => {
      localStorage.removeItem('brain-train-crash-data');
      console.log('✅ 性能数据已清理');
    };
    
    console.log('\n🔧 调试工具已加载完成');
    console.log('💡 提示: 使用 clearPerformanceData() 清理存储的性能数据');
    
  } else {
    console.warn('⚠️ 性能监控器未找到，请确保应用已正确初始化');
  }
})();