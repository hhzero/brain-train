/**
 * 音频资源管理器
 * 提供音频预加载、缓存和优化播放功能
 */

interface AudioConfig {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
}

interface CachedAudio {
  buffer: AudioBuffer;
  lastUsed: number;
  frequency: number;
}

class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private audioCache = new Map<string, CachedAudio>();
  private isInitialized = false;
  private maxCacheSize = 50; // 最大缓存音频数量
  private cacheTimeout = 300000; // 5分钟缓存超时
  
  // 音调频率映射 (C4-C5音阶)
  private readonly frequencies = [
    261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25
  ];
  
  private constructor() {}
  
  /**
   * 获取单例实例
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }
  
  /**
   * 初始化音频上下文
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // 检查浏览器支持
      if (typeof window === 'undefined') {
        console.warn('AudioManager: 服务端环境，跳过音频初始化');
        return false;
      }
      
      // 创建音频上下文
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('AudioManager: 浏览器不支持Web Audio API');
        return false;
      }
      
      this.audioContext = new AudioContextClass();
      
      // 处理音频上下文状态
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isInitialized = true;
      console.log('AudioManager: 音频系统初始化成功');
      
      // 预加载常用音频
      await this.preloadAudioBuffers();
      
      // 启动缓存清理定时器
      this.startCacheCleanup();
      
      return true;
    } catch (error) {
      console.error('AudioManager: 初始化失败', error);
      return false;
    }
  }
  
  /**
   * 预加载音频缓冲区
   */
  private async preloadAudioBuffers(): Promise<void> {
    if (!this.audioContext) return;
    
    const promises = this.frequencies.map(async (frequency, index) => {
      try {
        const buffer = await this.createAudioBuffer({
          frequency,
          duration: 500,
          volume: 0.3,
          type: 'sine'
        });
        
        const cacheKey = this.getCacheKey(frequency, 500, 'sine');
        this.audioCache.set(cacheKey, {
          buffer,
          lastUsed: Date.now(),
          frequency
        });
      } catch (error) {
        console.warn(`AudioManager: 预加载音频 ${index} 失败`, error);
      }
    });
    
    await Promise.all(promises);
    console.log(`AudioManager: 预加载了 ${this.audioCache.size} 个音频缓冲区`);
  }
  
  /**
   * 创建音频缓冲区
   */
  private async createAudioBuffer(config: AudioConfig): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('音频上下文未初始化');
    }
    
    const { frequency, duration, volume, type } = config;
    const sampleRate = this.audioContext.sampleRate;
    const frameCount = sampleRate * (duration / 1000);
    
    // 创建音频缓冲区
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // 生成音频数据
    for (let i = 0; i < frameCount; i++) {
      const time = i / sampleRate;
      let sample = 0;
      
      // 根据波形类型生成样本
      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * time);
          break;
        case 'square':
          sample = Math.sign(Math.sin(2 * Math.PI * frequency * time));
          break;
        case 'triangle':
          sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * time));
          break;
        case 'sawtooth':
          sample = 2 * (frequency * time - Math.floor(frequency * time + 0.5));
          break;
        default:
          sample = Math.sin(2 * Math.PI * frequency * time);
      }
      
      // 应用音量和淡入淡出
      const fadeTime = 0.01; // 10ms 淡入淡出
      const fadeFrames = fadeTime * sampleRate;
      
      if (i < fadeFrames) {
        // 淡入
        sample *= (i / fadeFrames);
      } else if (i > frameCount - fadeFrames) {
        // 淡出
        sample *= ((frameCount - i) / fadeFrames);
      }
      
      channelData[i] = sample * volume;
    }
    
    return buffer;
  }
  
  /**
   * 播放音调
   */
  public async playTone(
    frequency: number,
    duration: number = 500,
    volume: number = 0.3,
    type: OscillatorType = 'sine'
  ): Promise<void> {
    if (!this.isInitialized || !this.audioContext) {
      console.warn('AudioManager: 音频系统未初始化');
      return;
    }
    
    try {
      // 检查缓存
      const cacheKey = this.getCacheKey(frequency, duration, type);
      let audioBuffer = this.audioCache.get(cacheKey)?.buffer;
      
      if (!audioBuffer) {
        // 创建新的音频缓冲区
        audioBuffer = await this.createAudioBuffer({
          frequency,
          duration,
          volume,
          type
        });
        
        // 添加到缓存
        this.addToCache(cacheKey, audioBuffer, frequency);
      } else {
        // 更新缓存使用时间
        const cached = this.audioCache.get(cacheKey);
        if (cached) {
          cached.lastUsed = Date.now();
        }
      }
      
      // 播放音频
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // 设置音量
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      
      // 开始播放
      source.start(this.audioContext.currentTime);
      
    } catch (error) {
      console.error('AudioManager: 播放音频失败', error);
    }
  }
  
  /**
   * 播放预定义的音调（0-7）
   */
  public async playToneByIndex(
    index: number,
    duration: number = 500,
    volume: number = 0.3
  ): Promise<void> {
    if (index < 0 || index >= this.frequencies.length) {
      console.warn(`AudioManager: 无效的音调索引 ${index}`);
      return;
    }
    
    await this.playTone(this.frequencies[index], duration, volume);
  }
  
  /**
   * 获取缓存键
   */
  private getCacheKey(frequency: number, duration: number, type: string): string {
    return `${frequency}_${duration}_${type}`;
  }
  
  /**
   * 添加到缓存
   */
  private addToCache(key: string, buffer: AudioBuffer, frequency: number): void {
    // 检查缓存大小限制
    if (this.audioCache.size >= this.maxCacheSize) {
      this.cleanupOldCache();
    }
    
    this.audioCache.set(key, {
      buffer,
      lastUsed: Date.now(),
      frequency
    });
  }
  
  /**
   * 清理旧缓存
   */
  private cleanupOldCache(): void {
    const now = Date.now();
    const entries = Array.from(this.audioCache.entries());
    
    // 按最后使用时间排序
    entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    
    // 删除最旧的缓存项
    const toDelete = Math.ceil(this.maxCacheSize * 0.3); // 删除30%
    for (let i = 0; i < toDelete && i < entries.length; i++) {
      this.audioCache.delete(entries[i][0]);
    }
    
    console.log(`AudioManager: 清理了 ${toDelete} 个旧缓存项`);
  }
  
  /**
   * 启动缓存清理定时器
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const toDelete: string[] = [];
      
      this.audioCache.forEach((cached, key) => {
        if (now - cached.lastUsed > this.cacheTimeout) {
          toDelete.push(key);
        }
      });
      
      toDelete.forEach(key => this.audioCache.delete(key));
      
      if (toDelete.length > 0) {
        console.log(`AudioManager: 清理了 ${toDelete.length} 个过期缓存项`);
      }
    }, 60000); // 每分钟检查一次
  }
  
  /**
   * 获取音频系统状态
   */
  public getStatus(): {
    initialized: boolean;
    cacheSize: number;
    contextState: string;
  } {
    return {
      initialized: this.isInitialized,
      cacheSize: this.audioCache.size,
      contextState: this.audioContext?.state || 'unknown'
    };
  }
  
  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.audioCache.clear();
    this.isInitialized = false;
    
    console.log('AudioManager: 资源已清理');
  }
}

// 导出单例实例
export const audioManager = AudioManager.getInstance();
export default audioManager;