/**
 * 训练会话管理钩子
 * 处理训练过程中的状态管理、数据记录和成就检查
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { TrainingSession } from '@/lib/storage';
import { useTrainingSessions, useUserStatistics } from './useLocalStorage';

// 训练状态枚举
export enum TrainingState {
  IDLE = 'idle',
  PREPARING = 'preparing',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// 训练配置接口
export interface TrainingConfig {
  trainingType: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration?: number; // 训练时长（秒）
  targetCount?: number; // 目标数量
  settings?: Record<string, any>; // 自定义设置
}

// 训练结果接口
export interface TrainingResult {
  score: number;
  accuracy: number;
  reactionTime: number;
  correctAnswers: number;
  totalQuestions: number;
  streakCount: number;
  bonusPoints: number;
  details?: Record<string, any>;
}

// 实时统计接口
export interface LiveStats {
  currentScore: number;
  currentAccuracy: number;
  averageReactionTime: number;
  correctCount: number;
  totalCount: number;
  currentStreak: number;
  bestStreak: number;
  timeElapsed: number;
  timeRemaining?: number;
}

/**
 * 训练会话钩子
 */
export function useTrainingSession() {
  // 基础状态
  const [state, setState] = useState<TrainingState>(TrainingState.IDLE);
  const [config, setConfig] = useState<TrainingConfig | null>(null);
  const [liveStats, setLiveStats] = useState<LiveStats>({
    currentScore: 0,
    currentAccuracy: 0,
    averageReactionTime: 0,
    correctCount: 0,
    totalCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    timeElapsed: 0
  });

  // 会话数据
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);

  // 计时器引用
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseStartRef = useRef<Date | null>(null);

  // 数据管理钩子
  const { addSession } = useTrainingSessions();

  const { refreshStatistics } = useUserStatistics();

  // 生成会话ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 开始训练
  const startTraining = useCallback((trainingConfig: TrainingConfig) => {
    const newSessionId = generateSessionId();
    const now = new Date();

    setSessionId(newSessionId);
    setConfig(trainingConfig);
    setStartTime(now);
    setEndTime(null);
    setState(TrainingState.PREPARING);
    setIsPaused(false);
    setPausedTime(0);
    
    // 重置实时统计
    setLiveStats({
      currentScore: 0,
      currentAccuracy: 0,
      averageReactionTime: 0,
      correctCount: 0,
      totalCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      timeElapsed: 0,
      timeRemaining: trainingConfig.duration
    });

    // 启动计时器
    if (trainingConfig.duration) {
      timerRef.current = setInterval(() => {
        setLiveStats(prev => {
          const newTimeElapsed = prev.timeElapsed + 1;
          const newTimeRemaining = Math.max(0, (trainingConfig.duration || 0) - newTimeElapsed);
          
          // 时间到了自动结束
          if (newTimeRemaining === 0) {
            finishTraining();
          }
          
          return {
            ...prev,
            timeElapsed: newTimeElapsed,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000);
    }

    return newSessionId;
  }, []);

  // 激活训练（从准备状态到活跃状态）
  const activateTraining = useCallback(() => {
    if (state === TrainingState.PREPARING) {
      setState(TrainingState.ACTIVE);
    }
  }, [state]);

  // 暂停训练
  const pauseTraining = useCallback(() => {
    if (state === TrainingState.ACTIVE) {
      setState(TrainingState.PAUSED);
      setIsPaused(true);
      pauseStartRef.current = new Date();
      
      // 暂停计时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [state]);

  // 恢复训练
  const resumeTraining = useCallback(() => {
    if (state === TrainingState.PAUSED && config) {
      setState(TrainingState.ACTIVE);
      setIsPaused(false);
      
      // 计算暂停时间
      if (pauseStartRef.current) {
        const pauseDuration = Date.now() - pauseStartRef.current.getTime();
        setPausedTime(prev => prev + pauseDuration);
        pauseStartRef.current = null;
      }
      
      // 恢复计时器
      if (config.duration) {
        timerRef.current = setInterval(() => {
          setLiveStats(prev => {
            const newTimeElapsed = prev.timeElapsed + 1;
            const newTimeRemaining = Math.max(0, (config.duration || 0) - newTimeElapsed);
            
            if (newTimeRemaining === 0) {
              finishTraining();
            }
            
            return {
              ...prev,
              timeElapsed: newTimeElapsed,
              timeRemaining: newTimeRemaining
            };
          });
        }, 1000);
      }
    }
  }, [state, config]);

  // 记录答案
  const recordAnswer = useCallback((isCorrect: boolean, reactionTime: number, details?: Record<string, any>) => {
    if (state !== TrainingState.ACTIVE) return;

    setLiveStats(prev => {
      const newTotalCount = prev.totalCount + 1;
      const newCorrectCount = prev.correctCount + (isCorrect ? 1 : 0);
      const newAccuracy = (newCorrectCount / newTotalCount) * 100;
      
      // 更新连击数
      const newCurrentStreak = isCorrect ? prev.currentStreak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newCurrentStreak);
      
      // 计算平均反应时间
      const totalReactionTime = (prev.averageReactionTime * prev.totalCount) + reactionTime;
      const newAverageReactionTime = totalReactionTime / newTotalCount;
      
      // 计算分数（基础分数 + 连击奖励 + 速度奖励）
      let scoreIncrement = isCorrect ? 10 : 0;
      if (isCorrect) {
        // 连击奖励
        scoreIncrement += Math.min(newCurrentStreak * 2, 50);
        
        // 速度奖励（反应时间越快奖励越高）
        if (reactionTime < 1000) {
          scoreIncrement += Math.round((1000 - reactionTime) / 100);
        }
      }
      
      return {
        ...prev,
        totalCount: newTotalCount,
        correctCount: newCorrectCount,
        currentAccuracy: newAccuracy,
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        averageReactionTime: newAverageReactionTime,
        currentScore: prev.currentScore + scoreIncrement
      };
    });
  }, [state]);

  // 完成训练
  const finishTraining = useCallback(() => {
    if (!config || !startTime || !sessionId) return;

    const now = new Date();
    setEndTime(now);
    setState(TrainingState.COMPLETED);
    
    // 清除计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 计算实际训练时长（排除暂停时间）
    const totalDuration = now.getTime() - startTime.getTime() - pausedTime;
    
    // 创建训练会话记录
    const session: TrainingSession = {
      id: sessionId,
      userId: 'current_user', // 在实际应用中应该从用户上下文获取
      trainingType: config.trainingType,
      trainingName: config.trainingType, // 添加训练名称
      difficulty: config.difficulty,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      duration: Math.round(totalDuration / 1000), // 转换为秒
      score: liveStats.currentScore,
      accuracy: liveStats.currentAccuracy,
      reactionTime: liveStats.averageReactionTime,
      completed: true,
      statistics: {
        correctAnswers: liveStats.correctCount,
        totalQuestions: liveStats.totalCount,
        averageReactionTime: liveStats.averageReactionTime,
        bestReactionTime: liveStats.averageReactionTime, // 简化处理
        worstReactionTime: liveStats.averageReactionTime, // 简化处理
        streakCount: liveStats.bestStreak,
        mistakeCount: liveStats.totalCount - liveStats.correctCount
      }
    };

    // 保存会话数据
    addSession(session);
    
    // 检查成就
    
    
    // 刷新统计数据
    refreshStatistics();

    return session;
  }, [config, startTime, sessionId, pausedTime, liveStats, addSession, refreshStatistics]);

  // 放弃训练
  const abandonTraining = useCallback(() => {
    setState(TrainingState.FAILED);
    
    // 清除计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 如果有足够的数据，仍然保存会话（标记为未完成）
    if (config && startTime && sessionId && liveStats.totalCount > 0) {
      const now = new Date();
      const totalDuration = now.getTime() - startTime.getTime() - pausedTime;
      
      const session: TrainingSession = {
        id: sessionId,
        userId: 'current_user',
        trainingType: config.trainingType,
        trainingName: config.trainingType,
        difficulty: config.difficulty,
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
        duration: Math.round(totalDuration / 1000),
        score: liveStats.currentScore,
        accuracy: liveStats.currentAccuracy,
        reactionTime: liveStats.averageReactionTime,
        completed: false, // 标记为未完成
        statistics: {
          correctAnswers: liveStats.correctCount,
          totalQuestions: liveStats.totalCount,
          averageReactionTime: liveStats.averageReactionTime,
          bestReactionTime: liveStats.averageReactionTime,
          worstReactionTime: liveStats.averageReactionTime,
          streakCount: liveStats.bestStreak,
          mistakeCount: liveStats.totalCount - liveStats.correctCount
        }
      };

      addSession(session);
    }
  }, [config, startTime, sessionId, pausedTime, liveStats, addSession]);

  // 重置会话
  const resetSession = useCallback(() => {
    setState(TrainingState.IDLE);
    setConfig(null);
    setSessionId(null);
    setStartTime(null);
    setEndTime(null);
    setIsPaused(false);
    setPausedTime(0);
    
    // 清除计时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 重置统计
    setLiveStats({
      currentScore: 0,
      currentAccuracy: 0,
      averageReactionTime: 0,
      correctCount: 0,
      totalCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      timeElapsed: 0
    });
  }, []);

  // 获取训练结果
  const getTrainingResult = useCallback((): TrainingResult | null => {
    if (state !== TrainingState.COMPLETED) return null;
    
    return {
      score: liveStats.currentScore,
      accuracy: liveStats.currentAccuracy,
      reactionTime: liveStats.averageReactionTime,
      correctAnswers: liveStats.correctCount,
      totalQuestions: liveStats.totalCount,
      streakCount: liveStats.bestStreak,
      bonusPoints: 0
    };
  }, [state, liveStats]);

  // 检查是否可以开始训练
  const canStart = state === TrainingState.IDLE;
  const canPause = state === TrainingState.ACTIVE;
  const canResume = state === TrainingState.PAUSED;
  const canFinish = state === TrainingState.ACTIVE || state === TrainingState.PAUSED;
  const canAbandon = state === TrainingState.ACTIVE || state === TrainingState.PAUSED;
  const isActive = state === TrainingState.ACTIVE;
  const isCompleted = state === TrainingState.COMPLETED;
  const isFailed = state === TrainingState.FAILED;

  // 清理副作用
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    // 状态
    state,
    config,
    liveStats,
    sessionId,
    startTime,
    endTime,
    isPaused,
    
    // 操作
    startTraining,
    activateTraining,
    pauseTraining,
    resumeTraining,
    recordAnswer,
    finishTraining,
    abandonTraining,
    resetSession,
    
    // 结果
    getTrainingResult,
    
    // 状态检查
    canStart,
    canPause,
    canResume,
    canFinish,
    canAbandon,
    isActive,
    isCompleted,
    isFailed
  };
}

/**
 * 训练计时器钩子
 * 提供独立的计时功能
 */
export function useTrainingTimer(duration?: number) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          if (duration && newTime >= duration) {
            setIsRunning(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
          return newTime;
        });
      }, 1000);
    }
  }, [isRunning, duration]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeElapsed(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const timeRemaining = duration ? Math.max(0, duration - timeElapsed) : undefined;
  const isFinished = duration ? timeElapsed >= duration : false;

  // 清理副作用
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    timeElapsed,
    timeRemaining,
    isRunning,
    isFinished,
    start,
    pause,
    reset
  };
}

/**
 * 反应时间测量钩子
 */
export function useReactionTime() {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const startMeasurement = useCallback(() => {
    setStartTime(Date.now());
  }, []);

  const recordReaction = useCallback(() => {
    if (startTime) {
      const reactionTime = Date.now() - startTime;
      setReactionTimes(prev => [...prev, reactionTime]);
      setStartTime(null);
      return reactionTime;
    }
    return 0;
  }, [startTime]);

  const reset = useCallback(() => {
    setStartTime(null);
    setReactionTimes([]);
  }, []);

  const averageReactionTime = reactionTimes.length > 0 
    ? reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length
    : 0;

  const bestReactionTime = reactionTimes.length > 0 
    ? Math.min(...reactionTimes)
    : 0;

  return {
    startMeasurement,
    recordReaction,
    reset,
    reactionTimes,
    averageReactionTime,
    bestReactionTime,
    isActive: startTime !== null
  };
}