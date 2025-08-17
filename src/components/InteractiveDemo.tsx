'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Eye, 
  Ear, 
  Brain,
  Zap,
  CheckCircle,
  X,
  ArrowRight,
  Lightbulb,
  Target,
  Timer,
  TrendingUp
} from 'lucide-react';

// 演示步骤类型
interface DemoStep {
  id: string;
  type: 'visual' | 'audio' | 'dual' | 'explanation';
  position?: number; // 视觉位置 (0-8)
  tone?: 'low' | 'high'; // 音调
  isMatch?: boolean; // 是否匹配
  explanation?: string;
  duration?: number; // 持续时间（毫秒）
}

// 预定义的演示序列
const DEMO_SEQUENCES = {
  '1-back-visual': [
    { id: '1', type: 'explanation', explanation: '1-Back 视觉训练演示：记住1步前的位置', duration: 2000 },
    { id: '2', type: 'visual', position: 4, explanation: '第1步：中心位置亮起', duration: 1500 },
    { id: '3', type: 'visual', position: 1, explanation: '第2步：左上角亮起', duration: 1500 },
    { id: '4', type: 'visual', position: 4, isMatch: true, explanation: '第3步：中心位置再次亮起 - 与1步前匹配！', duration: 1500 },
    { id: '5', type: 'visual', position: 7, explanation: '第4步：右下角亮起', duration: 1500 },
    { id: '6', type: 'visual', position: 1, isMatch: true, explanation: '第5步：左上角再次亮起 - 与1步前匹配！', duration: 1500 }
  ] as DemoStep[],
  
  '2-back-visual': [
    { id: '1', type: 'explanation', explanation: '2-Back 视觉训练演示：记住2步前的位置', duration: 2000 },
    { id: '2', type: 'visual', position: 4, explanation: '第1步：中心位置亮起', duration: 1500 },
    { id: '3', type: 'visual', position: 1, explanation: '第2步：左上角亮起', duration: 1500 },
    { id: '4', type: 'visual', position: 4, isMatch: true, explanation: '第3步：中心位置再次亮起 - 与2步前匹配！', duration: 1500 },
    { id: '5', type: 'visual', position: 7, explanation: '第4步：右下角亮起', duration: 1500 },
    { id: '6', type: 'visual', position: 1, isMatch: true, explanation: '第5步：左上角再次亮起 - 与2步前匹配！', duration: 1500 },
    { id: '7', type: 'visual', position: 2, explanation: '第6步：上方中心亮起', duration: 1500 }
  ] as DemoStep[],
  
  '1-back-audio': [
    { id: '1', type: 'explanation', explanation: '1-Back 听觉训练演示：记住1步前的音调', duration: 2000 },
    { id: '2', type: 'audio', tone: 'low', explanation: '第1步：播放低音调', duration: 1500 },
    { id: '3', type: 'audio', tone: 'high', explanation: '第2步：播放高音调', duration: 1500 },
    { id: '4', type: 'audio', tone: 'low', isMatch: true, explanation: '第3步：播放低音调 - 与1步前匹配！', duration: 1500 },
    { id: '5', type: 'audio', tone: 'high', isMatch: true, explanation: '第4步：播放高音调 - 与1步前匹配！', duration: 1500 },
    { id: '6', type: 'audio', tone: 'low', explanation: '第5步：播放低音调', duration: 1500 }
  ] as DemoStep[],
  
  'dual-nback': [
    { id: '1', type: 'explanation', explanation: '双重 N-Back 演示：同时记住视觉位置和听觉音调', duration: 2000 },
    { id: '2', type: 'dual', position: 4, tone: 'low', explanation: '第1步：中心位置 + 低音调', duration: 1500 },
    { id: '3', type: 'dual', position: 1, tone: 'high', explanation: '第2步：左上角 + 高音调', duration: 1500 },
    { id: '4', type: 'dual', position: 4, tone: 'low', isMatch: true, explanation: '第3步：中心位置 + 低音调 - 双重匹配！', duration: 1500 },
    { id: '5', type: 'dual', position: 7, tone: 'high', explanation: '第4步：右下角 + 高音调', duration: 1500 },
    { id: '6', type: 'dual', position: 1, tone: 'low', explanation: '第5步：左上角 + 低音调 - 视觉匹配！', duration: 1500 }
  ] as DemoStep[]
};

// 交互式演示组件属性
interface InteractiveDemoProps {
  sequence?: keyof typeof DEMO_SEQUENCES;
  autoPlay?: boolean;
  showControls?: boolean;
  onComplete?: () => void;
  className?: string;
}

// 交互式演示组件
export function InteractiveDemo({
  sequence = '1-back-visual',
  autoPlay = false,
  showControls = true,
  onComplete,
  className
}: InteractiveDemoProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isCompleted, setIsCompleted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [highlightedPosition, setHighlightedPosition] = useState<number | null>(null);
  const [currentTone, setCurrentTone] = useState<'low' | 'high' | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const steps = DEMO_SEQUENCES[sequence];
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  
  // 初始化音频上下文
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // 播放音调
  const playTone = (tone: 'low' | 'high') => {
    if (!audioEnabled || !audioContextRef.current) return;
    
    const frequency = tone === 'low' ? 440 : 880;
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.5);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.5);
  };
  
  // 执行当前步骤
  useEffect(() => {
    if (!isPlaying || !currentStep) return;
    
    // 清除之前的状态
    setHighlightedPosition(null);
    setCurrentTone(null);
    setShowMatch(false);
    
    // 执行步骤
    if (currentStep.type === 'visual' || currentStep.type === 'dual') {
      setHighlightedPosition(currentStep.position || null);
    }
    
    if (currentStep.type === 'audio' || currentStep.type === 'dual') {
      if (currentStep.tone) {
        setCurrentTone(currentStep.tone);
        playTone(currentStep.tone);
      }
    }
    
    if (currentStep.isMatch) {
      setShowMatch(true);
    }
    
    // 设置下一步的定时器
    timeoutRef.current = setTimeout(() => {
      if (isLastStep) {
        setIsCompleted(true);
        setIsPlaying(false);
        onComplete?.();
      } else {
        setCurrentStepIndex(prev => prev + 1);
      }
    }, currentStep.duration || 1500);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStepIndex, isPlaying, currentStep, isLastStep, audioEnabled, onComplete]);
  
  // 播放/暂停
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // 重置演示
  const resetDemo = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setIsCompleted(false);
    setHighlightedPosition(null);
    setCurrentTone(null);
    setShowMatch(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  
  // 下一步
  const nextStep = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isLastStep) {
      setIsCompleted(true);
      setIsPlaying(false);
      onComplete?.();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };
  
  // 上一步
  const prevStep = () => {
    if (currentStepIndex > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setCurrentStepIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };
  
  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            {sequence.includes('visual') && !sequence.includes('dual') && <Eye className="w-5 h-5 text-white" />}
            {sequence.includes('audio') && !sequence.includes('dual') && <Ear className="w-5 h-5 text-white" />}
            {sequence.includes('dual') && <Brain className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {sequence === '1-back-visual' && '1-Back 视觉演示'}
              {sequence === '2-back-visual' && '2-Back 视觉演示'}
              {sequence === '1-back-audio' && '1-Back 听觉演示'}
              {sequence === 'dual-nback' && '双重 N-Back 演示'}
            </h3>
            <p className="text-gray-400 text-sm">
              步骤 {currentStepIndex + 1} / {steps.length}
            </p>
          </div>
        </div>
        
        {showControls && (
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                audioEnabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}

              whileTap={{ scale: 0.9 }}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </motion.button>
            
            <motion.button
              onClick={resetDemo}
              className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"

              whileTap={{ scale: 0.9 }}
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
      
      {/* 进度条 */}
      <div className="mb-6">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentStepIndex + 1) / steps.length) * 100}%` 
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      {/* 演示区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 视觉区域 */}
        {(sequence.includes('visual') || sequence.includes('dual')) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-medium">
              <Eye className="w-4 h-4" />
              <span>视觉刺激</span>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <div className="grid grid-cols-3 gap-3 max-w-48 mx-auto">
                {Array.from({ length: 9 }, (_, i) => (
                  <motion.div
                    key={i}
                    className={`w-12 h-12 rounded-lg border-2 transition-all duration-300 ${
                      highlightedPosition === i
                        ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50'
                        : 'bg-gray-700 border-gray-600'
                    }`}
                    animate={{
                      scale: highlightedPosition === i ? 1.1 : 1,
                      boxShadow: highlightedPosition === i 
                        ? '0 0 20px rgba(59, 130, 246, 0.5)' 
                        : '0 0 0px rgba(59, 130, 246, 0)'
                    }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* 听觉区域 */}
        {(sequence.includes('audio') || sequence.includes('dual')) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-medium">
              <Ear className="w-4 h-4" />
              <span>听觉刺激</span>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <div className="flex justify-center gap-6">
                <motion.div
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    currentTone === 'low'
                      ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                  animate={{
                    scale: currentTone === 'low' ? 1.2 : 1,
                    boxShadow: currentTone === 'low'
                      ? '0 0 20px rgba(59, 130, 246, 0.5)'
                      : '0 0 0px rgba(59, 130, 246, 0)'
                  }}
                >
                  <span className="text-white font-bold text-sm">低</span>
                </motion.div>
                
                <motion.div
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    currentTone === 'high'
                      ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                  animate={{
                    scale: currentTone === 'high' ? 1.2 : 1,
                    boxShadow: currentTone === 'high'
                      ? '0 0 20px rgba(34, 197, 94, 0.5)'
                      : '0 0 0px rgba(34, 197, 94, 0)'
                  }}
                >
                  <span className="text-white font-bold text-sm">高</span>
                </motion.div>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-gray-400 text-sm">
                  {currentTone === 'low' && '播放低音调 (440 Hz)'}
                  {currentTone === 'high' && '播放高音调 (880 Hz)'}
                  {!currentTone && '等待音调播放...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 匹配指示器 */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-center gap-3 text-green-300">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">匹配检测到！</span>
              <Zap className="w-4 h-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 说明文字 */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <p className="text-white font-medium mb-1">当前步骤说明</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {currentStep?.explanation || '准备开始演示...'}
            </p>
          </div>
        </div>
      </div>
      
      {/* 控制按钮 */}
      {showControls && (
        <div className="flex items-center justify-between">
          <motion.button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"

            whileTap={{ scale: currentStepIndex === 0 ? 1 : 0.95 }}
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            上一步
          </motion.button>
          
          <div className="flex items-center gap-2">
            <motion.button
              onClick={togglePlay}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"

              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? '暂停' : '播放'}
            </motion.button>
            
            {!isCompleted && (
              <motion.button
                onClick={nextStep}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                下一步
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      )}
      
      {/* 完成状态 */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-center"
          >
            <div className="flex items-center justify-center gap-2 text-green-300 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">演示完成！</span>
            </div>
            <p className="text-gray-300 text-sm">
              现在您已经了解了 N-Back 训练的基本原理，可以开始实际训练了。
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 演示选择器组件
interface DemoSelectorProps {
  onSelect?: (sequence: keyof typeof DEMO_SEQUENCES) => void;
  className?: string;
}

export function DemoSelector({ onSelect, className }: DemoSelectorProps) {
  const [selectedDemo, setSelectedDemo] = useState<keyof typeof DEMO_SEQUENCES>('1-back-visual');
  
  const demos = [
    {
      key: '1-back-visual' as const,
      title: '1-Back 视觉',
      description: '学习基础的视觉位置记忆',
      icon: Eye,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      key: '2-back-visual' as const,
      title: '2-Back 视觉',
      description: '更高难度的视觉训练',
      icon: Target,
      color: 'from-green-600 to-emerald-600'
    },
    {
      key: '1-back-audio' as const,
      title: '1-Back 听觉',
      description: '学习基础的音调记忆',
      icon: Ear,
      color: 'from-purple-600 to-violet-600'
    },
    {
      key: 'dual-nback' as const,
      title: '双重 N-Back',
      description: '同时训练视觉和听觉',
      icon: Brain,
      color: 'from-pink-600 to-rose-600'
    }
  ];
  
  const handleSelect = (demoKey: keyof typeof DEMO_SEQUENCES) => {
    setSelectedDemo(demoKey);
    onSelect?.(demoKey);
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-4">选择演示类型</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demos.map((demo) => {
          const Icon = demo.icon;
          const isSelected = selectedDemo === demo.key;
          
          return (
            <motion.button
              key={demo.key}
              onClick={() => handleSelect(demo.key)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-600/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${demo.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{demo.title}</h4>
                  <p className="text-gray-400 text-sm">{demo.description}</p>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}