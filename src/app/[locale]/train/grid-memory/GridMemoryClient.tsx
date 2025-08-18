'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import TouchOptimizedButton from '@/components/TouchOptimizedButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RotateCcw, Star, Trophy, Brain, Zap, Clock, Target, ArrowLeft, X, Percent, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import StarfieldBackground from '@/components/StarfieldBackground'
import TrainingErrorBoundary from '@/components/TrainingErrorBoundary'
import { useTranslations } from 'next-intl'
import { useTrainingStore } from '@/stores/training-store'
import { useRouter } from 'next/navigation'
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
  const tCommon = useTranslations('common')
  
  // 路由导航
  const router = useRouter()
  
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
  
  // 渲染预览网格
  const renderPreviewGrid = () => {
    const difficulty = difficulties[selectedDifficulty]
    const gridSize = difficulty.gridSize
    
    // 计算网格尺寸，确保每个格子至少有50px，最大不超过80px
    const cellSize = Math.max(50, Math.min(80, Math.floor(500 / gridSize)))
    const gridWidth = cellSize * gridSize + (gridSize - 1) * 8 // 8px gap
    
    // 创建预览网格数据
    const previewGrid = []
    for (let i = 0; i < gridSize * gridSize; i++) {
      previewGrid.push({
        id: i,
        isPreview: true
      })
    }
    
    return (
      <div 
        className="grid gap-2 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: `${gridWidth}px`,
          maxWidth: '100%'
        }}
      >
        {previewGrid.map((cell) => (
          <div
            key={cell.id}
            className="aspect-square rounded-lg border-2 border-purple-400/30 bg-purple-800/10 transition-all duration-300"
            style={{
              minWidth: `${cellSize}px`,
              minHeight: `${cellSize}px`
            }}
          />
        ))}
      </div>
    )
  }
  
  // 渲染网格
  const renderGrid = () => {
    const difficulty = difficulties[selectedDifficulty]
    const gridSize = difficulty.gridSize
    
    // 计算网格尺寸，确保每个格子至少有50px，最大不超过80px
    const cellSize = Math.max(50, Math.min(80, Math.floor(500 / gridSize)))
    const gridWidth = cellSize * gridSize + (gridSize - 1) * 8 // 8px gap
    
    return (
      <div 
        className="grid gap-2 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: `${gridWidth}px`,
          maxWidth: '100%'
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
              boxShadow: cell.color ? `0 0 20px ${cell.color}40` : 'none',
              minWidth: `${cellSize}px`,
              minHeight: `${cellSize}px`
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
                  <Check className="w-6 h-6 text-white" />
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
      
      <div className="relative z-10 max-w-7xl mx-auto p-4">
        {/* 头部区域 - 返回按钮和标题在同一行 */}
        <div className="flex items-center justify-between mb-6">
          {/* 返回按钮 */}
          <TouchOptimizedButton
            onClick={() => router.back()}
            variant="outline"
            className="border-purple-400/50 text-purple-200 hover:bg-purple-800/50 px-4 py-2"
            hapticFeedback
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {tCommon('back')}
          </TouchOptimizedButton>
          
          {/* 标题区域 */}
          <div className="text-center flex-1">
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-3"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {t('title')}
            </motion.h1>
            <p className="text-purple-200 text-lg">{t('description')}</p>
          </div>
          
          {/* 右侧占位，保持标题居中 */}
          <div className="w-[120px]"></div>
        </div>
        
        {/* 顶部控制区域 - 优化布局和对齐 */}
        <div className="mb-8">
          {/* 难度选择区域 - 水平布局 */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-4 mb-6">
            {/* 难度选择标题 - 左侧 */}
            <div className="flex-shrink-0">
              <h2 className="text-purple-100 text-xl font-semibold">
                {t('selectDifficulty')}
              </h2>
            </div>
            
            {/* 难度选择按钮 - 右侧 */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            {difficulties.map((difficulty, index) => (
              <motion.button
                key={index}
                className={`
                  px-6 py-3 rounded-lg border-2 transition-all duration-300 min-w-[100px]
                  ${selectedDifficulty === index 
                    ? 'border-pink-400 bg-pink-500/20 shadow-lg shadow-pink-500/20' 
                    : 'border-purple-400/30 bg-purple-800/20 hover:border-purple-400/50 hover:bg-purple-700/30'
                  }
                  ${gameState !== GameState.MENU ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => gameState === GameState.MENU && setSelectedDifficulty(index)}
                whileHover={gameState === GameState.MENU ? { scale: 1.05 } : {}}
                whileTap={gameState === GameState.MENU ? { scale: 0.95 } : {}}
                disabled={gameState !== GameState.MENU}
              >
                <span className="text-purple-100 font-medium">
                  {difficulty.name}
                </span>
              </motion.button>
            ))}
            </div>
          </div>
          
          {/* 操作按钮区域 - 居中对齐 */}
          <div className="flex justify-center gap-6">
            {gameState === GameState.MENU && (
              <TouchOptimizedButton
                onClick={startGame}
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:via-purple-700 hover:to-cyan-600 px-10 py-4 text-lg font-semibold shadow-lg"
                hapticFeedback
                preventDoubleClick
              >
                <Play className="w-5 h-5 mr-3" />
                {t('startGame')}
              </TouchOptimizedButton>
            )}
            
            {gameState !== GameState.MENU && (
              <TouchOptimizedButton
                onClick={resetGame}
                variant="outline"
                className="border-purple-400/50 text-purple-200 hover:bg-purple-800/50 px-8 py-4 text-lg font-medium shadow-lg"
                hapticFeedback
              >
                <RotateCcw className="w-5 h-5 mr-3" />
                {t('backToMenu')}
              </TouchOptimizedButton>
            )}
            
            {gameState === GameState.RESULTS && (
              <TouchOptimizedButton
                onClick={startGame}
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:via-purple-700 hover:to-cyan-600 px-8 py-4 text-lg font-semibold shadow-lg"
                hapticFeedback
                preventDoubleClick
              >
                <Play className="w-5 h-5 mr-3" />
                {t('playAgain')}
              </TouchOptimizedButton>
            )}
          </div>
        </div>
        
        {/* 主游戏区域 - 优化布局和对齐 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* 左侧游戏区域 - 占2/3宽度，优化对齐 */}
          <div className="lg:col-span-2">
            <div className="min-h-[500px] flex flex-col justify-center bg-purple-900/10 rounded-2xl p-6 border border-purple-500/20">
              
                {/* 菜单状态 - 显示示例网格 */}
                {gameState === GameState.MENU && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-purple-200 mb-6">
                        {t('preview')}
                      </h3>
                    </div>
                    <div className="flex justify-center">
                      {renderPreviewGrid()}
                    </div>
                  </motion.div>
                )}
          
                {/* 记忆阶段 */}
                {gameState === GameState.MEMORIZING && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-6 mb-8">
                        <h3 className="text-2xl font-bold text-purple-100">
                          {t('memorizePhase')}
                        </h3>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-cyan-400" />
                          <span className="text-cyan-400 text-xl font-bold">
                            {Math.ceil(memoryTimeLeft / 1000)}s
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      {renderGrid()}
                    </div>
                  </motion.div>
                )}
                
                {/* 选择阶段 */}
                {gameState === GameState.SELECTING && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-purple-100 mb-8">
                        {t('selectPhase')}
                      </h3>
                    </div>
                    
                    <div className="flex justify-center">
                      {renderGrid()}
                    </div>
                  </motion.div>
                )}
                
                {/* 游戏结果阶段 - 继续显示方格 */}
                {gameState === GameState.RESULTS && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <h3 className="text-purple-100 text-2xl font-bold mb-8">{t('gameComplete')}</h3>
                    </div>
                    
                    <div className="flex justify-center">
                      {renderGrid()}
                    </div>
                  </motion.div>
                )}
            </div>
            
          </div>
          
          {/* 右侧统计区域 - 占1/3宽度，优化对齐 */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* 游戏进度统计 */}
              {(gameState === GameState.SELECTING || gameState === GameState.MEMORIZING) && (
                <div className="space-y-4">
                  <div className="pb-4">
                    <h3 className="text-purple-100 flex items-center gap-3 text-lg font-semibold">
                      <Brain className="w-6 h-6 text-pink-400" />
                      {t('gameProgress')}
                    </h3>
                  </div>
                  <div className="pt-0">
                    <div className="space-y-5">
                      <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-400/20">
                        <span className="text-purple-200 font-medium">{t('correct')}:</span>
                        <span className="text-green-400 text-2xl font-bold">
                          {selectedCells.filter(id => grid.find(c => c.id === id)?.isMarked).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-400/20">
                        <span className="text-purple-200 font-medium">{t('wrong')}:</span>
                        <span className="text-red-400 text-2xl font-bold">{wrongSelections}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-400/20">
                        <span className="text-purple-200 font-medium">{t('total')}:</span>
                        <span className="text-purple-400 text-2xl font-bold">{markedCells.length}</span>
                      </div>
                      <div className="pt-3 border-t border-purple-500/30">
                        <div className="flex justify-between items-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
                          <span className="text-purple-200 font-medium">{t('accuracy')}:</span>
                          <span className="text-cyan-400 text-xl font-bold">
                            {selectedCells.length > 0 
                              ? ((selectedCells.filter(id => grid.find(c => c.id === id)?.isMarked).length / selectedCells.length) * 100).toFixed(1)
                              : 0
                            }%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
        
               {/* 游戏结果 */}
               {gameState === GameState.RESULTS && (
                 <div className="space-y-4">
                   <div className="pb-4">
                     <h3 className="text-purple-100 flex items-center gap-3 text-lg font-semibold">
                       <Trophy className="w-6 h-6 text-yellow-400" />
                       {stats.wrongSelections < 2 ? t('gameComplete') : t('gameOver')}
                     </h3>
                   </div>
                   <div className="pt-0">
                     <motion.div
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="space-y-6"
                     >
                       {/* 得分显示 - 突出显示 */}
                       <div className="text-center p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30 shadow-lg">
                         <div className="text-purple-200 text-lg font-medium mb-2">{t('score')}</div>
                         <div className="text-yellow-400 text-4xl font-bold">{stats.score}</div>
                       </div>
                       
                       {/* 统计信息 - 优化布局 */}
                       <div className="space-y-4">
                         <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-400/20">
                           <span className="text-purple-200 font-medium">{t('correct')}:</span>
                           <span className="text-green-400 text-2xl font-bold">{stats.correctSelections}</span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-400/20">
                           <span className="text-purple-200 font-medium">{t('wrong')}:</span>
                           <span className="text-red-400 text-2xl font-bold">{stats.wrongSelections}</span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
                           <span className="text-purple-200 font-medium">{t('accuracy')}:</span>
                           <span className="text-cyan-400 text-xl font-bold">{stats.accuracy.toFixed(1)}%</span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-400/20">
                           <span className="text-purple-200 font-medium">{t('timeSpent')}:</span>
                           <span className="text-purple-400 text-xl font-bold">{(stats.timeSpent / 1000).toFixed(1)}s</span>
                         </div>
                       </div>
                     </motion.div>
                   </div>
                 </div>
               )}
              
              {/* 操作按钮区域 - 仅在选择阶段显示 */}
              {gameState === GameState.SELECTING && (
                <div className="space-y-4">
                  <TouchOptimizedButton
                    onClick={resetGame}
                    variant="outline"
                    className="w-full border-purple-400/50 text-purple-200 hover:bg-purple-800/50"
                    hapticFeedback
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('backToMenu')}
                  </TouchOptimizedButton>
                </div>
              )}
            </div>
          </div>
        </div>
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