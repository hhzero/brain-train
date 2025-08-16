'use client'

import { useState, useEffect, useRef, memo } from 'react';
import { IoPlay, IoPause, IoPlayBack, IoPlayForward, IoVolumeMute, IoVolumeHigh, IoContract, IoMusicalNotes } from 'react-icons/io5';
import audioManager from '../../../utils/AudioManager';

// 音乐列表
const musicList = [
  {
    title: '',
    artist: '',
    src: '/music/ClassicalArtists-D.ogg'
  },
  {
    title: '',
    artist: '',
    src: '/music/ClassicalArtists-G.ogg'
  },
  {
    title: '',
    artist: '',
    src: '/music/Concerto.ogg'
  },
  {
    title: '',
    artist: '',
    src: '/music/dreams.flac'
  },
  {
    title: '',
    artist: '',
    src: '/music/hires.flac'
  },
  {
    title: '',
    artist: '',
    src: '/music/TenderPassion.ogg'
  },
];

/**
 * 音乐播放器组件 - 使用优化的AudioManager进行音频管理
 */
const MusicPlayer = memo(function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const currentSrcRef = useRef<string>('');
  const isInitializedRef = useRef(false);
  
  // 初始化音频管理器和预加载音频资源
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        setIsLoading(true);
        
        // 停止当前播放的音频（AudioManager暂不支持stop方法）
        if (currentSrcRef.current) {
          console.warn('AudioManager.stop method not implemented');
        }
        
        // 更新当前音频源
        const newSrc = musicList[currentTrack].src;
        currentSrcRef.current = newSrc;
        
        // 预加载新音频（AudioManager暂不支持preload方法）
        console.warn('AudioManager.preload method not implemented');
        
        // 设置音量和静音状态（AudioManager暂不支持这些方法）
        console.warn('AudioManager.setVolume method not implemented');
        console.warn('AudioManager.setMuted method not implemented');
        
        isInitializedRef.current = true;
        setIsLoading(false);
        
        console.log(`音频初始化完成: ${musicList[currentTrack].title || newSrc}`);
      } catch (error) {
        console.error('音频初始化失败:', error);
        setIsLoading(false);
        setIsPlaying(false);
      }
    };
    
    initializeAudio();
    
    // 清理函数
    return () => {
      if (currentSrcRef.current) {
        console.warn('AudioManager.stop method not implemented');
      }
    };
  }, [currentTrack, volume, isMuted]); // 依赖currentTrack、volume和isMuted
  
  // 处理播放状态变化（独立的useEffect）
  useEffect(() => {
    const handlePlayStateChange = async () => {
      if (!isInitializedRef.current || !currentSrcRef.current) return;
      
      try {
        if (isPlaying) {
          // AudioManager暂不支持play方法
          console.warn('AudioManager.play method not implemented');
          console.log('音频播放开始');
        } else {
          // AudioManager暂不支持pause方法
          console.warn('AudioManager.pause method not implemented');
          console.log('音频播放暂停');
        }
      } catch (error) {
        console.error('播放状态切换失败:', error);
        setIsPlaying(false);
      }
    };
    
    handlePlayStateChange();
  }, [isPlaying, volume]);
  
  // 播放/暂停切换
  const togglePlayPause = () => {
    if (!isInitializedRef.current || isLoading) return;
    setIsPlaying(!isPlaying);
  };
  
  // 下一曲
  const next = () => {
    if (isLoading) return;
    setCurrentTrack((prev) => (prev + 1) % musicList.length);
    setIsPlaying(true); // 切换曲目后自动播放
  };
  
  // 上一曲
  const prev = () => {
    if (isLoading) return;
    setCurrentTrack((prev) => (prev - 1 + musicList.length) % musicList.length);
    setIsPlaying(true); // 切换曲目后自动播放
  };
  
  // 切换静音状态
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    // AudioManager暂不支持setMuted方法
    console.warn('AudioManager.setMuted method not implemented');
  };
  
  // 音量控制
  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (currentSrcRef.current) {
      // AudioManager暂不支持setVolume方法
      console.warn('AudioManager.setVolume method not implemented');
    }
  };
  
  // 批量预加载所有音频文件（组件挂载时执行）
  useEffect(() => {
    const preloadAllMusic = async () => {
      try {
        const allSources = musicList.map(music => music.src);
        // AudioManager暂不支持preloadBatch方法
        console.warn('AudioManager.preloadBatch method not implemented');
        console.log('所有音频文件预加载完成');
      } catch (error) {
        console.error('批量预加载音频失败:', error);
      }
    };
    
    preloadAllMusic();
    
    // 组件卸载时清理音频资源
    return () => {
      if (currentSrcRef.current) {
        console.warn('AudioManager.stop method not implemented');
      }
    };
  }, []); // 只在组件挂载时执行一次
  
  // 监听音频播放结束事件
  useEffect(() => {
    const checkAudioState = () => {
      if (!currentSrcRef.current) return;
      
      // AudioManager暂不支持音频状态检查，暂时禁用自动播放下一曲功能
      console.warn('AudioManager audio state checking not implemented');
      // TODO: 实现音频播放结束检测逻辑
    };
    
    const interval = setInterval(checkAudioState, 1000); // 每秒检查一次
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);
  
  // 只切换显示/隐藏状态
  const toggleVisible = () => {
    setIsVisible(!isVisible);
  };
  
  // 点击外部音乐图标时，只显示播放器而不自动播放音乐
  const showPlayer = () => {
    setIsVisible(true);
  };
  
  return (
    <>
      {isVisible ? (
        <div
          className="fixed bottom-4 right-4 z-50 flex 
                    rounded-lg items-center shadow-lg p-4 
                    bg-transparent backdrop-blur-sm"
        >
          <div className="mr-4">
            <div className="text-white font-semibold">{musicList[currentTrack].title}</div>
            <div className="text-gray-300 text-sm">{musicList[currentTrack].artist}</div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={prev}
              disabled={isLoading}
              className="text-gray-400/70 hover:text-white p-2 rounded-full music-button-star disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <IoPlayBack size={20} />
            </button>
            <button
              onClick={togglePlayPause}
              disabled={!isInitializedRef.current || isLoading}
              className="text-gray-400/70 hover:text-white p-2 rounded-full music-button-star disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <IoPause size={20} />
              ) : (
                <IoPlay size={20} />
              )}
            </button>
            <button
              onClick={next}
              disabled={isLoading}
              className="text-gray-400/70 hover:text-white p-2 rounded-full music-button-star disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <IoPlayForward size={20} />
            </button>
            <button
              onClick={toggleMute}
              disabled={!isInitializedRef.current}
              className="text-gray-400/70 hover:text-white p-2 rounded-full music-button-star disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isMuted ? <IoVolumeMute size={20} /> : <IoVolumeHigh size={20} />}
            </button>
            <button
              onClick={toggleVisible}
              className="text-gray-400/70 hover:text-white p-2 rounded-full music-button-star"
            >
              <IoContract size={20} />
            </button>
          </div>
          
          {/* 音量控制滑块 */}
          <div className="flex items-center space-x-2 mt-2">
            <IoVolumeHigh size={16} className="text-gray-400/70" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                if (newVolume === 0) {
                  setIsMuted(true);
                  // AudioManager暂不支持setMuted方法
                  console.warn('AudioManager.setMuted method not implemented');
                } else {
                  if (isMuted) {
                    setIsMuted(false);
                    // AudioManager暂不支持setMuted方法
                    console.warn('AudioManager.setMuted method not implemented');
                  }
                  handleVolumeChange(newVolume);
                }
              }}
              disabled={!isInitializedRef.current}
              className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
              }}
            />
            <span className="text-xs text-gray-400/70 w-8 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      ) : (
        <div
          className="fixed bottom-8 right-8 z-50
                    bg-transparent backdrop-blur-sm 
                    rounded-full p-2 shadow cursor-pointer"
          onClick={showPlayer}
        >
          <IoMusicalNotes
            size={22}
            className="text-gray-400/70 hover:text-white music-button-star"
          />
        </div>
      )}
    </>
  );
});

export default MusicPlayer;