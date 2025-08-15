import { useTranslations } from 'next-intl';
import ReactionTimeClient from './ReactionTimeClient';

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
            🎯 反应时间训练 🎯
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            通过连续的反应训练提升你的反应能力！点击出现的目标，越快越好！
          </p>
        </div>
        
        <ReactionTimeClient />
      </div>
    </div>
  );
}