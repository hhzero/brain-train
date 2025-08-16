'use client';

import React from 'react';
import { TrainingType, TrainingResult, DifficultyLevel } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Target, 
  Clock, 
  TrendingUp, 
  Award,
  Zap,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ExperienceCalculatorProps {
  result: TrainingResult;
  className?: string;
  showBreakdown?: boolean;
}

// 基础经验值配置
const BASE_EXPERIENCE = {
  gaze: 10,
  schulte: 15,
  'multi-attention': 20,
  'cognitive-flexibility': 25
};

// 难度系数
const DIFFICULTY_MULTIPLIER = {
  beginner: 1.0,
  intermediate: 1.2,
  advanced: 1.5,
  expert: 2.0,
  master: 2.5
};

// 准确率奖励系数
const ACCURACY_BONUS = {
  perfect: 2.0,    // 100%
  excellent: 1.5,  // 95-99%
  good: 1.2,       // 85-94%
  average: 1.0,    // 70-84%
  poor: 0.8        // <70%
};

// 速度奖励系数
const SPEED_BONUS = {
  lightning: 1.5,  // 前10%
  fast: 1.3,       // 前25%
  normal: 1.0,     // 平均
  slow: 0.9        // 后25%
};

// 连续训练奖励
const STREAK_BONUS = {
  1: 1.0,
  3: 1.1,
  7: 1.2,
  14: 1.3,
  30: 1.5,
  60: 1.8,
  100: 2.0
};

// 完美表现奖励
const PERFECT_PERFORMANCE_BONUS = 50;

// 首次完成奖励
const FIRST_TIME_BONUS = 20;

// 个人最佳奖励
const PERSONAL_BEST_BONUS = 30;

/**
 * 计算经验值
 */
export const calculateExperience = (
  result: TrainingResult,
  streakDays: number = 1,
  isFirstTime: boolean = false,
  isPersonalBest: boolean = false
): {
  totalExperience: number;
  breakdown: {
    base: number;
    difficulty: number;
    accuracy: number;
    speed: number;
    streak: number;
    perfect: number;
    firstTime: number;
    personalBest: number;
  };
} => {
  // 基础经验值
  const baseExp = BASE_EXPERIENCE[result.type as keyof typeof BASE_EXPERIENCE] || 10;
  
  // 难度系数 - 从difficultyProgression获取最后一个难度
  const currentDifficulty = result.difficultyProgression?.[result.difficultyProgression.length - 1] || 'beginner';
  const difficultyMultiplier = DIFFICULTY_MULTIPLIER[currentDifficulty as keyof typeof DIFFICULTY_MULTIPLIER] || 1.0;
  const difficultyExp = Math.floor(baseExp * (difficultyMultiplier - 1));
  
  // 准确率奖励
  let accuracyMultiplier = ACCURACY_BONUS.poor;
  if (result.accuracy >= 100) accuracyMultiplier = ACCURACY_BONUS.perfect;
  else if (result.accuracy >= 95) accuracyMultiplier = ACCURACY_BONUS.excellent;
  else if (result.accuracy >= 85) accuracyMultiplier = ACCURACY_BONUS.good;
  else if (result.accuracy >= 70) accuracyMultiplier = ACCURACY_BONUS.average;
  
  const accuracyExp = Math.floor(baseExp * (accuracyMultiplier - 1));
  
  // 速度奖励（基于反应时间，需要根据训练类型调整）
  let speedMultiplier = SPEED_BONUS.normal;
  if (result.reactionTime) {
    // 这里可以根据历史数据或预设标准来判断速度等级
    // 暂时使用简单的阈值判断
    const reactionTime = result.reactionTime;
    if (reactionTime < 300) speedMultiplier = SPEED_BONUS.lightning;
    else if (reactionTime < 500) speedMultiplier = SPEED_BONUS.fast;
    else if (reactionTime > 1000) speedMultiplier = SPEED_BONUS.slow;
  }
  
  const speedExp = Math.floor(baseExp * (speedMultiplier - 1));
  
  // 连续训练奖励
  let streakMultiplier = STREAK_BONUS[1];
  const streakKeys = Object.keys(STREAK_BONUS).map(Number).sort((a, b) => b - a);
  for (const days of streakKeys) {
    if (streakDays >= days) {
      streakMultiplier = STREAK_BONUS[days as keyof typeof STREAK_BONUS];
      break;
    }
  }
  
  const streakExp = Math.floor(baseExp * (streakMultiplier - 1));
  
  // 完美表现奖励
  const perfectExp = (result.accuracy === 100 && result.score >= 90) ? PERFECT_PERFORMANCE_BONUS : 0;
  
  // 首次完成奖励
  const firstTimeExp = isFirstTime ? FIRST_TIME_BONUS : 0;
  
  // 个人最佳奖励
  const personalBestExp = isPersonalBest ? PERSONAL_BEST_BONUS : 0;
  
  // 计算总经验值
  const totalExperience = Math.floor(
    baseExp + difficultyExp + accuracyExp + speedExp + streakExp + perfectExp + firstTimeExp + personalBestExp
  );
  
  return {
    totalExperience,
    breakdown: {
      base: baseExp,
      difficulty: difficultyExp,
      accuracy: accuracyExp,
      speed: speedExp,
      streak: streakExp,
      perfect: perfectExp,
      firstTime: firstTimeExp,
      personalBest: personalBestExp
    }
  };
};

/**
 * 获取准确率等级
 */
const getAccuracyLevel = (accuracy: number): { level: string; color: string; icon: React.ReactNode } => {
  if (accuracy >= 100) return { level: '完美', color: 'text-yellow-500', icon: <Trophy className="h-4 w-4" /> };
  if (accuracy >= 95) return { level: '优秀', color: 'text-green-500', icon: <Award className="h-4 w-4" /> };
  if (accuracy >= 85) return { level: '良好', color: 'text-blue-500', icon: <Target className="h-4 w-4" /> };
  if (accuracy >= 70) return { level: '一般', color: 'text-orange-500', icon: <Star className="h-4 w-4" /> };
  return { level: '需改进', color: 'text-red-500', icon: <TrendingUp className="h-4 w-4" /> };
};

/**
 * 获取速度等级
 */
const getSpeedLevel = (reactionTime: number): { level: string; color: string; icon: React.ReactNode } => {
  if (reactionTime < 300) return { level: '闪电', color: 'text-yellow-500', icon: <Zap className="h-4 w-4" /> };
  if (reactionTime < 500) return { level: '快速', color: 'text-green-500', icon: <Zap className="h-4 w-4" /> };
  if (reactionTime < 800) return { level: '正常', color: 'text-blue-500', icon: <Clock className="h-4 w-4" /> };
  if (reactionTime < 1000) return { level: '较慢', color: 'text-orange-500', icon: <Clock className="h-4 w-4" /> };
  return { level: '缓慢', color: 'text-red-500', icon: <Clock className="h-4 w-4" /> };
};

export const ExperienceCalculator: React.FC<ExperienceCalculatorProps> = ({
  result,
  className = '',
  showBreakdown = true
}) => {
  // 这里应该从store或props获取实际数据
  const streakDays = 1; // 临时值
  const isFirstTime = false; // 临时值
  const isPersonalBest = false; // 临时值
  
  const { totalExperience, breakdown } = calculateExperience(
    result,
    streakDays,
    isFirstTime,
    isPersonalBest
  );
  
  // 获取当前难度
  const currentDifficulty = result.difficultyProgression?.[result.difficultyProgression.length - 1] || 'beginner';
  
  const accuracyLevel = getAccuracyLevel(result.accuracy);
  const speedLevel = result.reactionTime ? getSpeedLevel(result.reactionTime) : null;
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          经验值奖励
          <Badge variant="secondary" className="ml-auto">
            +{totalExperience} EXP
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 总经验值展示 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
        >
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            +{totalExperience}
          </div>
          <div className="text-sm text-muted-foreground">
            经验值
          </div>
        </motion.div>
        
        {/* 表现评级 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {accuracyLevel.icon}
            <div>
              <div className="text-sm font-medium">准确率</div>
              <div className={cn("text-xs", accuracyLevel.color)}>
                {accuracyLevel.level} ({result.accuracy}%)
              </div>
            </div>
          </div>
          
          {speedLevel && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              {speedLevel.icon}
              <div>
                <div className="text-sm font-medium">反应速度</div>
                <div className={cn("text-xs", speedLevel.color)}>
                  {speedLevel.level} ({result.reactionTime}ms)
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 经验值分解 */}
        {showBreakdown && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">经验值分解</h4>
            
            <div className="space-y-2">
              {/* 基础经验 */}
              <div className="flex justify-between items-center text-sm">
                <span>基础经验</span>
                <span className="font-medium">+{breakdown.base}</span>
              </div>
              
              {/* 难度奖励 */}
              {breakdown.difficulty > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    难度奖励 ({currentDifficulty})
                  </span>
                  <span className="font-medium text-blue-600">+{breakdown.difficulty}</span>
                </div>
              )}
              
              {/* 准确率奖励 */}
              {breakdown.accuracy > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    准确率奖励
                  </span>
                  <span className="font-medium text-green-600">+{breakdown.accuracy}</span>
                </div>
              )}
              
              {/* 速度奖励 */}
              {breakdown.speed > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    速度奖励
                  </span>
                  <span className="font-medium text-yellow-600">+{breakdown.speed}</span>
                </div>
              )}
              
              {/* 连续训练奖励 */}
              {breakdown.streak > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    连续训练奖励
                  </span>
                  <span className="font-medium text-purple-600">+{breakdown.streak}</span>
                </div>
              )}
              
              {/* 完美表现奖励 */}
              {breakdown.perfect > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    完美表现奖励
                  </span>
                  <span className="font-medium text-yellow-600">+{breakdown.perfect}</span>
                </div>
              )}
              
              {/* 首次完成奖励 */}
              {breakdown.firstTime > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    首次完成奖励
                  </span>
                  <span className="font-medium text-orange-600">+{breakdown.firstTime}</span>
                </div>
              )}
              
              {/* 个人最佳奖励 */}
              {breakdown.personalBest > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    个人最佳奖励
                  </span>
                  <span className="font-medium text-red-600">+{breakdown.personalBest}</span>
                </div>
              )}
            </div>
            
            {/* 总计 */}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center font-medium">
                <span>总计</span>
                <span className="text-yellow-600">+{totalExperience} EXP</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExperienceCalculator;