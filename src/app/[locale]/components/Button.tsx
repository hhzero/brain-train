import React, { useState } from 'react'

/**
 * 按钮组件属性接口
 */
interface ButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'magic'
  rounded?: boolean
  size?: 'small' | 'medium' | 'large'
  type?: 'button' | 'submit' | 'reset'
  onBlur?: () => void
  disabled?: boolean
  loading?: boolean
  glow?: boolean
  style?: React.CSSProperties
}

/**
 * 动漫风格按钮组件
 * 提供丰富的动画效果和交互反馈
 */
const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  onClick,
  variant = 'primary',
  rounded = false,
  size = 'medium',
  type = 'button',
  onBlur,
  disabled = false,
  loading = false,
  glow = false,
  style
}) => {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  /**
   * 处理按钮点击事件，添加涟漪效果
   */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // 创建涟漪效果
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    
    setRipples(prev => [...prev, newRipple]);
    
    // 移除涟漪效果
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    // 执行点击回调
    if (onClick) {
      onClick();
    }
  };

  /**
   * 获取尺寸样式类
   */
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 text-sm min-h-[32px]'
      case 'medium':
        return 'px-4 py-2.5 text-base min-h-[40px]'
      case 'large':
        return 'px-6 py-3.5 text-lg min-h-[48px]'
      default:
        return 'px-4 py-2.5 text-base min-h-[40px]'
    }
  }

  /**
   * 获取变体样式类
   */
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
      case 'secondary':
        return 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl'
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
      case 'magic':
        return 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl animate-gradient-x'
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
    }
  }

  /**
   * 获取基础样式类
   */
  const getBaseClasses = () => {
    const baseClasses = [
      'relative',
      'overflow-hidden',
      'font-semibold',
      'transform',
      'transition-all',
      'duration-200',
      'ease-in-out',
      'focus:outline-none',
      'focus:ring-4',
      'focus:ring-opacity-50',
      'active:scale-95',
      'select-none',
      'z-50'
    ];

    if (!disabled && !loading) {
      baseClasses.push('hover:scale-105', 'hover:-translate-y-0.5');
    }

    if (glow) {
      baseClasses.push('animate-pulse');
    }

    if (rounded) {
      baseClasses.push('rounded-full');
    } else {
      baseClasses.push('rounded-xl');
    }

    if (disabled || loading) {
      baseClasses.push('opacity-60', 'cursor-not-allowed', 'transform-none');
    } else {
      baseClasses.push('cursor-pointer');
    }

    return baseClasses.join(' ');
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      onBlur={onBlur}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={disabled || loading}
      style={style}
      className={`
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${getBaseClasses()}
        ${isPressed ? 'scale-95' : ''}
        ${className}
      `}
    >
      {/* 涟漪效果 */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '0.6s'
          }}
        />
      ))}
      
      {/* 加载状态 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {/* 按钮内容 */}
      <span className={`relative z-10 flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      
      {/* 发光效果 */}
      {glow && !disabled && !loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
      )}
    </button>
  )
}

export default Button
