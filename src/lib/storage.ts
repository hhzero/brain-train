/**
 * 本地存储和模拟数据系统
 * 提供用户数据、训练记录、成就等的本地存储管理
 */

// 存储键名常量
export const STORAGE_KEYS = {
  USER_PROFILE: 'brain_train_user_profile',
  USER_SETTINGS: 'brain_train_user_settings',
  TRAINING_SESSIONS: 'brain_train_training_sessions',
  ACHIEVEMENTS: 'brain_train_achievements',
  FRIENDS: 'brain_train_friends',
  STATISTICS: 'brain_train_statistics',
  LEADERBOARD: 'brain_train_leaderboard',
  DAILY_GOALS: 'brain_train_daily_goals',
  TRAINING_HISTORY: 'brain_train_training_history'
} as const;

// 用户资料接口
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  level: number;
  totalScore: number;
  totalTrainingTime: number;
  achievements: number;
  joinDate: string;
  lastActive: string;
  streak: number;
  favoriteTraining: string;
  rank: number;
  completedSessions: number;
  averageAccuracy: number;
  bestReactionTime: number;
}

// 用户设置接口
export interface UserSettings {
  notifications: {
    achievements: boolean;
    friendRequests: boolean;
    trainingReminders: boolean;
    weeklyReports: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
    showTrainingStats: boolean;
    showAchievements: boolean;
  };
  training: {
    difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
    sessionDuration: number;
    breakReminders: boolean;
    autoSave: boolean;
    showHints: boolean;
    adaptiveDifficulty: boolean;
  };
  interface: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    animations: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: 'default' | 'colorblind' | 'highContrast';
  };
  audio: {
    masterVolume: number;
    effectsVolume: number;
    voiceVolume: number;
    muteAll: boolean;
  };
}

// 训练会话接口
export interface TrainingSession {
  id: string;
  userId: string;
  trainingType: string;
  trainingName: string;
  startTime: string;
  endTime: string;
  duration: number; // 秒
  score: number;
  accuracy: number;
  reactionTime?: number;
  difficulty: string;
  completed: boolean;
  achievements?: string[];
  statistics: {
    correctAnswers: number;
    totalQuestions: number;
    averageReactionTime: number;
    bestReactionTime: number;
    worstReactionTime: number;
    streakCount: number;
    mistakeCount: number;
  };
  metadata?: Record<string, any>;
}

// 成就接口
export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category: string;
}

// 好友接口
export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  level: number;
  isOnline: boolean;
  lastActive: string;
  mutualFriends: number;
  addedAt: string;
}

// 排行榜条目接口
export interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  score: number;
  level: number;
  rank: number;
  change: number; // 排名变化
  streak: number;
  totalTime: number;
}

// 统计数据接口
export interface UserStatistics {
  totalSessions: number;
  totalTime: number;
  averageAccuracy: number;
  bestStreak: number;
  currentStreak: number;
  favoriteTraining: string;
  improvementRate: number;
  weeklyGoalProgress: number;
  monthlyGoalProgress: number;
  trainingDistribution: {
    attention: number;
    memory: number;
    reaction: number;
    cognitive: number;
  };
  dailyStats: Array<{
    date: string;
    sessions: number;
    time: number;
    score: number;
    accuracy: number;
  }>;
  weeklyStats: Array<{
    week: string;
    sessions: number;
    time: number;
    averageScore: number;
    averageAccuracy: number;
  }>;
  monthlyStats: Array<{
    month: string;
    sessions: number;
    time: number;
    averageScore: number;
    averageAccuracy: number;
  }>;
}

// 每日目标接口
export interface DailyGoal {
  id: string;
  date: string;
  type: 'sessions' | 'time' | 'score' | 'accuracy';
  target: number;
  current: number;
  completed: boolean;
  reward?: {
    type: 'points' | 'achievement';
    value: string | number;
  };
}

/**
 * 本地存储管理类
 */
export class LocalStorageManager {
  /**
   * 保存数据到本地存储
   */
  static save<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('保存数据到本地存储失败:', error);
    }
  }

  /**
   * 从本地存储读取数据
   */
  static load<T>(key: string, defaultValue: T): T {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return defaultValue;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error('从本地存储读取数据失败:', error);
      return defaultValue;
    }
  }

  /**
   * 删除本地存储中的数据
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('删除本地存储数据失败:', error);
    }
  }

  /**
   * 清空所有应用数据
   */
  static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('清空本地存储失败:', error);
    }
  }

  /**
   * 检查本地存储是否可用
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 用户数据管理器
 */
export class UserDataManager {
  /**
   * 获取用户资料
   */
  static getUserProfile(): UserProfile | null {
    return LocalStorageManager.load<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
  }

  /**
   * 保存用户资料
   */
  static saveUserProfile(profile: UserProfile): void {
    LocalStorageManager.save(STORAGE_KEYS.USER_PROFILE, profile);
  }

  /**
   * 获取用户设置
   */
  static getUserSettings(): UserSettings {
    const defaultSettings: UserSettings = {
      notifications: {
        achievements: true,
        friendRequests: true,
        trainingReminders: true,
        weeklyReports: true,
        soundEnabled: true,
        vibrationEnabled: false
      },
      privacy: {
        profileVisible: true,
        showOnlineStatus: true,
        allowFriendRequests: true,
        showTrainingStats: true,
        showAchievements: true
      },
      training: {
        difficulty: 'adaptive',
        sessionDuration: 15,
        breakReminders: true,
        autoSave: true,
        showHints: true,
        adaptiveDifficulty: true
      },
      interface: {
        theme: 'dark',
        language: 'zh',
        animations: true,
        reducedMotion: false,
        fontSize: 'medium',
        colorScheme: 'default'
      },
      audio: {
        masterVolume: 80,
        effectsVolume: 70,
        voiceVolume: 85,
        muteAll: false
      }
    };
    
    return LocalStorageManager.load(STORAGE_KEYS.USER_SETTINGS, defaultSettings);
  }

  /**
   * 保存用户设置
   */
  static saveUserSettings(settings: UserSettings): void {
    LocalStorageManager.save(STORAGE_KEYS.USER_SETTINGS, settings);
  }

  /**
   * 更新用户设置的特定部分
   */
  static updateUserSettings(category: keyof UserSettings, key: string, value: any): void {
    const settings = this.getUserSettings();
    (settings[category] as any)[key] = value;
    this.saveUserSettings(settings);
  }

  /**
   * 初始化默认用户数据
   */
  static initializeDefaultUser(): UserProfile {
    const defaultProfile: UserProfile = {
      id: 'user_' + Date.now(),
      username: 'brainmaster' + Math.floor(Math.random() * 10000),
      displayName: '大脑训练师',
      email: 'user@example.com',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20brain%20training%20character%20with%20glowing%20neural%20networks&image_size=square',
      bio: '热爱大脑训练，致力于提升认知能力！',
      level: 1,
      totalScore: 0,
      totalTrainingTime: 0,
      achievements: 0,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      streak: 0,
      favoriteTraining: '',
      rank: 999,
      completedSessions: 0,
      averageAccuracy: 0,
      bestReactionTime: 0
    };
    
    this.saveUserProfile(defaultProfile);
    return defaultProfile;
  }
}

/**
 * 训练数据管理器
 */
export class TrainingDataManager {
  /**
   * 获取所有训练会话
   */
  static getTrainingSessions(): TrainingSession[] {
    return LocalStorageManager.load<TrainingSession[]>(STORAGE_KEYS.TRAINING_SESSIONS, []);
  }

  /**
   * 保存训练会话
   */
  static saveTrainingSession(session: TrainingSession): void {
    const sessions = this.getTrainingSessions();
    sessions.push(session);
    LocalStorageManager.save(STORAGE_KEYS.TRAINING_SESSIONS, sessions);
    
    // 更新用户统计
    this.updateUserStatistics(session);
  }

  /**
   * 获取用户统计数据
   */
  static getUserStatistics(): UserStatistics {
    const defaultStats: UserStatistics = {
      totalSessions: 0,
      totalTime: 0,
      averageAccuracy: 0,
      bestStreak: 0,
      currentStreak: 0,
      favoriteTraining: '',
      improvementRate: 0,
      weeklyGoalProgress: 0,
      monthlyGoalProgress: 0,
      trainingDistribution: {
        attention: 0,
        memory: 0,
        reaction: 0,
        cognitive: 0
      },
      dailyStats: [],
      weeklyStats: [],
      monthlyStats: []
    };
    
    return LocalStorageManager.load(STORAGE_KEYS.STATISTICS, defaultStats);
  }

  /**
   * 更新用户统计数据
   */
  static updateUserStatistics(session: TrainingSession): void {
    const stats = this.getUserStatistics();
    const sessions = this.getTrainingSessions();
    
    // 更新基本统计
    stats.totalSessions = sessions.length;
    stats.totalTime = sessions.reduce((total, s) => total + s.duration, 0);
    stats.averageAccuracy = sessions.reduce((total, s) => total + s.accuracy, 0) / sessions.length;
    
    // 更新训练分布
    const typeMap: Record<string, keyof typeof stats.trainingDistribution> = {
      '多维注意力挑战': 'attention',
      '认知灵活性训练营': 'cognitive',
      'N-Back训练': 'memory',
      '反应速度训练': 'reaction'
    };
    
    const distribution = { attention: 0, memory: 0, reaction: 0, cognitive: 0 };
    sessions.forEach(s => {
      const type = typeMap[s.trainingName] || 'cognitive';
      distribution[type]++;
    });
    
    const total = sessions.length;
    if (total > 0) {
      stats.trainingDistribution = {
        attention: Math.round((distribution.attention / total) * 100),
        memory: Math.round((distribution.memory / total) * 100),
        reaction: Math.round((distribution.reaction / total) * 100),
        cognitive: Math.round((distribution.cognitive / total) * 100)
      };
    }
    
    // 计算连击
    stats.currentStreak = this.calculateCurrentStreak(sessions);
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    
    // 更新每日统计
    this.updateDailyStats(stats, session);
    
    LocalStorageManager.save(STORAGE_KEYS.STATISTICS, stats);
    
    // 更新用户资料
    this.updateUserProfile(stats);
  }

  /**
   * 计算当前连击
   */
  private static calculateCurrentStreak(sessions: TrainingSession[]): number {
    if (sessions.length === 0) return 0;
    
    const today = new Date();
    const dates = new Set<string>();
    
    // 获取最近的训练日期
    sessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .forEach(session => {
        const date = new Date(session.startTime).toDateString();
        dates.add(date);
      });
    
    const sortedDates = Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (const dateStr of sortedDates) {
      const sessionDate = new Date(dateStr);
      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * 更新每日统计
   */
  private static updateDailyStats(stats: UserStatistics, session: TrainingSession): void {
    const sessionDate = new Date(session.startTime).toDateString();
    
    let dailyStat = stats.dailyStats.find(d => d.date === sessionDate);
    if (!dailyStat) {
      dailyStat = {
        date: sessionDate,
        sessions: 0,
        time: 0,
        score: 0,
        accuracy: 0
      };
      stats.dailyStats.push(dailyStat);
    }
    
    dailyStat.sessions++;
    dailyStat.time += session.duration;
    dailyStat.score = (dailyStat.score * (dailyStat.sessions - 1) + session.score) / dailyStat.sessions;
    dailyStat.accuracy = (dailyStat.accuracy * (dailyStat.sessions - 1) + session.accuracy) / dailyStat.sessions;
    
    // 保持最近30天的数据
    stats.dailyStats = stats.dailyStats
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);
  }

  /**
   * 更新用户资料
   */
  private static updateUserProfile(stats: UserStatistics): void {
    const profile = UserDataManager.getUserProfile();
    if (!profile) return;
    
    profile.totalTrainingTime = Math.floor(stats.totalTime / 60); // 转换为分钟
    profile.completedSessions = stats.totalSessions;
    profile.averageAccuracy = Math.round(stats.averageAccuracy * 10) / 10;
    profile.streak = stats.currentStreak;
    profile.lastActive = new Date().toISOString();
    
    // 计算等级（每1000分升一级）
    profile.level = Math.floor(profile.totalScore / 1000) + 1;
    
    UserDataManager.saveUserProfile(profile);
  }
}

/**
 * 成就管理器
 */
export class AchievementManager {
  /**
   * 获取所有成就
   */
  static getAchievements(): Achievement[] {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first_session',
        name: '初次尝试',
        description: '完成第一次训练',
        type: 'milestone',
        rarity: 'common',
        icon: 'play',
        points: 10,
        unlocked: false,
        progress: 0,
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
        unlocked: false,
        progress: 0,
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
        unlocked: false,
        progress: 0,
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
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        category: 'performance'
      }
    ];
    
    return LocalStorageManager.load(STORAGE_KEYS.ACHIEVEMENTS, defaultAchievements);
  }

  /**
   * 保存成就
   */
  static saveAchievements(achievements: Achievement[]): void {
    LocalStorageManager.save(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }

  /**
   * 检查并解锁成就
   */
  static checkAndUnlockAchievements(session: TrainingSession): Achievement[] {
    const achievements = this.getAchievements();
    const unlockedAchievements: Achievement[] = [];
    const stats = TrainingDataManager.getUserStatistics();
    
    achievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first_session':
          shouldUnlock = stats.totalSessions >= 1;
          achievement.progress = Math.min(stats.totalSessions, 1);
          break;
          
        case 'perfect_start':
          shouldUnlock = session.accuracy >= 100;
          achievement.progress = session.accuracy >= 100 ? 1 : 0;
          break;
          
        case 'streak_master':
          shouldUnlock = stats.currentStreak >= 7;
          achievement.progress = Math.min(stats.currentStreak, 7);
          break;
          
        case 'speed_demon':
          if (session.reactionTime && session.reactionTime <= 250) {
            shouldUnlock = true;
            achievement.progress = 1;
          }
          break;
      }
      
      if (shouldUnlock && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        unlockedAchievements.push(achievement);
        
        // 更新用户积分
        const profile = UserDataManager.getUserProfile();
        if (profile) {
          profile.totalScore += achievement.points;
          profile.achievements++;
          UserDataManager.saveUserProfile(profile);
        }
      }
    });
    
    this.saveAchievements(achievements);
    return unlockedAchievements;
  }
}

/**
 * 好友管理器
 */
export class FriendManager {
  /**
   * 获取好友列表
   */
  static getFriends(): Friend[] {
    const mockFriends: Friend[] = [
      {
        id: 'friend_1',
        username: 'cognitivemaster',
        displayName: '认知大师',
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20smart%20character%20with%20glasses&image_size=square',
        level: 18,
        isOnline: true,
        lastActive: new Date().toISOString(),
        mutualFriends: 3,
        addedAt: '2024-02-15'
      },
      {
        id: 'friend_2',
        username: 'memoryking',
        displayName: '记忆王者',
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20character%20with%20glowing%20brain&image_size=square',
        level: 12,
        isOnline: false,
        lastActive: '2024-03-14T10:30:00Z',
        mutualFriends: 1,
        addedAt: '2024-03-01'
      }
    ];
    
    return LocalStorageManager.load(STORAGE_KEYS.FRIENDS, mockFriends);
  }

  /**
   * 添加好友
   */
  static addFriend(friend: Friend): void {
    const friends = this.getFriends();
    friends.push(friend);
    LocalStorageManager.save(STORAGE_KEYS.FRIENDS, friends);
  }

  /**
   * 删除好友
   */
  static removeFriend(friendId: string): void {
    const friends = this.getFriends().filter(f => f.id !== friendId);
    LocalStorageManager.save(STORAGE_KEYS.FRIENDS, friends);
  }
}

/**
 * 排行榜管理器
 */
export class LeaderboardManager {
  /**
   * 获取排行榜数据
   */
  static getLeaderboard(): LeaderboardEntry[] {
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        id: 'user_1',
        username: 'brainchampion',
        displayName: '大脑冠军',
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20champion%20character%20with%20crown&image_size=square',
        score: 25000,
        level: 25,
        rank: 1,
        change: 0,
        streak: 15,
        totalTime: 12000
      },
      {
        id: 'user_2',
        username: 'mindmaster',
        displayName: '思维大师',
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20wise%20character%20with%20glowing%20eyes&image_size=square',
        score: 22000,
        level: 22,
        rank: 2,
        change: 1,
        streak: 12,
        totalTime: 10800
      },
      {
        id: 'user_3',
        username: 'cognitiveace',
        displayName: '认知王牌',
        avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20ace%20character%20with%20cards&image_size=square',
        score: 20000,
        level: 20,
        rank: 3,
        change: -1,
        streak: 8,
        totalTime: 9600
      }
    ];
    
    return LocalStorageManager.load(STORAGE_KEYS.LEADERBOARD, mockLeaderboard);
  }

  /**
   * 更新排行榜
   */
  static updateLeaderboard(): void {
    // 这里可以实现排行榜更新逻辑
    // 在真实应用中，这会从服务器获取最新数据
  }
}

/**
 * 数据导出/导入管理器
 */
export class DataManager {
  /**
   * 导出所有用户数据
   */
  static exportUserData(): string {
    const data = {
      profile: UserDataManager.getUserProfile(),
      settings: UserDataManager.getUserSettings(),
      sessions: TrainingDataManager.getTrainingSessions(),
      achievements: AchievementManager.getAchievements(),
      statistics: TrainingDataManager.getUserStatistics(),
      friends: FriendManager.getFriends(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入用户数据
   */
  static importUserData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.profile) UserDataManager.saveUserProfile(data.profile);
      if (data.settings) UserDataManager.saveUserSettings(data.settings);
      if (data.sessions) LocalStorageManager.save(STORAGE_KEYS.TRAINING_SESSIONS, data.sessions);
      if (data.achievements) AchievementManager.saveAchievements(data.achievements);
      if (data.statistics) LocalStorageManager.save(STORAGE_KEYS.STATISTICS, data.statistics);
      if (data.friends) LocalStorageManager.save(STORAGE_KEYS.FRIENDS, data.friends);
      
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }

  /**
   * 重置所有数据
   */
  static resetAllData(): void {
    LocalStorageManager.clearAll();
    UserDataManager.initializeDefaultUser();
  }
}