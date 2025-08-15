'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { errorHandler, CustomError, ErrorType, ErrorSeverity } from '../utils/ErrorHandler';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: CustomError) => void;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: (error: CustomError) => void;
}

export interface ErrorState {
  error: CustomError | null;
  isRetrying: boolean;
  retryCount: number;
  hasError: boolean;
}

/**
 * useErrorHandler Hook
 * 提供错误处理、重试机制和错误状态管理
 */
export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    showToast = true,
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    hasError: false,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryFunctionRef = useRef<(() => Promise<void>) | null>(null);

  // 处理错误
  const handleError = useCallback(
    (errorData: Partial<CustomError> | Error | string) => {
      let customError: CustomError;

      if (typeof errorData === 'string') {
        customError = errorHandler.handleError({
          type: ErrorType.CLIENT,
          severity: ErrorSeverity.MEDIUM,
          message: errorData,
        });
      } else if (errorData instanceof Error) {
        customError = errorHandler.handleError({
          type: ErrorType.CLIENT,
          severity: ErrorSeverity.MEDIUM,
          message: errorData.message,
          stack: errorData.stack,
        });
      } else {
        customError = errorHandler.handleError(errorData);
      }

      setErrorState(prev => ({
        ...prev,
        error: customError,
        hasError: true,
        retryCount: 0,
      }));

      // 调用外部错误处理函数
      if (onError) {
        onError(customError);
      }

      return customError;
    },
    [onError]
  );

  // 处理网络错误
  const handleNetworkError = useCallback(
    (error: any, context?: Record<string, any>) => {
      const customError = errorHandler.handleNetworkError(error, context);
      
      setErrorState(prev => ({
        ...prev,
        error: customError,
        hasError: true,
        retryCount: 0,
      }));

      if (onError) {
        onError(customError);
      }

      return customError;
    },
    [onError]
  );

  // 处理验证错误
  const handleValidationError = useCallback(
    (message: string, details?: any) => {
      const customError = errorHandler.handleValidationError(message, details);
      
      setErrorState(prev => ({
        ...prev,
        error: customError,
        hasError: true,
        retryCount: 0,
      }));

      if (onError) {
        onError(customError);
      }

      return customError;
    },
    [onError]
  );

  // 处理认证错误
  const handleAuthError = useCallback(
    (message: string, details?: any) => {
      const customError = errorHandler.handleAuthError(message, details);
      
      setErrorState(prev => ({
        ...prev,
        error: customError,
        hasError: true,
        retryCount: 0,
      }));

      if (onError) {
        onError(customError);
      }

      return customError;
    },
    [onError]
  );

  // 清除错误
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      hasError: false,
    });

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // 重试函数
  const retry = useCallback(
    async (retryFunction?: () => Promise<void>) => {
      const { retryCount } = errorState;
      
      if (retryCount >= maxRetries) {
        if (onMaxRetriesReached && errorState.error) {
          onMaxRetriesReached(errorState.error);
        }
        return false;
      }

      setErrorState(prev => ({
        ...prev,
        isRetrying: true,
        retryCount: prev.retryCount + 1,
      }));

      if (onRetry) {
        onRetry(retryCount + 1);
      }

      try {
        // 延迟重试
        await new Promise(resolve => {
          retryTimeoutRef.current = setTimeout(resolve, retryDelay * (retryCount + 1));
        });

        // 执行重试函数
        if (retryFunction) {
          await retryFunction();
        } else if (retryFunctionRef.current) {
          await retryFunctionRef.current();
        }

        // 重试成功，清除错误
        clearError();
        return true;
      } catch (error) {
        // 重试失败，更新错误状态
        setErrorState(prev => ({
          ...prev,
          isRetrying: false,
        }));
        
        // 如果还有重试次数，继续重试
        if (retryCount + 1 < maxRetries && autoRetry) {
          return retry(retryFunction);
        }
        
        return false;
      }
    },
    [errorState, maxRetries, retryDelay, autoRetry, onRetry, onMaxRetriesReached, clearError]
  );

  // 设置重试函数
  const setRetryFunction = useCallback((fn: () => Promise<void>) => {
    retryFunctionRef.current = fn;
  }, []);

  // 包装异步函数，自动处理错误和重试
  const wrapAsyncFunction = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      options?: {
        retryOnError?: boolean;
        errorType?: ErrorType;
        errorSeverity?: ErrorSeverity;
      }
    ) => {
      return async (...args: T): Promise<R | null> => {
        try {
          const result = await fn(...args);
          // 成功时清除之前的错误
          if (errorState.hasError) {
            clearError();
          }
          return result;
        } catch (error) {
          const customError = handleError({
            type: options?.errorType || ErrorType.CLIENT,
            severity: options?.errorSeverity || ErrorSeverity.MEDIUM,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });

          // 如果启用了重试
          if (options?.retryOnError && autoRetry) {
            setRetryFunction(async () => {
              await fn(...args);
            });
            await retry();
          }

          return null;
        }
      };
    },
    [errorState.hasError, handleError, autoRetry, retry, setRetryFunction, clearError]
  );

  // 获取错误信息
  const getErrorMessage = useCallback(() => {
    return errorState.error?.message || null;
  }, [errorState.error]);

  // 获取错误详情
  const getErrorDetails = useCallback(() => {
    return errorState.error?.details || null;
  }, [errorState.error]);

  // 检查是否为特定类型的错误
  const isErrorType = useCallback(
    (type: ErrorType) => {
      return errorState.error?.type === type;
    },
    [errorState.error]
  );

  // 检查是否为特定严重程度的错误
  const isErrorSeverity = useCallback(
    (severity: ErrorSeverity) => {
      return errorState.error?.severity === severity;
    },
    [errorState.error]
  );

  // 清理函数
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    // 错误状态
    ...errorState,
    
    // 错误处理函数
    handleError,
    handleNetworkError,
    handleValidationError,
    handleAuthError,
    
    // 错误管理
    clearError,
    retry,
    setRetryFunction,
    
    // 工具函数
    wrapAsyncFunction,
    getErrorMessage,
    getErrorDetails,
    isErrorType,
    isErrorSeverity,
    
    // 状态检查
    canRetry: errorState.retryCount < maxRetries,
    shouldShowRetry: errorState.hasError && !errorState.isRetrying && errorState.retryCount < maxRetries,
  };
};

export default useErrorHandler;