'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

/**
 * 进度条组件属性接口
 */
interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** 进度值 (0-100) */
  value?: number
  /** 进度条颜色主题 */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'cosmic'
  /** 是否显示动画效果 */
  animated?: boolean
  /** 是否显示星光粒子效果 */
  showParticles?: boolean
}

/**
 * 梦幻星空主题进度条组件
 * 支持多种颜色主题和动画效果，具有星光粒子特效
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value = 0, 
  variant = 'default',
  animated = true,
  showParticles = true,
  ...props 
}, ref) => {
  // 根据变体选择颜色主题
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          track: 'bg-emerald-900/30 border-emerald-500/30',
          fill: 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-emerald-500/50',
          glow: 'shadow-lg shadow-emerald-500/30'
        }
      case 'warning':
        return {
          track: 'bg-amber-900/30 border-amber-500/30',
          fill: 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-500/50',
          glow: 'shadow-lg shadow-amber-500/30'
        }
      case 'error':
        return {
          track: 'bg-red-900/30 border-red-500/30',
          fill: 'bg-gradient-to-r from-red-400 to-pink-500 shadow-red-500/50',
          glow: 'shadow-lg shadow-red-500/30'
        }
      case 'cosmic':
        return {
          track: 'bg-purple-900/30 border-purple-500/30',
          fill: 'bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 shadow-purple-500/50',
          glow: 'shadow-lg shadow-purple-500/30'
        }
      default:
        return {
          track: 'bg-blue-900/30 border-blue-500/30',
          fill: 'bg-gradient-to-r from-blue-400 to-cyan-500 shadow-blue-500/50',
          glow: 'shadow-lg shadow-blue-500/30'
        }
    }
  }

  const styles = getVariantStyles()
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        // 基础样式
        'relative h-3 w-full overflow-hidden rounded-full border',
        // 背景和边框
        styles.track,
        // 玻璃态效果
        'backdrop-blur-sm',
        // 发光效果
        styles.glow,
        className
      )}
      {...props}
    >
      {/* 进度条填充 */}
      <ProgressPrimitive.Indicator
        className={cn(
          // 基础样式
          'h-full w-full flex-1 transition-all duration-500 ease-out relative overflow-hidden',
          // 渐变背景
          styles.fill,
          // 动画效果
          animated && 'animate-pulse',
          // 圆角
          'rounded-full'
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        {/* 内部光泽效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        
        {/* 星光粒子效果 */}
        {showParticles && value && value > 10 && (
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-75" />
            <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-300" />
            <div className="absolute bottom-1/3 left-2/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-700" />
          </div>
        )}
        
        {/* 进度条末端光点 */}
        {value && value > 0 && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2">
            <div className="w-2 h-2 bg-white rounded-full shadow-lg animate-pulse" />
          </div>
        )}
      </ProgressPrimitive.Indicator>
      
      {/* 进度文本显示 */}
      {value !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white drop-shadow-lg">
            {Math.round(value)}%
          </span>
        </div>
      )}
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

/**
 * 圆形进度条组件
 * 用于显示圆形的进度指示器
 */
interface CircularProgressProps {
  /** 进度值 (0-100) */
  value: number
  /** 圆形进度条大小 */
  size?: 'sm' | 'md' | 'lg'
  /** 颜色主题 */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'cosmic'
  /** 是否显示百分比文本 */
  showPercentage?: boolean
  /** 自定义类名 */
  className?: string
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 'md',
  variant = 'default',
  showPercentage = true,
  className
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  
  const strokeColors = {
    default: 'stroke-blue-400',
    success: 'stroke-emerald-400',
    warning: 'stroke-amber-400',
    error: 'stroke-red-400',
    cosmic: 'stroke-purple-400'
  }
  
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference
  
  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
        {/* 背景圆环 */}
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-white/20"
        />
        {/* 进度圆环 */}
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            strokeColors[variant],
            'transition-all duration-500 ease-out drop-shadow-lg'
          )}
          style={{
            filter: 'drop-shadow(0 0 6px currentColor)'
          }}
        />
      </svg>
      
      {/* 百分比文本 */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'font-bold text-white drop-shadow-lg',
            textSizes[size]
          )}>
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  )
}

export { Progress, CircularProgress }