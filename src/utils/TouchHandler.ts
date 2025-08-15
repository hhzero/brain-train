/**
 * TouchHandler - 移动端触摸交互优化工具类
 * 提供触摸事件处理、防止双击缩放、触摸反馈等功能
 */

export interface TouchOptions {
  preventZoom?: boolean;
  enableHapticFeedback?: boolean;
  touchFeedbackClass?: string;
  longPressDelay?: number;
  swipeThreshold?: number;
}

export interface TouchEventData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  duration: number;
  distance: number;
}

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  velocity: number;
}

export class TouchHandler {
  private static instance: TouchHandler;
  private touchStartTime: number = 0;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private longPressTimer: NodeJS.Timeout | null = null;
  private lastTouchEnd: number = 0;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): TouchHandler {
    if (!TouchHandler.instance) {
      TouchHandler.instance = new TouchHandler();
    }
    return TouchHandler.instance;
  }

  /**
   * 初始化触摸处理器
   */
  public initialize(options: TouchOptions = {}): void {
    if (this.isInitialized) return;

    const {
      preventZoom = true,
      enableHapticFeedback = true,
    } = options;

    // 防止双击缩放
    if (preventZoom) {
      this.preventDoubleClickZoom();
    }

    // 防止长按选择文本
    this.preventTextSelection();

    // 防止拖拽
    this.preventDragAndDrop();

    // 优化触摸延迟
    this.optimizeTouchDelay();

    this.isInitialized = true;
  }

  /**
   * 防止双击缩放
   */
  private preventDoubleClickZoom(): void {
    // 添加CSS样式防止缩放
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      input, textarea {
        -webkit-user-select: text;
        -khtml-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);

    // 添加viewport meta标签
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

    // 监听touchend事件防止双击
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - this.lastTouchEnd <= 300) {
        e.preventDefault();
      }
      this.lastTouchEnd = now;
    }, { passive: false });
  }

  /**
   * 防止文本选择
   */
  private preventTextSelection(): void {
    document.addEventListener('selectstart', (e) => {
      const target = e.target as HTMLElement;
      if (!target.matches('input, textarea')) {
        e.preventDefault();
      }
    });
  }

  /**
   * 防止拖拽
   */
  private preventDragAndDrop(): void {
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });
  }

  /**
   * 优化触摸延迟
   */
  private optimizeTouchDelay(): void {
    // 添加CSS样式移除300ms延迟
    const style = document.createElement('style');
    style.textContent = `
      * {
        touch-action: manipulation;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 添加触摸事件监听器
   */
  public addTouchListener(
    element: HTMLElement,
    callbacks: {
      onTouchStart?: (e: TouchEvent) => void;
      onTouchMove?: (e: TouchEvent) => void;
      onTouchEnd?: (e: TouchEvent, data: TouchEventData) => void;
      onTap?: (e: TouchEvent, data: TouchEventData) => void;
      onLongPress?: (e: TouchEvent) => void;
      onSwipe?: (e: TouchEvent, swipe: SwipeDirection) => void;
    },
    options: TouchOptions = {}
  ): () => void {
    const {
      touchFeedbackClass = 'touch-feedback',
      longPressDelay = 500,
      swipeThreshold = 50,
      enableHapticFeedback = true,
    } = options;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      this.touchStartTime = Date.now();
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;

      // 添加触摸反馈样式
      element.classList.add(touchFeedbackClass);

      // 设置长按定时器
      if (callbacks.onLongPress) {
        this.longPressTimer = setTimeout(() => {
          callbacks.onLongPress!(e);
          this.triggerHapticFeedback('medium', enableHapticFeedback);
        }, longPressDelay);
      }

      callbacks.onTouchStart?.(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - this.touchStartX);
      const deltaY = Math.abs(touch.clientY - this.touchStartY);

      // 如果移动距离超过阈值，取消长按
      if ((deltaX > 10 || deltaY > 10) && this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }

      callbacks.onTouchMove?.(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const endTime = Date.now();
      const duration = endTime - this.touchStartTime;
      const endX = touch.clientX;
      const endY = touch.clientY;
      const deltaX = endX - this.touchStartX;
      const deltaY = endY - this.touchStartY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 移除触摸反馈样式
      element.classList.remove(touchFeedbackClass);

      // 清除长按定时器
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }

      const touchData: TouchEventData = {
        startX: this.touchStartX,
        startY: this.touchStartY,
        endX,
        endY,
        deltaX,
        deltaY,
        duration,
        distance,
      };

      // 判断是否为点击
      if (distance < 10 && duration < 300) {
        callbacks.onTap?.(e, touchData);
        this.triggerHapticFeedback('light', enableHapticFeedback);
      }

      // 判断是否为滑动
      if (distance > swipeThreshold && callbacks.onSwipe) {
        const swipe = this.calculateSwipeDirection(deltaX, deltaY, duration);
        if (swipe.direction) {
          callbacks.onSwipe(e, swipe);
          this.triggerHapticFeedback('medium', enableHapticFeedback);
        }
      }

      callbacks.onTouchEnd?.(e, touchData);
    };

    // 添加事件监听器
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    // 返回清理函数
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    };
  }

  /**
   * 计算滑动方向
   */
  private calculateSwipeDirection(deltaX: number, deltaY: number, duration: number): SwipeDirection {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / duration;

    let direction: 'left' | 'right' | 'up' | 'down' | null = null;

    if (absDeltaX > absDeltaY) {
      // 水平滑动
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      // 垂直滑动
      direction = deltaY > 0 ? 'down' : 'up';
    }

    return { direction, velocity };
  }

  /**
   * 触发触觉反馈
   */
  private triggerHapticFeedback(
    intensity: 'light' | 'medium' | 'heavy',
    enabled: boolean
  ): void {
    if (!enabled || !('vibrate' in navigator)) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };

    navigator.vibrate(patterns[intensity]);
  }

  /**
   * 检测是否为移动设备
   */
  public static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * 检测是否支持触摸
   */
  public static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * 获取设备像素比
   */
  public static getDevicePixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  /**
   * 获取视口尺寸
   */
  public static getViewportSize(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.isInitialized = false;
  }
}

export default TouchHandler;