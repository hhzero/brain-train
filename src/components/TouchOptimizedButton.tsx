'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TouchOptimizedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  hapticFeedback?: boolean
  preventDoubleClick?: boolean
  touchDelay?: number
}

/**
 * 移动端触摸优化按钮组件
 * 提供更好的触摸体验，包括触觉反馈、防止双击、触摸延迟优化等
 */
export default function TouchOptimizedButton({
  children,
  onClick,
  disabled = false,
  className,
  variant = 'default',
  size = 'default',
  hapticFeedback = true,
  preventDoubleClick = true,
  touchDelay = 100
}: TouchOptimizedButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const lastClickTime = useRef(0)
  const touchStartTime = useRef(0)
  
  // 触觉反馈
  const triggerHapticFeedback = useCallback(() => {
    if (!hapticFeedback) return
    
    try {
      // 检查是否支持触觉反馈
      if ('vibrate' in navigator) {
        navigator.vibrate(10) // 轻微震动10ms
      }
      
      // 检查是否支持Web Haptics API
      if ('haptics' in navigator && 'vibrate' in (navigator as any).haptics) {
        (navigator as any).haptics.vibrate({
          duration: 10,
          intensity: 0.3
        })
      }
    } catch (error) {
      // 静默处理错误，不影响主要功能
      console.debug('触觉反馈不可用:', error)
    }
  }, [hapticFeedback])
  
  // 处理触摸开始
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    
    touchStartTime.current = Date.now()
    setIsPressed(true)
    
    // 防止页面滚动（仅在按钮区域）
    e.preventDefault()
    
    // 触觉反馈
    triggerHapticFeedback()
  }, [disabled, triggerHapticFeedback])
  
  // 处理点击
  const handleClick = useCallback(() => {
    if (disabled || isProcessing) return
    
    setIsProcessing(true)
    
    // 添加触摸延迟以改善响应性
    setTimeout(() => {
      onClick?.()
      setIsProcessing(false)
    }, touchDelay)
  }, [disabled, isProcessing, onClick, touchDelay])
  
  // 处理触摸结束
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    
    setIsPressed(false)
    
    const touchDuration = Date.now() - touchStartTime.current
    
    // 检查是否是有效的触摸（避免意外触发）
    if (touchDuration < 50 || touchDuration > 2000) {
      return
    }
    
    // 防止双击
    if (preventDoubleClick) {
      const now = Date.now()
      if (now - lastClickTime.current < 300) {
        return
      }
      lastClickTime.current = now
    }
    
    // 处理点击
    handleClick()
  }, [disabled, preventDoubleClick, handleClick])
  
  // 处理触摸取消
  const handleTouchCancel = useCallback(() => {
    setIsPressed(false)
  }, [])
  
  // 处理鼠标事件（桌面端兼容）
  const handleMouseDown = useCallback(() => {
    if (disabled) return
    setIsPressed(true)
  }, [disabled])
  
  const handleMouseUp = useCallback(() => {
    setIsPressed(false)
  }, [])
  
  const handleMouseLeave = useCallback(() => {
    setIsPressed(false)
  }, [])
  
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isProcessing}
      className={cn(
        // 基础样式
        'select-none touch-manipulation',
        // 触摸优化
        'active:scale-95 transition-transform duration-100',
        // 按压状态
        isPressed && 'scale-95 brightness-110',
        // 处理状态
        isProcessing && 'opacity-70 cursor-wait',
        // 移动端优化
        'md:hover:scale-105 md:active:scale-95',
        // 触摸目标大小优化
        'min-h-[44px] min-w-[44px]',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        // 禁用iOS的触摸高亮
        WebkitTapHighlightColor: 'transparent',
        // 禁用用户选择
        WebkitUserSelect: 'none',
        userSelect: 'none',
        // 优化触摸延迟
        touchAction: 'manipulation'
      }}
    >
      {children}
    </Button>
  )
}

// 导出类型
export type { TouchOptimizedButtonProps }