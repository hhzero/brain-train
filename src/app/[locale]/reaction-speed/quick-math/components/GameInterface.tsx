'use client'
import { useTranslations } from 'next-intl'
import { FC, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Difficulty } from '../page'
import { MathProblem, generateMathProblem } from '../utils/mathGenerator'
import './GameInterface.css'

interface GameInterfaceProps {
  difficulty: Difficulty
  onGameEnd: (score: number, totalQuestions: number, accuracy: number, duration: number) => void
  onBack: () => void
}

/**
 * 游戏界面组件
 * 包含算术题目下降动画、数字键盘输入和得分计算
 */
const GameInterface: FC<GameInterfaceProps> = ({ difficulty, onGameEnd, onBack }) => {
  const t = useTranslations('quickMath')
  
  // 游戏状态
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [problems, setProblems] = useState<MathProblem[]>([])
  const [gameStartTime, setGameStartTime] = useState<number>(0)
  const [gameDuration, setGameDuration] = useState(60) // 游戏时长（秒）
  const [timeLeft, setTimeLeft] = useState(60)
  const [isPaused, setIsPaused] = useState(false)
  const [isGameActive, setIsGameActive] = useState(true)
  
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 显示反馈状态
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  
  // 显示反馈函数
  const showFeedback = useCallback((type: 'correct' | 'incorrect') => {
    setFeedback(type)
    setTimeout(() => setFeedback(null), 1000)
  }, [])
  
  // 数字键盘输入函数
  const handleNumberInput = useCallback((num: string) => {
    if (currentAnswer.length < 6) {
      setCurrentAnswer(prev => prev + num)
    }
  }, [currentAnswer.length])
  
  // 清除输入函数
  const clearInput = useCallback(() => {
    setCurrentAnswer('')
  }, [])
  
  // 使用useMemo缓存游戏设置，减少重复计算
  const gameSettings = useMemo(() => {
    switch (difficulty) {
      case 'easy':
        return { spawnInterval: 3000, fallSpeed: 8000, maxProblems: 4 } // 统一下降速度，减少题目数量
      case 'medium':
        return { spawnInterval: 2500, fallSpeed: 8000, maxProblems: 6 } // 统一下降速度
      case 'hard':
        return { spawnInterval: 2000, fallSpeed: 8000, maxProblems: 8 } // 统一下降速度
      default:
        return { spawnInterval: 3000, fallSpeed: 8000, maxProblems: 4 }
    }
  }, [difficulty])
  
  // 生成新题目（防重叠逻辑）
  const spawnProblem = useCallback(() => {
    if (!isGameActive || isPaused) return
    
    setProblems(prev => {
      if (prev.length >= gameSettings.maxProblems) {
        return prev
      }
      
      // 获取当前屏幕上显示的题目表达式和位置
      const currentExpressions = prev.map(p => p.expression)
      const usedPositions = prev.map(p => (p as any).horizontalPosition || 0)
      
      // 使用改进的防重复机制生成题目
      const newProblem = generateMathProblem(difficulty, currentExpressions)
      
      // 为题目分配水平位置（避免重叠）
      const availablePositions = [15, 35, 50, 65, 85] // 5个不同的水平位置（百分比）
      let horizontalPosition = availablePositions[0] // 默认位置
      
      // 找到一个未被占用的位置
      for (const pos of availablePositions) {
        const isPositionUsed = usedPositions.some(usedPos => Math.abs(usedPos - pos) < 10)
        if (!isPositionUsed) {
          horizontalPosition = pos
          break
        }
      }
      
      // 如果所有位置都被占用，随机选择一个位置
      if (usedPositions.length >= availablePositions.length) {
        horizontalPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)]
      }
      
      // 添加水平位置属性到题目对象
      const problemWithPosition = {
        ...newProblem,
        horizontalPosition
      }
      
      return [...prev, problemWithPosition]
    })
  }, [difficulty, gameSettings.maxProblems, isGameActive, isPaused])
  
  // 移除题目（答对或掉落到底部）
  const removeProblem = useCallback((problemId: string, isCorrect: boolean = false) => {
    setProblems(prev => prev.filter(p => p.id !== problemId))
    if (isCorrect) {
      setScore(prev => prev + 1)
    }
    setTotalQuestions(prev => prev + 1)
  }, [])
  
  // 检查答案函数 - 修改为匹配屏幕上任意显示的题目
  const checkAnswer = useCallback(() => {
    if (!currentAnswer.trim()) return
    
    const answer = parseInt(currentAnswer)
    if (isNaN(answer)) return
    
    // 查找屏幕上任意匹配的题目
    const matchingProblem = problems.find(problem => problem.answer === answer)
    
    if (matchingProblem) {
      // 找到匹配的题目，移除它并增加分数
      removeProblem(matchingProblem.id, true)
      setCurrentAnswer('')
      
      // 显示正确提示
      showFeedback('correct')
    } else {
      // 没有找到匹配的题目，显示错误提示
      showFeedback('incorrect')
      setCurrentAnswer('')
    }
  }, [currentAnswer, problems, removeProblem, showFeedback])
  
  // 暂停/继续游戏
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])
  
  // 键盘输入处理 - 优化键盘响应和输入体验
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // 如果游戏暂停或未激活，不处理键盘输入
      if (isPaused || !isGameActive) return
      
      // 防止在输入框聚焦时重复处理
      if (event.target && (event.target as HTMLElement).tagName === 'INPUT') return
      
      const key = event.key
      
      // 数字键输入
      if (/^[0-9]$/.test(key)) {
        event.preventDefault() // 防止默认行为
        if (currentAnswer.length <= 4) { // 增加输入长度限制
          handleNumberInput(key)
        }
      }
      // 回车键或空格键确认
      else if (key === 'Enter' || key === ' ') {
        checkAnswer()
        event.preventDefault()
      }
      // 退格键清除
      else if (key === 'Backspace') {
        setCurrentAnswer(prev => prev.slice(0, -1))
        event.preventDefault()
      }
      // Escape键清除全部
      else if (key === 'Escape') {
        clearInput()
        event.preventDefault()
      }
    }
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyPress)
    
    // 清理事件监听
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isPaused, isGameActive, currentAnswer, handleNumberInput, checkAnswer, clearInput])
  
  // 结束游戏
  const endGame = useCallback(() => {
    setIsGameActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0
    const duration = gameDuration - timeLeft
    onGameEnd(score, totalQuestions, accuracy, duration)
  }, [score, totalQuestions, timeLeft, gameDuration, onGameEnd])
  
  // 游戏初始化
  useEffect(() => {
    setGameStartTime(Date.now())
    
    // 生成题目的定时器
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        spawnProblem()
      }
    }, gameSettings.spawnInterval)
    
    // 游戏倒计时
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)
    
    // 初始生成一个题目
    spawnProblem()
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [spawnProblem, gameSettings.spawnInterval, isPaused, endGame])
  
  // 题目下降动画 - 使用CSS动画实现平滑下降
  useEffect(() => {
    const fallTimer = setInterval(() => {
      if (!isPaused && isGameActive) {
        setProblems(prev => {
          const expiredProblems: string[] = []
          const filteredProblems = prev.filter(problem => {
            const age = Date.now() - problem.createdAt
            if (age >= gameSettings.fallSpeed) {
              // 记录过期的题目ID
              expiredProblems.push(problem.id)
              return false
            }
            return true
          })
          
          // 在状态更新完成后更新总题数
          if (expiredProblems.length > 0) {
            setTimeout(() => {
              setTotalQuestions(prev => prev + expiredProblems.length)
            }, 0)
          }
          
          return filteredProblems
        })
      }
    }, 100) // 降低检查频率，让CSS动画处理视觉效果
    
    return () => clearInterval(fallTimer)
  }, [isPaused, isGameActive, gameSettings.fallSpeed])
  
  // 生成CSS动画样式
  const generateAnimationStyle = useCallback((problem: MathProblem) => {
    const horizontalPosition = (problem as any).horizontalPosition || 50
    const animationDuration = gameSettings.fallSpeed / 1000 // 转换为秒
    
    return {
      left: `${horizontalPosition}%`,
      transform: 'translateX(-50%)',
      animation: `fallDown ${animationDuration}s linear forwards`,
      animationPlayState: isPaused ? 'paused' : 'running'
    }
  }, [gameSettings.fallSpeed, isPaused])
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* 游戏头部信息 */}
      <div className="relative z-10 p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600/70 text-white rounded-lg transition-colors"
        >
          ← {t('ui.back')}
        </button>
        
        <div className="flex items-center space-x-6 text-white">
          <div className="text-center">
            <div className="text-sm opacity-80">{t('ui.score')}</div>
            <div className="text-xl font-bold text-cyan-300">{score}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm opacity-80">{t('ui.timeLeft')}</div>
            <div className="text-xl font-bold text-yellow-300">{timeLeft}s</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm opacity-80">{t('ui.accuracy')}</div>
            <div className="text-xl font-bold text-green-300">
              {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
            </div>
          </div>
        </div>
        
        <button
          onClick={togglePause}
          className="px-4 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white rounded-lg transition-colors"
        >
          {isPaused ? t('ui.resume') : t('ui.pause')}
        </button>
      </div>
      
      {/* 左右布局的游戏主体区域 */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4 h-[calc(100vh-120px)]">
        
        {/* 左侧：数学题显示区域 */}
        <div className="flex-1 lg:w-2/3">
          <div 
            ref={gameAreaRef}
            className="relative h-full bg-black/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
          >
            {/* 下降的题目 */}
            {problems.map((problem) => {
              const animationStyle = generateAnimationStyle(problem)
              
              return (
                <div
                  key={problem.id}
                  className={`absolute top-0 bg-transparent falling-problem ${isPaused ? 'paused' : ''}`}
                  style={animationStyle}
                >
                  <div className="text-white text-sm sm:text-base font-bold text-center whitespace-nowrap bg-transparent px-2 py-1.5 min-w-[80px] max-w-[120px]">
                    {problem.expression} = ?
                  </div>
                </div>
              )
            })}
            
            {/* 暂停遮罩 */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-4xl font-bold text-white">{t('ui.paused')}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* 右侧：输入控制区域 */}
        <div className="lg:w-1/3 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            {/* 输入显示 */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-300 mb-2">{t('ui.yourAnswer')}</div>
                <div className="text-3xl font-bold text-white min-h-[3rem] flex items-center justify-center">
                  {currentAnswer || '0'}
                </div>
              </div>
            </div>
            
            {/* 数字键盘 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(num.toString())}
                  className="h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white text-lg font-semibold transition-colors"
                  disabled={isPaused || !isGameActive}
                >
                  {num}
                </button>
              ))}
            </div>
            
            {/* 底部按钮 */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={clearInput}
                className="h-12 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-500/30 rounded-xl text-red-300 font-semibold transition-colors text-sm"
                disabled={isPaused || !isGameActive}
              >
                {t('ui.clear')}
              </button>
              
              <button
                onClick={() => handleNumberInput('0')}
                className="h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white text-lg font-semibold transition-colors"
                disabled={isPaused || !isGameActive}
              >
                0
              </button>
              
              <button
                onClick={checkAnswer}
                className="h-12 bg-green-500/20 hover:bg-green-500/30 backdrop-blur-sm border border-green-500/30 rounded-xl text-green-300 font-semibold transition-colors text-sm"
                disabled={isPaused || !isGameActive}
              >
                {t('ui.confirm')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 反馈提示 */}
      {feedback && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className={`text-6xl font-bold animate-bounce ${
            feedback === 'correct' ? 'text-green-400' : 'text-red-400'
          }`}>
            {feedback === 'correct' ? '✓' : '✗'}
          </div>
        </div>
      )}
    </div>
  )
}

export default GameInterface