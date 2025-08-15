'use client';

import React, { useState, useEffect } from 'react';
import { useElementTouchHandler } from '../../../hooks/useTouchHandler';

export interface TouchFeedbackProps {
  children: React.ReactNode;
  className?: string;
  feedbackType?: 'ripple' | 'scale' | 'highlight' | 'none';
  feedbackColor?: string;
  feedbackDuration?: number;
  disabled?: boolean;
  onTap?: (e: TouchEvent) => void;
  onLongPress?: (e: TouchEvent) => void;
  onSwipe?: (direction: string, velocity: number) => void;
}

interface RippleEffect {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  children,
  className = '',
  feedbackType = 'ripple',
  feedbackColor = 'rgba(255, 255, 255, 0.3)',
  feedbackDuration = 600,
  disabled = false,
  onTap,
  onLongPress,
  onSwipe,
}) => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const { ref } = useElementTouchHandler({
    onTouchStart: (e) => {
      if (disabled) return;
      setIsPressed(true);
      
      if (feedbackType === 'ripple') {
        createRipple(e);
      }
    },
    onTouchEnd: () => {
      if (disabled) return;
      setIsPressed(false);
      setIsLongPressed(false);
    },
    onTap: (e, data) => {
      if (disabled) return;
      onTap?.(e);
    },
    onLongPress: (e) => {
      if (disabled) return;
      setIsLongPressed(true);
      onLongPress?.(e);
    },
    onSwipe: (e, swipe) => {
      if (disabled) return;
      onSwipe?.(swipe.direction || '', swipe.velocity);
    },
  });

  // 创建涟漪效果
  const createRipple = (e: TouchEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const newRipple: RippleEffect = {
      id: Date.now().toString(),
      x,
      y,
      timestamp: Date.now(),
    };

    setRipples(prev => [...prev, newRipple]);

    // 自动移除涟漪效果
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, feedbackDuration);
  };

  // 清理过期的涟漪效果
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRipples(prev => 
        prev.filter(ripple => now - ripple.timestamp < feedbackDuration)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [feedbackDuration]);

  // 获取反馈样式类名
  const getFeedbackClasses = () => {
    const baseClasses = 'relative overflow-hidden';
    const feedbackClasses = [];

    if (disabled) {
      feedbackClasses.push('opacity-50 cursor-not-allowed');
    } else {
      feedbackClasses.push('cursor-pointer');
    }

    switch (feedbackType) {
      case 'scale':
        feedbackClasses.push(
          'transition-transform duration-150',
          isPressed ? 'scale-95' : 'scale-100'
        );
        break;
      case 'highlight':
        feedbackClasses.push(
          'transition-colors duration-150',
          isPressed ? 'bg-gray-100 dark:bg-gray-700' : ''
        );
        break;
      case 'ripple':
        feedbackClasses.push('transition-colors duration-150');
        break;
    }

    if (isLongPressed) {
      feedbackClasses.push('ring-2 ring-blue-500 ring-opacity-50');
    }

    return `${baseClasses} ${feedbackClasses.join(' ')} ${className}`;
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={getFeedbackClasses()}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {children}
      
      {/* 涟漪效果 */}
      {feedbackType === 'ripple' && ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none rounded-full animate-ping"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
            backgroundColor: feedbackColor,
            animationDuration: `${feedbackDuration}ms`,
          }}
        />
      ))}
    </div>
  );
};

export default TouchFeedback;