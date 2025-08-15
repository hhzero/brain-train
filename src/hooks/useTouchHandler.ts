'use client';

import { useEffect, useRef, useCallback } from 'react';
import TouchHandler, { TouchOptions, TouchEventData, SwipeDirection } from '@/utils/TouchHandler';

export interface UseTouchHandlerOptions extends TouchOptions {
  onTouchStart?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchEnd?: (e: TouchEvent, data: TouchEventData) => void;
  onTap?: (e: TouchEvent, data: TouchEventData) => void;
  onLongPress?: (e: TouchEvent) => void;
  onSwipe?: (e: TouchEvent, swipe: SwipeDirection) => void;
}

/**
 * useTouchHandler Hook
 * 提供触摸事件处理的React Hook
 */
export const useTouchHandler = (options: UseTouchHandlerOptions = {}) => {
  const touchHandlerRef = useRef<TouchHandler | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // 初始化TouchHandler
  useEffect(() => {
    touchHandlerRef.current = TouchHandler.getInstance();
    touchHandlerRef.current.initialize(options);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [options]);

  // 绑定触摸事件到元素
  const bindToElement = useCallback(
    (element: HTMLElement | null) => {
      if (!element || !touchHandlerRef.current) return;

      // 清理之前的绑定
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // 绑定新的事件
      cleanupRef.current = touchHandlerRef.current.addTouchListener(
        element,
        {
          onTouchStart: options.onTouchStart,
          onTouchMove: options.onTouchMove,
          onTouchEnd: options.onTouchEnd,
          onTap: options.onTap,
          onLongPress: options.onLongPress,
          onSwipe: options.onSwipe,
        },
        options
      );
    },
    [options]
  );

  // 检测设备类型
  const isMobile = TouchHandler.isMobileDevice();
  const isTouch = TouchHandler.isTouchDevice();
  const devicePixelRatio = TouchHandler.getDevicePixelRatio();
  const viewportSize = TouchHandler.getViewportSize();

  return {
    bindToElement,
    isMobile,
    isTouch,
    devicePixelRatio,
    viewportSize,
  };
};

/**
 * useElementTouchHandler Hook
 * 自动绑定触摸事件到ref元素
 */
export const useElementTouchHandler = <T extends HTMLElement>(
  options: UseTouchHandlerOptions = {}
) => {
  const elementRef = useRef<T>(null);
  const { bindToElement, ...touchInfo } = useTouchHandler(options);

  useEffect(() => {
    if (elementRef.current) {
      bindToElement(elementRef.current);
    }
  }, [bindToElement, options]);

  return {
    ref: elementRef,
    ...touchInfo,
  };
};

/**
 * useSwipeGesture Hook
 * 专门处理滑动手势
 */
export const useSwipeGesture = (
  onSwipe: (direction: SwipeDirection['direction'], velocity: number) => void,
  options: Omit<TouchOptions, 'onSwipe'> = {}
) => {
  return useElementTouchHandler({
    ...options,
    onSwipe: (e, swipe) => {
      onSwipe(swipe.direction, swipe.velocity);
    },
  });
};

/**
 * useTapGesture Hook
 * 专门处理点击手势
 */
export const useTapGesture = (
  onTap: (e: TouchEvent, data: TouchEventData) => void,
  options: Omit<TouchOptions, 'onTap'> = {}
) => {
  return useElementTouchHandler({
    ...options,
    onTap,
  });
};

/**
 * useLongPressGesture Hook
 * 专门处理长按手势
 */
export const useLongPressGesture = (
  onLongPress: (e: TouchEvent) => void,
  options: Omit<TouchOptions, 'onLongPress'> = {}
) => {
  return useElementTouchHandler({
    ...options,
    onLongPress,
  });
};

export default useTouchHandler;