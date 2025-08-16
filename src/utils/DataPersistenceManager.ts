/**
 * 数据持久化管理器
 * 负责处理n-back训练系统的所有数据存储和检索功能
 * 包括训练记录、用户成就、统计数据、设置等
 */

// 训练会话数据接口
export interface TrainingSession {
  id: string;
  timestamp: number;
  mode: 'tutorial' | 'visual' | 'audio' | 'dual';
  nLevel: number;
  duration: number; // 训练时长（秒）
  totalTrials: number;
  correctResponses: number;
  accuracy: number;
  averageReactionTime: number;
  score: number;
  achievements: string[]; // 本次训练解锁的成就
}

// 用户统计数据接口
export interface UserStatistics {
  totalSessions: number;
  totalTrainingTime: number; // 总训练时长（秒）
  totalScore: number;
  highestNLevel: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalAchievements: number;
  currentStreak: number; // 连续训练天数
  longestStreak: number;
  lastTrainingDate: number;
}

// 用户成就数据接口
export interface UserAchievement {
  id: string;
  unlockedAt: number;
  progress?: number; // 进度型成就的当前进度
}

// 用户设置接口
export interface UserSettings {
  audioEnabled: boolean;
  musicVolume: number;
  effectVolume: number;
  visualEffects: boolean;
  autoSave: boolean;
  theme: 'starfield' | 'minimal';
  language: string;
}

// 完整的用户数据接口
export interface UserData {
  profile: {
    id: string;
    name: string;
    createdAt: number;
    lastActiveAt: number;
  };
  statistics: UserStatistics;
  achievements: UserAchievement[];
  settings: UserSettings;
  sessions: TrainingSession[];
}

/**
 * 数据持久化管理器类
 * 使用localStorage进行本地数据存储
 */
export class DataPersistenceManager {
  private static instance: DataPersistenceManager;
  private readonly STORAGE_KEY = 'nback_training_data';
  private readonly BACKUP_KEY = 'nback_training_backup';
  private userData: UserData | null = null;

  private constructor() {
    this.loadUserData();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): DataPersistenceManager {
    if (!DataPersistenceManager.instance) {
      DataPersistenceManager.instance = new DataPersistenceManager();
    }
    return DataPersistenceManager.instance;
  }

  /**
   * 初始化用户数据
   */
  private initializeUserData(): UserData {
    const now = Date.now();
    return {
      profile: {
        id: this.generateUserId(),
        name: '训练者',
        createdAt: now,
        lastActiveAt: now
      },
      statistics: {
        totalSessions: 0,
        totalTrainingTime: 0,
        totalScore: 0,
        highestNLevel: 1,
        averageAccuracy: 0,
        bestAccuracy: 0,
        totalAchievements: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastTrainingDate: 0
      },
      achievements: [],
      settings: {
        audioEnabled: true,
        musicVolume: 0.5,
        effectVolume: 0.7,
        visualEffects: true,
        autoSave: true,
        theme: 'starfield',
        language: 'zh'
      },
      sessions: []
    };
  }

  /**
   * 生成唯一用户ID
   */
  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 从本地存储加载用户数据
   */
  private loadUserData(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.userData = JSON.parse(stored);
        // 更新最后活跃时间
        if (this.userData) {
          this.userData.profile.lastActiveAt = Date.now();
        }
      } else {
        this.userData = this.initializeUserData();
        this.saveUserData();
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      this.userData = this.initializeUserData();
    }
  }

  /**
   * 保存用户数据到本地存储
   */
  private saveUserData(): void {
    try {
      if (this.userData) {
        // 创建备份
        const currentData = localStorage.getItem(this.STORAGE_KEY);
        if (currentData) {
          localStorage.setItem(this.BACKUP_KEY, currentData);
        }
        
        // 保存新数据
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.userData));
      }
    } catch (error) {
      console.error('保存用户数据失败:', error);
    }
  }

  /**
   * 获取用户数据
   */
  public getUserData(): UserData | null {
    return this.userData;
  }

  /**
   * 保存训练会话
   */
  public saveTrainingSession(session: Omit<TrainingSession, 'id'>): void {
    if (!this.userData) return;

    const sessionWithId: TrainingSession = {
      ...session,
      id: this.generateSessionId()
    };

    // 添加到会话列表
    this.userData.sessions.unshift(sessionWithId);
    
    // 限制存储的会话数量（最多保留1000个会话）
    if (this.userData.sessions.length > 1000) {
      this.userData.sessions = this.userData.sessions.slice(0, 1000);
    }

    // 更新统计数据
    this.updateStatistics(sessionWithId);
    
    // 保存数据
    this.saveUserData();
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * 更新用户统计数据
   */
  private updateStatistics(session: TrainingSession): void {
    if (!this.userData) return;

    const stats = this.userData.statistics;
    
    // 更新基础统计
    stats.totalSessions++;
    stats.totalTrainingTime += session.duration;
    stats.totalScore += session.score;
    
    // 更新最高N级别
    if (session.nLevel > stats.highestNLevel) {
      stats.highestNLevel = session.nLevel;
    }
    
    // 更新最佳准确率
    if (session.accuracy > stats.bestAccuracy) {
      stats.bestAccuracy = session.accuracy;
    }
    
    // 计算平均准确率
    const allSessions = this.userData.sessions;
    if (allSessions.length > 0) {
      const totalAccuracy = allSessions.reduce((sum, s) => sum + s.accuracy, 0);
      stats.averageAccuracy = totalAccuracy / allSessions.length;
    }
    
    // 更新连续训练天数
    this.updateTrainingStreak(session.timestamp);
  }

  /**
   * 更新连续训练天数
   */
  private updateTrainingStreak(timestamp: number): void {
    if (!this.userData) return;

    const stats = this.userData.statistics;
    const today = new Date(timestamp).toDateString();
    const lastTrainingDay = stats.lastTrainingDate ? new Date(stats.lastTrainingDate).toDateString() : null;
    
    if (lastTrainingDay === today) {
      // 同一天，不更新连续天数
      return;
    }
    
    const yesterday = new Date(timestamp - 24 * 60 * 60 * 1000).toDateString();
    
    if (lastTrainingDay === yesterday) {
      // 连续训练
      stats.currentStreak++;
    } else if (lastTrainingDay !== today) {
      // 中断了连续训练
      stats.currentStreak = 1;
    }
    
    // 更新最长连续天数
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
    
    stats.lastTrainingDate = timestamp;
  }

  /**
   * 解锁成就
   */
  public unlockAchievement(achievementId: string): boolean {
    if (!this.userData) return false;

    // 检查是否已经解锁
    const existing = this.userData.achievements.find(a => a.id === achievementId);
    if (existing) return false;

    // 添加新成就
    this.userData.achievements.push({
      id: achievementId,
      unlockedAt: Date.now()
    });

    // 更新成就统计
    this.userData.statistics.totalAchievements++;
    
    // 保存数据
    this.saveUserData();
    
    return true;
  }

  /**
   * 获取训练历史
   */
  public getTrainingHistory(limit?: number): TrainingSession[] {
    if (!this.userData) return [];
    
    const sessions = this.userData.sessions;
    return limit ? sessions.slice(0, limit) : sessions;
  }

  /**
   * 获取特定时间范围的训练数据
   */
  public getTrainingDataByDateRange(startDate: number, endDate: number): TrainingSession[] {
    if (!this.userData) return [];
    
    return this.userData.sessions.filter(session => 
      session.timestamp >= startDate && session.timestamp <= endDate
    );
  }

  /**
   * 更新用户设置
   */
  public updateSettings(newSettings: Partial<UserSettings>): void {
    if (!this.userData) return;
    
    this.userData.settings = {
      ...this.userData.settings,
      ...newSettings
    };
    
    this.saveUserData();
  }

  /**
   * 导出用户数据
   */
  public exportData(): string {
    if (!this.userData) return '';
    
    return JSON.stringify(this.userData, null, 2);
  }

  /**
   * 导入用户数据
   */
  public importData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData) as UserData;
      
      // 验证数据结构
      if (this.validateUserData(importedData)) {
        this.userData = importedData;
        this.saveUserData();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }

  /**
   * 验证用户数据结构
   */
  private validateUserData(data: any): data is UserData {
    return (
      data &&
      typeof data === 'object' &&
      data.profile &&
      data.statistics &&
      data.achievements &&
      data.settings &&
      Array.isArray(data.sessions)
    );
  }

  /**
   * 清除所有数据
   */
  public clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.BACKUP_KEY);
    this.userData = this.initializeUserData();
    this.saveUserData();
  }

  /**
   * 恢复备份数据
   */
  public restoreFromBackup(): boolean {
    try {
      const backup = localStorage.getItem(this.BACKUP_KEY);
      if (backup) {
        const backupData = JSON.parse(backup) as UserData;
        if (this.validateUserData(backupData)) {
          this.userData = backupData;
          this.saveUserData();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('恢复备份失败:', error);
      return false;
    }
  }

  /**
   * 获取存储使用情况
   */
  public getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const data = this.exportData();
      const used = new Blob([data]).size;
      const available = 5 * 1024 * 1024; // 假设localStorage限制为5MB
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// 导出单例实例
export const dataPersistence = DataPersistenceManager.getInstance();