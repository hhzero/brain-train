'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameAreaDimensions } from '../app/[locale]/components/ResponsiveGameArea';
import TouchHandler from '../utils/TouchHandler';

export interface ResponsiveGameAreaOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  maintainAspectRatio?: boolean;
  autoResize?: boolean;
  debounceDelay?: number;
}

export interface ResponsiveGameAreaState {
  dimensions: GameAreaDimensions;
  isMobile: boolean;
  isTouch: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  devicePixelRatio: number;
  viewportSize: { width: number; height: number };
  isFullscreen: boolean;
}

/**
 * useResponsiveGameArea Hook
 * 提供响应式游戏区域的状态管理和工具函数
 */
export const useResponsiveGameArea = (options: ResponsiveGameAreaOptions = {}) => {
  const {
    minWidth = 320,
    minHeight = 240,
    maxWidth = 1200,
    maxHeight = 800,
    aspectRatio = 16 / 9,
    maintainAspectRatio = true,
    autoResize = true,
    debounceDelay = 100,
  } = options;

  const [state, setState] = useState<ResponsiveGameAreaState>({
    dimensions: {
      width: minWidth,
      height: minHeight,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    },
    isMobile: false,
    isTouch: false,
    isLandscape: false,
    isPortrait: true,
    devicePixelRatio: 1,
    viewportSize: { width: 0, height: 0 },
    isFullscreen: false,
  });

  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // 计算游戏区域尺寸
  const calculateDimensions = useCallback(
    (containerWidth: number, containerHeight: number): GameAreaDimensions => {
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
      const offsetX = (containerWidth - gameWidth) / 2;
      const offsetY = (containerHeight - gameHeight) / 2;

      return {
        width: gameWidth,
        height: gameHeight,
        scale,
        offsetX: Math.max(0, offsetX),
        offsetY: Math.max(0, offsetY),
      };
    },
    [minWidth, minHeight, maxWidth, maxHeight, aspectRatio, maintainAspectRatio]
  );

  // 更新状态
  const updateState = useCallback(() => {
    const viewportSize = TouchHandler.getViewportSize();
    const isMobile = TouchHandler.isMobileDevice();
    const isTouch = TouchHandler.isTouchDevice();
    const devicePixelRatio = TouchHandler.getDevicePixelRatio();
    const isLandscape = viewportSize.width > viewportSize.height;
    const isPortrait = !isLandscape;
    const isFullscreen = !!document.fullscreenElement;

    // 计算容器尺寸
    let containerWidth = viewportSize.width;
    let containerHeight = viewportSize.height;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerWidth = rect.width;
      containerHeight = rect.height;
    }

    const dimensions = calculateDimensions(containerWidth, containerHeight);

    setState({
      dimensions,
      isMobile,
      isTouch,
      isLandscape,
      isPortrait,
      devicePixelRatio,
      viewportSize,
      isFullscreen,
    });
  }, [calculateDimensions]);

  // 防抖的更新函数
  const debouncedUpdate = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      updateState();
    }, debounceDelay);
  }, [updateState, debounceDelay]);

  // 设置容器引用
  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
    if (element) {
      updateState();
    }
  }, [updateState]);

  // 手动更新尺寸
  const updateDimensions = useCallback(() => {
    updateState();
  }, [updateState]);

  // 获取相对坐标
  const getRelativeCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const { dimensions } = state;
      const relativeX = (clientX - dimensions.offsetX) / dimensions.scale;
      const relativeY = (clientY - dimensions.offsetY) / dimensions.scale;
      
      return {
        x: Math.max(0, Math.min(dimensions.width / dimensions.scale, relativeX)),
        y: Math.max(0, Math.min(dimensions.height / dimensions.scale, relativeY)),
      };
    },
    [state]
  );

  // 获取绝对坐标
  const getAbsoluteCoordinates = useCallback(
    (relativeX: number, relativeY: number) => {
      const { dimensions } = state;
      const absoluteX = relativeX * dimensions.scale + dimensions.offsetX;
      const absoluteY = relativeY * dimensions.scale + dimensions.offsetY;
      
      return { x: absoluteX, y: absoluteY };
    },
    [state]
  );

  // 检查点是否在游戏区域内
  const isPointInGameArea = useCallback(
    (clientX: number, clientY: number) => {
      const { dimensions } = state;
      return (
        clientX >= dimensions.offsetX &&
        clientX <= dimensions.offsetX + dimensions.width &&
        clientY >= dimensions.offsetY &&
        clientY <= dimensions.offsetY + dimensions.height
      );
    },
    [state]
  );

  // 获取最佳字体大小
  const getOptimalFontSize = useCallback(
    (baseFontSize: number = 16) => {
      const { dimensions } = state;
      return Math.max(12, baseFontSize * dimensions.scale);
    },
    [state]
  );

  // 获取最佳间距
  const getOptimalSpacing = useCallback(
    (baseSpacing: number = 16) => {
      const { dimensions } = state;
      return Math.max(4, baseSpacing * dimensions.scale);
    },
    [state]
  );

  // 初始化和事件监听
  useEffect(() => {
    updateState();

    if (autoResize) {
      window.addEventListener('resize', debouncedUpdate);
      window.addEventListener('orientationchange', debouncedUpdate);
      document.addEventListener('fullscreenchange', debouncedUpdate);
    }

    return () => {
      if (autoResize) {
        window.removeEventListener('resize', debouncedUpdate);
        window.removeEventListener('orientationchange', debouncedUpdate);
        document.removeEventListener('fullscreenchange', debouncedUpdate);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [autoResize, debouncedUpdate, updateState]);

  return {
    ...state,
    setContainerRef,
    updateDimensions,
    getRelativeCoordinates,
    getAbsoluteCoordinates,
    isPointInGameArea,
    getOptimalFontSize,
    getOptimalSpacing,
  };
};

export default useResponsiveGameArea;