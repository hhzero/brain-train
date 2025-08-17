'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTrainingStore } from '@/stores/training-store'
import { SchulteTrainingConfig, SchulteTrainingResult } from '@/types/training'
import { Play, Pause, RotateCcw, Settings, Grid3X3, Trophy, Target, Zap, Clock } from 'lucide-react'
import { toast } from 'sonner'

type SchulteMode = 'sequential' | 'reverse' | 'random'
type GridSize = 3 | 4 | 5 | 6 | 7 | 8 | 9

interface GridCell {
  value: number
  index: number
  isFound: boolean
  isTarget: boolean
  isError: boolean
}

export default function SchulteClient() {
  const t = useTranslations('schulte')
  const { 
    startTrainingSession, 
    completeTrainingSession, 
    currentSession,
    getProgressByType,
    getDifficultyRecommendation,
    settings
  } = useTrainingStore()
  
  // 训练状态
  const [mode, setMode] = useState<SchulteMode>('sequential')
  const [gridSize, setGridSize] = useState<GridSize>(5)
  const [isTraining, setIsTraining] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [time, setTime] = useState(0)
  const [currentTarget, setCurrentTarget] = useState(1)
  const [grid, setGrid] = useState<GridCell[]>([])
  const [foundNumbers, setFoundNumbers] = useState<number[]>([])
  const [errorCount, setErrorCount] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastClickTime, setLastClickTime] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState(false)
  
  // 配置
  const [config, setConfig] = useState<SchulteTrainingConfig>({
    difficulty: getDifficultyRecommendation('schulte'),
    mode: 'sequential',
    duration: 300,
    adaptiveDifficulty: settings.adaptiveDifficultyEnabled,
    soundEnabled: settings.soundEnabled,
    vibrationEnabled: settings.vibrationEnabled,
    gridSize: 5,
    timeLimit: 300
  })
  
  const timer = useRef<NodeJS.Timeout | null>(null)
  const startTime = useRef<number>(0)
  
  const progress = getProgressByType('schulte')

  // 生成网格
  const generateGrid = useCallback(() => {
    const totalCells = gridSize * gridSize
    const numbers = Array.from({ length: totalCells }, (_, i) => i + 1)
    const shuffled = numbers.sort(() => Math.random() - 0.5)
    
    const newGrid: GridCell[] = shuffled.map((value, index) => ({
      value,
      index,
      isFound: false,
      isTarget: false,
      isError: false
    }))
    
    setGrid(newGrid)
    setCurrentTarget(mode === 'reverse' ? totalCells : 1)
    setFoundNumbers([])
    setErrorCount(0)
    setReactionTimes([])
    setIsCompleted(false)
  }, [gridSize, mode])

  // 开始训练
  const startTraining = useCallback(() => {
    const trainingConfig: SchulteTrainingConfig = {
      ...config,
      gridSize,
      mode
    }
    
    startTrainingSession('schulte', trainingConfig)
    setIsTraining(true)
    setIsPaused(false)
    setTime(0)
    startTime.current = Date.now()
    setLastClickTime(Date.now())
    generateGrid()
    
    toast.success(t('trainingStarted'))
  }, [config, gridSize, mode, startTrainingSession, generateGrid, t])

  // 暂停/恢复训练
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
    if (isPaused) {
      setLastClickTime(Date.now())
      toast.info(t('trainingResumed'))
    } else {
      toast.info(t('trainingPaused'))
    }
  }, [isPaused, t])

  // 停止训练
  const stopTraining = useCallback(() => {
    if (!currentSession) return
    
    const totalCells = gridSize * gridSize
    const completionRate = (foundNumbers.length / totalCells) * 100
    const averageReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length 
      : 0
    
    const result: SchulteTrainingResult = {
      sessionId: currentSession.id,
      type: 'schulte',
      score: Math.floor(completionRate * (1 - errorCount / totalCells) * (300 / Math.max(time, 1)) * 100),
      accuracy: Math.floor(((foundNumbers.length - errorCount) / foundNumbers.length) * 100) || 0,
      reactionTime: Math.round(averageReactionTime),
      totalAttempts: foundNumbers.length + errorCount,
      correctAttempts: foundNumbers.length,
      incorrectAttempts: errorCount,
      streakBest: foundNumbers.length,
      timeSpent: time,
      difficultyProgression: [config.difficulty],
      detailedMetrics: {
        gridSize,
        mode,
        completionRate,
        averageReactionTime,
        reactionTimes: reactionTimes.slice(-10) // 保留最后10次反应时间
      },
      timestamp: new Date(),
      gridSize,
      completionTime: time,
      clickSequence: foundNumbers,
      errorCount,
      visualScanningScore: Math.floor(completionRate * (1 - errorCount / totalCells) * 100)
    }
    
    completeTrainingSession(result)
    setIsTraining(false)
    setIsPaused(false)
    
    if (timer.current) clearInterval(timer.current)
    
    toast.success(t('trainingCompleted', { score: result.score }))
  }, [currentSession, gridSize, foundNumbers, errorCount, reactionTimes, time, config, mode, completeTrainingSession, t])

  // 处理格子点击
  const handleCellClick = useCallback((cell: GridCell) => {
    if (!isTraining || isPaused || isCompleted) return
    
    const now = Date.now()
    const reactionTime = now - lastClickTime
    
    let isCorrect = false
    let nextTarget = currentTarget
    
    switch (mode) {
      case 'sequential':
        isCorrect = cell.value === currentTarget
        nextTarget = currentTarget + 1
        break
      case 'reverse':
        isCorrect = cell.value === currentTarget
        nextTarget = currentTarget - 1
        break
      case 'random':
        // 随机模式：任意未找到的数字都可以点击
        isCorrect = !foundNumbers.includes(cell.value)
        // 随机选择下一个目标
        const remaining = Array.from({ length: gridSize * gridSize }, (_, i) => i + 1)
          .filter(num => !foundNumbers.includes(num) && num !== cell.value)
        nextTarget = remaining[Math.floor(Math.random() * remaining.length)] || currentTarget
        break
    }
    
    if (isCorrect) {
      setFoundNumbers(prev => [...prev, cell.value])
      setReactionTimes(prev => [...prev, reactionTime])
      setCurrentTarget(nextTarget)
      setLastClickTime(now)
      
      // 更新网格状态
      setGrid(prev => prev.map(c => 
        c.value === cell.value 
          ? { ...c, isFound: true }
          : c
      ))
      
      // 检查是否完成
      if (foundNumbers.length + 1 >= gridSize * gridSize) {
        setIsCompleted(true)
        stopTraining()
      }
      
      if (settings.soundEnabled) {
        // 播放成功音效
        const audio = new Audio('/sounds/success.mp3')
        audio.play().catch(() => {})
      }
    } else {
      setErrorCount(prev => prev + 1)
      
      // 显示错误反馈
      setGrid(prev => prev.map(c => 
        c.value === cell.value 
          ? { ...c, isError: true }
          : c
      ))
      
      // 清除错误状态
      setTimeout(() => {
        setGrid(prev => prev.map(c => ({ ...c, isError: false })))
      }, 500)
      
      if (settings.soundEnabled) {
        // 播放错误音效
        const audio = new Audio('/sounds/error.mp3')
        audio.play().catch(() => {})
      }
      
      toast.error(t('wrongNumber'))
    }
  }, [isTraining, isPaused, isCompleted, currentTarget, mode, foundNumbers, gridSize, lastClickTime, settings.soundEnabled, stopTraining, t])

  // 主计时器
  useEffect(() => {
    if (isTraining && !isPaused) {
      timer.current = setInterval(() => {
        setTime(prev => {
          const newTime = prev + 1
          if (newTime >= (config.timeLimit || 300)) {
            stopTraining()
          }
          return newTime
        })
      }, 1000)
    } else if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
    
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [isTraining, isPaused, config.timeLimit, stopTraining])

  // 更新目标高亮 - 已注释，避免提前显示目标数字
  // useEffect(() => {
  //   if (isTraining) {
  //     setGrid(prev => prev.map(cell => ({
  //       ...cell,
  //       isTarget: cell.value === currentTarget && !cell.isFound
  //     })))
  //   }
  // }, [currentTarget, isTraining])

  // 初始化网格
  useEffect(() => {
    generateGrid()
  }, [generateGrid])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  const getModeIcon = (mode: SchulteMode) => {
    switch (mode) {
      case 'sequential': return <Target className="w-4 h-4" />
      case 'reverse': return <RotateCcw className="w-4 h-4" />
      case 'random': return <Zap className="w-4 h-4" />
    }
  }

  const getModeColor = (mode: SchulteMode) => {
    switch (mode) {
      case 'sequential': return 'bg-blue-500'
      case 'reverse': return 'bg-purple-500'
      case 'random': return 'bg-orange-500'
    }
  }

  const getGridSizeLabel = (size: GridSize) => `${size}×${size}`

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-cyan-600">
          {t('schulteTitle')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t('schulteDesc')}
        </p>
        
        {/* 配置选项 */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* 模式选择 */}
          <div className="flex gap-2">
            {(['sequential', 'reverse', 'random'] as SchulteMode[]).map((modeOption) => (
              <Button
                key={modeOption}
                variant={mode === modeOption ? 'default' : 'outline'}
                onClick={() => setMode(modeOption)}
                disabled={isTraining}
                className="flex items-center gap-2"
                size="sm"
              >
                {getModeIcon(modeOption)}
                {t(`mode.${modeOption}`)}
              </Button>
            ))}
          </div>
          
          {/* 网格大小选择 */}
          <Select 
            value={gridSize.toString()} 
            onValueChange={(value) => setGridSize(parseInt(value) as GridSize)}
            disabled={isTraining}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 4, 5, 6, 7, 8, 9].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {getGridSizeLabel(size as GridSize)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 训练区域 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('trainingArea')}</span>
                <div className="flex items-center gap-2">
                  <Badge className={getModeColor(mode)}>
                    {getModeIcon(mode)}
                    {t(`mode.${mode}`)}
                  </Badge>
                  <Badge variant="outline">
                    <Grid3X3 className="w-4 h-4 mr-1" />
                    {getGridSizeLabel(gridSize)}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <div 
                  className="grid gap-3 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-inner border border-slate-200"
                  style={{ 
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    width: Math.min(600, gridSize * 80 + 48),
                    aspectRatio: '1'
                  }}
                >
                  <AnimatePresence>
                    {grid.map((cell) => (
                      <motion.button
                        key={cell.index}
                        onClick={() => handleCellClick(cell)}
                        className={`
                          aspect-square flex items-center justify-center font-bold
                          rounded-lg border-2 transition-all duration-200 shadow-sm
                          ${cell.isFound
                            ? 'bg-green-100 border-green-300 text-green-700'
                            : cell.isError
                            ? 'bg-red-100 border-red-300 text-red-700 ring-2 ring-red-400'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md'
                          }
                          ${gridSize <= 5 ? 'text-xl' : gridSize <= 7 ? 'text-lg' : 'text-base'}
                        `}
                        disabled={!isTraining || isPaused || cell.isFound}

                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: cell.index * 0.02 }}
                      >
                        {cell.value}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* 当前目标提示 */}
              {isTraining && !isCompleted && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 rounded-full">
                    <Target className="w-5 h-5 text-cyan-600" />
                    <span className="text-cyan-800 font-semibold">
                      {t('findNumber')} ：{currentTarget}
                    </span>
                  </div>
                </div>
              )}
              
              {/* 控制按钮 */}
              <div className="flex justify-center gap-4">
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
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t('realTimeStats')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-white mb-1">
                  <span>{t('timeElapsed')}</span>
                  <span>{time}s / {config.timeLimit || 300}s</span>
                </div>
                <Progress value={(time / (config.timeLimit || 300)) * 100} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-white mb-1">
                  <span>{t('progress')}</span>
                  <span>{foundNumbers.length} / {gridSize * gridSize}</span>
                </div>
                <Progress value={(foundNumbers.length / (gridSize * gridSize)) * 100} className="bg-green-100" />
              </div>
              
              <div className="pt-2 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white">{t('errors')}</span>
                  <span className="text-lg font-bold text-red-600">{errorCount}</span>
                </div>
                {reactionTimes.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">{t('avgReaction')}</span>
                    <span className="text-sm font-semibold text-gray-100">
                      {Math.round(reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length)}ms
                    </span>
                  </div>
                )}
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
                <span className="text-sm text-white">{t('level')}</span>
                <span className="font-semibold text-gray-100">{progress.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-white">{t('bestScore')}</span>
                <span className="font-semibold text-gray-100">{progress.bestScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-white">{t('totalSessions')}</span>
                <span className="font-semibold text-gray-100">{progress.totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-white">{t('totalTime')}</span>
                <span className="font-semibold text-gray-100">{Math.round(progress.totalTimeSpent / 60)}min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}