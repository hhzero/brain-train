'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { 
  Brain, 
  Target, 
  Heart, 
  Users, 
  TrendingUp, 
  Clock, 
  Star, 
  Zap, 
  BookOpen, 
  Award,
  ChevronRight,
  RefreshCw,
  Filter,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/navigation'

// 训练类型
export enum TrainingType {
  ATTENTION = 'attention',
  MEMORY = 'memory',
  COGNITIVE = 'cognitive',
  EMOTIONAL = 'emotional',
  SOCIAL = 'social',
  SPEED = 'speed'
}

// 推荐原因
export enum RecommendationReason {
  WEAKNESS_IMPROVEMENT = 'weakness_improvement',
  STRENGTH_BUILDING = 'strength_building',
  BALANCED_TRAINING = 'balanced_training',
  STREAK_MAINTENANCE = 'streak_maintenance',
  NEW_CHALLENGE = 'new_challenge',
  POPULAR_CHOICE = 'popular_choice',
  PERSONALIZED = 'personalized'
}

// 用户训练历史
export interface TrainingHistory {
  moduleId: string
  moduleName: string
  type: TrainingType
  completedAt: Date
  score: number
  accuracy: number
  duration: number // 分钟
  difficulty: 'easy' | 'medium' | 'hard'
}

// 用户偏好
export interface UserPreferences {
  favoriteTypes: TrainingType[]
  preferredDifficulty: 'easy' | 'medium' | 'hard'
  preferredDuration: number // 分钟
  trainingGoals: string[]
  availableTime: number // 分钟
}

// 推荐项目
export interface RecommendationItem {
  id: string
  title: string
  description: string
  type: TrainingType
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedDuration: number
  expectedImprovement: number // 百分比
  reason: RecommendationReason
  reasonText: string
  href: string
  icon: React.ComponentType<any>
  color: string
  priority: number // 1-10, 10最高
  tags: string[]
}

// 用户能力评估
export interface UserAbilities {
  attention: number // 0-100
  memory: number
  cognitive: number
  emotional: number
  social: number
  speed: number
  overall: number
}

interface PersonalizedRecommendationsProps {
  trainingHistory: TrainingHistory[]
  userPreferences: UserPreferences
  userAbilities: UserAbilities
  className?: string
  maxRecommendations?: number
}

export default function PersonalizedRecommendations({
  trainingHistory,
  userPreferences,
  userAbilities,
  className = '',
  maxRecommendations = 6
}: PersonalizedRecommendationsProps) {
  const t = useTranslations()
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [selectedFilter, setSelectedFilter] = useState<'all' | TrainingType>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 生成推荐
  useEffect(() => {
    generateRecommendations()
  }, [trainingHistory, userPreferences, userAbilities])

  const generateRecommendations = () => {
    const allRecommendations: RecommendationItem[] = []

    // 1. 基于弱项改进的推荐
    const weakestAbility = getWeakestAbility()
    if (weakestAbility) {
      allRecommendations.push(...getWeaknessImprovementRecommendations(weakestAbility))
    }

    // 2. 基于优势强化的推荐
    const strongestAbility = getStrongestAbility()
    if (strongestAbility) {
      allRecommendations.push(...getStrengthBuildingRecommendations(strongestAbility))
    }

    // 3. 基于训练历史的推荐
    allRecommendations.push(...getHistoryBasedRecommendations())

    // 4. 基于用户偏好的推荐
    allRecommendations.push(...getPreferenceBasedRecommendations())

    // 5. 新挑战推荐
    allRecommendations.push(...getNewChallengeRecommendations())

    // 6. 热门推荐
    allRecommendations.push(...getPopularRecommendations())

    // 排序并去重
    const uniqueRecommendations = Array.from(
      new Map(allRecommendations.map(item => [item.id, item])).values()
    )
    
    const sortedRecommendations = uniqueRecommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxRecommendations)

    setRecommendations(sortedRecommendations)
  }

  const getWeakestAbility = (): { type: TrainingType; score: number } | null => {
    const abilities = [
      { type: TrainingType.ATTENTION, score: userAbilities.attention },
      { type: TrainingType.MEMORY, score: userAbilities.memory },
      { type: TrainingType.COGNITIVE, score: userAbilities.cognitive },
      { type: TrainingType.EMOTIONAL, score: userAbilities.emotional },
      { type: TrainingType.SOCIAL, score: userAbilities.social },
      { type: TrainingType.SPEED, score: userAbilities.speed }
    ]
    
    return abilities.reduce((min, current) => 
      current.score < min.score ? current : min
    )
  }

  const getStrongestAbility = (): { type: TrainingType; score: number } | null => {
    const abilities = [
      { type: TrainingType.ATTENTION, score: userAbilities.attention },
      { type: TrainingType.MEMORY, score: userAbilities.memory },
      { type: TrainingType.COGNITIVE, score: userAbilities.cognitive },
      { type: TrainingType.EMOTIONAL, score: userAbilities.emotional },
      { type: TrainingType.SOCIAL, score: userAbilities.social },
      { type: TrainingType.SPEED, score: userAbilities.speed }
    ]
    
    return abilities.reduce((max, current) => 
      current.score > max.score ? current : max
    )
  }

  const getWeaknessImprovementRecommendations = (weakness: { type: TrainingType; score: number }): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = []
    
    switch (weakness.type) {
      case TrainingType.ATTENTION:
        recommendations.push({
          id: 'attention_weakness',
          title: t('personalizedRecommendations.attention.title'),
          description: t('personalizedRecommendations.attention.description'),
          type: TrainingType.ATTENTION,
          difficulty: 'easy',
          estimatedDuration: 15,
          expectedImprovement: 25,
          reason: RecommendationReason.WEAKNESS_IMPROVEMENT,
          reasonText: t('personalizedRecommendations.weaknessImprovement.attention', { score: weakness.score }),
          href: '/train/multi-attention',
          icon: Target,
          color: 'from-blue-500 to-cyan-500',
          priority: 9,
          tags: [t('personalizedRecommendations.tags.attention'), t('personalizedRecommendations.tags.basic'), t('personalizedRecommendations.tags.personalized')]
        })
        break
      case TrainingType.EMOTIONAL:
        recommendations.push({
          id: 'emotional_weakness',
          title: t('personalizedRecommendations.emotional.title'),
          description: t('personalizedRecommendations.emotional.description'),
          type: TrainingType.EMOTIONAL,
          difficulty: 'easy',
          estimatedDuration: 20,
          expectedImprovement: 30,
          reason: RecommendationReason.WEAKNESS_IMPROVEMENT,
          reasonText: t('personalizedRecommendations.weaknessImprovement.emotional', { score: weakness.score }),
          href: '/train/emotional-management',
          icon: Heart,
          color: 'from-rose-500 to-orange-500',
          priority: 9,
          tags: [t('personalizedRecommendations.tags.emotional'), t('personalizedRecommendations.tags.basic'), t('personalizedRecommendations.tags.personalized')]
        })
        break
      case TrainingType.COGNITIVE:
        recommendations.push({
          id: 'cognitive_weakness',
          title: t('personalizedRecommendations.cognitive.title'),
          description: t('personalizedRecommendations.cognitive.description'),
          type: TrainingType.COGNITIVE,
          difficulty: 'medium',
          estimatedDuration: 25,
          expectedImprovement: 28,
          reason: RecommendationReason.WEAKNESS_IMPROVEMENT,
          reasonText: t('personalizedRecommendations.weaknessImprovement.cognitive', { score: weakness.score }),
          href: '/train/cognitive-flexibility',
          icon: Brain,
          color: 'from-purple-500 to-pink-500',
          priority: 9,
          tags: [t('personalizedRecommendations.tags.cognitive'), t('personalizedRecommendations.tags.thinking'), t('personalizedRecommendations.tags.personalized')]
        })
        break
    }
    
    return recommendations
  }

  const getStrengthBuildingRecommendations = (strength: { type: TrainingType; score: number }): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = []
    
    if (strength.score >= 80) {
      switch (strength.type) {
        case TrainingType.ATTENTION:
          recommendations.push({
            id: 'attention_advanced',
            title: t('personalizedRecommendations.advanced.attention.title'),
            description: t('personalizedRecommendations.advanced.attention.description'),
            type: TrainingType.ATTENTION,
            difficulty: 'hard',
            estimatedDuration: 30,
            expectedImprovement: 15,
            reason: RecommendationReason.STRENGTH_BUILDING,
            reasonText: t('personalizedRecommendations.strengthBuilding.attention', { score: strength.score }),
            href: '/train/multi-attention',
            icon: Target,
            color: 'from-blue-500 to-cyan-500',
            priority: 7,
            tags: [t('personalizedRecommendations.tags.attention'), t('personalizedRecommendations.tags.advanced'), t('personalizedRecommendations.tags.challenge')]
          })
          break
        case TrainingType.EMOTIONAL:
          recommendations.push({
            id: 'emotional_advanced',
            title: t('personalizedRecommendations.advanced.emotional.title'),
            description: t('personalizedRecommendations.advanced.emotional.description'),
            type: TrainingType.EMOTIONAL,
            difficulty: 'hard',
            estimatedDuration: 35,
            expectedImprovement: 12,
            reason: RecommendationReason.STRENGTH_BUILDING,
            reasonText: t('personalizedRecommendations.strengthBuilding.emotional', { score: strength.score }),
            href: '/train/social-eq',
            icon: Users,
            color: 'from-yellow-500 to-red-500',
            priority: 7,
            tags: [t('personalizedRecommendations.tags.emotional'), t('personalizedRecommendations.tags.advanced'), t('personalizedRecommendations.tags.social')]
          })
          break
      }
    }
    
    return recommendations
  }

  const getHistoryBasedRecommendations = (): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = []
    
    // 分析最近的训练模式
    const recentTraining = trainingHistory.slice(-10)
    const typeFrequency = recentTraining.reduce((acc, training) => {
      acc[training.type] = (acc[training.type] || 0) + 1
      return acc
    }, {} as Record<TrainingType, number>)
    
    // 推荐较少训练的类型
    const leastTrainedType = Object.entries(typeFrequency)
      .sort(([,a], [,b]) => a - b)[0]?.[0] as TrainingType
    
    if (leastTrainedType) {
      recommendations.push({
        id: 'balance_training',
        title: getTrainingTitle(leastTrainedType),
        description: t('personalizedRecommendations.balanced.description'),
        type: leastTrainedType,
        difficulty: 'medium',
        estimatedDuration: 20,
        expectedImprovement: 20,
        reason: RecommendationReason.BALANCED_TRAINING,
        reasonText: t('personalizedRecommendations.balanced.reason'),
        href: getTrainingHref(leastTrainedType),
        icon: getTrainingIcon(leastTrainedType),
        color: getTrainingColor(leastTrainedType),
        priority: 6,
        tags: [t('personalizedRecommendations.tags.balanced'), t('personalizedRecommendations.tags.comprehensive')]
      })
    }
    
    return recommendations
  }

  const getPreferenceBasedRecommendations = (): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = []
    
    // 基于用户喜好推荐
    userPreferences.favoriteTypes.forEach(type => {
      recommendations.push({
        id: `preference_${type}`,
        title: getTrainingTitle(type),
        description: t('personalizedRecommendations.preference.description'),
        type,
        difficulty: userPreferences.preferredDifficulty,
        estimatedDuration: userPreferences.preferredDuration,
        expectedImprovement: 18,
        reason: RecommendationReason.PERSONALIZED,
        reasonText: t('personalizedRecommendations.preference.reason'),
        href: getTrainingHref(type),
        icon: getTrainingIcon(type),
        color: getTrainingColor(type),
        priority: 8,
        tags: [t('personalizedRecommendations.tags.preference'), t('personalizedRecommendations.tags.customized')]
      })
    })
    
    return recommendations
  }

  const getNewChallengeRecommendations = (): RecommendationItem[] => {
    const trainedModules = new Set(trainingHistory.map(h => h.moduleId))
    const allModules = ['multi-attention', 'cognitive-flexibility', 'emotional-management', 'emotion-recognition', 'stress-relief', 'social-eq']
    const untriedModules = allModules.filter(id => !trainedModules.has(id))
    
    return untriedModules.slice(0, 2).map(moduleId => ({
      id: `new_${moduleId}`,
      title: getModuleTitle(moduleId),
      description: '探索全新的训练体验',
      type: getModuleType(moduleId),
      difficulty: 'medium',
      estimatedDuration: 20,
      expectedImprovement: 22,
      reason: RecommendationReason.NEW_CHALLENGE,
      reasonText: '尝试新的训练模块，拓展能力边界',
      href: `/train/${moduleId}`,
      icon: getTrainingIcon(getModuleType(moduleId)),
      color: getTrainingColor(getModuleType(moduleId)),
      priority: 5,
      tags: ['新体验', '探索']
    }))
  }

  const getPopularRecommendations = (): RecommendationItem[] => {
    return [
      {
        id: 'popular_attention',
        title: '多维注意力挑战',
        description: '最受欢迎的注意力训练项目',
        type: TrainingType.ATTENTION,
        difficulty: 'medium',
        estimatedDuration: 20,
        expectedImprovement: 20,
        reason: RecommendationReason.POPULAR_CHOICE,
        reasonText: '用户好评率95%的热门训练',
        href: '/train/multi-attention',
        icon: Target,
        color: 'from-blue-500 to-cyan-500',
        priority: 4,
        tags: ['热门', '好评']
      }
    ]
  }

  // 辅助函数
  const getTrainingTitle = (type: TrainingType): string => {
    const titles = {
      [TrainingType.ATTENTION]: '注意力训练',
      [TrainingType.MEMORY]: '记忆力训练',
      [TrainingType.COGNITIVE]: '认知训练',
      [TrainingType.EMOTIONAL]: '情绪管理',
      [TrainingType.SOCIAL]: '社交训练',
      [TrainingType.SPEED]: '速度训练'
    }
    return titles[type]
  }

  const getTrainingHref = (type: TrainingType): string => {
    const hrefs = {
      [TrainingType.ATTENTION]: '/train/multi-attention',
      [TrainingType.MEMORY]: '/memory',
      [TrainingType.COGNITIVE]: '/train/cognitive-flexibility',
      [TrainingType.EMOTIONAL]: '/train/emotional-management',
      [TrainingType.SOCIAL]: '/train/social-eq',
      [TrainingType.SPEED]: '/reaction'
    }
    return hrefs[type]
  }

  const getTrainingIcon = (type: TrainingType) => {
    const icons = {
      [TrainingType.ATTENTION]: Target,
      [TrainingType.MEMORY]: Brain,
      [TrainingType.COGNITIVE]: Brain,
      [TrainingType.EMOTIONAL]: Heart,
      [TrainingType.SOCIAL]: Users,
      [TrainingType.SPEED]: Zap
    }
    return icons[type]
  }

  const getTrainingColor = (type: TrainingType): string => {
    const colors = {
      [TrainingType.ATTENTION]: 'from-blue-500 to-cyan-500',
      [TrainingType.MEMORY]: 'from-green-500 to-teal-500',
      [TrainingType.COGNITIVE]: 'from-purple-500 to-pink-500',
      [TrainingType.EMOTIONAL]: 'from-rose-500 to-orange-500',
      [TrainingType.SOCIAL]: 'from-yellow-500 to-red-500',
      [TrainingType.SPEED]: 'from-indigo-500 to-purple-500'
    }
    return colors[type]
  }

  const getModuleTitle = (moduleId: string): string => {
    const titles: Record<string, string> = {
      'multi-attention': '多维注意力挑战',
      'cognitive-flexibility': '认知灵活性训练营',
      'emotional-management': '情绪管理训练',
      'emotion-recognition': '情绪识别训练',
      'stress-relief': '压力缓解冥想',
      'social-eq': '社交情商提升'
    }
    return titles[moduleId] || '训练模块'
  }

  const getModuleType = (moduleId: string): TrainingType => {
    const types: Record<string, TrainingType> = {
      'multi-attention': TrainingType.ATTENTION,
      'cognitive-flexibility': TrainingType.COGNITIVE,
      'emotional-management': TrainingType.EMOTIONAL,
      'emotion-recognition': TrainingType.EMOTIONAL,
      'stress-relief': TrainingType.EMOTIONAL,
      'social-eq': TrainingType.SOCIAL
    }
    return types[moduleId] || TrainingType.COGNITIVE
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'hard': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getReasonColor = (reason: RecommendationReason) => {
    switch (reason) {
      case RecommendationReason.WEAKNESS_IMPROVEMENT:
        return 'text-red-400 bg-red-400/10'
      case RecommendationReason.STRENGTH_BUILDING:
        return 'text-green-400 bg-green-400/10'
      case RecommendationReason.BALANCED_TRAINING:
        return 'text-blue-400 bg-blue-400/10'
      case RecommendationReason.NEW_CHALLENGE:
        return 'text-purple-400 bg-purple-400/10'
      case RecommendationReason.POPULAR_CHOICE:
        return 'text-yellow-400 bg-yellow-400/10'
      default:
        return 'text-cyan-400 bg-cyan-400/10'
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    generateRecommendations()
    setIsRefreshing(false)
  }

  const filteredRecommendations = recommendations.filter(rec => 
    selectedFilter === 'all' || rec.type === selectedFilter
  )

  const filterOptions = [
    { value: 'all', label: '全部推荐', count: recommendations.length },
    { value: TrainingType.ATTENTION, label: '注意力', count: recommendations.filter(r => r.type === TrainingType.ATTENTION).length },
    { value: TrainingType.COGNITIVE, label: '认知', count: recommendations.filter(r => r.type === TrainingType.COGNITIVE).length },
    { value: TrainingType.EMOTIONAL, label: '情绪', count: recommendations.filter(r => r.type === TrainingType.EMOTIONAL).length },
    { value: TrainingType.SOCIAL, label: '社交', count: recommendations.filter(r => r.type === TrainingType.SOCIAL).length }
  ].filter(option => option.count > 0)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 标题和控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">个性化推荐</h2>
          <p className="text-gray-300">基于您的能力评估和训练历史定制的专属建议</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          刷新推荐
        </Button>
      </div>

      {/* 筛选器 */}
      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <div className="flex gap-2">
          {filterOptions.map(option => (
            <Button
              key={option.value}
              onClick={() => setSelectedFilter(option.value as any)}
              variant={selectedFilter === option.value ? 'default' : 'outline'}
              size="sm"
              className={`
                ${selectedFilter === option.value 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
                }
              `}
            >
              {option.label}
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                {option.count}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* 推荐列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Link href={recommendation.href as '/train'}>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all duration-300 h-full">
                  {/* 优先级指示器 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${recommendation.color}`}>
                      <recommendation.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {recommendation.priority >= 8 && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/50">
                          <Star className="w-3 h-3 mr-1" />
                          推荐
                        </Badge>
                      )}
                      <Badge className={`${getDifficultyColor(recommendation.difficulty)}`}>
                        {recommendation.difficulty === 'easy' ? '简单' : 
                         recommendation.difficulty === 'medium' ? '中等' : '困难'}
                      </Badge>
                    </div>
                  </div>

                  {/* 标题和描述 */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {recommendation.title}
                  </h3>
                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {recommendation.description}
                  </p>

                  {/* 推荐原因 */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm mb-4 ${getReasonColor(recommendation.reason)}`}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {recommendation.reasonText}
                  </div>

                  {/* 训练信息 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        {recommendation.estimatedDuration}分钟
                      </div>
                      <div className="flex items-center text-green-400">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        预期提升{recommendation.expectedImprovement}%
                      </div>
                    </div>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-2">
                      {recommendation.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full border border-white/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 开始按钮 */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-400">
                        点击开始训练
                      </span>
                      <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 空状态 */}
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">暂无推荐</h3>
          <p className="text-gray-500">请先完成一些训练，我们将为您生成个性化推荐</p>
        </div>
      )}
    </div>
  )
}