import { useState, useEffect, useCallback } from 'react';
import { trainingDataManager, TrainingResult, UserStats } from '../utils/TrainingDataManager';
import { useAuth } from './useAuth';
import { useTranslations } from 'next-intl';

export interface UseTrainingDataReturn {
  // 数据状态
  userStats: UserStats | null;
  recentTrainings: TrainingResult[];
  loading: boolean;
  error: string | null;
  
  // 操作方法
  saveTraining: (training: Omit<TrainingResult, 'id' | 'timestamp' | 'userId'>) => Promise<TrainingResult | null>;
  getTrainingsByType: (type: TrainingResult['type']) => TrainingResult[];
  refreshData: () => void;
  exportData: () => string | null;
  importData: (data: string) => Promise<boolean>;
  clearData: () => Promise<void>;
}

export const useTrainingData = (): UseTrainingDataReturn => {
  const { user } = useAuth();
  const t = useTranslations();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentTrainings, setRecentTrainings] = useState<TrainingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载用户数据
  const loadUserData = useCallback(async () => {
    if (!user) {
      setUserStats(null);
      setRecentTrainings([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 获取用户统计数据
      const stats = trainingDataManager.getUserStats(user.id);
      setUserStats(stats);

      // 获取最近的训练记录
      const recent = trainingDataManager.getRecentTrainingResults(user.id, 10);
      setRecentTrainings(recent);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trainingData.errors.loadFailed'));
      console.error('Error loading training data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 保存训练结果
  const saveTraining = useCallback(async (
    training: Omit<TrainingResult, 'id' | 'timestamp' | 'userId'>
  ): Promise<TrainingResult | null> => {
    if (!user) {
      setError(t('trainingData.errors.notLoggedIn'));
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = trainingDataManager.saveTrainingResult({
        ...training,
        userId: user.id
      });

      // 重新加载数据以更新统计信息
      await loadUserData();
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trainingData.errors.saveFailed'));
      console.error('Error saving training result:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, loadUserData]);

  // 按类型获取训练记录
  const getTrainingsByType = useCallback((type: TrainingResult['type']): TrainingResult[] => {
    if (!user) return [];
    return trainingDataManager.getTrainingResultsByType(user.id, type);
  }, [user]);

  // 刷新数据
  const refreshData = useCallback(() => {
    loadUserData();
  }, [loadUserData]);

  // 导出数据
  const exportData = useCallback((): string | null => {
    if (!user) {
      setError(t('trainingData.errors.notLoggedIn'));
      return null;
    }

    try {
      return trainingDataManager.exportUserData(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trainingData.errors.exportFailed'));
      console.error('Error exporting data:', err);
      return null;
    }
  }, [user, t]);

  // 导入数据
  const importData = useCallback(async (data: string): Promise<boolean> => {
    if (!user) {
      setError(t('trainingData.errors.notLoggedIn'));
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const success = trainingDataManager.importUserData(user.id, data);
      if (success) {
        await loadUserData();
        return true;
      } else {
        setError(t('trainingData.errors.invalidFormat'));
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trainingData.errors.importFailed'));
      console.error('Error importing data:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, loadUserData, t]);

  // 清除数据
  const clearData = useCallback(async (): Promise<void> => {
    if (!user) {
      setError(t('trainingData.errors.notLoggedIn'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      trainingDataManager.clearUserData(user.id);
      await loadUserData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trainingData.errors.clearFailed'));
      console.error('Error clearing data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, loadUserData, t]);

  // 当用户状态变化时重新加载数据
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    userStats,
    recentTrainings,
    loading,
    error,
    saveTraining,
    getTrainingsByType,
    refreshData,
    exportData,
    importData,
    clearData
  };
};

// 用于格式化训练时间的工具函数
export const formatTrainingTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`;
  }
};

// 用于格式化分数的工具函数
export const formatScore = (score: number): string => {
  return score.toLocaleString();
};

// 用于获取训练类型显示名称的工具函数
export const getTrainingTypeName = (type: TrainingResult['type'], locale: string = 'zh'): string => {
  const names = {
    zh: {
      schulte: 'Schulte表格',
      nback: 'N-back训练',
      gaze: '凝视训练'
    },
    en: {
      schulte: 'Schulte Grid',
      nback: 'N-back Training',
      gaze: 'Gaze Training'
    }
  };
  
  return names[locale as keyof typeof names]?.[type] || type;
};