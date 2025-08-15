'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';
import useAudio from '../../../hooks/useAudio';
import { AudioOptions } from '../../../utils/AudioManager';

interface AudioPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
  showControls?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}

const AudioPlayer = memo<AudioPlayerProps>(function AudioPlayer({
  src,
  title,
  autoPlay,
  loop,
  volume,
  showControls,
  className,
  onPlay,
  onPause,
  onStop,
}: AudioPlayerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { play, stop, pause, resume, setVolume, preload, getState, isLoading } = useAudio();
  const t = useTranslations('audio');

  const audioState = getState(src);
  const isPlaying = audioState?.isPlaying || false;
  const isPaused = audioState?.isPaused || false;
  const currentTime = audioState?.currentTime || 0;
  const duration = audioState?.duration || 0;

  // Handle play
  const handlePlay = useCallback(async () => {
    try {
      const options: AudioOptions = {
        volume,
        loop,
        fadeIn: 500,
      };

      if (isPaused) {
        await resume(src);
      } else {
        await play(src, options);
      }
      
      onPlay?.();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }, [src, volume, loop, isPaused, resume, play, onPlay]);

  // Initialize audio
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await preload(src);
        // 确保volume有值时才设置音量
        if (typeof volume === 'number') {
          setVolume(src, volume);
        }
        setIsInitialized(true);

        if (autoPlay) {
          const options: AudioOptions = {
            volume,
            loop,
            fadeIn: 500,
          };
          await play(src, options);
          onPlay?.();
        }
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initializeAudio();
  }, [src, volume, autoPlay, loop, preload, setVolume, play, onPlay]);

  // 组件卸载时清理音频资源
  useEffect(() => {
    return () => {
      if (audioState?.isPlaying) {
        stop(src);
      }
    };
  }, [src, audioState?.isPlaying, stop]);

  // 监听播放状态变化 - 移除此useEffect以避免循环依赖
  // useEffect(() => {
  //   if (isPlaying && audioState && !audioState.isPlaying) {
  //     handlePlay();
  //   }
  // }, [isPlaying, audioState?.isPlaying, handlePlay]);

  // Handle pause
  const handlePause = () => {
    pause(src);
    onPause?.();
  };

  // Handle stop
  const handleStop = async () => {
    await stop(src, 300);
    onStop?.();
  };

  // Format time
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!showControls) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        {/* Stop Button */}
        <button
          onClick={handleStop}
          disabled={!isInitialized || (!isPlaying && !isPaused)}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t('stop')}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <rect x="6" y="6" width="8" height="8" />
          </svg>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={!isInitialized || isLoading}
          className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={isPlaying ? t('pause') : t('play')}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <rect x="6" y="4" width="2" height="12" />
              <rect x="12" y="4" width="2" height="12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5-8-5z" />
            </svg>
          )}
        </button>

        {/* Loop Toggle */}
        <button
          onClick={() => {
            // This would need to be implemented in the audio manager
            // For now, it's just a visual indicator
          }}
          className={`p-2 rounded-full transition-colors ${
            loop
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={t('loop')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Status */}
      {!isInitialized && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          {t('loading')}
        </div>
      )}
    </div>
  );
});

export default AudioPlayer;