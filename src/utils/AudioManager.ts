import { resourceManager } from './ResourceManager';
import { performanceMonitor } from './PerformanceMonitor';

interface AudioOptions {
  volume?: number;
  loop?: boolean;
  preload?: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoaded: boolean;
  duration: number;
  currentTime: number;
  volume: number;
}

/**
 * 音频管理器 - 集成ResourceManager进行优化的音频资源管理
 * 提供音频播放、暂停、停止、音量控制等功能
 */

import PerformanceMonitor from './PerformanceMonitor';
class AudioManager {
  private static instance: AudioManager;
  private fadeIntervals = new Map<string, NodeJS.Timeout>();
  private audioStates = new Map<string, AudioState>();
  private globalVolume = 1;
  private isMuted = false;
  private visibilityChangeHandler: (() => void) | null = null;
  private performanceMonitor: PerformanceMonitor;

  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
    // Listen for visibility change to pause audio when tab is hidden
    if (typeof document !== 'undefined') {
      this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * 预加载音频文件 - 使用ResourceManager进行优化管理
   */
  async preload(src: string): Promise<HTMLAudioElement> {
    try {
      const startTime = performance.now();
      
      // 使用ResourceManager预加载音频
      await resourceManager.preloadAudio(src, {
        priority: 'high',
        timeout: 10000
      });
      
      // 从ResourceManager获取缓存的音频
      const audio = resourceManager.getCachedAudio(src);
      if (!audio) {
        throw new Error(`Failed to get cached audio: ${src}`);
      }
      
      // 初始化音频状态
      this.initializeAudioState(src, audio);
      
      const duration = performance.now() - startTime;
      this.performanceMonitor.recordMetric({
          name: 'audio_preload_duration',
          value: duration,
          timestamp: Date.now(),
          category: 'loading',
          metadata: { src }
        });
      
      return audio;
    } catch (error) {
        this.performanceMonitor.reportAudioError(
          `Failed to preload audio: ${src}`,
          {
            src,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        );
        throw error;
      }
  }

  /**
   * 播放音频 - 支持音量、循环、淡入等选项
   */
  async play(src: string, options: AudioOptions = {}): Promise<void> {
    return this.performanceMonitor.measureAsyncFunction(`play_audio_${src}`, async () => {
       try {
         // 尝试从缓存获取音频，如果没有则预加载
         let audio = resourceManager.getCachedAudio(src);
         if (!audio) {
           audio = await this.preload(src);
         }

         // 停止任何现有的淡入淡出效果
         this.stopFade(src);

         // 应用播放选项
         const {
           volume = 1,
           loop = false,
           fadeIn = 0,
         } = options;

         audio.loop = loop;
         audio.volume = fadeIn > 0 ? 0 : volume * this.globalVolume * (this.isMuted ? 0 : 1);

         // 重置音频到开始位置
         audio.currentTime = 0;

         // 播放音频
         await audio.play();

         // 应用淡入效果
         if (fadeIn > 0) {
           this.fadeIn(src, volume * this.globalVolume * (this.isMuted ? 0 : 1), fadeIn);
         }
         
         // 记录成功的音频播放
         this.performanceMonitor.recordMetric({
           name: 'audio_play_success',
           value: 1,
           timestamp: Date.now(),
           category: 'interaction',
           metadata: {
             src,
             volume,
             loop,
           },
         });
         
       } catch (error) {
         this.performanceMonitor.reportAudioError(
           `Failed to play audio: ${src}`,
           {
             src,
             error: error instanceof Error ? error.message : 'Unknown error',
             options,
           }
         );
         
         console.error(`播放音频失败 ${src}:`, error);
         throw error;
       }
     });
  }

  /**
   * 停止音频播放 - 支持淡出效果
   */
  async stop(src: string, fadeOut = 0): Promise<void> {
    const audio = resourceManager.getCachedAudio(src);
    if (!audio) return;

    this.stopFade(src);

    if (fadeOut > 0) {
      await this.fadeOut(src, fadeOut);
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    this.updateAudioState(src, {
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
    });
  }

  /**
   * 暂停音频播放
   */
  pause(src: string): void {
    const audio = resourceManager.getCachedAudio(src);
    if (!audio) return;

    audio.pause();
    this.updateAudioState(src, {
      isPlaying: false,
      isPaused: true,
    });
  }

  /**
   * 恢复音频播放
   */
  async resume(src: string): Promise<void> {
    const audio = resourceManager.getCachedAudio(src);
    if (!audio) return;

    try {
      await audio.play();
      this.updateAudioState(src, {
        isPlaying: true,
        isPaused: false,
      });
    } catch (error) {
      this.performanceMonitor.reportAudioError(
        `Failed to resume audio: ${src}`,
        {
          context: 'AudioManager.resume',
          audioSrc: src,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      console.error(`恢复音频播放失败 ${src}:`, error);
    }
  }

  /**
   * 设置特定音频的音量
   */
  setVolume(src: string, volume: number): void {
    const audio = resourceManager.getCachedAudio(src);
    if (!audio) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));
    audio.volume = clampedVolume * this.globalVolume * (this.isMuted ? 0 : 1);
    
    this.updateAudioState(src, { volume: audio.volume });
  }

  /**
   * 设置全局音量
   */
  setGlobalVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));
    
    // 更新所有缓存音频的音量
    const cacheStats = resourceManager.getCacheStats();
    cacheStats.audioUrls.forEach((src) => {
      const audio = resourceManager.getCachedAudio(src);
      const state = this.audioStates.get(src);
      if (audio && state) {
        audio.volume = state.volume * this.globalVolume * (this.isMuted ? 0 : 1);
      }
    });
  }

  /**
   * 设置静音状态
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    // 更新所有缓存音频的音量
    const cacheStats = resourceManager.getCacheStats();
    cacheStats.audioUrls.forEach((src) => {
      const audio = resourceManager.getCachedAudio(src);
      const state = this.audioStates.get(src);
      if (audio && state) {
        audio.volume = state.volume * this.globalVolume * (this.isMuted ? 0 : 1);
      }
    });
  }

  /**
   * 获取音频状态
   */
  getState(src: string): AudioState | null {
    return this.audioStates.get(src) || null;
  }

  /**
   * 检查音频是否已缓存
   */
  isCached(src: string): boolean {
    return resourceManager.getCachedAudio(src) !== null;
  }

  /**
   * 清除音频缓存
   */
  clearCache(): void {
    // Clear all timers
    this.fadeIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.fadeIntervals.clear();
    
    // 停止所有音频播放
    this.audioStates.forEach((_, src) => {
      const audio = resourceManager.getCachedAudio(src);
      if (audio) {
        audio.pause();
      }
    });
    
    // 清除ResourceManager中的音频缓存
    resourceManager.clearAllCache();
    
    // 清除本地状态
    this.audioStates.clear();
    
    // Remove event listeners
    if (this.visibilityChangeHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }

  /**
   * 批量预加载多个音频文件
   */
  async preloadBatch(sources: string[]): Promise<void> {
    try {
      const startTime = performance.now();
      
      // 使用ResourceManager的批量预加载功能
      await resourceManager.preloadResources(sources, {
        priority: 'high',
        timeout: 10000
      });
      
      // 初始化所有音频的状态
      sources.forEach(src => {
        const audio = resourceManager.getCachedAudio(src);
        if (audio) {
          this.initializeAudioState(src, audio);
        }
      });
      
      const duration = performance.now() - startTime;
      this.performanceMonitor.recordMetric({
          name: 'audio_batch_preload_duration',
          value: duration,
          timestamp: Date.now(),
          category: 'loading',
          metadata: { sourceCount: sources.length }
        });
    } catch (error) {
      this.performanceMonitor.reportAudioError(
        `Failed to preload audio batch`,
        {
          context: 'AudioManager.preloadBatch',
          sources: sources.join(', '),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
      console.error('批量预加载音频失败:', error);
      throw error;
    }
  }

  /**
   * Initialize audio state
   */
  private initializeAudioState(src: string, audio: HTMLAudioElement): void {
    const updateState = () => {
      this.updateAudioState(src, {
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      });
    };

    audio.addEventListener('timeupdate', updateState);
    audio.addEventListener('loadedmetadata', updateState);
    audio.addEventListener('ended', () => {
      this.updateAudioState(src, {
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
      });
    });

    this.audioStates.set(src, {
      isPlaying: false,
      isPaused: false,
      isLoaded: true,
      duration: audio.duration || 0,
      currentTime: 0,
      volume: audio.volume,
    });
  }

  /**
   * Update audio state
   */
  private updateAudioState(src: string, updates: Partial<AudioState>): void {
    const currentState = this.audioStates.get(src);
    if (currentState) {
      this.audioStates.set(src, { ...currentState, ...updates });
    }
  }

  /**
   * Fade in audio
   */
  private fadeIn(src: string, targetVolume: number, duration: number): void {
    const audio = resourceManager.getCachedAudio(src);
    if (!audio) return;

    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);
      
      if (currentStep >= steps) {
        clearInterval(interval);
        this.fadeIntervals.delete(src);
      }
    }, stepDuration);

    this.fadeIntervals.set(src, interval);
  }

  /**
   * Fade out audio
   */
  private fadeOut(src: string, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const audio = resourceManager.getCachedAudio(src);
      if (!audio) {
        resolve();
        return;
      }

      const startVolume = audio.volume;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
        
        if (currentStep >= steps) {
          clearInterval(interval);
          audio.pause();
          audio.currentTime = 0;
          this.fadeIntervals.delete(src);
          resolve();
        }
      }, stepDuration);

      this.fadeIntervals.set(src, interval);
    });
  }

  /**
   * Stop fade effect
   */
  private stopFade(src: string): void {
    const interval = this.fadeIntervals.get(src);
    if (interval) {
      clearInterval(interval);
      this.fadeIntervals.delete(src);
    }
  }

  /**
   * Handle visibility change
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Pause all playing audio when tab becomes hidden
      this.audioStates.forEach((state, src) => {
        if (state?.isPlaying) {
          this.pause(src);
        }
      });
    }
  }

  /**
   * Get global settings
   */
  getGlobalSettings(): { volume: number; isMuted: boolean } {
    return {
      volume: this.globalVolume,
      isMuted: this.isMuted,
    };
  }
}

// 创建并导出单例实例
export const audioManager = AudioManager.getInstance();

export default AudioManager;
export type { AudioOptions, AudioState };