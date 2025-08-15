import { useState, useEffect, useCallback, useRef } from 'react';
import AudioManager, { AudioOptions, AudioState } from '../utils/AudioManager';

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
  const audioManager = useRef(AudioManager.getInstance());

  // Initialize global settings
  useEffect(() => {
    const settings = audioManager.current.getGlobalSettings();
    setGlobalVolumeState(settings.volume);
    setIsMutedState(settings.isMuted);
  }, []);

  // Play audio
  const play = useCallback(async (src: string, options?: AudioOptions): Promise<void> => {
    setIsLoading(true);
    try {
      await audioManager.current.play(src, options);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stop audio
  const stop = useCallback(async (src: string, fadeOut?: number): Promise<void> => {
    await audioManager.current.stop(src, fadeOut);
  }, []);

  // Pause audio
  const pause = useCallback((src: string): void => {
    audioManager.current.pause(src);
  }, []);

  // Resume audio
  const resume = useCallback(async (src: string): Promise<void> => {
    await audioManager.current.resume(src);
  }, []);

  // Set volume for specific audio
  const setVolume = useCallback((src: string, volume: number): void => {
    audioManager.current.setVolume(src, volume);
  }, []);

  // Preload single audio
  const preload = useCallback(async (src: string): Promise<void> => {
    setIsLoading(true);
    try {
      await audioManager.current.preload(src);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Preload multiple audio files
  const preloadBatch = useCallback(async (sources: string[]): Promise<void> => {
    setIsLoading(true);
    try {
      await audioManager.current.preloadBatch(sources);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get audio state
  const getState = useCallback((src: string): AudioState | null => {
    return audioManager.current.getState(src);
  }, []);

  // Check if audio is cached
  const isCached = useCallback((src: string): boolean => {
    return audioManager.current.isCached(src);
  }, []);

  // Set global volume
  const setGlobalVolume = useCallback((volume: number): void => {
    audioManager.current.setGlobalVolume(volume);
    setGlobalVolumeState(volume);
  }, []);

  // Set muted state
  const setMuted = useCallback((muted: boolean): void => {
    audioManager.current.setMuted(muted);
    setIsMutedState(muted);
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