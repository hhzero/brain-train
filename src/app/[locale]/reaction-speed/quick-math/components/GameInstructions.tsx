'use client'
import { useTranslations } from 'next-intl'
import { FC } from 'react'

/**
 * 游戏说明组件
 * 展示游戏规则、操作方法和提示
 */
const GameInstructions: FC = () => {
  const t = useTranslations('quickMath')

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">
        {t('instructions.title')}
      </h3>
      
      <div className="space-y-6">
        {/* 游戏描述 */}
        <div className="bg-white/5 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
            <span className="mr-2">📖</span>
            游戏规则
          </h4>
          <p className="text-gray-300 leading-relaxed">
            {t('instructions.description')}
          </p>
        </div>
        
        {/* 操作说明 */}
        <div className="bg-white/5 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
            <span className="mr-2">🎮</span>
            操作方法
          </h4>
          <p className="text-gray-300 leading-relaxed">
            {t('instructions.controls')}
          </p>
        </div>
        
        {/* 游戏提示 */}
        <div className="bg-white/5 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            游戏提示
          </h4>
          <p className="text-gray-300 leading-relaxed">
            {t('instructions.tips')}
          </p>
        </div>
        
        {/* 难度说明 */}
        <div className="bg-white/5 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
            <span className="mr-2">⚡</span>
            难度等级
          </h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="w-16 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold text-white mr-4">
                简单
              </span>
              <span className="text-gray-300">{t('difficultyDescription.easy')}</span>
            </div>
            <div className="flex items-center">
              <span className="w-16 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-sm font-semibold text-white mr-4">
                中等
              </span>
              <span className="text-gray-300">{t('difficultyDescription.medium')}</span>
            </div>
            <div className="flex items-center">
              <span className="w-16 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center text-sm font-semibold text-white mr-4">
                困难
              </span>
              <span className="text-gray-300">{t('difficultyDescription.hard')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameInstructions