/**
 * N-Back训练音频管理器
 * 使用Web Audio API生成音调和管理音效
 */

import audioManager from './AudioManager';

// 音调配置
interface ToneConfig {
  frequency: number;
  duration: number;
  volume: number;
}

// 预定义的音调频率（8个不同的音调）
const TONE_FREQUENCIES = [
  440,  // A4
  523,  // C5
  659,  // E5
  784,  // G5
  880,  // A5
  1047, // C6
  1319, // E6
  1568  // G6
];

// 音效类型
export enum SoundEffect {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  START = 'start',
  COMPLETE = 'complete',
  TICK = 'tick'
}

class NBackAudioManager {
  private static instance: NBackAudioManager;
  private audioContext: AudioContext | null = null;
  private audioManagerInstance = audioManager;
  private isInitialized = false;

  private constructor() {
    // audioManager已经是单例实例
  }

  static getInstance(): NBackAudioManager {
    if (!NBackAudioManager.instance) {
      NBackAudioManager.instance = new NBackAudioManager();
    }
    return NBackAudioManager.instance;
  }

  /**
   * 初始化音频上下文
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 创建音频上下文
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 如果音频上下文被暂停，尝试恢复
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log('N-Back音频管理器初始化成功');
    } catch (error) {
      console.error('音频上下文初始化失败:', error);
      throw error;
    }
  }

  /**
   * 播放指定索引的音调（0-7）
   */
  async playTone(toneIndex: number, duration: number = 0.5, volume: number = 0.3): Promise<void> {
    if (!this.audioContext || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioContext) {
      throw new Error('音频上下文未初始化');
    }

    const frequency = TONE_FREQUENCIES[toneIndex % TONE_FREQUENCIES.length];
    
    try {
      // 创建振荡器
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // 连接音频节点
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // 设置音调参数
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine'; // 使用正弦波

      // 设置音量包络（淡入淡出）
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // 快速淡入
      gainNode.gain.linearRampToValueAtTime(volume, now + duration - 0.01); // 保持音量
      gainNode.gain.linearRampToValueAtTime(0, now + duration); // 淡出

      // 播放音调
      oscillator.start(now);
      oscillator.stop(now + duration);

      // 清理资源
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };

    } catch (error) {
      console.error('播放音调失败:', error);
      throw error;
    }
  }

  /**
   * 播放音效
   */
  async playSoundEffect(effect: SoundEffect, volume: number = 0.5): Promise<void> {
    try {
      // 根据音效类型生成不同的声音
      switch (effect) {
        case SoundEffect.CORRECT:
          await this.playSuccessSound(volume);
          break;
        case SoundEffect.INCORRECT:
          await this.playErrorSound(volume);
          break;
        case SoundEffect.START:
          await this.playStartSound(volume);
          break;
        case SoundEffect.COMPLETE:
          await this.playCompleteSound(volume);
          break;
        case SoundEffect.TICK:
          await this.playTickSound(volume);
          break;
        default:
          console.warn('未知的音效类型:', effect);
      }
    } catch (error) {
      console.error('播放音效失败:', error);
    }
  }

  /**
   * 播放成功音效（上升音调）
   */
  private async playSuccessSound(volume: number): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    const duration = 0.3;

    // 上升音调 (C5 -> E5 -> G5)
    oscillator.frequency.setValueAtTime(523, now);
    oscillator.frequency.linearRampToValueAtTime(659, now + duration / 2);
    oscillator.frequency.linearRampToValueAtTime(784, now + duration);

    oscillator.type = 'triangle';

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);

    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }

  /**
   * 播放错误音效（下降音调）
   */
  private async playErrorSound(volume: number): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    const duration = 0.4;

    // 下降音调 (G5 -> E5 -> C5)
    oscillator.frequency.setValueAtTime(784, now);
    oscillator.frequency.linearRampToValueAtTime(659, now + duration / 2);
    oscillator.frequency.linearRampToValueAtTime(523, now + duration);

    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);

    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }

  /**
   * 播放开始音效
   */
  private async playStartSound(volume: number): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    const duration = 0.6;

    // 启动音效 (C4 -> C5)
    oscillator.frequency.setValueAtTime(261, now);
    oscillator.frequency.linearRampToValueAtTime(523, now + duration);

    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);

    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }

  /**
   * 播放完成音效
   */
  private async playCompleteSound(volume: number): Promise<void> {
    if (!this.audioContext) return;

    // 播放一系列上升音调
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    const noteDuration = 0.15;

    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;

        oscillator.frequency.setValueAtTime(notes[i], now);
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + noteDuration);

        oscillator.start(now);
        oscillator.stop(now + noteDuration);

        oscillator.onended = () => {
          oscillator.disconnect();
          gainNode.disconnect();
        };
      }, i * noteDuration * 1000);
    }
  }

  /**
   * 播放节拍音效
   */
  private async playTickSound(volume: number): Promise<void> {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    const duration = 0.1;

    oscillator.frequency.setValueAtTime(1000, now);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);

    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }

  /**
   * 获取可用的音调数量
   */
  getToneCount(): number {
    return TONE_FREQUENCIES.length;
  }

  /**
   * 获取音调频率
   */
  getToneFrequency(index: number): number {
    return TONE_FREQUENCIES[index % TONE_FREQUENCIES.length];
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.isInitialized = false;
  }
}

export default NBackAudioManager;
export { TONE_FREQUENCIES };