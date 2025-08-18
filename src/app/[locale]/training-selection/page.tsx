'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 训练分类接口定义
interface TrainingItem {
  id: number;
  name: string;
  description: string;
  image: string;
  link: string;
}

interface TrainingCategory {
  id: number;
  name: string;
  list: TrainingItem[];
}

interface TrainingData {
  Memory: TrainingCategory;
  ReactionSpeed: TrainingCategory;
  Attention: TrainingCategory;
}

export default function TrainingSelectionPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载训练数据
  useEffect(() => {
    const loadTrainingData = async () => {
      try {
        const response = await fetch(`/data/data.${locale}.json`);
        const data = await response.json();
        setTrainingData(data);
      } catch (error) {
        console.error('Failed to load training data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrainingData();
  }, [locale]);

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const categoryVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  if (!trainingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">{t('common.error')}</div>
      </div>
    );
  }

  // 主要训练分类（按用户要求：记忆力、注意力、反应速度）
  const mainCategories = [
    {
      key: 'Memory',
      data: trainingData.Memory,
      icon: '🧠',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      key: 'Attention',
      data: trainingData.Attention,
      icon: '🎯',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      key: 'ReactionSpeed',
      data: trainingData.ReactionSpeed,
      icon: '⚡',
      gradient: 'from-pink-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* 主要内容 */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('trainingSelection.title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('trainingSelection.subtitle')}
          </p>
        </motion.div>

        {/* 训练分类网格 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          {mainCategories.map((category) => (
            <motion.div
              key={category.key}
              variants={categoryVariants}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
            >
              {/* 分类标题 */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{category.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {category.data.name}
                </h2>
                <div className={`h-1 w-20 mx-auto bg-gradient-to-r ${category.gradient} rounded-full`} />
              </div>

              {/* 训练项目列表 */}
              <div className="space-y-4">
                {category.data.list.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/${locale}${item.link}`}
                      className="block bg-white/5 hover:bg-white/15 rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all duration-300 group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 bg-gradient-to-r ${category.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-white text-xl font-bold">
                              {item.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-blue-300 transition-colors duration-300">
                            {item.name}
                          </h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 返回首页按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <Link
            href={`/${locale}`}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('trainingSelection.backToHome')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}