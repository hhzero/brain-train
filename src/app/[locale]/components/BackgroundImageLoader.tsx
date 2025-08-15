'use client';

import React, { useState, useEffect, useRef } from 'react';
import ResourceManager from '../../../utils/ResourceManager';

interface BackgroundImageLoaderProps {
  src: string;
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
  priority?: boolean;
  fallbackColor?: string;
}

const BackgroundImageLoader: React.FC<BackgroundImageLoaderProps> = ({
  src,
  children,
  className = '',
  placeholder,
  priority = false,
  fallbackColor = 'bg-gray-100 dark:bg-gray-800',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [isPreloading, setIsPreloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resourceManager = ResourceManager.getInstance();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Preload image using ResourceManager
  useEffect(() => {
    if (!isInView) return;

    const preloadImage = async () => {
      setIsPreloading(true);
      setHasError(false);
      
      try {
        // 检查是否已缓存
        const cached = resourceManager.getCachedImage(src);
        if (cached) {
          setIsLoaded(true);
          return;
        }
        
        // 使用ResourceManager预加载图片
        await resourceManager.preloadImage(src, {
          priority: priority ? 'high' : 'medium',
          timeout: 10000,
          retries: 2
        });
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Background image preload failed:', error);
        setHasError(true);
      } finally {
        setIsPreloading(false);
      }
    };

    preloadImage();
  }, [src, isInView, priority, resourceManager]);

  const getBackgroundStyle = () => {
    if (hasError) {
      return {};
    }

    if (isLoaded) {
      return {
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }

    if (placeholder && isInView) {
      return {
        backgroundImage: `url(${placeholder})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'blur(5px)',
      };
    }

    return {};
  };

  const containerClasses = [
    'relative transition-all duration-500',
    hasError ? fallbackColor : '',
    isLoaded ? '' : 'animate-pulse',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={getBackgroundStyle()}
    >
      {/* Loading overlay */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {isPreloading && (
              <span className="text-xs text-white text-center px-2">
                加载背景图片中...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className={`absolute inset-0 flex items-center justify-center ${fallbackColor}`}>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Image failed to load</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${isLoaded ? 'opacity-100' : 'opacity-90'} transition-opacity duration-300`}>
        {children}
      </div>
    </div>
  );
};

export default BackgroundImageLoader;