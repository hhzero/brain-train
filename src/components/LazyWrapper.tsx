'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// 懒加载包装器的属性接口
interface LazyWrapperProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

// 默认加载动画组件
const DefaultLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px] bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
    <motion.div
      className="flex flex-col items-center space-y-4"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 旋转加载图标 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-pink-400" />
      </motion.div>
      
      {/* 加载文本 */}
      <motion.p
        className="text-purple-300 text-sm font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        正在加载组件...
      </motion.p>
      
      {/* 装饰性星点 */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-pink-400 rounded-full"
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </motion.div>
  </div>
);

// 懒加载包装器组件
export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  className = ""
}) => {
  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      <div className={className}>
        {children}
      </div>
    </Suspense>
  );
};

// 创建懒加载组件的工厂函数
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);
  
  const WrappedComponent = (props: React.ComponentProps<T>) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
  
  WrappedComponent.displayName = 'LazyWrappedComponent';
  
  return WrappedComponent;
}

// 预定义的懒加载组件
export const LazyDataManagement = createLazyComponent(
  () => import('./DataManagement'),
  <DefaultLoadingFallback />
);

export const LazyTrainingHistory = createLazyComponent(
  () => import('./TrainingHistory'),
  <DefaultLoadingFallback />
);

export const LazyStatisticsPanel = createLazyComponent(
  () => import('./StatisticsPanel'),
  <DefaultLoadingFallback />
);

export const LazyTutorialSystem = createLazyComponent(
  () => import('./TutorialSystem').then(module => ({ default: module.TutorialSystem })),
  <DefaultLoadingFallback />
);

export const LazyAudioTestPanel = createLazyComponent(
  () => import('./AudioTestPanel').then(module => ({ default: module.AudioTestPanel })),
  <DefaultLoadingFallback />
);

export const LazyInteractiveDemo = createLazyComponent(
  () => import('./InteractiveDemo').then(module => ({ default: module.InteractiveDemo })),
  <DefaultLoadingFallback />
);

// 导出默认加载动画
export { DefaultLoadingFallback };