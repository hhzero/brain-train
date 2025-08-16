'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import StarfieldBackground from '@/components/StarfieldBackground'

interface Props {
  children: ReactNode
  onReset?: () => void
  onReturnHome?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

/**
 * 训练专用错误边界组件
 * 提供优雅的错误处理和恢复机制
 */
class TrainingErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3
  
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }
  
  static getDerivedStateFromError(error: Error): Partial<State> {
    // 生成错误ID用于追踪
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // 记录错误信息
    this.logError(error, errorInfo)
    
    // 发送错误报告（如果有性能监控系统）
    this.reportError(error, errorInfo)
  }
  
  /**
   * 记录错误信息到控制台
   */
  private logError(error: Error, errorInfo: ErrorInfo) {
    console.group('🚨 训练错误边界捕获到错误')
    console.error('错误ID:', this.state.errorId)
    console.error('错误信息:', error.message)
    console.error('错误堆栈:', error.stack)
    console.error('组件堆栈:', errorInfo.componentStack)
    console.error('重试次数:', this.retryCount)
    console.groupEnd()
  }
  
  /**
   * 发送错误报告
   */
  private reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      // 检查是否有全局性能监控器
      if (typeof window !== 'undefined' && (window as any).performanceMonitor) {
        (window as any).performanceMonitor.reportError({
          id: this.state.errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          retryCount: this.retryCount
        })
      }
    } catch (reportError) {
      console.warn('发送错误报告失败:', reportError)
    }
  }
  
  /**
   * 重试恢复
   */
  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      })
      
      // 调用父组件的重置回调
      if (this.props.onReset) {
        this.props.onReset()
      }
    }
  }
  
  /**
   * 返回主页
   */
  private handleReturnHome = () => {
    this.retryCount = 0
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
    
    if (this.props.onReturnHome) {
      this.props.onReturnHome()
    }
  }
  
  /**
   * 获取错误类型描述
   */
  private getErrorTypeDescription(error: Error): string {
    const message = error.message.toLowerCase()
    
    if (message.includes('audio') || message.includes('sound')) {
      return '音频系统错误'
    }
    if (message.includes('render') || message.includes('component')) {
      return '组件渲染错误'
    }
    if (message.includes('network') || message.includes('fetch')) {
      return '网络连接错误'
    }
    if (message.includes('memory') || message.includes('performance')) {
      return '性能相关错误'
    }
    
    return '未知错误'
  }
  
  /**
   * 获取错误解决建议
   */
  private getErrorSuggestion(error: Error): string {
    const message = error.message.toLowerCase()
    
    if (message.includes('audio')) {
      return '请检查浏览器音频权限设置，或尝试刷新页面'
    }
    if (message.includes('network')) {
      return '请检查网络连接，确保网络稳定'
    }
    if (message.includes('memory')) {
      return '请关闭其他标签页释放内存，或重启浏览器'
    }
    
    return '请尝试刷新页面或重新开始训练'
  }
  
  render() {
    if (this.state.hasError) {
      const { error } = this.state
      const canRetry = this.retryCount < this.maxRetries
      const errorType = error ? this.getErrorTypeDescription(error) : '未知错误'
      const suggestion = error ? this.getErrorSuggestion(error) : ''
      
      return (
        <div className="min-h-screen relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader className="text-center">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="mx-auto mb-4"
                  >
                    <AlertTriangle className="h-16 w-16 text-yellow-400" />
                  </motion.div>
                  
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    训练遇到问题
                  </CardTitle>
                  
                  <CardDescription className="text-white/80 mt-2">
                    {errorType}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* 错误信息 */}
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm text-red-200 font-medium mb-1">
                      错误详情:
                    </p>
                    <p className="text-xs text-red-300 break-words">
                      {error?.message || '未知错误'}
                    </p>
                  </div>
                  
                  {/* 解决建议 */}
                  {suggestion && (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-sm text-blue-200 font-medium mb-1">
                        建议解决方案:
                      </p>
                      <p className="text-xs text-blue-300">
                        {suggestion}
                      </p>
                    </div>
                  )}
                  
                  {/* 重试信息 */}
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                    <p className="text-sm text-purple-200">
                      重试次数: {this.retryCount} / {this.maxRetries}
                    </p>
                    <p className="text-xs text-purple-300 mt-1">
                      错误ID: {this.state.errorId}
                    </p>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex flex-col gap-3 pt-4">
                    {canRetry && (
                      <Button
                        onClick={this.handleRetry}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        重试训练 ({this.maxRetries - this.retryCount} 次机会)
                      </Button>
                    )}
                    
                    <Button
                      onClick={this.handleReturnHome}
                      variant="outline"
                      className="w-full border-white/30 text-white hover:bg-white/10"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      返回主页
                    </Button>
                  </div>
                  
                  {/* 额外提示 */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-white/60">
                      如果问题持续出现，请尝试刷新页面或联系技术支持
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )
    }
    
    return this.props.children
  }
}

export default TrainingErrorBoundary