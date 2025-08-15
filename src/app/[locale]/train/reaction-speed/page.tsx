import { useTranslations } from 'next-intl';
import ReactionSpeedClient from './ReactionSpeedClient';

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
            ⚡ 反应速度测试 ⚡
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            测试你的反应速度！当屏幕变色时立即点击，看看你的反应时间有多快！
          </p>
        </div>
        
        <ReactionSpeedClient />
      </div>
    </div>
  );
}