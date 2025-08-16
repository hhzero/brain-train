'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Play, Pause, RotateCcw, Settings, Timer, Trophy, Target, 
  Shuffle, Circle, Square, Triangle, Briefcase, GraduationCap, 
  Home, Zap, Star, Award, TrendingUp, Users, Clock, CheckCircle,
  AlertCircle, ArrowRight, BookOpen, Coffee, Car, Phone, Mail,
  Calendar, FileText, Presentation, Calculator, Globe, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

// 训练状态枚举
enum TrainingState {
  IDLE = 'idle',
  PREPARING = 'preparing',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

// 任务类型枚举
enum TaskType {
  TASK_SWITCHING = 'task_switching',
  STROOP_TEST = 'stroop_test',
  WORKING_MEMORY_UPDATE = 'working_memory_update',
  WORKPLACE_SIMULATION = 'workplace_simulation',
  LEARNING_SCENARIO = 'learning_scenario',
  LIFE_SITUATION = 'life_situation'
}

// 情境类型枚举
enum ScenarioType {
  WORKPLACE = 'workplace',
  ACADEMIC = 'academic',
  DAILY_LIFE = 'daily_life',
  EMERGENCY = 'emergency',
  SOCIAL = 'social'
}

// 刺激类型
type StimulusType = 'color' | 'shape' | 'text' | 'number' | 'scenario';

// 训练会话统计
interface SessionStats {
  totalAnswers: number;
  correctAnswers: number;
  totalReactionTime: number;
  bestStreak: number;
  currentStreak: number;
  taskTypeStats: Record<TaskType, {
    attempts: number;
    correct: number;
    totalTime: number;
  }>;
  scenarioStats: Record<ScenarioType, {
    attempts: number;
    correct: number;
    averageTime: number;
  }>;
}

// 训练配置
interface TrainingConfig {
  duration: number;
  difficulty: number;
  taskTypes: TaskType[];
  scenarioTypes: ScenarioType[];
  stimulusInterval: number;
  feedbackEnabled: boolean;
  adaptiveDifficulty: boolean;
  progressiveChallenge: boolean;
  contextualLearning: boolean;
}

// 认知刺激
interface CognitiveStimulus {
  id: string;
  taskType: TaskType;
  scenarioType?: ScenarioType;
  content: string;
  context?: string;
  options: string[];
  correctResponse: string;
  color?: string;
  shape?: string;
  difficulty: number;
  timeLimit?: number;
  hints?: string[];
  culturalContext?: string;
}

// 情境数据
interface ScenarioData {
  id: string;
  type: ScenarioType;
  title: string;
  description: string;
  context: string;
  challenges: {
    id: string;
    situation: string;
    options: {
      text: string;
      type: 'optimal' | 'good' | 'poor';
      explanation: string;
      cognitiveSkill: string;
    }[];
    timeLimit: number;
    difficulty: number;
  }[];
  icon: React.ReactNode;
  bgColor: string;
}

// 默认配置
const DEFAULT_CONFIG: TrainingConfig = {
  duration: 300,
  difficulty: 5,
  taskTypes: [TaskType.TASK_SWITCHING, TaskType.WORKPLACE_SIMULATION, TaskType.LEARNING_SCENARIO],
  scenarioTypes: [ScenarioType.WORKPLACE, ScenarioType.ACADEMIC, ScenarioType.DAILY_LIFE],
  stimulusInterval: 2000,
  feedbackEnabled: true,
  adaptiveDifficulty: true,
  progressiveChallenge: true,
  contextualLearning: true
};

// 颜色映射
const COLOR_NAMES: Record<string, string> = {
  '#ef4444': 'red',
  '#3b82f6': 'blue',
  '#22c55e': 'green',
  '#f59e0b': 'yellow',
  '#8b5cf6': 'purple',
  '#ec4899': 'pink'
};

// 形状映射
const SHAPE_NAMES: Record<string, string> = {
  'circle': 'circle',
  'square': 'square',
  'triangle': 'triangle'
};

// 情境数据
const SCENARIO_DATA: ScenarioData[] = [
  {
    id: 'workplace-multitask',
    type: ScenarioType.WORKPLACE,
    title: 'workplace-multitask',
    description: 'workplace-multitask-desc',
    context: 'workplace-multitask-context',
    icon: <Briefcase className="w-6 h-6" />,
    bgColor: 'from-blue-500/20 to-indigo-500/20',
    challenges: [
      {
        id: 'email-meeting-conflict',
        situation: 'email-meeting-conflict-situation',
        options: [
          {
            text: 'email-meeting-conflict-option1',
            type: 'poor',
            explanation: 'email-meeting-conflict-explanation1',
            cognitiveSkill: 'task-switching'
          },
          {
            text: 'email-meeting-conflict-option2',
            type: 'optimal',
            explanation: 'email-meeting-conflict-explanation2',
            cognitiveSkill: 'executive-control'
          },
          {
            text: 'email-meeting-conflict-option3',
            type: 'good',
            explanation: 'email-meeting-conflict-explanation3',
            cognitiveSkill: 'inhibitory-control'
          }
        ],
        timeLimit: 8000,
        difficulty: 6
      }
    ]
  },
  {
    id: 'academic-study',
    type: ScenarioType.ACADEMIC,
    title: 'academic-study',
    description: 'academic-study-desc',
    context: 'academic-study-context',
    icon: <GraduationCap className="w-6 h-6" />,
    bgColor: 'from-green-500/20 to-emerald-500/20',
    challenges: [
      {
        id: 'study-method-switch',
        situation: 'study-method-switch-situation',
        options: [
          {
            text: 'study-method-switch-option1',
            type: 'optimal',
            explanation: 'study-method-switch-explanation1',
            cognitiveSkill: 'cognitive-switching'
          },
          {
            text: 'study-method-switch-option2',
            type: 'poor',
            explanation: 'study-method-switch-explanation2',
            cognitiveSkill: 'metacognition'
          },
          {
            text: 'study-method-switch-option3',
            type: 'good',
            explanation: 'study-method-switch-explanation3',
            cognitiveSkill: 'attention'
          }
        ],
        timeLimit: 10000,
        difficulty: 5
      }
    ]
  },
  {
    id: 'daily-life-adaptation',
    type: ScenarioType.DAILY_LIFE,
    title: 'daily-life-adaptation',
    description: 'daily-life-adaptation-desc',
    context: 'daily-life-adaptation-context',
    icon: <Home className="w-6 h-6" />,
    bgColor: 'from-orange-500/20 to-red-500/20',
    challenges: [
      {
        id: 'traffic-jam-solution',
        situation: 'traffic-jam-solution-situation',
        options: [
          {
            text: 'traffic-jam-solution-option1',
            type: 'optimal',
            explanation: 'traffic-jam-solution-explanation1',
            cognitiveSkill: 'flexible-thinking'
          },
          {
            text: 'traffic-jam-solution-option2',
            type: 'poor',
            explanation: 'traffic-jam-solution-explanation2',
            cognitiveSkill: 'decision-making'
          },
          {
            text: 'traffic-jam-solution-option3',
            type: 'poor',
            explanation: 'traffic-jam-solution-explanation3',
            cognitiveSkill: 'emotion-regulation'
          }
        ],
        timeLimit: 7000,
        difficulty: 4
      }
    ]
  }
];

export default function CognitiveFlexibilityTraining() {
  const t = useTranslations('cognitiveFlexibility');
  
  // 状态管理
  const [state, setState] = useState<TrainingState>(TrainingState.IDLE);
  const [config, setConfig] = useState<TrainingConfig>(DEFAULT_CONFIG);
  const [currentStimulus, setCurrentStimulus] = useState<CognitiveStimulus | null>(null);
  const [currentScenario, setCurrentScenario] = useState<ScenarioData | null>(null);
  const [currentTask, setCurrentTask] = useState<TaskType | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalAnswers: 0,
    correctAnswers: 0,
    totalReactionTime: 0,
    bestStreak: 0,
    currentStreak: 0,
    taskTypeStats: {} as Record<TaskType, any>,
    scenarioStats: {} as Record<ScenarioType, any>
  });
  const [showSettings, setShowSettings] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | null; message: string }>({ type: null, message: '' });
  const [challengeLevel, setChallengeLevel] = useState(1);
  const [achievements, setAchievements] = useState<string[]>([]);
  
  // 实时统计
  const [liveStats, setLiveStats] = useState({
    timeElapsed: 0,
    timeRemaining: config.duration,
    currentScore: 0,
    currentAccuracy: 0,
    averageReactionTime: 0,
    totalAnswers: 0,
    bestStreak: 0,
    challengeProgress: 0
  });

  // 引用
  const startTimeRef = useRef<number>(0);
  const stimulusStartTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 计算状态
  const isTraining = state === TrainingState.ACTIVE || state === TrainingState.PAUSED;
  const isActive = state === TrainingState.ACTIVE;
  const isPaused = state === TrainingState.PAUSED;
  const isCompleted = state === TrainingState.COMPLETED;
  const canStart = state === TrainingState.IDLE;
  const canPause = state === TrainingState.ACTIVE;
  const canResume = state === TrainingState.PAUSED;

  // 生成认知刺激
  const generateStimulus = useCallback((): CognitiveStimulus => {
    const taskType = config.taskTypes[Math.floor(Math.random() * config.taskTypes.length)];
    const difficulty = config.adaptiveDifficulty 
      ? Math.max(1, Math.min(10, config.difficulty + (sessionStats.currentStreak > 5 ? 1 : sessionStats.currentStreak < -3 ? -1 : 0)))
      : config.difficulty;

    switch (taskType) {
      case TaskType.WORKPLACE_SIMULATION:
        return generateWorkplaceStimulus(difficulty);
      case TaskType.LEARNING_SCENARIO:
        return generateLearningStimulus(difficulty);
      case TaskType.LIFE_SITUATION:
        return generateLifeStimulus(difficulty);
      case TaskType.TASK_SWITCHING:
        return generateTaskSwitchingStimulus(difficulty);
      case TaskType.STROOP_TEST:
        return generateStroopStimulus(difficulty);
      case TaskType.WORKING_MEMORY_UPDATE:
        return generateWorkingMemoryStimulus(difficulty);
      default:
        return generateTaskSwitchingStimulus(difficulty);
    }
  }, [config, sessionStats.currentStreak]);

  // 生成职场模拟刺激
  const generateWorkplaceStimulus = (difficulty: number): CognitiveStimulus => {
    const scenarios = [
      {
        content: t('workplace.customerComplaint'),
        context: t('workplaceStimuli.customerComplaint.context'),
        options: t('workplaceStimuli.customerComplaint.options').split(','),
        correct: t('workplaceStimuli.customerComplaint.correct')
      },
      {
        content: t('workplace.meetingConflict'),
        context: t('workplaceStimuli.meetingConflict.context'),
        options: t('workplaceStimuli.meetingConflict.options').split(','),
        correct: t('workplaceStimuli.meetingConflict.correct')
      }
    ];
    
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    return {
      id: `workplace-${Date.now()}`,
      taskType: TaskType.WORKPLACE_SIMULATION,
      scenarioType: ScenarioType.WORKPLACE,
      content: scenario.content,
      context: scenario.context,
      options: scenario.options,
      correctResponse: scenario.correct,
      difficulty,
      timeLimit: Math.max(3000, 8000 - difficulty * 500)
    };
  };

  // 生成学习场景刺激
  const generateLearningStimulus = (difficulty: number): CognitiveStimulus => {
    const scenarios = [
      {
        content: t('learning.studyMethod'),
        context: t('learningStimuli.studyMethod.context'),
        options: t('learningStimuli.studyMethod.options').split(','),
        correct: t('learningStimuli.studyMethod.correct')
      },
      {
        content: t('learning.timeManagement'),
        context: t('learningStimuli.timeManagement.context'),
        options: t('learningStimuli.timeManagement.options').split(','),
        correct: t('learningStimuli.timeManagement.correct')
      }
    ];
    
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    return {
      id: `learning-${Date.now()}`,
      taskType: TaskType.LEARNING_SCENARIO,
      scenarioType: ScenarioType.ACADEMIC,
      content: scenario.content,
      context: scenario.context,
      options: scenario.options,
      correctResponse: scenario.correct,
      difficulty,
      timeLimit: Math.max(4000, 10000 - difficulty * 600)
    };
  };

  // 生成生活情境刺激
  const generateLifeStimulus = (difficulty: number): CognitiveStimulus => {
    const scenarios = [
      {
        content: t('life.familyConflict'),
        context: t('lifeStimuli.familyConflict.context'),
        options: t('lifeStimuli.familyConflict.options').split(','),
        correct: t('lifeStimuli.familyConflict.correct')
      },
      {
        content: t('life.socialPressure'),
        context: t('lifeStimuli.socialPressure.context'),
        options: t('lifeStimuli.socialPressure.options').split(','),
        correct: t('lifeStimuli.socialPressure.correct')
      }
    ];
    
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    return {
      id: `life-${Date.now()}`,
      taskType: TaskType.LIFE_SITUATION,
      scenarioType: ScenarioType.DAILY_LIFE,
      content: scenario.content,
      context: scenario.context,
      options: scenario.options,
      correctResponse: scenario.correct,
      difficulty,
      timeLimit: Math.max(3000, 7000 - difficulty * 400)
    };
  };

  // 生成任务切换刺激
  const generateTaskSwitchingStimulus = (difficulty: number): CognitiveStimulus => {
    const colors = Object.keys(COLOR_NAMES);
    const shapes = Object.keys(SHAPE_NAMES);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const task = Math.random() > 0.5 ? 'color' : 'shape';
    
    return {
      id: `task-switch-${Date.now()}`,
      taskType: TaskType.TASK_SWITCHING,
      content: task === 'color' ? t('taskSwitching.judgeColor') : t('taskSwitching.judgeShape'),
      options: task === 'color' ? [t('colors.red'), t('colors.blue'), t('colors.green'), t('colors.yellow')] : [t('shapes.circle'), t('shapes.square'), t('shapes.triangle'), t('shapes.diamond')],
      correctResponse: task === 'color' ? t(`colors.${COLOR_NAMES[color]}`) : t(`shapes.${SHAPE_NAMES[shape]}`),
      color,
      shape,
      difficulty,
      timeLimit: Math.max(1500, 3000 - difficulty * 150)
    };
  };

  // 生成Stroop测试刺激
  const generateStroopStimulus = (difficulty: number): CognitiveStimulus => {
    const colors = Object.keys(COLOR_NAMES);
    const colorNames = Object.values(COLOR_NAMES);
    const displayColor = colors[Math.floor(Math.random() * colors.length)];
    const textContent = colorNames[Math.floor(Math.random() * colorNames.length)];
    
    return {
      id: `stroop-${Date.now()}`,
      taskType: TaskType.STROOP_TEST,
      content: textContent,
      options: colorNames,
      correctResponse: COLOR_NAMES[displayColor],
      color: displayColor,
      difficulty,
      timeLimit: Math.max(1000, 2500 - difficulty * 150)
    };
  };

  // 生成工作记忆刺激
  const generateWorkingMemoryStimulus = (difficulty: number): CognitiveStimulus => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const sequenceLength = Math.min(8, Math.max(3, 3 + Math.floor(difficulty / 2)));
    const sequence = Array.from({ length: sequenceLength }, () => 
      letters[Math.floor(Math.random() * letters.length)]
    ).join(' ');
    
    return {
      id: `working-memory-${Date.now()}`,
      taskType: TaskType.WORKING_MEMORY_UPDATE,
      content: sequence,
      options: letters,
      correctResponse: sequence.split(' ').pop() || 'A',
      difficulty,
      timeLimit: Math.max(2000, 5000 - difficulty * 200)
    };
  };

  // 处理用户响应
  const handleResponse = useCallback((response: string) => {
    if (!currentStimulus || !isActive) return;

    const reactionTime = Date.now() - stimulusStartTimeRef.current;
    const isCorrect = response === currentStimulus.correctResponse;
    
    // 更新统计
    setSessionStats(prev => {
      const newStats = {
        ...prev,
        totalAnswers: prev.totalAnswers + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        totalReactionTime: prev.totalReactionTime + reactionTime,
        currentStreak: isCorrect ? prev.currentStreak + 1 : 0,
        bestStreak: Math.max(prev.bestStreak, isCorrect ? prev.currentStreak + 1 : 0)
      };
      
      // 更新任务类型统计
      const taskType = currentStimulus.taskType;
      if (!newStats.taskTypeStats[taskType]) {
        newStats.taskTypeStats[taskType] = { attempts: 0, correct: 0, totalTime: 0 };
      }
      newStats.taskTypeStats[taskType].attempts++;
      if (isCorrect) newStats.taskTypeStats[taskType].correct++;
      newStats.taskTypeStats[taskType].totalTime += reactionTime;
      
      return newStats;
    });

    // 显示反馈
    if (config.feedbackEnabled) {
      setFeedback({
        type: isCorrect ? 'correct' : 'incorrect',
        message: isCorrect ? t('feedback.correct') : t('feedback.incorrect')
      });
      setTimeout(() => setFeedback({ type: null, message: '' }), 1000);
    }

    // 检查成就
    checkAchievements(sessionStats, isCorrect);

    // 生成下一个刺激
    setTimeout(() => {
      if (state === TrainingState.ACTIVE) {
        const nextStimulus = generateStimulus();
        setCurrentStimulus(nextStimulus);
        setCurrentTask(nextStimulus.taskType);
        stimulusStartTimeRef.current = Date.now();
      }
    }, config.stimulusInterval);
  }, [currentStimulus, isActive, config, sessionStats, state, generateStimulus]);

  // 检查成就
  const checkAchievements = (stats: SessionStats, isCorrect: boolean) => {
    const newAchievements: string[] = [];
    
    if (stats.currentStreak >= 10 && !achievements.includes('streak-10')) {
      newAchievements.push('streak-10');
      toast.success(t('achievements.streak10'));
    }
    
    if (stats.totalAnswers >= 50 && !achievements.includes('answers-50')) {
      newAchievements.push('answers-50');
      toast.success(t('achievements.answers50'));
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  // 开始训练
  const handleStartTraining = () => {
    setState(TrainingState.PREPARING);
    setSessionStats({
      totalAnswers: 0,
      correctAnswers: 0,
      totalReactionTime: 0,
      bestStreak: 0,
      currentStreak: 0,
      taskTypeStats: {} as Record<TaskType, any>,
      scenarioStats: {} as Record<ScenarioType, any>
    });
    
    setTimeout(() => {
      setState(TrainingState.ACTIVE);
      startTimeRef.current = Date.now();
      const firstStimulus = generateStimulus();
      setCurrentStimulus(firstStimulus);
      setCurrentTask(firstStimulus.taskType);
      stimulusStartTimeRef.current = Date.now();
    }, 3000);
  };

  // 暂停/继续训练
  const handlePauseResume = () => {
    if (isPaused) {
      setState(TrainingState.ACTIVE);
      stimulusStartTimeRef.current = Date.now();
    } else {
      setState(TrainingState.PAUSED);
    }
  };

  // 停止训练
  const handleStopTraining = () => {
    setState(TrainingState.COMPLETED);
    setCurrentStimulus(null);
    setCurrentTask(null);
  };

  // 放弃训练
  const handleAbandonTraining = () => {
    setState(TrainingState.IDLE);
    setCurrentStimulus(null);
    setCurrentTask(null);
    setSessionStats({
      totalAnswers: 0,
      correctAnswers: 0,
      totalReactionTime: 0,
      bestStreak: 0,
      currentStreak: 0,
      taskTypeStats: {} as Record<TaskType, any>,
      scenarioStats: {} as Record<ScenarioType, any>
    });
  };

  // 重置会话
  const resetSession = () => {
    setState(TrainingState.IDLE);
    setCurrentStimulus(null);
    setCurrentTask(null);
    setLiveStats({
      timeElapsed: 0,
      timeRemaining: config.duration,
      currentScore: 0,
      currentAccuracy: 0,
      averageReactionTime: 0,
      totalAnswers: 0,
      bestStreak: 0,
      challengeProgress: 0
    });
  };

  // 定时器效果
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, config.duration - elapsed);
        
        setLiveStats(prev => ({
          ...prev,
          timeElapsed: elapsed,
          timeRemaining: remaining,
          currentScore: sessionStats.correctAnswers * 10 + sessionStats.bestStreak * 5,
          currentAccuracy: sessionStats.totalAnswers > 0 ? (sessionStats.correctAnswers / sessionStats.totalAnswers) * 100 : 0,
          averageReactionTime: sessionStats.totalAnswers > 0 ? sessionStats.totalReactionTime / sessionStats.totalAnswers : 0,
          totalAnswers: sessionStats.totalAnswers,
          bestStreak: sessionStats.bestStreak,
          challengeProgress: (elapsed / config.duration) * 100
        }));
        
        if (remaining <= 0) {
          handleStopTraining();
        }
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, config.duration, sessionStats]);

  // 渲染当前刺激
  const renderCurrentStimulus = () => {
    if (!currentStimulus) return null;

    switch (currentStimulus.taskType) {
      case TaskType.WORKPLACE_SIMULATION:
      case TaskType.LEARNING_SCENARIO:
      case TaskType.LIFE_SITUATION:
        return (
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                {currentStimulus.taskType === TaskType.WORKPLACE_SIMULATION && <Briefcase className="w-6 h-6 text-blue-400" />}
                {currentStimulus.taskType === TaskType.LEARNING_SCENARIO && <GraduationCap className="w-6 h-6 text-green-400" />}
                {currentStimulus.taskType === TaskType.LIFE_SITUATION && <Home className="w-6 h-6 text-orange-400" />}
                <h3 className="text-xl font-bold text-white">
                  {currentStimulus.taskType === TaskType.WORKPLACE_SIMULATION && t('scenarios.workplace')}
                  {currentStimulus.taskType === TaskType.LEARNING_SCENARIO && t('scenarios.learning')}
                  {currentStimulus.taskType === TaskType.LIFE_SITUATION && t('scenarios.life')}
                </h3>
              </div>
              <div className="text-lg text-gray-300 mb-2">{currentStimulus.content}</div>
              {currentStimulus.context && (
                <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                  {currentStimulus.context}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {currentStimulus.options.map((option, index) => (
                <Button
                  key={option}
                  onClick={() => handleResponse(option)}
                  className="bg-gray-700 hover:bg-gray-600 text-left p-4 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </div>
                </Button>
              ))}
            </div>
            {currentStimulus.timeLimit && (
              <div className="mt-4 text-sm text-gray-400">
                ⏱️ {t('suggestedTime')}: {(currentStimulus.timeLimit / 1000).toFixed(1)}{t('seconds')}
              </div>
            )}
          </div>
        );
      
      case TaskType.TASK_SWITCHING:
        return (
          <div className="text-center">
            <div className="text-lg text-gray-300 mb-4">{currentStimulus.content}</div>
            <motion.div
              className="w-24 h-24 mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: currentStimulus.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentStimulus.shape === 'circle' && <Circle className="w-16 h-16 text-white" />}
              {currentStimulus.shape === 'square' && <Square className="w-16 h-16 text-white" />}
              {currentStimulus.shape === 'triangle' && <Triangle className="w-16 h-16 text-white" />}
            </motion.div>
            <div className="grid grid-cols-3 gap-2">
              {currentStimulus.options.map(option => (
                <Button
                  key={option}
                  onClick={() => handleResponse(option)}
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );
      
      case TaskType.STROOP_TEST:
        return (
          <div className="text-center">
            <div className="text-lg text-gray-300 mb-4">{t('taskInstructions.stroopTest')}</div>
            <motion.div
              className="text-6xl font-bold mb-6"
              style={{ color: currentStimulus.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentStimulus.content}
            </motion.div>
            <div className="grid grid-cols-3 gap-2">
              {currentStimulus.options.map(option => (
                <Button
                  key={option}
                  onClick={() => handleResponse(option)}
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );
      
      case TaskType.WORKING_MEMORY_UPDATE:
        return (
          <div className="text-center">
            <div className="text-lg text-gray-300 mb-4">{t('taskInstructions.workingMemoryUpdate')}</div>
            <motion.div
              className="text-4xl font-mono text-white mb-6 tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {currentStimulus.content}
            </motion.div>
            <div className="grid grid-cols-4 gap-2">
              {currentStimulus.options.map(letter => (
                <Button
                  key={letter}
                  onClick={() => handleResponse(letter)}
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  {letter}
                </Button>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Shuffle className="w-10 h-10 text-blue-400" />
            {t('title')}
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            {t('description')}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Star className="w-4 h-4 text-yellow-400" />
              {t('challengeLevel')} {challengeLevel}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Award className="w-4 h-4 text-purple-400" />
              {t('achievements')} {achievements.length}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主训练区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 训练控制面板 */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  {t('trainingControl.title')}
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
                        {t('trainingControl.startTraining')}
                      </Button>
                    ) : state === TrainingState.PREPARING ? (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-400 mb-2">{t('trainingControl.preparing')}</div>
                        <div className="text-sm text-gray-400">{t('trainingControl.prepareMessage')}</div>
                      </div>
                    ) : (
                      <>
                        {canPause && (
                          <Button
                            onClick={handlePauseResume}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            {t('trainingControl.pause')}
                          </Button>
                        )}
                        {canResume && (
                          <Button
                            onClick={handlePauseResume}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {t('trainingControl.continue')}
                          </Button>
                        )}
                        <Button
                          onClick={handleStopTraining}
                          variant="destructive"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          {t('trainingControl.complete')}
                        </Button>
                        <Button
                          onClick={handleAbandonTraining}
                          variant="ghost"
                        >
                          {t('trainingControl.abandon')}
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => setShowSettings(!showSettings)}
                      variant="outline"
                      className="border-gray-600"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {t('trainingControl.settings')}
                    </Button>
                  </div>
                  
                  {/* 时间显示 */}
                  <div className="flex items-center gap-2 text-white">
                    <Timer className="w-5 h-5 text-blue-400" />
                    <span className="text-xl font-mono">
                      {liveStats.timeRemaining 
                        ? `${Math.floor(liveStats.timeRemaining / 60)}:${(liveStats.timeRemaining % 60).toString().padStart(2, '0')}`
                        : `${Math.floor(liveStats.timeElapsed / 60)}:${(liveStats.timeElapsed % 60).toString().padStart(2, '0')}`
                      }
                    </span>
                  </div>
                </div>
                
                {/* 进度条 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{t('progress.sessionProgress')}</span>
                    <span className="text-sm text-white">{((liveStats.timeElapsed / config.duration) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={(liveStats.timeElapsed / config.duration) * 100}
                    className="h-2"
                  />
                </div>
                
                {/* 当前任务类型 */}
                {isActive && currentTask && (
                  <div className="text-center text-gray-300">
                    {t('currentTask')}
                    {currentTask === TaskType.TASK_SWITCHING && t('taskTypes.taskSwitching')}
                    {currentTask === TaskType.STROOP_TEST && t('taskTypes.stroopTest')}
                    {currentTask === TaskType.WORKING_MEMORY_UPDATE && t('taskTypes.workingMemoryUpdate')}
                    {currentTask === TaskType.WORKPLACE_SIMULATION && t('taskTypes.workplaceSimulation')}
                    {currentTask === TaskType.LEARNING_SCENARIO && t('taskTypes.learningScenario')}
                    {currentTask === TaskType.LIFE_SITUATION && t('taskTypes.lifeSituation')}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 训练区域 */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8">
                <div className="relative min-h-96 flex items-center justify-center">
                  {!isActive && !isCompleted ? (
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">{t('title')}</h3>
                      <p className="text-gray-300 mb-4">{t('trainingArea.startMessage')}</p>
                      <div className="grid grid-cols-3 gap-4 mt-6 max-w-md mx-auto">
                        <div className="text-center p-3 bg-blue-500/20 rounded-lg">
                          <Briefcase className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          <div className="text-xs text-gray-300">{t('taskTypes.workplaceSimulation')}</div>
                        </div>
                        <div className="text-center p-3 bg-green-500/20 rounded-lg">
                          <GraduationCap className="w-6 h-6 text-green-400 mx-auto mb-2" />
                          <div className="text-xs text-gray-300">{t('taskTypes.learningScenario')}</div>
                        </div>
                        <div className="text-center p-3 bg-orange-500/20 rounded-lg">
                          <Home className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                          <div className="text-xs text-gray-300">{t('taskTypes.lifeSituation')}</div>
                        </div>
                      </div>
                    </motion.div>
                  ) : isCompleted ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30 w-full"
                    >
                      <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">{t('trainingComplete.title')}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-purple-400 font-semibold">{t('trainingComplete.finalScore')}</div>
                          <div className="text-white text-lg">{liveStats.currentScore}</div>
                        </div>
                        <div>
                          <div className="text-blue-400 font-semibold">{t('trainingComplete.accuracy')}</div>
                          <div className="text-white text-lg">{liveStats.currentAccuracy.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-green-400 font-semibold">{t('trainingComplete.bestStreak')}</div>
                          <div className="text-white text-lg">{liveStats.bestStreak}</div>
                        </div>
                        <div>
                          <div className="text-yellow-400 font-semibold">{t('trainingComplete.averageReactionTime')}</div>
                          <div className="text-white text-lg">{liveStats.averageReactionTime.toFixed(0)}ms</div>
                        </div>
                      </div>
                      <Button
                        onClick={resetSession}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        {t('trainingComplete.trainAgain')}
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="w-full">
                      {renderCurrentStimulus()}
                    </div>
                  )}
                  
                  {/* 反馈显示 */}
                  <AnimatePresence>
                    {feedback.type && (
                      <motion.div
                        className={`absolute top-4 right-4 px-4 py-2 rounded-lg ${
                          feedback.type === 'correct' ? 'bg-green-600' : 'bg-red-600'
                        } text-white font-bold`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        {feedback.message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
                  {t('trainingStats.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {liveStats.currentAccuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">{t('trainingStats.accuracy')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {liveStats.averageReactionTime.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-400">{t('trainingStats.averageReactionTime')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {liveStats.currentScore}
                    </div>
                    <div className="text-sm text-gray-400">{t('trainingStats.score')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      {liveStats.totalAnswers}
                    </div>
                    <div className="text-sm text-gray-400">{t('trainingStats.totalTrials')}</div>
                  </div>
                </div>
                
                {/* 挑战进度 */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{t('trainingStats.challengeProgress')}</span>
                    <span className="text-sm text-white">{liveStats.challengeProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${liveStats.challengeProgress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 成就展示 */}
            {achievements.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    {t('achievementBadges.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {achievements.map(achievement => (
                      <div key={achievement} className="flex items-center gap-2 p-2 bg-purple-500/20 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-white">
                          {achievement === 'streak-10' && t('achievementBadges.streakMaster')}
                          {achievement === 'answers-50' && t('achievementBadges.trainingExpert')}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                      {t('trainingSettings.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 训练时长 */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">{t('trainingSettings.duration')}</label>
                      <input
                        type="range"
                        min="60"
                        max="600"
                        value={config.duration}
                        onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full"
                        disabled={isActive}
                      />
                      <div className="text-center text-white mt-1">{config.duration}s</div>
                    </div>
                    
                    {/* 难度等级 */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">{t('trainingSettings.difficulty')}</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={config.difficulty}
                        onChange={(e) => setConfig(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                        className="w-full"
                        disabled={isTraining}
                      />
                      <div className="text-center text-white mt-1">{t('trainingSettings.level')} {config.difficulty}</div>
                    </div>
                    
                    {/* 训练类型选择 */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">{t('trainingSettings.trainingType')}</label>
                      <div className="space-y-2">
                        {[
                          { type: TaskType.WORKPLACE_SIMULATION, label: t('trainingArea.workplaceSimulation'), icon: <Briefcase className="w-4 h-4" /> },
                          { type: TaskType.LEARNING_SCENARIO, label: t('trainingArea.learningScenario'), icon: <GraduationCap className="w-4 h-4" /> },
                          { type: TaskType.LIFE_SITUATION, label: t('trainingArea.lifeSituation'), icon: <Home className="w-4 h-4" /> },
                          { type: TaskType.TASK_SWITCHING, label: t('taskTypes.taskSwitching'), icon: <Shuffle className="w-4 h-4" /> },
                          { type: TaskType.STROOP_TEST, label: t('taskTypes.stroopTest'), icon: <Target className="w-4 h-4" /> },
                          { type: TaskType.WORKING_MEMORY_UPDATE, label: t('taskTypes.workingMemoryUpdate'), icon: <Brain className="w-4 h-4" /> }
                        ].map(({ type, label, icon }) => (
                          <label key={type} className="flex items-center gap-2 text-white cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.taskTypes.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setConfig(prev => ({
                                    ...prev,
                                    taskTypes: [...prev.taskTypes, type]
                                  }));
                                } else {
                                  setConfig(prev => ({
                                    ...prev,
                                    taskTypes: prev.taskTypes.filter(t => t !== type)
                                  }));
                                }
                              }}
                              disabled={isTraining}
                              className="rounded"
                            />
                            {icon}
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* 其他设置 */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.feedbackEnabled}
                          onChange={(e) => setConfig(prev => ({ ...prev, feedbackEnabled: e.target.checked }))}
                          disabled={isTraining}
                          className="rounded"
                        />
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">{t('trainingSettings.enableFeedback')}</span>
                      </label>
                      
                      <label className="flex items-center gap-2 text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.adaptiveDifficulty}
                          onChange={(e) => setConfig(prev => ({ ...prev, adaptiveDifficulty: e.target.checked }))}
                          disabled={isTraining}
                          className="rounded"
                        />
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">{t('trainingSettings.adaptiveDifficulty')}</span>
                      </label>
                      
                      <label className="flex items-center gap-2 text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.progressiveChallenge}
                          onChange={(e) => setConfig(prev => ({ ...prev, progressiveChallenge: e.target.checked }))}
                          disabled={isTraining}
                          className="rounded"
                        />
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">{t('trainingSettings.progressiveChallenge')}</span>
                      </label>
                      
                      <label className="flex items-center gap-2 text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.contextualLearning}
                          onChange={(e) => setConfig(prev => ({ ...prev, contextualLearning: e.target.checked }))}
                          disabled={isTraining}
                          className="rounded"
                        />
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">{t('trainingSettings.contextualLearning')}</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}