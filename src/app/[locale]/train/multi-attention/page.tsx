'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';

import { Play, Pause, RotateCcw, Eye, Zap, Target, Brain, Volume2, VolumeX, Settings, Trophy, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttentionTarget {
  id: string;
  type: 'visual' | 'audio' | 'tactile' | 'cognitive';
  position: { x: number; y: number; z?: number };
  color: string;
  size: number;
  frequency?: number; // 音频频率
  pattern?: string; // 认知模式
  isActive: boolean;
  isCorrect: boolean;
  timestamp: number;
  intensity: number; // 强度级别
}

interface GameState {
  level: number;
  score: number;
  streak: number;
  maxStreak: number;
  accuracy: number;
  reactionTimes: number[];
  totalTargets: number;
  correctHits: number;
  missedTargets: number;
  falsePositives: number;
  timeRemaining: number;
  isPlaying: boolean;
  isPaused: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  environment: 'space' | 'forest' | 'ocean' | 'city' | 'abstract';
  sensoryMode: 'visual' | 'audio' | 'multi' | 'synesthetic';
}

interface EnvironmentConfig {
  name: string;
  chineseName: string;
  background: string;
  ambientSound: string;
  particleColor: string;
  description: string;
  benefits: string[];
}

// 环境配置需要在组件内部定义以使用t()函数
const getEnvironments = (t: any): Record<string, EnvironmentConfig> => ({
  space: {
    name: t('environments.space.name'),
    chineseName: t('environments.space.name'),
    background: 'from-slate-900 via-purple-900 to-indigo-900',
    ambientSound: 'cosmic-ambient',
    particleColor: 'text-blue-400',
    description: t('environments.space.description'),
    benefits: [t('environments.space.benefit1'), t('environments.space.benefit2'), t('environments.space.benefit3')]
  },
  forest: {
    name: t('environments.forest.name'),
    chineseName: t('environments.forest.name'),
    background: 'from-green-900 via-emerald-800 to-teal-900',
    ambientSound: 'forest-sounds',
    particleColor: 'text-green-400',
    description: t('environments.forest.description'),
    benefits: [t('environments.forest.benefit1'), t('environments.forest.benefit2'), t('environments.forest.benefit3')]
  },
  ocean: {
    name: t('environments.ocean.name'),
    chineseName: t('environments.ocean.name'),
    background: 'from-blue-900 via-cyan-800 to-teal-900',
    ambientSound: 'ocean-waves',
    particleColor: 'text-cyan-400',
    description: t('environments.ocean.description'),
    benefits: [t('environments.ocean.benefit1'), t('environments.ocean.benefit2'), t('environments.ocean.benefit3')]
  },
  city: {
    name: t('environments.city.name'),
    chineseName: t('environments.city.name'),
    background: 'from-pink-900 via-purple-800 to-indigo-900',
    ambientSound: 'city-ambient',
    particleColor: 'text-pink-400',
    description: t('environments.city.description'),
    benefits: [t('environments.city.benefit1'), t('environments.city.benefit2'), t('environments.city.benefit3')]
  },
  abstract: {
    name: t('environments.abstract.name'),
    chineseName: t('environments.abstract.name'),
    background: 'from-violet-900 via-fuchsia-800 to-pink-900',
    ambientSound: 'abstract-tones',
    particleColor: 'text-violet-400',
    description: t('environments.abstract.description'),
    benefits: [t('environments.abstract.benefit1'), t('environments.abstract.benefit2'), t('environments.abstract.benefit3')]
  }
});

const difficultySettings = {
  beginner: {
    targetCount: 3,
    speed: 2000,
    duration: 60,
    distractors: 1,
    sensoryComplexity: 1
  },
  intermediate: {
    targetCount: 5,
    speed: 1500,
    duration: 90,
    distractors: 2,
    sensoryComplexity: 2
  },
  advanced: {
    targetCount: 7,
    speed: 1200,
    duration: 120,
    distractors: 3,
    sensoryComplexity: 3
  },
  expert: {
    targetCount: 10,
    speed: 1000,
    duration: 150,
    distractors: 4,
    sensoryComplexity: 4
  },
  master: {
    targetCount: 15,
    speed: 800,
    duration: 180,
    distractors: 6,
    sensoryComplexity: 5
  }
};

export default function MultiAttentionChallengePage() {
  const t = useTranslations('multidimensionalAttention');
  
  // 在组件内部获取环境配置
  const environments = getEnvironments(t);
  
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    streak: 0,
    maxStreak: 0,
    accuracy: 100,
    reactionTimes: [],
    totalTargets: 0,
    correctHits: 0,
    missedTargets: 0,
    falsePositives: 0,
    timeRemaining: 60,
    isPlaying: false,
    isPaused: false,
    difficulty: 'beginner',
    environment: 'space',
    sensoryMode: 'visual'
  });

  const [targets, setTargets] = useState<AttentionTarget[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(true);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化音频上下文
  useEffect(() => {
    if (typeof window !== 'undefined' && soundEnabled) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [soundEnabled]);

  // 播放音频反馈
  const playSound = useCallback((frequency: number, duration: number = 100) => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  }, [soundEnabled]);

  // 生成随机目标
  const generateTarget = useCallback((): AttentionTarget => {
    const settings = difficultySettings[gameState.difficulty];
    const types: AttentionTarget['type'][] = ['visual'];
    
    if (gameState.sensoryMode === 'audio' || gameState.sensoryMode === 'multi') {
      types.push('audio');
    }
    if (gameState.sensoryMode === 'multi' || gameState.sensoryMode === 'synesthetic') {
      types.push('cognitive', 'tactile');
    }
    
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: {
        x: Math.random() * 80 + 10, // 10-90% 范围
        y: Math.random() * 80 + 10,
        z: type === 'visual' ? Math.random() * 100 : undefined
      },
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 30 + 20,
      frequency: type === 'audio' ? 200 + Math.random() * 800 : undefined,
      pattern: type === 'cognitive' ? ['sequence', 'memory', 'logic'][Math.floor(Math.random() * 3)] : undefined,
      isActive: true,
      isCorrect: Math.random() > 0.3, // 70% 正确目标
      timestamp: Date.now(),
      intensity: Math.random() * settings.sensoryComplexity + 1
    };
  }, [gameState.difficulty, gameState.sensoryMode]);

  // 创建目标
  const createTargets = useCallback(() => {
    const settings = difficultySettings[gameState.difficulty];
    const newTargets: AttentionTarget[] = [];
    
    // 创建正确目标
    for (let i = 0; i < settings.targetCount; i++) {
      newTargets.push(generateTarget());
    }
    
    // 创建干扰目标
    for (let i = 0; i < settings.distractors; i++) {
      const distractor = generateTarget();
      distractor.isCorrect = false;
      newTargets.push(distractor);
    }
    
    setTargets(newTargets);
    
    // 播放音频目标
    newTargets.forEach(target => {
      if (target.type === 'audio' && target.frequency) {
        setTimeout(() => playSound(target.frequency!, 200), Math.random() * 1000);
      }
    });
  }, [gameState.difficulty, generateTarget, playSound]);

  // 处理目标点击
  const handleTargetClick = useCallback((targetId: string) => {
    const target = targets.find(t => t.id === targetId);
    if (!target || !gameState.isPlaying) return;
    
    const reactionTime = Date.now() - target.timestamp;
    
    setGameState(prev => {
      const newReactionTimes = [...prev.reactionTimes, reactionTime];
      const avgReactionTime = newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length;
      
      if (target.isCorrect) {
        const points = Math.max(100 - Math.floor(reactionTime / 10), 10);
        const newStreak = prev.streak + 1;
        const newScore = prev.score + points + (newStreak > 5 ? Math.floor(newStreak / 5) * 50 : 0);
        
        playSound(800, 150); // 成功音效
        
        return {
          ...prev,
          score: newScore,
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
          correctHits: prev.correctHits + 1,
          reactionTimes: newReactionTimes,
          accuracy: ((prev.correctHits + 1) / (prev.totalTargets + 1)) * 100
        };
      } else {
        playSound(200, 300); // 错误音效
        
        return {
          ...prev,
          streak: 0,
          falsePositives: prev.falsePositives + 1,
          accuracy: (prev.correctHits / (prev.totalTargets + 1)) * 100
        };
      }
    });
    
    // 移除被点击的目标
    setTargets(prev => prev.filter(t => t.id !== targetId));
  }, [targets, gameState.isPlaying, playSound]);

  // 自适应难度调整
  const adjustDifficulty = useCallback(() => {
    if (!adaptiveDifficulty) return;
    
    const { accuracy, streak } = gameState;
    
    if (accuracy > 90 && streak > 10) {
      // 提升难度
      const difficulties: GameState['difficulty'][] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
      const currentIndex = difficulties.indexOf(gameState.difficulty);
      if (currentIndex < difficulties.length - 1) {
        setGameState(prev => ({ ...prev, difficulty: difficulties[currentIndex + 1] }));
      }
    } else if (accuracy < 60 && streak < 3) {
      // 降低难度
      const difficulties: GameState['difficulty'][] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
      const currentIndex = difficulties.indexOf(gameState.difficulty);
      if (currentIndex > 0) {
        setGameState(prev => ({ ...prev, difficulty: difficulties[currentIndex - 1] }));
      }
    }
  }, [gameState.accuracy, gameState.streak, gameState.difficulty, adaptiveDifficulty]);

  // 开始游戏
  const startGame = () => {
    setShowInstructions(false);
    const settings = difficultySettings[gameState.difficulty];
    
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      timeRemaining: settings.duration,
      score: 0,
      streak: 0,
      correctHits: 0,
      missedTargets: 0,
      falsePositives: 0,
      totalTargets: 0,
      reactionTimes: []
    }));
    
    createTargets();
  };

  // 暂停/继续游戏
  const togglePause = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  // 重置游戏
  const resetGame = () => {
    setGameState({
      level: 1,
      score: 0,
      streak: 0,
      maxStreak: 0,
      accuracy: 100,
      reactionTimes: [],
      totalTargets: 0,
      correctHits: 0,
      missedTargets: 0,
      falsePositives: 0,
      timeRemaining: 60,
      isPlaying: false,
      isPaused: false,
      difficulty: 'beginner',
      environment: gameState.environment,
      sensoryMode: gameState.sensoryMode
    });
    setTargets([]);
    setShowInstructions(true);
  };

  // 游戏计时器
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && gameState.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setGameState(prev => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            return { ...prev, timeRemaining: 0, isPlaying: false };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.timeRemaining]);

  // 目标生成计时器
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      const settings = difficultySettings[gameState.difficulty];
      
      targetIntervalRef.current = setInterval(() => {
        createTargets();
        setGameState(prev => ({ ...prev, totalTargets: prev.totalTargets + settings.targetCount }));
      }, settings.speed);
    } else {
      if (targetIntervalRef.current) {
        clearInterval(targetIntervalRef.current);
        targetIntervalRef.current = null;
      }
    }

    return () => {
      if (targetIntervalRef.current) {
        clearInterval(targetIntervalRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.difficulty, createTargets]);

  // 自适应难度检查
  useEffect(() => {
    if (gameState.totalTargets > 0 && gameState.totalTargets % 20 === 0) {
      adjustDifficulty();
    }
  }, [gameState.totalTargets, adjustDifficulty]);

  // 获取平均反应时间
  const getAverageReactionTime = () => {
    if (gameState.reactionTimes.length === 0) return 0;
    return Math.round(gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length);
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 border-green-500';
      case 'intermediate': return 'text-yellow-400 border-yellow-500';
      case 'advanced': return 'text-orange-400 border-orange-500';
      case 'expert': return 'text-red-400 border-red-500';
      case 'master': return 'text-purple-400 border-purple-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const currentEnv = environments[gameState.environment];

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${currentEnv.background}`}>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            {t('multidimensionalAttention.title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('multidimensionalAttention.subtitle')}
          </p>
        </div>

        {showInstructions ? (
          // 训练说明和设置
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center text-2xl">
                  {t('multidimensionalAttention.upgradeTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 环境选择 */}
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-4">{t('multidimensionalAttention.selectEnvironment')}</h4>
                    <div className="space-y-3">
                      {Object.entries(environments).map(([key, env]) => (
                        <div
                          key={key}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            gameState.environment === key
                              ? 'border-purple-500 bg-purple-900/30'
                              : 'border-gray-600 bg-gray-800/30 hover:border-purple-400'
                          }`}
                          onClick={() => setGameState(prev => ({ ...prev, environment: key as GameState['environment'] }))}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-white font-medium">{env.chineseName}</h5>
                              <p className="text-gray-400 text-sm mt-1">{env.description}</p>
                            </div>
                            {gameState.environment === key && (
                              <Star className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {env.benefits.map((benefit, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-purple-400 border-purple-500">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 感官模式和难度设置 */}
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-4">{t('multidimensionalAttention.trainingConfig')}</h4>
                    
                    {/* 感官模式 */}
                    <div className="mb-6">
                      <label className="text-white font-medium mb-3 block">{t('multidimensionalAttention.sensoryMode')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'visual', name: t('multidimensionalAttention.sensoryModes.visual'), icon: Eye },
                          { key: 'audio', name: t('multidimensionalAttention.sensoryModes.audio'), icon: Volume2 },
                          { key: 'multi', name: t('multidimensionalAttention.sensoryModes.multi'), icon: Brain },
                          { key: 'synesthetic', name: t('multidimensionalAttention.sensoryModes.synesthetic'), icon: Sparkles }
                        ].map(({ key, name, icon: Icon }) => (
                          <Button
                            key={key}
                            variant={gameState.sensoryMode === key ? 'default' : 'outline'}
                            className={`justify-start ${
                              gameState.sensoryMode === key
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                            }`}
                            onClick={() => setGameState(prev => ({ ...prev, sensoryMode: key as any }))}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* 难度设置 */}
                    <div className="mb-6">
                      <label className="text-white font-medium mb-3 block">{t('multidimensionalAttention.initialDifficulty')}</label>
                      <div className="space-y-2">
                        {Object.entries(difficultySettings).map(([key, settings]) => (
                          <Button
                            key={key}
                            variant={gameState.difficulty === key ? 'default' : 'outline'}
                            className={`w-full justify-between ${
                              gameState.difficulty === key
                                ? getDifficultyColor(key).replace('text-', 'bg-').replace('border-', 'bg-').replace('-400', '-600').replace('-500', '-600')
                                : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                            }`}
                            onClick={() => setGameState(prev => ({ ...prev, difficulty: key as any }))}
                          >
                            <span className="capitalize">{key}</span>
                            <span className="text-sm opacity-75">
                              {settings.targetCount}{t('multidimensionalAttention.targets')} · {settings.duration}{t('multidimensionalAttention.units.seconds')}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* 其他设置 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white">{t('multidimensionalAttention.soundFeedback')}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className={soundEnabled ? 'border-green-500 text-green-400' : 'border-gray-600 text-gray-400'}
                        >
                          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-white">{t('multidimensionalAttention.adaptiveDifficulty')}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdaptiveDifficulty(!adaptiveDifficulty)}
                          className={adaptiveDifficulty ? 'border-blue-500 text-blue-400' : 'border-gray-600 text-gray-400'}
                        >
                          {adaptiveDifficulty ? <Zap className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-3"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {t('multidimensionalAttention.startChallenge')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // 游戏界面
          <div className="max-w-6xl mx-auto">
            {/* 游戏状态栏 */}
            <Card className="mb-6 bg-black/40 border-gray-700">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{gameState.score}</div>
                    <div className="text-sm text-gray-400">{t('multidimensionalAttention.score')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{gameState.streak}</div>
                    <div className="text-sm text-gray-400">{t('multidimensionalAttention.streak')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{Math.round(gameState.accuracy)}%</div>
                    <div className="text-sm text-gray-400">{t('multidimensionalAttention.accuracy')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{getAverageReactionTime()}{t('multidimensionalAttention.units.ms')}</div>
                    <div className="text-sm text-gray-400">{t('multidimensionalAttention.reactionTime')}</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${getDifficultyColor(gameState.difficulty).split(' ')[0]}`}>
                      {gameState.difficulty.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-400">{t('multidimensionalAttention.difficulty')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-400">{gameState.timeRemaining}</div>
                    <div className="text-sm text-gray-400">{t('multidimensionalAttention.timeRemaining')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-pink-400">{t(`multidimensionalAttention.environments.${gameState.environment}.name`)}</div>
                    <div className="text-sm text-gray-400">{t('multidimensionalAttention.environment')}</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Progress 
                    value={(gameState.timeRemaining / difficultySettings[gameState.difficulty].duration) * 100}
                    className="h-2 bg-gray-700"
                  />
                </div>
                
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    onClick={togglePause}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    {gameState.isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                    {gameState.isPaused ? t('multidimensionalAttention.continue') : t('multidimensionalAttention.pause')}
                  </Button>
                  
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('multidimensionalAttention.reset')}
                  </Button>
                  
                  <Button
                    onClick={() => setShowSettings(!showSettings)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t('multidimensionalAttention.settings')}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* 游戏区域 */}
            <Card className="bg-black/20 border-gray-700 relative overflow-hidden" style={{ height: '500px' }}>
              <div 
                ref={gameAreaRef}
                className="w-full h-full relative cursor-crosshair"
                style={{ perspective: '1000px' }}
              >
                <AnimatePresence>
                  {targets.map((target) => (
                    <motion.div
                      key={target.id}
                      initial={{ 
                        opacity: 0, 
                        scale: 0,
                        rotateX: Math.random() * 360,
                        rotateY: Math.random() * 360
                      }}
                      animate={{ 
                        opacity: target.intensity / 5,
                        scale: 1,
                        rotateX: 0,
                        rotateY: 0
                      }}
                      exit={{ 
                        opacity: 0, 
                        scale: 0,
                        rotateX: 180
                      }}
                      transition={{ 
                        duration: 0.3,
                        type: 'spring',
                        stiffness: 200
                      }}
                      className={`absolute cursor-pointer transform-gpu ${
                        target.isCorrect 
                          ? 'hover:scale-110 hover:brightness-125' 
                          : 'hover:scale-105 opacity-60'
                      }`}
                      style={{
                        left: `${target.position.x}%`,
                        top: `${target.position.y}%`,
                        width: `${target.size}px`,
                        height: `${target.size}px`,
                        backgroundColor: target.color,
                        borderRadius: target.type === 'visual' ? '50%' : '10%',
                        boxShadow: `0 0 ${target.intensity * 10}px ${target.color}`,
                        transform: target.position.z ? `translateZ(${target.position.z}px)` : 'none',
                        border: target.isCorrect ? `3px solid ${target.color}` : `3px dashed ${target.color}`,
                        animation: target.type === 'audio' ? 'pulse 1s infinite' : 'none'
                      }}
                      onClick={() => handleTargetClick(target.id)}
                    >
                      {/* 目标类型指示器 */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {target.type === 'visual' && <Eye className="w-4 h-4 text-white" />}
                        {target.type === 'audio' && <Volume2 className="w-4 h-4 text-white" />}
                        {target.type === 'cognitive' && <Brain className="w-4 h-4 text-white" />}
                        {target.type === 'tactile' && <Target className="w-4 h-4 text-white" />}
                      </div>
                      
                      {/* 3D 效果粒子 */}
                      {target.type === 'visual' && (
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className={`absolute w-1 h-1 ${currentEnv.particleColor} rounded-full animate-ping`}
                              style={{
                                left: `${20 + i * 30}%`,
                                top: `${20 + i * 30}%`,
                                animationDelay: `${i * 200}ms`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* 环境特效 */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-1 h-1 ${currentEnv.particleColor} rounded-full`}
                      animate={{
                        x: [0, Math.random() * 100 - 50],
                        y: [0, Math.random() * 100 - 50],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                      }}
                    />
                  ))}
                </div>
                
                {/* 游戏结束或暂停覆盖层 */}
                {(gameState.timeRemaining === 0 || gameState.isPaused) && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Card className="bg-black/80 border-gray-600 p-8 text-center">
                      <CardContent>
                        {gameState.timeRemaining === 0 ? (
                          <div>
                            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-4">{t('multidimensionalAttention.challengeComplete')}</h3>
                            <div className="grid grid-cols-2 gap-4 text-center mb-6">
                              <div>
                                <div className="text-3xl font-bold text-purple-400">{gameState.score}</div>
                                <div className="text-gray-400">{t('multidimensionalAttention.finalScore')}</div>
                              </div>
                              <div>
                                <div className="text-3xl font-bold text-blue-400">{gameState.maxStreak}</div>
                                <div className="text-gray-400">{t('multidimensionalAttention.maxStreak')}</div>
                              </div>
                              <div>
                                <div className="text-3xl font-bold text-green-400">{Math.round(gameState.accuracy)}%</div>
                                <div className="text-gray-400">{t('multidimensionalAttention.accuracy')}</div>
                              </div>
                              <div>
                                <div className="text-3xl font-bold text-yellow-400">{getAverageReactionTime()}{t('multidimensionalAttention.units.ms')}</div>
                                <div className="text-gray-400">{t('multidimensionalAttention.averageReaction')}</div>
                              </div>
                            </div>
                            <Button
                              onClick={resetGame}
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              {t('multidimensionalAttention.challengeAgain')}
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Pause className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-4">{t('multidimensionalAttention.gamePaused')}</h3>
                            <Button
                              onClick={togglePause}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {t('multidimensionalAttention.continueGame')}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}