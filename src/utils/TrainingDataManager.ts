export interface TrainingResult {
  id: string;
  userId: string;
  type: 'schulte' | 'nback' | 'gaze';
  score: number;
  duration: number; // 训练时长（秒）
  accuracy: number; // 准确率（0-1）
  level: number; // 训练难度等级
  timestamp: number;
  details?: {
    gridSize?: number; // Schulte表格大小
    nLevel?: number; // N-back的N值
    gazePoints?: number; // 凝视点数量
    mistakes?: number; // 错误次数
    avgReactionTime?: number; // 平均反应时间
  };
}

export interface UserStats {
  totalTrainings: number;
  totalTime: number; // 总训练时间（秒）
  bestScore: number;
  streakDays: number;
  lastTrainingDate: string;
  trainingsByType: {
    schulte: number;
    nback: number;
    gaze: number;
  };
  averageScores: {
    schulte: number;
    nback: number;
    gaze: number;
  };
  progressData: {
    dates: string[];
    scores: number[];
    durations: number[];
  };
}

export class TrainingDataManager {
  private static instance: TrainingDataManager;
  private readonly STORAGE_KEY = 'brain_train_data';
  private readonly STATS_KEY = 'brain_train_stats';

  private constructor() {}

  static getInstance(): TrainingDataManager {
    if (!TrainingDataManager.instance) {
      TrainingDataManager.instance = new TrainingDataManager();
    }
    return TrainingDataManager.instance;
  }

  /**
   * 保存训练结果
   */
  saveTrainingResult(result: Omit<TrainingResult, 'id' | 'timestamp'>): TrainingResult {
    const trainingResult: TrainingResult = {
      ...result,
      id: this.generateId(),
      timestamp: Date.now()
    };

    const existingData = this.getAllTrainingResults();
    existingData.push(trainingResult);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
    this.updateUserStats(trainingResult);
    
    return trainingResult;
  }

  /**
   * 获取所有训练结果
   */
  getAllTrainingResults(): TrainingResult[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading training data:', error);
      return [];
    }
  }

  /**
   * 获取用户的训练结果
   */
  getUserTrainingResults(userId: string): TrainingResult[] {
    return this.getAllTrainingResults().filter(result => result.userId === userId);
  }

  /**
   * 获取特定类型的训练结果
   */
  getTrainingResultsByType(userId: string, type: TrainingResult['type']): TrainingResult[] {
    return this.getUserTrainingResults(userId).filter(result => result.type === type);
  }

  /**
   * 获取最近的训练结果
   */
  getRecentTrainingResults(userId: string, limit: number = 10): TrainingResult[] {
    return this.getUserTrainingResults(userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * 获取用户统计数据
   */
  getUserStats(userId: string): UserStats {
    try {
      const statsData = localStorage.getItem(`${this.STATS_KEY}_${userId}`);
      if (statsData) {
        return JSON.parse(statsData);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }

    // 如果没有缓存的统计数据，重新计算
    return this.calculateUserStats(userId);
  }

  /**
   * 计算用户统计数据
   */
  private calculateUserStats(userId: string): UserStats {
    const userResults = this.getUserTrainingResults(userId);
    
    if (userResults.length === 0) {
      return {
        totalTrainings: 0,
        totalTime: 0,
        bestScore: 0,
        streakDays: 0,
        lastTrainingDate: '',
        trainingsByType: { schulte: 0, nback: 0, gaze: 0 },
        averageScores: { schulte: 0, nback: 0, gaze: 0 },
        progressData: { dates: [], scores: [], durations: [] }
      };
    }

    const totalTrainings = userResults.length;
    const totalTime = userResults.reduce((sum, result) => sum + result.duration, 0);
    const bestScore = Math.max(...userResults.map(result => result.score));
    
    // 计算连续训练天数
    const streakDays = this.calculateStreakDays(userResults);
    
    // 按类型统计
    const trainingsByType = {
      schulte: userResults.filter(r => r.type === 'schulte').length,
      nback: userResults.filter(r => r.type === 'nback').length,
      gaze: userResults.filter(r => r.type === 'gaze').length
    };

    // 计算平均分数
    const averageScores = {
      schulte: this.calculateAverageScore(userResults, 'schulte'),
      nback: this.calculateAverageScore(userResults, 'nback'),
      gaze: this.calculateAverageScore(userResults, 'gaze')
    };

    // 生成进度数据（最近30天）
    const progressData = this.generateProgressData(userResults);

    const stats: UserStats = {
      totalTrainings,
      totalTime,
      bestScore,
      streakDays,
      lastTrainingDate: new Date(Math.max(...userResults.map(r => r.timestamp))).toISOString().split('T')[0],
      trainingsByType,
      averageScores,
      progressData
    };

    // 缓存统计数据
    localStorage.setItem(`${this.STATS_KEY}_${userId}`, JSON.stringify(stats));
    
    return stats;
  }

  /**
   * 更新用户统计数据
   */
  private updateUserStats(newResult: TrainingResult): void {
    // 重新计算并缓存统计数据
    this.calculateUserStats(newResult.userId);
  }

  /**
   * 计算连续训练天数
   */
  private calculateStreakDays(results: TrainingResult[]): number {
    if (results.length === 0) return 0;

    const sortedResults = results.sort((a, b) => b.timestamp - a.timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streakDays = 0;
    let currentDate = new Date(today);
    
    for (const result of sortedResults) {
      const resultDate = new Date(result.timestamp);
      resultDate.setHours(0, 0, 0, 0);
      
      if (resultDate.getTime() === currentDate.getTime()) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (resultDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    return streakDays;
  }

  /**
   * 计算特定类型的平均分数
   */
  private calculateAverageScore(results: TrainingResult[], type: TrainingResult['type']): number {
    const typeResults = results.filter(r => r.type === type);
    if (typeResults.length === 0) return 0;
    
    const totalScore = typeResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / typeResults.length);
  }

  /**
   * 生成进度数据（最近30天）
   */
  private generateProgressData(results: TrainingResult[]): UserStats['progressData'] {
    const days = 30;
    const today = new Date();
    const dates: string[] = [];
    const scores: number[] = [];
    const durations: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);

      const dayResults = results.filter(result => {
        const resultDate = new Date(result.timestamp).toISOString().split('T')[0];
        return resultDate === dateStr;
      });

      if (dayResults.length > 0) {
        const avgScore = dayResults.reduce((sum, r) => sum + r.score, 0) / dayResults.length;
        const totalDuration = dayResults.reduce((sum, r) => sum + r.duration, 0);
        scores.push(Math.round(avgScore));
        durations.push(totalDuration);
      } else {
        scores.push(0);
        durations.push(0);
      }
    }

    return { dates, scores, durations };
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清除用户数据
   */
  clearUserData(userId: string): void {
    const allResults = this.getAllTrainingResults();
    const filteredResults = allResults.filter(result => result.userId !== userId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredResults));
    localStorage.removeItem(`${this.STATS_KEY}_${userId}`);
  }

  /**
   * 导出用户数据
   */
  exportUserData(userId: string): string {
    const userData = {
      results: this.getUserTrainingResults(userId),
      stats: this.getUserStats(userId),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(userData, null, 2);
  }

  /**
   * 导入用户数据
   */
  importUserData(userId: string, data: string): boolean {
    try {
      const userData = JSON.parse(data);
      if (userData.results && Array.isArray(userData.results)) {
        // 清除现有数据
        this.clearUserData(userId);
        
        // 导入新数据
        const allResults = this.getAllTrainingResults();
        const importedResults = userData.results.map((result: any) => ({
          ...result,
          userId, // 确保使用当前用户ID
          id: this.generateId() // 重新生成ID避免冲突
        }));
        
        allResults.push(...importedResults);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allResults));
        
        // 重新计算统计数据
        this.calculateUserStats(userId);
        
        return true;
      }
    } catch (error) {
      console.error('Error importing user data:', error);
    }
    return false;
  }
}

// 导出单例实例
export const trainingDataManager = TrainingDataManager.getInstance();