'use client';

/**
 * 深邃星空粒子背景组件
 * 创建梦幻深邃的宇宙星空效果，包含多层星星、星云、流星和脉冲效果
 */

import React, { useRef, useEffect, useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';

// 辅助函数：确保透明度值在有效范围内并转换为十六进制
const toHexAlpha = (opacity: number): string => {
  const clampedOpacity = Math.min(255, Math.max(0, Math.floor(opacity * 255)));
  return clampedOpacity.toString(16).padStart(2, '0');
};

// 德拉克洛瓦星星类型定义
const delacroixStarTypes = ['classic', 'brushstroke', 'passionate'] as const;
type DelacroixStarType = typeof delacroixStarTypes[number];

// 星星闪烁类型定义
const twinkleTypes = ['none', 'slow', 'medium', 'fast', 'random'] as const;
type TwinkleType = typeof twinkleTypes[number];

interface Star {
  id: number;
  x: number;
  y: number;
  z: number; // 深度层级
  size: number;
  opacity: number;
  speed: number;
  color: string;
  twinklePhase: number;
  pulsePhase: number; // 脉冲相位
  layer: 'far' | 'mid' | 'near'; // 星星层级
  // 德拉克洛瓦风格属性
  delacroixType: DelacroixStarType; // 德拉克洛瓦星星类型
  brushAngle: number; // 笔触角度
  passionIntensity: number; // 激情强度（0-1）
  isWarmTone: boolean; // 是否为暖色调
  // 闪烁效果属性
  twinkleType: TwinkleType; // 闪烁类型
  twinkleSpeed: number; // 闪烁速度倍数
  twinkleIntensity: number; // 闪烁强度（0-1）
  baseOpacity: number; // 基础透明度
}

interface Nebula {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  // 移动效果属性
  moveSpeed: number; // 移动速度
  moveDirection: number; // 移动方向（弧度）
  driftPhase: number; // 漂移相位
  flowIntensity: number; // 流动强度（0-1）
  baseX: number; // 基础X坐标
  baseY: number; // 基础Y坐标
}

interface Meteor {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  opacity: number;
  color: string;
  // 新增属性
  startEdge: 'top' | 'right' | 'bottom' | 'left'; // 生成边缘
  targetX: number; // 目标X坐标
  targetY: number; // 目标Y坐标
  maxOpacity: number; // 最大透明度
  fadeInProgress: number; // 淡入进度
  fadeOutProgress: number; // 淡出进度
  trailIntensity: number; // 尾迹强度
  speedVariation: number; // 速度变化

}

interface StarfieldBackgroundProps {
  intensity?: 'low' | 'medium' | 'high' | 'ultra'; // 星星密度
  animated?: boolean; // 是否启用动画
  interactive?: boolean; // 是否响应鼠标交互
  showNebula?: boolean; // 是否显示星云
  showMeteors?: boolean; // 是否显示流星
  depth?: boolean; // 是否启用深度效果
  className?: string;
}

const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  intensity = 'high',
  animated = true,
  interactive = true,
  showNebula = true,
  showMeteors = true,
  depth = true,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const starsRef = useRef<Star[]>([]);
  const nebulasRef = useRef<Nebula[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  // 确保客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 根据强度设置星星数量 - 优化性能，减少数量
  const starCount = useMemo(() => {
    switch (intensity) {
      case 'low': return 80;
      case 'medium': return 150;
      case 'high': return 250;
      case 'ultra': return 400;
      default: return 150;
    }
  }, [intensity]);
  
  // 使用useMemo优化颜色配置，避免重复创建
  const starColors = useMemo(() => ({
    far: [
      '#4a5568', '#6b7280', '#9ca3af', // 冷色调
      '#8B4513', '#CD853F', '#D2691E'  // 暖色调
    ],
    mid: [
      '#e2e8f0', '#cbd5e1', '#94a3b8', // 冷色调
      '#FFD700', '#FFA500', '#FF8C00'  // 暖色调
    ],
    near: [
      '#ffffff', '#f0f9ff', '#dbeafe', // 冷色调
      '#FFD700', '#FF6B35', '#C73E1D'  // 暖色调
    ]
  }), []);

  // 使用useMemo优化星云颜色配置
  const nebulaColors = useMemo(() => [
    'rgba(147, 51, 234, 0.15)', // 紫色
    'rgba(236, 72, 153, 0.12)', // 粉色
    'rgba(59, 130, 246, 0.18)', // 蓝色
    'rgba(16, 185, 129, 0.10)', // 绿色
    'rgba(245, 101, 101, 0.08)', // 红色
    'rgba(255, 215, 0, 0.12)',   // 金黄色
    'rgba(255, 107, 53, 0.10)',  // 橙红色
  ], []);

  // 使用useMemo优化流星颜色配置
  const meteorColors = useMemo(() => [
    '#ffffff',   // 白色
    '#60a5fa',   // 蓝色
    '#a78bfa',   // 紫色
    '#fb7185',   // 粉色
    '#34d399',   // 绿色
    '#FFD700',   // 金黄色
    '#FF6B35',   // 橙红色
  ], []);
  
  // 初始化星星 - 优化性能，减少星星数量
  const initializeStars = (width: number, height: number): Star[] => {
    const totalStars = starCount; // 使用配置的星星数量，不强制增加
    return Array.from({ length: totalStars }, (_, i) => {
      // 随机分配星星层级
      const layerRandom = Math.random();
      let layer: 'far' | 'mid' | 'near';
      let z: number;
      
      if (layerRandom < 0.6) { // 增加远景星星比例
        layer = 'far';
        z = 0.1 + Math.random() * 0.3; // 0.1-0.4
      } else if (layerRandom < 0.85) {
        layer = 'mid';
        z = 0.4 + Math.random() * 0.3; // 0.4-0.7
      } else {
        layer = 'near';
        z = 0.7 + Math.random() * 0.3; // 0.7-1.0
      }
      
      const layerColors = starColors[layer];
      // 调整星星大小 - 创造真实的点状星星效果
      const baseSize = layer === 'far' ? 0.3 : layer === 'mid' ? 0.8 : 1.5; // 更小的基础大小
      const baseOpacity = layer === 'far' ? 0.4 : layer === 'mid' ? 0.7 : 0.9; // 稍微提高透明度
      const baseSpeed = layer === 'far' ? 0.1 : layer === 'mid' ? 0.3 : 0.6;
      
      // 德拉克洛瓦风格属性初始化
      const selectedColor = layerColors[Math.floor(Math.random() * layerColors.length)];
      const isWarmTone = selectedColor.includes('FF') || selectedColor.includes('D2') || selectedColor.includes('8B') || selectedColor.includes('C7') || selectedColor.includes('B2');
      
      // 根据层级和颜色决定德拉克洛瓦类型
      let delacroixType: DelacroixStarType;
      const typeRandom = Math.random();
      if (layer === 'far') {
        delacroixType = 'classic'; // 远景主要使用经典类型
      } else if (layer === 'mid') {
        delacroixType = typeRandom < 0.6 ? 'classic' : typeRandom < 0.8 ? 'brushstroke' : 'passionate';
      } else {
        delacroixType = typeRandom < 0.4 ? 'classic' : typeRandom < 0.7 ? 'brushstroke' : 'passionate';
      }
      
      // 闪烁类型分配 - 实现多样性
      let twinkleType: TwinkleType;
      let twinkleSpeed: number;
      let twinkleIntensity: number;
      
      const twinkleRandom = Math.random();
      if (twinkleRandom < 0.15) {
        // 15% 不闪烁的星星
        twinkleType = 'none';
        twinkleSpeed = 0;
        twinkleIntensity = 0;
      } else if (twinkleRandom < 0.35) {
        // 20% 慢速闪烁
        twinkleType = 'slow';
        twinkleSpeed = 0.3 + Math.random() * 0.4; // 0.3-0.7
        twinkleIntensity = 0.3 + Math.random() * 0.4; // 0.3-0.7
      } else if (twinkleRandom < 0.65) {
        // 30% 中速闪烁
        twinkleType = 'medium';
        twinkleSpeed = 0.7 + Math.random() * 0.6; // 0.7-1.3
        twinkleIntensity = 0.4 + Math.random() * 0.4; // 0.4-0.8
      } else if (twinkleRandom < 0.85) {
        // 20% 快速闪烁
        twinkleType = 'fast';
        twinkleSpeed = 1.3 + Math.random() * 1.2; // 1.3-2.5
        twinkleIntensity = 0.5 + Math.random() * 0.5; // 0.5-1.0
      } else {
        // 15% 随机闪烁
        twinkleType = 'random';
        twinkleSpeed = 0.2 + Math.random() * 2.3; // 0.2-2.5
        twinkleIntensity = 0.2 + Math.random() * 0.8; // 0.2-1.0
      }
      
      // 根据层级调整闪烁效果
      if (layer === 'far') {
        twinkleSpeed *= 0.7; // 远景星星闪烁更慢
        twinkleIntensity *= 0.8; // 闪烁强度稍弱
      } else if (layer === 'near') {
        twinkleSpeed *= 1.2; // 近景星星闪烁更明显
        twinkleIntensity *= 1.1; // 闪烁强度稍强
      }
      
      return {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        size: baseSize + Math.random() * (layer === 'far' ? 0.5 : layer === 'mid' ? 1 : 1.5), // 更小的随机变化
        opacity: baseOpacity + Math.random() * 0.2, // 减少透明度变化
        speed: baseSpeed + Math.random() * 0.4,
        color: selectedColor,
        twinklePhase: Math.random() * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        layer,
        // 德拉克洛瓦风格属性
        delacroixType,
        brushAngle: Math.random() * Math.PI * 2, // 随机笔触角度
        passionIntensity: Math.random() * 0.8 + 0.2, // 激情强度 0.2-1.0
        isWarmTone,
        // 闪烁效果属性
        twinkleType,
        twinkleSpeed,
        twinkleIntensity,
        baseOpacity
      };
    });
  };
  
  // 初始化星云 - 简化性能，减少复杂效果
  const initializeNebulas = (width: number, height: number): Nebula[] => {
    if (!showNebula) return [];
    
    return Array.from({ length: 3 }, (_, i) => {
      const baseX = Math.random() * width;
      const baseY = Math.random() * height;
      
      return {
        id: i,
        x: baseX,
        y: baseY,
        size: 200 + Math.random() * 200, // 减小尺寸范围
        color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
        opacity: 0.08 + Math.random() * 0.12, // 降低透明度
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.001, // 减慢旋转速度
        // 简化的移动效果属性
        moveSpeed: 0.01 + Math.random() * 0.02, // 大幅减慢移动速度
        moveDirection: Math.random() * Math.PI * 2,
        driftPhase: Math.random() * Math.PI * 2,
        flowIntensity: 0.2 + Math.random() * 0.3, // 降低流动强度
        baseX,
        baseY
      };
    });
  };
  
  // 简化的流星初始化函数 - 减少流星数量
  const initializeMeteors = (): Meteor[] => {
    if (!showMeteors) return [];
    
    const meteorCount = 1; // 进一步减少到1个流星
    const meteors: Meteor[] = [];
    
    for (let i = 0; i < meteorCount; i++) {
      const meteor = createRandomMeteor(i, window.innerWidth || 800, window.innerHeight || 600);
      meteors.push(meteor);
    }
    
    return meteors;
  };
  
  // 创建随机流星的辅助函数 - 限制为仅从左侧和顶部生成，确保向右下方移动
  const createRandomMeteor = (id: number, width: number, height: number): Meteor => {
    // 只允许从左侧和顶部边缘生成流星
    const edges: Array<'top' | 'left'> = ['top', 'left'];
    const startEdge = edges[Math.floor(Math.random() * edges.length)];
    
    let startX: number, startY: number, targetX: number, targetY: number, angle: number;
    
    // 根据起始边缘设置位置和角度 - 确保流星向右下方移动
    switch (startEdge) {
      case 'top':
        // 从顶部边缘生成，向右下方移动
        startX = Math.random() * width;
        startY = -100;
        // 目标点必须在右下方向
        targetX = startX + 200 + Math.random() * (width - startX + 200); // 确保向右
        targetY = height + 100 + Math.random() * 200; // 确保向下
        // 计算角度，确保向右下方
        const deltaX = targetX - startX;
        const deltaY = targetY - startY;
        angle = Math.atan2(deltaY, deltaX); // 这将确保角度在0到π/2之间（右下方）
        break;
      case 'left':
      default:
        // 从左侧边缘生成，向右下方移动
        startX = -100;
        startY = Math.random() * height;
        // 目标点必须在右下方向
        targetX = width + 100 + Math.random() * 200; // 确保向右
        targetY = startY + 100 + Math.random() * (height - startY + 200); // 确保向下
        // 计算角度，确保向右下方
        const deltaX2 = targetX - startX;
        const deltaY2 = targetY - startY;
        angle = Math.atan2(deltaY2, deltaX2); // 这将确保角度在0到π/2之间（右下方）
        break;
    }
    
    return {
      id,
      x: startX,
      y: startY,
      angle,
      speed: 1.5 + Math.random() * 4, // 1.5-5.5 速度范围
      length: 40 + Math.random() * 120, // 40-160 长度范围
      opacity: 0,
      color: meteorColors[Math.floor(Math.random() * meteorColors.length)],
      startEdge,
      targetX,
      targetY,
      maxOpacity: 0.6 + Math.random() * 0.4, // 0.6-1.0 最大透明度
      fadeInProgress: 0,
      fadeOutProgress: 0,
      trailIntensity: 0.7 + Math.random() * 0.3, // 0.7-1.0 尾迹强度
      speedVariation: 0.8 + Math.random() * 0.4, // 0.8-1.2 速度变化

    };
  };
  

  
  // 绘制优化的星星 - 简化渲染逻辑提升性能
  const drawStar = (ctx: CanvasRenderingContext2D, star: Star, time: number) => {
    let currentOpacity = star.baseOpacity;
    
    // 简化的闪烁效果计算
    if (star.twinkleType !== 'none') {
      const twinkle = Math.sin(time * 0.002 * star.twinkleSpeed + star.twinklePhase) * star.twinkleIntensity;
      currentOpacity = star.baseOpacity + twinkle * 0.4;
    }
    
    // 确保透明度在合理范围内
    currentOpacity = Math.max(0.05, Math.min(1, currentOpacity));
    
    const depthScale = depth ? star.z : 1;
    const finalOpacity = currentOpacity * depthScale;
    const finalSize = star.size * depthScale;
    
    if (finalOpacity <= 0.01) return; // 跳过几乎不可见的星星
    
    // 简化的星星渲染 - 只保留基本的圆形和光晕
    drawSimpleStar(ctx, star, finalOpacity, finalSize);
  };
  
  // 简化的星星渲染 - 优化性能
  const drawSimpleStar = (ctx: CanvasRenderingContext2D, star: Star, opacity: number, size: number) => {
    const coreSize = Math.max(0.8, size * 0.6);
    
    // 绘制核心
    ctx.fillStyle = `${star.color}${toHexAlpha(opacity)}`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, coreSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 简化的光晕效果 - 只对较亮的星星添加
    if (opacity > 0.6 && star.layer === 'near') {
      const haloGradient = ctx.createRadialGradient(
        star.x, star.y, coreSize,
        star.x, star.y, coreSize * 2.5
      );
      
      const haloOpacity = opacity * 0.3;
      haloGradient.addColorStop(0, `${star.color}${toHexAlpha(haloOpacity)}`);
      haloGradient.addColorStop(0.7, `${star.color}${toHexAlpha(haloOpacity * 0.2)}`);
      haloGradient.addColorStop(1, `${star.color}00`);
      
      ctx.fillStyle = haloGradient;
      ctx.beginPath();
      ctx.arc(star.x, star.y, coreSize * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // 经典德拉克洛瓦星星 - 基础核心绘制
  const drawClassicDelacroixStar = (ctx: CanvasRenderingContext2D, star: Star, opacity: number, size: number) => {
    const coreSize = Math.max(1.0, size * 0.7);
    
    // 绘制星星核心
    ctx.fillStyle = `${star.color}${toHexAlpha(opacity)}`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, coreSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 基础光晕效果
    if (opacity > 0.5) {
      const haloGradient = ctx.createRadialGradient(
        star.x, star.y, coreSize,
        star.x, star.y, coreSize * 3
      );
      
      const haloOpacity = opacity * 0.4;
      haloGradient.addColorStop(0, `${star.color}${toHexAlpha(haloOpacity)}`);
      haloGradient.addColorStop(0.5, `${star.color}${toHexAlpha(haloOpacity * 0.3)}`);
      haloGradient.addColorStop(1, `${star.color}00`);
      
      ctx.fillStyle = haloGradient;
      ctx.beginPath();
      ctx.arc(star.x, star.y, coreSize * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // 笔触风格德拉克洛瓦星星 - 模拟油画笔触
  const drawBrushstrokeDelacroixStar = (ctx: CanvasRenderingContext2D, star: Star, opacity: number, size: number, time: number) => {
    const coreSize = Math.max(1.0, size * 0.7);
    
    // 绘制核心
    drawClassicDelacroixStar(ctx, star, opacity, size);
    
    // 德拉克洛瓦式的动态笔触效果
    if (opacity > 0.6 && star.layer !== 'far') {
      const brushLength = coreSize * (2 + star.passionIntensity * 2);
      const brushOpacity = opacity * 0.6 * star.passionIntensity;
      
      // 动态笔触角度 - 模拟画家的激情笔触
      const dynamicAngle = star.brushAngle + Math.sin(time * 0.001 + star.id) * 0.3;
      
      // 绘制多条不规则笔触 - 模拟厚涂效果
      for (let i = 0; i < 3; i++) {
        const angleOffset = (i - 1) * 0.2;
        const currentAngle = dynamicAngle + angleOffset;
        const strokeLength = brushLength * (0.7 + Math.random() * 0.6);
        
        const startX = star.x + Math.cos(currentAngle) * coreSize * 0.5;
        const startY = star.y + Math.sin(currentAngle) * coreSize * 0.5;
        const endX = star.x + Math.cos(currentAngle) * strokeLength;
        const endY = star.y + Math.sin(currentAngle) * strokeLength;
        
        // 创建笔触渐变
        const strokeGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        strokeGradient.addColorStop(0, `${star.color}${toHexAlpha(brushOpacity)}`);
        strokeGradient.addColorStop(0.5, `${star.color}${toHexAlpha(brushOpacity * 0.6)}`);
        strokeGradient.addColorStop(1, `${star.color}00`);
        
        ctx.strokeStyle = strokeGradient;
        ctx.lineWidth = 1.5 + star.passionIntensity;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }
  };
  
  // 激情风格德拉克洛瓦星星 - 戏剧性光芒和强烈表现
  const drawPassionateDelacroixStar = (ctx: CanvasRenderingContext2D, star: Star, opacity: number, size: number, time: number) => {
    const coreSize = Math.max(1.2, size * 0.8);
    
    // 绘制强化的核心
    drawClassicDelacroixStar(ctx, star, opacity, size);
    
    // 德拉克洛瓦式的戏剧性光芒 - 仅用于近景和部分中景星星
    if (opacity > 0.7 && (star.layer === 'near' || (star.layer === 'mid' && star.passionIntensity > 0.6))) {
      const spikeLength = coreSize * (3 + star.passionIntensity * 2);
      const spikeOpacity = opacity * 0.7 * star.passionIntensity;
      
      // 动态的激情光芒 - 不规则且富有表现力
      const passionPulse = Math.sin(time * 0.005 + star.pulsePhase) * 0.3 + 0.7;
      const spikes = star.isWarmTone ? 6 : 4; // 暖色调星星有更多光芒
      
      for (let i = 0; i < spikes; i++) {
        const baseAngle = (i * Math.PI * 2) / spikes;
        // 添加不规则性 - 德拉克洛瓦的自由笔触
        const angleVariation = Math.sin(time * 0.003 + star.id + i) * 0.4;
        const angle = baseAngle + angleVariation;
        
        const dynamicLength = spikeLength * (0.6 + Math.sin(time * 0.004 + i) * 0.4) * passionPulse;
        
        const startX = star.x + Math.cos(angle) * coreSize;
        const startY = star.y + Math.sin(angle) * coreSize;
        const endX = star.x + Math.cos(angle) * dynamicLength;
        const endY = star.y + Math.sin(angle) * dynamicLength;
        
        // 戏剧性的光芒渐变
        const dramaticGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        const intensityMultiplier = star.isWarmTone ? 1.3 : 1.0;
        
        dramaticGradient.addColorStop(0, `${star.color}${toHexAlpha(spikeOpacity * intensityMultiplier)}`);
        dramaticGradient.addColorStop(0.4, `${star.color}${toHexAlpha(spikeOpacity * 0.6 * intensityMultiplier)}`);
        dramaticGradient.addColorStop(0.8, `${star.color}${toHexAlpha(spikeOpacity * 0.2)}`);
        dramaticGradient.addColorStop(1, `${star.color}00`);
        
        ctx.strokeStyle = dramaticGradient;
        ctx.lineWidth = 1.2 + star.passionIntensity * 0.8;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      
      // 额外的激情光晕 - 仅用于最强烈的星星
      if (star.passionIntensity > 0.8 && star.isWarmTone) {
        const passionHalo = ctx.createRadialGradient(
          star.x, star.y, coreSize,
          star.x, star.y, coreSize * 5
        );
        
        const haloOpacity = opacity * 0.3 * star.passionIntensity;
        passionHalo.addColorStop(0, `${star.color}${toHexAlpha(haloOpacity)}`);
        passionHalo.addColorStop(0.3, `${star.color}${toHexAlpha(haloOpacity * 0.5)}`);
        passionHalo.addColorStop(1, `${star.color}00`);
        
        ctx.fillStyle = passionHalo;
        ctx.beginPath();
        ctx.arc(star.x, star.y, coreSize * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
  
  // 绘制星云
  const drawNebula = (ctx: CanvasRenderingContext2D, nebula: Nebula, time: number) => {
    ctx.save();
    
    // 应用旋转
    ctx.translate(nebula.x, nebula.y);
    ctx.rotate(nebula.rotation + time * nebula.rotationSpeed);
    
    // 创建复杂的径向渐变
    const gradient = ctx.createRadialGradient(
      0, 0, 0,
      0, 0, nebula.size
    );
    
    gradient.addColorStop(0, nebula.color);
    gradient.addColorStop(0.3, nebula.color.replace(/[\d\.]+\)$/, '0.05)'));
    gradient.addColorStop(0.7, nebula.color.replace(/[\d\.]+\)$/, '0.02)'));
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, nebula.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };
  
  // 优化的流星绘制函数 - 真实感流星头部和自然波动尾迹
  const drawMeteor = (ctx: CanvasRenderingContext2D, meteor: Meteor) => {
    if (meteor.opacity <= 0) return;
    
    const tailLength = meteor.length * meteor.trailIntensity;
    const headX = meteor.x;
    const headY = meteor.y;
    const time = Date.now() * 0.001; // 用于动态效果的时间
    
    // 保存画布状态
    ctx.save();
    
    // 设置混合模式以增强发光效果
    ctx.globalCompositeOperation = 'screen';
    
    // 绘制多层波动尾迹 - 更自然的流星尾巴
    for (let layer = 0; layer < 4; layer++) {
      const layerOpacity = meteor.opacity * (1 - layer * 0.25);
      const layerWidth = Math.max(0.5, (4 - layer) * 1.2);
      const layerLength = tailLength * (1 - layer * 0.15);
      
      // 创建波动的尾迹路径
      ctx.beginPath();
      const segments = 12; // 分段数量，用于创建波动效果
      
      for (let i = 0; i <= segments; i++) {
        const progress = i / segments;
        const baseX = headX - Math.cos(meteor.angle) * layerLength * progress;
        const baseY = headY - Math.sin(meteor.angle) * layerLength * progress;
        
        // 添加波动效果 - 垂直于运动方向的轻微摆动
        const waveAmplitude = (1 - progress) * 2 * (layer + 1) * 0.3; // 尾部摆动更大
        const waveFreq = 3 + layer * 0.5;
        const waveOffset = Math.sin(time * 2 + meteor.id + progress * waveFreq) * waveAmplitude;
        
        // 计算垂直于运动方向的偏移
        const perpX = -Math.sin(meteor.angle) * waveOffset;
        const perpY = Math.cos(meteor.angle) * waveOffset;
        
        const x = baseX + perpX;
        const y = baseY + perpY;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      // 创建渐变效果
      const tailX = headX - Math.cos(meteor.angle) * layerLength;
      const tailY = headY - Math.sin(meteor.angle) * layerLength;
      const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
      gradient.addColorStop(0, `${meteor.color}00`);
      gradient.addColorStop(0.2, `${meteor.color}${toHexAlpha(layerOpacity * 0.1)}`);
      gradient.addColorStop(0.6, `${meteor.color}${toHexAlpha(layerOpacity * 0.4)}`);
      gradient.addColorStop(1, `${meteor.color}${toHexAlpha(layerOpacity)}`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = layerWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    
    // 绘制真实感流星头部 - 亮核心加外围光晕
    // 1. 外层光晕 - 大范围柔和光晕
    const outerGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 18);
    outerGlow.addColorStop(0, `${meteor.color}${toHexAlpha(meteor.opacity * 0.3)}`);
    outerGlow.addColorStop(0.3, `${meteor.color}${toHexAlpha(meteor.opacity * 0.15)}`);
    outerGlow.addColorStop(0.7, `${meteor.color}${toHexAlpha(meteor.opacity * 0.05)}`);
    outerGlow.addColorStop(1, `${meteor.color}00`);
    
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(headX, headY, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. 中层光晕 - 中等强度
    const midGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 8);
    midGlow.addColorStop(0, `${meteor.color}${toHexAlpha(meteor.opacity * 0.7)}`);
    midGlow.addColorStop(0.4, `${meteor.color}${toHexAlpha(meteor.opacity * 0.4)}`);
    midGlow.addColorStop(0.8, `${meteor.color}${toHexAlpha(meteor.opacity * 0.1)}`);
    midGlow.addColorStop(1, `${meteor.color}00`);
    
    ctx.fillStyle = midGlow;
    ctx.beginPath();
    ctx.arc(headX, headY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 3. 内核 - 明亮的核心，带微妙闪烁
    const coreFlicker = 0.8 + Math.sin(time * 8 + meteor.id) * 0.2; // 快速闪烁
    const coreGradient = ctx.createRadialGradient(headX, headY, 0, headX, headY, 3);
    coreGradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity * coreFlicker})`);
    coreGradient.addColorStop(0.3, `${meteor.color}${toHexAlpha(meteor.opacity * 0.9)}`);
    coreGradient.addColorStop(0.7, `${meteor.color}${toHexAlpha(meteor.opacity * 0.6)}`);
    coreGradient.addColorStop(1, `${meteor.color}${toHexAlpha(meteor.opacity * 0.2)}`);
    
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(headX, headY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 4. 最内层亮点 - 极亮的中心点
    const centerFlicker = 0.7 + Math.sin(time * 12 + meteor.id * 1.5) * 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity * centerFlicker})`;
    ctx.beginPath();
    ctx.arc(headX, headY, 1, 0, Math.PI * 2);
    ctx.fill();
    

    
    // 恢复画布状态
    ctx.restore();
  };
  
  // 更新星星位置 - 增强深度移动效果
  const updateStar = (star: Star, width: number, height: number, mouseX: number, mouseY: number) => {
    if (animated) {
      // 根据深度调整移动速度
      const depthSpeed = depth ? star.z * star.speed : star.speed;
      star.y -= depthSpeed;
      
      // 添加轻微的水平漂移
      star.x += Math.sin(Date.now() * 0.0001 + star.id) * 0.1;
      
      // 如果星星移出屏幕顶部，重新从底部生成
      if (star.y < -10) {
        star.y = height + 10;
        star.x = Math.random() * width;
      }
      
      // 边界检查
      if (star.x < -10) star.x = width + 10;
      if (star.x > width + 10) star.x = -10;
      
      // 鼠标交互效果 - 根据层级调整影响力
      if (interactive) {
        const dx = mouseX - star.x;
        const dy = mouseY - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = star.layer === 'near' ? 150 : star.layer === 'mid' ? 100 : 50;
        
        if (distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          const pushStrength = star.layer === 'near' ? 1.0 : star.layer === 'mid' ? 0.7 : 0.4;
          star.x -= (dx / distance) * force * pushStrength;
          star.y -= (dy / distance) * force * pushStrength;
        }
      }
    }
  };
  
  // 更新星云 - 添加缓慢移动和流动效果
  const updateNebula = (nebula: Nebula, time: number, width: number, height: number) => {
    if (animated) {
      // 原有的旋转效果
      nebula.rotation += nebula.rotationSpeed;
      
      // 轻微的脉动效果
      const pulse = Math.sin(time * 0.0005) * 0.1;
      nebula.opacity = Math.max(0.05, Math.min(0.3, nebula.opacity + pulse * 0.01));
      
      // 缓慢的移动效果 - 基于时间的平滑移动
      const moveTime = time * 0.0001; // 非常缓慢的时间因子
      
      // 主要移动方向
      const primaryMoveX = Math.cos(nebula.moveDirection) * nebula.moveSpeed * moveTime;
      const primaryMoveY = Math.sin(nebula.moveDirection) * nebula.moveSpeed * moveTime;
      
      // 流动效果 - 添加波浪式的漂移
      const driftX = Math.sin(moveTime * 2 + nebula.driftPhase) * nebula.flowIntensity * 30;
      const driftY = Math.cos(moveTime * 1.5 + nebula.driftPhase + Math.PI / 3) * nebula.flowIntensity * 20;
      
      // 轻微的椭圆轨道运动
      const orbitX = Math.sin(moveTime * 0.5 + nebula.id) * nebula.flowIntensity * 15;
      const orbitY = Math.cos(moveTime * 0.3 + nebula.id + Math.PI / 4) * nebula.flowIntensity * 10;
      
      // 更新位置
      nebula.x = nebula.baseX + primaryMoveX + driftX + orbitX;
      nebula.y = nebula.baseY + primaryMoveY + driftY + orbitY;
      
      // 边界处理 - 当星云移出屏幕时，从对面重新进入
      const margin = nebula.size; // 使用星云大小作为边界缓冲
      
      if (nebula.x < -margin) {
        nebula.baseX = width + margin;
        nebula.x = nebula.baseX;
      } else if (nebula.x > width + margin) {
        nebula.baseX = -margin;
        nebula.x = nebula.baseX;
      }
      
      if (nebula.y < -margin) {
        nebula.baseY = height + margin;
        nebula.y = nebula.baseY;
      } else if (nebula.y > height + margin) {
        nebula.baseY = -margin;
        nebula.y = nebula.baseY;
      }
    }
  };
  
  // 增强的流星更新函数 - 更自然的动画和生命周期，确保向右下方移动
  const updateMeteor = (meteor: Meteor, width: number, height: number, time: number) => {
    if (animated) {
      // 应用速度变化
      const currentSpeed = meteor.speed * meteor.speedVariation;
      
      // 计算速度向量，确保始终向右下方移动
      const vx = Math.abs(Math.cos(meteor.angle)) * currentSpeed; // 确保水平速度为正（向右）
      const vy = Math.abs(Math.sin(meteor.angle)) * currentSpeed; // 确保垂直速度为正（向下）
      
      // 移动流星 - 使用确保为正值的速度向量
      meteor.x += vx;
      meteor.y += vy;
      
      // 计算到目标点的距离
      const distanceToTarget = Math.sqrt(
        Math.pow(meteor.targetX - meteor.x, 2) + Math.pow(meteor.targetY - meteor.y, 2)
      );
      
      // 计算总路径长度
      const totalDistance = Math.sqrt(
        Math.pow(meteor.targetX - (meteor.x - Math.cos(meteor.angle) * currentSpeed * 100), 2) +
        Math.pow(meteor.targetY - (meteor.y - Math.sin(meteor.angle) * currentSpeed * 100), 2)
      );
      
      // 计算生命周期进度
      const progress = Math.max(0, Math.min(1, 1 - distanceToTarget / totalDistance));
      
      // 更自然的淡入淡出效果
      if (progress < 0.15) {
        // 淡入阶段
        meteor.fadeInProgress = progress / 0.15;
        meteor.opacity = meteor.maxOpacity * meteor.fadeInProgress;
      } else if (progress > 0.75) {
        // 淡出阶段
        meteor.fadeOutProgress = (progress - 0.75) / 0.25;
        meteor.opacity = meteor.maxOpacity * (1 - meteor.fadeOutProgress);
      } else {
        // 稳定阶段
        meteor.opacity = meteor.maxOpacity;
      }
      
      // 添加轻微的闪烁效果
      const flicker = 0.9 + Math.sin(time * 0.01 + meteor.id) * 0.1;
      meteor.opacity *= flicker;
      
      // 检查是否需要重置流星
      const margin = 300;
      const isOutOfBounds = 
        meteor.x < -margin || meteor.x > width + margin ||
        meteor.y < -margin || meteor.y > height + margin ||
        distanceToTarget < 50; // 接近目标点时也重置
      
      if (isOutOfBounds || meteor.opacity <= 0.01) {
        // 重置流星 - 重新从随机边缘生成
        const newMeteor = createRandomMeteor(meteor.id, width, height);
        Object.assign(meteor, newMeteor);
      }
    }
  };
  
  // 动画循环 - 集成所有元素
  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 设置混合模式以增强视觉效果
    ctx.globalCompositeOperation = 'screen';
    
    // 绘制和更新星云（背景层）
    if (showNebula) {
      nebulasRef.current.forEach(nebula => {
        updateNebula(nebula, time, width, height);
        drawNebula(ctx, nebula, time);
      });
    }
    
    // 重置混合模式
    ctx.globalCompositeOperation = 'source-over';
    
    // 按层级绘制星星（远到近）
    const starsByLayer = {
      far: starsRef.current.filter(star => star.layer === 'far'),
      mid: starsRef.current.filter(star => star.layer === 'mid'),
      near: starsRef.current.filter(star => star.layer === 'near')
    };
    
    // 绘制远景星星
    starsByLayer.far.forEach(star => {
      updateStar(star, width, height, mouseRef.current.x, mouseRef.current.y);
      drawStar(ctx, star, time);
    });
    
    // 绘制中景星星
    starsByLayer.mid.forEach(star => {
      updateStar(star, width, height, mouseRef.current.x, mouseRef.current.y);
      drawStar(ctx, star, time);
    });
    
    // 绘制近景星星
    starsByLayer.near.forEach(star => {
      updateStar(star, width, height, mouseRef.current.x, mouseRef.current.y);
      drawStar(ctx, star, time);
    });
    
    // 绘制和更新流星（前景层）
    if (showMeteors) {
      meteorsRef.current.forEach(meteor => {
        updateMeteor(meteor, width, height, time);
        drawMeteor(ctx, meteor);
      });
    }
    
    if (animated) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  
  // 增强的鼠标移动处理 - 支持流星生成
  const handleMouseMove = (event: MouseEvent) => {
    if (!interactive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const newMouseX = event.clientX - rect.left;
    const newMouseY = event.clientY - rect.top;
    
    // 更新鼠标位置
    mouseRef.current = {
      x: newMouseX,
      y: newMouseY
    };
  };
  

  
  // 处理窗口大小变化
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // 重新初始化所有元素
    starsRef.current = initializeStars(canvas.width, canvas.height);
    nebulasRef.current = initializeNebulas(canvas.width, canvas.height);
    meteorsRef.current = initializeMeteors();
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 设置画布大小
    handleResize();
    
    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }
    
    // 定期生成新流星以增加频率
    const meteorInterval = setInterval(() => {
      if (animated && meteorsRef.current.length < 10) { // 限制最大流星数量减少一半
        const newMeteor = createRandomMeteor(
          Date.now() + Math.random(), 
          canvas.width, 
          canvas.height
        );
        meteorsRef.current.push(newMeteor);
      }
    }, 3000 + Math.random() * 4000); // 3-7秒间隔，频率减少一半
    
    // 开始动画
    if (animated) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // 静态渲染
      animate(0);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
      clearInterval(meteorInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animated, interactive, starCount, showNebula, showMeteors, depth]);
  
  return (
    <div className={`fixed inset-0 overflow-hidden z-0 ${isClient && !interactive ? 'pointer-events-none' : ''}`}>
      {/* 深邃星空渐变背景 - 更接近图2的深蓝色效果 */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, #0a0e27 0%, #1a1b3a 25%, #2d1b69 50%, #1e1b4b 75%, #0f0f23 100%)'
      }} />
      
      {/* 星云背景层 */}
      {showNebula && (
        <motion.div
          className="absolute inset-0 opacity-20 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse at 30% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 60%)',
              'radial-gradient(ellipse at 70% 70%, rgba(59, 130, 246, 0.4) 0%, transparent 60%)',
              'radial-gradient(ellipse at 50% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
              'radial-gradient(ellipse at 20% 80%, rgba(147, 51, 234, 0.4) 0%, transparent 60%)'
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* 星星画布 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      />
      
      {/* 深空光效层 */}
      <motion.div
        className="absolute inset-0 opacity-25 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.2) 0%, transparent 40%)',
            'radial-gradient(circle at 90% 90%, rgba(168, 85, 247, 0.2) 0%, transparent 40%)',
            'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 40%)'
          ]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear'
        }}
      />
      
      {/* 脉冲光环效果 */}
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.3) 0%, transparent 70%)'
        }}
      />
    </div>
  );
};

// 使用React.memo优化组件渲染性能
export default memo(StarfieldBackground);