'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { 
  Brain, 
  Target, 
  Zap, 
  Heart, 
  Users, 
  Sparkles,
  Trophy,
  Clock,
  Star,
  TrendingUp,
  Gamepad2,
  Palette,
  Eye,
  Filter,
  Search,
  ChevronRight,
  Play,
  Award,
  Flame,
  BookOpen,
  Calendar,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SEOOptimization, { PAGE_TYPES } from '@/components/SEOOptimization'
import UserRetentionSystem from '@/components/UserRetentionSystem'
import type { 
  RetentionData, 
  Milestone, 
  Notification, 
  DailyGoal, 
  PersonalInsight 
} from '@/components/UserRetentionSystem'
import { TrainingType } from '@/components/PersonalizedRecommendations'
import type { 
  TrainingHistory, 
  UserPreferences, 
  UserAbilities 
} from '@/components/PersonalizedRecommendations'
import type { 
  User, 
  Friend, 
  Challenge, 
  LeaderboardEntry, 
  SocialActivity 
} from '@/components/UserRetentionSystem'
import type { 
  Activity 
} from '@/components/SocialFeatures'

export default function TrainingPage() {
  const t = useTranslations('')
  
  // 训练模块数据
  const trainingModules = [
    {
      id: 'multi-attention',
      title: t('training.modules.multiAttention.title'),
      description: t('training.modules.multiAttention.description'),
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      difficulty: t('training.difficulty.intermediate'),
      duration: t('training.duration.15-30min'),
      features: [t('training.features.3dEnvironment'), t('training.features.multiSensory'), t('training.features.adaptiveDifficulty'), t('training.features.realTimeFeedback')],
      href: '/train'
    },
    {
      id: 'cognitive-flexibility',
      title: t('training.modules.cognitiveFlexibility.title'),
      description: t('training.modules.cognitiveFlexibility.description'),
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      difficulty: t('training.difficulty.advanced'),
      duration: t('training.duration.20-40min'),
      features: [t('training.features.workplaceSimulation'), t('training.features.learningScenarios'), t('training.features.lifeContexts'), t('training.features.advancedChallenges')],
      href: '/train'
    },
    {
      id: 'emotional-management',
      title: t('training.modules.emotionalManagement.title'),
      description: t('training.modules.emotionalManagement.description'),
      icon: Heart,
      color: 'from-rose-500 to-orange-500',
      difficulty: t('training.difficulty.beginner'),
      duration: t('training.duration.10-25min'),
      features: [t('training.features.emotionRecognition'), t('training.features.stressRelief'), t('training.features.taichiMindset'), t('training.features.zenFocus')],
      href: '/train'
    },
    {
      id: 'emotion-recognition',
      title: t('training.modules.emotionRecognition.title'),
      description: t('training.modules.emotionRecognition.description'),
      icon: Users,
      color: 'from-green-500 to-teal-500',
      difficulty: t('training.difficulty.beginner'),
      duration: t('training.duration.10-20min'),
      features: [t('training.features.facialRecognition'), t('training.features.contextAnalysis'), t('training.features.culturalAdaptation'), t('training.features.instantFeedback')],
      href: '/train'
    },
    {
      id: 'stress-relief',
      title: t('training.modules.stressRelief.title'),
      description: t('training.modules.stressRelief.description'),
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-500',
      difficulty: t('training.difficulty.beginner'),
      duration: t('training.duration.5-15min'),
      features: [t('training.features.mindfulMeditation'), t('training.features.breathingTraining'), t('training.features.relaxationGuidance')],
      href: '/train'
    },
    {
      id: 'social-eq',
      title: t('training.modules.socialEQ.title'),
      description: t('training.modules.socialEQ.description'),
      icon: Users,
      color: 'from-yellow-500 to-red-500',
      difficulty: t('training.difficulty.intermediate'),
      duration: t('training.duration.15-30min'),
      features: [t('training.features.scenarioSimulation'), t('training.features.communicationSkills'), t('training.features.eqAssessment'), t('training.features.culturalWisdom')],
      href: '/train'
    }
  ]

  // 统计数据
  const stats = [
    { label: t('training.stats.trainingModules'), value: '6+', icon: Gamepad2 },
    { label: t('training.stats.userCompletions'), value: '10K+', icon: Users },
    { label: t('training.stats.averageImprovement'), value: '85%', icon: TrendingUp },
    { label: t('training.stats.satisfaction'), value: '4.9', icon: Star }
  ]
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showRetentionSystem, setShowRetentionSystem] = useState(false)
  
  // 模拟用户数据
  const [currentUser] = useState<User>({
    id: 'user-1',
    username: t('training.mockUsers.trainer'),
    displayName: t('training.mockUsers.trainer'),
    avatar: '/avatars/default.jpg',
    level: 15,
    totalScore: 15680,
    joinDate: '2024-01-15',
    lastActive: new Date().toISOString(),
    status: 'online' as const,
    stats: {
      totalTrainingTime: 1200, // 20小时
      sessionsCompleted: 45,
      averageScore: 85,
      bestStreak: 12,
      favoriteTrainingType: 'attention',
      improvementRate: 15.5
    }
  })
  
  const [retentionData] = useState<RetentionData>({
    dailyStreak: 12,
    weeklyGoalProgress: 75,
    monthlyGoalProgress: 60,
    totalTrainingDays: 45,
    averageSessionTime: 25,
    lastLoginDate: new Date(),
    nextMilestone: {
      id: 'milestone-1',
      title: t('training.mockData.milestone.title'),
      description: t('training.mockData.milestone.description'),
      target: 15,
      current: 12,
      reward: t('training.mockData.milestone.reward'),
      type: 'streak',
      icon: Flame
    },
    engagementScore: 82,
    riskLevel: 'low'
  })
  
  const [trainingHistory] = useState<TrainingHistory[]>([
    {
      moduleId: 'multi-attention',
      moduleName: 'Multi-Attention Training',
      type: TrainingType.ATTENTION,
      completedAt: new Date(),
      duration: 20,
      score: 850,
      accuracy: 89,
      difficulty: 'medium'
    }
  ])
  
  const [userPreferences] = useState<UserPreferences>({
    preferredDifficulty: 'medium',
    preferredDuration: 20,
    favoriteTypes: [TrainingType.ATTENTION, TrainingType.COGNITIVE],
    trainingGoals: ['improve focus', 'enhance memory'],
    availableTime: 30
  })
  
  const [userAbilities] = useState<UserAbilities>({
    attention: 85,
    memory: 78,
    cognitive: 82,
    emotional: 75,
    social: 70,
    speed: 88,
    overall: 80
  })
  
  const [friends] = useState<Friend[]>([])
  const [challenges] = useState<Challenge[]>([])
  const [leaderboard] = useState<LeaderboardEntry[]>([])
  const [activities] = useState<SocialActivity[]>([])
  const [notifications] = useState<Notification[]>([])
  
  const [dailyGoals] = useState<DailyGoal[]>([
    {
      id: 'goal-1',
      title: t('training.mockData.dailyGoals.completeSessions.title'),
      description: t('training.mockData.dailyGoals.completeSessions.description'),
      target: 2,
      current: 1,
      type: 'sessions',
      reward: 50,
      completed: false,
      icon: Target
    },
    {
      id: 'goal-2',
      title: t('training.mockData.dailyGoals.trainingTime.title'),
      description: t('training.mockData.dailyGoals.trainingTime.description'),
      target: 30,
      current: 20,
      type: 'training_time',
      reward: 30,
      completed: false,
      icon: Clock
    }
  ])
  
  const [insights] = useState<PersonalInsight[]>([
    {
      id: 'insight-1',
      type: 'strength',
      title: t('training.mockData.insights.attentionExcellent.title'),
      description: t('training.mockData.insights.attentionExcellent.description'),
      data: { percentile: 80 },
      actionable: true,
      actionText: t('training.mockData.insights.attentionExcellent.actionText'),
      actionUrl: '/train/attention'
    }
  ])
  
  useEffect(() => {
    // 检查是否应该显示用户留存系统
    const shouldShow = currentUser.level > 5
    setShowRetentionSystem(shouldShow)
  }, [currentUser])

  const categories = [
    { id: 'all', label: t('training.categories.all'), count: trainingModules.length },
    { id: 'attention', label: t('training.categories.attention'), count: 2 },
    { id: 'emotion', label: t('training.categories.emotion'), count: 4 },
    { id: 'cognitive', label: t('training.categories.cognitive'), count: 2 }
  ]

  const filteredModules = trainingModules.filter(module => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'attention') return ['multi-attention', 'cognitive-flexibility'].includes(module.id)
    if (selectedCategory === 'emotion') return ['emotional-management', 'emotion-recognition', 'stress-relief', 'social-eq'].includes(module.id)
    if (selectedCategory === 'cognitive') return ['cognitive-flexibility', 'multi-attention'].includes(module.id)
    return true
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case t('training.difficulty.beginner'): return 'text-green-400 bg-green-400/10'
      case t('training.difficulty.intermediate'): return 'text-yellow-400 bg-yellow-400/10'
      case t('training.difficulty.advanced'): return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <>
      <SEOOptimization 
           pageType={PAGE_TYPES.TRAINING}
           customConfig={{
             title: t('training.seo.title'),
             description: t('training.seo.description'),
             keywords: t('training.seo.keywords').split(',').map(k => k.trim()),
             ogImage: "/images/train-og.jpg"
           }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* 用户留存系统 */}
          {showRetentionSystem && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <UserRetentionSystem
                currentUser={currentUser}
                retentionData={retentionData}
                trainingHistory={trainingHistory}
                userPreferences={userPreferences}
                userAbilities={userAbilities}
                friends={friends}
                challenges={challenges}
                leaderboard={leaderboard}
                activities={activities}
                notifications={notifications}
                dailyGoals={dailyGoals}
                insights={insights}
              />
            </motion.div>
          )}
          
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {t('training.title')}
              <span className="block text-2xl md:text-3xl text-cyan-400 font-normal mt-2">
                Brain Training Center
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('training.subtitle')}
            </p>
          </motion.div>

          {/* 统计数据 */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20"
            >
              <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
          </motion.div>

          {/* 分类筛选 */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className={`
                ${selectedCategory === category.id 
                  ? 'bg-cyan-500 text-white border-cyan-500' 
                  : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
                }
                backdrop-blur-md transition-all duration-300
              `}
            >
              {category.label}
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                {category.count}
              </span>
            </Button>
          ))}
          </motion.div>

          {/* 训练模块网格 */}
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="wait">
            {filteredModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredModule(module.id)}
                onHoverEnd={() => setHoveredModule(null)}
                className="group relative"
              >
                <Link href={module.href as '/train'}>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all duration-300 h-full">
                    {/* 模块图标和标题 */}
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${module.color} mr-4`}>
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {module.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(module.difficulty)}`}>
                            {module.difficulty}
                          </span>
                          <span className="text-gray-400 text-xs flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {module.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 描述 */}
                    <p className="text-gray-300 mb-4 line-clamp-2">
                      {module.description}
                    </p>

                    {/* 特性标签 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {module.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full border border-white/20"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* 开始训练按钮 */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredModule === module.id ? 1 : 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                    >
                      <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-2">
                        开始训练
                        <Zap className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
          </motion.div>

          {/* 底部说明 */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <Palette className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">个性化训练体验</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              我们的训练系统采用自适应算法，根据您的表现动态调整难度，确保每次训练都能获得最佳的挑战和成长体验。
              融合现代科学与传统智慧，为您打造独特的脑力提升之旅。
            </p>
          </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}