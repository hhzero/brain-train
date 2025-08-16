'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Brain, 
  Heart, 
  Users, 
  Clock, 
  TrendingUp, 
  Award,
  Medal,
  Crown,
  Sparkles,
  CheckCircle,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// 成就类型
export enum AchievementType {
  TRAINING_STREAK = 'training_streak',
  SCORE_MILESTONE = 'score_milestone',
  TIME_SPENT = 'time_spent',
  MODULE_COMPLETION = 'module_completion',
  PERFECT_SCORE = 'perfect_score',
  SPEED_DEMON = 'speed_demon',
  CONSISTENCY = 'consistency',
  EXPLORER = 'explorer',
  SOCIAL = 'social',
  SPECIAL = 'special'
}

// 成就难度
export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// 成就接口
export interface Achievement {
  id: string
  title: string
  description: string
  type: AchievementType
  rarity: AchievementRarity
  icon: React.ComponentType<any>
  requirement: number
  progress: number
  unlocked: boolean
  unlockedAt?: Date
  points: number
  category: string
}

// 用户统计接口
export interface UserStats {
  totalTrainingTime: number // 分钟
  trainingStreak: number // 连续天数
  totalScore: number
  modulesCompleted: number
  perfectScores: number
  averageAccuracy: number
  fastestReaction: number // 毫秒
  socialInteractions: number
  achievementsUnlocked: number
  totalSessions: number
}

// 预定义成就数据
const achievementDefinitions: Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'>[] = [
  // 训练连续性成就
  {
    id: 'streak_3',
    title: '初心不改',
    description: '连续训练3天',
    type: AchievementType.TRAINING_STREAK,
    rarity: AchievementRarity.COMMON,
    icon: Target,
    requirement: 3,
    points: 50,
    category: '坚持训练'
  },
  {
    id: 'streak_7',
    title: '七日修行',
    description: '连续训练7天',
    type: AchievementType.TRAINING_STREAK,
    rarity: AchievementRarity.RARE,
    icon: Star,
    requirement: 7,
    points: 150,
    category: '坚持训练'
  },
  {
    id: 'streak_30',
    title: '月圆功成',
    description: '连续训练30天',
    type: AchievementType.TRAINING_STREAK,
    rarity: AchievementRarity.EPIC,
    icon: Crown,
    requirement: 30,
    points: 500,
    category: '坚持训练'
  },
  
  // 分数里程碑成就
  {
    id: 'score_1000',
    title: '千分突破',
    description: '单次训练得分超过1000分',
    type: AchievementType.SCORE_MILESTONE,
    rarity: AchievementRarity.COMMON,
    icon: Trophy,
    requirement: 1000,
    points: 100,
    category: '分数成就'
  },
  {
    id: 'score_5000',
    title: '五千巅峰',
    description: '单次训练得分超过5000分',
    type: AchievementType.SCORE_MILESTONE,
    rarity: AchievementRarity.RARE,
    icon: Medal,
    requirement: 5000,
    points: 300,
    category: '分数成就'
  },
  
  // 训练时长成就
  {
    id: 'time_60',
    title: '时光飞逝',
    description: '累计训练时长达到1小时',
    type: AchievementType.TIME_SPENT,
    rarity: AchievementRarity.COMMON,
    icon: Clock,
    requirement: 60,
    points: 75,
    category: '时间投入'
  },
  {
    id: 'time_600',
    title: '十时修炼',
    description: '累计训练时长达到10小时',
    type: AchievementType.TIME_SPENT,
    rarity: AchievementRarity.RARE,
    icon: Brain,
    requirement: 600,
    points: 250,
    category: '时间投入'
  },
  
  // 模块完成成就
  {
    id: 'modules_3',
    title: '多元探索',
    description: '完成3个不同的训练模块',
    type: AchievementType.MODULE_COMPLETION,
    rarity: AchievementRarity.COMMON,
    icon: Sparkles,
    requirement: 3,
    points: 120,
    category: '探索成就'
  },
  {
    id: 'modules_all',
    title: '全能大师',
    description: '完成所有训练模块',
    type: AchievementType.MODULE_COMPLETION,
    rarity: AchievementRarity.LEGENDARY,
    icon: Crown,
    requirement: 6,
    points: 1000,
    category: '探索成就'
  },
  
  // 完美表现成就
  {
    id: 'perfect_5',
    title: '完美五连',
    description: '获得5次满分',
    type: AchievementType.PERFECT_SCORE,
    rarity: AchievementRarity.RARE,
    icon: Star,
    requirement: 5,
    points: 200,
    category: '完美表现'
  },
  
  // 速度成就
  {
    id: 'speed_300',
    title: '闪电反应',
    description: '反应时间低于300毫秒',
    type: AchievementType.SPEED_DEMON,
    rarity: AchievementRarity.EPIC,
    icon: Zap,
    requirement: 300,
    points: 400,
    category: '速度挑战'
  },
  
  // 社交成就
  {
    id: 'social_10',
    title: '社交达人',
    description: '与其他用户互动10次',
    type: AchievementType.SOCIAL,
    rarity: AchievementRarity.RARE,
    icon: Users,
    requirement: 10,
    points: 180,
    category: '社交互动'
  },
  
  // 特殊成就
  {
    id: 'special_zen',
    title: '禅心如水',
    description: '完成禅修专注力训练并保持完美专注',
    type: AchievementType.SPECIAL,
    rarity: AchievementRarity.LEGENDARY,
    icon: Heart,
    requirement: 1,
    points: 800,
    category: '特殊成就'
  }
]

interface AchievementSystemProps {
  userStats: UserStats
  onAchievementUnlock?: (achievement: Achievement) => void
  className?: string
}

export default function AchievementSystem({ 
  userStats, 
  onAchievementUnlock,
  className = '' 
}: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false)

  // 初始化成就数据
  useEffect(() => {
    const initialAchievements = achievementDefinitions.map(def => {
      const progress = calculateProgress(def, userStats)
      const unlocked = progress >= def.requirement
      
      return {
        ...def,
        progress,
        unlocked,
        unlockedAt: unlocked ? new Date() : undefined
      }
    })
    
    setAchievements(initialAchievements)
  }, [])

  // 监听用户统计变化，检查新解锁的成就
  useEffect(() => {
    const updatedAchievements = achievements.map(achievement => {
      const newProgress = calculateProgress(achievement, userStats)
      const wasUnlocked = achievement.unlocked
      const isNowUnlocked = newProgress >= achievement.requirement
      
      if (!wasUnlocked && isNowUnlocked) {
        const unlockedAchievement = {
          ...achievement,
          progress: newProgress,
          unlocked: true,
          unlockedAt: new Date()
        }
        
        setNewlyUnlocked(prev => [...prev, unlockedAchievement])
        onAchievementUnlock?.(unlockedAchievement)
        
        return unlockedAchievement
      }
      
      return {
        ...achievement,
        progress: newProgress
      }
    })
    
    setAchievements(updatedAchievements)
  }, [userStats])

  // 计算成就进度
  const calculateProgress = (achievement: Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'>, stats: UserStats): number => {
    switch (achievement.type) {
      case AchievementType.TRAINING_STREAK:
        return stats.trainingStreak
      case AchievementType.SCORE_MILESTONE:
        return stats.totalScore
      case AchievementType.TIME_SPENT:
        return stats.totalTrainingTime
      case AchievementType.MODULE_COMPLETION:
        return stats.modulesCompleted
      case AchievementType.PERFECT_SCORE:
        return stats.perfectScores
      case AchievementType.SPEED_DEMON:
        return stats.fastestReaction > 0 ? stats.fastestReaction : Infinity
      case AchievementType.SOCIAL:
        return stats.socialInteractions
      case AchievementType.SPECIAL:
        // 特殊成就需要特定条件
        return achievement.id === 'special_zen' ? (stats.averageAccuracy >= 95 ? 1 : 0) : 0
      default:
        return 0
    }
  }

  // 获取稀有度颜色
  const getRarityColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return 'from-gray-400 to-gray-600'
      case AchievementRarity.RARE:
        return 'from-blue-400 to-blue-600'
      case AchievementRarity.EPIC:
        return 'from-purple-400 to-purple-600'
      case AchievementRarity.LEGENDARY:
        return 'from-yellow-400 to-orange-500'
      default:
        return 'from-gray-400 to-gray-600'
    }
  }

  // 获取稀有度文本颜色
  const getRarityTextColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return 'text-gray-400'
      case AchievementRarity.RARE:
        return 'text-blue-400'
      case AchievementRarity.EPIC:
        return 'text-purple-400'
      case AchievementRarity.LEGENDARY:
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  // 获取分类列表
  const categories = ['all', ...Array.from(new Set(achievements.map(a => a.category)))]
  
  // 筛选成就
  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false
    if (showUnlockedOnly && !achievement.unlocked) return false
    return true
  })

  // 统计数据
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 成就统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{unlockedCount}/{achievements.length}</div>
              <div className="text-sm text-gray-300">已解锁成就</div>
            </div>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{totalPoints}</div>
              <div className="text-sm text-gray-300">成就积分</div>
            </div>
            <Star className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{Math.round((unlockedCount / achievements.length) * 100)}%</div>
              <div className="text-sm text-gray-300">完成度</div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* 筛选控件 */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              className={`
                ${selectedCategory === category 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
                }
              `}
            >
              {category === 'all' ? '全部' : category}
            </Button>
          ))}
        </div>
        
        <Button
          onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
          variant="outline"
          size="sm"
          className={`
            ${showUnlockedOnly 
              ? 'bg-green-500/20 text-green-400 border-green-400/50' 
              : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
            }
          `}
        >
          {showUnlockedOnly ? '仅显示已解锁' : '显示全部'}
        </Button>
      </div>

      {/* 成就网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className={`
                relative bg-white/10 backdrop-blur-md rounded-xl p-4 border transition-all duration-300
                ${achievement.unlocked 
                  ? 'border-white/30 shadow-lg' 
                  : 'border-white/10 opacity-60'
                }
              `}
            >
              {/* 解锁状态指示器 */}
              <div className="absolute top-2 right-2">
                {achievement.unlocked ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-500" />
                )}
              </div>

              {/* 成就图标 */}
              <div className={`
                w-12 h-12 rounded-xl bg-gradient-to-r ${getRarityColor(achievement.rarity)} 
                flex items-center justify-center mb-3
              `}>
                <achievement.icon className="w-6 h-6 text-white" />
              </div>

              {/* 成就信息 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">{achievement.title}</h3>
                  <Badge className={`${getRarityTextColor(achievement.rarity)} bg-transparent border-current`}>
                    {achievement.rarity}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-300">{achievement.description}</p>
                
                {/* 进度条 */}
                {!achievement.unlocked && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>进度</span>
                      <span>{Math.min(achievement.progress, achievement.requirement)}/{achievement.requirement}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((achievement.progress / achievement.requirement) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* 积分 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{achievement.category}</span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3 h-3" />
                    <span className="text-xs font-medium">{achievement.points}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 新解锁成就通知 */}
      <AnimatePresence>
        {newlyUnlocked.map((achievement, index) => (
          <motion.div
            key={`notification-${achievement.id}`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 shadow-2xl border border-yellow-300"
            style={{ bottom: `${4 + index * 80}px` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <achievement.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white">成就解锁！</div>
                <div className="text-sm text-white/90">{achievement.title}</div>
              </div>
              <Button
                onClick={() => setNewlyUnlocked(prev => prev.filter(a => a.id !== achievement.id))}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                ×
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}