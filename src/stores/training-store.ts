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
      'cognitive-flexibility': createDefaultUserProgress('cognitive-flexibility')
    },
    trainingHistory: [],
    adaptiveDifficulty: {
      gaze: createDefaultAdaptiveDifficulty(),
      schulte: createDefaultAdaptiveDifficulty(),
      'multi-attention': createDefaultAdaptiveDifficulty(),
      'cognitive-flexibility': createDefaultAdaptiveDifficulty()
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

      // 更新训练历史
      const newHistory = [...state.trainingHistory, result];
      
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
            daily: dailyStats.slice(-30) // 保留最近30天
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
            'cognitive-flexibility': createDefaultUserProgress('cognitive-flexibility')
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
          'cognitive-flexibility': createDefaultUserProgress('cognitive-flexibility')
        },
        trainingHistory: [],
        adaptiveDifficulty: {
          gaze: createDefaultAdaptiveDifficulty(),
          schulte: createDefaultAdaptiveDifficulty(),
          'multi-attention': createDefaultAdaptiveDifficulty(),
          'cognitive-flexibility': createDefaultAdaptiveDifficulty()
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
    })
  }
));