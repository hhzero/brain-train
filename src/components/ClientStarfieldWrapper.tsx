'use client';

import StarfieldBackground from '@/components/StarfieldBackground';

/**
 * 客户端星空背景包装组件
 * 用于在服务端渲染的layout中使用StarfieldBackground组件
 */
export function ClientStarfieldWrapper() {
  return (
    <StarfieldBackground 
      intensity="ultra"
      animated={true}
      interactive={true}
      showNebula={true}
      showMeteors={true}
      depth={true}
    />
  );
}