'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Brain, 
  Smile, 
  Frown, 
  Angry, 
  AlertCircle, 
  Meh, 
  Wind,
  Leaf,
  Mountain,
  Sun,
  Moon,
  Star,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Award,
  TrendingUp,
  Users,
  Target,
  Settings
} from 'lucide-react';

// 情绪类型定义
type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';

// 训练状态
enum TrainingState {
  IDLE = 'idle',
  TRAINING = 'training',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

// 训练模块类型
enum ModuleType {
  EMOTION_RECOGNITION = 'emotion-recognition',
  STRESS_RELIEF = 'stress-relief',
  EMOTION_REGULATION = 'emotion-regulation',
  SOCIAL_EQ = 'social-eq',
  TAICHI_MINDFULNESS = 'taichi-mindfulness',
  ZEN_MEDITATION = 'zen-meditation'
}

// 情绪数据接口
interface EmotionData {
  id: string;
  emotion: EmotionType;
  intensity: number;
  context: string;
  culturalContext: string;
  facialFeatures: string[];
  bodyLanguage: string[];
  voiceTone: string;
}

// 训练统计
interface TrainingStats {
  accuracy: number;
  averageResponseTime: number;
  totalQuestions: number;
  correctAnswers: number;
  streak: number;
  bestStreak: number;
  emotionAccuracy: Record<EmotionType, number>;
  culturalAwareness: number;
}

// 训练配置
interface TrainingConfig {
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  moduleType: ModuleType;
  culturalElements: boolean;
  adaptiveDifficulty: boolean;
  feedbackEnabled: boolean;
}

// 冥想会话数据
interface MeditationSession {
  id: string;
  name: string;
  duration: number;
  type: 'breathing' | 'mindfulness' | 'loving-kindness' | 'body-scan';
  culturalOrigin: 'taichi' | 'zen' | 'modern';
  phases: MeditationPhase[];
}

interface MeditationPhase {
  name: string;
  duration: number;
  instruction: string;
  breathingPattern?: {
    inhale: number;
    hold: number;
    exhale: number;
    pause: number;
  };
  visualization?: string;
  mantra?: string;
}

// 情绪图标映射
const emotionIcons: Record<EmotionType, React.ReactNode> = {
  joy: <Smile className="w-8 h-8 text-yellow-400" />,
  sadness: <Frown className="w-8 h-8 text-blue-400" />,
  anger: <Angry className="w-8 h-8 text-red-400" />,
  fear: <AlertCircle className="w-8 h-8 text-purple-400" />,
  surprise: <AlertCircle className="w-8 h-8 text-orange-400" />,
  disgust: <Meh className="w-8 h-8 text-green-400" />,
  neutral: <Meh className="w-8 h-8 text-gray-400" />
};

// 情绪颜色映射
const emotionColors: Record<EmotionType, string> = {
  joy: 'bg-yellow-500/20 border-yellow-500',
  sadness: 'bg-blue-500/20 border-blue-500',
  anger: 'bg-red-500/20 border-red-500',
  fear: 'bg-purple-500/20 border-purple-500',
  surprise: 'bg-orange-500/20 border-orange-500',
  disgust: 'bg-green-500/20 border-green-500',
  neutral: 'bg-gray-500/20 border-gray-500'
};

// 模拟情绪数据
const getEmotionDatabase = (tEm: any): EmotionData[] => [
  {
    id: '1',
    emotion: 'joy',
    intensity: 8,
    context: tEm('emotionData.joy.context'),
    culturalContext: tEm('emotionData.joy.culturalContext'),
    facialFeatures: [tEm('emotionData.joy.facialFeatures.0'), tEm('emotionData.joy.facialFeatures.1'), tEm('emotionData.joy.facialFeatures.2')],
    bodyLanguage: [tEm('emotionData.joy.bodyLanguage.0'), tEm('emotionData.joy.bodyLanguage.1'), tEm('emotionData.joy.bodyLanguage.2')],
    voiceTone: tEm('emotionData.joy.voiceTone')
  },
  {
    id: '2',
    emotion: 'sadness',
    intensity: 6,
    context: tEm('emotionData.sadness.context'),
    culturalContext: tEm('emotionData.sadness.culturalContext'),
    facialFeatures: [tEm('emotionData.sadness.facialFeatures.0'), tEm('emotionData.sadness.facialFeatures.1'), tEm('emotionData.sadness.facialFeatures.2')],
    bodyLanguage: [tEm('emotionData.sadness.bodyLanguage.0'), tEm('emotionData.sadness.bodyLanguage.1'), tEm('emotionData.sadness.bodyLanguage.2')],
    voiceTone: tEm('emotionData.sadness.voiceTone')
  }
  // 更多情绪数据...
];

// 冥想会话数据
const getMeditationSessions = (tEm: any): MeditationSession[] => [
  {
    id: 'taichi-breathing',
    name: tEm('meditation.taichiBreathing.name'),
    duration: 600, // 10分钟
    type: 'breathing',
    culturalOrigin: 'taichi',
    phases: [
      {
        name: tEm('meditation.taichiBreathing.phases.preparation.name'),
        duration: 120,
        instruction: tEm('meditation.taichiBreathing.phases.preparation.instruction'),
        breathingPattern: { inhale: 4, hold: 2, exhale: 6, pause: 2 },
        visualization: tEm('meditation.taichiBreathing.phases.preparation.visualization')
      },
      {
        name: tEm('meditation.taichiBreathing.phases.breathing.name'),
        duration: 240,
        instruction: tEm('meditation.taichiBreathing.phases.breathing.instruction'),
        breathingPattern: { inhale: 6, hold: 3, exhale: 8, pause: 3 },
        visualization: tEm('meditation.taichiBreathing.phases.breathing.visualization')
      },
      {
        name: tEm('meditation.taichiBreathing.phases.completion.name'),
        duration: 240,
        instruction: tEm('meditation.taichiBreathing.phases.completion.instruction'),
        breathingPattern: { inhale: 5, hold: 5, exhale: 10, pause: 5 },
        visualization: tEm('meditation.taichiBreathing.phases.completion.visualization')
      }
    ]
  },
  {
    id: 'zen-mindfulness',
    name: tEm('meditation.zenMindfulness.name'),
    duration: 900, // 15分钟
    type: 'mindfulness',
    culturalOrigin: 'zen',
    phases: [
      {
        name: tEm('meditation.zenMindfulness.phases.centering.name'),
        duration: 180,
        instruction: tEm('meditation.zenMindfulness.phases.centering.instruction'),
        visualization: tEm('meditation.zenMindfulness.phases.centering.visualization'),
        mantra: tEm('meditation.zenMindfulness.phases.centering.mantra')
      },
      {
        name: tEm('meditation.zenMindfulness.phases.mindfulness.name'),
        duration: 360,
        instruction: tEm('meditation.zenMindfulness.phases.mindfulness.instruction'),
        visualization: tEm('meditation.zenMindfulness.phases.mindfulness.visualization'),
        mantra: tEm('meditation.zenMindfulness.phases.mindfulness.mantra')
      },
      {
        name: tEm('meditation.zenMindfulness.phases.integration.name'),
        duration: 360,
        instruction: tEm('meditation.zenMindfulness.phases.integration.instruction'),
        visualization: tEm('meditation.zenMindfulness.phases.integration.visualization'),
        mantra: tEm('meditation.zenMindfulness.phases.integration.mantra')
      }
    ]
  }
];

export default function EmotionalManagementPage() {
  const t = useTranslations('EmotionalManagement');
  const tEm = useTranslations('emotionalManagement');
  
  // 状态管理
  const [trainingState, setTrainingState] = useState<TrainingState>(TrainingState.IDLE);
  const [currentModule, setCurrentModule] = useState<ModuleType>(ModuleType.EMOTION_RECOGNITION);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [currentSession, setCurrentSession] = useState<MeditationSession | null>(null);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState<number>(0);
  
  // 训练统计
  const [stats, setStats] = useState<TrainingStats>({
    accuracy: 0,
    averageResponseTime: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    emotionAccuracy: {
      joy: 0, sadness: 0, anger: 0, fear: 0, 
      surprise: 0, disgust: 0, neutral: 0
    },
    culturalAwareness: 0
  });
  
  // 训练配置
  const [config, setConfig] = useState<TrainingConfig>({
    duration: 600, // 10分钟
    difficulty: 'beginner',
    moduleType: ModuleType.EMOTION_RECOGNITION,
    culturalElements: true,
    adaptiveDifficulty: true,
    feedbackEnabled: true
  });
  
  const [selectedAnswer, setSelectedAnswer] = useState<EmotionType | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [responseStartTime, setResponseStartTime] = useState<number>(0);

  // 生成随机情绪数据
  const generateEmotionStimulus = useCallback(() => {
    const emotionDatabase = getEmotionDatabase(tEm);
    const availableEmotions = emotionDatabase.filter(emotion => {
      if (config.difficulty === 'beginner') {
        return ['joy', 'sadness', 'anger'].includes(emotion.emotion);
      } else if (config.difficulty === 'intermediate') {
        return !['neutral'].includes(emotion.emotion);
      }
      return true; // advanced 和 master 包含所有情绪
    });
    
    const randomEmotion = availableEmotions[Math.floor(Math.random() * availableEmotions.length)];
    setCurrentEmotion(randomEmotion);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setResponseStartTime(Date.now());
  }, [config.difficulty]);

  // 处理答案选择
  const handleAnswerSelect = useCallback((emotion: EmotionType) => {
    if (!currentEmotion || showFeedback) return;
    
    const responseTime = Date.now() - responseStartTime;
    const isCorrect = emotion === currentEmotion.emotion;
    
    setSelectedAnswer(emotion);
    setShowFeedback(true);
    
    // 更新统计数据
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalQuestions += 1;
      
      if (isCorrect) {
        newStats.correctAnswers += 1;
        newStats.streak += 1;
        newStats.bestStreak = Math.max(newStats.bestStreak, newStats.streak);
        newStats.emotionAccuracy[emotion] = 
          (newStats.emotionAccuracy[emotion] * (newStats.totalQuestions - 1) + 100) / newStats.totalQuestions;
      } else {
        newStats.streak = 0;
      }
      
      newStats.accuracy = (newStats.correctAnswers / newStats.totalQuestions) * 100;
      newStats.averageResponseTime = 
        (newStats.averageResponseTime * (newStats.totalQuestions - 1) + responseTime) / newStats.totalQuestions;
      
      return newStats;
    });
    
    // 2秒后生成下一题
    setTimeout(() => {
      generateEmotionStimulus();
    }, 2000);
  }, [currentEmotion, showFeedback, responseStartTime, generateEmotionStimulus]);

  // 开始训练
  const handleStartTraining = useCallback(() => {
    setTrainingState(TrainingState.TRAINING);
    setTimeRemaining(config.duration);
    
    if (config.moduleType === ModuleType.EMOTION_RECOGNITION) {
      generateEmotionStimulus();
    } else if ([ModuleType.TAICHI_MINDFULNESS, ModuleType.ZEN_MEDITATION].includes(config.moduleType)) {
      const meditationSessions = getMeditationSessions(tEm);
      const session = meditationSessions.find(s => 
        (config.moduleType === ModuleType.TAICHI_MINDFULNESS && s.culturalOrigin === 'taichi') ||
        (config.moduleType === ModuleType.ZEN_MEDITATION && s.culturalOrigin === 'zen')
      );
      if (session) {
        setCurrentSession(session);
        setCurrentPhase(0);
        setPhaseTimeRemaining(session.phases[0].duration);
      }
    }
  }, [config, generateEmotionStimulus]);

  // 暂停/继续训练
  const handlePauseResume = useCallback(() => {
    if (trainingState === TrainingState.TRAINING) {
      setTrainingState(TrainingState.PAUSED);
    } else if (trainingState === TrainingState.PAUSED) {
      setTrainingState(TrainingState.TRAINING);
    }
  }, [trainingState]);

  // 停止训练
  const handleStopTraining = useCallback(() => {
    setTrainingState(TrainingState.COMPLETED);
  }, []);

  // 重置训练
  const handleResetTraining = useCallback(() => {
    setTrainingState(TrainingState.IDLE);
    setCurrentEmotion(null);
    setCurrentSession(null);
    setCurrentPhase(0);
    setTimeRemaining(0);
    setPhaseTimeRemaining(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStats({
      accuracy: 0,
      averageResponseTime: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      streak: 0,
      bestStreak: 0,
      emotionAccuracy: {
        joy: 0, sadness: 0, anger: 0, fear: 0, 
        surprise: 0, disgust: 0, neutral: 0
      },
      culturalAwareness: 0
    });
  }, []);

  // 计时器效果
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (trainingState === TrainingState.TRAINING) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTrainingState(TrainingState.COMPLETED);
            return 0;
          }
          return prev - 1;
        });
        
        if (currentSession && phaseTimeRemaining > 0) {
          setPhaseTimeRemaining(prev => {
            if (prev <= 1) {
              // 切换到下一阶段
              const nextPhase = currentPhase + 1;
              if (nextPhase < currentSession.phases.length) {
                setCurrentPhase(nextPhase);
                return currentSession.phases[nextPhase].duration;
              }
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [trainingState, currentSession, currentPhase, phaseTimeRemaining]);

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 渲染情绪识别训练
  const renderEmotionRecognition = () => {
    if (!currentEmotion) return null;
    
    return (
      <div className="space-y-6">
        {/* 情绪展示区域 */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white mb-4">
              识别这个情绪
            </CardTitle>
            <div className="flex justify-center mb-4">
              <div className={`p-8 rounded-full ${emotionColors[currentEmotion.emotion]} backdrop-blur-sm`}>
                {emotionIcons[currentEmotion.emotion]}
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg text-gray-300">{currentEmotion.context}</p>
            {config.culturalElements && (
              <p className="text-sm text-blue-300 italic">
                💫 {currentEmotion.culturalContext}
              </p>
            )}
            
            {/* 面部特征提示 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-300 mb-2">面部特征</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  {currentEmotion.facialFeatures.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-300 mb-2">肢体语言</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  {currentEmotion.bodyLanguage.map((language, index) => (
                    <li key={index}>• {language}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-300 mb-2">语调特征</h4>
                <p className="text-xs text-gray-300">• {currentEmotion.voiceTone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 选项区域 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(emotionIcons).map(([emotion, icon]) => {
            const emotionType = emotion as EmotionType;
            const isSelected = selectedAnswer === emotionType;
            const isCorrect = showFeedback && emotionType === currentEmotion.emotion;
            const isWrong = showFeedback && isSelected && emotionType !== currentEmotion.emotion;
            
            return (
              <Button
                key={emotion}
                variant={isSelected ? "default" : "outline"}
                className={`h-20 flex flex-col items-center justify-center space-y-2 transition-all duration-300 ${
                  isCorrect ? 'bg-green-500 border-green-400' : 
                  isWrong ? 'bg-red-500 border-red-400' : 
                  isSelected ? 'bg-blue-500 border-blue-400' : 
                  'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
                onClick={() => handleAnswerSelect(emotionType)}
                disabled={showFeedback}
              >
                {icon}
                <span className="text-xs capitalize">
                  {emotion === 'joy' ? tEm('emotions.joy') :
                   emotion === 'sadness' ? tEm('emotions.sadness') :
                   emotion === 'anger' ? tEm('emotions.anger') :
                   emotion === 'fear' ? tEm('emotions.fear') :
                   emotion === 'surprise' ? tEm('emotions.surprise') :
                   emotion === 'disgust' ? tEm('emotions.disgust') : tEm('emotions.neutral')}
                </span>
              </Button>
            );
          })}
        </div>
        
        {/* 反馈信息 */}
        {showFeedback && (
          <Card className={`${selectedAnswer === currentEmotion.emotion ? 
            'bg-green-900/50 border-green-500/50' : 
            'bg-red-900/50 border-red-500/50'
          } transition-all duration-300`}>
            <CardContent className="p-4 text-center">
              <p className="text-lg font-semibold mb-2">
                {selectedAnswer === currentEmotion.emotion ? 
                  `🎉 ${tEm('correct')}` : `❌ ${tEm('incorrect')}`}
              </p>
              <p className="text-sm text-gray-300">
                {tEm('correctAnswer')}：{currentEmotion.emotion === 'joy' ? '喜悦' :
                           currentEmotion.emotion === 'sadness' ? '悲伤' :
                           currentEmotion.emotion === 'anger' ? '愤怒' :
                           currentEmotion.emotion === 'fear' ? '恐惧' :
                           currentEmotion.emotion === 'surprise' ? '惊讶' :
                           currentEmotion.emotion === 'disgust' ? '厌恶' : '平静'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // 渲染冥想训练
  const renderMeditationTraining = () => {
    if (!currentSession) return null;
    
    const currentPhaseData = currentSession.phases[currentPhase];
    const progress = currentSession ? 
      ((currentSession.duration - timeRemaining) / currentSession.duration) * 100 : 0;
    const phaseProgress = currentPhaseData ? 
      ((currentPhaseData.duration - phaseTimeRemaining) / currentPhaseData.duration) * 100 : 0;
    
    return (
      <div className="space-y-6">
        {/* 冥想会话信息 */}
        <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white mb-2">
              {currentSession.name}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {currentSession.culturalOrigin === 'taichi' ? tEm('culturalOrigins.taichi') : tEm('culturalOrigins.zen')}
            </CardDescription>
          </CardHeader>
        </Card>
        
        {/* 当前阶段 */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Mountain className="w-5 h-5 text-blue-400" />
              {currentPhaseData.name}
            </CardTitle>
            <Progress value={phaseProgress} className="w-full" />
            <p className="text-sm text-gray-300">
              阶段剩余时间: {formatTime(phaseTimeRemaining)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">{currentPhaseData.instruction}</p>
            
            {/* 呼吸模式 */}
            {currentPhaseData.breathingPattern && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  {tEm('breathing.rhythm')}
                </h4>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-green-400 font-semibold">{currentPhaseData.breathingPattern.inhale}s</div>
                    <div className="text-gray-400">{tEm('breathing.inhale')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-semibold">{currentPhaseData.breathingPattern.hold}s</div>
                    <div className="text-gray-400">{tEm('breathing.hold')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-semibold">{currentPhaseData.breathingPattern.exhale}s</div>
                    <div className="text-gray-400">{tEm('breathing.exhale')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-semibold">{currentPhaseData.breathingPattern.pause}s</div>
                    <div className="text-gray-400">{tEm('breathing.pause')}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 观想引导 */}
            {currentPhaseData.visualization && (
              <div className="bg-purple-900/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {tEm('visualization')}
                </h4>
                <p className="text-sm text-gray-300 italic">{currentPhaseData.visualization}</p>
              </div>
            )}
            
            {/* 真言 */}
            {currentPhaseData.mantra && (
              <div className="bg-yellow-900/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  {tEm('mantra')}
                </h4>
                <p className="text-sm text-gray-300 text-center font-medium">{currentPhaseData.mantra}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 整体进度 */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">整体进度</span>
              <span className="text-sm text-gray-300">{formatTime(timeRemaining)} 剩余</span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* 星空背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/10 to-transparent"></div>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🧘‍♀️ {tEm('title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {tEm('description')}
          </p>
        </div>
        
        {trainingState === TrainingState.IDLE && (
          <div className="space-y-6">
            {/* 训练模块选择 */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-400" />
                  {tEm('selectModule')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      type: ModuleType.EMOTION_RECOGNITION,
                      name: tEm('modules.emotionRecognition'),
                      description: tEm('descriptions.emotionRecognition'),
                      icon: <Heart className="w-6 h-6" />,
                      color: 'from-pink-500 to-rose-500'
                    },
                    {
                      type: ModuleType.STRESS_RELIEF,
                      name: tEm('modules.stressRelief'),
                      description: tEm('descriptions.stressRelief'),
                      icon: <Wind className="w-6 h-6" />,
                      color: 'from-blue-500 to-cyan-500'
                    },
                    {
                      type: ModuleType.EMOTION_REGULATION,
                      name: tEm('modules.emotionRegulation'),
                      description: tEm('descriptions.emotionRegulation'),
                      icon: <Target className="w-6 h-6" />,
                      color: 'from-green-500 to-emerald-500'
                    },
                    {
                      type: ModuleType.SOCIAL_EQ,
                      name: tEm('modules.socialEQ'),
                      description: tEm('descriptions.socialEQ'),
                      icon: <Users className="w-6 h-6" />,
                      color: 'from-orange-500 to-amber-500'
                    },
                    {
                      type: ModuleType.TAICHI_MINDFULNESS,
                      name: tEm('modules.taichiMindfulness'),
                      description: tEm('descriptions.taichiMindfulness'),
                      icon: <Leaf className="w-6 h-6" />,
                      color: 'from-emerald-500 to-teal-500'
                    },
                    {
                      type: ModuleType.ZEN_MEDITATION,
                      name: tEm('modules.zenFocus'),
                      description: tEm('descriptions.zenFocus'),
                      icon: <Mountain className="w-6 h-6" />,
                      color: 'from-indigo-500 to-purple-500'
                    }
                  ].map((module) => (
                    <Card
                      key={module.type}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                        currentModule === module.type
                          ? 'bg-gradient-to-br ' + module.color + ' border-white/50'
                          : 'bg-white/10 border-white/20 hover:bg-white/20'
                      }`}
                      onClick={() => {
                        setCurrentModule(module.type);
                        setConfig(prev => ({ ...prev, moduleType: module.type }));
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex justify-center mb-3 text-white">
                          {module.icon}
                        </div>
                        <h3 className="font-semibold text-white mb-2">{module.name}</h3>
                        <p className="text-sm text-gray-300">{module.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* 训练配置 */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-6 h-6 text-blue-400" />
                  {tEm('trainingSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {tEm('trainingDuration')}
                    </label>
                    <select
                      value={config.duration}
                      onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      <option value={300}>{tEm('durations.5min')}</option>
                      <option value={600}>{tEm('durations.10min')}</option>
                      <option value={900}>{tEm('durations.15min')}</option>
                      <option value={1200}>{tEm('durations.20min')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {tEm('difficultyLevel')}
                    </label>
                    <select
                      value={config.difficulty}
                      onChange={(e) => setConfig(prev => ({ ...prev, difficulty: e.target.value as any }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="beginner">{tEm('difficulty.beginner')}</option>
                      <option value="intermediate">{tEm('difficulty.intermediate')}</option>
                      <option value="advanced">{tEm('difficulty.advanced')}</option>
                      <option value="master">{tEm('difficulty.master')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={config.culturalElements}
                      onChange={(e) => setConfig(prev => ({ ...prev, culturalElements: e.target.checked }))}
                      className="rounded"
                    />
                    <span>{tEm('culturalElements')}</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={config.adaptiveDifficulty}
                      onChange={(e) => setConfig(prev => ({ ...prev, adaptiveDifficulty: e.target.checked }))}
                      className="rounded"
                    />
                    <span>{tEm('adaptiveDifficulty')}</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={config.feedbackEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, feedbackEnabled: e.target.checked }))}
                      className="rounded"
                    />
                    <span>{tEm('instantFeedback')}</span>
                  </label>
                </div>
              </CardContent>
            </Card>
            
            {/* 开始训练按钮 */}
            <div className="text-center">
              <Button
                onClick={handleStartTraining}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                {tEm('startTraining')}
              </Button>
            </div>
          </div>
        )}
        
        {(trainingState === TrainingState.TRAINING || trainingState === TrainingState.PAUSED) && (
          <div className="space-y-6">
            {/* 训练控制栏 */}
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                      {currentModule === ModuleType.EMOTION_RECOGNITION ? '情绪识别' :
                       currentModule === ModuleType.TAICHI_MINDFULNESS ? '太极心境' :
                       currentModule === ModuleType.ZEN_MEDITATION ? '禅修专注' : '情绪训练'}
                    </Badge>
                    <span className="text-white font-mono text-lg">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handlePauseResume}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {trainingState === TrainingState.PAUSED ? 
                        <Play className="w-4 h-4" /> : 
                        <Pause className="w-4 h-4" />
                      }
                    </Button>
                    <Button
                      onClick={handleStopTraining}
                      variant="outline"
                      size="sm"
                      className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                    >
                      完成训练
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 训练内容区域 */}
            {trainingState === TrainingState.PAUSED ? (
              <Card className="bg-yellow-900/30 border-yellow-500/50">
                <CardContent className="p-8 text-center">
                  <Pause className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">{tEm('trainingPaused')}</h3>
                  <p className="text-gray-300">{tEm('clickContinue')}</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {currentModule === ModuleType.EMOTION_RECOGNITION && renderEmotionRecognition()}
                {(currentModule === ModuleType.TAICHI_MINDFULNESS || currentModule === ModuleType.ZEN_MEDITATION) && renderMeditationTraining()}
              </div>
            )}
            
            {/* 实时统计 */}
            {currentModule === ModuleType.EMOTION_RECOGNITION && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    {tEm('realTimeStats')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {stats.accuracy.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">{tEm('accuracy')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {stats.averageResponseTime.toFixed(0)}ms
                      </div>
                      <div className="text-sm text-gray-400">{tEm('averageResponseTime')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {stats.streak}
                      </div>
                      <div className="text-sm text-gray-400">{tEm('currentStreak')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {stats.totalQuestions}
                      </div>
                      <div className="text-sm text-gray-400">{tEm('totalQuestions')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {trainingState === TrainingState.COMPLETED && (
          <div className="space-y-6">
            {/* 训练完成 */}
            <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/50">
              <CardHeader className="text-center">
                <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <CardTitle className="text-3xl text-white mb-2">
                  🎉 {tEm('trainingCompleted')}
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  {tEm('congratulations')}
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* 训练结果 */}
            {currentModule === ModuleType.EMOTION_RECOGNITION && (
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                    {tEm('trainingResults')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">{tEm('finalAccuracy')}</span>
                        <span className="text-2xl font-bold text-green-400">
                          {stats.accuracy.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">{tEm('averageResponseTime')}</span>
                        <span className="text-xl font-semibold text-blue-400">
                          {stats.averageResponseTime.toFixed(0)}ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">{tEm('bestStreak')}</span>
                        <span className="text-xl font-semibold text-purple-400">
                          {stats.bestStreak}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">{tEm('totalQuestions')}</span>
                        <span className="text-xl font-semibold text-yellow-400">
                          {stats.totalQuestions}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-3">{tEm('emotionAccuracyBreakdown')}</h4>
                      <div className="space-y-2">
                        {Object.entries(stats.emotionAccuracy).map(([emotion, accuracy]) => (
                          <div key={emotion} className="flex justify-between items-center">
                            <span className="text-gray-300 capitalize">
                              {emotion === 'joy' ? tEm('emotions.joy') :
                               emotion === 'sadness' ? tEm('emotions.sadness') :
                               emotion === 'anger' ? tEm('emotions.anger') :
                               emotion === 'fear' ? tEm('emotions.fear') :
                               emotion === 'surprise' ? tEm('emotions.surprise') :
                               emotion === 'disgust' ? tEm('emotions.disgust') : tEm('emotions.neutral')}
                            </span>
                            <span className="text-sm font-medium text-blue-300">
                              {accuracy.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 重新开始按钮 */}
            <div className="text-center">
              <Button
                onClick={handleResetTraining}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {tEm('restartTraining')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}