'use client';

import React, { useState, useEffect } from 'react';
import { useTrainingStore } from '@/stores/training-store';
import { Achievement, TrainingType } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Clock, 
  Award,
  Lock,
  CheckCircle,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AchievementSystemProps {
  trainingType?: TrainingType;
  className?: string;
}

// 预定义成就数据
const predefinedAchievements: Record<TrainingType, Achievement[]> = {
  gaze: [
    {
      id: 'gaze-first-session',
      name: '初次凝视',
      description: '完成第一次凝视训练',
      icon: '👁️',
      type: 'milestone',
      requirement: { value: 1, condition: 'gte' },
      reward: { experience: 10 },
      progress: 0
    },
    {
      id: 'gaze-perfectionist',
      name: '凝视大师',
      description: '在凝视训练中达到95%以上准确率',
      icon: '🎯',
      type: 'accuracy',
      requirement: { value: 95, condition: 'gte' },
      reward: { experience: 50 },
      progress: 0
    },
    {
      id: 'gaze-speed-demon',
      name: '闪电凝视',
      description: '平均反应时间低于300ms',
      icon: '⚡',
      type: 'time',
      requirement: { value: 300, condition: 'lte' },
      reward: { experience: 30 },
      progress: 0
    },
    {
      id: 'gaze-marathon',
      name: '凝视马拉松',
      description: '连续训练30天',
      icon: '🏃',
      type: 'streak',
      requirement: { value: 30, condition: 'gte' },
      reward: { experience: 100 },
      progress: 0
    }
  ],
  schulte: [
    {
      id: 'schulte-beginner',
      name: '数字猎手',
      description: '完成第一次舒尔特方格训练',
      icon: '🔢',
      type: 'milestone',
      requirement: { value: 1, condition: 'gte' },
      reward: { experience: 10 },
      progress: 0
    },
    {
      id: 'schulte-master',
      name: '方格大师',
      description: '在5x5方格中达到90%准确率',
      icon: '🏆',
      type: 'accuracy',
      requirement: { value: 90, condition: 'gte' },
      reward: { experience: 60 },
      progress: 0
    },
    {
      id: 'schulte-speed',
      name: '极速扫描',
      description: '完成3x3方格用时少于20秒',
      icon: '💨',
      type: 'time',
      requirement: { value: 20, condition: 'lte' },
      reward: { experience: 40 },
      progress: 0
    }
  ],
  'multi-attention': [
    {
      id: 'multi-explorer',
      name: '多维探索者',
      description: '完成第一次多维注意力训练',
      icon: '🌟',
      type: 'milestone',
      requirement: { value: 1, condition: 'gte' },
      reward: { experience: 15 },
      progress: 0
    },
    {
      id: 'multi-juggler',
      name: '注意力杂技师',
      description: '同时处理3种感官刺激达到85%准确率',
      icon: '🤹',
      type: 'accuracy',
      requirement: { value: 85, condition: 'gte' },
      reward: { experience: 70 },
      progress: 0
    }
  ],
  'cognitive-flexibility': [
    {
      id: 'flex-starter',
      name: '灵活起步',
      description: '完成第一次认知灵活性训练',
      icon: '🧠',
      type: 'milestone',
      requirement: { value: 1, condition: 'gte' },
      reward: { experience: 15 },
      progress: 0
    },
    {
      id: 'flex-master',
      name: '认知变色龙',
      description: '在任务切换中达到90%准确率',
      icon: '🦎',
      type: 'accuracy',
      requirement: { value: 90, condition: 'gte' },
      reward: { experience: 80 },
      progress: 0
    }
  ]
};

const achievementTypeColors = {
  milestone: 'bg-purple-100 text-purple-800 border-purple-200',
  accuracy: 'bg-green-100 text-green-800 border-green-200',
  time: 'bg-blue-100 text-blue-800 border-blue-200',
  streak: 'bg-orange-100 text-orange-800 border-orange-200',
  score: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  consistency: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

const achievementTypeLabels = {
  milestone: '里程碑',
  accuracy: '准确率',
  time: '时间',
  streak: '连胜',
  score: '得分',
  consistency: '一致性'
};

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  trainingType,
  className = ''
}) => {
  const { userProgress, trainingHistory } = useTrainingStore();
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // 获取所有成就（已解锁和未解锁）
  const getAllAchievements = () => {
    if (trainingType) {
      const userAchievements = userProgress[trainingType]?.achievements || [];
      const predefined = predefinedAchievements[trainingType] || [];
      
      return predefined.map(achievement => {
        const unlocked = userAchievements.find(ua => ua.id === achievement.id);
        return unlocked || achievement;
      });
    }
    
    // 返回所有训练类型的成就
    const allAchievements: Achievement[] = [];
    Object.entries(predefinedAchievements).forEach(([type, achievements]) => {
      const userAchievements = userProgress[type as TrainingType]?.achievements || [];
      achievements.forEach(achievement => {
        const unlocked = userAchievements.find(ua => ua.id === achievement.id);
        allAchievements.push(unlocked || achievement);
      });
    });
    
    return allAchievements;
  };

  const achievements = getAllAchievements();
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  // 检查新解锁的成就
  useEffect(() => {
    const recentAchievements = unlockedAchievements.filter(achievement => {
      if (!achievement.unlockedAt) return false;
      const unlockTime = new Date(achievement.unlockedAt).getTime();
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      return unlockTime > fiveMinutesAgo;
    });

    if (recentAchievements.length > 0) {
      setNewAchievements(recentAchievements);
      setShowCelebration(true);
      
      // 3秒后隐藏庆祝动画
      setTimeout(() => {
        setShowCelebration(false);
        setNewAchievements([]);
      }, 3000);
    }
  }, [unlockedAchievements]);

  const AchievementCard: React.FC<{ achievement: Achievement; isUnlocked: boolean }> = ({ 
    achievement, 
    isUnlocked 
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative p-4 rounded-lg border transition-all duration-200",
        isUnlocked 
          ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md" 
          : "bg-gray-50 border-gray-200 opacity-60"
      )}
    >
      {/* 解锁状态指示器 */}
      <div className="absolute top-2 right-2">
        {isUnlocked ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <Lock className="h-5 w-5 text-gray-400" />
        )}
      </div>

      {/* 成就图标和信息 */}
      <div className="flex items-start gap-3">
        <div className={cn(
          "text-2xl p-2 rounded-full",
          isUnlocked ? "bg-yellow-100" : "bg-gray-100"
        )}>
          {achievement.icon}
        </div>
        
        <div className="flex-1 space-y-2">
          <div>
            <h3 className={cn(
              "font-semibold",
              isUnlocked ? "text-gray-900" : "text-gray-500"
            )}>
              {achievement.name}
            </h3>
            <p className={cn(
              "text-sm",
              isUnlocked ? "text-gray-600" : "text-gray-400"
            )}>
              {achievement.description}
            </p>
          </div>
          
          {/* 成就类型和奖励 */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={achievementTypeColors[achievement.type]}
            >
              {achievementTypeLabels[achievement.type]}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3" />
              +{achievement.reward.experience} 经验
            </div>
          </div>
          
          {/* 解锁时间 */}
          {isUnlocked && achievement.unlockedAt && (
            <div className="text-xs text-muted-foreground">
              解锁于 {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
          
          {/* 进度条（未解锁的成就） */}
          {!isUnlocked && achievement.progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>进度</span>
                <span>{achievement.progress}%</span>
              </div>
              <Progress value={achievement.progress} className="h-1" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            成就系统
            <Badge variant="secondary">
              {unlockedAchievements.length}/{achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="unlocked" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unlocked" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                已解锁 ({unlockedAchievements.length})
              </TabsTrigger>
              <TabsTrigger value="locked" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                未解锁 ({lockedAchievements.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="unlocked" className="space-y-4">
              {unlockedAchievements.length > 0 ? (
                <div className="grid gap-4">
                  {unlockedAchievements.map((achievement) => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement} 
                      isUnlocked={true} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>还没有解锁任何成就</p>
                  <p className="text-sm">开始训练来获得你的第一个成就吧！</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="locked" className="space-y-4">
              {lockedAchievements.length > 0 ? (
                <div className="grid gap-4">
                  {lockedAchievements.map((achievement) => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement} 
                      isUnlocked={false} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>恭喜！你已经解锁了所有成就</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 成就解锁庆祝动画 */}
      <AnimatePresence>
        {showCelebration && newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl">
              <CardContent className="p-6 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="text-4xl mb-2"
                >
                  🎉
                </motion.div>
                <h3 className="text-xl font-bold mb-2">成就解锁！</h3>
                {newAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-2 justify-center">
                    <span className="text-lg">{achievement.icon}</span>
                    <span className="font-medium">{achievement.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementSystem;