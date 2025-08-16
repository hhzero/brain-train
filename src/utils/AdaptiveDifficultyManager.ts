/**
 * 自适应难度管理器
 * 基于科学研究实现智能难度调整算法
 */

import { SessionStats, TrainingConfig } from './DualNBackEngine';

// 性能指标
interface PerformanceMetrics {
  accuracy: number;           // 总体准确率
  visualAccuracy: number;     // 视觉准确率
  audioAccuracy: number;      // 听觉准确率
  reactionTime: number;       // 平均反应时间
  consistency: number;        // 表现一致性
  improvement: number;        // 改进趋势
  fatigue: number;           // 疲劳程度
  confidence: number;         // 置信度
}

// 难度调整建议
interface DifficultyAdjustment {
  newNLevel: number;
  confidence: number;
  reason: string;
  recommendations: string[];
}

// 历史性能记录
interface PerformanceHistory {
  timestamp: number;
  nLevel: number;
  metrics: PerformanceMetrics;
  sessionStats: SessionStats;
}

// 用户档案
interface UserProfile {
  totalSessions: number;
  averagePerformance: PerformanceMetrics;
  preferredNLevel: number;
  learningRate: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  strengths: string[];
  weaknesses: string[];
}

class AdaptiveDifficultyManager {
  private performanceHistory: PerformanceHistory[] = [];
  private userProfile: UserProfile;
  private readonly maxHistorySize = 50; // 保留最近50次会话的数据
  
  // 难度调整参数
  private readonly adjustmentThresholds = {
    increase: {
      accuracy: 0.80,      // 准确率超过80%考虑提升难度
      consistency: 0.75,   // 一致性超过75%
      sessions: 3          // 连续3次会话表现良好
    },
    decrease: {
      accuracy: 0.50,      // 准确率低于50%考虑降低难度
      consistency: 0.40,   // 一致性低于40%
      sessions: 2          // 连续2次会话表现不佳
    },
    optimal: {
      accuracy: 0.65,      // 最佳准确率范围
      accuracyRange: 0.15  // ±15%的准确率范围
    }
  };

  constructor() {
    this.userProfile = this.initializeUserProfile();
    this.loadPerformanceHistory();
  }

  /**
   * 初始化用户档案
   */
  private initializeUserProfile(): UserProfile {
    return {
      totalSessions: 0,
      averagePerformance: {
        accuracy: 0,
        visualAccuracy: 0,
        audioAccuracy: 0,
        reactionTime: 0,
        consistency: 0,
        improvement: 0,
        fatigue: 0,
        confidence: 0
      },
      preferredNLevel: 2,
      learningRate: 0.5,
      skillLevel: 'beginner',
      strengths: [],
      weaknesses: []
    };
  }

  /**
   * 加载历史性能数据
   */
  private loadPerformanceHistory(): void {
    try {
      const saved = localStorage.getItem('nback_performance_history');
      if (saved) {
        this.performanceHistory = JSON.parse(saved);
      }
      
      const profile = localStorage.getItem('nback_user_profile');
      if (profile) {
        this.userProfile = { ...this.userProfile, ...JSON.parse(profile) };
      }
    } catch (error) {
      console.error('加载性能历史失败:', error);
    }
  }

  /**
   * 保存性能数据
   */
  private savePerformanceData(): void {
    try {
      localStorage.setItem('nback_performance_history', JSON.stringify(this.performanceHistory));
      localStorage.setItem('nback_user_profile', JSON.stringify(this.userProfile));
    } catch (error) {
      console.error('保存性能数据失败:', error);
    }
  }

  /**
   * 分析会话性能
   */
  analyzeSessionPerformance(sessionStats: SessionStats, config: TrainingConfig): PerformanceMetrics {
    const { accuracy, averageReactionTime, totalTrials } = sessionStats;
    
    // 计算一致性（基于试验间的准确率变化）
    const consistency = this.calculateConsistency(sessionStats);
    
    // 计算改进趋势
    const improvement = this.calculateImprovement(accuracy.combined, config.nLevel);
    
    // 计算疲劳程度（基于反应时间变化）
    const fatigue = this.calculateFatigue(averageReactionTime);
    
    // 计算置信度（基于试验数量和表现稳定性）
    const confidence = this.calculateConfidence(totalTrials, consistency);
    
    return {
      accuracy: accuracy.combined,
      visualAccuracy: accuracy.visual,
      audioAccuracy: accuracy.audio,
      reactionTime: averageReactionTime,
      consistency,
      improvement,
      fatigue,
      confidence
    };
  }

  /**
   * 计算表现一致性
   */
  private calculateConsistency(sessionStats: SessionStats): number {
    // 基于连击数和总试验数计算一致性
    const { maxStreak, totalTrials } = sessionStats;
    const streakRatio = maxStreak / totalTrials;
    
    // 考虑准确率的稳定性
    const accuracyStability = 1 - Math.abs(sessionStats.accuracy.visual - sessionStats.accuracy.audio);
    
    return (streakRatio * 0.6 + accuracyStability * 0.4);
  }

  /**
   * 计算改进趋势
   */
  private calculateImprovement(currentAccuracy: number, currentNLevel: number): number {
    if (this.performanceHistory.length < 2) return 0;
    
    // 获取最近几次相同难度级别的表现
    const recentSessions = this.performanceHistory
      .filter(h => h.nLevel === currentNLevel)
      .slice(-5); // 最近5次
    
    if (recentSessions.length < 2) return 0;
    
    // 计算准确率趋势
    const accuracies = recentSessions.map(s => s.metrics.accuracy);
    const trend = this.calculateTrend(accuracies);
    
    return Math.max(-1, Math.min(1, trend)); // 限制在-1到1之间
  }

  /**
   * 计算数据趋势
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    let trend = 0;
    for (let i = 1; i < values.length; i++) {
      trend += values[i] - values[i - 1];
    }
    
    return trend / (values.length - 1);
  }

  /**
   * 计算疲劳程度
   */
  private calculateFatigue(currentReactionTime: number): number {
    if (this.performanceHistory.length < 3) return 0;
    
    // 获取最近的反应时间数据
    const recentReactionTimes = this.performanceHistory
      .slice(-5)
      .map(h => h.metrics.reactionTime);
    
    const averageReactionTime = recentReactionTimes.reduce((a, b) => a + b, 0) / recentReactionTimes.length;
    
    // 如果当前反应时间明显慢于平均值，表示可能疲劳
    const fatigueIndicator = (currentReactionTime - averageReactionTime) / averageReactionTime;
    
    return Math.max(0, Math.min(1, fatigueIndicator));
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(totalTrials: number, consistency: number): number {
    // 基于试验数量和一致性计算置信度
    const trialConfidence = Math.min(1, totalTrials / 20); // 20个试验为满分
    const consistencyConfidence = consistency;
    
    return (trialConfidence * 0.4 + consistencyConfidence * 0.6);
  }

  /**
   * 记录会话性能
   */
  recordSessionPerformance(sessionStats: SessionStats, config: TrainingConfig): void {
    const metrics = this.analyzeSessionPerformance(sessionStats, config);
    
    const record: PerformanceHistory = {
      timestamp: Date.now(),
      nLevel: config.nLevel,
      metrics,
      sessionStats
    };
    
    this.performanceHistory.push(record);
    
    // 限制历史记录大小
    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory.shift();
    }
    
    // 更新用户档案
    this.updateUserProfile(metrics, config.nLevel);
    
    // 保存数据
    this.savePerformanceData();
  }

  /**
   * 更新用户档案
   */
  private updateUserProfile(metrics: PerformanceMetrics, nLevel: number): void {
    this.userProfile.totalSessions++;
    
    // 更新平均性能（使用指数移动平均）
    const alpha = 0.2; // 学习率
    const avgPerf = this.userProfile.averagePerformance;
    
    avgPerf.accuracy = avgPerf.accuracy * (1 - alpha) + metrics.accuracy * alpha;
    avgPerf.visualAccuracy = avgPerf.visualAccuracy * (1 - alpha) + metrics.visualAccuracy * alpha;
    avgPerf.audioAccuracy = avgPerf.audioAccuracy * (1 - alpha) + metrics.audioAccuracy * alpha;
    avgPerf.reactionTime = avgPerf.reactionTime * (1 - alpha) + metrics.reactionTime * alpha;
    avgPerf.consistency = avgPerf.consistency * (1 - alpha) + metrics.consistency * alpha;
    
    // 更新技能等级
    this.updateSkillLevel();
    
    // 分析优势和劣势
    this.analyzeStrengthsWeaknesses();
  }

  /**
   * 更新技能等级
   */
  private updateSkillLevel(): void {
    const { averagePerformance, totalSessions } = this.userProfile;
    const avgAccuracy = averagePerformance.accuracy;
    
    if (totalSessions < 5) {
      this.userProfile.skillLevel = 'beginner';
    } else if (avgAccuracy < 0.6) {
      this.userProfile.skillLevel = 'beginner';
    } else if (avgAccuracy < 0.75) {
      this.userProfile.skillLevel = 'intermediate';
    } else if (avgAccuracy < 0.85) {
      this.userProfile.skillLevel = 'advanced';
    } else {
      this.userProfile.skillLevel = 'expert';
    }
  }

  /**
   * 分析优势和劣势
   */
  private analyzeStrengthsWeaknesses(): void {
    const { averagePerformance } = this.userProfile;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    // 分析视觉vs听觉表现
    if (averagePerformance.visualAccuracy > averagePerformance.audioAccuracy + 0.1) {
      strengths.push('视觉记忆');
      weaknesses.push('听觉记忆');
    } else if (averagePerformance.audioAccuracy > averagePerformance.visualAccuracy + 0.1) {
      strengths.push('听觉记忆');
      weaknesses.push('视觉记忆');
    }
    
    // 分析反应速度
    if (averagePerformance.reactionTime < 1000) {
      strengths.push('快速反应');
    } else if (averagePerformance.reactionTime > 2000) {
      weaknesses.push('反应速度');
    }
    
    // 分析一致性
    if (averagePerformance.consistency > 0.8) {
      strengths.push('稳定表现');
    } else if (averagePerformance.consistency < 0.6) {
      weaknesses.push('表现稳定性');
    }
    
    this.userProfile.strengths = strengths;
    this.userProfile.weaknesses = weaknesses;
  }

  /**
   * 获取难度调整建议
   */
  getDifficultyAdjustment(currentConfig: TrainingConfig): DifficultyAdjustment {
    if (this.performanceHistory.length < 2) {
      return {
        newNLevel: currentConfig.nLevel,
        confidence: 0.1,
        reason: '数据不足，保持当前难度',
        recommendations: ['继续训练以收集更多数据']
      };
    }
    
    const recentPerformance = this.getRecentPerformance(currentConfig.nLevel);
    const adjustment = this.calculateOptimalNLevel(currentConfig.nLevel, recentPerformance);
    
    return adjustment;
  }

  /**
   * 获取最近的性能数据
   */
  private getRecentPerformance(nLevel: number): PerformanceMetrics[] {
    return this.performanceHistory
      .filter(h => h.nLevel === nLevel)
      .slice(-5) // 最近5次相同难度的会话
      .map(h => h.metrics);
  }

  /**
   * 计算最佳N级别
   */
  private calculateOptimalNLevel(currentNLevel: number, recentPerformance: PerformanceMetrics[]): DifficultyAdjustment {
    if (recentPerformance.length === 0) {
      return {
        newNLevel: currentNLevel,
        confidence: 0.1,
        reason: '当前难度级别缺乏数据',
        recommendations: ['继续当前难度的训练']
      };
    }
    
    // 计算平均性能指标
    const avgAccuracy = recentPerformance.reduce((sum, p) => sum + p.accuracy, 0) / recentPerformance.length;
    const avgConsistency = recentPerformance.reduce((sum, p) => sum + p.consistency, 0) / recentPerformance.length;
    const avgImprovement = recentPerformance.reduce((sum, p) => sum + p.improvement, 0) / recentPerformance.length;
    const avgConfidence = recentPerformance.reduce((sum, p) => sum + p.confidence, 0) / recentPerformance.length;
    
    const { adjustmentThresholds } = this;
    const recommendations: string[] = [];
    
    // 判断是否应该提升难度
    if (avgAccuracy >= adjustmentThresholds.increase.accuracy &&
        avgConsistency >= adjustmentThresholds.increase.consistency &&
        recentPerformance.length >= adjustmentThresholds.increase.sessions &&
        currentNLevel < 4) {
      
      recommendations.push('表现优秀，可以挑战更高难度');
      recommendations.push('保持专注，继续提升');
      
      return {
        newNLevel: currentNLevel + 1,
        confidence: avgConfidence,
        reason: `准确率${(avgAccuracy * 100).toFixed(1)}%，一致性${(avgConsistency * 100).toFixed(1)}%，建议提升难度`,
        recommendations
      };
    }
    
    // 判断是否应该降低难度
    if (avgAccuracy <= adjustmentThresholds.decrease.accuracy &&
        avgConsistency <= adjustmentThresholds.decrease.consistency &&
        recentPerformance.length >= adjustmentThresholds.decrease.sessions &&
        currentNLevel > 1) {
      
      recommendations.push('当前难度较高，建议降低难度');
      recommendations.push('专注于提高准确率和稳定性');
      
      return {
        newNLevel: currentNLevel - 1,
        confidence: avgConfidence,
        reason: `准确率${(avgAccuracy * 100).toFixed(1)}%，表现不稳定，建议降低难度`,
        recommendations
      };
    }
    
    // 保持当前难度
    const optimalRange = adjustmentThresholds.optimal;
    const isInOptimalRange = Math.abs(avgAccuracy - optimalRange.accuracy) <= optimalRange.accuracyRange;
    
    if (isInOptimalRange) {
      recommendations.push('当前难度适合，继续训练');
      recommendations.push('专注于提高一致性和反应速度');
    } else if (avgAccuracy < optimalRange.accuracy) {
      recommendations.push('继续练习以提高准确率');
      recommendations.push('注意保持专注和放松');
    } else {
      recommendations.push('表现良好，可以考虑增加训练强度');
    }
    
    return {
      newNLevel: currentNLevel,
      confidence: avgConfidence,
      reason: `当前难度合适，准确率${(avgAccuracy * 100).toFixed(1)}%`,
      recommendations
    };
  }

  /**
   * 获取个性化训练建议
   */
  getPersonalizedRecommendations(): string[] {
    const recommendations: string[] = [];
    const { skillLevel, strengths, weaknesses, averagePerformance } = this.userProfile;
    
    // 基于技能等级的建议
    switch (skillLevel) {
      case 'beginner':
        recommendations.push('建议从较低的N级别开始，专注于理解游戏规则');
        recommendations.push('每次训练15-20分钟，避免疲劳');
        break;
      case 'intermediate':
        recommendations.push('可以尝试不同的训练模式，提升综合能力');
        recommendations.push('注意保持训练的规律性');
        break;
      case 'advanced':
        recommendations.push('挑战更高的N级别，追求更高的准确率');
        recommendations.push('可以增加训练强度和时长');
        break;
      case 'expert':
        recommendations.push('保持训练强度，专注于细微的改进');
        recommendations.push('可以尝试教导他人或分享经验');
        break;
    }
    
    // 基于劣势的针对性建议
    if (weaknesses.includes('听觉记忆')) {
      recommendations.push('建议增加纯听觉训练，提升听觉工作记忆');
    }
    if (weaknesses.includes('视觉记忆')) {
      recommendations.push('建议增加纯视觉训练，提升空间工作记忆');
    }
    if (weaknesses.includes('反应速度')) {
      recommendations.push('练习时保持放松，避免过度紧张影响反应速度');
    }
    if (weaknesses.includes('表现稳定性')) {
      recommendations.push('注意保持专注，避免分心，建立稳定的训练节奏');
    }
    
    return recommendations;
  }

  /**
   * 获取用户档案
   */
  getUserProfile(): UserProfile {
    return { ...this.userProfile };
  }

  /**
   * 获取性能历史
   */
  getPerformanceHistory(): PerformanceHistory[] {
    return [...this.performanceHistory];
  }

  /**
   * 重置用户数据
   */
  resetUserData(): void {
    this.performanceHistory = [];
    this.userProfile = this.initializeUserProfile();
    this.savePerformanceData();
  }
}

export default AdaptiveDifficultyManager;
export type {
  PerformanceMetrics,
  DifficultyAdjustment,
  PerformanceHistory,
  UserProfile
};