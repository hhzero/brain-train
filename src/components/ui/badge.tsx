'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * 徽章变体样式配置
 * 使用CVA库定义不同的徽章样式变体
 */
const badgeVariants = cva(
  // 基础样式 - 梦幻星空主题
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative overflow-hidden group',
  {
    variants: {
      variant: {
        // 默认样式 - 蓝色渐变
        default:
          'border-blue-400/50 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105',
        // 次要样式 - 紫色渐变
        secondary:
          'border-purple-400/50 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105',
        // 危险样式 - 红色渐变
        destructive:
          'border-red-400/50 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-200 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105',
        // 轮廓样式 - 透明背景
        outline:
          'border-white/30 bg-transparent text-white/80 hover:bg-white/10 hover:text-white hover:border-white/50 hover:scale-105',
        // 成功样式 - 绿色渐变
        success:
          'border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105',
        // 警告样式 - 黄色渐变
        warning:
          'border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105',
        // 信息样式 - 青色渐变
        info:
          'border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105',
        // 宇宙样式 - 彩虹渐变
        cosmic:
          'border-transparent bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-105 animate-pulse'
      },
      size: {
        default: 'px-3 py-1 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-4 py-2 text-sm',
        xl: 'px-6 py-3 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

/**
 * 徽章组件属性接口
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** 是否显示星光效果 */
  showStars?: boolean
  /** 是否显示脉冲动画 */
  pulse?: boolean
}

/**
 * 梦幻星空主题徽章组件
 * 支持多种样式变体和尺寸，具有星光效果和动画
 */
function Badge({ 
  className, 
  variant, 
  size, 
  showStars = true, 
  pulse = false,
  children,
  ...props 
}: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }),
        pulse && 'animate-pulse',
        className
      )} 
      {...props}
    >
      {/* 星光闪烁效果 */}
      {showStars && (
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="absolute top-1/4 left-1/4 w-0.5 h-0.5 bg-white rounded-full animate-ping" />
          <span className="absolute top-3/4 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-ping delay-300" />
          <span className="absolute bottom-1/4 left-2/3 w-0.5 h-0.5 bg-white rounded-full animate-ping delay-700" />
        </span>
      )}
      
      {/* 内容 */}
      <span className="relative z-10 flex items-center gap-1">
        {children}
      </span>
      
      {/* 光晕效果 */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}

/**
 * 状态徽章组件
 * 用于显示在线状态、活动状态等
 */
interface StatusBadgeProps {
  /** 状态类型 */
  status: 'online' | 'offline' | 'busy' | 'away' | 'active' | 'inactive'
  /** 是否显示文本 */
  showText?: boolean
  /** 自定义类名 */
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showText = false, 
  className 
}) => {
  const statusConfig = {
    online: {
      color: 'bg-emerald-500',
      text: '在线',
      variant: 'success' as const
    },
    offline: {
      color: 'bg-gray-500',
      text: '离线',
      variant: 'outline' as const
    },
    busy: {
      color: 'bg-red-500',
      text: '忙碌',
      variant: 'destructive' as const
    },
    away: {
      color: 'bg-amber-500',
      text: '离开',
      variant: 'warning' as const
    },
    active: {
      color: 'bg-blue-500',
      text: '活跃',
      variant: 'info' as const
    },
    inactive: {
      color: 'bg-purple-500',
      text: '不活跃',
      variant: 'secondary' as const
    }
  }
  
  const config = statusConfig[status]
  
  if (showText) {
    return (
      <Badge variant={config.variant} className={className}>
        <div className={cn('w-2 h-2 rounded-full mr-1 animate-pulse', config.color)} />
        {config.text}
      </Badge>
    )
  }
  
  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'w-3 h-3 rounded-full border-2 border-white/50 shadow-lg',
        config.color,
        'animate-pulse'
      )} />
      {/* 外圈光晕 */}
      <div className={cn(
        'absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-75',
        config.color
      )} />
    </div>
  )
}

/**
 * 数字徽章组件
 * 用于显示通知数量等数字信息
 */
interface NumberBadgeProps {
  /** 数字值 */
  count: number
  /** 最大显示数字 */
  max?: number
  /** 是否显示为点状 */
  dot?: boolean
  /** 自定义类名 */
  className?: string
}

const NumberBadge: React.FC<NumberBadgeProps> = ({ 
  count, 
  max = 99, 
  dot = false, 
  className 
}) => {
  if (count <= 0) return null
  
  if (dot) {
    return (
      <div className={cn(
        'w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50',
        className
      )} />
    )
  }
  
  const displayCount = count > max ? `${max}+` : count.toString()
  
  return (
    <Badge 
      variant="destructive" 
      size="sm" 
      className={cn(
        'min-w-[1.25rem] h-5 px-1 flex items-center justify-center animate-bounce',
        className
      )}
    >
      {displayCount}
    </Badge>
  )
}

export { Badge, badgeVariants, StatusBadge, NumberBadge }