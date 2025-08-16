/**
 * 资源管理器 - 优化音频和图片的预加载策略
 * 防止内存泄漏，提高应用性能
 */

import ImagePreloader, { PreloadOptions as ImagePreloadOptions, PreloadResult } from './ImagePreloader';
import performanceMonitor from './PerformanceMonitor';

// 音频资源接口
interface AudioResource {
  audio: HTMLAudioElement;
  url: string;
  loadTime: number;
  lastAccessed: number;
}

// 图片资源接口
interface ImageResource {
  image: HTMLImageElement;
  url: string;
  loadTime: number;
  lastAccessed: number;
}

interface ResourceCache {
  [key: string]: HTMLAudioElement | HTMLImageElement;
}

interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
  retries?: number;
}

class ResourceManager {
  private static instance: ResourceManager;
  private imagePreloader: ImagePreloader;
  private performanceMonitor = performanceMonitor;
  private audioCache = new Map<string, AudioResource>();
  private imageCache = new Map<string, ImageResource>();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private maxCacheSize = 50; // 最大缓存数量
  private cleanupThreshold = 0.8; // 清理阈值（80%时开始清理）
  private cacheAccessTime: Map<string, number> = new Map();

  private constructor() {
    // performanceMonitor已经是单例实例
    this.imagePreloader = ImagePreloader.getInstance();
    
    // 监听页面卸载，清理资源
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.clearAllCache();
      });

      // 监听内存压力，自动清理缓存
      if ('memory' in performance) {
        setInterval(() => {
          this.checkMemoryPressure();
        }, 30000); // 每30秒检查一次
      }
    }
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  /**
   * 预加载音频文件
   */
  public async preloadAudio(url: string, options: PreloadOptions = {}): Promise<void> {
    return this.performanceMonitor.measureAsyncFunction(`preload_audio_${url}`, async () => {
      try {
        // 检查是否已经在缓存中
        if (this.audioCache.has(url)) {
          return;
        }
        
        // 检查是否正在加载
        if (this.loadingPromises.has(url)) {
          await this.loadingPromises.get(url);
          return;
        }
        
        // 创建加载Promise
        const loadPromise = new Promise<void>((resolve, reject) => {
          const audio = new Audio();
          const timeout = options.timeout || 10000;
          
          const timeoutId = setTimeout(() => {
            reject(new Error(`Audio load timeout: ${url}`));
          }, timeout);
          
          audio.addEventListener('canplaythrough', () => {
            clearTimeout(timeoutId);
            
            // 添加到缓存
            const audioResource: AudioResource = {
              audio,
              url,
              loadTime: Date.now(),
              lastAccessed: Date.now()
            };
            
            this.audioCache.set(url, audioResource);
            this.cleanupAudioCache();
            
            resolve();
          });
          
          audio.addEventListener('error', () => {
            clearTimeout(timeoutId);
            reject(new Error(`Failed to load audio: ${url}`));
          });
          
          audio.preload = 'auto';
          audio.src = url;
        });
        
        this.loadingPromises.set(url, loadPromise);
        await loadPromise;
        this.loadingPromises.delete(url);
        
        // 记录成功的音频预加载
        this.performanceMonitor.recordMetric(
          'audio_preload_success',
          {
            value: 1,
            timestamp: Date.now(),
            url,
            priority: options.priority || 'medium',
          },
          'loading'
        );
        
        console.log(`Audio preloaded: ${url}`);
      } catch (error) {
        this.loadingPromises.delete(url);
        
        // 记录音频预加载错误
        this.performanceMonitor.reportError({
          message: `Failed to preload audio: ${url}`,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          context: 'audio_preload'
        });
        
        console.error(`Failed to preload audio: ${url}`, error);
        throw error;
      }
    });
  }

  /**
   * 预加载图片
   */
  async preloadImage(url: string, options: PreloadOptions = {}): Promise<HTMLImageElement> {
    return this.performanceMonitor.measureAsyncFunction(`preload_image_${url}`, async () => {
      try {
        // 检查本地缓存
         const cached = this.getCachedImage(url);
         if (cached) {
           this.performanceMonitor.recordMetric(
             'image_cache_hit',
             {
               value: 1,
               timestamp: Date.now(),
               url,
             },
             'loading'
           );
           return cached;
         }

        // 使用ImagePreloader进行预加载
        const imageOptions: ImagePreloadOptions = {
          priority: options.priority,
          timeout: options.timeout || 10000,
          retries: options.retries || 2
        };

        const result = await this.imagePreloader.preload(url, imageOptions);
        
        if (!result.success) {
          throw new Error(result.error || '图片加载失败');
        }

        // 从ImagePreloader获取缓存的图片
        const image = this.imagePreloader.getCached(url);
        if (!image) {
          throw new Error('图片预加载成功但无法获取缓存');
        }

        // 添加到本地缓存
        const imageResource: ImageResource = {
          image,
          url,
          loadTime: result.loadTime || 0,
          lastAccessed: Date.now()
        };
        
        this.imageCache.set(url, imageResource);
        this.cleanupImageCache();
        
        // 记录成功的图片预加载
        this.performanceMonitor.recordMetric(
          'image_preload_success',
          {
            value: 1,
            timestamp: Date.now(),
            url,
            priority: options.priority || 'medium',
          },
          'loading'
        );
        
        console.log(`Image preloaded: ${url}`);
        return image;
      } catch (error) {
        // 记录图片预加载错误
        this.performanceMonitor.reportError({
          message: `Failed to preload image: ${url}`,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          context: 'image_preload'
        });
        
        console.error(`Failed to preload image: ${url}`, error);
        throw error;
      }
    });
  }

  /**
   * 批量预加载图片
   */
  async preloadImages(urls: string[], options: PreloadOptions = {}): Promise<PreloadResult[]> {
    const startTime = Date.now();
    
    try {
      const imageOptions: ImagePreloadOptions = {
        priority: options.priority,
        timeout: options.timeout || 10000,
        retries: options.retries || 2
      };

      const sources = urls.map(url => ({ src: url, options: imageOptions }));
      const results = await this.imagePreloader.preloadBatch(sources);
      
      // 将成功加载的图片添加到本地缓存
      results.forEach((result, index) => {
        if (result.success) {
          const url = urls[index];
          const image = this.imagePreloader.getCached(url);
          if (image) {
            const imageResource: ImageResource = {
              image,
              url,
              loadTime: result.loadTime || 0,
              lastAccessed: Date.now()
            };
            this.imageCache.set(url, imageResource);
          }
        }
      });
      
      this.cleanupImageCache();
      
      this.performanceMonitor.recordMetric(
        'images_batch_preload',
        {
          value: urls.length,
          timestamp: Date.now(),
          count: urls.length,
          successCount: results.filter(r => r.success).length,
          totalTime: Date.now() - startTime
        },
        'loading'
      );
      
      return results;
    } catch (error) {
      this.performanceMonitor.reportError({
        message: 'images_batch_preload_failed',
        stack: (error as Error).stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        context: 'images_batch_preload'
      });
      throw error;
    }
  }

  /**
   * 批量预加载音频
   */
  async preloadAudios(urls: string[], options: PreloadOptions = {}): Promise<HTMLAudioElement[]> {
    // 先预加载所有音频
    const promises = urls.map(url => this.preloadAudio(url, options));
    await Promise.all(promises);
    
    // 然后获取缓存的音频元素
    const audioElements: HTMLAudioElement[] = [];
    for (const url of urls) {
      const audio = this.getCachedAudio(url);
      if (audio) {
        audioElements.push(audio);
      }
    }
    
    return audioElements;
  }

  /**
   * 批量预加载资源
   */
  async preloadResources(urls: string[], options: PreloadOptions = {}): Promise<void> {
    const audioUrls = urls.filter(url => url.match(/\.(mp3|wav|ogg)$/i));
    const imageUrls = urls.filter(url => url.match(/\.(jpg|jpeg|png|gif|webp)$/i));

    const promises: Promise<any>[] = [];
    
    if (audioUrls.length > 0) {
      promises.push(this.preloadAudios(audioUrls, options));
    }
    
    if (imageUrls.length > 0) {
      promises.push(this.preloadImages(imageUrls, options));
    }

    await Promise.all(promises);
  }

  /**
   * 清理音频缓存
   */
  private cleanupAudioCache(): void {
    if (this.audioCache.size <= this.maxCacheSize * this.cleanupThreshold) {
      return;
    }

    // 按最后访问时间排序，删除最旧的资源
    const entries = Array.from(this.audioCache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    const deleteCount = Math.floor(this.audioCache.size * 0.3); // 删除30%的缓存
    
    for (let i = 0; i < deleteCount; i++) {
      const [url, resource] = entries[i];
      resource.audio.pause();
      resource.audio.src = '';
      this.audioCache.delete(url);
    }
  }

  /**
   * 清理图片缓存
   */
  private cleanupImageCache(): void {
    if (this.imageCache.size <= this.maxCacheSize * this.cleanupThreshold) {
      return;
    }

    // 按最后访问时间排序，删除最旧的资源
    const entries = Array.from(this.imageCache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    const deleteCount = Math.floor(this.imageCache.size * 0.3); // 删除30%的缓存
    
    for (let i = 0; i < deleteCount; i++) {
      const [url] = entries[i];
      this.imageCache.delete(url);
      // 同时从ImagePreloader中移除
      this.imagePreloader.removeFromCache(url);
    }
  }

  /**
   * 获取缓存的音频
   */
  getCachedAudio(url: string): HTMLAudioElement | null {
    const resource = this.audioCache.get(url);
    if (resource) {
      resource.lastAccessed = Date.now();
      return resource.audio;
    }
    return null;
  }

  /**
   * 获取缓存的图片
   */
  getCachedImage(url: string): HTMLImageElement | null {
    const resource = this.imageCache.get(url);
    if (resource) {
      resource.lastAccessed = Date.now();
      return resource.image;
    }
    return null;
  }

  /**
   * 清理特定资源
   */
  public clearResource(url: string): void {
    const audioResource = this.audioCache.get(url);
    if (audioResource) {
      audioResource.audio.pause();
      audioResource.audio.src = '';
      this.audioCache.delete(url);
    }
    
    const imageResource = this.imageCache.get(url);
    if (imageResource) {
      this.imageCache.delete(url);
    }
    
    this.cacheAccessTime.delete(url);
    this.loadingPromises.delete(url);
  }

  /**
   * 清理所有缓存
   */
  public clearAllCache(): void {
    // 清理音频缓存
    this.audioCache.forEach(audioResource => {
      audioResource.audio.pause();
      audioResource.audio.src = '';
    });
    
    this.audioCache.clear();
    this.imageCache.clear();
    this.cacheAccessTime.clear();
    this.loadingPromises.clear();
    
    // 清理ImagePreloader的缓存
    this.imagePreloader.clearCache();
  }

  /**
   * 获取缓存统计信息
   */
  public getCacheStats(): {
    audioCount: number;
    imageCount: number;
    totalSize: number;
    audioUrls: string[];
    imageUrls: string[];
  } {
    return {
      audioCount: this.audioCache.size,
      imageCount: this.imageCache.size,
      totalSize: this.audioCache.size + this.imageCache.size,
      audioUrls: Array.from(this.audioCache.keys()),
      imageUrls: Array.from(this.imageCache.keys())
    };
  }

  /**
   * 更新资源访问时间
   */
  private updateAccessTime(url: string): void {
    this.cacheAccessTime.set(url, Date.now());
  }

  /**
   * 确保缓存大小不超过限制
   */
  private ensureCacheSize(type: 'audio' | 'image'): void {
    const cache = type === 'audio' ? this.audioCache : this.imageCache;
    const cacheKeys = Array.from(cache.keys());
    
    if (cacheKeys.length >= this.maxCacheSize) {
      // 找到最久未访问的资源并清理
      const oldestKey = cacheKeys.reduce((oldest, key) => {
        const oldestTime = this.cacheAccessTime.get(oldest) || 0;
        const keyTime = this.cacheAccessTime.get(key) || 0;
        return keyTime < oldestTime ? key : oldest;
      });
      
      this.clearResource(oldestKey);
    }
  }

  /**
   * 检查内存压力并清理缓存
   */
  private checkMemoryPressure(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const usedRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      // 如果内存使用超过80%，清理一半的缓存
      if (usedRatio > 0.8) {
        const allKeys = [
          ...Array.from(this.audioCache.keys()),
          ...Array.from(this.imageCache.keys())
        ];
        
        // 按访问时间排序，清理最久未访问的一半
        const sortedKeys = allKeys.sort((a, b) => {
          const timeA = this.cacheAccessTime.get(a) || 0;
          const timeB = this.cacheAccessTime.get(b) || 0;
          return timeA - timeB;
        });
        
        const keysToRemove = sortedKeys.slice(0, Math.floor(allKeys.length / 2));
        keysToRemove.forEach(key => this.clearResource(key));
        
        console.log(`内存压力检测：清理了 ${keysToRemove.length} 个缓存资源`);
      }
    }
  }
};

export default ResourceManager;

// 导出单例实例
export const resourceManager = ResourceManager.getInstance();