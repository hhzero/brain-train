'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * 错误边界组件 - 捕获子组件中的JavaScript错误并显示备用UI
 * 防止整个应用因为单个组件错误而崩溃
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新state以显示错误UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary捕获到错误:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 这里可以添加错误上报逻辑
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    // 重置错误状态，重新渲染子组件
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              哎呀，出现了一些问题
            </h2>
            <p className="text-white/80 mb-6">
              应用遇到了意外错误，但不用担心，我们可以重新开始！
            </p>
            <button
              onClick={this.handleRetry}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔄 重新开始
            </button>
            
            {/* 开发环境下显示错误详情 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-white/60 cursor-pointer hover:text-white transition-colors">
                  查看错误详情
                </summary>
                <div className="mt-2 p-4 bg-black/20 rounded-lg text-xs text-white/80 overflow-auto max-h-40">
                  <div className="font-bold mb-2">错误信息:</div>
                  <div className="mb-4">{this.state.error.message}</div>
                  <div className="font-bold mb-2">错误堆栈:</div>
                  <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;