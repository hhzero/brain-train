'use client'

import { useState, useEffect, useRef } from 'react';
import { IoPlay, IoPause, IoPlayBack, IoPlayForward, IoVolumeMute, IoVolumeHigh, IoContract, IoMusicalNotes } from 'react-icons/io5';

// 音乐列表
const musicList = [
  {
    title: '梦想起航',
    artist: '未来之星',
    src: '/music/bah1.mp3'
  },
  {
    title: '思维探索',
    artist: '脑力天才',
    src: '/music/track2.mp3'
  },
  {
    title: '知识海洋',
    artist: '学习达人',
    src: '/music/track3.mp3'
  }
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // 初始化音频
  useEffect(() => {
    audioRef.current = new Audio(musicList[currentTrack].src);
    
    // 添加事件监听器
    const handleEnded = () => {
      next();
    };
    
    audioRef.current.addEventListener('ended', handleEnded);
    
    // 清理函数
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentTrack]);
  
  // 播放/暂停切换
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // 下一曲
  const next = () => {
    setCurrentTrack((prev) => (prev + 1) % musicList.length);
  };
  
  // 上一曲
  const prev = () => {
    setCurrentTrack((prev) => (prev - 1 + musicList.length) % musicList.length);
  };
  
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
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
              className="text-gray-400/70 hover:text-white p-2 rounded-full music-button-star"
            >
              <IoPlayBack size={20} />
            </button>
            <button
              onClick={togglePlayPause}
              className="text-gray-400/70 hover:text-white p-2 rounded-full music-button-star"
            >
              {isPlaying ? <IoPause size={20} /> : <IoPlay size={20} />}
            </button>
            <button
              onClick={next}
              className="text-gray-400/70 hover:text-white p-2 rounded-full music-button-star"
            >
              <IoPlayForward size={20} />
            </button>
            <button
              onClick={toggleMute}
              className="text-gray-400/70 hover:text-white p-2 rounded-full music-button-star"
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
} 