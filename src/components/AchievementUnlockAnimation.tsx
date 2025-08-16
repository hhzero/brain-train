'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Sparkles, 
  Crown, 
  Trophy, 
  Gem, 
  Zap, 
  Shield, 
  Award,
  Target,
  X
} from 'lucide-react';
import { Achievement } from './AchievementSystem';

// 成就稀有度类型
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

// 粒子效果接口
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'star' | 'sparkle' | 'circle' | 'diamond';
}

// 动画配置接口
interface AnimationConfig {
  duration: number;
  particleCount: number;
  colors: string[];
  glowIntensity: number;
  shakeIntensity: number;
}

// 组件属性接口
interface AchievementUnlockAnimationProps {
  achievement: Achievement | null;
  isVisible: boolean;
  onClose: () => void;
  onComplete?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

// 稀有度动画配置
const RARITY_CONFIGS: Record<AchievementRarity, AnimationConfig> = {
  common: {
    duration: 3000,
    particleCount: 20,
    colors: ['#60a5fa', '#34d399', '#fbbf24'],
    glowIntensity: 0.3,
    shakeIntensity: 2
  },
  rare: {
    duration: 4000,
    particleCount: 35,
    colors: ['#8b5cf6', '#ec4899', '#06b6d4'],
    glowIntensity: 0.5,
    shakeIntensity: 4
  },
  epic: {
    duration: 5000,
    particleCount: 50,
    colors: ['#f59e0b', '#ef4444', '#8b5cf6'],
    glowIntensity: 0.7,
    shakeIntensity: 6
  },
  legendary: {
    duration: 6000,
    particleCount: 80,
    colors: ['#fbbf24', '#f59e0b', '#dc2626', '#7c3aed'],
    glowIntensity: 1.0,
    shakeIntensity: 8
  }
};

// 稀有度样式
const RARITY_STYLES = {
  common: {
    gradient: 'from-blue-400 to-green-400',
    border: 'border-blue-400/50',
    glow: 'shadow-blue-400/30',
    text: 'text-blue-300'
  },
  rare: {
    gradient: 'from-purple-400 to-pink-400',
    border: 'border-purple-400/50',
    glow: 'shadow-purple-400/30',
    text: 'text-purple-300'
  },
  epic: {
    gradient: 'from-orange-400 to-red-400',
    border: 'border-orange-400/50',
    glow: 'shadow-orange-400/30',
    text: 'text-orange-300'
  },
  legendary: {
    gradient: 'from-yellow-400 via-orange-400 to-red-400',
    border: 'border-yellow-400/50',
    glow: 'shadow-yellow-400/30',
    text: 'text-yellow-300'
  }
};

/**
 * 成就解锁动画组件
 * 提供华丽的成就解锁视觉效果和粒子动画
 */
export const AchievementUnlockAnimation: React.FC<AchievementUnlockAnimationProps> = ({
  achievement,
  isVisible,
  onClose,
  onComplete,
  autoClose = true,
  autoCloseDelay = 5000
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'display' | 'exit'>('enter');
  const [showContent, setShowContent] = useState(false);

  // 生成粒子
  const generateParticles = (config: AnimationConfig): Particle[] => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < config.particleCount; i++) {
      const angle = (Math.PI * 2 * i) / config.particleCount + Math.random() * 0.5;
      const velocity = 2 + Math.random() * 3;
      const life = 1000 + Math.random() * 2000;
      
      newParticles.push({
        id: i,
        x: 50, // 中心位置
        y: 50,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life,
        maxLife: life,
        size: 2 + Math.random() * 4,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        type: ['star', 'sparkle', 'circle', 'diamond'][Math.floor(Math.random() * 4)] as Particle['type']
      });
    }
    
    return newParticles;
  };

  // 更新粒子位置
  const updateParticles = (particles: Particle[]): Particle[] => {
    return particles
      .map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * 0.98, // 阻力
        vy: particle.vy * 0.98 + 0.1, // 重力
        life: particle.life - 16 // 假设60fps
      }))
      .filter(particle => particle.life > 0 && particle.x > -10 && particle.x < 110 && particle.y < 110);
  };

  // 初始化动画
  useEffect(() => {
    if (isVisible && achievement) {
      const config = RARITY_CONFIGS[achievement.rarity];
      setParticles(generateParticles(config));
      setAnimationPhase('enter');
      
      // 延迟显示内容
      setTimeout(() => {
        setShowContent(true);
        setAnimationPhase('display');
      }, 800);
      
      // 自动关闭
      if (autoClose) {
        setTimeout(() => {
          setAnimationPhase('exit');
          setTimeout(() => {
            onClose();
            if (onComplete) onComplete();
          }, 500);
        }, autoCloseDelay);
      }
    }
  }, [isVisible, achievement, autoClose, autoCloseDelay, onClose, onComplete]);

  // 粒子动画循环
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setParticles(prev => updateParticles(prev));
    }, 16);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  // 渲染粒子
  const renderParticle = (particle: Particle) => {
    const opacity = particle.life / particle.maxLife;
    const scale = Math.min(1, particle.life / (particle.maxLife * 0.3));
    
    const ParticleIcon = (() => {
      switch (particle.type) {
        case 'star': return Star;
        case 'sparkle': return Sparkles;
        case 'diamond': return Gem;
        default: return Star;
      }
    })();
    
    if (particle.type === 'circle') {
      return (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity,
            transform: `scale(${scale})`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
        />
      );
    }
    
    return (
      <ParticleIcon
        key={particle.id}
        className="absolute"
        style={{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          color: particle.color,
          opacity,
          transform: `scale(${scale})`,
          filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`
        }}
      />
    );
  };

  // 获取成就图标
  const getAchievementIcon = (type: string) => {
    const iconMap = {
      training: Trophy,
      accuracy: Target,
      speed: Zap,
      consistency: Shield,
      milestone: Star,
      special: Crown,
      streak: Award
    };
    
    const IconComponent = iconMap[type as keyof typeof iconMap] || Trophy;
    return <IconComponent className="w-16 h-16" />;
  };

  if (!isVisible || !achievement) {
    return null;
  }

  const config = RARITY_CONFIGS[achievement.rarity];
  const styles = RARITY_STYLES[achievement.rarity];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)'
        }}
      >
        {/* 背景粒子效果 */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map(renderParticle)}
        </div>
        
        {/* 背景光晕 */}
        <motion.div
          className={`absolute w-96 h-96 rounded-full bg-gradient-to-r ${styles.gradient} opacity-20 blur-3xl`}
          initial={{ scale: 0 }}
          animate={{ 
            scale: animationPhase === 'enter' ? [0, 1.5, 1] : 1,
            rotate: 360
          }}
          transition={{ 
            scale: { duration: 1.5, times: [0, 0.6, 1] },
            rotate: { duration: 10, repeat: Infinity, ease: "linear" }
          }}
        />
        
        {/* 主要内容 */}
        <motion.div
          className="relative z-10 max-w-md w-full mx-4"
          initial={{ scale: 0, y: 50 }}
          animate={{ 
            scale: showContent ? 1 : 0,
            y: showContent ? 0 : 50
          }}
          exit={{ scale: 0, y: -50 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          {/* 成就卡片 */}
          <div className={`relative bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 border-2 ${styles.border} overflow-hidden`}>
            {/* 卡片背景效果 */}
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-5`} />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
            
            {/* 关闭按钮 */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </motion.button>
            
            <div className="relative z-10 text-center">
              {/* 成就解锁标题 */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-6xl mb-2">🎉</div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  成就解锁！
                </h2>
                <div className={`text-sm font-medium ${styles.text} uppercase tracking-wider`}>
                  {achievement.rarity === 'common' && '普通'}
                  {achievement.rarity === 'rare' && '稀有'}
                  {achievement.rarity === 'epic' && '史诗'}
                  {achievement.rarity === 'legendary' && '传奇'}
                </div>
              </motion.div>
              
              {/* 成就图标 */}
              <motion.div
                className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${styles.gradient} mb-6 relative`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  delay: 0.5,
                  duration: 1
                }}
                style={{
                  boxShadow: `0 0 40px ${styles.glow.replace('shadow-', '').replace('/30', '')}`
                }}
              >
                <div className="text-white drop-shadow-lg">
                  {getAchievementIcon(achievement.type)}
                </div>
                
                {/* 图标光环 */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${styles.gradient} opacity-50`}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              {/* 成就信息 */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-xl font-bold text-white">
                  {achievement.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {achievement.description}
                </p>
                
                {/* 积分信息 */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Gem className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">
                    +{achievement.points} 积分
                  </span>
                </div>
              </motion.div>
              
              {/* 继续按钮 */}
              <motion.button
                onClick={onClose}
                className={`mt-8 px-8 py-3 bg-gradient-to-r ${styles.gradient} rounded-xl text-white font-medium hover:scale-105 transition-transform`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                继续训练
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        {/* 额外的装饰粒子 */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [-20, -100]
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementUnlockAnimation;