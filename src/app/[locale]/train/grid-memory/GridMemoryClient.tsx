'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import TouchOptimizedButton from '@/components/TouchOptimizedButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RotateCcw, Star, Trophy, Brain, Zap, Clock, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import StarfieldBackground from '@/components/StarfieldBackground'
import TrainingErrorBoundary from '@/components/TrainingErrorBoundary'
import { useTranslations } from 'next-intl'
import { useTrainingStore } from '@/stores/training-store'
import type { DifficultyLevel, TrainingMode } from '@/types/training'

// 游戏状态枚举
enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  MEMORIZING = 'memorizing',
  SELECTING = 'selecting',
  RESULTS = 'results'
}

// 难度配置
interface DifficultyConfig {
  gridSize: number
  markedCells: number
  memoryTime: number
  name: string
}

// 方格状态
interface GridCell {
  id: number
  isMarked: boolean
  isSelected: boolean
  isCorrect?: boolean
  color?: string
}

// 游戏统计
interface GameStats {
  score: number
  correctSelections: number
  wrongSelections: number
  accuracy: number
  timeSpent: number
}

// 颜色方案
const COLORS = [
  '#10B981', // 薄荷绿
  '#EC4899', // 粉色
  '#8B5CF6', // 紫色
  '#3B82F6', // 蓝色
  '#F59E0B', // 橙色
  '#EF4444', // 红色
  '#06B6D4', // 青色
  '#84CC16'  // 绿色
]

// 错误颜色
const ERROR_COLOR = '#EF4444'

function GridMemoryClientContent() {
  // 国际化翻译
  const t = useTranslations('gridMemory')
  
  // 训练商店
  const { startTrainingSession, completeTrainingSession } = useTrainingStore()
  
  // 游戏状态
  const [gameState, setGameState] = useState<GameState>(GameState.MENU)
  const [selectedDifficulty, setSelectedDifficulty] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [grid, setGrid] = useState<GridCell[]>([])
  const [markedCells, setMarkedCells] = useState<number[]>([])
  const [selectedCells, setSelectedCells] = useState<number[]>([])
  const [wrongSelections, setWrongSelections] = useState(0)
  const [memoryTimeLeft, setMemoryTimeLeft] = useState(0)
  const [gameStartTime, setGameStartTime] = useState(0)
  
  // 游戏统计
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    correctSelections: 0,
    wrongSelections: 0,
    accuracy: 0,
    timeSpent: 0
  })
  
  // 定时器引用
  const memoryTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  
  // 难度配置
  const difficulties: DifficultyConfig[] = useMemo(() => [
    { gridSize: 3, markedCells: 3, memoryTime: 3000, name: t('difficulty.easy') },
    { gridSize: 4, markedCells: 4, memoryTime: 4000, name: t('difficulty.medium') },
    { gridSize: 5, markedCells: 5, memoryTime: 5000, name: t('difficulty.hard') },
    { gridSize: 6, markedCells: 6, memoryTime: 6000, name: t('difficulty.expert') }
  ], [t])
  
  // 初始化网格
  const initializeGrid = useCallback((gridSize: number) => {
    const totalCells = gridSize * gridSize
    const newGrid: GridCell[] = []
    
    for (let i = 0; i < totalCells; i++) {
      newGrid.push({
        id: i,
        isMarked: false,
        isSelected: false
      })
    }
    
    return newGrid
  }, [])
  
  // 随机选择要标记的方格
  const selectRandomCells = useCallback((gridSize: number, count: number) => {
    const totalCells = gridSize * gridSize
    const selected: number[] = []
    
    while (selected.length < count) {
      const randomIndex = Math.floor(Math.random() * totalCells)
      if (!selected.includes(randomIndex)) {
        selected.push(randomIndex)
      }
    }
    
    return selected
  }, [])
  
  // 开始游戏
  const startGame = useCallback(() => {
    const difficulty = difficulties[selectedDifficulty]
    const newGrid = initializeGrid(difficulty.gridSize)
    const marked = selectRandomCells(difficulty.gridSize, difficulty.markedCells)
    
    // 为标记的方格分配颜色
    marked.forEach((cellIndex, colorIndex) => {
      newGrid[cellIndex].isMarked = true
      newGrid[cellIndex].color = COLORS[colorIndex % COLORS.length]
    })
    
    setGrid(newGrid)
    setMarkedCells(marked)
    setSelectedCells([])
    setWrongSelections(0)
    setMemoryTimeLeft(difficulty.memoryTime)
    setGameStartTime(Date.now())
    setGameState(GameState.MEMORIZING)
    
    // 开始训练会话
    startTrainingSession('grid-memory', {
      difficulty: 'intermediate' as DifficultyLevel,
      mode: 'practice' as TrainingMode,
      duration: 300,
      adaptiveDifficulty: false,
      soundEnabled: true,
      vibrationEnabled: false,
      gridSize: difficulty.gridSize as 3 | 4 | 5 | 6,
      memoryTime: difficulty.memoryTime,
      maxErrors: 2
     });
    
    // 生成会话ID
    sessionIdRef.current = `grid-memory-${Date.now()}`
    
    // 开始记忆倒计时
    const timer = setInterval(() => {
      setMemoryTimeLeft(prev => {
        if (prev <= 100) {
          clearInterval(timer)
          startSelectionPhase()
          return 0
        }
        return prev - 100
      })
    }, 100)
    
    memoryTimerRef.current = timer
  }, [selectedDifficulty, difficulties, initializeGrid, selectRandomCells, startTrainingSession])
  
  // 开始选择阶段
  const startSelectionPhase = useCallback(() => {
    setGameState(GameState.SELECTING)
    
    // 隐藏标记颜色
    setGrid(prev => prev.map(cell => ({
      ...cell,
      color: cell.isMarked ? undefined : cell.color
    })))
  }, [])
  
  // 处理方格点击
  const handleCellClick = useCallback((cellId: number) => {
    if (gameState !== GameState.SELECTING) return
    
    const cell = grid[cellId]
    if (cell.isSelected) return // 已经选择过的方格不能再选
    
    const isCorrect = cell.isMarked
    const newSelectedCells = [...selectedCells, cellId]
    
    // 更新网格状态
    setGrid(prev => prev.map(c => {
      if (c.id === cellId) {
        return {
          ...c,
          isSelected: true,
          isCorrect,
          color: isCorrect ? 
            prev.find(originalCell => originalCell.id === cellId && originalCell.isMarked)?.color || COLORS[0] :
            ERROR_COLOR
        }
      }
      return c
    }))
    
    setSelectedCells(newSelectedCells)
    
    if (!isCorrect) {
      const newWrongCount = wrongSelections + 1
      setWrongSelections(newWrongCount)
      
      // 如果错误超过2个，结束游戏
      if (newWrongCount >= 2) {
        endGame(false)
        return
      }
    }
    
    // 检查是否选择了所有正确的方格
    const correctSelections = newSelectedCells.filter(id => 
      grid.find(c => c.id === id)?.isMarked
    )
    
    if (correctSelections.length === markedCells.length) {
      endGame(true)
    }
  }, [gameState, grid, selectedCells, wrongSelections, markedCells.length])
  
  // 结束游戏
  const endGame = useCallback((success: boolean) => {
    const timeSpent = Date.now() - gameStartTime
    const correctCount = selectedCells.filter(id => 
      grid.find(c => c.id === id)?.isMarked
    ).length
    
    const accuracy = selectedCells.length > 0 ? (correctCount / selectedCells.length) * 100 : 0
    const score = Math.max(0, correctCount * 100 - wrongSelections * 50)
    
    const finalStats: GameStats = {
      score,
      correctSelections: correctCount,
      wrongSelections,
      accuracy,
      timeSpent
    }
    
    setStats(finalStats)
    setGameState(GameState.RESULTS)
    
    // 完成训练会话
    if (sessionIdRef.current) {
      const difficulty = difficulties[selectedDifficulty]
      completeTrainingSession({
        sessionId: sessionIdRef.current,
        type: 'grid-memory',
        score,
        accuracy,
        reactionTime: 0, // 方格记忆游戏没有反应时间概念
        totalAttempts: markedCells.length,
        correctAttempts: correctCount,
        incorrectAttempts: wrongSelections,
        streakBest: Math.max(0, correctCount - wrongSelections),
        timeSpent,
        difficultyProgression: ['intermediate' as DifficultyLevel],
        detailedMetrics: {
          gridSize: difficulty.gridSize,
          targetCount: difficulty.markedCells,
          memoryTime: difficulty.memoryTime,
          selectionTime: timeSpent,
          errorCount: wrongSelections,
          memoryScore: score,
          spatialMemoryIndex: Math.round(accuracy * 10)
        },
        timestamp: new Date(),
        // GridMemoryResult 特定属性
        gridSize: difficulty.gridSize,
        targetCount: difficulty.markedCells,
        memoryTime: difficulty.memoryTime,
        selectionTime: timeSpent,
        errorCount: wrongSelections,
        memoryScore: score,
        spatialMemoryIndex: Math.round(accuracy * 10)
      })
    }
    
    // 清理定时器
    if (memoryTimerRef.current) {
      clearTimeout(memoryTimerRef.current)
      memoryTimerRef.current = null
    }
  }, [gameStartTime, selectedCells, grid, wrongSelections, markedCells.length, selectedDifficulty, completeTrainingSession])
  
  // 重置游戏
  const resetGame = useCallback(() => {
    setGameState(GameState.MENU)
    setGrid([])
    setMarkedCells([])
    setSelectedCells([])
    setWrongSelections(0)
    setMemoryTimeLeft(0)
    
    if (memoryTimerRef.current) {
      clearTimeout(memoryTimerRef.current)
      memoryTimerRef.current = null
    }
  }, [])
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (memoryTimerRef.current) {
        clearTimeout(memoryTimerRef.current)
      }
    }
  }, [])
  
  // 渲染网格
  const renderGrid = () => {
    const difficulty = difficulties[selectedDifficulty]
    const gridSize = difficulty.gridSize
    
    return (
      <div 
        className="grid gap-2 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          maxWidth: `${Math.min(400, gridSize * 60)}px`
        }}
      >
        {grid.map((cell) => (
          <motion.button
            key={cell.id}
            className={`
              aspect-square rounded-lg border-2 transition-all duration-300
              ${gameState === GameState.SELECTING ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
              ${cell.isSelected ? 'border-white' : 'border-purple-400/30'}
            `}
            style={{
              backgroundColor: cell.color || 'rgba(139, 92, 246, 0.1)',
              boxShadow: cell.color ? `0 0 20px ${cell.color}40` : 'none'
            }}
            onClick={() => handleCellClick(cell.id)}
            whileHover={gameState === GameState.SELECTING ? { scale: 1.05 } : {}}
            whileTap={gameState === GameState.SELECTING ? { scale: 0.95 } : {}}
            animate={{
              scale: cell.isMarked && gameState === GameState.MEMORIZING ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.5, repeat: gameState === GameState.MEMORIZING ? Infinity : 0 }}
          >
            {cell.isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-full h-full flex items-center justify-center"
              >
                {cell.isCorrect ? (
                  <Star className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-white text-xl font-bold">×</span>
                )}
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    )
  }
  
  return (
    <div className="relative min-h-screen">
      <StarfieldBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto p-6">
        {/* 菜单界面 */}
        {gameState === GameState.MENU && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* 标题 */}
            <div className="text-center">
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-4"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {t('title')}
              </motion.h1>
              <p className="text-purple-200 text-lg">{t('description')}</p>
            </div>
            
            {/* 难度选择 */}
            <Card className="bg-purple-900/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-100 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {t('selectDifficulty')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {difficulties.map((difficulty, index) => (
                    <motion.button
                      key={index}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-300
                        ${selectedDifficulty === index 
                          ? 'border-pink-400 bg-pink-500/20' 
                          : 'border-purple-400/30 bg-purple-800/20 hover:border-purple-400/50'
                        }
                      `}
                      onClick={() => setSelectedDifficulty(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-left">
                        <h3 className="text-purple-100 font-semibold mb-2">
                          {difficulty.name}
                        </h3>
                        <div className="text-sm text-purple-300 space-y-1">
                          <p>{t('gridSize')}: {difficulty.gridSize}×{difficulty.gridSize}</p>
                          <p>{t('markedCells')}: {difficulty.markedCells}</p>
                          <p>{t('memoryTime')}: {difficulty.memoryTime / 1000}s</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* 开始按钮 */}
            <div className="text-center">
              <TouchOptimizedButton
                onClick={startGame}
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:via-purple-700 hover:to-cyan-600 px-8 py-4 text-lg"
                hapticFeedback
                preventDoubleClick
              >
                <Play className="w-5 h-5 mr-2" />
                {t('startGame')}
              </TouchOptimizedButton>
            </div>
          </motion.div>
        )}
        
        {/* 记忆阶段 */}
        {gameState === GameState.MEMORIZING && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-100 mb-4">
                {t('memorizePhase')}
              </h2>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 text-lg font-semibold">
                  {Math.ceil(memoryTimeLeft / 1000)}s
                </span>
              </div>
              <Progress 
                value={(memoryTimeLeft / difficulties[selectedDifficulty].memoryTime) * 100} 
                className="w-64 mx-auto"
              />
            </div>
            
            {renderGrid()}
          </motion.div>
        )}
        
        {/* 选择阶段 */}
        {gameState === GameState.SELECTING && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-100 mb-4">
                {t('selectPhase')}
              </h2>
              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-green-400 text-xl font-bold">
                    {selectedCells.filter(id => grid.find(c => c.id === id)?.isMarked).length}
                  </div>
                  <div className="text-green-400 text-sm">{t('correct')}</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 text-xl font-bold">{wrongSelections}</div>
                  <div className="text-red-400 text-sm">{t('wrong')}</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 text-xl font-bold">{markedCells.length}</div>
                  <div className="text-purple-400 text-sm">{t('total')}</div>
                </div>
              </div>
            </div>
            
            {renderGrid()}
            
            <div className="text-center">
              <TouchOptimizedButton
                onClick={resetGame}
                variant="outline"
                className="border-purple-400/50 text-purple-200 hover:bg-purple-800/50"
                hapticFeedback
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('backToMenu')}
              </TouchOptimizedButton>
            </div>
          </motion.div>
        )}
        
        {/* 结果界面 */}
        {gameState === GameState.RESULTS && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <motion.h2 
                className="text-3xl font-bold text-purple-100 mb-4"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stats.wrongSelections < 2 ? t('gameComplete') : t('gameOver')}
              </motion.h2>
            </div>
            
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-purple-900/30 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-100 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    {t('score')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {stats.score}
                  </div>
                  <div className="space-y-2 text-sm text-purple-300">
                    <div className="flex justify-between">
                      <span>{t('correct')}:</span>
                      <span className="text-green-400">{stats.correctSelections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('wrong')}:</span>
                      <span className="text-red-400">{stats.wrongSelections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('accuracy')}:</span>
                      <span className="text-cyan-400">{stats.accuracy.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-900/30 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-100 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-pink-400" />
                    {t('performance')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.accuracy >= 80 ? (
                      <motion.div 
                        className="flex items-center justify-center gap-2 text-green-400"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <motion.span
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          🌟
                        </motion.span>
                        <span>{t('excellent')}</span>
                      </motion.div>
                    ) : stats.accuracy >= 60 ? (
                      <motion.div 
                        className="flex items-center justify-center gap-2 text-yellow-400"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <motion.span
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          👍
                        </motion.span>
                        <span>{t('good')}</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="flex items-center justify-center gap-2 text-orange-400"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          💪
                        </motion.span>
                        <span>{t('keepTrying')}</span>
                      </motion.div>
                    )}
                    
                    <div className="text-sm text-purple-300">
                      {t('timeSpent')}: {(stats.timeSpent / 1000).toFixed(1)}s
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-center gap-6">
              <TouchOptimizedButton
                onClick={resetGame}
                variant="outline"
                className="border-purple-400/50 text-purple-200 hover:bg-purple-800/50 px-8 py-3"
                hapticFeedback
                preventDoubleClick
              >
                {t('backToMenu')}
              </TouchOptimizedButton>
              
              <TouchOptimizedButton
                onClick={startGame}
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:via-purple-700 hover:to-cyan-600 px-8 py-3"
                hapticFeedback
                preventDoubleClick
              >
                <Play className="w-4 h-4 mr-2" />
                {t('playAgain')}
              </TouchOptimizedButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// 主组件 - 包裹错误边界
export default function GridMemoryClient() {
  return (
    <TrainingErrorBoundary>
      <GridMemoryClientContent />
    </TrainingErrorBoundary>
  )
}