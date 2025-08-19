import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  TrainingSession,
  TrainingResult,
  UserProgress,
  TrainingType,
  DifficultyLevel,
  TrainingStatus,

  AdaptiveDifficultySystem,
  GameificationElements,
  TrainingStats,
  AnyTrainingConfig,
  AnyTrainingResult
} from '@/types/training';

interface TrainingStore {
  // 当前训练会话
  currentSession: TrainingSession | null;
  
  // 用户进度数据
  userProgress: Record<TrainingType, UserProgress>;
  
  // 训练历史记录
  trainingHistory: TrainingResult[];
  
  // 自适应难度系统
  adaptiveDifficulty: Record<TrainingType, AdaptiveDifficultySystem>;
  
  // 游戏化元素
  gamification: GameificationElements;
  
  // 训练统计
  stats: TrainingStats;
  
  // 用户设置
  settings: {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    adaptiveDifficultyEnabled: boolean;
    dailyGoalMinutes: number;
    preferredDifficulty: DifficultyLevel;
    notifications: {
      dailyReminder: boolean;

      goalCompleted: boolean;
    };
  };
  
  // Actions
  startTrainingSession: (type: TrainingType, config: AnyTrainingConfig) => void;
  pauseTrainingSession: () => void;
  resumeTrainingSession: () => void;
  completeTrainingSession: (result: AnyTrainingResult) => void;
  cancelTrainingSession: () => void;
  
  // 进度管理
  updateUserProgress: (type: TrainingType, result: TrainingResult) => void;
  getProgressByType: (type: TrainingType) => UserProgress;
  

  
  // 自适应难度
  adjustDifficulty: (type: TrainingType, performance: { accuracy: number; reactionTime: number }) => DifficultyLevel;
  getDifficultyRecommendation: (type: TrainingType) => DifficultyLevel;
  
  // 统计数据
  updateStats: (result: TrainingResult) => void;
  getWeeklyProgress: () => number;
  getDailyStreak: () => number;
  
  // 设置管理
  updateSettings: (settings: Partial<TrainingStore['settings']>) => void;
  
  // 数据重置
  resetProgress: (type?: TrainingType) => void;
  resetAllData: () => void;
  
  // 存储管理
  cleanupOldData: () => void;
  safeStorageUpdate: (newState: Partial<TrainingStore>) => void;
  handleStorageQuotaExceeded: () => void;
  showStorageError: () => void;
  getStorageUsage: () => {
    currentSize: number;
    maxSize: number;
    usagePercentage: number;
    isNearLimit: boolean;
    trainingHistoryCount: number;
    dailyStatsCount: number;
    weeklyStatsCount: number;
    monthlyStatsCount: number;
  };
  manualCleanup: () => any;
}

// 默认用户进度
const createDefaultUserProgress = (type: TrainingType): UserProgress => ({
  userId: 'default',
  trainingType: type,
  level: 1,
  experience: 0,
  totalSessions: 0,
  totalTimeSpent: 0,
  bestScore: 0,
  bestAccuracy: 0,
  bestReactionTime: Infinity,
  currentStreak: 0,
  longestStreak: 0,

  lastTrainingDate: new Date(),
  weeklyGoal: 150, // 150分钟/周
  weeklyProgress: 0
});

// 默认自适应难度系统
const createDefaultAdaptiveDifficulty = (): AdaptiveDifficultySystem => ({
  currentDifficulty: 'beginner',
  performanceHistory: [],
  adjustmentThresholds: {
    increaseThreshold: 85, // 85%准确率提升难度
    decreaseThreshold: 60, // 60%准确率降低难度
    stabilityWindow: 5 // 5次会话的稳定性窗口
  }
});

// 默认游戏化元素
const createDefaultGameification = (): GameificationElements => ({
  level: 1,
  experience: 0,
  experienceToNext: 100,
  rank: 'Novice',
  badges: [],
  streaks: {
    current: 0,
    longest: 0,
    type: 'daily'
  },
  leaderboard: {
    position: 0,
    totalUsers: 1,
    category: 'overall'
  }
});

// 默认统计数据
const createDefaultStats = (): TrainingStats => ({
  daily: [],
  weekly: [],
  monthly: []
});

export const useTrainingStore = create<TrainingStore>()(persist(
  (set, get) => ({
    currentSession: null,
    userProgress: {
      gaze: createDefaultUserProgress('gaze'),
      schulte: createDefaultUserProgress('schulte'),
      'multi-attention': createDefaultUserProgress('multi-attention'),
      'cognitive-flexibility': createDefaultUserProgress('cognitive-flexibility'),
      'grid-memory': createDefaultUserProgress('grid-memory')
    },
    trainingHistory: [],
    adaptiveDifficulty: {
      gaze: createDefaultAdaptiveDifficulty(),
      schulte: createDefaultAdaptiveDifficulty(),
      'multi-attention': createDefaultAdaptiveDifficulty(),
      'cognitive-flexibility': createDefaultAdaptiveDifficulty(),
      'grid-memory': createDefaultAdaptiveDifficulty()
    },
    gamification: createDefaultGameification(),
    stats: createDefaultStats(),
    settings: {
      soundEnabled: true,
      vibrationEnabled: true,
      adaptiveDifficultyEnabled: true,
      dailyGoalMinutes: 30,
      preferredDifficulty: 'intermediate',
      notifications: {
        dailyReminder: true,

        goalCompleted: true
      }
    },

    startTrainingSession: (type, config) => {
      const session: TrainingSession = {
        id: `session_${Date.now()}`,
        type,
        config,
        startTime: new Date(),
        status: 'active'
      };
      set({ currentSession: session });
    },

    pauseTrainingSession: () => {
      set((state) => ({
        currentSession: state.currentSession
          ? { ...state.currentSession, status: 'paused' as TrainingStatus }
          : null
      }));
    },

    resumeTrainingSession: () => {
      set((state) => ({
        currentSession: state.currentSession
          ? { ...state.currentSession, status: 'active' as TrainingStatus }
          : null
      }));
    },

    completeTrainingSession: (result) => {
      const state = get();
      if (!state.currentSession) return;

      try {
        const completedSession: TrainingSession = {
          ...state.currentSession,
          endTime: new Date(),
          status: 'completed',
          results: result
        };

        // 更新训练历史（限制最大数量，防止存储配额超出）
        const maxHistorySize = 50; // 减少到50条历史记录
        const newHistory = [...state.trainingHistory, result].slice(-maxHistorySize);
        
        // 清理旧数据
        get().cleanupOldData();
        
        // 更新用户进度
        state.updateUserProgress(result.type, result);
        
        // 更新统计数据
        state.updateStats(result);
        
        // 调整自适应难度
        if (state.settings.adaptiveDifficultyEnabled) {
          state.adjustDifficulty(result.type, {
            accuracy: result.accuracy,
            reactionTime: result.reactionTime
          });
        }

        // 尝试保存数据，如果失败则清理更多数据
        const newState = {
          currentSession: null,
          trainingHistory: newHistory
        };
        
        // 检查存储大小并尝试保存
        state.safeStorageUpdate(newState);
        
      } catch (error) {
        console.error('完成训练会话时发生错误:', error);
        // 如果是存储配额错误，尝试清理数据
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          state.handleStorageQuotaExceeded();
        }
      }
    },

    cancelTrainingSession: () => {
      set({ currentSession: null });
    },

    updateUserProgress: (type, result) => {
      set((state) => {
        const progress = state.userProgress[type];
        const newExperience = progress.experience + Math.floor(result.score / 10);
        const newLevel = Math.floor(newExperience / 100) + 1;
        
        const updatedProgress: UserProgress = {
          ...progress,
          level: newLevel,
          experience: newExperience,
          totalSessions: progress.totalSessions + 1,
          totalTimeSpent: progress.totalTimeSpent + result.timeSpent,
          bestScore: Math.max(progress.bestScore, result.score),
          bestAccuracy: Math.max(progress.bestAccuracy, result.accuracy),
          bestReactionTime: Math.min(progress.bestReactionTime, result.reactionTime),
          lastTrainingDate: new Date(),
          weeklyProgress: progress.weeklyProgress + (result.timeSpent / 60) // 转换为分钟
        };

        return {
          userProgress: {
            ...state.userProgress,
            [type]: updatedProgress
          }
        };
      });
    },

    getProgressByType: (type) => {
      return get().userProgress[type];
    },



    adjustDifficulty: (type, performance) => {
      const state = get();
      const adaptiveSystem = state.adaptiveDifficulty[type];
      const { accuracy } = performance;
      const { increaseThreshold, decreaseThreshold } = adaptiveSystem.adjustmentThresholds;
      
      let newDifficulty = adaptiveSystem.currentDifficulty;
      
      if (accuracy >= increaseThreshold) {
        // 提升难度
        const difficultyLevels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
        const currentIndex = difficultyLevels.indexOf(adaptiveSystem.currentDifficulty);
        if (currentIndex < difficultyLevels.length - 1) {
          newDifficulty = difficultyLevels[currentIndex + 1];
        }
      } else if (accuracy <= decreaseThreshold) {
        // 降低难度
        const difficultyLevels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
        const currentIndex = difficultyLevels.indexOf(adaptiveSystem.currentDifficulty);
        if (currentIndex > 0) {
          newDifficulty = difficultyLevels[currentIndex - 1];
        }
      }
      
      set((state) => ({
        adaptiveDifficulty: {
          ...state.adaptiveDifficulty,
          [type]: {
            ...adaptiveSystem,
            currentDifficulty: newDifficulty,
            performanceHistory: [
              ...adaptiveSystem.performanceHistory.slice(-9), // 保留最近10次记录
              { ...performance, timestamp: new Date() }
            ]
          }
        }
      }));
      
      return newDifficulty;
    },

    getDifficultyRecommendation: (type) => {
      return get().adaptiveDifficulty[type].currentDifficulty;
    },

    updateStats: (result) => {
      set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const dailyStats = state.stats.daily;
        const existingDayIndex = dailyStats.findIndex(day => day.date === today);
        
        if (existingDayIndex >= 0) {
          // 更新今天的统计
          dailyStats[existingDayIndex] = {
            ...dailyStats[existingDayIndex],
            sessions: dailyStats[existingDayIndex].sessions + 1,
            totalTime: dailyStats[existingDayIndex].totalTime + result.timeSpent,
            averageScore: (dailyStats[existingDayIndex].averageScore + result.score) / 2,
            averageAccuracy: (dailyStats[existingDayIndex].averageAccuracy + result.accuracy) / 2
          };
        } else {
          // 添加新的一天
          dailyStats.push({
            date: today,
            sessions: 1,
            totalTime: result.timeSpent,
            averageScore: result.score,
            averageAccuracy: result.accuracy
          });
        }
        
        return {
          stats: {
            ...state.stats,
            daily: dailyStats.slice(-30), // 保留最近30天
            weekly: state.stats.weekly.slice(-12), // 保留最近12周
            monthly: state.stats.monthly.slice(-12) // 保留最近12个月
          }
        };
      });
    },

    getWeeklyProgress: () => {
      const state = get();
      const totalProgress = Object.values(state.userProgress)
        .reduce((sum, progress) => sum + progress.weeklyProgress, 0);
      return totalProgress;
    },

    getDailyStreak: () => {
      const state = get();
      return state.gamification.streaks.current;
    },

    updateSettings: (newSettings) => {
      set((state) => ({
        settings: { ...state.settings, ...newSettings }
      }));
    },

    resetProgress: (type) => {
      if (type) {
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            [type]: createDefaultUserProgress(type)
          }
        }));
      } else {
        set((state) => ({
          userProgress: {
            gaze: createDefaultUserProgress('gaze'),
            schulte: createDefaultUserProgress('schulte'),
            'multi-attention': createDefaultUserProgress('multi-attention'),
            'cognitive-flexibility': createDefaultUserProgress('cognitive-flexibility'),
            'grid-memory': createDefaultUserProgress('grid-memory')
          }
        }));
      }
    },

    resetAllData: () => {
      set({
        currentSession: null,
        userProgress: {
          gaze: createDefaultUserProgress('gaze'),
          schulte: createDefaultUserProgress('schulte'),
          'multi-attention': createDefaultUserProgress('multi-attention'),
          'cognitive-flexibility': createDefaultUserProgress('cognitive-flexibility'),
          'grid-memory': createDefaultUserProgress('grid-memory')
        },
        trainingHistory: [],
        adaptiveDifficulty: {
          gaze: createDefaultAdaptiveDifficulty(),
          schulte: createDefaultAdaptiveDifficulty(),
          'multi-attention': createDefaultAdaptiveDifficulty(),
          'cognitive-flexibility': createDefaultAdaptiveDifficulty(),
          'grid-memory': createDefaultAdaptiveDifficulty()
        },
        gamification: createDefaultGameification(),
        stats: createDefaultStats()
      });
    },

    // 清理旧数据的方法
    cleanupOldData: () => {
      set((state) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // 清理30天前的训练历史
        const filteredHistory = state.trainingHistory.filter(
          record => new Date(record.timestamp) > thirtyDaysAgo
        );
        
        // 清理旧的统计数据
        const cleanedStats = {
          ...state.stats,
          daily: state.stats.daily.slice(-15), // 只保留最近15天
          weekly: state.stats.weekly.slice(-8), // 只保留最近8周
          monthly: state.stats.monthly.slice(-6) // 只保留最近6个月
        };
        
        // 清理自适应难度的历史记录
        const cleanedAdaptiveDifficulty = Object.keys(state.adaptiveDifficulty).reduce((acc, key) => {
          const difficulty = state.adaptiveDifficulty[key as TrainingType];
          acc[key as TrainingType] = {
            ...difficulty,
            performanceHistory: difficulty.performanceHistory.slice(-5) // 只保留最近5次记录
          };
          return acc;
        }, {} as typeof state.adaptiveDifficulty);
        
        return {
          trainingHistory: filteredHistory.slice(-30), // 最多保留30条
          stats: cleanedStats,
          adaptiveDifficulty: cleanedAdaptiveDifficulty
        };
      });
    },

    // 安全的存储更新方法
    safeStorageUpdate: (newState: Partial<TrainingStore>) => {
      try {
        set(newState);
      } catch (error) {
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          // 如果存储失败，尝试清理更多数据
          const state = get();
          state.handleStorageQuotaExceeded();
          // 再次尝试保存
          try {
            set(newState);
          } catch (secondError) {
            console.error('存储失败，即使清理数据后仍然无法保存:', secondError);
            // 显示用户友好的错误提示
            state.showStorageError();
          }
        } else {
          throw error;
        }
      }
    },

    // 处理存储配额超出错误
    handleStorageQuotaExceeded: () => {
      set((state) => {
        console.warn('存储空间不足，正在清理数据...');
        
        // 激进的数据清理
        const cleanedState = {
          trainingHistory: state.trainingHistory.slice(-10), // 只保留最近10条记录
          stats: {
            daily: state.stats.daily.slice(-7), // 只保留最近7天
            weekly: state.stats.weekly.slice(-4), // 只保留最近4周
            monthly: state.stats.monthly.slice(-3) // 只保留最近3个月
          },
          adaptiveDifficulty: Object.keys(state.adaptiveDifficulty).reduce((acc, key) => {
            const difficulty = state.adaptiveDifficulty[key as TrainingType];
            acc[key as TrainingType] = {
              ...difficulty,
              performanceHistory: difficulty.performanceHistory.slice(-3) // 只保留最近3次记录
            };
            return acc;
          }, {} as typeof state.adaptiveDifficulty)
        };
        
        return cleanedState;
      });
    },

    // 显示存储错误提示
    showStorageError: () => {
      // 这里可以集成到UI通知系统
      console.error('存储空间不足，部分训练数据可能无法保存。建议清理浏览器数据或联系技术支持。');
      // 可以在这里添加toast通知或模态框
    },

    // 获取存储使用情况
    getStorageUsage: () => {
      try {
        const state = get();
        const stateString = JSON.stringify({
          userProgress: state.userProgress,
          trainingHistory: state.trainingHistory,
          adaptiveDifficulty: state.adaptiveDifficulty,
          gamification: state.gamification,
          stats: state.stats,
          settings: state.settings
        });
        
        const currentSize = new Blob([stateString]).size;
        const maxSize = 5 * 1024 * 1024; // 5MB
        const usagePercentage = (currentSize / maxSize) * 100;
        
        return {
          currentSize,
          maxSize,
          usagePercentage: Math.round(usagePercentage * 100) / 100,
          isNearLimit: usagePercentage > 80,
          trainingHistoryCount: state.trainingHistory.length,
          dailyStatsCount: state.stats.daily.length,
          weeklyStatsCount: state.stats.weekly.length,
          monthlyStatsCount: state.stats.monthly.length
        };
      } catch (error) {
        console.error('获取存储使用情况失败:', error);
        return {
          currentSize: 0,
          maxSize: 5 * 1024 * 1024,
          usagePercentage: 0,
          isNearLimit: false,
          trainingHistoryCount: 0,
          dailyStatsCount: 0,
          weeklyStatsCount: 0,
          monthlyStatsCount: 0
        };
      }
    },

    // 手动清理存储数据
    manualCleanup: () => {
      const state = get();
      
      // 清理训练历史，只保留最近20条
      const cleanedHistory = state.trainingHistory.slice(-20);
      
      // 清理统计数据
      const cleanedStats = {
        daily: state.stats.daily.slice(-10), // 只保留最近10天
        weekly: state.stats.weekly.slice(-6), // 只保留最近6周
        monthly: state.stats.monthly.slice(-4) // 只保留最近4个月
      };
      
      // 清理自适应难度历史
      const cleanedAdaptiveDifficulty = Object.keys(state.adaptiveDifficulty).reduce((acc, key) => {
        const difficulty = state.adaptiveDifficulty[key as TrainingType];
        acc[key as TrainingType] = {
          ...difficulty,
          performanceHistory: difficulty.performanceHistory.slice(-3) // 只保留最近3次记录
        };
        return acc;
      }, {} as typeof state.adaptiveDifficulty);
      
      set({
        trainingHistory: cleanedHistory,
        stats: cleanedStats,
        adaptiveDifficulty: cleanedAdaptiveDifficulty
      });
      
      console.log('手动清理完成，存储空间已释放');
      return state.getStorageUsage();
    }
  }),
  {
    name: 'brain-train-storage',
    partialize: (state: TrainingStore): Partial<TrainingStore> => ({
      userProgress: state.userProgress,
      trainingHistory: state.trainingHistory,
      adaptiveDifficulty: state.adaptiveDifficulty,
      gamification: state.gamification,
      stats: state.stats,
      settings: state.settings
    }),
    // 添加存储错误处理和存储监控
    onRehydrateStorage: () => (state, error) => {
      if (error) {
        console.warn('训练数据恢复失败，使用默认设置:', error);
        // 可以在这里添加用户通知逻辑
      }
      
      // 检查存储使用情况
      if (state) {
        const storageSize = JSON.stringify(state).length;
        const maxSize = 5 * 1024 * 1024; // 5MB限制
        
        if (storageSize > maxSize * 0.8) {
          console.warn('存储使用量接近限制，建议清理数据');
          // 自动清理旧数据
          if (state.cleanupOldData) {
            state.cleanupOldData();
          }
        }
      }
    }
  }
));