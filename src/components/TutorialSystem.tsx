'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Play, 
  Eye, 
  Ear, 
  Brain, 
  Target, 
  Zap, 
  CheckCircle,
  SkipForward,
  RotateCcw,
  HelpCircle,
  Lightbulb,
  Star
} from 'lucide-react';
import { InteractiveDemo, DemoSelector } from './InteractiveDemo';

// 教程步骤类型
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  targetElement?: string; // CSS选择器
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showOverlay?: boolean;
  interactive?: boolean;
  validation?: () => boolean; // 验证用户是否完成了步骤
  showDemo?: boolean; // 是否显示演示
  demoType?: 'visual' | 'audio' | 'dual';
  demoSequence?: '1-back-visual' | '2-back-visual' | '1-back-audio' | 'dual-nback';
  onEnter?: () => void;
  onExit?: () => void;
}

// 教程配置
export interface TutorialConfig {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  skippable?: boolean;
  autoProgress?: boolean;
}

// N-Back 训练教程步骤
const NBACK_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '欢迎来到 N-Back 训练',
    description: '让我们一起学习如何进行 N-Back 认知训练',
    position: 'center',
    showOverlay: true,
    content: (
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">N-Back 认知训练</h2>
        <p className="text-gray-300 max-w-md">
          N-Back 训练是一种科学验证的工作记忆训练方法，可以提高您的注意力、记忆力和认知灵活性。
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>视觉训练</span>
          </div>
          <div className="flex items-center gap-1">
            <Ear className="w-4 h-4" />
            <span>听觉训练</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>双重训练</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'concept',
    title: 'N-Back 概念',
    description: '理解 N-Back 训练的基本概念',
    position: 'center',
    showOverlay: true,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">什么是 N-Back？</h3>
          <p className="text-gray-300">
            N-Back 训练要求您记住并识别 N 步之前出现的刺激。
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600/20 p-4 rounded-xl border border-blue-500/30">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-semibold text-white">1-Back</h4>
              <p className="text-sm text-gray-300">记住1步前的刺激</p>
            </div>
          </div>
          
          <div className="bg-green-600/20 p-4 rounded-xl border border-green-500/30">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-green-600 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-semibold text-white">2-Back</h4>
              <p className="text-sm text-gray-300">记住2步前的刺激</p>
            </div>
          </div>
          
          <div className="bg-purple-600/20 p-4 rounded-xl border border-purple-500/30">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-purple-600 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold">3+</span>
              </div>
              <h4 className="font-semibold text-white">高级</h4>
              <p className="text-sm text-gray-300">更高难度挑战</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">训练原理</h4>
              <p className="text-sm text-gray-300">
                通过不断练习记忆和识别模式，您的工作记忆容量和处理速度会逐步提升。
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'visual-training',
    title: '视觉训练模式',
    description: '学习如何进行视觉位置记忆训练',
    position: 'center',
    showOverlay: true,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">视觉训练</h3>
          <p className="text-gray-300">
            在视觉训练中，您需要记住方格中亮起的位置。
          </p>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h4 className="font-semibold text-white mb-4 text-center">3×3 训练网格</h4>
          <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-lg border-2 transition-all duration-300 ${
                  i === 4 ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50' : 'bg-gray-700 border-gray-600'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">
            当前位置：中心 (示例)
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
            <div>
              <h4 className="font-medium text-white">观察亮起的位置</h4>
              <p className="text-sm text-gray-400">注意哪个方格亮起，记住它的位置</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
            <div>
              <h4 className="font-medium text-white">记忆N步前的位置</h4>
              <p className="text-sm text-gray-400">在2-Back训练中，记住2步前亮起的位置</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
            <div>
              <h4 className="font-medium text-white">按空格键响应</h4>
              <p className="text-sm text-gray-400">如果当前位置与N步前相同，按空格键</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'audio-training',
    title: '听觉训练模式',
    description: '学习如何进行听觉音调记忆训练',
    position: 'center',
    showOverlay: true,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Ear className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">听觉训练</h3>
          <p className="text-gray-300">
            在听觉训练中，您需要记住播放的音调。
          </p>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h4 className="font-semibold text-white mb-4 text-center">音调频率</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto bg-blue-600 rounded-full mb-2"></div>
                <h5 className="font-medium text-white">低音调</h5>
                <p className="text-sm text-gray-400">440 Hz</p>
              </div>
            </div>
            <div className="bg-green-600/20 p-4 rounded-lg border border-green-500/30">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto bg-green-600 rounded-full mb-2"></div>
                <h5 className="font-medium text-white">高音调</h5>
                <p className="text-sm text-gray-400">880 Hz</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
            <div>
              <h4 className="font-medium text-white">聆听音调</h4>
              <p className="text-sm text-gray-400">仔细听每个播放的音调，区分高低音</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
            <div>
              <h4 className="font-medium text-white">记忆N步前的音调</h4>
              <p className="text-sm text-gray-400">在2-Back训练中，记住2步前播放的音调</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
            <div>
              <h4 className="font-medium text-white">按L键响应</h4>
              <p className="text-sm text-gray-400">如果当前音调与N步前相同，按L键</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'dual-training',
    title: '双重训练模式',
    description: '学习如何同时进行视觉和听觉训练',
    position: 'center',
    showOverlay: true,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">双重训练</h3>
          <p className="text-gray-300">
            同时进行视觉位置和听觉音调的记忆训练，这是最具挑战性的模式。
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-600/20 p-4 rounded-xl border border-blue-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-white">视觉通道</h4>
            </div>
            <p className="text-sm text-gray-300 mb-3">记住方格亮起的位置</p>
            <div className="text-center">
              <kbd className="px-3 py-1 bg-gray-700 text-white rounded text-sm">空格键</kbd>
              <p className="text-xs text-gray-400 mt-1">位置匹配时按下</p>
            </div>
          </div>
          
          <div className="bg-green-600/20 p-4 rounded-xl border border-green-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Ear className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-white">听觉通道</h4>
            </div>
            <p className="text-sm text-gray-300 mb-3">记住播放的音调</p>
            <div className="text-center">
              <kbd className="px-3 py-1 bg-gray-700 text-white rounded text-sm">L 键</kbd>
              <p className="text-xs text-gray-400 mt-1">音调匹配时按下</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-600/20 p-4 rounded-xl border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">挑战提示</h4>
              <p className="text-sm text-gray-300">
                在双重模式中，您需要同时跟踪两个独立的序列。可能同时、单独或都不匹配。
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'controls',
    title: '控制说明',
    description: '学习训练过程中的控制操作',
    position: 'center',
    showOverlay: true,
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">控制操作</h3>
          <p className="text-gray-300">
            掌握这些控制操作，让您的训练更加顺畅。
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-white">响应按键</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">视觉匹配</span>
                <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-sm">空格</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">听觉匹配</span>
                <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-sm">L</kbd>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-white">训练控制</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">暂停/继续</span>
                <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-sm">P</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">停止训练</span>
                <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-sm">ESC</kbd>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-600/20 p-4 rounded-xl border border-purple-500/30">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">训练技巧</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 保持专注，不要被错误打扰</li>
                <li>• 建立节奏感，跟随刺激的时间间隔</li>
                <li>• 从较低的N值开始，逐步提高难度</li>
                <li>• 定期休息，避免疲劳影响表现</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'ready',
    title: '准备开始',
    description: '您已经准备好开始 N-Back 训练了',
    position: 'center',
    showOverlay: true,
    content: (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">恭喜！</h2>
          <p className="text-gray-300 max-w-md mx-auto">
            您已经完成了 N-Back 训练教程。现在可以开始您的认知训练之旅了！
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 rounded-xl border border-purple-500/30">
          <h3 className="font-semibold text-white mb-3">建议的训练计划</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">1</div>
              <div className="text-white font-medium">从 1-Back 开始</div>
              <div className="text-gray-400">建立基础</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">15</div>
              <div className="text-white font-medium">每天 15 分钟</div>
              <div className="text-gray-400">持续训练</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">3</div>
              <div className="text-white font-medium">每周 3-5 次</div>
              <div className="text-gray-400">规律练习</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <HelpCircle className="w-4 h-4" />
          <span>随时可以在设置中重新查看教程</span>
        </div>
      </div>
    )
  }
];

// 教程系统组件属性
interface TutorialSystemProps {
  config?: TutorialConfig;
  onComplete?: () => void;
  onSkip?: () => void;
  onClose?: () => void;
  autoStart?: boolean;
}

// 教程系统组件
export function TutorialSystem({ 
  config, 
  onComplete, 
  onSkip, 
  onClose,
  autoStart = false 
}: TutorialSystemProps) {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  
  // 使用默认配置或传入的配置
  const tutorialConfig = config || {
    id: 'nback-tutorial',
    title: 'N-Back 训练教程',
    description: '学习如何使用 N-Back 认知训练系统',
    steps: NBACK_TUTORIAL_STEPS,
    skippable: true,
    autoProgress: false
  };
  
  const currentStep = tutorialConfig.steps[currentStepIndex];
  const isLastStep = currentStepIndex === tutorialConfig.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  
  // 高亮目标元素
  useEffect(() => {
    if (currentStep?.targetElement && isActive) {
      const element = document.querySelector(currentStep.targetElement);
      setHighlightedElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isActive]);
  
  // 步骤进入和退出处理
  useEffect(() => {
    if (isActive && currentStep) {
      currentStep.onEnter?.();
      
      return () => {
        currentStep.onExit?.();
      };
    }
  }, [currentStep, isActive]);
  
  // 下一步
  const nextStep = () => {
    if (currentStep?.validation && !currentStep.validation()) {
      return; // 验证失败，不能进入下一步
    }
    
    if (isLastStep) {
      completeTutorial();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };
  
  // 上一步
  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  // 跳过教程
  const skipTutorial = () => {
    setIsActive(false);
    onSkip?.();
  };
  
  // 完成教程
  const completeTutorial = () => {
    setIsCompleted(true);
    setIsActive(false);
    onComplete?.();
  };
  
  // 重新开始教程
  const restartTutorial = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setIsActive(true);
  };
  
  // 关闭教程
  const closeTutorial = () => {
    setIsActive(false);
    onClose?.();
  };
  
  // 开始教程
  const startTutorial = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setIsActive(true);
  };
  
  if (!isActive) {
    return (
      <motion.button
        onClick={startTutorial}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>
    );
  }
  
  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* 遮罩层 */}
          {currentStep?.showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
          )}
          
          {/* 教程内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed z-50 ${
              currentStep?.position === 'center'
                ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                : currentStep?.position === 'top'
                ? 'top-4 left-1/2 transform -translate-x-1/2'
                : currentStep?.position === 'bottom'
                ? 'bottom-4 left-1/2 transform -translate-x-1/2'
                : currentStep?.position === 'left'
                ? 'left-4 top-1/2 transform -translate-y-1/2'
                : currentStep?.position === 'right'
                ? 'right-4 top-1/2 transform -translate-y-1/2'
                : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
            }`}
          >
            <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full mx-4 border border-gray-700/50 shadow-2xl">
              {/* 头部 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>
                  <p className="text-gray-400 text-sm">{currentStep.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {tutorialConfig.skippable && (
                    <motion.button
                      onClick={skipTutorial}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SkipForward className="w-5 h-5" />
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={closeTutorial}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              
              {/* 进度指示器 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    步骤 {currentStepIndex + 1} / {tutorialConfig.steps.length}
                  </span>
                  <span className="text-sm text-gray-400">
                    {Math.round(((currentStepIndex + 1) / tutorialConfig.steps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((currentStepIndex + 1) / tutorialConfig.steps.length) * 100}%` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              
              {/* 内容 */}
              <div className="mb-8">
                {currentStep.content}
              </div>
              
              {/* 控制按钮 */}
              <div className="flex items-center justify-between">
                <motion.button
                  onClick={prevStep}
                  disabled={isFirstStep}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: isFirstStep ? 1 : 1.05 }}
                  whileTap={{ scale: isFirstStep ? 1 : 0.95 }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一步
                </motion.button>
                
                <div className="flex gap-2">
                  {tutorialConfig.steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStepIndex
                          ? 'bg-purple-500'
                          : index < currentStepIndex
                          ? 'bg-green-500'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                
                <motion.button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLastStep ? '完成' : '下一步'}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                  {isLastStep && <CheckCircle className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// 教程启动器组件
interface TutorialLauncherProps {
  onStart?: () => void;
  className?: string;
}

export function TutorialLauncher({ onStart, className }: TutorialLauncherProps) {
  return (
    <motion.button
      onClick={onStart}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <HelpCircle className="w-4 h-4" />
      查看教程
    </motion.button>
  );
}