'use client'

import { useState, useEffect, useRef } from 'react';
import { IoPlay, IoPause, IoPlayBack, IoPlayForward, IoVolumeMute, IoVolumeHigh, IoContract, IoMusicalNotes } from 'react-icons/io5';

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

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // 初始化音频
  useEffect(() => {
    // 创建新的音频对象
    audioRef.current = new Audio(musicList[currentTrack].src);
    
    // 添加事件监听器
    const handleEnded = () => {
      console.log("音乐播放结束，准备播放下一曲");
      // 使用setCurrentTrack直接切换到下一曲，避免调用next函数造成循环
      setCurrentTrack((prev) => (prev + 1) % musicList.length);
      setIsPlaying(true);
      // 在下一个周期播放音频
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error("自动播放失败:", err);
          });
        }
      }, 0);
    };
    
    // 添加ended事件监听
    audioRef.current.addEventListener('ended', handleEnded);
    
    // 如果当前状态是播放状态，则自动播放该曲目
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("自动播放失败:", err);
      });
    }
    
    // 清理函数
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentTrack, isPlaying]); // 添加isPlaying作为依赖项
  
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
    // 在下一个渲染周期自动播放
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 0);
  };
  
  // 上一曲
  const prev = () => {
    setCurrentTrack((prev) => (prev - 1 + musicList.length) % musicList.length);
    // 在下一个渲染周期自动播放
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }, 0);
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