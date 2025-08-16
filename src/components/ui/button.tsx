'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * 按钮变体样式配置
 * 使用CVA库定义不同的按钮样式变体
 */
const buttonVariants = cva(
  // 基础样式 - 梦幻星空主题
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
  {
    variants: {
      variant: {
        // 默认样式 - 薄荷绿渐变
        default:
          'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-105 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity',
        // 危险操作 - 粉色渐变
        destructive:
          'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:shadow-pink-500/25 hover:scale-105 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity',
        // 轮廓样式 - 紫色边框
        outline:
          'border-2 border-purple-400/50 bg-transparent text-purple-200 hover:bg-purple-500/20 hover:text-white hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95',
        // 次要样式 - 蓝色渐变
        secondary:
          'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-200 border border-blue-400/30 hover:bg-gradient-to-r hover:from-blue-500/40 hover:to-indigo-500/40 hover:text-white hover:scale-105 active:scale-95',
        // 幽灵样式 - 透明背景
        ghost:
          'text-purple-200 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 rounded-lg',
        // 链接样式 - 简单文本
        link: 'text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300 transition-colors'
      },
      size: {
        default: 'h-12 px-6 py-3 text-base',
        sm: 'h-9 px-4 py-2 text-sm',
        lg: 'h-14 px-8 py-4 text-lg',
        icon: 'h-12 w-12 p-0'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

/**
 * 按钮组件属性接口
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * 梦幻星空主题按钮组件
 * 支持多种样式变体和尺寸，具有动画效果和星空主题设计
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* 星光闪烁效果 */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
          <span className="absolute top-3/4 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-300" />
          <span className="absolute bottom-1/4 left-2/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-700" />
        </span>
        
        {/* 按钮内容 */}
        <span className="relative z-10">
          {children}
        </span>
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }