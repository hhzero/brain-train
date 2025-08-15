'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTouchHandler } from '../../../hooks/useTouchHandler';

export interface GameAreaDimensions {
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface ResponsiveGameAreaProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  maintainAspectRatio?: boolean;
  centerContent?: boolean;
  enableTouch?: boolean;
  onDimensionsChange?: (dimensions: GameAreaDimensions) => void;
  onResize?: (dimensions: GameAreaDimensions) => void;
}

const ResponsiveGameArea: React.FC<ResponsiveGameAreaProps> = ({
  children,
  className = '',
  minWidth = 320,
  minHeight = 240,
  maxWidth = 1200,
  maxHeight = 800,
  aspectRatio = 16 / 9,
  maintainAspectRatio = true,
  centerContent = true,
  enableTouch = true,
  onDimensionsChange,
  onResize,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<GameAreaDimensions>({
    width: minWidth,
    height: minHeight,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isMobile, isTouch, viewportSize } = useTouchHandler();

  // 计算游戏区域尺寸
  const calculateDimensions = useCallback((): GameAreaDimensions => {
    if (!containerRef.current) {
      return {
        width: minWidth,
        height: minHeight,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      };
    }

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    let gameWidth = containerWidth;
    let gameHeight = containerHeight;

    // 维持宽高比
    if (maintainAspectRatio) {
      const containerAspectRatio = containerWidth / containerHeight;
      
      if (containerAspectRatio > aspectRatio) {
        // 容器更宽，以高度为准
        gameWidth = containerHeight * aspectRatio;
        gameHeight = containerHeight;
      } else {
        // 容器更高，以宽度为准
        gameWidth = containerWidth;
        gameHeight = containerWidth / aspectRatio;
      }
    }

    // 应用最小和最大尺寸限制
    gameWidth = Math.max(minWidth, Math.min(maxWidth, gameWidth));
    gameHeight = Math.max(minHeight, Math.min(maxHeight, gameHeight));

    // 重新检查宽高比
    if (maintainAspectRatio) {
      const currentAspectRatio = gameWidth / gameHeight;
      if (Math.abs(currentAspectRatio - aspectRatio) > 0.01) {
        if (currentAspectRatio > aspectRatio) {
          gameWidth = gameHeight * aspectRatio;
        } else {
          gameHeight = gameWidth / aspectRatio;
        }
      }
    }

    // 计算缩放比例
    const scaleX = gameWidth / minWidth;
    const scaleY = gameHeight / minHeight;
    const scale = Math.min(scaleX, scaleY);

    // 计算偏移量（居中）
    const offsetX = centerContent ? (containerWidth - gameWidth) / 2 : 0;
    const offsetY = centerContent ? (containerHeight - gameHeight) / 2 : 0;

    return {
      width: gameWidth,
      height: gameHeight,
      scale,
      offsetX,
      offsetY,
    };
  }, [minWidth, minHeight, maxWidth, maxHeight, aspectRatio, maintainAspectRatio, centerContent]);

  // 处理窗口大小变化
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      const newDimensions = calculateDimensions();
      setDimensions(newDimensions);
      onResize?.(newDimensions);
    }, 100);
  }, [calculateDimensions, onResize]);

  // 初始化和监听窗口大小变化
  useEffect(() => {
    const newDimensions = calculateDimensions();
    setDimensions(newDimensions);
    onDimensionsChange?.(newDimensions);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [calculateDimensions, handleResize, onDimensionsChange]);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // 全屏状态变化时重新计算尺寸
      setTimeout(() => {
        handleResize();
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleResize]);

  // 进入全屏
  const enterFullscreen = useCallback(async () => {
    if (!containerRef.current || !document.documentElement.requestFullscreen) {
      return;
    }

    try {
      await containerRef.current.requestFullscreen();
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, []);

  // 退出全屏
  const exitFullscreen = useCallback(async () => {
    if (!document.fullscreenElement || !document.exitFullscreen) {
      return;
    }

    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, []);

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // 获取响应式类名
  const getResponsiveClasses = () => {
    const baseClasses = 'relative overflow-hidden';
    const responsiveClasses = [];

    if (isMobile) {
      responsiveClasses.push('mobile-optimized');
    }

    if (isTouch) {
      responsiveClasses.push('touch-optimized');
    }

    if (isFullscreen) {
      responsiveClasses.push('fullscreen-mode');
    }

    return `${baseClasses} ${responsiveClasses.join(' ')} ${className}`;
  };

  return (
    <div
      ref={containerRef}
      className={getResponsiveClasses()}
      style={{
        width: '100%',
        height: '100%',
        minHeight: `${minHeight}px`,
      }}
    >
      {/* 全屏控制按钮 */}
      {!isMobile && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all"
          title={isFullscreen ? '退出全屏' : '进入全屏'}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>
      )}

      {/* 游戏区域 */}
      <div
        ref={gameAreaRef}
        className="absolute bg-white dark:bg-gray-900 rounded-lg shadow-lg"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          left: `${dimensions.offsetX}px`,
          top: `${dimensions.offsetY}px`,
          transform: `scale(${dimensions.scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>

      {/* 调试信息（仅开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 p-2 bg-black bg-opacity-75 text-white text-xs rounded">
          <div>尺寸: {Math.round(dimensions.width)} × {Math.round(dimensions.height)}</div>
          <div>缩放: {dimensions.scale.toFixed(2)}</div>
          <div>偏移: ({Math.round(dimensions.offsetX)}, {Math.round(dimensions.offsetY)})</div>
          <div>视口: {viewportSize.width} × {viewportSize.height}</div>
          <div>设备: {isMobile ? '移动端' : '桌面端'} | {isTouch ? '触摸' : '鼠标'}</div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveGameArea;