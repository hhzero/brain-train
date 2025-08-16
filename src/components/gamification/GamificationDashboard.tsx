'use client';

import React, { useState } from 'react';
import { useTrainingStore } from '@/stores/training-store';
import { TrainingType } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  Crown,
  Zap,
  BarChart3,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// 导入游戏化组件
import AchievementSystem from './AchievementSystem';
import LevelSystem from './LevelSystem';
import ExperienceCalculator from './ExperienceCalculator';

interface GamificationDashboardProps {
  trainingType?: TrainingType;
  className?: string;
}

// 训练类型标签映射
const trainingTypeLabels: Record<TrainingType, string> = {
  gaze: '凝视训练',
  schulte: '舒尔特方格',
  'multi-attention': '多维注意力',
  'cognitive-flexibility': '认知灵活性'
};

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  trainingType,
  className = ''
}) => {
  const { userProgress, gamification, trainingHistory, stats } = useTrainingStore();
  const [selectedTrainingType, setSelectedTrainingType] = useState<TrainingType | 'all'>(
    trainingType || 'all'
  );

  // 获取统计数据
  const getStats = () => {
    if (selectedTrainingType === 'all') {
      // 计算所有训练类型的总统计
      const totalSessions = Object.values(userProgress).reduce(
        (sum, progress) => sum + (progress?.totalSessions || 0), 0
      );
      const totalExperience = Object.values(userProgress).reduce(
        (sum, progress) => sum + (progress?.experience || 0), 0
      );
      const totalAchievements = Object.values(userProgress).reduce(
        (sum, progress) => sum + (progress?.achievements?.length || 0), 0
      );
      const averageAccuracy = Object.values(userProgress).reduce(
        (sum, progress, index, array) => {
          const accuracy = progress?.bestAccuracy || 0;
          return sum + accuracy / array.length;
        }, 0
      );
      
      return {
        totalSessions,
        totalExperience,
        totalAchievements,
        averageAccuracy: Math.round(averageAccuracy),
        currentStreak: gamification.streaks.current,
        longestStreak: gamification.streaks.longest
      };
    } else {
      const progress = userProgress[selectedTrainingType];
      return {
        totalSessions: progress?.totalSessions || 0,
        totalExperience: progress?.experience || 0,
        totalAchievements: progress?.achievements?.length || 0,
        averageAccuracy: Math.round(progress?.bestAccuracy || 0),
        currentStreak: gamification.streaks.current,
        longestStreak: gamification.streaks.longest
      };
    }
  };

  const statsData = getStats();

  // 获取最近的训练结果（用于经验值计算器演示）
  const getLatestResult = () => {
    if (trainingHistory.length === 0) return null;
    
    const latestSession = trainingHistory[trainingHistory.length - 1];
    if (!latestSession) return null;
    
    return latestSession;
  };

  const latestResult = getLatestResult();

  // 统计卡片组件
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    description?: string;
  }> = ({ title, value, icon, color, description }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden"
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div className={cn("p-2 rounded-full", color)}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* 头部控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">游戏化中心</h2>
          <p className="text-muted-foreground">
            查看你的训练成就、等级进度和经验值奖励
          </p>
        </div>
        
        {/* 训练类型选择器 */}
        {!trainingType && (
          <Select 
            value={selectedTrainingType} 
            onValueChange={(value) => setSelectedTrainingType(value as TrainingType | 'all')}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择训练类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部训练</SelectItem>
              {Object.entries(trainingTypeLabels).map(([type, label]) => (
                <SelectItem key={type} value={type}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="训练次数"
          value={statsData.totalSessions}
          icon={<Target className="h-5 w-5 text-white" />}
          color="bg-blue-500"
        />
        
        <StatCard
          title="总经验值"
          value={statsData.totalExperience.toLocaleString()}
          icon={<Star className="h-5 w-5 text-white" />}
          color="bg-yellow-500"
        />
        
        <StatCard
          title="解锁成就"
          value={statsData.totalAchievements}
          icon={<Trophy className="h-5 w-5 text-white" />}
          color="bg-green-500"
        />
        
        <StatCard
          title="平均准确率"
          value={`${statsData.averageAccuracy}%`}
          icon={<Award className="h-5 w-5 text-white" />}
          color="bg-purple-500"
        />
        
        <StatCard
          title="当前连胜"
          value={`${statsData.currentStreak}天`}
          icon={<Zap className="h-5 w-5 text-white" />}
          color="bg-orange-500"
        />
        
        <StatCard
          title="最长连胜"
          value={`${statsData.longestStreak}天`}
          icon={<Crown className="h-5 w-5 text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* 主要内容区域 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            概览
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            成就
          </TabsTrigger>
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            等级
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            经验值
          </TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 等级系统概览 */}
            <LevelSystem 
              trainingType={selectedTrainingType === 'all' ? undefined : selectedTrainingType}
            />
            
            {/* 最新经验值奖励 */}
            {latestResult && (
              <ExperienceCalculator 
                result={latestResult}
                showBreakdown={false}
              />
            )}
          </div>
          
          {/* 成就系统概览 */}
          <AchievementSystem 
            trainingType={selectedTrainingType === 'all' ? undefined : selectedTrainingType}
          />
        </TabsContent>

        {/* 成就标签页 */}
        <TabsContent value="achievements">
          <AchievementSystem 
            trainingType={selectedTrainingType === 'all' ? undefined : selectedTrainingType}
          />
        </TabsContent>

        {/* 等级标签页 */}
        <TabsContent value="levels">
          <LevelSystem 
            trainingType={selectedTrainingType === 'all' ? undefined : selectedTrainingType}
          />
        </TabsContent>

        {/* 经验值标签页 */}
        <TabsContent value="experience" className="space-y-6">
          {latestResult ? (
            <ExperienceCalculator 
              result={latestResult}
              showBreakdown={true}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">暂无训练记录</h3>
                <p className="text-muted-foreground mb-4">
                  完成一次训练后，这里将显示详细的经验值计算
                </p>
                <Button variant="outline">
                  开始训练
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* 经验值获取指南 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                经验值获取指南
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">基础经验值</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 凝视训练: 10 EXP</li>
                    <li>• 舒尔特方格: 15 EXP</li>
                    <li>• 多维注意力: 20 EXP</li>
                    <li>• 认知灵活性: 25 EXP</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">奖励系数</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 难度奖励: 最高 +150%</li>
                    <li>• 准确率奖励: 最高 +100%</li>
                    <li>• 速度奖励: 最高 +50%</li>
                    <li>• 连续训练: 最高 +100%</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">特殊奖励</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 完美表现: +50 EXP</li>
                    <li>• 首次完成: +20 EXP</li>
                    <li>• 个人最佳: +30 EXP</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">提升技巧</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 保持每日训练连胜</li>
                    <li>• 挑战更高难度</li>
                    <li>• 提高准确率和速度</li>
                    <li>• 尝试不同训练类型</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationDashboard;