/**
 * 本地存储相关的React钩子
 * 提供响应式的本地存储数据管理
 */

import { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  UserSettings,
  TrainingSession,

  Friend,
  LeaderboardEntry,
  UserStatistics,
  DailyGoal,
  UserDataManager,
  TrainingDataManager,

  FriendManager,
  LeaderboardManager,
  LocalStorageManager,
  STORAGE_KEYS
} from '@/lib/storage';
import { MockDataInitializer } from '@/lib/mockData';

/**
 * 用户资料钩子
 */
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化模拟数据（如果需要）
    MockDataInitializer.initializeAllData();
    
    const loadProfile = () => {
      const userProfile = UserDataManager.getUserProfile();
      if (!userProfile) {
        const defaultProfile = UserDataManager.initializeDefaultUser();
        setProfile(defaultProfile);
      } else {
        setProfile(userProfile);
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (!profile) return;
    
    const updatedProfile = { ...profile, ...updates };
    UserDataManager.saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
  }, [profile]);

  const refreshProfile = useCallback(() => {
    const userProfile = UserDataManager.getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
    }
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    refreshProfile
  };
}

/**
 * 用户设置钩子
 */
export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userSettings = UserDataManager.getUserSettings();
    setSettings(userSettings);
    setLoading(false);
  }, []);

  const updateSettings = useCallback((category: keyof UserSettings, key: string, value: any) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    
    UserDataManager.saveUserSettings(updatedSettings);
    setSettings(updatedSettings);
  }, [settings]);

  const updateFullSettings = useCallback((newSettings: UserSettings) => {
    UserDataManager.saveUserSettings(newSettings);
    setSettings(newSettings);
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    updateFullSettings
  };
}

/**
 * 训练会话钩子
 */
export function useTrainingSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const trainingSessions = TrainingDataManager.getTrainingSessions();
    setSessions(trainingSessions);
    setLoading(false);
  }, []);

  const addSession = useCallback((session: TrainingSession) => {
    TrainingDataManager.saveTrainingSession(session);
    setSessions(prev => [...prev, session]);
  }, []);

  const refreshSessions = useCallback(() => {
    const trainingSessions = TrainingDataManager.getTrainingSessions();
    setSessions(trainingSessions);
  }, []);

  // 获取最近的会话
  const getRecentSessions = useCallback((count: number = 10) => {
    return sessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, count);
  }, [sessions]);

  // 按训练类型过滤
  const getSessionsByType = useCallback((trainingType: string) => {
    return sessions.filter(session => session.trainingType === trainingType);
  }, [sessions]);

  // 获取今日会话
  const getTodaySessions = useCallback(() => {
    const today = new Date().toDateString();
    return sessions.filter(session => 
      new Date(session.startTime).toDateString() === today
    );
  }, [sessions]);

  return {
    sessions,
    loading,
    addSession,
    refreshSessions,
    getRecentSessions,
    getSessionsByType,
    getTodaySessions
  };
}

/**
 * 用户统计钩子
 */
export function useUserStatistics() {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStats = TrainingDataManager.getUserStatistics();
    setStatistics(userStats);
    setLoading(false);
  }, []);

  const refreshStatistics = useCallback(() => {
    const userStats = TrainingDataManager.getUserStatistics();
    setStatistics(userStats);
  }, []);

  // 计算改进率
  const getImprovementRate = useCallback(() => {
    if (!statistics || statistics.weeklyStats.length < 2) return 0;
    
    const recent = statistics.weeklyStats[0];
    const previous = statistics.weeklyStats[1];
    
    if (previous.averageScore === 0) return 0;
    
    return Math.round(((recent.averageScore - previous.averageScore) / previous.averageScore) * 100);
  }, [statistics]);

  // 获取训练趋势
  const getTrainingTrend = useCallback(() => {
    if (!statistics || statistics.dailyStats.length < 7) return 'stable';
    
    const recentWeek = statistics.dailyStats.slice(0, 7);
    const previousWeek = statistics.dailyStats.slice(7, 14);
    
    const recentAvg = recentWeek.reduce((sum, day) => sum + day.sessions, 0) / recentWeek.length;
    const previousAvg = previousWeek.reduce((sum, day) => sum + day.sessions, 0) / previousWeek.length;
    
    if (recentAvg > previousAvg * 1.1) return 'improving';
    if (recentAvg < previousAvg * 0.9) return 'declining';
    return 'stable';
  }, [statistics]);

  return {
    statistics,
    loading,
    refreshStatistics,
    getImprovementRate,
    getTrainingTrend
  };
}



/**
 * 好友钩子
 */
export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userFriends = FriendManager.getFriends();
    setFriends(userFriends);
    setLoading(false);
  }, []);

  const addFriend = useCallback((friend: Friend) => {
    FriendManager.addFriend(friend);
    setFriends(prev => [...prev, friend]);
  }, []);

  const removeFriend = useCallback((friendId: string) => {
    FriendManager.removeFriend(friendId);
    setFriends(prev => prev.filter(f => f.id !== friendId));
  }, []);

  const refreshFriends = useCallback(() => {
    const userFriends = FriendManager.getFriends();
    setFriends(userFriends);
  }, []);

  // 获取在线好友
  const getOnlineFriends = useCallback(() => {
    return friends.filter(friend => friend.isOnline);
  }, [friends]);

  // 按等级排序
  const getFriendsByLevel = useCallback(() => {
    return [...friends].sort((a, b) => b.level - a.level);
  }, [friends]);

  return {
    friends,
    loading,
    addFriend,
    removeFriend,
    refreshFriends,
    getOnlineFriends,
    getFriendsByLevel
  };
}

/**
 * 排行榜钩子
 */
export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const leaderboardData = LeaderboardManager.getLeaderboard();
    setLeaderboard(leaderboardData);
    setLoading(false);
  }, []);

  const refreshLeaderboard = useCallback(() => {
    LeaderboardManager.updateLeaderboard();
    const leaderboardData = LeaderboardManager.getLeaderboard();
    setLeaderboard(leaderboardData);
  }, []);

  // 获取用户排名
  const getUserRank = useCallback((userId: string) => {
    const entry = leaderboard.find(entry => entry.id === userId);
    return entry ? entry.rank : null;
  }, [leaderboard]);

  // 获取前N名
  const getTopPlayers = useCallback((count: number = 10) => {
    return leaderboard.slice(0, count);
  }, [leaderboard]);

  return {
    leaderboard,
    loading,
    refreshLeaderboard,
    getUserRank,
    getTopPlayers
  };
}

/**
 * 每日目标钩子
 */
export function useDailyGoals() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dailyGoals = LocalStorageManager.load<DailyGoal[]>(STORAGE_KEYS.DAILY_GOALS, []);
    setGoals(dailyGoals);
    setLoading(false);
  }, []);

  const updateGoalProgress = useCallback((goalId: string, progress: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = {
          ...goal,
          current: progress,
          completed: progress >= goal.target
        };
        return updatedGoal;
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    LocalStorageManager.save(STORAGE_KEYS.DAILY_GOALS, updatedGoals);
  }, [goals]);

  const refreshGoals = useCallback(() => {
    const dailyGoals = LocalStorageManager.load<DailyGoal[]>(STORAGE_KEYS.DAILY_GOALS, []);
    setGoals(dailyGoals);
  }, []);

  // 获取完成的目标
  const getCompletedGoals = useCallback(() => {
    return goals.filter(goal => goal.completed);
  }, [goals]);

  // 获取未完成的目标
  const getPendingGoals = useCallback(() => {
    return goals.filter(goal => !goal.completed);
  }, [goals]);

  // 计算总体进度
  const getOverallProgress = useCallback(() => {
    if (goals.length === 0) return 0;
    
    const totalProgress = goals.reduce((sum, goal) => {
      return sum + Math.min(goal.current / goal.target, 1);
    }, 0);
    
    return Math.round((totalProgress / goals.length) * 100);
  }, [goals]);

  return {
    goals,
    loading,
    updateGoalProgress,
    refreshGoals,
    getCompletedGoals,
    getPendingGoals,
    getOverallProgress
  };
}

/**
 * 通用本地存储钩子
 */
export function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    return LocalStorageManager.load(key, defaultValue);
  });

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const updatedValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value)
      : newValue;
    
    setValue(updatedValue);
    LocalStorageManager.save(key, updatedValue);
  }, [key, value]);

  const resetValue = useCallback(() => {
    setValue(defaultValue);
    LocalStorageManager.save(key, defaultValue);
  }, [key, defaultValue]);

  return [value, updateValue, resetValue] as const;
}

/**
 * 数据同步钩子
 * 用于在多个组件之间同步数据状态
 */
export function useDataSync() {
  const { refreshProfile } = useUserProfile();
  const { refreshSessions } = useTrainingSessions();
  const { refreshStatistics } = useUserStatistics();

  const { refreshFriends } = useFriends();
  const { refreshLeaderboard } = useLeaderboard();
  const { refreshGoals } = useDailyGoals();

  const syncAllData = useCallback(() => {
    refreshProfile();
    refreshSessions();
    refreshStatistics();

    refreshFriends();
    refreshLeaderboard();
    refreshGoals();
  }, [
    refreshProfile,
    refreshSessions,
    refreshStatistics,

    refreshFriends,
    refreshLeaderboard,
    refreshGoals
  ]);

  return {
    syncAllData
  };
}