import { useTranslations } from 'next-intl';
import { Metadata } from 'next';
import ReactionTimeClient from './ReactionTimeClient';

export const generateMetadata = (): Metadata => ({
  title: 'Reaction Time Training | Brain Train',
  description: 'Improve your reaction ability through continuous reaction training! Click the appearing targets as fast as possible!',
  keywords: ['reaction time', 'reaction training', 'brain training', 'cognitive enhancement', 'speed training']
})

/**
 * 反应时间训练页面
 * 提供反应时间训练游戏的服务端组件
 */
export default function ReactionTimePage() {
  const t = useTranslations('ReactionTime');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">
            🎯 {t('title')} 🎯
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
        
        <ReactionTimeClient />
      </div>
    </div>
  );
}