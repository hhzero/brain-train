interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
  retries?: number;
}

interface PreloadResult {
  success: boolean;
  error?: string;
  loadTime?: number;
}

class ImagePreloader {
  private static instance: ImagePreloader;
  private cache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<PreloadResult>>();
  private loadQueue: Array<{ src: string; options: PreloadOptions; resolve: (result: PreloadResult) => void }> = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private currentLoading = 0;

  private constructor() {}

  static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    return ImagePreloader.instance;
  }

  /**
   * Preload a single image
   */
  async preload(src: string, options: PreloadOptions = {}): Promise<PreloadResult> {
    // Return cached image if available
    if (this.cache.has(src)) {
      return { success: true, loadTime: 0 };
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<PreloadResult>((resolve) => {
      this.loadQueue.push({ src, options, resolve });
      this.processQueue();
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  /**
   * Preload multiple images
   */
  async preloadBatch(sources: Array<{ src: string; options?: PreloadOptions }>): Promise<PreloadResult[]> {
    const promises = sources.map(({ src, options = {} }) => this.preload(src, options));
    return Promise.all(promises);
  }

  /**
   * Process the loading queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.currentLoading >= this.maxConcurrent) {
      return;
    }

    this.isProcessing = true;

    while (this.loadQueue.length > 0 && this.currentLoading < this.maxConcurrent) {
      const item = this.loadQueue.shift();
      if (!item) break;

      this.currentLoading++;
      this.loadImage(item.src, item.options)
        .then(item.resolve)
        .finally(() => {
          this.currentLoading--;
          this.loadingPromises.delete(item.src);
          this.processQueue();
        });
    }

    this.isProcessing = false;
  }

  /**
   * Load a single image with retry logic
   */
  private async loadImage(src: string, options: PreloadOptions): Promise<PreloadResult> {
    const { timeout = 10000, retries = 2 } = options;
    let lastError: string = '';

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now();
        const img = await this.loadImageWithTimeout(src, timeout);
        const loadTime = Date.now() - startTime;

        // Cache the loaded image
        this.cache.set(src, img);

        return { success: true, loadTime };
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    return { success: false, error: lastError };
  }

  /**
   * Load image with timeout
   */
  private loadImageWithTimeout(src: string, timeout: number): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      let timeoutId: NodeJS.Timeout;

      const cleanup = () => {
        clearTimeout(timeoutId);
        img.onload = null;
        img.onerror = null;
      };

      img.onload = () => {
        cleanup();
        resolve(img);
      };

      img.onerror = () => {
        cleanup();
        reject(new Error(`Failed to load image: ${src}`));
      };

      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Image load timeout: ${src}`));
      }, timeout);

      img.src = src;
    });
  }

  /**
   * Check if image is cached
   */
  isCached(src: string): boolean {
    return this.cache.has(src);
  }

  /**
   * Get cached image
   */
  getCached(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Remove specific image from cache
   */
  removeFromCache(src: string): void {
    this.cache.delete(src);
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; urls: string[] } {
    return {
      size: this.cache.size,
      urls: Array.from(this.cache.keys()),
    };
  }

  /**
   * Preload images for a specific training type
   */
  async preloadTrainingImages(trainingType: string): Promise<void> {
    const imageMap: Record<string, string[]> = {
      'gaze-tracking': [
        '/images/gaze-target-1.jpg',
        '/images/gaze-target-2.jpg',
        '/images/gaze-target-3.jpg',
      ],
      'focus-training': [
        '/images/focus-bg-1.jpg',
        '/images/focus-bg-2.jpg',
        '/images/focus-pattern.svg',
      ],
      'eye-movement': [
        '/images/movement-bg.jpg',
        '/images/movement-targets.svg',
      ],
    };

    const images = imageMap[trainingType] || [];
    if (images.length === 0) return;

    const sources = images.map(src => ({
      src,
      options: { priority: 'high' as const, timeout: 8000, retries: 1 },
    }));

    try {
      await this.preloadBatch(sources);
      console.log(`Preloaded ${images.length} images for ${trainingType}`);
    } catch (error) {
      console.warn(`Failed to preload some images for ${trainingType}:`, error);
    }
  }
}

export default ImagePreloader;
export type { PreloadOptions, PreloadResult };