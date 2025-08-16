/**
 * 性能监控工具类
 * 用于监控应用性能指标、错误报告和用户行为分析
 */

interface PerformanceMetric {
  name: string
  value: number | string | object
  timestamp: number
  context?: string
}

interface ErrorReport {
  message: string
  stack?: string
  timestamp: number
  context?: string
  userAgent?: string
  url?: string
}

interface SessionData {
  sessionId: string
  startTime: number
  endTime?: number
  metrics: PerformanceMetric[]
  errors: ErrorReport[]
  userActions: any[]
}

class PerformanceMonitor {
  private currentSession: SessionData | null = null
  private metricsBuffer: PerformanceMetric[] = []
  private errorsBuffer: ErrorReport[] = []
  private maxBufferSize = 100
  private flushInterval = 30000 // 30秒
  private flushTimer: NodeJS.Timeout | null = null

  /**
   * 开始新的性能监控会话
   */
  startSession(sessionType: string): void {
    const sessionId = `${sessionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      metrics: [],
      errors: [],
      userActions: []
    }

    // 记录会话开始指标
    this.recordMetric('session_start', {
      sessionId,
      sessionType,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: Date.now()
    })

    // 开始定期刷新缓冲区
    this.startFlushTimer()

    console.log(`性能监控会话已开始: ${sessionId}`)
  }

  /**
   * 结束当前监控会话
   */
  endSession(): void {
    if (!this.currentSession) return

    this.currentSession.endTime = Date.now()
    const duration = this.currentSession.endTime - this.currentSession.startTime

    // 记录会话结束指标
    this.recordMetric('session_end', {
      sessionId: this.currentSession.sessionId,
      duration,
      totalMetrics: this.currentSession.metrics.length,
      totalErrors: this.currentSession.errors.length,
      timestamp: Date.now()
    })

    // 最终刷新
    this.flushBuffers()
    this.stopFlushTimer()

    console.log(`性能监控会话已结束: ${this.currentSession.sessionId}, 持续时间: ${duration}ms`)
    this.currentSession = null
  }

  /**
   * 记录性能指标
   */
  recordMetric(name: string, data: any, context?: string): void {
    const metric: PerformanceMetric = {
      name,
      value: data,
      timestamp: Date.now(),
      context
    }

    this.metricsBuffer.push(metric)
    
    if (this.currentSession) {
      this.currentSession.metrics.push(metric)
    }

    // 如果缓冲区满了，立即刷新
    if (this.metricsBuffer.length >= this.maxBufferSize) {
      this.flushBuffers()
    }
  }

  /**
   * 报告错误
   */
  reportError(error: Partial<ErrorReport>): void {
    const errorReport: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: error.timestamp || Date.now(),
      context: error.context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }

    this.errorsBuffer.push(errorReport)
    
    if (this.currentSession) {
      this.currentSession.errors.push(errorReport)
    }

    console.error('性能监控捕获错误:', errorReport)

    // 错误立即刷新
    this.flushBuffers()
  }

  /**
   * 记录用户操作
   */
  recordUserAction(action: string, data?: any): void {
    const userAction = {
      action,
      data,
      timestamp: Date.now()
    }

    if (this.currentSession) {
      this.currentSession.userActions.push(userAction)
    }

    // 记录为指标
    this.recordMetric('user_action', userAction, 'user_interaction')
  }

  /**
   * 测量函数执行时间
   */
  measureFunction<T>(name: string, fn: () => T, context?: string): T {
    const startTime = performance.now()
    
    try {
      const result = fn()
      const endTime = performance.now()
      const duration = endTime - startTime

      this.recordMetric('function_performance', {
        functionName: name,
        duration,
        success: true
      }, context)

      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      this.recordMetric('function_performance', {
        functionName: name,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, context)

      this.reportError({
        message: `Function ${name} failed`,
        stack: error instanceof Error ? error.stack : undefined,
        context: context || 'function_measurement'
      })

      throw error
    }
  }

  /**
   * 测量异步函数执行时间
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>, context?: string): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await fn()
      const endTime = performance.now()
      const duration = endTime - startTime

      this.recordMetric('async_function_performance', {
        functionName: name,
        duration,
        success: true
      }, context)

      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      this.recordMetric('async_function_performance', {
        functionName: name,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, context)

      this.reportError({
        message: `Async function ${name} failed`,
        stack: error instanceof Error ? error.stack : undefined,
        context: context || 'async_function_measurement'
      })

      throw error
    }
  }

  /**
   * 获取当前会话数据
   */
  getCurrentSession(): SessionData | null {
    return this.currentSession
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): any {
    if (!this.currentSession) return null

    const metrics = this.currentSession.metrics
    const errors = this.currentSession.errors
    const duration = Date.now() - this.currentSession.startTime

    return {
      sessionId: this.currentSession.sessionId,
      duration,
      totalMetrics: metrics.length,
      totalErrors: errors.length,
      errorRate: errors.length / Math.max(metrics.length, 1),
      avgMetricInterval: duration / Math.max(metrics.length, 1)
    }
  }

  /**
   * 开始定期刷新计时器
   */
  private startFlushTimer(): void {
    this.stopFlushTimer()
    this.flushTimer = setInterval(() => {
      this.flushBuffers()
    }, this.flushInterval)
  }

  /**
   * 停止刷新计时器
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
  }

  /**
   * 刷新缓冲区（在实际应用中，这里会发送数据到服务器）
   */
  private flushBuffers(): void {
    if (this.metricsBuffer.length > 0 || this.errorsBuffer.length > 0) {
      // 在实际应用中，这里会发送数据到分析服务器
      // 现在只是在控制台输出
      if (this.metricsBuffer.length > 0) {
        console.log('性能指标缓冲区刷新:', this.metricsBuffer.length, '条指标')
      }
      
      if (this.errorsBuffer.length > 0) {
        console.log('错误报告缓冲区刷新:', this.errorsBuffer.length, '条错误')
      }

      // 清空缓冲区
      this.metricsBuffer = []
      this.errorsBuffer = []
    }
  }
}

// 导出单例实例
export const performanceMonitor = new PerformanceMonitor()
export default performanceMonitor