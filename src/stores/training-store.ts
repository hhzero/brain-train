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

      const completedSession: TrainingSession = {
        ...state.currentSession,
        endTime: new Date(),
        status: 'completed',
        results: result
      };

      // 更新训练历史（限制最大数量，防止存储配额超出）
      const maxHistorySize = 100; // 最多保留100条历史记录
      const newHistory = [...state.trainingHistory, result].slice(-maxHistorySize);
      
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

      set({
        currentSession: null,
        trainingHistory: newHistory
      });
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
    }
  }),
  {
    name: 'brain-train-storage',
    partialize: (state) => ({
      userProgress: state.userProgress,
      trainingHistory: state.trainingHistory,
      adaptiveDifficulty: state.adaptiveDifficulty,
      gamification: state.gamification,
      stats: state.stats,
      settings: state.settings
    }),
    // 添加存储错误处理
    onRehydrateStorage: () => (state, error) => {
      if (error) {
        console.warn('训练数据恢复失败，使用默认设置:', error);
        // 可以在这里添加用户通知逻辑
      }
    },
    // 自定义存储方法，添加配额检查
    storage: {
      getItem: (name) => {
        try {
          return localStorage.getItem(name);
        } catch (error) {
          console.warn('读取存储数据失败:', error);
          return null;
        }
      },
      setItem: (name, value) => {
        try {
          // 检查存储大小，如果超过限制则清理旧数据
          const currentSize = new Blob([value]).size;
          const maxSize = 5 * 1024 * 1024; // 5MB限制
          
          if (currentSize > maxSize) {
            console.warn('存储数据过大，正在清理历史记录...');
            // 解析当前数据并清理
            const data = JSON.parse(value);
            if (data.state?.trainingHistory) {
              data.state.trainingHistory = data.state.trainingHistory.slice(-50); // 只保留最近50条
            }
            if (data.state?.stats?.daily) {
              data.state.stats.daily = data.state.stats.daily.slice(-15); // 只保留最近15天
            }
            value = JSON.stringify(data);
          }
          
          localStorage.setItem(name, value);
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            console.warn('存储配额已满，正在清理数据...');
            try {
              // 尝试清理其他存储项
              const keys = Object.keys(localStorage);
              keys.forEach(key => {
                if (key !== name && key.startsWith('brain-train')) {
                  localStorage.removeItem(key);
                }
              });
              
              // 再次尝试存储简化的数据
              const data = JSON.parse(value);
              const essentialData = {
                state: {
                  userProgress: data.state?.userProgress || {},
                  settings: data.state?.settings || {},
                  // 只保留最基本的数据
                  trainingHistory: (data.state?.trainingHistory || []).slice(-20),
                  stats: {
                    daily: (data.state?.stats?.daily || []).slice(-7)
                  }
                },
                version: data.version
              };
              localStorage.setItem(name, JSON.stringify(essentialData));
            } catch (fallbackError) {
              console.error('存储失败，数据将不会被保存:', fallbackError);
              // 可以在这里添加用户通知逻辑
            }
          } else {
            console.error('存储数据时发生错误:', error);
          }
        }
      },
      removeItem: (name) => {
        try {
          localStorage.removeItem(name);
        } catch (error) {
          console.warn('删除存储数据失败:', error);
        }
      }
    }
  }
));