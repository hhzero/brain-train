// 训练相关的TypeScript类型定义

// 训练难度级别
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

// 训练模式
export type TrainingMode = 'practice' | 'challenge' | 'adaptive' | 'custom';

// 训练类型
export type TrainingType = 'gaze' | 'schulte' | 'multi-attention' | 'cognitive-flexibility';

// 训练状态
export type TrainingStatus = 'idle' | 'preparing' | 'active' | 'paused' | 'completed' | 'failed';

// 基础训练配置
export interface BaseTrainingConfig {
  difficulty: DifficultyLevel;
  mode: TrainingMode;
  duration: number; // 训练时长（秒）
  adaptiveDifficulty: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// 训练会话数据
export interface TrainingSession {
  id: string;
  type: TrainingType;
  config: AnyTrainingConfig;
  startTime: Date;
  endTime?: Date;
  status: TrainingStatus;
  results?: TrainingResult;
}

// 训练结果
export interface TrainingResult {
  sessionId: string;
  type: TrainingType;
  score: number;
  accuracy: number; // 准确率 (0-100)
  reactionTime: number; // 平均反应时间（毫秒）
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  streakBest: number; // 最佳连击
  timeSpent: number; // 实际训练时间（秒）
  difficultyProgression: DifficultyLevel[];
  detailedMetrics: Record<string, any>;
  timestamp: Date;
}

// 用户进度数据
export interface UserProgress {
  userId: string;
  trainingType: TrainingType;
  level: number;
  experience: number;
  totalSessions: number;
  totalTimeSpent: number; // 总训练时间（秒）
  bestScore: number;
  bestAccuracy: number;
  bestReactionTime: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  lastTrainingDate: Date;
  weeklyGoal: number; // 每周训练目标（分钟）
  weeklyProgress: number; // 本周已完成（分钟）
}

// 成就系统
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'score' | 'streak' | 'time' | 'accuracy' | 'consistency' | 'milestone';
  requirement: {
    value: number;
    condition: 'gte' | 'lte' | 'eq';
  };
  reward: {
    experience: number;
    badge?: string;
  };
  unlockedAt?: Date;
  progress: number; // 0-100
}

// 凝视训练特定类型
export interface GazeTrainingConfig extends Omit<BaseTrainingConfig, 'mode'> {
  mode: 'static' | 'dynamic' | 'anti-distraction';
  targetSize: number; // 目标大小
  distractionLevel: number; // 干扰级别 (0-10)
  movementSpeed?: number; // 动态模式下的移动速度
}

export interface GazeTrainingResult extends TrainingResult {
  focusTime: number; // 专注时间（秒）
  interruptionCount: number; // 中断次数
  stabilityScore: number; // 稳定性评分
  trackingAccuracy?: number; // 追踪准确性（动态模式）
}

// 舒尔特方格特定类型
export interface SchulteTrainingConfig extends Omit<BaseTrainingConfig, 'mode'> {
  gridSize: 3 | 4 | 5 | 6 | 7 | 8 | 9; // 方格大小
  mode: 'sequential' | 'reverse' | 'random' | 'color' | 'letter';
  timeLimit?: number; // 时间限制（秒）
}

export interface SchulteTrainingResult extends TrainingResult {
  gridSize: number;
  completionTime: number; // 完成时间（秒）
  clickSequence: number[]; // 点击序列
  errorCount: number; // 错误次数
  visualScanningScore: number; // 视觉扫描评分
}

// 多维注意力特定类型
export interface MultiAttentionConfig extends BaseTrainingConfig {
  sensoryModes: ('visual' | 'audio' | 'tactile')[];
  targetCount: number; // 同时出现的目标数量
  distractorCount: number; // 干扰项数量
  environmentType: 'space' | 'forest' | 'ocean' | 'city' | 'abstract';
}

export interface MultiAttentionResult extends TrainingResult {
  sensoryModeStats: Record<string, {
    accuracy: number;
    reactionTime: number;
    attempts: number;
  }>;
  multitaskingScore: number; // 多任务处理评分
  attentionSwitchingSpeed: number; // 注意力切换速度
}

// 认知灵活性特定类型
export interface CognitiveFlexibilityConfig extends BaseTrainingConfig {
  taskTypes: ('task_switching' | 'stroop_test' | 'working_memory_update' | 'workplace_simulation' | 'learning_scenario' | 'life_situation')[];
  scenarioTypes: ('workplace' | 'academic' | 'daily_life' | 'emergency' | 'social')[];
  contextualLearning: boolean;
  progressiveChallenge: boolean;
}

export interface CognitiveFlexibilityResult extends TrainingResult {
  taskSwitchingSpeed: number; // 任务切换速度
  inhibitoryControl: number; // 抑制控制评分
  workingMemoryUpdate: number; // 工作记忆更新评分
  scenarioAdaptation: number; // 情境适应评分
  cognitiveFlexibilityIndex: number; // 认知灵活性指数
}

// 自适应难度系统
export interface AdaptiveDifficultySystem {
  currentDifficulty: DifficultyLevel;
  performanceHistory: {
    accuracy: number;
    reactionTime: number;
    timestamp: Date;
  }[];
  adjustmentThresholds: {
    increaseThreshold: number; // 提升难度的准确率阈值
    decreaseThreshold: number; // 降低难度的准确率阈值
    stabilityWindow: number; // 稳定性窗口（会话数）
  };
  nextAdjustment?: {
    direction: 'increase' | 'decrease' | 'maintain';
    confidence: number;
    reason: string;
  };
}

// 训练统计数据
export interface TrainingStats {
  daily: {
    date: string;
    sessions: number;
    totalTime: number;
    averageScore: number;
    averageAccuracy: number;
  }[];
  weekly: {
    week: string;
    sessions: number;
    totalTime: number;
    averageScore: number;
    improvement: number;
  }[];
  monthly: {
    month: string;
    sessions: number;
    totalTime: number;
    averageScore: number;
    achievements: number;
  }[];
}

// 游戏化元素
export interface GameificationElements {
  level: number;
  experience: number;
  experienceToNext: number;
  rank: string;
  badges: Badge[];
  streaks: {
    current: number;
    longest: number;
    type: 'daily' | 'weekly';
  };
  leaderboard: {
    position: number;
    totalUsers: number;
    category: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  category: string;
}

// 训练推荐系统
export interface TrainingRecommendation {
  type: TrainingType;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  expectedBenefit: string;
  config: BaseTrainingConfig;
}

// 导出所有类型的联合类型
export type AnyTrainingConfig = 
  | GazeTrainingConfig 
  | SchulteTrainingConfig 
  | MultiAttentionConfig 
  | CognitiveFlexibilityConfig;

export type AnyTrainingResult = 
  | GazeTrainingResult 
  | SchulteTrainingResult 
  | MultiAttentionResult 
  | CognitiveFlexibilityResult;