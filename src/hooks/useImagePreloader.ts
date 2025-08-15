import { useState, useEffect, useCallback } from 'react';
import ResourceManager from '../utils/ResourceManager';
import { PreloadResult } from '../utils/ImagePreloader';

// 预加载选项接口
interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
  retries?: number;
}

interface UseImagePreloaderReturn {
  preload: (src: string, options?: PreloadOptions) => Promise<PreloadResult>;
  preloadBatch: (sources: Array<{ src: string; options?: PreloadOptions }>) => Promise<PreloadResult[]>;
  isCached: (src: string) => boolean;
  clearCache: () => void;
  cacheStats: { size: number; urls: string[] };
  isLoading: boolean;
  loadingProgress: number;
}

const useImagePreloader = (): UseImagePreloaderReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [cacheStats, setCacheStats] = useState<{ size: number; urls: string[] }>({ size: 0, urls: [] });
  
  const resourceManager = ResourceManager.getInstance();

  // Update cache stats
  const updateCacheStats = useCallback(() => {
    const stats = resourceManager.getCacheStats();
    setCacheStats({ size: stats.imageCount, urls: stats.imageUrls });
  }, [resourceManager]);

  // Preload single image
  const preload = useCallback(async (src: string, options?: PreloadOptions): Promise<PreloadResult> => {
    setIsLoading(true);
    try {
      await resourceManager.preloadImage(src, options);
      updateCacheStats();
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '图片预加载失败';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [resourceManager, updateCacheStats]);

  // Preload batch of images with progress tracking
  const preloadBatch = useCallback(async (
    sources: Array<{ src: string; options?: PreloadOptions }>
  ): Promise<PreloadResult[]> => {
    setIsLoading(true);
    setLoadingProgress(0);
    
    try {
      const urls = sources.map(s => s.src);
      const options = sources[0]?.options || {}; // 使用第一个选项作为默认值
      
      const results = await resourceManager.preloadImages(urls, options);
      
      // 模拟进度更新
      setLoadingProgress(100);
      
      updateCacheStats();
      return results;
    } catch (error) {
      // 如果批量预加载失败，返回失败结果
      const errorMessage = error instanceof Error ? error.message : '批量图片预加载失败';
      return sources.map(() => ({ success: false, error: errorMessage }));
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  }, [resourceManager, updateCacheStats]);

  // Check if image is cached
  const isCached = useCallback((src: string): boolean => {
    return resourceManager.getCachedImage(src) !== null;
  }, [resourceManager]);

  // Clear cache
  const clearCache = useCallback(() => {
    resourceManager.clearAllCache();
    updateCacheStats();
  }, [resourceManager, updateCacheStats]);

  // Initialize cache stats
  useEffect(() => {
    updateCacheStats();
  }, [updateCacheStats]);

  return {
    preload,
    preloadBatch,
    isCached,
    clearCache,
    cacheStats,
    isLoading,
    loadingProgress,
  };
};

export default useImagePreloader;