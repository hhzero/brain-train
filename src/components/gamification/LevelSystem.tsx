'use client';

import React, { useState, useEffect } from 'react';
import { useTrainingStore } from '@/stores/training-store';
import { TrainingType } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Star, 
  TrendingUp, 
  Zap, 
  Target,
  Award,
  ChevronUp,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LevelSystemProps {
  trainingType?: TrainingType;
  className?: string;
}

// 等级配置
const LEVEL_CONFIG = {
  maxLevel: 50,
  baseExperience: 100,
  experienceMultiplier: 1.5
};

// 计算等级所需经验值
const getExperienceForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(LEVEL_CONFIG.baseExperience * Math.pow(LEVEL_CONFIG.experienceMultiplier, level - 2));
};

// 计算总经验值对应的等级
const getLevelFromExperience = (totalExp: number): { level: number; currentExp: number; nextLevelExp: number } => {
  let level = 1;
  let expForCurrentLevel = 0;
  
  while (level < LEVEL_CONFIG.maxLevel) {
    const expForNextLevel = getExperienceForLevel(level + 1);
    if (totalExp < expForCurrentLevel + expForNextLevel) {
      break;
    }
    expForCurrentLevel += expForNextLevel;
    level++;
  }
  
  const currentExp = totalExp - expForCurrentLevel;
  const nextLevelExp = level < LEVEL_CONFIG.maxLevel ? getExperienceForLevel(level + 1) : 0;
  
  return { level, currentExp, nextLevelExp };
};

// 等级称号
const getLevelTitle = (level: number): string => {
  if (level >= 45) return '传奇大师';
  if (level >= 40) return '至尊专家';
  if (level >= 35) return '顶级高手';
  if (level >= 30) return '资深专家';
  if (level >= 25) return '训练大师';
  if (level >= 20) return '高级训练师';
  if (level >= 15) return '中级训练师';
  if (level >= 10) return '初级训练师';
  if (level >= 5) return '进阶学员';
  return '新手学员';
};

// 等级颜色
const getLevelColor = (level: number): string => {
  if (level >= 40) return 'from-purple-500 to-pink-500';
  if (level >= 30) return 'from-yellow-400 to-orange-500';
  if (level >= 20) return 'from-blue-500 to-cyan-500';
  if (level >= 10) return 'from-green-500 to-emerald-500';
  return 'from-gray-400 to-gray-600';
};

// 等级奖励
const getLevelRewards = (level: number): string[] => {
  const rewards: string[] = [];
  
  if (level % 5 === 0) {
    rewards.push('解锁新的训练模式');
  }
  
  if (level % 10 === 0) {
    rewards.push('获得专属称号');
    rewards.push('解锁高级统计功能');
  }
  
  if (level >= 20 && level % 10 === 0) {
    rewards.push('解锁个性化训练计划');
  }
  
  if (level >= 30 && level % 10 === 0) {
    rewards.push('解锁专家模式');
  }
  
  return rewards;
};

export const LevelSystem: React.FC<LevelSystemProps> = ({
  trainingType,
  className = ''
}) => {
  const { userProgress, gamification } = useTrainingStore();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ oldLevel: number; newLevel: number } | null>(null);

  // 获取经验值数据
  const getExperienceData = () => {
    if (trainingType) {
      const progress = userProgress[trainingType];
      return {
        totalExp: progress?.experience || 0,
        weeklyExp: progress?.weeklyProgress || 0
      };
    }
    
    // 计算所有训练类型的总经验
    const totalExp = Object.values(userProgress).reduce((sum, progress) => {
      return sum + (progress?.experience || 0);
    }, 0);
    
    const weeklyExp = Object.values(userProgress).reduce((sum, progress) => {
      return sum + (progress?.weeklyProgress || 0);
    }, 0);
    
    return { totalExp, weeklyExp };
  };

  const { totalExp, weeklyExp } = getExperienceData();
  const { level, currentExp, nextLevelExp } = getLevelFromExperience(totalExp);
  const progressPercentage = nextLevelExp > 0 ? (currentExp / nextLevelExp) * 100 : 100;
  
  // 检查等级提升
  useEffect(() => {
    const currentLevel = getLevelFromExperience(totalExp).level;
    
    // 只在客户端环境中使用 localStorage
    if (typeof window !== 'undefined') {
      const storedLevel = localStorage.getItem(`lastLevel_${trainingType || 'global'}`);
      const lastLevel = storedLevel ? parseInt(storedLevel) : 1;
      
      if (currentLevel > lastLevel) {
        setLevelUpInfo({ oldLevel: lastLevel, newLevel: currentLevel });
        setShowLevelUp(true);
        localStorage.setItem(`lastLevel_${trainingType || 'global'}`, currentLevel.toString());
        
        // 3秒后隐藏升级动画
        setTimeout(() => {
          setShowLevelUp(false);
          setLevelUpInfo(null);
        }, 3000);
      }
    }
  }, [totalExp, trainingType]);

  // 训练类型特定数据
  const getTrainingTypeData = () => {
    if (!trainingType) return null;
    
    const progress = userProgress[trainingType];
    const typeLevel = getLevelFromExperience(progress?.experience || 0);
    
    return {
      level: typeLevel.level,
      currentExp: typeLevel.currentExp,
      nextLevelExp: typeLevel.nextLevelExp,
      totalExp: progress?.experience || 0,
      progressPercentage: typeLevel.nextLevelExp > 0 ? (typeLevel.currentExp / typeLevel.nextLevelExp) * 100 : 100
    };
  };

  const trainingTypeData = getTrainingTypeData();

  const LevelCard: React.FC<{
    title: string;
    level: number;
    currentExp: number;
    nextLevelExp: number;
    totalExp: number;
    progressPercentage: number;
    isGlobal?: boolean;
  }> = ({ title, level, currentExp, nextLevelExp, totalExp, progressPercentage, isGlobal = false }) => (
    <Card className="relative overflow-hidden">
      {/* 背景渐变 */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-10",
        getLevelColor(level)
      )} />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className={cn(
              "h-6 w-6",
              level >= 30 ? "text-yellow-500" : level >= 20 ? "text-blue-500" : "text-gray-500"
            )} />
            {title}
          </div>
          <Badge 
            variant="secondary" 
            className={cn(
              "bg-gradient-to-r text-white font-bold",
              getLevelColor(level)
            )}
          >
            Lv.{level}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {/* 等级称号 */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground">
            {getLevelTitle(level)}
          </h3>
        </div>
        
        {/* 经验值进度 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>经验值</span>
            <span>
              {level < LEVEL_CONFIG.maxLevel 
                ? `${currentExp} / ${nextLevelExp}`
                : '已满级'
              }
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          <div className="text-xs text-muted-foreground text-center">
            总经验值: {totalExp.toLocaleString()}
          </div>
        </div>
        
        {/* 等级奖励预览 */}
        {level < LEVEL_CONFIG.maxLevel && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Gift className="h-4 w-4" />
              下一级奖励
            </h4>
            <div className="space-y-1">
              {getLevelRewards(level + 1).map((reward, index) => (
                <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {reward}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 本周经验 */}
        {isGlobal && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                本周经验
              </span>
              <span className="font-medium">{weeklyExp}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className={cn("space-y-6", className)}>
        {trainingType ? (
          // 特定训练类型的等级系统
          trainingTypeData && (
            <LevelCard
              title={`${trainingType} 等级`}
              level={trainingTypeData.level}
              currentExp={trainingTypeData.currentExp}
              nextLevelExp={trainingTypeData.nextLevelExp}
              totalExp={trainingTypeData.totalExp}
              progressPercentage={trainingTypeData.progressPercentage}
            />
          )
        ) : (
          // 全局等级系统
          <>
            <LevelCard
              title="总体等级"
              level={level}
              currentExp={currentExp}
              nextLevelExp={nextLevelExp}
              totalExp={totalExp}
              progressPercentage={progressPercentage}
              isGlobal={true}
            />
            
            {/* 各训练类型等级概览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  训练类型等级
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(userProgress).map(([type, progress]) => {
                    const typeLevel = getLevelFromExperience(progress?.experience || 0);
                    return (
                      <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <div className="font-medium capitalize">{type}</div>
                          <div className="text-sm text-muted-foreground">
                            {getLevelTitle(typeLevel.level)}
                          </div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "bg-gradient-to-r text-white",
                            getLevelColor(typeLevel.level)
                          )}
                        >
                          Lv.{typeLevel.level}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 升级庆祝动画 */}
      <AnimatePresence>
        {showLevelUp && levelUpInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <Card className={cn(
              "bg-gradient-to-r text-white shadow-2xl",
              getLevelColor(levelUpInfo.newLevel)
            )}>
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-6xl mb-4"
                >
                  👑
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-2">等级提升！</h2>
                
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    Lv.{levelUpInfo.oldLevel}
                  </Badge>
                  <ChevronUp className="h-6 w-6" />
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    Lv.{levelUpInfo.newLevel}
                  </Badge>
                </div>
                
                <p className="text-lg font-medium mb-2">
                  {getLevelTitle(levelUpInfo.newLevel)}
                </p>
                
                {/* 升级奖励 */}
                {getLevelRewards(levelUpInfo.newLevel).length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm opacity-90">获得奖励:</p>
                    {getLevelRewards(levelUpInfo.newLevel).map((reward, index) => (
                      <p key={index} className="text-sm opacity-80">
                        ✨ {reward}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LevelSystem;