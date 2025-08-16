/**
 * 增强版成就系统组件
 * 为注意力训练模块提供更丰富的游戏化激励机制
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Zap,
  Target,
  Clock,
  Award,
  Medal,
  Crown,
  Brain,
  Eye,
  Shuffle,
  Timer,
  Flame,
  Shield,
  Gem,
  Sparkles,
  TrendingUp,
  Calendar,
  Users,
  Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// 扩展的成就类型
type EnhancedAchievementType = 
  | 'accuracy' 
  | 'streak' 
  | 'sessions' 
  | 'improvement' 
  | 'speed' 
  | 'consistency' 
  | 'milestone'
  | 'attention_focus'
  | 'cognitive_flexibility'
  | 'multitasking'
  | 'endurance'
  | 'perfectionist'
  | 'explorer'
  | 'social'
  | 'daily_challenge';

// 成就稀有度类型
export type EnhancedAchievementRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

// 增强版成就定义
interface EnhancedAchievement {
  id: string;
  name: string;
  description: string;
  type: EnhancedAchievementType;
  icon: React.ComponentType<any>;
  color: string;
  requirement: number;
  points: number;
  rarity: EnhancedAchievementRarity;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  category: 'attention' | 'cognitive' | 'performance' | 'social' | 'special';
  hidden?: boolean; // 隐藏成就，直到解锁
  prerequisites?: string[]; // 前置成就
}

// 成就通知
interface EnhancedAchievementNotification {
  achievement: EnhancedAchievement;
  timestamp: number;
  isNew?: boolean;
}

// 成就统计
interface AchievementStats {
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
  rarityBreakdown: Record<EnhancedAchievementRarity, number>;
  categoryBreakdown: Record<string, number>;
  recentUnlocks: EnhancedAchievement[];
}

// 训练统计接口（扩展版）
interface EnhancedSessionStats {
  accuracy: number;
  reactionTime: number;
  score: number;
  level: number;
  streak: number;
  totalTime: number;
  trainingType: 'multidimensional' | 'cognitive_flexibility' | 'memory' | 'reaction';
  perfectRounds?: number;
  averageResponseTime?: number;
  consistencyScore?: number;
  focusScore?: number;
  multitaskingScore?: number;
}

interface EnhancedAchievementSystemProps {
  sessionStats?: EnhancedSessionStats;
  onAchievementUnlocked?: (achievement: EnhancedAchievement) => void;
  className?: string;
  showMiniDisplay?: boolean;
}

/**
 * 增强版成就系统组件
 */
const EnhancedAchievementSystem: React.FC<EnhancedAchievementSystemProps> = ({
  sessionStats,
  onAchievementUnlocked,
  className = '',
  showMiniDisplay = false
}) => {
  const [achievements, setAchievements] = useState<EnhancedAchievement[]>([]);
  const [notifications, setNotifications] = useState<EnhancedAchievementNotification[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [achievementStats, setAchievementStats] = useState<AchievementStats>({
    totalPoints: 0,
    unlockedCount: 0,
    totalCount: 0,
    rarityBreakdown: { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    categoryBreakdown: {},
    recentUnlocks: []
  });

  // 定义所有增强版成就
  const enhancedAchievementDefinitions: Omit<EnhancedAchievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [
    // 注意力专注类成就
    {
      id: 'attention_novice',
      name: '注意力新手',
      description: '完成第一次注意力训练',
      type: 'attention_focus',
      icon: Eye,
      color: 'text-blue-400',
      requirement: 1,
      points: 25,
      rarity: 'common',
      category: 'attention'
    },
    {
      id: 'focus_master',
      name: '专注大师',
      description: '在注意力训练中保持90%以上专注度',
      type: 'attention_focus',
      icon: Target,
      color: 'text-green-400',
      requirement: 90,
      points: 150,
      rarity: 'rare',
      category: 'attention'
    },
    {
      id: 'laser_focus',
      name: '激光专注',
      description: '连续5次训练保持95%以上专注度',
      type: 'attention_focus',
      icon: Zap,
      color: 'text-yellow-400',
      requirement: 5,
      points: 300,
      rarity: 'epic',
      category: 'attention'
    },
    {
      id: 'zen_master',
      name: '禅宗大师',
      description: '达到完美专注状态（100%专注度）',
      type: 'attention_focus',
      icon: Crown,
      color: 'text-purple-400',
      requirement: 100,
      points: 500,
      rarity: 'legendary',
      category: 'attention'
    },

    // 认知灵活性成就
    {
      id: 'flexibility_starter',
      name: '灵活起步',
      description: '完成第一次认知灵活性训练',
      type: 'cognitive_flexibility',
      icon: Shuffle,
      color: 'text-cyan-400',
      requirement: 1,
      points: 25,
      rarity: 'common',
      category: 'cognitive'
    },
    {
      id: 'task_switcher',
      name: '任务切换者',
      description: '在任务切换训练中达到85%准确率',
      type: 'cognitive_flexibility',
      icon: Brain,
      color: 'text-indigo-400',
      requirement: 85,
      points: 200,
      rarity: 'rare',
      category: 'cognitive'
    },
    {
      id: 'cognitive_ninja',
      name: '认知忍者',
      description: '在Stroop测试中反应时间低于300ms',
      type: 'cognitive_flexibility',
      icon: Zap,
      color: 'text-red-400',
      requirement: 300,
      points: 350,
      rarity: 'epic',
      category: 'cognitive'
    },
    {
      id: 'mental_gymnast',
      name: '心理体操运动员',
      description: '在所有认知灵活性测试中都达到90%以上',
      type: 'cognitive_flexibility',
      icon: Medal,
      color: 'text-gold-400',
      requirement: 90,
      points: 600,
      rarity: 'legendary',
      category: 'cognitive'
    },

    // 多任务处理成就
    {
      id: 'multitask_beginner',
      name: '多任务新手',
      description: '同时处理2个注意力任务',
      type: 'multitasking',
      icon: Sparkles,
      color: 'text-pink-400',
      requirement: 2,
      points: 50,
      rarity: 'common',
      category: 'cognitive'
    },
    {
      id: 'parallel_processor',
      name: '并行处理器',
      description: '同时处理3个注意力任务并保持80%准确率',
      type: 'multitasking',
      icon: Brain,
      color: 'text-purple-400',
      requirement: 3,
      points: 250,
      rarity: 'epic',
      category: 'cognitive'
    },
    {
      id: 'attention_overlord',
      name: '注意力霸主',
      description: '在多维注意力挑战中达到传奇级表现',
      type: 'multitasking',
      icon: Crown,
      color: 'text-gold-400',
      requirement: 95,
      points: 800,
      rarity: 'mythic',
      category: 'cognitive',
      hidden: true
    },

    // 耐力成就
    {
      id: 'endurance_runner',
      name: '耐力跑者',
      description: '连续训练30分钟不间断',
      type: 'endurance',
      icon: Timer,
      color: 'text-orange-400',
      requirement: 30,
      points: 100,
      rarity: 'rare',
      category: 'performance'
    },
    {
      id: 'marathon_mind',
      name: '马拉松大脑',
      description: '单次训练时间超过60分钟',
      type: 'endurance',
      icon: Flame,
      color: 'text-red-400',
      requirement: 60,
      points: 300,
      rarity: 'epic',
      category: 'performance'
    },
    {
      id: 'iron_will',
      name: '钢铁意志',
      description: '连续7天每天训练至少20分钟',
      type: 'endurance',
      icon: Shield,
      color: 'text-gray-400',
      requirement: 7,
      points: 400,
      rarity: 'legendary',
      category: 'performance'
    },

    // 完美主义者成就
    {
      id: 'perfectionist_start',
      name: '完美开始',
      description: '第一次训练就达到100%准确率',
      type: 'perfectionist',
      icon: Star,
      color: 'text-yellow-400',
      requirement: 100,
      points: 200,
      rarity: 'rare',
      category: 'performance'
    },
    {
      id: 'flawless_streak',
      name: '完美连击',
      description: '连续3次训练都达到100%准确率',
      type: 'perfectionist',
      icon: Gem,
      color: 'text-cyan-400',
      requirement: 3,
      points: 500,
      rarity: 'epic',
      category: 'performance'
    },
    {
      id: 'perfection_incarnate',
      name: '完美化身',
      description: '累计获得10次完美表现',
      type: 'perfectionist',
      icon: Crown,
      color: 'text-gold-400',
      requirement: 10,
      points: 1000,
      rarity: 'mythic',
      category: 'performance',
      hidden: true
    },

    // 探索者成就
    {
      id: 'training_explorer',
      name: '训练探索者',
      description: '尝试所有类型的注意力训练',
      type: 'explorer',
      icon: Eye,
      color: 'text-green-400',
      requirement: 4,
      points: 150,
      rarity: 'rare',
      category: 'special'
    },
    {
      id: 'difficulty_climber',
      name: '难度攀登者',
      description: '在每种训练类型中都达到高级难度',
      type: 'explorer',
      icon: TrendingUp,
      color: 'text-blue-400',
      requirement: 4,
      points: 400,
      rarity: 'epic',
      category: 'special'
    },

    // 社交成就
    {
      id: 'social_butterfly',
      name: '社交蝴蝶',
      description: '添加第一个好友',
      type: 'social',
      icon: Users,
      color: 'text-pink-400',
      requirement: 1,
      points: 50,
      rarity: 'common',
      category: 'social'
    },
    {
      id: 'leaderboard_climber',
      name: '排行榜攀登者',
      description: '进入周排行榜前10名',
      type: 'social',
      icon: Trophy,
      color: 'text-yellow-400',
      requirement: 10,
      points: 300,
      rarity: 'epic',
      category: 'social'
    },

    // 每日挑战成就
    {
      id: 'daily_warrior',
      name: '每日战士',
      description: '完成第一个每日挑战',
      type: 'daily_challenge',
      icon: Calendar,
      color: 'text-orange-400',
      requirement: 1,
      points: 75,
      rarity: 'common',
      category: 'special'
    },
    {
      id: 'challenge_champion',
      name: '挑战冠军',
      description: '连续7天完成每日挑战',
      type: 'daily_challenge',
      icon: Award,
      color: 'text-purple-400',
      requirement: 7,
      points: 350,
      rarity: 'epic',
      category: 'special'
    },

    // 特殊隐藏成就
    {
      id: 'easter_egg',
      name: '彩蛋发现者',
      description: '发现隐藏的训练模式',
      type: 'explorer',
      icon: Gift,
      color: 'text-rainbow',
      requirement: 1,
      points: 500,
      rarity: 'mythic',
      category: 'special',
      hidden: true
    }
  ];

  // 初始化成就
  useEffect(() => {
    const savedAchievements = localStorage.getItem('enhanced_achievements');
    if (savedAchievements) {
      const loaded = JSON.parse(savedAchievements);
      setAchievements(loaded);
      updateAchievementStats(loaded);
    } else {
      // 初始化所有成就为未解锁状态
      const initialAchievements = enhancedAchievementDefinitions.map(def => ({
        ...def,
        unlocked: false,
        progress: 0
      }));
      setAchievements(initialAchievements);
      updateAchievementStats(initialAchievements);
    }
  }, []);

  // 更新成就统计
  const updateAchievementStats = (achievementList: EnhancedAchievement[]) => {
    const totalPoints = achievementList
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);
    
    const unlockedCount = achievementList.filter(a => a.unlocked).length;
    const totalCount = achievementList.length;
    
    const rarityBreakdown = achievementList
      .filter(a => a.unlocked)
      .reduce((acc, a) => {
        acc[a.rarity] = (acc[a.rarity] || 0) + 1;
        return acc;
      }, {} as Record<EnhancedAchievementRarity, number>);
    
    const categoryBreakdown = achievementList
      .filter(a => a.unlocked)
      .reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const recentUnlocks = achievementList
      .filter(a => a.unlocked && a.unlockedAt)
      .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
      .slice(0, 5);
    
    setAchievementStats({
      totalPoints,
      unlockedCount,
      totalCount,
      rarityBreakdown: {
        common: rarityBreakdown.common || 0,
        rare: rarityBreakdown.rare || 0,
        epic: rarityBreakdown.epic || 0,
        legendary: rarityBreakdown.legendary || 0,
        mythic: rarityBreakdown.mythic || 0
      },
      categoryBreakdown,
      recentUnlocks
    });
  };

  // 保存成就数据
  const saveAchievements = (newAchievements: EnhancedAchievement[]) => {
    localStorage.setItem('enhanced_achievements', JSON.stringify(newAchievements));
    setAchievements(newAchievements);
    updateAchievementStats(newAchievements);
  };

  // 检查并解锁成就
  const checkAchievements = () => {
    if (!sessionStats) return;
    
    const updatedAchievements = [...achievements];
    const newlyUnlocked: EnhancedAchievement[] = [];
    
    updatedAchievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      // 检查前置条件
      if (achievement.prerequisites) {
        const prerequisitesMet = achievement.prerequisites.every(prereqId => 
          updatedAchievements.find(a => a.id === prereqId)?.unlocked
        );
        if (!prerequisitesMet) return;
      }
      
      let currentProgress = 0;
      let shouldUnlock = false;
      
      switch (achievement.type) {
        case 'attention_focus':
          if (sessionStats.focusScore !== undefined) {
            currentProgress = sessionStats.focusScore;
            shouldUnlock = currentProgress >= achievement.requirement;
          }
          break;
          
        case 'cognitive_flexibility':
          if (sessionStats.trainingType === 'cognitive_flexibility') {
            if (achievement.id === 'flexibility_starter') {
              currentProgress = 1;
              shouldUnlock = true;
            } else if (achievement.id === 'task_switcher') {
              currentProgress = sessionStats.accuracy;
              shouldUnlock = currentProgress >= achievement.requirement;
            } else if (achievement.id === 'cognitive_ninja') {
              currentProgress = sessionStats.reactionTime;
              shouldUnlock = currentProgress <= achievement.requirement;
            }
          }
          break;
          
        case 'multitasking':
          if (sessionStats.multitaskingScore !== undefined) {
            currentProgress = sessionStats.multitaskingScore;
            shouldUnlock = currentProgress >= achievement.requirement;
          }
          break;
          
        case 'endurance':
          currentProgress = sessionStats.totalTime / 60; // 转换为分钟
          shouldUnlock = currentProgress >= achievement.requirement;
          break;
          
        case 'perfectionist':
          if (achievement.id === 'perfectionist_start') {
            currentProgress = sessionStats.accuracy;
            shouldUnlock = currentProgress >= 100;
          } else if (sessionStats.perfectRounds !== undefined) {
            currentProgress = sessionStats.perfectRounds;
            shouldUnlock = currentProgress >= achievement.requirement;
          }
          break;
          
        case 'accuracy':
          currentProgress = sessionStats.accuracy;
          shouldUnlock = currentProgress >= achievement.requirement;
          break;
          
        case 'speed':
          currentProgress = sessionStats.reactionTime;
          shouldUnlock = currentProgress <= achievement.requirement;
          break;
      }
      
      achievement.progress = Math.min(currentProgress, achievement.requirement);
      
      if (shouldUnlock && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        newlyUnlocked.push(achievement);
      }
    });
    
    if (newlyUnlocked.length > 0) {
      saveAchievements(updatedAchievements);
      
      // 显示成就通知
      newlyUnlocked.forEach(achievement => {
        const notification: EnhancedAchievementNotification = {
          achievement,
          timestamp: Date.now(),
          isNew: true
        };
        setNotifications(prev => [...prev, notification]);
        
        // 5秒后移除通知
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.timestamp !== notification.timestamp));
        }, 5000);
        
        // 触发回调
        onAchievementUnlocked?.(achievement);
      });
    }
  };

  // 当统计数据更新时检查成就
  useEffect(() => {
    checkAchievements();
  }, [sessionStats]);

  // 获取稀有度样式
  const getRarityStyle = (rarity: EnhancedAchievementRarity) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-400 bg-gray-50 text-gray-700';
      case 'rare':
        return 'border-blue-400 bg-blue-50 text-blue-700';
      case 'epic':
        return 'border-purple-400 bg-purple-50 text-purple-700';
      case 'legendary':
        return 'border-yellow-400 bg-yellow-50 text-yellow-700';
      case 'mythic':
        return 'border-pink-400 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700';
      default:
        return 'border-gray-400 bg-gray-50 text-gray-700';
    }
  };

  // 获取稀有度名称
  const getRarityName = (rarity: EnhancedAchievementRarity) => {
    const names = {
      common: '普通',
      rare: '稀有',
      epic: '史诗',
      legendary: '传奇',
      mythic: '神话'
    };
    return names[rarity];
  };

  // 过滤成就
  const filteredAchievements = achievements.filter(achievement => {
    if (achievement.hidden && !achievement.unlocked) return false;
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  });

  // 迷你显示模式
  if (showMiniDisplay) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>{achievementStats.totalPoints}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Award className="w-4 h-4 text-blue-500" />
          <span>{achievementStats.unlockedCount}/{achievementStats.totalCount}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 成就按钮 */}
      <motion.button
        onClick={() => setShowAchievements(true)}
        className="relative p-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Trophy className="w-6 h-6" />
        {achievementStats.unlockedCount > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {achievementStats.unlockedCount}
          </motion.div>
        )}
      </motion.button>

      {/* 成就通知 */}
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.timestamp}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-4 rounded-lg shadow-2xl max-w-sm"
            initial={{ x: 400, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 400, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
                <notification.achievement.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  成就解锁！
                </h3>
                <p className="text-sm opacity-90 font-medium">{notification.achievement.name}</p>
                <p className="text-xs opacity-75">{notification.achievement.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getRarityStyle(notification.achievement.rarity)}>
                    {getRarityName(notification.achievement.rarity)}
                  </Badge>
                  <span className="text-xs font-bold">+{notification.achievement.points} 积分</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 成就面板 */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 背景遮罩 */}
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAchievements(false)}
            />

            {/* 成就面板 */}
            <motion.div
              className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold flex items-center space-x-3">
                      <Trophy className="w-8 h-8" />
                      <span>成就系统</span>
                    </h2>
                    <p className="text-purple-100 mt-1">
                      已解锁 {achievementStats.unlockedCount}/{achievementStats.totalCount} 个成就
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{achievementStats.totalPoints}</p>
                    <p className="text-purple-100 text-sm">总积分</p>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mt-4">
                  <Progress 
                    value={(achievementStats.unlockedCount / achievementStats.totalCount) * 100}
                    className="h-3 bg-purple-800"
                  />
                </div>

                {/* 稀有度统计 */}
                <div className="flex gap-4 mt-4">
                  {Object.entries(achievementStats.rarityBreakdown).map(([rarity, count]) => (
                    <div key={rarity} className="text-center">
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs opacity-75">{getRarityName(rarity as EnhancedAchievementRarity)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 分类筛选 */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {['all', 'attention', 'cognitive', 'performance', 'social', 'special'].map(category => (
                    <Button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      className={selectedCategory === category ? 'bg-purple-600 text-white' : 'text-gray-300 border-gray-600'}
                    >
                      {category === 'all' && '全部'}
                      {category === 'attention' && '注意力'}
                      {category === 'cognitive' && '认知'}
                      {category === 'performance' && '表现'}
                      {category === 'social' && '社交'}
                      {category === 'special' && '特殊'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 成就列表 */}
              <div className="p-6 overflow-y-auto max-h-96 bg-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAchievements.map(achievement => {
                    const Icon = achievement.icon;
                    const progressPercent = (achievement.progress / achievement.requirement) * 100;

                    return (
                      <motion.div
                        key={achievement.id}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                          achievement.unlocked
                            ? 'bg-gray-800 border-gray-600'
                            : 'bg-gray-800/50 border-gray-700 opacity-60'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        layout
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 p-2 rounded-full ${
                            achievement.unlocked ? 'bg-gray-700' : 'bg-gray-800'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              achievement.unlocked ? achievement.color : 'text-gray-500'
                            }`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-sm ${
                              achievement.unlocked ? 'text-white' : 'text-gray-400'
                            }`}>
                              {achievement.name}
                            </h3>
                            <p className={`text-xs mt-1 ${
                              achievement.unlocked ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {achievement.description}
                            </p>

                            {/* 进度条 */}
                            {!achievement.unlocked && (
                              <div className="mt-2">
                                <Progress value={progressPercent} className="h-1.5" />
                                <p className="text-xs text-gray-500 mt-1">
                                  {achievement.progress}/{achievement.requirement}
                                </p>
                              </div>
                            )}

                            {/* 积分和稀有度 */}
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs font-bold ${
                                achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'
                              }`}>
                                {achievement.points} 积分
                              </span>
                              <Badge className={getRarityStyle(achievement.rarity)}>
                                {getRarityName(achievement.rarity)}
                              </Badge>
                            </div>

                            {/* 解锁时间 */}
                            {achievement.unlocked && achievement.unlockedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                解锁于 {new Date(achievement.unlockedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* 关闭按钮 */}
              <div className="p-4 border-t border-gray-700 bg-gray-900">
                <Button
                  onClick={() => setShowAchievements(false)}
                  className="w-full bg-gray-700 text-white hover:bg-gray-600"
                >
                  关闭
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedAchievementSystem;
export type { EnhancedAchievement, EnhancedAchievementNotification, EnhancedSessionStats };