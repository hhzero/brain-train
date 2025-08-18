'use client'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { Difficulty } from '../page'

interface GameResultsProps {
  score: number
  totalQuestions: number
  accuracy: number
  duration: number
  difficulty: Difficulty
  onPlayAgain: () => void
  onChangeDifficulty: () => void
  onBack: () => void
}

/**
 * 游戏结算界面组件
 * 显示最终得分、准确率、游戏时长等统计信息
 */
const GameResults: FC<GameResultsProps> = ({
  score,
  totalQuestions,
  accuracy,
  duration,
  difficulty,
  onPlayAgain,
  onChangeDifficulty,
  onBack
}) => {
  const t = useTranslations('quickMath')
  
  // 根据得分计算等级
  const getScoreRating = (score: number, accuracy: number) => {
    if (score >= 30 && accuracy >= 90) return { level: 'S', color: 'text-yellow-300', bg: 'from-yellow-500 to-orange-500' }
    if (score >= 25 && accuracy >= 80) return { level: 'A', color: 'text-green-300', bg: 'from-green-500 to-emerald-500' }
    if (score >= 20 && accuracy >= 70) return { level: 'B', color: 'text-blue-300', bg: 'from-blue-500 to-cyan-500' }
    if (score >= 15 && accuracy >= 60) return { level: 'C', color: 'text-purple-300', bg: 'from-purple-500 to-pink-500' }
    return { level: 'D', color: 'text-gray-300', bg: 'from-gray-500 to-slate-500' }
  }
  
  const rating = getScoreRating(score, accuracy)
  
  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // 获取难度显示信息
  const getDifficultyInfo = (diff: Difficulty) => {
    switch (diff) {
      case 'easy':
        return { name: t('difficulty.easy'), color: 'text-green-300', bg: 'from-green-500 to-emerald-600' }
      case 'medium':
        return { name: t('difficulty.medium'), color: 'text-yellow-300', bg: 'from-yellow-500 to-orange-600' }
      case 'hard':
        return { name: t('difficulty.hard'), color: 'text-red-300', bg: 'from-red-500 to-pink-600' }
      default:
        return { name: t('difficulty.easy'), color: 'text-green-300', bg: 'from-green-500 to-emerald-600' }
    }
  }
  
  const difficultyInfo = getDifficultyInfo(difficulty)
  
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* 结算卡片 */}
      <div className="relative z-10 max-w-2xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-center">
          {/* 游戏结束标题 */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">
              {t('ui.gameOver')}
            </h2>
            <p className="text-gray-300 text-lg">
              {t('results.congratulations')}
            </p>
          </div>
          
          {/* 等级显示 */}
          <div className="mb-8">
            <div className={`inline-block w-24 h-24 rounded-full bg-gradient-to-br ${rating.bg} flex items-center justify-center mb-4 shadow-lg`}>
              <span className="text-4xl font-bold text-white">{rating.level}</span>
            </div>
            <div className={`text-2xl font-semibold ${rating.color}`}>
              {rating.level === 'S' && t('results.perfectPerformance')}
              {rating.level === 'A' && t('results.excellentPerformance')}
              {rating.level === 'B' && t('results.goodPerformance')}
              {rating.level === 'C' && t('results.needsImprovement')}
              {rating.level === 'D' && t('results.keepTrying')}
            </div>
          </div>
          
          {/* 统计信息 */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* 得分 */}
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="text-sm text-gray-400 mb-2">{t('ui.finalScore')}</div>
              <div className="text-4xl font-bold text-cyan-300">{score}</div>
              <div className="text-sm text-gray-400 mt-1">
                {t('ui.totalQuestions')}: {totalQuestions}
              </div>
            </div>
            
            {/* 准确率 */}
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="text-sm text-gray-400 mb-2">{t('ui.accuracy')}</div>
              <div className="text-4xl font-bold text-green-300">{Math.round(accuracy)}%</div>
              <div className="text-sm text-gray-400 mt-1">
                {t('ui.correctAnswers')}: {score}
              </div>
            </div>
            
            {/* 游戏时长 */}
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="text-sm text-gray-400 mb-2">{t('ui.gameDuration')}</div>
              <div className="text-4xl font-bold text-yellow-300">{formatTime(duration)}</div>
              <div className="text-sm text-gray-400 mt-1">
                {t('ui.averageTime')}: {totalQuestions > 0 ? (duration / totalQuestions).toFixed(1) : 0}s
              </div>
            </div>
            
            {/* 难度等级 */}
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="text-sm text-gray-400 mb-2">{t('ui.difficulty')}</div>
              <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${difficultyInfo.bg} text-white font-semibold`}>
                {difficultyInfo.name}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                {difficulty === 'easy' && t('difficultyDescription.easy')}
                {difficulty === 'medium' && t('difficultyDescription.medium')}
                {difficulty === 'hard' && t('difficultyDescription.hard')}
              </div>
            </div>
          </div>
          
          {/* 详细统计 */}
          <div className="bg-white/5 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">{t('results.detailedStats')}</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-400">{t('results.questionsPerMinute')}</div>
                <div className="text-white font-semibold">
                  {duration > 0 ? ((totalQuestions / duration) * 60).toFixed(1) : 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">{t('results.correctRate')}</div>
                <div className="text-white font-semibold">
                  {totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">{t('results.missedQuestions')}</div>
                <div className="text-white font-semibold">
                  {totalQuestions - score}
                </div>
              </div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onPlayAgain}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🔄 {t('ui.playAgain')}
            </button>
            
            <button
              onClick={onChangeDifficulty}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              ⚙️ {t('ui.changeDifficulty')}
            </button>
            
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              ← {t('ui.backToMenu')}
            </button>
          </div>
          
          {/* 鼓励信息 */}
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
            <p className="text-purple-200 text-sm">
              {score >= 25 && `🎉 ${t('results.greatSpeed')}`}
              {score >= 15 && score < 25 && `👍 ${t('results.goodProgress')}`}
              {score < 15 && `💪 ${t('results.encouragementMessage')}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameResults