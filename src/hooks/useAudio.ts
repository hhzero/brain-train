import { useState, useEffect, useCallback, useRef } from 'react';
import audioManager from '../utils/AudioManager';

// 定义本地类型
interface AudioOptions {
  loop?: boolean;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
}

interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

interface UseAudioReturn {
  play: (src: string, options?: AudioOptions) => Promise<void>;
  stop: (src: string, fadeOut?: number) => Promise<void>;
  pause: (src: string) => void;
  resume: (src: string) => Promise<void>;
  setVolume: (src: string, volume: number) => void;
  preload: (src: string) => Promise<void>;
  preloadBatch: (sources: string[]) => Promise<void>;
  getState: (src: string) => AudioState | null;
  isCached: (src: string) => boolean;
  globalVolume: number;
  setGlobalVolume: (volume: number) => void;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  isLoading: boolean;
}

const useAudio = (): UseAudioReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [globalVolume, setGlobalVolumeState] = useState(1);
  const [isMuted, setIsMutedState] = useState(false);
  const audioManagerRef = useRef(audioManager);

  // Initialize global settings
  useEffect(() => {
    // AudioManager暂不支持getGlobalSettings方法
    const settings = { volume: 1, muted: false };
    setGlobalVolumeState(settings.volume);
    setIsMutedState(settings.muted);
  }, []);

  // Play audio
  const play = useCallback(async (src: string, options?: AudioOptions): Promise<void> => {
    setIsLoading(true);
    try {
      // 使用playTone方法播放音频（临时实现）
      await audioManagerRef.current.playTone(440, 500, options?.volume || 0.3);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stop audio
  const stop = useCallback(async (src: string, fadeOut?: number): Promise<void> => {
    // AudioManager暂不支持stop方法
    console.warn('AudioManager does not support stop method');
  }, []);

  // Pause audio
  const pause = useCallback((src: string): void => {
    // AudioManager暂不支持pause方法
    console.warn('AudioManager does not support pause method');
  }, []);

  // Resume audio
  const resume = useCallback(async (src: string): Promise<void> => {
    // AudioManager暂不支持resume方法
    console.warn('AudioManager does not support resume method');
  }, []);

  // Set volume for specific audio
  const setVolume = useCallback((src: string, volume: number): void => {
    // AudioManager暂不支持setVolume方法
    console.warn('AudioManager does not support setVolume method');
  }, []);

  // Preload single audio
  const preload = useCallback(async (src: string): Promise<void> => {
    setIsLoading(true);
    try {
      // AudioManager暂不支持preload方法
      console.warn('AudioManager does not support preload method');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Preload multiple audio files
  const preloadBatch = useCallback(async (sources: string[]): Promise<void> => {
    setIsLoading(true);
    try {
      // AudioManager暂不支持preloadBatch方法
      console.warn('AudioManager does not support preloadBatch method');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get audio state
  const getState = useCallback((src: string): AudioState | null => {
    // 返回模拟的AudioState对象
    return {
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      duration: 0,
      volume: 1
    };
  }, []);

  // Check if audio is cached
  const isCached = useCallback((src: string): boolean => {
    // AudioManager 使用内部缓存，这里返回 false 表示不支持外部缓存检查
    return false;
  }, []);

  // Set global volume
  const setGlobalVolume = useCallback((volume: number): void => {
    // AudioManager 不支持全局音量设置，这里为空实现
    console.warn('AudioManager 不支持全局音量设置');
  }, []);

  // Set muted state
  const setMuted = useCallback((muted: boolean): void => {
    // AudioManager 不支持静音设置，这里为空实现
    console.warn('AudioManager 不支持静音设置');
  }, []);

  return {
    play,
    stop,
    pause,
    resume,
    setVolume,
    preload,
    preloadBatch,
    getState,
    isCached,
    globalVolume,
    setGlobalVolume,
    isMuted,
    setMuted,
    isLoading,
  };
};

export default useAudio;