'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Zap, 
  CheckCircle, 
  XCircle,
  Star,
  Trophy,
  Target
} from 'lucide-react';

// 音效类型枚举
enum SoundType {
  // 训练音调
  TONE_C = 'tone_c',
  TONE_D = 'tone_d',
  TONE_E = 'tone_e',
  TONE_F = 'tone_f',
  TONE_G = 'tone_g',
  TONE_A = 'tone_a',
  TONE_B = 'tone_b',
  TONE_C_HIGH = 'tone_c_high',
  
  // 反馈音效
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  PERFECT = 'perfect',
  COMBO = 'combo',
  
  // 系统音效
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
  COMPLETE = 'complete',
  LEVEL_UP = 'level_up',
  ACHIEVEMENT = 'achievement',
  
  // 界面音效
  BUTTON_CLICK = 'button_click',
  BUTTON_HOVER = 'button_hover',
  NOTIFICATION = 'notification'
}

// 音效配置接口
interface SoundConfig {
  enabled: boolean;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  loop: boolean;
  priority: number;
}

// 音调配置
interface ToneConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

// 默认音效配置
const DEFAULT_SOUND_CONFIG: SoundConfig = {
  enabled: true,
  volume: 0.7,
  fadeIn: 0.1,
  fadeOut: 0.1,
  loop: false,
  priority: 1
};

// 音调频率映射
const TONE_FREQUENCIES: Record<SoundType, number> = {
  [SoundType.TONE_C]: 261.63,
  [SoundType.TONE_D]: 293.66,
  [SoundType.TONE_E]: 329.63,
  [SoundType.TONE_F]: 349.23,
  [SoundType.TONE_G]: 392.00,
  [SoundType.TONE_A]: 440.00,
  [SoundType.TONE_B]: 493.88,
  [SoundType.TONE_C_HIGH]: 523.25,
  [SoundType.CORRECT]: 800,
  [SoundType.INCORRECT]: 200,
  [SoundType.PERFECT]: 1000,
  [SoundType.COMBO]: 600,
  [SoundType.START]: 440,
  [SoundType.PAUSE]: 330,
  [SoundType.RESUME]: 440,
  [SoundType.COMPLETE]: 880,
  [SoundType.LEVEL_UP]: 1200,
  [SoundType.ACHIEVEMENT]: 1500,
  [SoundType.BUTTON_CLICK]: 800,
  [SoundType.BUTTON_HOVER]: 600,
  [SoundType.NOTIFICATION]: 700
};

// 音效样式配置
const SOUND_STYLES: Record<SoundType, Partial<ToneConfig>> = {
  // 训练音调 - 纯净的正弦波
  [SoundType.TONE_C]: { type: 'sine', duration: 500, attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 },
  [SoundType.TONE_D]: { type: 'sine', duration: 500, attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 },
  [SoundType.TONE_E]: { type: 'sine', duration: 500, attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 },
  [SoundType.TONE_F]: { type: 'sine', duration: 500, attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 },
  [SoundType.TONE_G]: { type: 'sine', duration: 500, attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 },
  [SoundType.TONE_A]: { type: 'sine', duration: 500, attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 },
  [SoundType.TONE_B]: { type: 'sine', duration: 500, attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 },
  [SoundType.TONE_C_HIGH]: { type: 'sine', duration: 500, attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 },
  
  // 反馈音效 - 短促明快
  [SoundType.CORRECT]: { type: 'triangle', duration: 200, attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.1 },
  [SoundType.INCORRECT]: { type: 'sawtooth', duration: 300, attack: 0.05, decay: 0.2, sustain: 0.2, release: 0.2 },
  [SoundType.PERFECT]: { type: 'sine', duration: 400, attack: 0.1, decay: 0.1, sustain: 0.6, release: 0.3 },
  [SoundType.COMBO]: { type: 'square', duration: 150, attack: 0.02, decay: 0.05, sustain: 0.4, release: 0.1 },
  
  // 系统音效
  [SoundType.START]: { type: 'triangle', duration: 300, attack: 0.1, decay: 0.1, sustain: 0.5, release: 0.2 },
  [SoundType.PAUSE]: { type: 'sine', duration: 200, attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.1 },
  [SoundType.RESUME]: { type: 'triangle', duration: 250, attack: 0.05, decay: 0.1, sustain: 0.4, release: 0.15 },
  [SoundType.COMPLETE]: { type: 'sine', duration: 600, attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.4 },
  [SoundType.LEVEL_UP]: { type: 'triangle', duration: 800, attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.5 },
  [SoundType.ACHIEVEMENT]: { type: 'sine', duration: 1000, attack: 0.2, decay: 0.3, sustain: 0.6, release: 0.6 },
  
  // 界面音效 - 轻柔简洁
  [SoundType.BUTTON_CLICK]: { type: 'triangle', duration: 100, attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.05 },
  [SoundType.BUTTON_HOVER]: { type: 'sine', duration: 80, attack: 0.01, decay: 0.03, sustain: 0.1, release: 0.03 },
  [SoundType.NOTIFICATION]: { type: 'triangle', duration: 250, attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.15 }
};

interface SoundEffectManagerProps {
  masterVolume?: number;
  effectsVolume?: number;
  tonesVolume?: number;
  enableEffects?: boolean;
  enableTones?: boolean;
  onVolumeChange?: (type: 'master' | 'effects' | 'tones', volume: number) => void;
  onToggle?: (type: 'effects' | 'tones', enabled: boolean) => void;
}

export class SoundEffectManager {
  private audioContext: AudioContext | null = null;
  private gainNodes: Map<string, GainNode> = new Map();
  private masterGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private tonesGain: GainNode | null = null;
  private activeSounds: Map<string, { oscillator: OscillatorNode; gain: GainNode }> = new Map();
  private soundConfigs: Map<SoundType, SoundConfig> = new Map();
  
  constructor() {
    this.initializeAudioContext();
    this.initializeSoundConfigs();
  }

  // 初始化音频上下文
  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 创建主增益节点
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      
      // 创建效果音增益节点
      this.effectsGain = this.audioContext.createGain();
      this.effectsGain.connect(this.masterGain);
      
      // 创建音调增益节点
      this.tonesGain = this.audioContext.createGain();
      this.tonesGain.connect(this.masterGain);
      
      // 设置默认音量
      this.masterGain.gain.value = 0.7;
      this.effectsGain.gain.value = 0.8;
      this.tonesGain.gain.value = 0.6;
      
    } catch (error) {
      console.error('Audio context initialization failed:', error);
    }
  }

  // 初始化音效配置
  private initializeSoundConfigs() {
    Object.values(SoundType).forEach(soundType => {
      this.soundConfigs.set(soundType, { ...DEFAULT_SOUND_CONFIG });
    });
  }

  // 恢复音频上下文（用户交互后）
  public async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // 播放音调
  public async playTone(
    soundType: SoundType, 
    options: Partial<ToneConfig> = {}
  ): Promise<void> {
    if (!this.audioContext || !this.tonesGain) return;
    
    await this.resumeAudioContext();
    
    const config = this.soundConfigs.get(soundType);
    if (!config?.enabled) return;
    
    const frequency = TONE_FREQUENCIES[soundType];
    const style = SOUND_STYLES[soundType];
    const toneConfig: ToneConfig = {
      frequency,
      duration: 500,
      type: 'sine',
      volume: config.volume,
      attack: 0.1,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
      ...style,
      ...options
    };
    
    // 创建振荡器和增益节点
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // 配置振荡器
    oscillator.type = toneConfig.type;
    oscillator.frequency.setValueAtTime(toneConfig.frequency, this.audioContext.currentTime);
    
    // 连接节点
    oscillator.connect(gainNode);
    gainNode.connect(this.tonesGain);
    
    // 配置ADSR包络
    const now = this.audioContext.currentTime;
    const attackTime = toneConfig.attack;
    const decayTime = toneConfig.decay;
    const sustainLevel = toneConfig.sustain * toneConfig.volume;
    const releaseTime = toneConfig.release;
    const totalDuration = toneConfig.duration / 1000;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(toneConfig.volume, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, now + totalDuration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, now + totalDuration);
    
    // 启动和停止振荡器
    oscillator.start(now);
    oscillator.stop(now + totalDuration);
    
    // 清理
    oscillator.onended = () => {
      gainNode.disconnect();
      oscillator.disconnect();
    };
  }

  // 播放音效序列
  public async playToneSequence(
    tones: SoundType[], 
    interval: number = 100
  ): Promise<void> {
    for (let i = 0; i < tones.length; i++) {
      await this.playTone(tones[i]);
      if (i < tones.length - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }

  // 播放和弦
  public async playChord(tones: SoundType[]): Promise<void> {
    const promises = tones.map(tone => this.playTone(tone));
    await Promise.all(promises);
  }

  // 播放反馈音效
  public async playFeedback(type: 'correct' | 'incorrect' | 'perfect' | 'combo'): Promise<void> {
    const soundMap = {
      correct: SoundType.CORRECT,
      incorrect: SoundType.INCORRECT,
      perfect: SoundType.PERFECT,
      combo: SoundType.COMBO
    };
    
    await this.playTone(soundMap[type]);
  }

  // 播放系统音效
  public async playSystem(type: 'start' | 'pause' | 'resume' | 'complete' | 'levelUp' | 'achievement'): Promise<void> {
    const soundMap = {
      start: SoundType.START,
      pause: SoundType.PAUSE,
      resume: SoundType.RESUME,
      complete: SoundType.COMPLETE,
      levelUp: SoundType.LEVEL_UP,
      achievement: SoundType.ACHIEVEMENT
    };
    
    await this.playTone(soundMap[type]);
  }

  // 播放界面音效
  public async playUI(type: 'click' | 'hover' | 'notification'): Promise<void> {
    const soundMap = {
      click: SoundType.BUTTON_CLICK,
      hover: SoundType.BUTTON_HOVER,
      notification: SoundType.NOTIFICATION
    };
    
    await this.playTone(soundMap[type]);
  }

  // 设置音量
  public setVolume(type: 'master' | 'effects' | 'tones', volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    switch (type) {
      case 'master':
        if (this.masterGain) {
          this.masterGain.gain.value = clampedVolume;
        }
        break;
      case 'effects':
        if (this.effectsGain) {
          this.effectsGain.gain.value = clampedVolume;
        }
        break;
      case 'tones':
        if (this.tonesGain) {
          this.tonesGain.gain.value = clampedVolume;
        }
        break;
    }
  }

  // 启用/禁用音效类型
  public toggleSoundType(type: 'effects' | 'tones', enabled: boolean): void {
    const soundTypes = type === 'effects' 
      ? [SoundType.CORRECT, SoundType.INCORRECT, SoundType.PERFECT, SoundType.COMBO, 
         SoundType.START, SoundType.PAUSE, SoundType.RESUME, SoundType.COMPLETE,
         SoundType.LEVEL_UP, SoundType.ACHIEVEMENT, SoundType.BUTTON_CLICK, 
         SoundType.BUTTON_HOVER, SoundType.NOTIFICATION]
      : [SoundType.TONE_C, SoundType.TONE_D, SoundType.TONE_E, SoundType.TONE_F,
         SoundType.TONE_G, SoundType.TONE_A, SoundType.TONE_B, SoundType.TONE_C_HIGH];
    
    soundTypes.forEach(soundType => {
      const config = this.soundConfigs.get(soundType);
      if (config) {
        config.enabled = enabled;
      }
    });
  }

  // 停止所有音效
  public stopAllSounds(): void {
    this.activeSounds.forEach(({ oscillator, gain }) => {
      try {
        oscillator.stop();
        gain.disconnect();
        oscillator.disconnect();
      } catch (error) {
        // 忽略已停止的音效
      }
    });
    this.activeSounds.clear();
  }

  // 销毁音频管理器
  public destroy(): void {
    this.stopAllSounds();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// React 组件
export const SoundEffectManagerComponent: React.FC<SoundEffectManagerProps> = ({
  masterVolume = 0.7,
  effectsVolume = 0.8,
  tonesVolume = 0.6,
  enableEffects = true,
  enableTones = true,
  onVolumeChange,
  onToggle
}) => {
  const [soundManager] = useState(() => new SoundEffectManager());
  const [isTestingEffects, setIsTestingEffects] = useState(false);
  const [isTestingTones, setIsTestingTones] = useState(false);
  
  // 初始化音量设置
  useEffect(() => {
    soundManager.setVolume('master', masterVolume);
    soundManager.setVolume('effects', effectsVolume);
    soundManager.setVolume('tones', tonesVolume);
    soundManager.toggleSoundType('effects', enableEffects);
    soundManager.toggleSoundType('tones', enableTones);
  }, [soundManager, masterVolume, effectsVolume, tonesVolume, enableEffects, enableTones]);

  // 清理
  useEffect(() => {
    return () => {
      soundManager.destroy();
    };
  }, [soundManager]);

  // 测试音效
  const testEffects = async () => {
    setIsTestingEffects(true);
    await soundManager.resumeAudioContext();
    
    await soundManager.playFeedback('correct');
    await new Promise(resolve => setTimeout(resolve, 200));
    await soundManager.playFeedback('perfect');
    await new Promise(resolve => setTimeout(resolve, 200));
    await soundManager.playSystem('levelUp');
    
    setIsTestingEffects(false);
  };

  // 测试音调
  const testTones = async () => {
    setIsTestingTones(true);
    await soundManager.resumeAudioContext();
    
    const tones = [SoundType.TONE_C, SoundType.TONE_E, SoundType.TONE_G, SoundType.TONE_C_HIGH];
    await soundManager.playToneSequence(tones, 300);
    
    setIsTestingTones(false);
  };

  // 音量滑块组件
  const VolumeSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon: React.ReactNode;
    color: string;
  }> = ({ label, value, onChange, icon, color }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-gray-200">{label}</span>
        </div>
        <span className="text-xs text-gray-400">{Math.round(value * 100)}%</span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 100}%, #374151 ${value * 100}%, #374151 100%)`
          }}
        />
        
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: ${color};
            cursor: pointer;
            box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 space-y-6"
    >
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">音效管理</h3>
      </div>

      {/* 主音量控制 */}
      <VolumeSlider
        label="主音量"
        value={masterVolume}
        onChange={(value) => {
          soundManager.setVolume('master', value);
          onVolumeChange?.('master', value);
        }}
        icon={<Volume2 className="w-4 h-4 text-purple-400" />}
        color="#8b5cf6"
      />

      {/* 音效控制 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="font-medium text-gray-200">音效反馈</span>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={testEffects}
              disabled={isTestingEffects || !enableEffects}
              className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs rounded-lg transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isTestingEffects ? '测试中...' : '测试'}
            </motion.button>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableEffects}
                onChange={(e) => {
                  soundManager.toggleSoundType('effects', e.target.checked);
                  onToggle?.('effects', e.target.checked);
                }}
                className="sr-only"
              />
              <div className={`relative w-10 h-5 rounded-full transition-colors ${
                enableEffects ? 'bg-cyan-500' : 'bg-gray-600'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  enableEffects ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </label>
          </div>
        </div>
        
        {enableEffects && (
          <VolumeSlider
            label="音效音量"
            value={effectsVolume}
            onChange={(value) => {
              soundManager.setVolume('effects', value);
              onVolumeChange?.('effects', value);
            }}
            icon={<Zap className="w-4 h-4 text-cyan-400" />}
            color="#06b6d4"
          />
        )}
      </div>

      {/* 音调控制 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-pink-400" />
            <span className="font-medium text-gray-200">训练音调</span>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={testTones}
              disabled={isTestingTones || !enableTones}
              className="px-3 py-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 text-xs rounded-lg transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isTestingTones ? '测试中...' : '测试'}
            </motion.button>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableTones}
                onChange={(e) => {
                  soundManager.toggleSoundType('tones', e.target.checked);
                  onToggle?.('tones', e.target.checked);
                }}
                className="sr-only"
              />
              <div className={`relative w-10 h-5 rounded-full transition-colors ${
                enableTones ? 'bg-pink-500' : 'bg-gray-600'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  enableTones ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </label>
          </div>
        </div>
        
        {enableTones && (
          <VolumeSlider
            label="音调音量"
            value={tonesVolume}
            onChange={(value) => {
              soundManager.setVolume('tones', value);
              onVolumeChange?.('tones', value);
            }}
            icon={<Target className="w-4 h-4 text-pink-400" />}
            color="#ec4899"
          />
        )}
      </div>

      {/* 音效说明 */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-purple-500/20 rounded">
            <Volume2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-200 font-medium">音效说明</p>
            <div className="space-y-1 text-gray-400">
              <p>• <span className="text-cyan-400">音效反馈</span>：正确/错误提示、连击、升级等反馈音效</p>
              <p>• <span className="text-pink-400">训练音调</span>：n-back训练中的听觉刺激音调</p>
              <p>• 首次播放音效需要用户交互来激活音频上下文</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SoundEffectManagerComponent;
export { SoundType };
export type { SoundConfig, ToneConfig };