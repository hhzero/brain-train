'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDown, 
  ArrowUp, 
  ArrowLeft, 
  ArrowRight,
  MousePointer,
  Keyboard,
  Eye,
  Ear,
  Brain,
  Target,
  Zap,
  CheckCircle,
  X,
  Lightbulb,
  Star,
  Play,
  Settings,
  BarChart3,
  Trophy
} from 'lucide-react';

// 引导步骤类型
export interface GuidanceStep {
  id: string;
  target: string; // CSS选择器
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  offset?: { x: number; y: number };
  showArrow?: boolean;
  highlightPadding?: number;
  action?: 'click' | 'hover' | 'focus' | 'none';
  waitForElement?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

// 预定义的引导流程
const FIRST_TIME_GUIDANCE: GuidanceStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '欢迎来到脑力训练',
    description: '这是一个科学的认知训练平台，让我们开始您的第一次训练之旅！',
    position: 'auto'
  },
  {
    id: 'start-training',
    target: '[data-guide="start-training"]',
    title: '开始训练',
    description: '点击这里开始您的第一次 N-Back 训练。建议从简单的模式开始。',
    position: 'top',
    showArrow: true,
    action: 'click'
  },
  {
    id: 'training-grid',
    target: '[data-guide="training-grid"]',
    title: '训练网格',
    description: '这是视觉训练区域。方格会依次亮起，您需要记住它们的位置。',
    position: 'bottom',
    showArrow: true,
    waitForElement: true
  },
  {
    id: 'response-buttons',
    target: '[data-guide="response-buttons"]',
    title: '响应按钮',
    description: '当发现匹配时，点击相应的按钮或使用键盘快捷键进行响应。',
    position: 'top',
    showArrow: true
  },
  {
    id: 'progress-bar',
    target: '[data-guide="progress-bar"]',
    title: '训练进度',
    description: '这里显示当前训练的进度和剩余时间。',
    position: 'bottom',
    showArrow: true
  },
  {
    id: 'statistics',
    target: '[data-guide="statistics"]',
    title: '统计数据',
    description: '查看您的训练统计，包括准确率、反应时间等重要指标。',
    position: 'left',
    showArrow: true
  },
  {
    id: 'settings',
    target: '[data-guide="settings"]',
    title: '训练设置',
    description: '在这里可以调整训练难度、音效设置等个性化选项。',
    position: 'left',
    showArrow: true
  }
];

const TRAINING_GUIDANCE: GuidanceStep[] = [
  {
    id: 'visual-stimulus',
    target: '[data-guide="visual-stimulus"]',
    title: '视觉刺激',
    description: '注意观察亮起的方格位置，记住它们的顺序。',
    position: 'bottom',
    showArrow: true
  },
  {
    id: 'audio-indicator',
    target: '[data-guide="audio-indicator"]',
    title: '音频指示',
    description: '同时聆听播放的音调，区分不同的频率。',
    position: 'top',
    showArrow: true
  },
  {
    id: 'response-timing',
    target: '[data-guide="response-timing"]',
    title: '响应时机',
    description: '当发现当前刺激与 N 步前相同时，立即做出响应。',
    position: 'auto'
  }
];

// 引导系统组件属性
interface UserGuidanceProps {
  steps?: GuidanceStep[];
  isActive?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  showSkipButton?: boolean;
}

// 用户引导系统组件
export function UserGuidance({
  steps = FIRST_TIME_GUIDANCE,
  isActive = false,
  onComplete,
  onSkip,
  autoStart = false,
  showSkipButton = true
}: UserGuidanceProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(isActive || autoStart);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  
  // 查找目标元素
  useEffect(() => {
    if (!isVisible || !currentStep) return;
    
    const findElement = () => {
      const element = document.querySelector(currentStep.target);
      if (element) {
        setTargetElement(element);
        updateTargetRect(element);
        return true;
      }
      return false;
    };
    
    // 立即尝试查找
    if (findElement()) {
      currentStep.onShow?.();
      return;
    }
    
    // 如果需要等待元素出现
    if (currentStep.waitForElement) {
      const observer = new MutationObserver(() => {
        if (findElement()) {
          observer.disconnect();
          currentStep.onShow?.();
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return () => observer.disconnect();
    }
  }, [currentStep, isVisible]);
  
  // 更新目标元素位置
  const updateTargetRect = (element: Element) => {
    const rect = element.getBoundingClientRect();
    setTargetRect(rect);
    
    // 计算提示框位置
    const position = calculateTooltipPosition(rect, currentStep.position || 'auto');
    setTooltipPosition(position);
  };
  
  // 计算提示框位置
  const calculateTooltipPosition = (rect: DOMRect, position: string) => {
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const padding = 16;
    const arrowSize = 12;
    
    let x = 0;
    let y = 0;
    
    switch (position) {
      case 'top':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.top - tooltipHeight - arrowSize - padding;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.bottom + arrowSize + padding;
        break;
      case 'left':
        x = rect.left - tooltipWidth - arrowSize - padding;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        x = rect.right + arrowSize + padding;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
      default: // auto
        // 自动选择最佳位置
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (rect.top > tooltipHeight + arrowSize + padding) {
          // 上方有足够空间
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.top - tooltipHeight - arrowSize - padding;
        } else if (rect.bottom + tooltipHeight + arrowSize + padding < viewportHeight) {
          // 下方有足够空间
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.bottom + arrowSize + padding;
        } else if (rect.left > tooltipWidth + arrowSize + padding) {
          // 左侧有足够空间
          x = rect.left - tooltipWidth - arrowSize - padding;
          y = rect.top + rect.height / 2 - tooltipHeight / 2;
        } else {
          // 右侧
          x = rect.right + arrowSize + padding;
          y = rect.top + rect.height / 2 - tooltipHeight / 2;
        }
        break;
    }
    
    // 应用偏移
    if (currentStep.offset) {
      x += currentStep.offset.x;
      y += currentStep.offset.y;
    }
    
    // 确保提示框在视窗内
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipWidth - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipHeight - padding));
    
    return { x, y };
  };
  
  // 监听窗口大小变化
  useEffect(() => {
    if (!targetElement) return;
    
    const handleResize = () => {
      updateTargetRect(targetElement);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [targetElement]);
  
  // 下一步
  const nextStep = () => {
    currentStep.onHide?.();
    
    if (isLastStep) {
      completeGuidance();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };
  
  // 上一步
  const prevStep = () => {
    if (currentStepIndex > 0) {
      currentStep.onHide?.();
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  // 跳过引导
  const skipGuidance = () => {
    setIsVisible(false);
    onSkip?.();
  };
  
  // 完成引导
  const completeGuidance = () => {
    setIsVisible(false);
    onComplete?.();
  };
  
  // 获取箭头方向
  const getArrowDirection = () => {
    if (!currentStep.showArrow || !targetRect) return null;
    
    const position = currentStep.position || 'auto';
    
    switch (position) {
      case 'top':
        return 'down';
      case 'bottom':
        return 'up';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        // 根据实际位置计算
        if (tooltipPosition.y < targetRect.top) return 'down';
        if (tooltipPosition.y > targetRect.bottom) return 'up';
        if (tooltipPosition.x < targetRect.left) return 'right';
        return 'left';
    }
  };
  
  if (!isVisible || !currentStep) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* 遮罩层 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* 高亮区域 */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute border-4 border-purple-500 rounded-lg shadow-lg shadow-purple-500/50"
            style={{
              left: targetRect.left - (currentStep.highlightPadding || 8),
              top: targetRect.top - (currentStep.highlightPadding || 8),
              width: targetRect.width + (currentStep.highlightPadding || 8) * 2,
              height: targetRect.height + (currentStep.highlightPadding || 8) * 2,
            }}
          />
        )}
        
        {/* 提示框 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="absolute pointer-events-auto"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            width: 320
          }}
        >
          <div className="bg-gray-900/95 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-2xl">
            {/* 箭头 */}
            {currentStep.showArrow && (
              <div className={`absolute w-0 h-0 ${
                getArrowDirection() === 'up'
                  ? 'border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-900 -top-2 left-1/2 transform -translate-x-1/2'
                  : getArrowDirection() === 'down'
                  ? 'border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900 -bottom-2 left-1/2 transform -translate-x-1/2'
                  : getArrowDirection() === 'left'
                  ? 'border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-gray-900 -left-2 top-1/2 transform -translate-y-1/2'
                  : 'border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-gray-900 -right-2 top-1/2 transform -translate-y-1/2'
              }`} />
            )}
            
            {/* 头部 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  {currentStep.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {currentStep.description}
                </p>
              </div>
              
              {showSkipButton && (
                <motion.button
                  onClick={skipGuidance}
                  className="ml-4 p-1 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>
            
            {/* 进度指示器 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">
                  {currentStepIndex + 1} / {steps.length}
                </span>
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentStepIndex
                          ? 'bg-purple-500'
                          : index < currentStepIndex
                          ? 'bg-green-500'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <motion.div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${((currentStepIndex + 1) / steps.length) * 100}%` 
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            
            {/* 操作提示 */}
            {currentStep.action && (
              <div className="mb-4 p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 text-sm text-blue-300">
                  {currentStep.action === 'click' && <MousePointer className="w-4 h-4" />}
                  {currentStep.action === 'hover' && <MousePointer className="w-4 h-4" />}
                  {currentStep.action === 'focus' && <Keyboard className="w-4 h-4" />}
                  <span>
                    {currentStep.action === 'click' && '点击高亮的元素继续'}
                    {currentStep.action === 'hover' && '将鼠标悬停在高亮的元素上'}
                    {currentStep.action === 'focus' && '聚焦到高亮的元素'}
                  </span>
                </div>
              </div>
            )}
            
            {/* 控制按钮 */}
            <div className="flex items-center justify-between">
              <motion.button
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                whileHover={{ scale: currentStepIndex === 0 ? 1 : 1.05 }}
                whileTap={{ scale: currentStepIndex === 0 ? 1 : 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                上一步
              </motion.button>
              
              <motion.button
                onClick={nextStep}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLastStep ? '完成' : '下一步'}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
                {isLastStep && <CheckCircle className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// 引导启动器组件
interface GuidanceLauncherProps {
  type?: 'first-time' | 'training' | 'custom';
  steps?: GuidanceStep[];
  onStart?: () => void;
  onComplete?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function GuidanceLauncher({
  type = 'first-time',
  steps,
  onStart,
  onComplete,
  children,
  className
}: GuidanceLauncherProps) {
  const [isActive, setIsActive] = useState(false);
  
  const getSteps = () => {
    if (steps) return steps;
    
    switch (type) {
      case 'training':
        return TRAINING_GUIDANCE;
      case 'first-time':
      default:
        return FIRST_TIME_GUIDANCE;
    }
  };
  
  const startGuidance = () => {
    setIsActive(true);
    onStart?.();
  };
  
  const handleComplete = () => {
    setIsActive(false);
    onComplete?.();
  };
  
  const handleSkip = () => {
    setIsActive(false);
  };
  
  return (
    <>
      {children ? (
        <div onClick={startGuidance} className={className}>
          {children}
        </div>
      ) : (
        <motion.button
          onClick={startGuidance}
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 ${className}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Lightbulb className="w-4 h-4" />
          开始引导
        </motion.button>
      )}
      
      <UserGuidance
        steps={getSteps()}
        isActive={isActive}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </>
  );
}

// 智能提示组件
interface SmartTooltipProps {
  target: string;
  title: string;
  description: string;
  trigger?: 'hover' | 'click' | 'focus' | 'auto';
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  showOnce?: boolean;
  storageKey?: string;
}

export function SmartTooltip({
  target,
  title,
  description,
  trigger = 'hover',
  delay = 500,
  position = 'auto',
  showOnce = false,
  storageKey
}: SmartTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (showOnce && storageKey && typeof window !== 'undefined') {
      const shown = localStorage.getItem(storageKey);
      if (shown) {
        setHasShown(true);
        return;
      }
    }
    
    const element = document.querySelector(target);
    if (!element) return;
    
    const showTooltip = () => {
      if (hasShown && showOnce) return;
      
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        if (showOnce && storageKey && typeof window !== 'undefined') {
          localStorage.setItem(storageKey, 'true');
          setHasShown(true);
        }
      }, delay);
    };
    
    const hideTooltip = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsVisible(false);
    };
    
    if (trigger === 'hover') {
      element.addEventListener('mouseenter', showTooltip);
      element.addEventListener('mouseleave', hideTooltip);
    } else if (trigger === 'click') {
      element.addEventListener('click', showTooltip);
    } else if (trigger === 'focus') {
      element.addEventListener('focus', showTooltip);
      element.addEventListener('blur', hideTooltip);
    } else if (trigger === 'auto') {
      // 自动显示（延迟后）
      showTooltip();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      element.removeEventListener('mouseenter', showTooltip);
      element.removeEventListener('mouseleave', hideTooltip);
      element.removeEventListener('click', showTooltip);
      element.removeEventListener('focus', showTooltip);
      element.removeEventListener('blur', hideTooltip);
    };
  }, [target, trigger, delay, hasShown, showOnce, storageKey]);
  
  if (!isVisible || (hasShown && showOnce)) {
    return null;
  }
  
  return (
    <UserGuidance
      steps={[{
        id: 'tooltip',
        target,
        title,
        description,
        position,
        showArrow: true
      }]}
      isActive={isVisible}
      onComplete={() => setIsVisible(false)}
      onSkip={() => setIsVisible(false)}
      showSkipButton={false}
    />
  );
}