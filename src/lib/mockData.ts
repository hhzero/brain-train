/**
 * 模拟数据生成器
 * 为开发和演示提供真实的模拟数据
 */

import {
  UserProfile,
  TrainingSession,
  Achievement,
  Friend,
  LeaderboardEntry,
  UserStatistics,
  DailyGoal
} from './storage';

/**
 * 生成随机用户资料
 */
export function generateMockUserProfile(): UserProfile {
  const usernames = [
    'brainmaster', 'cognitiveace', 'mindwarrior', 'neuralking', 'thoughtlord',
    'memoryqueen', 'focusmaster', 'attentionhero', 'reactionspeed', 'brainpower'
  ];
  
  const displayNames = [
    '大脑训练师', '认知大师', '思维战士', '神经网络王', '思想领主',
    '记忆女王', '专注大师', '注意力英雄', '反应神速', '脑力超人'
  ];
  
  const bios = [
    '热爱大脑训练，致力于提升认知能力！',
    '每天训练，让大脑更强大！',
    '专注力就是超能力！',
    '挑战极限，突破自我！',
    '用科学方法训练大脑！'
  ];
  
  const randomIndex = Math.floor(Math.random() * usernames.length);
  const level = Math.floor(Math.random() * 20) + 1;
  const totalScore = level * 1000 + Math.floor(Math.random() * 1000);
  
  return {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    username: usernames[randomIndex] + Math.floor(Math.random() * 1000),
    displayName: displayNames[randomIndex],
    email: `${usernames[randomIndex]}@example.com`,
    avatar: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20brain%20training%20character%20${randomIndex}&image_size=square`,
    bio: bios[Math.floor(Math.random() * bios.length)],
    level,
    totalScore,
    totalTrainingTime: Math.floor(Math.random() * 5000) + 100,
    achievements: Math.floor(Math.random() * 15) + 1,
    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    streak: Math.floor(Math.random() * 30),
    favoriteTraining: ['多维注意力挑战', '认知灵活性训练营', 'N-Back训练'][Math.floor(Math.random() * 3)],
    rank: Math.floor(Math.random() * 1000) + 1,
    completedSessions: Math.floor(Math.random() * 200) + 10,
    averageAccuracy: Math.round((Math.random() * 30 + 70) * 10) / 10,
    bestReactionTime: Math.floor(Math.random() * 200) + 200
  };
}

/**
 * 生成模拟训练会话
 */
export function generateMockTrainingSession(userId: string): TrainingSession {
  const trainingTypes = [
    { type: 'attention', name: '多维注意力挑战' },
    { type: 'cognitive', name: '认知灵活性训练营' },
    { type: 'memory', name: 'N-Back训练' },
    { type: 'reaction', name: '反应速度训练' }
  ];
  
  const difficulties = ['easy', 'medium', 'hard'];
  const training = trainingTypes[Math.floor(Math.random() * trainingTypes.length)];
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  
  const duration = Math.floor(Math.random() * 1200) + 300; // 5-25分钟
  const accuracy = Math.round((Math.random() * 40 + 60) * 10) / 10; // 60-100%
  const reactionTime = Math.floor(Math.random() * 300) + 200; // 200-500ms
  const correctAnswers = Math.floor((accuracy / 100) * 20);
  const totalQuestions = 20;
  
  const startTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
  const endTime = new Date(startTime.getTime() + duration * 1000);
  
  return {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    userId,
    trainingType: training.type,
    trainingName: training.name,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration,
    score: Math.floor(accuracy * 10 + Math.random() * 100),
    accuracy,
    reactionTime,
    difficulty,
    completed: true,
    achievements: Math.random() > 0.8 ? ['perfect_start'] : [],
    statistics: {
      correctAnswers,
      totalQuestions,
      averageReactionTime: reactionTime,
      bestReactionTime: Math.floor(reactionTime * 0.8),
      worstReactionTime: Math.floor(reactionTime * 1.2),
      streakCount: Math.floor(Math.random() * 10),
      mistakeCount: totalQuestions - correctAnswers
    },
    metadata: {
      deviceType: 'desktop',
      browserType: 'chrome',
      screenResolution: '1920x1080'
    }
  };
}

/**
 * 生成模拟好友数据
 */
export function generateMockFriends(count: number = 5): Friend[] {
  const friends: Friend[] = [];
  
  const usernames = [
    'cognitivemaster', 'memoryking', 'attentionace', 'reactionspeed', 'brainpower',
    'mindwarrior', 'neuralnet', 'thoughtlord', 'focusmaster', 'smartbrain'
  ];
  
  const displayNames = [
    '认知大师', '记忆王者', '注意力王牌', '反应神速', '脑力超人',
    '思维战士', '神经网络', '思想领主', '专注大师', '智慧大脑'
  ];
  
  for (let i = 0; i < count; i++) {
    const level = Math.floor(Math.random() * 25) + 1;
    const isOnline = Math.random() > 0.6;
    
    friends.push({
      id: 'friend_' + i + '_' + Date.now(),
      username: usernames[i % usernames.length] + Math.floor(Math.random() * 100),
      displayName: displayNames[i % displayNames.length],
      avatar: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20friend%20character%20${i}&image_size=square`,
      level,
      isOnline,
      lastActive: isOnline 
        ? new Date().toISOString() 
        : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      mutualFriends: Math.floor(Math.random() * 10),
      addedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  
  return friends;
}

/**
 * 生成模拟排行榜数据
 */
export function generateMockLeaderboard(count: number = 10): LeaderboardEntry[] {
  const leaderboard: LeaderboardEntry[] = [];
  
  const usernames = [
    'brainchampion', 'mindmaster', 'cognitiveace', 'neuralking', 'thoughtlord',
    'memoryqueen', 'focusmaster', 'attentionhero', 'reactionspeed', 'brainpower'
  ];
  
  const displayNames = [
    '大脑冠军', '思维大师', '认知王牌', '神经网络王', '思想领主',
    '记忆女王', '专注大师', '注意力英雄', '反应神速', '脑力超人'
  ];
  
  for (let i = 0; i < count; i++) {
    const baseScore = 30000 - (i * 2000) + Math.floor(Math.random() * 1000);
    const level = Math.floor(baseScore / 1000);
    
    leaderboard.push({
      id: 'leader_' + i + '_' + Date.now(),
      username: usernames[i % usernames.length] + Math.floor(Math.random() * 100),
      displayName: displayNames[i % displayNames.length],
      avatar: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20leader%20character%20${i}&image_size=square`,
      score: baseScore,
      level,
      rank: i + 1,
      change: Math.floor(Math.random() * 6) - 3, // -3 到 +3
      streak: Math.floor(Math.random() * 20) + 1,
      totalTime: Math.floor(Math.random() * 10000) + 1000
    });
  }
  
  return leaderboard;
}

/**
 * 生成模拟成就数据
 */
export function generateMockAchievements(): Achievement[] {
  return [
    {
      id: 'first_session',
      name: '初次尝试',
      description: '完成第一次训练',
      type: 'milestone',
      rarity: 'common',
      icon: 'play',
      points: 10,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 1,
      maxProgress: 1,
      category: 'beginner'
    },
    {
      id: 'perfect_start',
      name: '完美开始',
      description: '在训练中获得100%准确率',
      type: 'performance',
      rarity: 'rare',
      icon: 'target',
      points: 50,
      unlocked: Math.random() > 0.5,
      unlockedAt: Math.random() > 0.5 ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      progress: Math.random() > 0.5 ? 1 : 0,
      maxProgress: 1,
      category: 'performance'
    },
    {
      id: 'streak_master',
      name: '连击大师',
      description: '保持7天连续训练',
      type: 'consistency',
      rarity: 'epic',
      icon: 'flame',
      points: 100,
      unlocked: Math.random() > 0.7,
      unlockedAt: Math.random() > 0.7 ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      progress: Math.floor(Math.random() * 7),
      maxProgress: 7,
      category: 'consistency'
    },
    {
      id: 'speed_demon',
      name: '反应闪电',
      description: '反应时间低于250毫秒',
      type: 'speed',
      rarity: 'legendary',
      icon: 'zap',
      points: 200,
      unlocked: Math.random() > 0.8,
      unlockedAt: Math.random() > 0.8 ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      progress: Math.random() > 0.8 ? 1 : 0,
      maxProgress: 1,
      category: 'performance'
    },
    {
      id: 'attention_master',
      name: '注意力大师',
      description: '完成50次注意力训练',
      type: 'training_count',
      rarity: 'epic',
      icon: 'eye',
      points: 150,
      unlocked: false,
      progress: Math.floor(Math.random() * 50),
      maxProgress: 50,
      category: 'training'
    },
    {
      id: 'cognitive_genius',
      name: '认知天才',
      description: '在认知灵活性训练中获得95%以上准确率',
      type: 'performance',
      rarity: 'legendary',
      icon: 'brain',
      points: 250,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      category: 'performance'
    },
    {
      id: 'marathon_trainer',
      name: '马拉松训练师',
      description: '单次训练时间超过30分钟',
      type: 'endurance',
      rarity: 'rare',
      icon: 'clock',
      points: 75,
      unlocked: Math.random() > 0.6,
      unlockedAt: Math.random() > 0.6 ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      progress: Math.random() > 0.6 ? 1 : 0,
      maxProgress: 1,
      category: 'endurance'
    },
    {
      id: 'social_butterfly',
      name: '社交达人',
      description: '添加10个好友',
      type: 'social',
      rarity: 'common',
      icon: 'users',
      points: 30,
      unlocked: false,
      progress: Math.floor(Math.random() * 10),
      maxProgress: 10,
      category: 'social'
    }
  ];
}

/**
 * 生成模拟统计数据
 */
export function generateMockStatistics(): UserStatistics {
  const totalSessions = Math.floor(Math.random() * 100) + 20;
  const totalTime = Math.floor(Math.random() * 5000) + 500;
  const currentStreak = Math.floor(Math.random() * 15);
  
  // 生成每日统计数据（最近30天）
  const dailyStats = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const sessions = Math.floor(Math.random() * 5);
    
    if (sessions > 0) {
      dailyStats.push({
        date: date.toDateString(),
        sessions,
        time: Math.floor(Math.random() * 120) + 30,
        score: Math.floor(Math.random() * 500) + 300,
        accuracy: Math.round((Math.random() * 30 + 70) * 10) / 10
      });
    }
  }
  
  // 生成周统计数据（最近12周）
  const weeklyStats = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
    const sessions = Math.floor(Math.random() * 20) + 5;
    
    weeklyStats.push({
      week: `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`,
      sessions,
      time: Math.floor(Math.random() * 600) + 200,
      averageScore: Math.floor(Math.random() * 200) + 400,
      averageAccuracy: Math.round((Math.random() * 20 + 75) * 10) / 10
    });
  }
  
  // 生成月统计数据（最近12个月）
  const monthlyStats = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000);
    const sessions = Math.floor(Math.random() * 80) + 20;
    
    monthlyStats.push({
      month: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
      sessions,
      time: Math.floor(Math.random() * 2000) + 500,
      averageScore: Math.floor(Math.random() * 150) + 450,
      averageAccuracy: Math.round((Math.random() * 15 + 80) * 10) / 10
    });
  }
  
  return {
    totalSessions,
    totalTime,
    averageAccuracy: Math.round((Math.random() * 25 + 75) * 10) / 10,
    bestStreak: Math.max(currentStreak, Math.floor(Math.random() * 20) + 5),
    currentStreak,
    favoriteTraining: ['多维注意力挑战', '认知灵活性训练营', 'N-Back训练'][Math.floor(Math.random() * 3)],
    improvementRate: Math.round((Math.random() * 20 + 5) * 10) / 10,
    weeklyGoalProgress: Math.round(Math.random() * 100),
    monthlyGoalProgress: Math.round(Math.random() * 100),
    trainingDistribution: {
      attention: Math.round(Math.random() * 40) + 20,
      memory: Math.round(Math.random() * 30) + 15,
      reaction: Math.round(Math.random() * 25) + 10,
      cognitive: Math.round(Math.random() * 35) + 15
    },
    dailyStats,
    weeklyStats,
    monthlyStats
  };
}

/**
 * 生成模拟每日目标
 */
export function generateMockDailyGoals(): DailyGoal[] {
  const today = new Date().toDateString();
  
  return [
    {
      id: 'daily_sessions',
      date: today,
      type: 'sessions',
      target: 3,
      current: Math.floor(Math.random() * 4),
      completed: Math.random() > 0.5,
      reward: {
        type: 'points',
        value: 50
      }
    },
    {
      id: 'daily_time',
      date: today,
      type: 'time',
      target: 30, // 30分钟
      current: Math.floor(Math.random() * 40),
      completed: Math.random() > 0.6,
      reward: {
        type: 'points',
        value: 75
      }
    },
    {
      id: 'daily_accuracy',
      date: today,
      type: 'accuracy',
      target: 85, // 85%准确率
      current: Math.round((Math.random() * 20 + 75) * 10) / 10,
      completed: Math.random() > 0.7,
      reward: {
        type: 'achievement',
        value: 'accuracy_master'
      }
    }
  ];
}

/**
 * 数据初始化器
 */
export class MockDataInitializer {
  /**
   * 初始化所有模拟数据
   */
  static initializeAllData(): void {
    // 检查是否已经初始化过
    if (localStorage.getItem('brain_train_initialized')) {
      return;
    }
    
    console.log('🧠 初始化大脑训练模拟数据...');
    
    // 生成用户资料
    const userProfile = generateMockUserProfile();
    localStorage.setItem('brain_train_user_profile', JSON.stringify(userProfile));
    
    // 生成训练会话
    const sessions = [];
    for (let i = 0; i < 15; i++) {
      sessions.push(generateMockTrainingSession(userProfile.id));
    }
    localStorage.setItem('brain_train_training_sessions', JSON.stringify(sessions));
    
    // 生成成就
    const achievements = generateMockAchievements();
    localStorage.setItem('brain_train_achievements', JSON.stringify(achievements));
    
    // 生成好友
    const friends = generateMockFriends(8);
    localStorage.setItem('brain_train_friends', JSON.stringify(friends));
    
    // 生成排行榜
    const leaderboard = generateMockLeaderboard(20);
    localStorage.setItem('brain_train_leaderboard', JSON.stringify(leaderboard));
    
    // 生成统计数据
    const statistics = generateMockStatistics();
    localStorage.setItem('brain_train_statistics', JSON.stringify(statistics));
    
    // 生成每日目标
    const dailyGoals = generateMockDailyGoals();
    localStorage.setItem('brain_train_daily_goals', JSON.stringify(dailyGoals));
    
    // 标记已初始化
    localStorage.setItem('brain_train_initialized', 'true');
    
    console.log('✅ 模拟数据初始化完成！');
  }
  
  /**
   * 重置所有数据并重新初始化
   */
  static resetAndReinitialize(): void {
    // 清除所有数据
    const keys = [
      'brain_train_user_profile',
      'brain_train_user_settings',
      'brain_train_training_sessions',
      'brain_train_achievements',
      'brain_train_friends',
      'brain_train_statistics',
      'brain_train_leaderboard',
      'brain_train_daily_goals',
      'brain_train_initialized'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    
    // 重新初始化
    this.initializeAllData();
  }
  
  /**
   * 添加新的训练会话（用于测试）
   */
  static addRandomTrainingSession(): void {
    const userProfile = JSON.parse(localStorage.getItem('brain_train_user_profile') || '{}');
    if (!userProfile.id) return;
    
    const sessions = JSON.parse(localStorage.getItem('brain_train_training_sessions') || '[]');
    const newSession = generateMockTrainingSession(userProfile.id);
    
    sessions.push(newSession);
    localStorage.setItem('brain_train_training_sessions', JSON.stringify(sessions));
    
    console.log('➕ 添加了新的训练会话:', newSession.trainingName);
  }
  
  /**
   * 解锁随机成就（用于测试）
   */
  static unlockRandomAchievement(): void {
    const achievements = JSON.parse(localStorage.getItem('brain_train_achievements') || '[]');
    const lockedAchievements = achievements.filter((a: Achievement) => !a.unlocked);
    
    if (lockedAchievements.length === 0) {
      console.log('🏆 所有成就都已解锁！');
      return;
    }
    
    const randomAchievement = lockedAchievements[Math.floor(Math.random() * lockedAchievements.length)];
    randomAchievement.unlocked = true;
    randomAchievement.unlockedAt = new Date().toISOString();
    randomAchievement.progress = randomAchievement.maxProgress;
    
    localStorage.setItem('brain_train_achievements', JSON.stringify(achievements));
    
    console.log('🎉 解锁成就:', randomAchievement.name);
  }
}

/**
 * 开发工具（仅在开发环境中使用）
 */
export const DevTools = {
  /**
   * 在控制台中暴露数据管理工具
   */
  exposeToConsole(): void {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).BrainTrainDevTools = {
        initData: MockDataInitializer.initializeAllData,
        resetData: MockDataInitializer.resetAndReinitialize,
        addSession: MockDataInitializer.addRandomTrainingSession,
        unlockAchievement: MockDataInitializer.unlockRandomAchievement,
        viewData: (key: string) => {
          const data = localStorage.getItem(key);
          return data ? JSON.parse(data) : null;
        },
        listKeys: () => {
          return Object.keys(localStorage).filter(key => key.startsWith('brain_train_'));
        }
      };
      
      console.log('🛠️ 开发工具已加载到 window.BrainTrainDevTools');
      console.log('可用命令:');
      console.log('- BrainTrainDevTools.initData() - 初始化数据');
      console.log('- BrainTrainDevTools.resetData() - 重置数据');
      console.log('- BrainTrainDevTools.addSession() - 添加训练会话');
      console.log('- BrainTrainDevTools.unlockAchievement() - 解锁成就');
      console.log('- BrainTrainDevTools.viewData(key) - 查看数据');
      console.log('- BrainTrainDevTools.listKeys() - 列出所有键');
    }
  }
};