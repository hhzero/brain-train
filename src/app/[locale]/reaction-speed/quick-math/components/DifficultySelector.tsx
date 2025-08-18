'use client'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { Difficulty } from '../page'

interface Props {
  onSelect: (difficulty: Difficulty) => void
}

/**
 * 难度选择组件
 * 提供简单、中等、困难三种难度等级选择
 */
const DifficultySelector: FC<Props> = ({ onSelect }) => {
  const t = useTranslations('quickMath')

  const difficulties: { key: Difficulty; color: string; emoji: string }[] = [
    { key: 'easy', color: 'from-green-500 to-emerald-600', emoji: '🟢' },
    { key: 'medium', color: 'from-yellow-500 to-orange-600', emoji: '🟡' },
    { key: 'hard', color: 'from-red-500 to-pink-600', emoji: '🔴' }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-white text-center mb-8">
        {t('ui.selectDifficulty')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {difficulties.map((diff) => (
          <div
            key={diff.key}
            onClick={() => onSelect(diff.key)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div className="rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl">
              <div className="text-center">
                {/* 难度图标 */}
                <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${diff.color} rounded-full flex items-center justify-center text-4xl shadow-lg`}>
                  {diff.emoji}
                </div>
                
                {/* 难度名称 */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">
                  {t(`difficulty.${diff.key}`)}
                </h3>
                
                {/* 难度描述 */}
                <p className="text-gray-300 mb-6 text-lg">
                  {t(`difficultyDescription.${diff.key}`)}
                </p>
                
                {/* 开始按钮 */}
                <button className={`w-full py-3 px-6 bg-gradient-to-r ${diff.color} text-white font-semibold rounded-lg hover:shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95`}>
                  {t('ui.startGame')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 提示信息 */}
      <div className="text-center mt-12">
        <p className="text-gray-400 text-lg">
          💡 {t('ui.selectDifficultyHint')}
        </p>
      </div>
      
      {/* 游戏说明 */}
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            {t('instructions.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 游戏规则 */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
                <span className="mr-2">📖</span>
                {t('instructions.gameRules')}
              </h4>
              <p className="text-gray-300 leading-relaxed text-sm">
                {t('instructions.description')}
              </p>
            </div>
            
            {/* 操作方法 */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
                <span className="mr-2">🎮</span>
                {t('instructions.howToPlay')}
              </h4>
              <p className="text-gray-300 leading-relaxed text-sm">
                {t('instructions.controls')}
              </p>
            </div>
            
            {/* 游戏提示 */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                {t('instructions.gameTips')}
              </h4>
              <p className="text-gray-300 leading-relaxed text-sm">
                {t('instructions.tips')}
              </p>
            </div>
            
            {/* 难度说明 */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
                <span className="mr-2">⚡</span>
                {t('instructions.difficultyLevels')}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-12 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-xs font-semibold text-white mr-3">
                    {t('difficulty.easy')}
                  </span>
                  <span className="text-gray-300 text-sm">{t('difficultyDescription.easy')}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-12 h-6 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-xs font-semibold text-white mr-3">
                    {t('difficulty.medium')}
                  </span>
                  <span className="text-gray-300 text-sm">{t('difficultyDescription.medium')}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-12 h-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center text-xs font-semibold text-white mr-3">
                    {t('difficulty.hard')}
                  </span>
                  <span className="text-gray-300 text-sm">{t('difficultyDescription.hard')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DifficultySelector