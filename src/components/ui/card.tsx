'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * 卡片容器组件
 * 梦幻星空主题的卡片设计，具有玻璃态效果和渐变边框
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 基础样式 - 玻璃态效果
      'rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md shadow-xl',
      // 渐变边框效果
      'relative before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-r before:from-purple-500/50 before:via-cyan-500/50 before:to-pink-500/50 before:-z-10',
      // 悬停效果
      'hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]',
      // 内部发光效果
      'shadow-inner shadow-white/10',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

/**
 * 卡片头部组件
 * 包含标题和描述区域
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 基础布局
      'flex flex-col space-y-2 p-6 pb-4',
      // 渐变背景
      'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-t-2xl',
      // 底部边框
      'border-b border-white/10',
      className
    )}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

/**
 * 卡片标题组件
 * 主标题文本样式
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      // 文字样式
      'text-xl font-bold leading-none tracking-tight',
      // 渐变文字效果
      'bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent',
      // 文字阴影
      'drop-shadow-sm',
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = 'CardTitle'

/**
 * 卡片描述组件
 * 副标题或描述文本样式
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      // 文字样式
      'text-sm text-gray-300/80 leading-relaxed',
      // 轻微发光效果
      'drop-shadow-sm',
      className
    )}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

/**
 * 卡片内容组件
 * 主要内容区域
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 基础布局
      'p-6 pt-4',
      // 文字颜色
      'text-white/90',
      className
    )}
    {...props}
  />
))
CardContent.displayName = 'CardContent'

/**
 * 卡片底部组件
 * 操作按钮或额外信息区域
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 基础布局
      'flex items-center p-6 pt-0',
      // 顶部边框
      'border-t border-white/10 mt-4',
      // 渐变背景
      'bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-b-2xl',
      className
    )}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }