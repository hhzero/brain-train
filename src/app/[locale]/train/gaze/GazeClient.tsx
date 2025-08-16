'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useTrainingStore } from '@/stores/training-store'
import { GazeTrainingConfig, GazeTrainingResult } from '@/types/training'
import { Play, Pause, RotateCcw, Settings, Eye, Target, Zap, Trophy } from 'lucide-react'
import { toast } from 'sonner'

type GazeMode = 'static' | 'dynamic' | 'anti-distraction'

interface Position {
  x: number
  y: number
}

interface DistractionElement {
  id: string
  position: Position
  color: string
  size: number
  opacity: number
}

export default function GazeClient() {
  const t = useTranslations('gaze')
  const { 
    startTrainingSession, 
    completeTrainingSession, 
    currentSession,
    getProgressByType,
    getDifficultyRecommendation,
    settings
  } = useTrainingStore()
  
  // 训练状态
  const [mode, setMode] = useState<GazeMode>('static')
  const [isTraining, setIsTraining] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [time, setTime] = useState(0)
  const [focusTime, setFocusTime] = useState(0)
  const [interruptionCount, setInterruptionCount] = useState(0)
  const [targetPosition, setTargetPosition] = useState<Position>({ x: 50, y: 50 })
  const [distractions, setDistractions] = useState<DistractionElement[]>([])
  const [isTargetVisible, setIsTargetVisible] = useState(true)
  const [stabilityScore, setStabilityScore] = useState(100)
  const [trackingAccuracy, setTrackingAccuracy] = useState(100)
  
  // 配置
  const [config, setConfig] = useState<GazeTrainingConfig>({
    difficulty: getDifficultyRecommendation('gaze'),
    mode: 'static',
    duration: 60,
    adaptiveDifficulty: settings.adaptiveDifficultyEnabled,
    soundEnabled: settings.soundEnabled,
    vibrationEnabled: settings.vibrationEnabled,
    targetSize: 64,
    distractionLevel: 3,
    movementSpeed: 2
  })
  
  const timer = useRef<NodeJS.Timeout | null>(null)
  const movementTimer = useRef<NodeJS.Timeout | null>(null)
  const distractionTimer = useRef<NodeJS.Timeout | null>(null)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const lastMousePosition = useRef<Position>({ x: 0, y: 0 })
  const mouseStabilityBuffer = useRef<Position[]>([])
  
  const progress = getProgressByType('gaze')

  // 开始训练
  const startTraining = useCallback(() => {
    const trainingConfig: GazeTrainingConfig = {
      ...config,
      mode: mode
    }
    
    startTrainingSession('gaze', trainingConfig)
    setIsTraining(true)
    setIsPaused(false)
    setTime(0)
    setFocusTime(0)
    setInterruptionCount(0)
    setStabilityScore(100)
    setTrackingAccuracy(100)
    
    if (mode === 'dynamic') {
      startDynamicMovement()
    }
    
    if (mode === 'anti-distraction') {
      startDistractions()
    }
    
    toast.success(t('trainingStarted'))
  }, [config, mode, startTrainingSession, t])

  // 暂停/恢复训练
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
    if (isPaused) {
      toast.info(t('trainingResumed'))
    } else {
      toast.info(t('trainingPaused'))
    }
  }, [isPaused, t])

  // 停止训练
  const stopTraining = useCallback(() => {
    if (!currentSession) return
    
    const result: GazeTrainingResult = {
      sessionId: currentSession.id,
      type: 'gaze',
      score: Math.floor((focusTime / time) * 100 * (stabilityScore / 100)),
      accuracy: Math.floor(((time - interruptionCount) / time) * 100),
      reactionTime: 0, // 凝视训练不涉及反应时间
      totalAttempts: 1,
      correctAttempts: time > 0 ? 1 : 0,
      incorrectAttempts: interruptionCount,
      streakBest: Math.floor(focusTime),
      timeSpent: time,
      difficultyProgression: [config.difficulty],
      detailedMetrics: {
        mode,
        targetSize: config.targetSize,
        distractionLevel: config.distractionLevel,
        movementSpeed: config.movementSpeed
      },
      timestamp: new Date(),
      focusTime,
      interruptionCount,
      stabilityScore,
      trackingAccuracy: mode === 'dynamic' ? trackingAccuracy : undefined
    }
    
    completeTrainingSession(result)
    setIsTraining(false)
    setIsPaused(false)
    
    // 清理定时器
    if (timer.current) clearInterval(timer.current)
    if (movementTimer.current) clearInterval(movementTimer.current)
    if (distractionTimer.current) clearInterval(distractionTimer.current)
    
    toast.success(t('trainingCompleted', { score: result.score }))
  }, [currentSession, focusTime, time, interruptionCount, stabilityScore, trackingAccuracy, config, mode, completeTrainingSession, t])

  // 动态移动目标
  const startDynamicMovement = useCallback(() => {
    movementTimer.current = setInterval(() => {
      if (!isPaused && gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect()
        const margin = config.targetSize / 2
        const newX = margin + Math.random() * (rect.width - margin * 2)
        const newY = margin + Math.random() * (rect.height - margin * 2)
        
        setTargetPosition({
          x: (newX / rect.width) * 100,
          y: (newY / rect.height) * 100
        })
      }
    }, 3000 / (config.movementSpeed || 2))
  }, [config.movementSpeed, config.targetSize, isPaused])

  // 启动干扰元素
  const startDistractions = useCallback(() => {
    distractionTimer.current = setInterval(() => {
      if (!isPaused) {
        const newDistraction: DistractionElement = {
          id: `distraction_${Date.now()}`,
          position: {
            x: Math.random() * 90 + 5,
            y: Math.random() * 80 + 10
          },
          color: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)],
          size: 20 + Math.random() * 30,
          opacity: 0.6 + Math.random() * 0.4
        }
        
        setDistractions(prev => [...prev, newDistraction])
        
        // 移除干扰元素
        setTimeout(() => {
          setDistractions(prev => prev.filter(d => d.id !== newDistraction.id))
        }, 1000 + Math.random() * 2000)
      }
    }, Math.max(1000, 4000 - config.distractionLevel * 400))
  }, [config.distractionLevel, isPaused])

  // 鼠标稳定性检测
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isTraining || isPaused) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const mousePos = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    }
    
    lastMousePosition.current = mousePos
    
    // 计算鼠标稳定性
    mouseStabilityBuffer.current.push(mousePos)
    if (mouseStabilityBuffer.current.length > 10) {
      mouseStabilityBuffer.current.shift()
    }
    
    if (mouseStabilityBuffer.current.length >= 5) {
      const avgX = mouseStabilityBuffer.current.reduce((sum, pos) => sum + pos.x, 0) / mouseStabilityBuffer.current.length
      const avgY = mouseStabilityBuffer.current.reduce((sum, pos) => sum + pos.y, 0) / mouseStabilityBuffer.current.length
      
      const variance = mouseStabilityBuffer.current.reduce((sum, pos) => {
        return sum + Math.pow(pos.x - avgX, 2) + Math.pow(pos.y - avgY, 2)
      }, 0) / mouseStabilityBuffer.current.length
      
      const newStabilityScore = Math.max(0, 100 - variance * 2)
      setStabilityScore(newStabilityScore)
    }
    
    // 动态模式下计算追踪准确性
    if (mode === 'dynamic') {
      const distance = Math.sqrt(
        Math.pow(mousePos.x - targetPosition.x, 2) + 
        Math.pow(mousePos.y - targetPosition.y, 2)
      )
      const accuracy = Math.max(0, 100 - distance * 2)
      setTrackingAccuracy(accuracy)
    }
  }, [isTraining, isPaused, mode, targetPosition])

  // 检测焦点丢失
  const handleFocusLoss = useCallback(() => {
    if (isTraining && !isPaused) {
      setInterruptionCount(prev => prev + 1)
      toast.warning(t('focusLost'))
    }
  }, [isTraining, isPaused, t])

  // 主计时器
  useEffect(() => {
    if (isTraining && !isPaused) {
      timer.current = setInterval(() => {
        setTime(prev => {
          const newTime = prev + 1
          if (newTime >= config.duration) {
            stopTraining()
          }
          return newTime
        })
        
        // 计算专注时间（基于稳定性）
        if (stabilityScore > 70) {
          setFocusTime(prev => prev + 1)
        }
      }, 1000)
    } else if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
    
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [isTraining, isPaused, config.duration, stabilityScore, stopTraining])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current)
      if (movementTimer.current) clearInterval(movementTimer.current)
      if (distractionTimer.current) clearInterval(distractionTimer.current)
    }
  }, [])

  const getModeIcon = (mode: GazeMode) => {
    switch (mode) {
      case 'static': return <Eye className="w-4 h-4" />
      case 'dynamic': return <Target className="w-4 h-4" />
      case 'anti-distraction': return <Zap className="w-4 h-4" />
    }
  }

  const getModeColor = (mode: GazeMode) => {
    switch (mode) {
      case 'static': return 'bg-blue-500'
      case 'dynamic': return 'bg-green-500'
      case 'anti-distraction': return 'bg-orange-500'
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-cyan-600">
          {t('gazeTitle')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t('gazeDesc')}
        </p>
        
        {/* 模式选择 */}
        <div className="flex gap-4 mb-6">
          {(['static', 'dynamic', 'anti-distraction'] as GazeMode[]).map((modeOption) => (
            <Button
              key={modeOption}
              variant={mode === modeOption ? 'default' : 'outline'}
              onClick={() => setMode(modeOption)}
              disabled={isTraining}
              className="flex items-center gap-2"
            >
              {getModeIcon(modeOption)}
              {t(`mode.${modeOption}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 训练区域 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('trainingArea')}</span>
                <Badge className={getModeColor(mode)}>
                  {getModeIcon(mode)}
                  {t(`mode.${mode}`)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={gameAreaRef}
                className="relative w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-slate-300 overflow-hidden cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleFocusLoss}
                tabIndex={0}
                onBlur={handleFocusLoss}
              >
                {/* 主目标 */}
                <motion.div
                  className="absolute rounded-full bg-black shadow-lg border-4 border-cyan-200 flex items-center justify-center"
                  style={{
                    width: config.targetSize,
                    height: config.targetSize,
                    left: `${targetPosition.x}%`,
                    top: `${targetPosition.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={mode === 'dynamic' ? {
                    scale: [1, 1.1, 1],
                    transition: { duration: 2, repeat: Infinity }
                  } : {}}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
                
                {/* 干扰元素 */}
                <AnimatePresence>
                  {distractions.map((distraction) => (
                    <motion.div
                      key={distraction.id}
                      className="absolute rounded-full"
                      style={{
                        width: distraction.size,
                        height: distraction.size,
                        backgroundColor: distraction.color,
                        left: `${distraction.position.x}%`,
                        top: `${distraction.position.y}%`,
                        opacity: distraction.opacity,
                        transform: 'translate(-50%, -50%)'
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: distraction.opacity }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </AnimatePresence>
                
                {/* 训练状态覆盖层 */}
                {!isTraining && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Eye className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-lg font-semibold">{t('clickToStart')}</p>
                    </div>
                  </div>
                )}
                
                {isPaused && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Pause className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-lg font-semibold">{t('trainingPaused')}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 控制按钮 */}
              <div className="flex justify-center gap-4 mt-6">
                {!isTraining ? (
                  <Button onClick={startTraining} size="lg" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    {t('startTraining')}
                  </Button>
                ) : (
                  <>
                    <Button onClick={togglePause} variant="outline" size="lg">
                      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      {isPaused ? t('resume') : t('pause')}
                    </Button>
                    <Button onClick={stopTraining} variant="destructive" size="lg">
                      <RotateCcw className="w-5 h-5" />
                      {t('stop')}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 统计面板 */}
        <div className="space-y-6">
          {/* 实时统计 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('realTimeStats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t('timeElapsed')}</span>
                  <span>{time}s / {config.duration}s</span>
                </div>
                <Progress value={(time / config.duration) * 100} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t('focusTime')}</span>
                  <span>{focusTime}s</span>
                </div>
                <Progress value={(focusTime / Math.max(time, 1)) * 100} className="bg-green-100" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t('stability')}</span>
                  <span>{Math.round(stabilityScore)}%</span>
                </div>
                <Progress value={stabilityScore} className="bg-blue-100" />
              </div>
              
              {mode === 'dynamic' && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{t('trackingAccuracy')}</span>
                    <span>{Math.round(trackingAccuracy)}%</span>
                  </div>
                  <Progress value={trackingAccuracy} className="bg-purple-100" />
                </div>
              )}
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('interruptions')}</span>
                  <span className="text-lg font-bold text-red-500">{interruptionCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 个人记录 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {t('personalRecords')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('level')}</span>
                <span className="font-semibold">{progress.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('bestScore')}</span>
                <span className="font-semibold">{progress.bestScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('totalSessions')}</span>
                <span className="font-semibold">{progress.totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('totalTime')}</span>
                <span className="font-semibold">{Math.round(progress.totalTimeSpent / 60)}min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}