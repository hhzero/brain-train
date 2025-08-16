'use client'

import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button'
import TouchOptimizedButton from '@/components/TouchOptimizedButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RotateCcw, Star, Trophy, Volume2, VolumeX, Brain, Zap, Database, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import StarfieldBackground from '@/components/StarfieldBackground'
import { LazyDataManagement, LazyTrainingHistory } from '@/components/LazyWrapper'
import { dataPersistence, TrainingSession } from '@/utils/DataPersistenceManager'
import { audioManager } from '@/utils/AudioManager'
import TrainingErrorBoundary from '@/components/TrainingErrorBoundary'
import { performanceMonitor } from '@/utils/PerformanceMonitor'
import { mobileOptimizer, MobileOptimizer } from '@/utils/MobileOptimizer'
import { useTranslations } from 'next-intl'

// 训练模式枚举
enum TrainingMode {
  TUTORIAL = 'tutorial',
  SINGLE_VISUAL = 'single_visual',
  SINGLE_AUDIO = 'single_audio',
  DUAL_NBACK = 'dual_nback'
}

// 游戏状态枚举
enum GameState {
  MENU = 'menu',
  TRAINING = 'training',
  PAUSED = 'paused',
  RESULTS = 'results',
  DATA_MANAGEMENT = 'data_management',
  TRAINING_HISTORY = 'training_history'
}

// 刺激类型
interface Stimulus {
  visual: number // 0-8 (3x3网格位置)
  audio: number // 0-7 (8种不同音调)
  timestamp: number
}

// 用户响应
interface UserResponse {
  visualMatch: boolean
  audioMatch: boolean
  timestamp: number
  correct: boolean
}

// 训练统计
interface TrainingStats {
  totalTrials: number
  correctVisual: number
  correctAudio: number
  accuracy: number
  reactionTime: number
  level: number
}

// 成就系统
interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
}

function NBackClientContent() {
  // 国际化翻译
  const t = useTranslations('nback')
  
  // 核心状态
  const [gameState, setGameState] = useState<GameState>(GameState.MENU)
  const [trainingMode, setTrainingMode] = useState<TrainingMode>(TrainingMode.DUAL_NBACK)
  const [nLevel, setNLevel] = useState(2)
  const [currentTrial, setCurrentTrial] = useState(0)
  const [totalTrials] = useState(20)
  
  // 刺激序列和响应
  const [stimuli, setStimuli] = useState<Stimulus[]>([])
  const [responses, setResponses] = useState<UserResponse[]>([])
  const [currentStimulus, setCurrentStimulus] = useState<Stimulus | null>(null)
  
  // 用户界面状态
  const [showVisualStimulus, setShowVisualStimulus] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | 'neutral'>('neutral')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  
  // 训练统计
  const [stats, setStats] = useState<TrainingStats>({
    totalTrials: 0,
    correctVisual: 0,
    correctAudio: 0,
    accuracy: 0,
    reactionTime: 0,
    level: 2
  })
  
  // 成就系统
  const [achievements, setAchievements] = useState<Achievement[]>([])
  
  // 定时器引用
  const trialTimerRef = useRef<NodeJS.Timeout | null>(null)
  const stimulusTimerRef = useRef<NodeJS.Timeout | null>(null)
  const responseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  
  // 系统初始化
  useEffect(() => {
    const initSystems = async () => {
      try {
        // 初始化性能监控
        performanceMonitor.startSession('nback_training')
        performanceMonitor.recordMetric('component_mount', {
          component: 'NBackClient',
          timestamp: Date.now()
        })
        
        // 初始化移动端优化器
        mobileOptimizer.initialize()
        const deviceInfo = MobileOptimizer.getDeviceInfo();
        performanceMonitor.recordMetric('mobile_optimizer_init', {
          timestamp: Date.now(),
          isMobile: deviceInfo.isMobile,
          isTouch: deviceInfo.hasTouch
        })
        
        // 初始化音频系统
        const audioSuccess = await audioManager.initialize()
        if (audioSuccess) {
          console.log('Audio manager initialized successfully')
          performanceMonitor.recordMetric('audio_init_success', {
            timestamp: Date.now()
          })
        } else {
          performanceMonitor.recordMetric('audio_init_failed', {
            timestamp: Date.now()
          })
        }
      } catch (error) {
        console.error('System initialization failed:', error)
        performanceMonitor.reportError({
          message: 'System initialization failed',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: Date.now(),
          context: 'NBackClient_init'
        })
      }
    }

    initSystems()
    
    // 清理函数
    return () => {
      mobileOptimizer.cleanup()
      performanceMonitor.endSession()
    }
  }, [])
  
  // 初始化成就系统 - 在组件挂载后进行，确保翻译已准备好
  useEffect(() => {
    setAchievements([
      { id: 'first_session', title: t('achievements.firstSession.title'), description: t('achievements.firstSession.description'), icon: '🌟', unlocked: false },
      { id: 'perfect_round', title: t('achievements.perfectRound.title'), description: t('achievements.perfectRound.description'), icon: '💎', unlocked: false },
      { id: 'streak_master', title: t('achievements.streakMaster.title'), description: t('achievements.streakMaster.description'), icon: '🔥', unlocked: false },
      { id: 'level_up', title: t('achievements.levelUp.title'), description: t('achievements.levelUp.description'), icon: '🚀', unlocked: false }
    ])
  }, [t])
  
  // 播放音调
  const playTone = useCallback(async (frequency: number, duration: number = 500) => {
    if (!audioEnabled) return
    
    try {
      await audioManager.playTone(frequency, duration, 0.3, 'sine')
    } catch (error) {
      console.warn('Audio playback failed:', error)
    }
  }, [audioEnabled])
  
  // 音调频率映射 (C4-C5音阶) - 使用useMemo优化性能
  const audioFrequencies = useMemo(() => [
    261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25
  ], [])
  
  // 训练模式配置 - 使用useMemo确保翻译正确加载
  const trainingModes = useMemo(() => [
    { mode: TrainingMode.TUTORIAL, title: t('modes.tutorial.title'), desc: t('modes.tutorial.description'), disabled: true },
    { mode: TrainingMode.SINGLE_VISUAL, title: t('modes.visual.title'), desc: t('modes.visual.description'), disabled: false },
    { mode: TrainingMode.SINGLE_AUDIO, title: t('modes.audio.title'), desc: t('modes.audio.description'), disabled: false },
    { mode: TrainingMode.DUAL_NBACK, title: t('modes.dual.title'), desc: t('modes.dual.description'), disabled: false }
  ], [t])
  
  // 生成新的刺激
  const generateStimulus = useCallback((): Stimulus => {
    return {
      visual: Math.floor(Math.random() * 9),
      audio: Math.floor(Math.random() * 8),
      timestamp: Date.now()
    }
  }, [])
  
  // 检查是否匹配
  const checkMatch = useCallback((currentIndex: number, type: 'visual' | 'audio'): boolean => {
    if (currentIndex < nLevel) return false
    
    const current = stimuli[currentIndex]
    const target = stimuli[currentIndex - nLevel]
    
    return type === 'visual' ? current.visual === target.visual : current.audio === target.audio
  }, [stimuli, nLevel])
  
  // 开始训练
  const startTraining = useCallback(() => {
    performanceMonitor.recordUserAction('start_training', {
      nLevel,
      trainingMode,
      audioEnabled
    })
    
    performanceMonitor.measureFunction('training_initialization', () => {
      setGameState(GameState.TRAINING)
      setCurrentTrial(0)
      setStimuli([])
      setResponses([])
      setScore(0)
      setStreak(0)
      setFeedbackMessage('')
      setIsWaitingForResponse(false)
      setSessionStartTime(Date.now()) // 记录训练开始时间
      
      // 生成初始刺激序列
      const initialStimuli: Stimulus[] = []
      for (let i = 0; i < totalTrials; i++) {
        initialStimuli.push(generateStimulus())
      }
      setStimuli(initialStimuli)
      
      // 开始第一个试验
      setTimeout(() => {
        presentStimulus(0, initialStimuli)
      }, 1000)
    }, 'training_start')
  }, [generateStimulus, totalTrials, nLevel, trainingMode, audioEnabled])
  
  // 呈现刺激
  const presentStimulus = useCallback((trialIndex: number, stimuliArray: Stimulus[]) => {
    if (trialIndex >= stimuliArray.length) {
      endTraining()
      return
    }
    
    const stimulus = stimuliArray[trialIndex]
    setCurrentStimulus(stimulus)
    setCurrentTrial(trialIndex)
    setIsWaitingForResponse(trialIndex >= nLevel)
    
    // 显示视觉刺激
    if (trainingMode === TrainingMode.SINGLE_VISUAL || trainingMode === TrainingMode.DUAL_NBACK) {
      setShowVisualStimulus(true)
      stimulusTimerRef.current = setTimeout(() => {
        setShowVisualStimulus(false)
      }, 500)
    }
    
    // 播放听觉刺激
    if (trainingMode === TrainingMode.SINGLE_AUDIO || trainingMode === TrainingMode.DUAL_NBACK) {
      playTone(audioFrequencies[stimulus.audio])
    }
    
    // 设置响应窗口
    if (trialIndex >= nLevel) {
      responseTimerRef.current = setTimeout(() => {
        setIsWaitingForResponse(false)
      }, 2500) // 2.5秒响应窗口
    }
    
    // 设置下一个试验的定时器
    trialTimerRef.current = setTimeout(() => {
      presentStimulus(trialIndex + 1, stimuliArray)
    }, 3000) // 3秒间隔
  }, [trainingMode, playTone, audioFrequencies, nLevel])
  
  // 用户响应处理
  const handleResponse = useCallback((type: 'visual' | 'audio') => {
    if (gameState !== GameState.TRAINING || !isWaitingForResponse) return
    
    const responseStartTime = Date.now()
    const isMatch = checkMatch(currentTrial, type)
    const response: UserResponse = {
      visualMatch: type === 'visual' ? isMatch : false,
      audioMatch: type === 'audio' ? isMatch : false,
      timestamp: responseStartTime,
      correct: isMatch
    }
    
    // 记录响应性能指标
    performanceMonitor.recordMetric('user_response', {
      trial: currentTrial,
      responseType: type,
      isMatch,
      isCorrect: isMatch,
      responseTime: responseStartTime,
      nLevel,
      trainingMode
    }, 'training_response')
    
    setResponses(prev => [...prev, response])
    
    // 更新分数和连击
    if (isMatch) {
      setScore(prev => prev + 10)
      setStreak(prev => {
        const newStreak = prev + 1
        setMaxStreak(current => Math.max(current, newStreak))
        return newStreak
      })
      setFeedbackMessage(t('feedback.correct'))
      setFeedbackType('correct')
    } else {
      setStreak(0)
      setFeedbackMessage(t('feedback.keepGoing'))
      setFeedbackType('incorrect')
    }
    
    // 清除反馈消息
    setTimeout(() => {
      setFeedbackMessage('')
      setFeedbackType('neutral')
    }, 1000)
    
    // 清除响应定时器
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current)
      setIsWaitingForResponse(false)
    }
  }, [gameState, isWaitingForResponse, currentTrial, checkMatch, nLevel, trainingMode])
  
  // 结束训练
  const endTraining = useCallback(async () => {
    const sessionEndTime = Date.now()
    const sessionDuration = sessionEndTime - sessionStartTime
    
    setGameState(GameState.RESULTS)
    setIsWaitingForResponse(false)
    
    // 清理定时器
    if (trialTimerRef.current) clearTimeout(trialTimerRef.current)
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current)
    if (responseTimerRef.current) clearTimeout(responseTimerRef.current)
    
    // 计算统计数据
    const correctResponses = responses.filter(r => r.correct).length
    const accuracy = responses.length > 0 ? (correctResponses / responses.length) * 100 : 0
    const totalReactionTime = responses.reduce((sum, r) => sum + (r.timestamp || 0), 0)
    const averageReactionTime = responses.length > 0 ? totalReactionTime / responses.length : 0
    
    const finalStats = {
      totalTrials: responses.length,
      correctVisual: responses.filter(r => r.visualMatch).length,
      correctAudio: responses.filter(r => r.audioMatch).length,
      accuracy,
      reactionTime: averageReactionTime,
      level: nLevel
    }
    
    // 记录训练结束性能指标
    performanceMonitor.recordMetric('training_completed', {
      nLevel,
      trainingMode,
      duration: sessionDuration,
      totalTrials: responses.length,
      correctResponses,
      accuracy,
      averageReactionTime,
      maxStreak,
      score,
      audioEnabled
    }, 'training_end')
    
    performanceMonitor.recordUserAction('end_training', {
      accuracy,
      score,
      duration: sessionDuration,
      level: nLevel
    })
    
    setStats(finalStats)
    
    // 保存训练会话数据
    const sessionData: TrainingSession = {
      id: `session_${Date.now()}`,
      timestamp: Date.now(),
      mode: trainingMode === TrainingMode.TUTORIAL ? 'tutorial' as const :
            trainingMode === TrainingMode.SINGLE_VISUAL ? 'visual' as const :
            trainingMode === TrainingMode.SINGLE_AUDIO ? 'audio' as const :
            'dual' as const,
      nLevel: nLevel,
      duration: sessionDuration,
      totalTrials: responses.length,
      correctResponses: correctResponses,
      accuracy: accuracy,
      averageReactionTime: averageReactionTime,
      score: score,
      achievements: [] // 本次训练解锁的成就
    }
    
    try {
      dataPersistence.saveTrainingSession(sessionData)
      console.log('Training session data saved successfully')
    } catch (error) {
      console.error('Failed to save training data:', error)
      performanceMonitor.reportError({
        message: (error as Error).message,
        stack: (error as Error).stack,
        context: 'save_session_data'
      })
    }
    
    // 检查成就
    checkAchievements(accuracy)
  }, [responses, nLevel, trainingMode, sessionStartTime, score, maxStreak, audioEnabled])
  
  // 检查成就
  const checkAchievements = useCallback((accuracy: number) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement
      
      switch (achievement.id) {
        case 'first_session':
          return { ...achievement, unlocked: true }
        case 'perfect_round':
          return { ...achievement, unlocked: accuracy === 100 }
        case 'streak_master':
          return { ...achievement, unlocked: maxStreak >= 10 }
        case 'level_up':
          return { ...achievement, unlocked: nLevel >= 3 }
        default:
          return achievement
      }
    }))
  }, [maxStreak, nLevel])
  
  // 重置训练
  const resetTraining = useCallback(() => {
    setGameState(GameState.MENU)
    setCurrentTrial(0)
    setStimuli([])
    setResponses([])
    setScore(0)
    setStreak(0)
    setFeedbackMessage('')
    setIsWaitingForResponse(false)
    
    // 清理所有定时器
    if (trialTimerRef.current) clearTimeout(trialTimerRef.current)
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current)
    if (responseTimerRef.current) clearTimeout(responseTimerRef.current)
  }, [])
  
  // 优化的视觉网格单元组件 - 使用memo避免不必要的重渲染
  const GridCell = memo(({ index, isActive }: { index: number; isActive: boolean }) => {
    // 使用CSS transform和will-change优化动画性能
    const cellStyle = useMemo(() => ({
      willChange: isActive ? 'transform, opacity' : 'auto'
    }), [isActive])

    return (
      <motion.div
        key={index}
        style={cellStyle}
        className={`relative w-16 h-16 border-2 border-purple-300/50 rounded-lg backdrop-blur-sm overflow-hidden ${
          isActive 
            ? 'bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg shadow-pink-500/50 border-pink-400' 
            : 'bg-purple-100/10 hover:bg-purple-100/20'
        }`}
        animate={{
          scale: isActive ? [1, 1.15, 1] : 1,
          rotateY: isActive ? [0, 5, 0] : 0
        }}
        transition={{ duration: 0.4, repeat: isActive ? Infinity : 0 }}
      >
        {/* 内部发光效果 - 只在激活时渲染 */}
        {isActive && (
          <>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-pink-300/80 to-purple-500/80"
              animate={{
                opacity: [0.6, 1, 0.6],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-lg"
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.2, 1.5]
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            {/* 星光闪烁效果 */}
            <motion.div
              className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-pink-200 rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{ duration: 0.7, repeat: Infinity, delay: 0.4 }}
            />
          </>
        )}
        
        {/* 外部光环效果 - 只在激活时渲染 */}
        {isActive && (
          <motion.div
            className="absolute -inset-2 border-2 border-pink-400/60 rounded-lg"
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.9, 1.1, 1.3]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>
    )
  })

  GridCell.displayName = 'GridCell'

  // 渲染3x3网格 - 优化版本
  const renderVisualGrid = useMemo(() => {
    const gridCells = Array.from({ length: 9 }, (_, i) => {
      const isActive = showVisualStimulus && currentStimulus?.visual === i
      return <GridCell key={i} index={i} isActive={isActive} />
    })

    return (
      <div className="relative">
        {/* 网格背景光效 - 优化动画性能 */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-xl blur-xl"
          style={{ willChange: showVisualStimulus ? 'transform, opacity' : 'auto' }}
          animate={{
            opacity: showVisualStimulus ? [0.3, 0.6, 0.3] : 0.2,
            scale: showVisualStimulus ? [1, 1.05, 1] : 1
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        
        <div className="relative grid grid-cols-3 gap-3 p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl backdrop-blur-sm border border-purple-500/30">
          {gridCells}
        </div>
      </div>
    )
  }, [showVisualStimulus, currentStimulus?.visual])


  
  // 主菜单界面
  if (gameState === GameState.MENU) {
    return (
      <div className="relative min-h-screen">
        <div className="relative z-10 max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-pink-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              {t('ui.title')}
            </h1>
            <Zap className="w-12 h-12 text-cyan-400" />
          </div>
          <p className="text-xl text-purple-200 mb-2">
            {t('ui.subtitle')}
          </p>
          <p className="text-sm text-purple-300/80">
            {t('ui.description')}
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* 训练模式选择 */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-pink-300 flex items-center gap-2">
                <Star className="w-5 h-5" />
                {t('ui.selectMode')}
              </CardTitle>
              <CardDescription className="text-purple-200/80">
                {t('ui.selectModeDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {trainingModes.map(({ mode, title, desc, disabled }) => (
                <motion.div
                  key={mode}
                  whileHover={{ scale: disabled ? 1 : 1.02 }}
                  whileTap={{ scale: disabled ? 1 : 0.98 }}
                >
                  <TouchOptimizedButton
                    variant={trainingMode === mode ? 'default' : 'outline'}
                    className={`relative w-full justify-start h-auto p-4 transition-all duration-300 overflow-hidden ${
                      disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : trainingMode === mode 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-2xl border-0' 
                          : 'border-purple-400/50 text-purple-200 hover:bg-purple-800/50 hover:border-purple-400'
                    }`}
                    onClick={() => !disabled && setTrainingMode(mode)}
                    disabled={disabled}
                    hapticFeedback={!disabled}
                    preventDoubleClick
                  >
                    {trainingMode === mode && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-400/30 to-purple-500/30"
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <div className="text-left relative z-10">
                      <div className="font-semibold">{title}</div>
                      <div className="text-sm opacity-80">{desc}</div>
                    </div>
                  </TouchOptimizedButton>
                </motion.div>
              ))}
            </CardContent>
          </Card>
          
          {/* 难度设置 */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-pink-300 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {t('settings.title')}
              </CardTitle>
              <CardDescription className="text-purple-200/80">
                {t('settings.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-purple-200 text-sm font-medium mb-3 block">
                  {t('settings.nLevel', { level: nLevel })}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <TouchOptimizedButton
                      key={level}
                      variant={nLevel === level ? 'default' : 'outline'}
                      size="sm"
                      className={`transition-all duration-200 ${
                        nLevel === level 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                          : 'border-purple-400/50 text-purple-200 hover:bg-purple-800/50'
                      }`}
                      onClick={() => setNLevel(level)}
                      hapticFeedback
                      preventDoubleClick
                    >
                      {level}
                    </TouchOptimizedButton>
                  ))}
                </div>
                <p className="text-xs text-purple-300/70 mt-2">
                  {t('settings.levelHint')}
                </p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-800/30 rounded-lg">
                <div>
                  <span className="text-purple-200 text-sm font-medium">{t('settings.audioFeedback')}</span>
                  <p className="text-xs text-purple-300/70">{t('settings.audioDescription')}</p>
                </div>
                <TouchOptimizedButton
                  variant="outline"
                  size="sm"
                  className={`border-purple-400/50 transition-all duration-200 ${
                    audioEnabled 
                      ? 'text-green-300 border-green-400/50 hover:bg-green-800/30' 
                      : 'text-red-300 border-red-400/50 hover:bg-red-800/30'
                  }`}
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  hapticFeedback
                  preventDoubleClick
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </TouchOptimizedButton>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TouchOptimizedButton
                  onClick={startTraining}
                  className="relative w-full bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:via-purple-700 hover:to-cyan-600 text-white font-semibold py-3 shadow-2xl border-0 overflow-hidden"
                  hapticFeedback={true}
                  preventDoubleClick={true}
                >
                  {/* 按钮背景光效 */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-400/50 to-purple-500/50"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* 闪烁光点 */}
                  <motion.div
                    className="absolute top-2 left-4 w-2 h-2 bg-white rounded-full"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.2, 0.5]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute bottom-2 right-4 w-1.5 h-1.5 bg-pink-200 rounded-full"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  
                  <span className="relative z-10 flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    {t('ui.startTraining')}
                  </span>
                </TouchOptimizedButton>
              </motion.div>
            </CardContent>
          </Card>
          
          {/* 成就展示 */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-pink-300 flex items-center gap-2">
                🏆 {t('achievements.title')}
              </CardTitle>
              <CardDescription className="text-purple-200/80">
                {t('achievements.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map(achievement => (
                  <motion.div
                    key={achievement.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-yellow-400/50 shadow-md' 
                        : 'bg-gray-800/30 border-gray-600/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          achievement.unlocked ? 'text-yellow-300' : 'text-gray-400'
                        }`}>
                          {achievement.title}
                        </div>
                        <div className={`text-xs ${
                          achievement.unlocked ? 'text-yellow-200/80' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </div>
                      </div>
                      {achievement.unlocked && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 训练说明 */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-purple-200 text-center">💡 {t('instructions.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-purple-200/80">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  👁️
                </div>
                <h4 className="font-semibold text-purple-200 mb-2">{t('instructions.visual.title')}</h4>
                <p>{t('instructions.visual.description')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  🎵
                </div>
                <h4 className="font-semibold text-purple-200 mb-2">{t('instructions.audio.title')}</h4>
                <p>{t('instructions.audio.description')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  🧠
                </div>
                <h4 className="font-semibold text-purple-200 mb-2">{t('instructions.dual.title')}</h4>
                <p>{t('instructions.dual.description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 数据管理和历史记录按钮 */}
        <div className="flex justify-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TouchOptimizedButton
              onClick={() => setGameState(GameState.DATA_MANAGEMENT)}
              variant="outline"
              className="relative border-cyan-400/50 text-cyan-200 hover:bg-cyan-800/50 px-6 py-3 transition-all duration-300 overflow-hidden"
              hapticFeedback
              preventDoubleClick
            >
              {/* 按钮背景光效 */}
              <motion.div
                className="absolute inset-0 bg-cyan-500/10"
                animate={{
                  opacity: [0, 0.3, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative z-10 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                {t('ui.dataManagement')}
              </span>
            </TouchOptimizedButton>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TouchOptimizedButton
              onClick={() => setGameState(GameState.TRAINING_HISTORY)}
              variant="outline"
              className="relative border-green-400/50 text-green-200 hover:bg-green-800/50 px-6 py-3 transition-all duration-300 overflow-hidden"
              hapticFeedback
              preventDoubleClick
            >
              {/* 按钮背景光效 */}
              <motion.div
                className="absolute inset-0 bg-green-500/10"
                animate={{
                  opacity: [0, 0.3, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative z-10 flex items-center">
                <History className="w-4 h-4 mr-2" />
                {t('ui.trainingHistory')}
              </span>
            </TouchOptimizedButton>
          </motion.div>
        </div>
        </div>
      </div>
    )
  }
  
  // 训练界面
  if (gameState === GameState.TRAINING) {
    return (
      <div className="relative min-h-screen">
        <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* 训练头部信息 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-pink-400 text-pink-300 px-3 py-1">
              {t('ui.nBackTraining', { level: nLevel })}
            </Badge>
            <Badge variant="outline" className="border-purple-400 text-purple-300 px-3 py-1">
              {t('ui.trialProgress', { current: currentTrial + 1, total: totalTrials })}
            </Badge>
            {isWaitingForResponse && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse">
                {t('ui.waitingResponse')}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-purple-200">{t('ui.score')}</div>
              <div className="text-2xl font-bold text-pink-300">{score}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-200">{t('ui.streak')}</div>
              <div className="text-2xl font-bold text-yellow-300">{streak}</div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TouchOptimizedButton
                variant="outline"
                size="sm"
                className="relative border-red-400/50 text-red-300 hover:bg-red-800/30 transition-all duration-300 overflow-hidden"
                onClick={resetTraining}
                hapticFeedback
                preventDoubleClick
              >
                {/* 按钮背景光效 */}
                <motion.div
                  className="absolute inset-0 bg-red-500/10"
                  animate={{
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                <motion.div
                  className="relative z-10"
                  whileHover={{ rotate: -180 }}
                  transition={{ duration: 0.3 }}
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.div>
              </TouchOptimizedButton>
            </motion.div>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-purple-200 mb-2">
            <span>{t('ui.trainingProgress')}</span>
            <span>{Math.round((currentTrial / totalTrials) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-800/50 rounded-full h-4 mb-8 overflow-hidden backdrop-blur-sm border border-gray-700/50 relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-600 rounded-full shadow-2xl relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${(currentTrial / totalTrials) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* 进度条内部光效 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              {/* 进度条脉冲效果 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400/50 to-pink-500/50"
                animate={{
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
            
            {/* 进度条外部光环 */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 10px rgba(139, 92, 246, 0.3)',
                  '0 0 20px rgba(139, 92, 246, 0.6)',
                  '0 0 10px rgba(139, 92, 246, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
        
        {/* 主训练区域 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* 视觉刺激区域 */}
          {(trainingMode === TrainingMode.SINGLE_VISUAL || trainingMode === TrainingMode.DUAL_NBACK) && (
            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-pink-300 text-center flex items-center justify-center gap-2">
                  👁️ {t('ui.visualStimulus')}
                  {showVisualStimulus && (
                    <motion.div
                      className="w-3 h-3 bg-pink-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                {renderVisualGrid}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TouchOptimizedButton
                    onClick={() => handleResponse('visual')}
                    className="relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-pink-500/30 border-0 overflow-hidden"
                    disabled={!isWaitingForResponse}
                    hapticFeedback
                    preventDoubleClick
                  >
                    {/* 按钮背景光效 */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-400/50 to-purple-500/50"
                      animate={{
                        opacity: isWaitingForResponse ? [0.5, 0.8, 0.5] : 0.3,
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {/* 闪烁光点 */}
                    {isWaitingForResponse && (
                      <motion.div
                        className="absolute top-1 right-2 w-2 h-2 bg-white rounded-full"
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <span className="relative z-10">{t('ui.positionMatch', { nLevel })}</span>
                  </TouchOptimizedButton>
                </motion.div>
                <p className="text-xs text-purple-300/70 text-center">
                  {t('ui.positionInstruction', { nLevel })}
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* 听觉刺激区域 */}
          {(trainingMode === TrainingMode.SINGLE_AUDIO || trainingMode === TrainingMode.DUAL_NBACK) && (
            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-pink-300 text-center flex items-center justify-center gap-2">
                  🎵 {t('ui.auditoryStimulus')}
                  {audioEnabled && (
                    <motion.div
                      className="w-3 h-3 bg-cyan-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center border-2 border-purple-400/50">
                  <motion.div
                    className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400/50 to-purple-500/50 flex items-center justify-center"
                    animate={{
                      scale: showVisualStimulus ? [1, 1.2, 1] : 1,
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Volume2 className="w-16 h-16 text-white/80" />
                  </motion.div>
                  
                  {/* 音波效果 */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
                    animate={{
                      scale: [1, 1.5, 2],
                      opacity: [0.5, 0.2, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-pink-400/30"
                    animate={{
                      scale: [1, 1.3, 1.8],
                      opacity: [0.3, 0.1, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TouchOptimizedButton
                    onClick={() => handleResponse('audio')}
                    className="relative bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-cyan-500/30 border-0 overflow-hidden"
                    disabled={!isWaitingForResponse}
                    hapticFeedback
                    preventDoubleClick
                  >
                    {/* 按钮背景光效 */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-cyan-500/50"
                      animate={{
                        opacity: isWaitingForResponse ? [0.5, 0.8, 0.5] : 0.3,
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {/* 音波脉冲效果 */}
                    {isWaitingForResponse && (
                      <>
                        <motion.div
                          className="absolute top-1 left-2 w-2 h-2 bg-cyan-300 rounded-full"
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.2, 0.5]
                          }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-purple-300 rounded-full"
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                        />
                      </>
                    )}
                    <span className="relative z-10">{t('ui.audioMatch', { nLevel })}</span>
                  </TouchOptimizedButton>
                </motion.div>
                <p className="text-xs text-purple-300/70 text-center">
                  {t('ui.audioInstruction', { nLevel })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* 反馈消息 */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8, rotateX: -15 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                rotateX: 0,
                transition: {
                  type: "spring",
                  damping: 15,
                  stiffness: 300
                }
              }}
              exit={{ 
                opacity: 0, 
                y: -30, 
                scale: 0.8, 
                rotateX: 15,
                transition: { duration: 0.3 }
              }}
              className="text-center"
            >
              <motion.div 
                className={`
                  relative inline-block px-8 py-4 rounded-full font-semibold text-lg shadow-2xl backdrop-blur-sm border-2 overflow-hidden
                  ${feedbackType === 'correct'
                    ? 'bg-gradient-to-r from-green-500/30 to-emerald-600/30 border-green-400/60 text-green-300' 
                    : feedbackType === 'incorrect'
                    ? 'bg-gradient-to-r from-red-500/30 to-pink-600/30 border-red-400/60 text-red-300'
                    : 'bg-gradient-to-r from-pink-500/30 to-purple-600/30 border-pink-400/60 text-pink-300'
                  }
                `}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(236, 72, 153, 0.3)',
                    '0 0 40px rgba(236, 72, 153, 0.6)',
                    '0 0 20px rgba(236, 72, 153, 0.3)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {/* 背景光效 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* 粒子效果 */}
                {feedbackType === 'correct' && (
                  <>
                    <motion.div
                      className="absolute top-0 left-1/4 w-1 h-1 bg-green-300 rounded-full"
                      animate={{
                        y: [0, -20, -40],
                        opacity: [1, 0.5, 0],
                        scale: [1, 0.5, 0]
                      }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="absolute top-0 right-1/4 w-1 h-1 bg-emerald-300 rounded-full"
                      animate={{
                        y: [0, -20, -40],
                        opacity: [1, 0.5, 0],
                        scale: [1, 0.5, 0]
                      }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                    />
                  </>
                )}
                
                <span className="relative z-10">{feedbackMessage}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 训练提示 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-purple-300/70">
            {t('ui.trainingTip', { nLevel })}
          </p>
        </div>
        </div>
      </div>
    )
  }
  
  // 结果界面
  if (gameState === GameState.RESULTS) {
    return (
      <div className="relative min-h-screen">
        <div className="relative z-10 max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-400" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
              {t('results.sessionComplete')}
            </h2>
            <Star className="w-12 h-12 text-pink-400" />
          </div>
          <p className="text-lg text-purple-200">
            {t('ui.congratulations', { nLevel })}
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* 训练统计 */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-pink-300 flex items-center gap-2">
                📊 {t('ui.trainingStats')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="relative text-center p-4 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-lg border border-pink-400/30 overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* 背景光效 */}
                  <motion.div
                    className="absolute inset-0 bg-pink-500/10"
                    animate={{
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <div className="relative z-10">
                    <motion.div 
                      className="text-3xl font-bold text-pink-300 mb-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {stats.accuracy.toFixed(1)}%
                    </motion.div>
                    <div className="text-sm text-purple-200">{t('ui.accuracy')}</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="relative text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-lg border border-yellow-400/30 overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* 背景光效 */}
                  <motion.div
                    className="absolute inset-0 bg-yellow-500/10"
                    animate={{
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  />
                  <div className="relative z-10">
                    <motion.div 
                      className="text-3xl font-bold text-yellow-300 mb-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    >
                      {maxStreak}
                    </motion.div>
                    <div className="text-sm text-purple-200">{t('ui.streak')}</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="relative text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg border border-green-400/30 overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* 背景光效 */}
                  <motion.div
                    className="absolute inset-0 bg-green-500/10"
                    animate={{
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  />
                  <div className="relative z-10">
                    <motion.div 
                      className="text-3xl font-bold text-green-300 mb-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    >
                      {score}
                    </motion.div>
                    <div className="text-sm text-purple-200">{t('ui.score')}</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="relative text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-lg border border-blue-400/30 overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {/* 背景光效 */}
                  <motion.div
                    className="absolute inset-0 bg-blue-500/10"
                    animate={{
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  />
                  <div className="relative z-10">
                    <motion.div 
                      className="text-3xl font-bold text-blue-300 mb-1"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
                    >
                      {nLevel}
                    </motion.div>
                    <div className="text-sm text-purple-200">{t('ui.level')}</div>
                  </div>
                </motion.div>
              </div>
              
              {/* 详细统计 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-purple-800/30 rounded-lg">
                  <span className="text-purple-200">{t('ui.totalTrials')}</span>
                  <span className="text-white font-semibold">{stats.totalTrials}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-800/30 rounded-lg">
                  <span className="text-purple-200">{t('ui.visualCorrect')}</span>
                  <span className="text-pink-300 font-semibold">{stats.correctVisual}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-800/30 rounded-lg">
                  <span className="text-purple-200">{t('ui.auditoryCorrect')}</span>
                  <span className="text-cyan-300 font-semibold">{stats.correctAudio}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 新解锁成就 */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-pink-300 flex items-center gap-2">
                🏆 {t('ui.achievementsUnlocked')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.filter(a => a.unlocked).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.15,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="relative flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/50 rounded-lg overflow-hidden"
                  >
                    {/* 背景光效 */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    />
                    
                    {/* 闪烁粒子效果 */}
                    <motion.div
                      className="absolute top-2 right-4 w-1 h-1 bg-yellow-300 rounded-full"
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1.5, 0.5]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                    />
                    <motion.div
                      className="absolute bottom-3 left-6 w-0.5 h-0.5 bg-orange-300 rounded-full"
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1.2, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.4 }}
                    />
                    
                    <div className="relative z-10 flex items-center gap-4 w-full">
                      <motion.span 
                        className="text-3xl"
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                      >
                        {achievement.icon}
                      </motion.span>
                      <div className="flex-1">
                        <motion.div 
                          className="font-semibold text-yellow-300 text-lg"
                          animate={{ opacity: [0.8, 1, 0.8] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {achievement.title}
                        </motion.div>
                        <div className="text-sm text-yellow-200/80">{achievement.description}</div>
                      </div>
                      <motion.div
                        className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
                        animate={{ 
                          scale: [1, 1.5, 1], 
                          opacity: [1, 0.5, 1],
                          boxShadow: [
                            "0 0 5px rgba(251, 191, 36, 0.5)",
                            "0 0 15px rgba(251, 191, 36, 0.8)",
                            "0 0 5px rgba(251, 191, 36, 0.5)"
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>
                ))}
                {achievements.filter(a => a.unlocked).length === 0 && (
                  <div className="text-center text-purple-300 py-8">
                    <div className="text-4xl mb-3">🎯</div>
                    <p>{t('ui.continueTraining')}</p>
                <p className="text-sm text-purple-400 mt-2">{t('ui.improveAccuracy')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 表现评价 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
        >
          <Card className="relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20 backdrop-blur-sm mb-8 overflow-hidden">
            {/* 背景光效 */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.01, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            {/* 装饰性粒子 */}
            <motion.div
              className="absolute top-4 right-6 w-2 h-2 bg-purple-400 rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
                y: [0, -10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-pink-400 rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                x: [0, 5, 0]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            />
            
            <CardContent className="relative z-10 p-6">
              <div className="text-center">
                <motion.h3 
                  className="text-xl font-semibold text-purple-200 mb-4"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {t('results.evaluation')}
                </motion.h3>
                <motion.div 
                  className="text-lg text-purple-300"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  {stats.accuracy >= 90 ? (
                    <motion.div 
                      className="flex items-center justify-center gap-2"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        🌟
                      </motion.span>
                      <span>{t('ui.excellentPerformance')}</span>
                    </motion.div>
                  ) : stats.accuracy >= 70 ? (
                    <motion.div 
                      className="flex items-center justify-center gap-2"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        👍
                      </motion.span>
                      <span>{t('ui.goodPerformance')}</span>
                    </motion.div>
                  ) : stats.accuracy >= 50 ? (
                    <motion.div 
                      className="flex items-center justify-center gap-2"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.span
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        💪
                      </motion.span>
                      <span>{t('results.evaluation.goodStart')}</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="flex items-center justify-center gap-2"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        🎯
                      </motion.span>
                      <span>{t('results.evaluation.keepTrying')}</span>
                    </motion.div>
                  )}
                </motion.div>
                <motion.p 
                  className="text-sm text-purple-400 mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {t('results.recommendation')}
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* 操作按钮 */}
        <div className="flex justify-center gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TouchOptimizedButton
              onClick={resetTraining}
              variant="outline"
              className="relative border-purple-400/50 text-purple-200 hover:bg-purple-800/50 px-8 py-3 transition-all duration-300 overflow-hidden"
              hapticFeedback
              preventDoubleClick
            >
              {/* 按钮背景光效 */}
              <motion.div
                className="absolute inset-0 bg-purple-500/10"
                animate={{
                  opacity: [0, 0.3, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative z-10">{t('buttons.backToMenu')}</span>
            </TouchOptimizedButton>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TouchOptimizedButton
              onClick={startTraining}
              className="relative bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:via-purple-700 hover:to-cyan-600 px-8 py-3 shadow-2xl border-0 overflow-hidden"
              hapticFeedback
              preventDoubleClick
            >
              {/* 按钮背景光效 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-400/50 to-cyan-500/50"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* 闪烁光点 */}
              <motion.div
                className="absolute top-2 left-4 w-2 h-2 bg-white rounded-full"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-2 right-4 w-1.5 h-1.5 bg-cyan-200 rounded-full"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              
              <span className="relative z-10 flex items-center">
                <Play className="w-4 h-4 mr-2" />
                {t('buttons.trainAgain')}
              </span>
            </TouchOptimizedButton>
          </motion.div>
        </div>
        </div>
      </div>
    )
  }
  
  // 数据管理界面
  if (gameState === GameState.DATA_MANAGEMENT) {
    return (
      <div className="relative min-h-screen">
        <div className="relative z-10 max-w-4xl mx-auto p-6">
          {/* 返回按钮 */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TouchOptimizedButton
              onClick={() => setGameState(GameState.MENU)}
              variant="outline"
              className="border-purple-400/50 text-purple-200 hover:bg-purple-800/30"
              hapticFeedback
              preventDoubleClick
            >
              ← {t('buttons.backToMenu')}
            </TouchOptimizedButton>
          </motion.div>
          
          {/* 数据管理组件 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <LazyDataManagement />
          </motion.div>
        </div>
      </div>
    )
  }
  
  // 训练历史界面
  if (gameState === GameState.TRAINING_HISTORY) {
    return (
      <div className="relative min-h-screen">
        <div className="relative z-10 max-w-6xl mx-auto p-6">
          {/* 返回按钮 */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TouchOptimizedButton
              onClick={() => setGameState(GameState.MENU)}
              variant="outline"
              className="border-purple-400/50 text-purple-200 hover:bg-purple-800/30"
              hapticFeedback
              preventDoubleClick
            >
              ← {t('buttons.backToMenu')}
            </TouchOptimizedButton>
          </motion.div>
          
          {/* 训练历史组件 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <LazyTrainingHistory />
          </motion.div>
        </div>
      </div>
    )
  }
  
  return null
}

// 主组件 - 包裹错误边界
export default function NBackClient() {
  return (
    <TrainingErrorBoundary>
      <NBackClientContent />
    </TrainingErrorBoundary>
  )
}