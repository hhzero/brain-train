/**
 * 移动端优化工具类
 * 提供移动端性能优化和用户体验增强功能
 */
export class MobileOptimizer {
  private static instance: MobileOptimizer | null = null;
  private isInitialized = false;
  private touchStartTime = 0;
  private lastTouchEnd = 0;
  private preventZoomTimer: NodeJS.Timeout | null = null;

  /**
   * 获取单例实例
   */
  public static getInstance(): MobileOptimizer {
    if (!MobileOptimizer.instance) {
      MobileOptimizer.instance = new MobileOptimizer();
    }
    return MobileOptimizer.instance;
  }

  /**
   * 初始化移动端优化
   */
  public initialize(): void {
    if (this.isInitialized) return;

    this.setupViewportMeta();
    this.preventZoom();
    this.optimizeTouchEvents();
    this.setupOrientationChange();
    this.optimizeScrolling();
    this.setupVisibilityChange();
    
    this.isInitialized = true;
    console.log('移动端优化已初始化');
  }

  /**
   * 设置视口元标签
   */
  private setupViewportMeta(): void {
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    // 设置视口配置，防止缩放
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }

  /**
   * 防止双击缩放和捏合缩放
   */
  private preventZoom(): void {
    // 防止双击缩放
    document.addEventListener('touchstart', (e) => {
      this.touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      const touchDuration = now - this.touchStartTime;
      const timeSinceLastTouch = now - this.lastTouchEnd;
      
      // 检测快速双击
      if (touchDuration < 300 && timeSinceLastTouch < 300) {
        e.preventDefault();
      }
      
      this.lastTouchEnd = now;
    }, { passive: false });

    // 防止捏合缩放
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // 防止键盘缩放
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });
  }

  /**
   * 优化触摸事件
   */
  private optimizeTouchEvents(): void {
    // 添加触摸反馈样式
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      
      button, .clickable {
        cursor: pointer;
        -webkit-user-select: none;
        user-select: none;
      }
      
      .touch-feedback {
        position: relative;
        overflow: hidden;
      }
      
      .touch-feedback::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.3s, height 0.3s;
        pointer-events: none;
      }
      
      .touch-feedback.active::after {
        width: 200px;
        height: 200px;
      }
    `;
    document.head.appendChild(style);

    // 为按钮添加触摸反馈
    this.addTouchFeedback();
  }

  /**
   * 添加触摸反馈效果
   */
  private addTouchFeedback(): void {
    document.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.classList.contains('clickable')) {
        target.classList.add('touch-feedback', 'active');
        
        setTimeout(() => {
          target.classList.remove('active');
        }, 300);
      }
    }, { passive: true });
  }

  /**
   * 设置屏幕方向变化处理
   */
  private setupOrientationChange(): void {
    const handleOrientationChange = () => {
      // 延迟处理，等待浏览器完成方向变化
      setTimeout(() => {
        // 重新计算视口高度
        this.updateViewportHeight();
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('orientationchange-optimized', {
          detail: {
            orientation: window.orientation || 0,
            width: window.innerWidth,
            height: window.innerHeight
          }
        }));
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
  }

  /**
   * 更新视口高度（解决移动端地址栏问题）
   */
  private updateViewportHeight(): void {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  /**
   * 优化滚动性能
   */
  private optimizeScrolling(): void {
    // 添加滚动优化样式
    const style = document.createElement('style');
    style.textContent = `
      .scroll-optimized {
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
        transform: translateZ(0);
        backface-visibility: hidden;
      }
      
      .prevent-scroll {
        overflow: hidden;
        position: fixed;
        width: 100%;
      }
    `;
    document.head.appendChild(style);

    // 为滚动容器添加优化类
    const scrollContainers = document.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-x-auto');
    scrollContainers.forEach(container => {
      container.classList.add('scroll-optimized');
    });
  }

  /**
   * 设置页面可见性变化处理
   */
  private setupVisibilityChange(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时暂停动画和定时器
        this.pauseAnimations();
      } else {
        // 页面显示时恢复动画
        this.resumeAnimations();
      }
    });
  }

  /**
   * 暂停动画（节省电池）
   */
  private pauseAnimations(): void {
    const animatedElements = document.querySelectorAll('[style*="animation"]');
    animatedElements.forEach(element => {
      const el = element as HTMLElement;
      el.style.animationPlayState = 'paused';
    });
  }

  /**
   * 恢复动画
   */
  private resumeAnimations(): void {
    const animatedElements = document.querySelectorAll('[style*="animation"]');
    animatedElements.forEach(element => {
      const el = element as HTMLElement;
      el.style.animationPlayState = 'running';
    });
  }

  /**
   * 检测设备类型
   */
  public static getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    return {
      isMobile,
      isTablet,
      isIOS,
      isAndroid,
      isDesktop: !isMobile && !isTablet,
      hasTouch: 'ontouchstart' in window,
      devicePixelRatio: window.devicePixelRatio || 1,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };
  }

  /**
   * 优化图片加载
   */
  public optimizeImages(): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // 添加懒加载
      if ('loading' in HTMLImageElement.prototype) {
        img.loading = 'lazy';
      }
      
      // 添加解码优化
      img.decoding = 'async';
    });
  }

  /**
   * 防止页面滚动（用于模态框等）
   */
  public preventScroll(): void {
    document.body.classList.add('prevent-scroll');
    document.body.style.top = `-${window.scrollY}px`;
  }

  /**
   * 恢复页面滚动
   */
  public allowScroll(): void {
    const scrollY = document.body.style.top;
    document.body.classList.remove('prevent-scroll');
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    if (this.preventZoomTimer) {
      clearTimeout(this.preventZoomTimer);
    }
    this.isInitialized = false;
  }
}

// 导出单例实例
export const mobileOptimizer = MobileOptimizer.getInstance();