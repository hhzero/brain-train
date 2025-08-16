import { useTranslations } from 'next-intl';
import { Metadata } from 'next';
import ReactionSpeedClient from './ReactionSpeedClient';

export const generateMetadata = (): Metadata => ({
  title: 'Reaction Speed Test | Brain Train',
  description: 'Test your reaction speed! Click immediately when the screen changes color and see how fast your reaction time is!',
  keywords: ['reaction speed', 'reaction time', 'brain training', 'cognitive test', 'attention training']
})

/**
 * 反应速度测试页面
 * 提供反应速度测试游戏的服务端组件
 */
export default function ReactionSpeedPage() {
  const t = useTranslations('ReactionSpeed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">
            ⚡ {t('title')} ⚡
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
        
        <ReactionSpeedClient />
      </div>
    </div>
  );
}