'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Settings,
  Headphones,
  Zap,
  CheckCircle
} from 'lucide-react';
import NBackAudioManager from '../utils/NBackAudioManager';
import { SoundEffectManager } from './SoundEffectManager';

// 音频测试面板组件
interface AudioTestPanelProps {
  onClose: () => void;
  audioManager?: NBackAudioManager;
  soundManager?: SoundEffectManager;
}

// 音调测试配置
const TONE_TESTS = [
  { frequency: 440, name: 'A4 (标准音)', color: 'bg-blue-500' },
  { frequency: 523, name: 'C5 (高音)', color: 'bg-green-500' },
  { frequency: 349, name: 'F4 (中音)', color: 'bg-yellow-500' },
  { frequency: 262, name: 'C4 (低音)', color: 'bg-red-500' },
  { frequency: 659, name: 'E5 (超高音)', color: 'bg-purple-500' },
  { frequency: 196, name: 'G3 (超低音)', color: 'bg-pink-500' },
  { frequency: 880, name: 'A5 (倍频)', color: 'bg-cyan-500' },
  { frequency: 1047, name: 'C6 (极高音)', color: 'bg-indigo-500' }
];

// 音效测试配置
const EFFECT_TESTS = [
  { type: 'correct', name: '正确反馈', icon: CheckCircle, color: 'text-green-400' },
  { type: 'incorrect', name: '错误反馈', icon: VolumeX, color: 'text-red-400' },
  { type: 'perfect', name: '完美反馈', icon: Zap, color: 'text-yellow-400' },
  { type: 'combo', name: '连击反馈', icon: Zap, color: 'text-purple-400' },
  { type: 'start', name: '开始音效', icon: Play, color: 'text-blue-400' },
  { type: 'pause', name: '暂停音效', icon: Pause, color: 'text-orange-400' },
  { type: 'complete', name: '完成音效', icon: CheckCircle, color: 'text-cyan-400' },
  { type: 'beat', name: '节拍音效', icon: Headphones, color: 'text-pink-400' }
];

export function AudioTestPanel({ onClose, audioManager, soundManager }: AudioTestPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  const localAudioManager = useRef<NBackAudioManager | null>(null);
  const localSoundManager = useRef<SoundEffectManager | null>(null);
  
  // 初始化音频管理器
  useEffect(() => {
    const initAudio = async () => {
      try {
        if (!audioManager) {
          localAudioManager.current = NBackAudioManager.getInstance();
          await localAudioManager.current.initialize();
        }
        
        if (!soundManager) {
          localSoundManager.current = new SoundEffectManager();
        }
        
        setAudioInitialized(true);
      } catch (error) {
        console.error('音频初始化失败:', error);
      }
    };
    
    initAudio();
    
    return () => {
      if (localAudioManager.current) {
        localAudioManager.current.dispose();
      }
      if (localSoundManager.current) {
        localSoundManager.current.destroy();
      }
    };
  }, [audioManager, soundManager]);
  
  // 获取音频管理器实例
  const getAudioManager = () => audioManager || localAudioManager.current;
  const getSoundManager = () => soundManager || localSoundManager.current;
  
  // 播放音调测试
  const playToneTest = async (frequency: number, testId: string) => {
    const manager = getAudioManager();
    if (!manager) return;
    
    try {
      setCurrentTest(testId);
      setIsPlaying(true);
      
      await manager.playTone(frequency, 1000); // 播放1秒
      
      setTestResults(prev => ({ ...prev, [testId]: true }));
      
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentTest(null);
      }, 1000);
    } catch (error) {
      console.error('音调播放失败:', error);
      setTestResults(prev => ({ ...prev, [testId]: false }));
      setIsPlaying(false);
      setCurrentTest(null);
    }
  };
  
  // 播放音效测试
  const playEffectTest = async (effectType: string, testId: string) => {
    const manager = getSoundManager();
    if (!manager) return;
    
    try {
      setCurrentTest(testId);
      setIsPlaying(true);
      
      if (['correct', 'incorrect', 'perfect', 'combo'].includes(effectType)) {
        await manager.playFeedback(effectType as any);
      } else {
        await manager.playSystem(effectType as any);
      }
      
      setTestResults(prev => ({ ...prev, [testId]: true }));
      
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentTest(null);
      }, 500);
    } catch (error) {
      console.error('音效播放失败:', error);
      setTestResults(prev => ({ ...prev, [testId]: false }));
      setIsPlaying(false);
      setCurrentTest(null);
    }
  };
  
  // 播放音调序列测试
  const playSequenceTest = async () => {
    const manager = getAudioManager();
    if (!manager || isPlaying) return;
    
    setIsPlaying(true);
    setCurrentTest('sequence');
    
    try {
      const sequence = [440, 523, 349, 262]; // A4, C5, F4, C4
      
      for (let i = 0; i < sequence.length; i++) {
        await manager.playTone(sequence[i], 300);
        await new Promise(resolve => setTimeout(resolve, 100)); // 间隔100ms
      }
      
      setTestResults(prev => ({ ...prev, sequence: true }));
    } catch (error) {
      console.error('序列播放失败:', error);
      setTestResults(prev => ({ ...prev, sequence: false }));
    } finally {
      setIsPlaying(false);
      setCurrentTest(null);
    }
  };
  
  // 重置测试结果
  const resetTests = () => {
    setTestResults({});
    setCurrentTest(null);
    setIsPlaying(false);
  };
  
  // 获取测试状态图标
  const getTestStatusIcon = (testId: string) => {
    if (currentTest === testId) {
      return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;
    }
    
    if (testResults[testId] === true) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    
    if (testResults[testId] === false) {
      return <VolumeX className="w-4 h-4 text-red-400" />;
    }
    
    return <Play className="w-4 h-4 text-gray-400" />;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">音频系统测试</h2>
              <p className="text-gray-400">测试音调播放和音效反馈功能</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              onClick={resetTests}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              关闭
            </motion.button>
          </div>
        </div>
        
        {/* 音频状态 */}
        <div className="mb-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">音频状态</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              audioInitialized ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {audioInitialized ? '已初始化' : '未初始化'}
            </div>
          </div>
          
          {/* 音量控制 */}
          <div className="flex items-center gap-4">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-400 w-12">{Math.round(volume * 100)}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 音调测试 */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              音调测试
            </h3>
            
            <div className="space-y-3 mb-6">
              {TONE_TESTS.map((tone, index) => {
                const testId = `tone-${tone.frequency}`;
                return (
                  <motion.button
                    key={tone.frequency}
                    onClick={() => playToneTest(tone.frequency, testId)}
                    disabled={isPlaying}
                    className={`w-full p-4 rounded-xl border transition-all duration-200 ${
                      currentTest === testId
                        ? 'bg-purple-600/30 border-purple-500'
                        : testResults[testId] === true
                        ? 'bg-green-600/20 border-green-500/50'
                        : testResults[testId] === false
                        ? 'bg-red-600/20 border-red-500/50'
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50'
                    } disabled:opacity-50`}
                    whileHover={{ scale: isPlaying ? 1 : 1.02 }}
                    whileTap={{ scale: isPlaying ? 1 : 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${tone.color}`} />
                        <div className="text-left">
                          <div className="text-white font-medium">{tone.name}</div>
                          <div className="text-gray-400 text-sm">{tone.frequency} Hz</div>
                        </div>
                      </div>
                      {getTestStatusIcon(testId)}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            {/* 序列测试 */}
            <motion.button
              onClick={playSequenceTest}
              disabled={isPlaying}
              className={`w-full p-4 rounded-xl border transition-all duration-200 ${
                currentTest === 'sequence'
                  ? 'bg-cyan-600/30 border-cyan-500'
                  : testResults.sequence === true
                  ? 'bg-green-600/20 border-green-500/50'
                  : testResults.sequence === false
                  ? 'bg-red-600/20 border-red-500/50'
                  : 'bg-gray-800/50 border-gray-700/50 hover:border-cyan-500/50'
              } disabled:opacity-50`}
              whileHover={{ scale: isPlaying ? 1 : 1.02 }}
              whileTap={{ scale: isPlaying ? 1 : 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <div className="text-left">
                    <div className="text-white font-medium">音调序列测试</div>
                    <div className="text-gray-400 text-sm">播放4个连续音调</div>
                  </div>
                </div>
                {getTestStatusIcon('sequence')}
              </div>
            </motion.button>
          </div>
          
          {/* 音效测试 */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-pink-400" />
              音效测试
            </h3>
            
            <div className="space-y-3">
              {EFFECT_TESTS.map((effect) => {
                const testId = `effect-${effect.type}`;
                const IconComponent = effect.icon;
                
                return (
                  <motion.button
                    key={effect.type}
                    onClick={() => playEffectTest(effect.type, testId)}
                    disabled={isPlaying}
                    className={`w-full p-4 rounded-xl border transition-all duration-200 ${
                      currentTest === testId
                        ? 'bg-pink-600/30 border-pink-500'
                        : testResults[testId] === true
                        ? 'bg-green-600/20 border-green-500/50'
                        : testResults[testId] === false
                        ? 'bg-red-600/20 border-red-500/50'
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-pink-500/50'
                    } disabled:opacity-50`}
                    whileHover={{ scale: isPlaying ? 1 : 1.02 }}
                    whileTap={{ scale: isPlaying ? 1 : 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${effect.color}`} />
                        <div className="text-left">
                          <div className="text-white font-medium">{effect.name}</div>
                          <div className="text-gray-400 text-sm">{effect.type}</div>
                        </div>
                      </div>
                      {getTestStatusIcon(testId)}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* 测试统计 */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-3">测试统计</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {Object.values(testResults).filter(result => result === true).length}
              </div>
              <div className="text-sm text-gray-400">成功</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {Object.values(testResults).filter(result => result === false).length}
              </div>
              <div className="text-sm text-gray-400">失败</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {Object.keys(testResults).length}
              </div>
              <div className="text-sm text-gray-400">总计</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}