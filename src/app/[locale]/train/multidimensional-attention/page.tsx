'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  Eye, 
  Volume2, 
  Hand, 
  Brain, 
  Target, 
  Timer, 
  Zap,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Trophy,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AchievementSystem from '@/components/AchievementSystem';

import { useTrainingSession, TrainingState, TrainingConfig as HookTrainingConfig } from '@/hooks/useTrainingSession';
import { useUserProfile, useAchievements } from '@/hooks/useLocalStorage';

// 训练类型枚举
enum TrainingType {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  TACTILE = 'tactile',
  MIXED = 'mixed'
}

// 刺激类型
interface Stimulus {
  id: string;
  type: TrainingType;
  position?: { x: number; y: number };
  color?: string;
  shape?: 'circle' | 'square' | 'triangle';
  sound?: string;
  frequency?: number;
  duration: number;
  intensity: number;
}

// 训练会话统计
interface SessionStats {
  totalStimuli: number;
  correctResponses: number;
  incorrectResponses: number;
  missedResponses: number;
  averageReactionTime: number;
  accuracy: number;
  score: number;
  level: number;
}

// 训练配置
interface TrainingConfig {
  duration: number; // 训练时长（秒）
  stimulusInterval: number; // 刺激间隔（毫秒）
  stimulusDuration: number; // 刺激持续时间（毫秒）
  difficulty: number; // 难度等级 1-10
  trainingTypes: TrainingType[]; // 启用的训练类型
  simultaneousStimuli: number; // 同时出现的刺激数量
}

// 默认配置
const defaultConfig: TrainingConfig = {
  duration: 60,
  stimulusInterval: 2000,
  stimulusDuration: 1000,
  difficulty: 1,
  trainingTypes: [TrainingType.VISUAL],
  simultaneousStimuli: 1
};

/**
 * 多维注意力挑战训练组件
 * 提供视觉、听觉、触觉多感官注意力训练
 */
export default function MultidimensionalAttentionPage() {
  const t = useTranslations();
  
  // 数据管理钩子
  const { profile } = useUserProfile();
  const { newAchievements, clearNewAchievements } = useAchievements();
  
  // 训练会话管理
  const {
    state,
    liveStats,
    startTraining,
    activateTraining,
    pauseTraining,
    resumeTraining,
    recordAnswer,
    finishTraining,
    abandonTraining,
    resetSession,
    getTrainingResult,
    canStart,
    canPause,
    canResume,
    isActive,
    isCompleted
  } = useTrainingSession();
  
  // 状态管理
  const [config, setConfig] = useState<TrainingConfig>(defaultConfig);
  const [currentStimuli, setCurrentStimuli] = useState<Stimulus[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalStimuli: 0,
    correctResponses: 0,
    incorrectResponses: 0,
    missedResponses: 0,
    averageReactionTime: 0,
    accuracy: 0,
    score: 0,
    level: 1
  });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [stimulusStartTime, setStimulusStartTime] = useState<number>(0);
  
  // 当前刺激状态
  const [currentStimulus, setCurrentStimulus] = useState<{
    type: 'visual' | 'audio' | 'tactile';
    data: any;
    startTime: number;
  } | null>(null);

  // 生成随机刺激
  const generateStimulus = useCallback((type: TrainingType): Stimulus => {
    const id = `stimulus_${Date.now()}_${Math.random()}`;
    const baseStimulus = {
      id,
      type,
      duration: config.stimulusDuration,
      intensity: Math.min(config.difficulty * 0.1, 1)
    };

    switch (type) {
      case TrainingType.VISUAL:
        return {
          ...baseStimulus,
          position: {
            x: Math.random() * 80 + 10, // 10-90% 的屏幕位置
            y: Math.random() * 80 + 10
          },
          color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)],
          shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle'
        };
      
      case TrainingType.AUDITORY:
        return {
          ...baseStimulus,
          frequency: 200 + Math.random() * 800, // 200-1000Hz
          sound: ['beep', 'chime', 'click'][Math.floor(Math.random() * 3)]
        };
      
      case TrainingType.TACTILE:
        return {
          ...baseStimulus,
          position: {
            x: Math.random() * 100,
            y: Math.random() * 100
          }
        };
      
      default:
        return baseStimulus;
    }
  }, [config]);

  // 开始训练
  const handleStartTraining = useCallback(() => {
    const trainingConfig: HookTrainingConfig = {
      trainingType: 'multidimensional-attention',
      difficulty: 'medium',
      duration: config.duration,
      settings: {
        stimulusInterval: config.stimulusInterval,
        stimulusDuration: config.stimulusDuration,
        trainingTypes: config.trainingTypes,
        simultaneousStimuli: config.simultaneousStimuli
      }
    };
    
    startTraining(trainingConfig);
    setTimeRemaining(config.duration);
    setSessionStats({
      totalStimuli: 0,
      correctResponses: 0,
      incorrectResponses: 0,
      missedResponses: 0,
      averageReactionTime: 0,
      accuracy: 0,
      score: 0,
      level: 1
    });
    setReactionTimes([]);
    
    // 延迟激活训练，给用户准备时间
    setTimeout(() => {
      activateTraining();
    }, 3000);
  }, [config, startTraining, activateTraining]);

  // 暂停/恢复训练
  const togglePause = useCallback(() => {
    if (state === TrainingState.PAUSED) {
      resumeTraining();
    } else if (state === TrainingState.ACTIVE) {
      pauseTraining();
    }
  }, [state, pauseTraining, resumeTraining]);

  // 停止训练
  const stopTraining = useCallback(() => {
    if (state === TrainingState.ACTIVE || state === TrainingState.PAUSED) {
      finishTraining();
    }
    setCurrentStimuli([]);
    setTimeRemaining(0);
  }, [state, finishTraining]);
  
  // 放弃训练
  const handleAbandonTraining = useCallback(() => {
    abandonTraining();
    setCurrentStimuli([]);
  }, [abandonTraining]);

  // 处理刺激响应
  const handleStimulusResponse = useCallback((stimulusId: string) => {
    const reactionTime = Date.now() - stimulusStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    
    setSessionStats(prev => {
      const newCorrectResponses = prev.correctResponses + 1;
      const newTotalStimuli = prev.totalStimuli;
      const newAccuracy = newTotalStimuli > 0 ? (newCorrectResponses / newTotalStimuli) * 100 : 0;
      const avgReactionTime = reactionTimes.length > 0 
        ? reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length 
        : reactionTime;
      
      return {
        ...prev,
        correctResponses: newCorrectResponses,
        accuracy: newAccuracy,
        averageReactionTime: avgReactionTime,
        score: prev.score + Math.max(1000 - reactionTime, 100)
      };
    });

    // 移除已响应的刺激
    setCurrentStimuli(prev => prev.filter(s => s.id !== stimulusId));
  }, [stimulusStartTime, reactionTimes]);

  // 训练完成处理
  useEffect(() => {
    if (isCompleted) {
      setCurrentStimuli([]);
      const result = getTrainingResult();
      if (result) {
        console.log('Training completed:', result);
      }
    }
  }, [isCompleted, getTrainingResult]);
  
  // 成就通知处理
  useEffect(() => {
    if (newAchievements.length > 0) {
      setTimeout(() => {
        clearNewAchievements();
      }, 5000);
    }
  }, [newAchievements, clearNewAchievements]);

  // 训练循环
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopTraining();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, stopTraining]);

  // 刺激生成循环
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // 清除过期的刺激
      setCurrentStimuli(prev => {
        const now = Date.now();
        return prev.filter(stimulus => {
          const age = now - parseInt(stimulus.id.split('_')[1]);
          return age < stimulus.duration;
        });
      });

      // 生成新刺激
      if (currentStimuli.length < config.simultaneousStimuli) {
        const activeTypes = config.trainingTypes;
        const randomType = activeTypes[Math.floor(Math.random() * activeTypes.length)];
        const newStimulus = generateStimulus(randomType);
        
        setCurrentStimuli(prev => [...prev, newStimulus]);
        setStimulusStartTime(Date.now());
        
        setSessionStats(prev => ({
          ...prev,
          totalStimuli: prev.totalStimuli + 1
        }));
      }
    }, config.stimulusInterval);

    return () => clearInterval(interval);
  }, [isActive, config, currentStimuli.length, generateStimulus]);

  // 渲染视觉刺激
  const renderVisualStimulus = (stimulus: Stimulus) => {
    if (stimulus.type !== TrainingType.VISUAL || !stimulus.position) return null;

    const shapeClass = {
      circle: 'rounded-full',
      square: 'rounded-lg',
      triangle: 'clip-triangle'
    }[stimulus.shape || 'circle'];

    return (
      <motion.div
        key={stimulus.id}
        className={`absolute w-16 h-16 cursor-pointer ${shapeClass} shadow-lg`}
        style={{
          left: `${stimulus.position.x}%`,
          top: `${stimulus.position.y}%`,
          backgroundColor: stimulus.color,
          boxShadow: `0 0 20px ${stimulus.color}40`
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 1], 
          opacity: [0, 1, 0.8],
          rotate: stimulus.shape === 'triangle' ? [0, 360] : 0
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => handleStimulusResponse(stimulus.id)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      />
    );
  };

  // 渲染训练区域
  const renderTrainingArea = () => (
    <div className="relative w-full h-96 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
      {/* 背景网格 */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-6 h-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-gray-500" />
          ))}
        </div>
      </div>
      
      {/* 中心焦点 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="w-4 h-4 bg-white rounded-full opacity-50"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      
      {/* 视觉刺激 */}
      <AnimatePresence>
        {currentStimuli.map(stimulus => renderVisualStimulus(stimulus))}
      </AnimatePresence>
      
      {/* 训练状态覆盖层 */}
      {!isActive && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{t('multidimensionalAttention.title')}</h3>
            <p className="text-gray-300 mb-4">{t('multidimensionalAttention.startPrompt')}</p>
          </motion.div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-purple-400" />
            {t('multidimensionalAttention.title')}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            {t('multidimensionalAttention.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主训练区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 训练控制面板 */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  {t('multidimensionalAttention.trainingControl')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {canStart ? (
                      <Button
                        onClick={handleStartTraining}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {t('multidimensionalAttention.startTraining')}
                      </Button>
                    ) : state === TrainingState.PREPARING ? (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-400 mb-2">{t('multidimensionalAttention.preparing')}</div>
                        <div className="text-sm text-gray-400">{t('multidimensionalAttention.prepareMessage')}</div>
                      </div>
                    ) : (
                      <>
                        {canPause && (
                          <Button
                            onClick={togglePause}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            {t('multidimensionalAttention.pause')}
                          </Button>
                        )}
                        {canResume && (
                          <Button
                            onClick={togglePause}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {t('multidimensionalAttention.resume')}
                          </Button>
                        )}
                        <Button
                          onClick={stopTraining}
                          variant="destructive"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          {t('multidimensionalAttention.complete')}
                        </Button>
                        <Button
                          onClick={handleAbandonTraining}
                          variant="ghost"
                        >
                          {t('multidimensionalAttention.abandon')}
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => setShowSettings(!showSettings)}
                      variant="outline"
                      className="border-gray-600"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {t('multidimensionalAttention.settings')}
                    </Button>
                  </div>
                  
                  {/* 时间显示 */}
                  <div className="flex items-center gap-2 text-white">
                    <Timer className="w-5 h-5 text-blue-400" />
                    <span className="text-xl font-mono">
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
                
                {/* 进度条 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>{t('progress.sessionProgress')}</span>
                    <span>{Math.round(((config.duration - timeRemaining) / config.duration) * 100)}%</span>
                  </div>
                  <Progress value={((config.duration - timeRemaining) / config.duration) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* 训练区域 */}
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30 mb-6"
                >
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">{t('multidimensionalAttention.trainingCompleted')}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-purple-400 font-semibold">{t('multidimensionalAttention.finalScore')}</div>
                      <div className="text-white text-lg">{liveStats.currentScore}</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-semibold">{t('multidimensionalAttention.accuracy')}</div>
                      <div className="text-white text-lg">{liveStats.currentAccuracy.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-semibold">{t('multidimensionalAttention.bestStreak')}</div>
                      <div className="text-white text-lg">{liveStats.bestStreak}</div>
                    </div>
                    <div>
                      <div className="text-yellow-400 font-semibold">{t('multidimensionalAttention.averageReactionTime')}</div>
                      <div className="text-white text-lg">{liveStats.averageReactionTime.toFixed(0)}ms</div>
                    </div>
                  </div>
                  <Button
                    onClick={resetSession}
                    className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {t('multidimensionalAttention.trainAgain')}
                  </Button>
                </motion.div>
              )}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                {renderTrainingArea()}
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 - 统计和设置 */}
          <div className="space-y-6">
            {/* 实时统计 */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  {t('multidimensionalAttention.trainingStats')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {sessionStats.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">{t('multidimensionalAttention.accuracy')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {sessionStats.averageReactionTime.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-400">{t('multidimensionalAttention.averageReactionTime')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {sessionStats.score}
                    </div>
                    <div className="text-sm text-gray-400">{t('multidimensionalAttention.score')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {sessionStats.totalStimuli}
                    </div>
                    <div className="text-sm text-gray-400">{t('multidimensionalAttention.totalStimuli')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 训练设置 */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-400" />
                      {t('multidimensionalAttention.trainingSettings')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 训练时长 */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">{t('multidimensionalAttention.trainingDuration')}</label>
                      <input
                        type="range"
                        min="30"
                        max="300"
                        value={config.duration}
                        onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full"
                        disabled={isActive}
                      />
                      <div className="text-center text-white mt-1">{config.duration}s</div>
                    </div>
                    
                    {/* 难度等级 */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">{t('multidimensionalAttention.difficultyLevel')}</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={config.difficulty}
                        onChange={(e) => setConfig(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                        className="w-full"
                        disabled={isActive}
                      />
                      <div className="text-center text-white mt-1">{t('multidimensionalAttention.level', { level: config.difficulty })}</div>
                    </div>
                    
                    {/* 训练类型选择 */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">{t('multidimensionalAttention.trainingTypes')}</label>
                      <div className="space-y-2">
                        {[
                          { type: TrainingType.VISUAL, icon: Eye, label: t('multidimensionalAttention.visualTraining') },
                          { type: TrainingType.AUDITORY, icon: Volume2, label: t('multidimensionalAttention.auditoryTraining') },
                          { type: TrainingType.TACTILE, icon: Hand, label: t('multidimensionalAttention.tactileTraining') }
                        ].map(({ type, icon: Icon, label }) => (
                          <label key={type} className="flex items-center gap-2 text-white cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.trainingTypes.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setConfig(prev => ({
                                    ...prev,
                                    trainingTypes: [...prev.trainingTypes, type]
                                  }));
                                } else {
                                  setConfig(prev => ({
                                    ...prev,
                                    trainingTypes: prev.trainingTypes.filter(t => t !== type)
                                  }));
                                }
                              }}
                              disabled={isActive}
                              className="rounded"
                            />
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* 成就系统 */}
        <div className="mt-8">
          <AchievementSystem
            userStats={{
              totalTrainingTime: config.duration - timeRemaining,
              trainingStreak: sessionStats.correctResponses,
              totalScore: sessionStats.score,
              averageAccuracy: sessionStats.accuracy / 100,
              modulesCompleted: 1,
              perfectScores: sessionStats.accuracy >= 100 ? 1 : 0,
              fastestReaction: sessionStats.averageReactionTime,
              socialInteractions: 0,
              achievementsUnlocked: 0,
              totalSessions: 1
            }}
            onAchievementUnlock={(achievement) => {
              console.log('Achievement unlocked:', achievement);
            }}
          />
        </div>
      </div>
    </div>
  );
}