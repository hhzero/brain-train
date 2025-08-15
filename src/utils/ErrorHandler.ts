/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 错误严重程度
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * 自定义错误接口
 */
export interface CustomError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: any;
  timestamp: number;
  stack?: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
}

/**
 * 错误处理配置
 */
export interface ErrorHandlerConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  maxErrorsInMemory: number;
  retryAttempts: number;
  retryDelay: number;
  remoteEndpoint?: string;
  apiKey?: string;
}

/**
 * 全局错误处理器
 */
class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: CustomError[] = [];
  private config: ErrorHandlerConfig;
  private listeners: Array<(error: CustomError) => void> = [];

  private constructor() {
    this.config = {
      enableConsoleLogging: process.env.NODE_ENV === 'development',
      enableRemoteLogging: process.env.NODE_ENV === 'production',
      maxErrorsInMemory: 100,
      retryAttempts: 3,
      retryDelay: 1000,
    };

    this.setupGlobalErrorHandlers();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 配置错误处理器
   */
  public configure(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalErrorHandlers(): void {
    // 处理未捕获的JavaScript错误
    window.addEventListener('error', (event) => {
      this.handleError({
        type: ErrorType.CLIENT,
        severity: ErrorSeverity.HIGH,
        message: event.message,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        stack: event.error?.stack,
      });
    });

    // 处理未捕获的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: ErrorType.CLIENT,
        severity: ErrorSeverity.HIGH,
        message: event.reason?.message || 'Unhandled Promise Rejection',
        details: event.reason,
        stack: event.reason?.stack,
      });
    });

    // 处理资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError({
          type: ErrorType.NETWORK,
          severity: ErrorSeverity.MEDIUM,
          message: 'Resource loading failed',
          details: {
            tagName: (event.target as any)?.tagName,
            src: (event.target as any)?.src || (event.target as any)?.href,
          },
        });
      }
    }, true);
  }

  /**
   * 处理错误
   */
  public handleError(errorData: Partial<CustomError>): CustomError {
    const error: CustomError = {
      id: this.generateErrorId(),
      type: errorData.type || ErrorType.UNKNOWN,
      severity: errorData.severity || ErrorSeverity.MEDIUM,
      message: errorData.message || 'Unknown error occurred',
      details: errorData.details,
      timestamp: Date.now(),
      stack: errorData.stack,
      context: errorData.context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // 添加到内存中
    this.addErrorToMemory(error);

    // 控制台日志
    if (this.config.enableConsoleLogging) {
      this.logToConsole(error);
    }

    // 远程日志
    if (this.config.enableRemoteLogging) {
      this.logToRemote(error);
    }

    // 通知监听器
    this.notifyListeners(error);

    return error;
  }

  /**
   * 处理网络错误
   */
  public handleNetworkError(error: any, context?: Record<string, any>): CustomError {
    return this.handleError({
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      message: error.message || 'Network request failed',
      details: {
        status: error.status,
        statusText: error.statusText,
        url: error.config?.url,
        method: error.config?.method,
      },
      context,
      stack: error.stack,
    });
  }

  /**
   * 处理验证错误
   */
  public handleValidationError(message: string, details?: any): CustomError {
    return this.handleError({
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      message,
      details,
    });
  }

  /**
   * 处理认证错误
   */
  public handleAuthError(message: string, details?: any): CustomError {
    return this.handleError({
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      message,
      details,
    });
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 添加错误到内存
   */
  private addErrorToMemory(error: CustomError): void {
    this.errors.unshift(error);
    
    // 限制内存中的错误数量
    if (this.errors.length > this.config.maxErrorsInMemory) {
      this.errors = this.errors.slice(0, this.config.maxErrorsInMemory);
    }
  }

  /**
   * 控制台日志
   */
  private logToConsole(error: CustomError): void {
    const logMethod = this.getConsoleMethod(error.severity);
    logMethod(`[${error.type}] ${error.message}`, {
      id: error.id,
      details: error.details,
      context: error.context,
      stack: error.stack,
    });
  }

  /**
   * 获取控制台方法
   */
  private getConsoleMethod(severity: ErrorSeverity) {
    switch (severity) {
      case ErrorSeverity.LOW:
        return console.info;
      case ErrorSeverity.MEDIUM:
        return console.warn;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * 远程日志
   */
  private async logToRemote(error: CustomError): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return;
    }

    let attempts = 0;
    const maxAttempts = this.config.retryAttempts;

    while (attempts < maxAttempts) {
      try {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
          },
          body: JSON.stringify(error),
        });
        break;
      } catch (err) {
        attempts++;
        if (attempts < maxAttempts) {
          await this.delay(this.config.retryDelay * attempts);
        } else {
          console.error('Failed to send error to remote endpoint:', err);
        }
      }
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 通知监听器
   */
  private notifyListeners(error: CustomError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  /**
   * 添加错误监听器
   */
  public addListener(listener: (error: CustomError) => void): () => void {
    this.listeners.push(listener);
    
    // 返回移除监听器的函数
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 获取所有错误
   */
  public getErrors(): CustomError[] {
    return [...this.errors];
  }

  /**
   * 根据类型获取错误
   */
  public getErrorsByType(type: ErrorType): CustomError[] {
    return this.errors.filter(error => error.type === type);
  }

  /**
   * 根据严重程度获取错误
   */
  public getErrorsBySeverity(severity: ErrorSeverity): CustomError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * 清除所有错误
   */
  public clearErrors(): void {
    this.errors = [];
  }

  /**
   * 清除指定类型的错误
   */
  public clearErrorsByType(type: ErrorType): void {
    this.errors = this.errors.filter(error => error.type !== type);
  }

  /**
   * 获取错误统计
   */
  public getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.errors.forEach(error => {
      const key = `${error.type}_${error.severity}`;
      stats[key] = (stats[key] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * 导出错误数据
   */
  public exportErrors(): string {
    return JSON.stringify({
      errors: this.errors,
      stats: this.getErrorStats(),
      exportTime: new Date().toISOString(),
    }, null, 2);
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance();
export default ErrorHandler;