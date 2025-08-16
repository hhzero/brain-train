'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Heart, Zap, Target, Users, Sparkles, Flower } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface EmotionTraining {
  id: string;
  title: string;
  description: string;
  icon: any;
  difficulty: string;
  duration: string;
  category: string;
}

const getEmotionIcon = (id: string) => {
  switch (id) {
    case 'emotion-recognition': return <Brain className="w-8 h-8" />;
    case 'stress-relief': return <Heart className="w-8 h-8" />;
    case 'emotion-regulation': return <Zap className="w-8 h-8" />;
    case 'social-eq': return <Users className="w-8 h-8" />;
    case 'taichi-mindfulness': return <Brain className="w-8 h-8" />;
    case 'zen-meditation': return <Sparkles className="w-8 h-8" />;
    default: return <Heart className="w-8 h-8" />;
  }
};

const getEmotionColor = (id: string) => {
  const colorMap: Record<string, string> = {
    'emotion-recognition': 'from-purple-500 to-pink-500',
    'stress-relief': 'from-blue-500 to-cyan-500',
    'emotion-regulation': 'from-green-500 to-emerald-500',
    'social-eq': 'from-orange-500 to-red-500',
    'taichi-mindfulness': 'from-indigo-500 to-purple-500',
    'zen-meditation': 'from-teal-500 to-blue-500'
  };
  return colorMap[id] || 'from-purple-500 to-pink-500';
};

export default function EmotionPage() {
  const t = useTranslations('emotion');

  const emotionTrainings: EmotionTraining[] = [
     {
       id: 'emotion-recognition',
       title: t('trainings.emotionRecognition.title'),
       description: t('trainings.emotionRecognition.description'),
       icon: Brain,
       difficulty: t('difficulty.beginner'),
       duration: t('duration.15min'),
       category: 'recognition'
     },
     {
       id: 'stress-relief',
       title: t('trainings.stressRelief.title'),
       description: t('trainings.stressRelief.description'),
       icon: Heart,
       difficulty: t('difficulty.intermediate'),
       duration: t('duration.20min'),
       category: 'regulation'
     },
     {
       id: 'emotion-regulation',
       title: t('trainings.emotionRegulation.title'),
       description: t('trainings.emotionRegulation.description'),
       icon: Zap,
       difficulty: t('difficulty.advanced'),
       duration: t('duration.25min'),
       category: 'regulation'
     },
     {
       id: 'social-eq',
       title: t('trainings.socialEq.title'),
       description: t('trainings.socialEq.description'),
       icon: Users,
       difficulty: t('difficulty.intermediate'),
       duration: t('duration.30min'),
       category: 'social'
     },
     {
       id: 'taichi-mindfulness',
       title: t('trainings.taichiMindfulness.title'),
       description: t('trainings.taichiMindfulness.description'),
       icon: Brain,
       difficulty: t('difficulty.beginner'),
       duration: t('duration.35min'),
       category: 'mindfulness'
     },
     {
       id: 'zen-meditation',
       title: t('trainings.zenMeditation.title'),
       description: t('trainings.zenMeditation.description'),
       icon: Sparkles,
       difficulty: t('difficulty.advanced'),
       duration: t('duration.40min'),
       category: 'mindfulness'
     }
   ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* 训练项目网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {emotionTrainings.map((training) => (
            <Card 
              key={training.id} 
              className="group relative overflow-hidden bg-black/40 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              {/* 背景渐变 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getEmotionColor(training.id)} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
              
              <CardHeader className="relative z-10 text-center pb-4">
                {/* 图标 */}
                <div className={`mx-auto mb-4 p-4 rounded-full bg-gradient-to-br ${getEmotionColor(training.id)} text-white shadow-lg`}>
                  {getEmotionIcon(training.id)}
                </div>
                
                <CardTitle className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  {training.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 pt-0">
                <CardDescription className="text-gray-300 text-center mb-6 leading-relaxed">
                  {training.description}
                </CardDescription>
                
                <Link href={`/train/${training.id}`} className="block">
                  <Button 
                    className={`w-full bg-gradient-to-r ${getEmotionColor(training.id)} hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 text-white font-semibold py-3`}
                  >
                    {t('startTraining')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="mt-16 text-center">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">{t('importance.title')}</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              {t('importance.description1')}
            </p>
            <p className="text-gray-300 leading-relaxed">
              {t('importance.description2')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}