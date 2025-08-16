/**
 * 双重N-Back训练引擎
 * 实现科学的训练协议和自适应难度调整
 */

import NBackAudioManager, { SoundEffect } from './NBackAudioManager';

// 训练模式
export enum TrainingMode {
  TUTORIAL = 'tutorial',
  VISUAL_ONLY = 'visual',
  AUDIO_ONLY = 'audio',
  DUAL = 'dual'
}

// 刺激类型
export enum StimulusType {
  VISUAL = 'visual',
  AUDIO = 'audio'
}

// 训练状态
export enum TrainingState {
  IDLE = 'idle',
  READY = 'ready',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

// 刺激数据
interface Stimulus {
  position: number; // 视觉位置 (0-8, 3x3网格)
  tone: number;     // 听觉音调 (0-7)
  timestamp: number;
}

// 用户响应
interface UserResponse {
  visualMatch: boolean | null;
  audioMatch: boolean | null;
  timestamp: number;
  reactionTime: number;
}

// 试验结果
interface TrialResult {
  stimulus: Stimulus;
  response: UserResponse;
  correct: {
    visual: boolean;
    audio: boolean;
  };
  expectedResponse: {
    visual: boolean;
    audio: boolean;
  };
}

// 训练会话统计
interface SessionStats {
  totalTrials: number;
  correctVisual: number;
  correctAudio: number;
  correctBoth: number;
  averageReactionTime: number;
  accuracy: {
    visual: number;
    audio: number;
    combined: number;
  };
  streak: number;
  maxStreak: number;
  score: number;
}

// 训练配置
interface TrainingConfig {
  nLevel: number;           // N-Back级别 (1-4)
  mode: TrainingMode;       // 训练模式
  trialsPerSession: number; // 每次会话的试验数量
  stimulusDuration: number; // 刺激持续时间 (ms)
  intervalDuration: number; // 刺激间隔时间 (ms)
  targetProbability: number; // 目标匹配概率 (0.2-0.3)
  adaptiveMode: boolean;    // 是否启用自适应难度
}

// 默认配置
const DEFAULT_CONFIG: TrainingConfig = {
  nLevel: 2,
  mode: TrainingMode.DUAL,
  trialsPerSession: 20,
  stimulusDuration: 500,
  intervalDuration: 2500,
  targetProbability: 0.25,
  adaptiveMode: true
};

class DualNBackEngine {
  private config: TrainingConfig;
  private audioManager: NBackAudioManager;
  private state: TrainingState = TrainingState.IDLE;
  
  // 训练数据
  private stimuli: Stimulus[] = [];
  private responses: UserResponse[] = [];
  private results: TrialResult[] = [];
  private currentTrial = 0;
  
  // 统计数据
  private sessionStats: SessionStats = this.initializeStats();
  
  // 计时器
  private trialTimer: NodeJS.Timeout | null = null;
  private responseTimer: NodeJS.Timeout | null = null;
  
  // 事件回调
  private onStateChange?: (state: TrainingState) => void;
  private onTrialStart?: (trial: number, stimulus: Stimulus) => void;
  private onTrialEnd?: (result: TrialResult) => void;
  private onSessionComplete?: (stats: SessionStats) => void;
  private onStatsUpdate?: (stats: SessionStats) => void;

  constructor(config: Partial<TrainingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.audioManager = NBackAudioManager.getInstance();
  }

  /**
   * 初始化统计数据
   */
  private initializeStats(): SessionStats {
    return {
      totalTrials: 0,
      correctVisual: 0,
      correctAudio: 0,
      correctBoth: 0,
      averageReactionTime: 0,
      accuracy: {
        visual: 0,
        audio: 0,
        combined: 0
      },
      streak: 0,
      maxStreak: 0,
      score: 0
    };
  }

  /**
   * 设置事件监听器
   */
  setEventListeners(listeners: {
    onStateChange?: (state: TrainingState) => void;
    onTrialStart?: (trial: number, stimulus: Stimulus) => void;
    onTrialEnd?: (result: TrialResult) => void;
    onSessionComplete?: (stats: SessionStats) => void;
    onStatsUpdate?: (stats: SessionStats) => void;
  }) {
    this.onStateChange = listeners.onStateChange;
    this.onTrialStart = listeners.onTrialStart;
    this.onTrialEnd = listeners.onTrialEnd;
    this.onSessionComplete = listeners.onSessionComplete;
    this.onStatsUpdate = listeners.onStatsUpdate;
  }

  /**
   * 更新训练配置
   */
  updateConfig(newConfig: Partial<TrainingConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 生成训练序列
   */
  private generateSequence(): Stimulus[] {
    const sequence: Stimulus[] = [];
    const { trialsPerSession, targetProbability, nLevel } = this.config;
    
    // 计算目标匹配的数量
    const targetMatches = Math.floor(trialsPerSession * targetProbability);
    
    // 生成基础序列
    for (let i = 0; i < trialsPerSession; i++) {
      sequence.push({
        position: Math.floor(Math.random() * 9), // 0-8 (3x3网格)
        tone: Math.floor(Math.random() * 8),     // 0-7 (8个音调)
        timestamp: 0 // 将在运行时设置
      });
    }
    
    // 插入目标匹配
    const matchIndices = this.selectRandomIndices(trialsPerSession - nLevel, targetMatches);
    
    matchIndices.forEach(index => {
      const targetIndex = index + nLevel;
      
      // 随机决定是视觉匹配、听觉匹配还是双重匹配
      const matchType = Math.random();
      
      if (matchType < 0.33) {
        // 仅视觉匹配
        sequence[targetIndex].position = sequence[index].position;
      } else if (matchType < 0.66) {
        // 仅听觉匹配
        sequence[targetIndex].tone = sequence[index].tone;
      } else {
        // 双重匹配
        sequence[targetIndex].position = sequence[index].position;
        sequence[targetIndex].tone = sequence[index].tone;
      }
    });
    
    return sequence;
  }

  /**
   * 选择随机索引
   */
  private selectRandomIndices(maxIndex: number, count: number): number[] {
    const indices: number[] = [];
    const available = Array.from({ length: maxIndex }, (_, i) => i);
    
    for (let i = 0; i < count && available.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      indices.push(available.splice(randomIndex, 1)[0]);
    }
    
    return indices.sort((a, b) => a - b);
  }

  /**
   * 开始训练会话
   */
  async startSession(): Promise<void> {
    if (this.state !== TrainingState.IDLE) {
      throw new Error('训练已在进行中');
    }

    try {
      // 初始化音频管理器
      await this.audioManager.initialize();
      
      // 重置数据
      this.stimuli = this.generateSequence();
      this.responses = [];
      this.results = [];
      this.currentTrial = 0;
      this.sessionStats = this.initializeStats();
      
      // 更新状态
      this.setState(TrainingState.READY);
      
      // 播放开始音效
      await this.audioManager.playSoundEffect(SoundEffect.START);
      
      // 延迟开始第一个试验
      setTimeout(() => {
        this.setState(TrainingState.RUNNING);
        this.startTrial();
      }, 1000);
      
    } catch (error) {
      console.error('启动训练会话失败:', error);
      this.setState(TrainingState.IDLE);
      throw error;
    }
  }

  /**
   * 开始单个试验
   */
  private startTrial(): void {
    if (this.currentTrial >= this.stimuli.length) {
      this.completeSession();
      return;
    }

    const stimulus = this.stimuli[this.currentTrial];
    stimulus.timestamp = Date.now();
    
    // 通知试验开始
    this.onTrialStart?.(this.currentTrial, stimulus);
    
    // 播放刺激
    this.presentStimulus(stimulus);
    
    // 设置响应超时
    this.responseTimer = setTimeout(() => {
      this.handleResponse(null, null);
    }, this.config.intervalDuration);
  }

  /**
   * 呈现刺激
   */
  private async presentStimulus(stimulus: Stimulus): Promise<void> {
    const { mode, stimulusDuration } = this.config;
    
    try {
      // 播放听觉刺激
      if (mode === TrainingMode.AUDIO_ONLY || mode === TrainingMode.DUAL) {
        await this.audioManager.playTone(stimulus.tone, stimulusDuration / 1000);
      }
      
      // 视觉刺激由UI组件处理
      
    } catch (error) {
      console.error('呈现刺激失败:', error);
    }
  }

  /**
   * 处理用户响应
   */
  handleResponse(visualMatch: boolean | null, audioMatch: boolean | null): void {
    if (this.state !== TrainingState.RUNNING) return;
    
    // 清除响应计时器
    if (this.responseTimer) {
      clearTimeout(this.responseTimer);
      this.responseTimer = null;
    }
    
    const now = Date.now();
    const stimulus = this.stimuli[this.currentTrial];
    const reactionTime = now - stimulus.timestamp;
    
    // 创建响应记录
    const response: UserResponse = {
      visualMatch,
      audioMatch,
      timestamp: now,
      reactionTime
    };
    
    this.responses.push(response);
    
    // 计算正确答案
    const expectedResponse = this.calculateExpectedResponse(this.currentTrial);
    
    // 评估响应正确性
    const correct = {
      visual: this.evaluateResponse(visualMatch, expectedResponse.visual),
      audio: this.evaluateResponse(audioMatch, expectedResponse.audio)
    };
    
    // 创建试验结果
    const result: TrialResult = {
      stimulus,
      response,
      correct,
      expectedResponse
    };
    
    this.results.push(result);
    
    // 更新统计数据
    this.updateStats(result);
    
    // 播放反馈音效
    this.playFeedback(correct);
    
    // 通知试验结束
    this.onTrialEnd?.(result);
    
    // 准备下一个试验
    this.currentTrial++;
    
    // 延迟开始下一个试验
    this.trialTimer = setTimeout(() => {
      this.startTrial();
    }, this.config.intervalDuration - this.config.stimulusDuration);
  }

  /**
   * 计算期望响应
   */
  private calculateExpectedResponse(trialIndex: number): { visual: boolean; audio: boolean } {
    const { nLevel, mode } = this.config;
    
    if (trialIndex < nLevel) {
      return { visual: false, audio: false };
    }
    
    const currentStimulus = this.stimuli[trialIndex];
    const nBackStimulus = this.stimuli[trialIndex - nLevel];
    
    const visualMatch = (mode === TrainingMode.VISUAL_ONLY || mode === TrainingMode.DUAL) &&
                       currentStimulus.position === nBackStimulus.position;
    
    const audioMatch = (mode === TrainingMode.AUDIO_ONLY || mode === TrainingMode.DUAL) &&
                      currentStimulus.tone === nBackStimulus.tone;
    
    return {
      visual: visualMatch,
      audio: audioMatch
    };
  }

  /**
   * 评估响应正确性
   */
  private evaluateResponse(userResponse: boolean | null, expected: boolean): boolean {
    if (userResponse === null) {
      return !expected; // 无响应时，如果不应该响应则正确
    }
    return userResponse === expected;
  }

  /**
   * 更新统计数据
   */
  private updateStats(result: TrialResult): void {
    this.sessionStats.totalTrials++;
    
    // 更新正确计数
    if (result.correct.visual) this.sessionStats.correctVisual++;
    if (result.correct.audio) this.sessionStats.correctAudio++;
    if (result.correct.visual && result.correct.audio) {
      this.sessionStats.correctBoth++;
      this.sessionStats.streak++;
      this.sessionStats.maxStreak = Math.max(this.sessionStats.maxStreak, this.sessionStats.streak);
    } else {
      this.sessionStats.streak = 0;
    }
    
    // 更新反应时间
    const totalReactionTime = this.results.reduce((sum, r) => sum + r.response.reactionTime, 0);
    this.sessionStats.averageReactionTime = totalReactionTime / this.results.length;
    
    // 计算准确率
    this.sessionStats.accuracy.visual = this.sessionStats.correctVisual / this.sessionStats.totalTrials;
    this.sessionStats.accuracy.audio = this.sessionStats.correctAudio / this.sessionStats.totalTrials;
    this.sessionStats.accuracy.combined = this.sessionStats.correctBoth / this.sessionStats.totalTrials;
    
    // 计算分数
    this.sessionStats.score = this.calculateScore();
    
    // 通知统计更新
    this.onStatsUpdate?.(this.sessionStats);
  }

  /**
   * 计算训练分数
   */
  private calculateScore(): number {
    const { accuracy, averageReactionTime, maxStreak } = this.sessionStats;
    
    // 基础分数基于准确率
    let score = accuracy.combined * 1000;
    
    // 反应时间奖励（反应越快分数越高）
    const reactionBonus = Math.max(0, (2000 - averageReactionTime) / 10);
    score += reactionBonus;
    
    // 连击奖励
    const streakBonus = maxStreak * 50;
    score += streakBonus;
    
    // N级别奖励
    const levelBonus = this.config.nLevel * 200;
    score += levelBonus;
    
    return Math.round(score);
  }

  /**
   * 播放反馈音效
   */
  private async playFeedback(correct: { visual: boolean; audio: boolean }): Promise<void> {
    try {
      if (correct.visual && correct.audio) {
        await this.audioManager.playSoundEffect(SoundEffect.CORRECT);
      } else {
        await this.audioManager.playSoundEffect(SoundEffect.INCORRECT);
      }
    } catch (error) {
      console.error('播放反馈音效失败:', error);
    }
  }

  /**
   * 完成训练会话
   */
  private async completeSession(): Promise<void> {
    this.setState(TrainingState.COMPLETED);
    
    // 播放完成音效
    try {
      await this.audioManager.playSoundEffect(SoundEffect.COMPLETE);
    } catch (error) {
      console.error('播放完成音效失败:', error);
    }
    
    // 自适应难度调整
    if (this.config.adaptiveMode) {
      this.adjustDifficulty();
    }
    
    // 通知会话完成
    this.onSessionComplete?.(this.sessionStats);
  }

  /**
   * 自适应难度调整
   */
  private adjustDifficulty(): void {
    const { accuracy } = this.sessionStats;
    const combinedAccuracy = accuracy.combined;
    
    // 如果准确率过高，增加难度
    if (combinedAccuracy > 0.8 && this.config.nLevel < 4) {
      this.config.nLevel++;
      console.log(`难度提升到 ${this.config.nLevel}-Back`);
    }
    // 如果准确率过低，降低难度
    else if (combinedAccuracy < 0.5 && this.config.nLevel > 1) {
      this.config.nLevel--;
      console.log(`难度降低到 ${this.config.nLevel}-Back`);
    }
  }

  /**
   * 暂停训练
   */
  pause(): void {
    if (this.state === TrainingState.RUNNING) {
      this.setState(TrainingState.PAUSED);
      
      // 清除计时器
      if (this.trialTimer) {
        clearTimeout(this.trialTimer);
        this.trialTimer = null;
      }
      if (this.responseTimer) {
        clearTimeout(this.responseTimer);
        this.responseTimer = null;
      }
    }
  }

  /**
   * 恢复训练
   */
  resume(): void {
    if (this.state === TrainingState.PAUSED) {
      this.setState(TrainingState.RUNNING);
      this.startTrial();
    }
  }

  /**
   * 停止训练
   */
  stop(): void {
    // 清除计时器
    if (this.trialTimer) {
      clearTimeout(this.trialTimer);
      this.trialTimer = null;
    }
    if (this.responseTimer) {
      clearTimeout(this.responseTimer);
      this.responseTimer = null;
    }
    
    this.setState(TrainingState.IDLE);
  }

  /**
   * 设置状态
   */
  private setState(newState: TrainingState): void {
    this.state = newState;
    this.onStateChange?.(newState);
  }

  // Getters
  getState(): TrainingState {
    return this.state;
  }

  getConfig(): TrainingConfig {
    return { ...this.config };
  }

  getCurrentTrial(): number {
    return this.currentTrial;
  }

  getSessionStats(): SessionStats {
    return { ...this.sessionStats };
  }

  getResults(): TrialResult[] {
    return [...this.results];
  }

  getCurrentStimulus(): Stimulus | null {
    if (this.currentTrial < this.stimuli.length) {
      return this.stimuli[this.currentTrial];
    }
    return null;
  }
}

export default DualNBackEngine;
export type {
  TrainingConfig,
  SessionStats,
  TrialResult,
  Stimulus,
  UserResponse
};