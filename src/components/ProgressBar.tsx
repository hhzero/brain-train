'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Trophy, Target } from 'lucide-react';

// 进度条类型枚举
export enum ProgressType {
  SESSION = 'session',     // 当前会话进度
  OVERALL = 'overall',     // 整体训练进度
  LEVEL = 'level',         // 等级进度
  SKILL = 'skill'          // 技能进度
}

// 进度条配置接口
interface ProgressConfig {
  type: ProgressType;
  current: number;         // 当前值
  max: number;            // 最大值
  label: string;          // 标签文本
  color: string;          // 主色调
  gradient: string;       // 渐变色
  icon?: React.ReactNode; // 图标
  showPercentage?: boolean; // 是否显示百分比
  showNumbers?: boolean;   // 是否显示数字
  animated?: boolean;      // 是否启用动画
  glowEffect?: boolean;    // 是否启用发光效果
}

// 进度条组件属性
interface ProgressBarProps {
  config: ProgressConfig;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  style?: 'minimal' | 'detailed' | 'fantasy';
}

/**
 * 梦幻风格进度条组件
 * 提供多种样式和动画效果的进度条显示
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  config,
  className = '',
  size = 'medium',
  style = 'fantasy'
}) => {
  const {
    type,
    current,
    max,
    label,
    color,
    gradient,
    icon,
    showPercentage = true,
    showNumbers = true,
    animated = true,
    glowEffect = true
  } = config;

  // 计算进度百分比
  const percentage = Math.min((current / max) * 100, 100);
  const safePercentage = Math.max(0, percentage);

  // 尺寸样式映射
  const sizeStyles = {
    small: {
      height: 'h-2',
      text: 'text-xs',
      padding: 'p-2',
      iconSize: 'w-3 h-3'
    },
    medium: {
      height: 'h-3',
      text: 'text-sm',
      padding: 'p-3',
      iconSize: 'w-4 h-4'
    },
    large: {
      height: 'h-4',
      text: 'text-base',
      padding: 'p-4',
      iconSize: 'w-5 h-5'
    }
  };

  const currentSize = sizeStyles[size];

  // 获取类型特定的图标
  const getTypeIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case ProgressType.SESSION:
        return <Target className={currentSize.iconSize} />;
      case ProgressType.OVERALL:
        return <Zap className={currentSize.iconSize} />;
      case ProgressType.LEVEL:
        return <Star className={currentSize.iconSize} />;
      case ProgressType.SKILL:
        return <Trophy className={currentSize.iconSize} />;
      default:
        return <Star className={currentSize.iconSize} />;
    }
  };

  // 渲染最小样式进度条
  const renderMinimalStyle = () => (
    <div className={`w-full ${className}`}>
      <div className={`relative bg-gray-800/30 rounded-full ${currentSize.height} overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${safePercentage}%` }}
          transition={{ duration: animated ? 1.5 : 0, ease: "easeOut" }}
        />
        {glowEffect && (
          <motion.div
            className={`absolute inset-0 rounded-full ${gradient} opacity-50 blur-sm`}
            initial={{ width: 0 }}
            animate={{ width: `${safePercentage}%` }}
            transition={{ duration: animated ? 1.5 : 0, ease: "easeOut" }}
          />
        )}
      </div>
    </div>
  );

  // 渲染详细样式进度条
  const renderDetailedStyle = () => (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`text-${color}-400`}>
            {getTypeIcon()}
          </div>
          <span className={`${currentSize.text} font-medium text-white`}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showNumbers && (
            <span className={`${currentSize.text} text-gray-300`}>
              {current.toLocaleString()} / {max.toLocaleString()}
            </span>
          )}
          {showPercentage && (
            <span className={`${currentSize.text} font-bold text-${color}-400`}>
              {safePercentage.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <div className={`relative bg-gray-800/50 rounded-full ${currentSize.height} overflow-hidden border border-gray-700/50`}>
        <motion.div
          className={`h-full rounded-full ${gradient} relative`}
          initial={{ width: 0 }}
          animate={{ width: `${safePercentage}%` }}
          transition={{ duration: animated ? 2 : 0, ease: "easeOut" }}
        >
          {/* 进度条内部光效 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </motion.div>
        {glowEffect && (
          <motion.div
            className={`absolute inset-0 rounded-full ${gradient} opacity-30 blur-md`}
            initial={{ width: 0 }}
            animate={{ width: `${safePercentage}%` }}
            transition={{ duration: animated ? 2 : 0, ease: "easeOut" }}
          />
        )}
      </div>
    </div>
  );

  // 渲染梦幻样式进度条
  const renderFantasyStyle = () => (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <motion.div 
            className={`text-${color}-400 drop-shadow-lg`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {getTypeIcon()}
          </motion.div>
          <span className={`${currentSize.text} font-bold text-white drop-shadow-md`}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {showNumbers && (
            <motion.span 
              className={`${currentSize.text} text-gray-300 font-medium`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {current.toLocaleString()} / {max.toLocaleString()}
            </motion.span>
          )}
          {showPercentage && (
            <motion.span 
              className={`${currentSize.text} font-bold text-${color}-400 drop-shadow-md`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
            >
              {safePercentage.toFixed(1)}%
            </motion.span>
          )}
        </div>
      </div>
      
      {/* 梦幻进度条容器 */}
      <div className="relative">
        <div className={`relative bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-full ${currentSize.height} overflow-hidden border-2 border-gray-600/50 shadow-lg`}>
          {/* 背景星光效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
          
          {/* 主进度条 */}
          <motion.div
            className={`h-full rounded-full ${gradient} relative overflow-hidden`}
            initial={{ width: 0 }}
            animate={{ width: `${safePercentage}%` }}
            transition={{ duration: animated ? 2.5 : 0, ease: "easeOut" }}
          >
            {/* 进度条内部动画效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent" />
          </motion.div>
          
          {/* 外部发光效果 */}
          {glowEffect && (
            <motion.div
              className={`absolute -inset-1 rounded-full ${gradient} opacity-20 blur-lg`}
              initial={{ width: 0 }}
              animate={{ width: `${safePercentage}%` }}
              transition={{ duration: animated ? 2.5 : 0, ease: "easeOut" }}
            />
          )}
        </div>
        
        {/* 进度指示器 */}
        {safePercentage > 5 && (
          <motion.div
            className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg`}
            style={{ left: `${safePercentage}%`, marginLeft: '-4px' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: animated ? 1 : 0, type: "spring" }}
          >
            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75" />
          </motion.div>
        )}
      </div>
      
      {/* 完成时的庆祝效果 */}
      {percentage >= 100 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 bg-${color}-400 rounded-full`}
              style={{
                left: `${20 + i * 12}%`,
                top: '50%'
              }}
              initial={{ scale: 0, y: 0 }}
              animate={{ 
                scale: [0, 1, 0], 
                y: [-20, -40, -60],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 2, 
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 3
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );

  // 根据样式类型渲染对应的进度条
  switch (style) {
    case 'minimal':
      return renderMinimalStyle();
    case 'detailed':
      return renderDetailedStyle();
    case 'fantasy':
    default:
      return renderFantasyStyle();
  }
};

// 预设进度条配置
export const progressConfigs = {
  // 会话进度配置
  session: (current: number, max: number): ProgressConfig => ({
    type: ProgressType.SESSION,
    current,
    max,
    label: '当前会话',
    color: 'blue',
    gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    animated: true,
    glowEffect: true
  }),
  
  // 整体训练进度配置
  overall: (current: number, max: number): ProgressConfig => ({
    type: ProgressType.OVERALL,
    current,
    max,
    label: '总体进度',
    color: 'purple',
    gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
    animated: true,
    glowEffect: true
  }),
  
  // 等级进度配置
  level: (current: number, max: number): ProgressConfig => ({
    type: ProgressType.LEVEL,
    current,
    max,
    label: '等级进度',
    color: 'yellow',
    gradient: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    animated: true,
    glowEffect: true
  }),
  
  // 技能进度配置
  skill: (current: number, max: number): ProgressConfig => ({
    type: ProgressType.SKILL,
    current,
    max,
    label: '技能熟练度',
    color: 'green',
    gradient: 'bg-gradient-to-r from-green-400 to-emerald-500',
    animated: true,
    glowEffect: true
  })
};

export default ProgressBar;