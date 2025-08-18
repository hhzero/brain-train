'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import DifficultySelector from './components/DifficultySelector'
import GameInstructions from './components/GameInstructions'
import GameInterface from './components/GameInterface'
import GameResults from './components/GameResults'

export type Difficulty = 'easy' | 'medium' | 'hard'

type GameState = 'menu' | 'instructions' | 'playing' | 'results'

interface GameResultData {
  score: number
  totalQuestions: number
  accuracy: number
  duration: number
}

/**
 * 速算训练页面
 * 提供难度选择、游戏说明、游戏界面和结果显示
 */
export default function QuickMathPage() {
  const t = useTranslations('quickMath')
  const [gameState, setGameState] = useState<GameState>('menu')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy')
  const [gameResult, setGameResult] = useState<GameResultData | null>(null)

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty)
    setGameState('playing')
  }

  const handleStartGame = () => {
    setGameState('playing')
  }

  const handleGameEnd = (score: number, totalQuestions: number, accuracy: number, duration: number) => {
    setGameResult({ score, totalQuestions, accuracy, duration })
    setGameState('results')
  }

  const handlePlayAgain = () => {
    setGameResult(null)
    setGameState('playing')
  }

  const handleChangeDifficulty = () => {
    setGameResult(null)
    setGameState('menu')
  }

  const handleBackToMenu = () => {
    setGameResult(null)
    setGameState('menu')
  }

  const handleBackToInstructions = () => {
    setGameState('instructions')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* 根据游戏状态显示不同内容 */}
      {gameState === 'menu' && (
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>
          <DifficultySelector onSelect={handleDifficultySelect} />
        </div>
      )}

      {gameState === 'instructions' && (
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="space-y-8">
            <GameInstructions />
            <div className="text-center space-x-4">
              <button
                onClick={handleStartGame}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🚀 {t('ui.startGame')}
              </button>
              <button
                onClick={handleBackToMenu}
                className="px-8 py-4 bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white font-bold text-lg rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                ← {t('ui.back')}
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <GameInterface
          difficulty={selectedDifficulty}
          onGameEnd={handleGameEnd}
          onBack={handleBackToMenu}
        />
      )}

      {gameState === 'results' && gameResult && (
        <GameResults
          score={gameResult.score}
          totalQuestions={gameResult.totalQuestions}
          accuracy={gameResult.accuracy}
          duration={gameResult.duration}
          difficulty={selectedDifficulty}
          onPlayAgain={handlePlayAgain}
          onChangeDifficulty={handleChangeDifficulty}
          onBack={handleBackToMenu}
        />
      )}
    </div>
  )
}