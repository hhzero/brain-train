'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  Target, 
  Calendar, 
  Clock, 
  Star, 
  Gift, 
  Bell, 
  Settings, 
  ChevronRight, 
  Sparkles, 
  Brain, 
  Heart, 
  Zap,
  Award,
  Crown,
  Flame,
  BookOpen,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PersonalizedRecommendations, { 
  TrainingHistory, 
  UserPreferences, 
  UserAbilities, 
  TrainingType 
} from './PersonalizedRecommendations'
import AchievementSystem, { UserStats } from './AchievementSystem'

// 用户接口
export interface User {
  id: string
  username: string
  displayName: string
  avatar?: string
  level: number
  totalScore: number
  achievements: number
  joinDate: string
  lastActive: string
  status: 'online' | 'offline' | 'training'
  stats: UserStats
}

// 好友接口
export interface Friend {
  id: string
  user: User
  friendshipDate: Date
  mutualFriends: number
}

// 挑战接口
export interface Challenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly'
  target: number
  current: number
  reward: number
  participants: number
  endDate: Date
}

// 排行榜条目接口
export interface LeaderboardEntry {
  rank: number
  user: User
  score: number
  change: number
}

// 社交活动接口
export interface SocialActivity {
  id: string
  user: User
  type: 'achievement' | 'training' | 'milestone' | 'challenge'
  content: string
  timestamp: Date
  likes: number
  comments: number
}

// 用户留存数据
export interface RetentionData {
  dailyStreak: number
  weeklyGoalProgress: number
  monthlyGoalProgress: number
  totalTrainingDays: number
  averageSessionTime: number
  lastLoginDate: Date
  nextMilestone: Milestone
  engagementScore: number
  riskLevel: 'low' | 'medium' | 'high'
}

// 里程碑
export interface Milestone {
  id: string
  title: string
  description: string
  target: number
  current: number
  reward: string
  type: 'streak' | 'score' | 'time' | 'modules'
  icon: React.ComponentType<any>
}

// 通知
export interface Notification {
  id: string
  type: 'achievement' | 'reminder' | 'challenge' | 'friend' | 'milestone'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
}

// 每日目标
export interface DailyGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  type: 'training_time' | 'sessions' | 'score' | 'modules'
  reward: number // 积分奖励
  completed: boolean
  icon: React.ComponentType<any>
}

// 个性化洞察
export interface PersonalInsight {
  id: string
  type: 'strength' | 'weakness' | 'trend' | 'recommendation'
  title: string
  description: string
  data: any
  actionable: boolean
  actionText?: string
  actionUrl?: string
}

interface UserRetentionSystemProps {
  currentUser: User
  retentionData: RetentionData
  trainingHistory: TrainingHistory[]
  userPreferences: UserPreferences
  userAbilities: UserAbilities
  friends: Friend[]
  challenges: Challenge[]
  leaderboard: LeaderboardEntry[]
  activities: SocialActivity[]
  notifications: Notification[]
  dailyGoals: DailyGoal[]
  insights: PersonalInsight[]
  className?: string
}

export default function UserRetentionSystem({
  currentUser,
  retentionData,
  trainingHistory,
  userPreferences,
  userAbilities,
  friends,
  challenges,
  leaderboard,
  activities,
  notifications,
  dailyGoals,
  insights,
  className = ''
}: UserRetentionSystemProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [unreadNotifications, setUnreadNotifications] = useState(
    notifications.filter(n => !n.read).length
  )
  const [showNotifications, setShowNotifications] = useState(false)

  // 计算参与度等级
  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { level: '高度活跃', color: 'text-green-400', bgColor: 'bg-green-400/10' }
    if (score >= 60) return { level: '活跃', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' }
    if (score >= 40) return { level: '一般', color: 'text-orange-400', bgColor: 'bg-orange-400/10' }
    return { level: '需要关注', color: 'text-red-400', bgColor: 'bg-red-400/10' }
  }

  // 计算风险等级颜色
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'high': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return Trophy
      case 'reminder': return Clock
      case 'challenge': return Target
      case 'friend': return Users
      case 'milestone': return Star
      default: return Bell
    }
  }

  // 获取洞察图标
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return TrendingUp
      case 'weakness': return Target
      case 'trend': return BarChart3
      case 'recommendation': return Sparkles
      default: return Brain
    }
  }

  const engagementLevel = getEngagementLevel(retentionData.engagementScore)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">训练中心</h1>
          <p className="text-gray-300">个性化的脑力训练体验</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 通知按钮 */}
          <div className="relative">
            <Button
              onClick={() => setShowNotifications(!showNotifications)}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            
            {/* 通知下拉菜单 */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-12 w-80 bg-gray-900/95 backdrop-blur-md rounded-xl border border-white/20 shadow-xl z-50"
                >
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold text-white">通知</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type)
                      return (
                        <div key={notification.id} className="p-4 border-b border-white/5 hover:bg-white/5">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                              <IconComponent className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-white text-sm">{notification.title}</div>
                              <div className="text-gray-400 text-xs mt-1">{notification.message}</div>
                              <div className="text-gray-500 text-xs mt-2">
                                {notification.timestamp.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* 设置按钮 */}
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 连胜天数 */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">连胜天数</p>
                <p className="text-3xl font-bold text-white">{retentionData.dailyStreak}</p>
                <p className="text-green-400 text-sm mt-1">🔥 保持势头!</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Flame className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 参与度评分 */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">参与度评分</p>
                <p className="text-3xl font-bold text-white">{retentionData.engagementScore}</p>
                <Badge className={`${engagementLevel.bgColor} ${engagementLevel.color} mt-1`}>
                  {engagementLevel.level}
                </Badge>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Activity className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 本周目标 */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-400 text-sm">本周目标</p>
                <p className="text-3xl font-bold text-white">{retentionData.weeklyGoalProgress}%</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <Progress value={retentionData.weeklyGoalProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* 下个里程碑 */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-400 text-sm">下个里程碑</p>
                <p className="text-lg font-bold text-white">{retentionData.nextMilestone.title}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <retentionData.nextMilestone.icon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {retentionData.nextMilestone.current}/{retentionData.nextMilestone.target}
            </div>
            <Progress 
              value={(retentionData.nextMilestone.current / retentionData.nextMilestone.target) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* 每日目标 */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            今日目标
          </CardTitle>
          <CardDescription className="text-gray-400">
            完成每日目标获得额外积分奖励
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dailyGoals.map((goal) => (
              <div key={goal.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <goal.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  {goal.completed && (
                    <Badge className="bg-green-500/20 text-green-400">
                      ✓ 完成
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-white mb-1">{goal.title}</h4>
                <p className="text-gray-400 text-sm mb-3">{goal.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">进度</span>
                    <span className="text-white">{goal.current}/{goal.target}</span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                  <div className="text-xs text-yellow-400">
                    +{goal.reward} 积分奖励
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 个性化洞察 */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            个性化洞察
          </CardTitle>
          <CardDescription className="text-gray-400">
            基于您的训练数据生成的智能分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.slice(0, 4).map((insight) => {
              const IconComponent = getInsightIcon(insight.type)
              return (
                <div key={insight.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <IconComponent className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                      <p className="text-gray-400 text-sm mb-3">{insight.description}</p>
                      {insight.actionable && (
                        <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                          {insight.actionText}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 主要功能区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/10 border border-white/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            概览
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            推荐
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Trophy className="w-4 h-4 mr-2" />
            成就
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            社交
          </TabsTrigger>
        </TabsList>

        {/* 概览 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 训练统计 */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">训练统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">总训练天数</span>
                    <span className="text-white font-semibold">{retentionData.totalTrainingDays}天</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">平均训练时长</span>
                    <span className="text-white font-semibold">{retentionData.averageSessionTime}分钟</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">总训练次数</span>
                    <span className="text-white font-semibold">{trainingHistory.length}次</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">平均准确率</span>
                    <span className="text-white font-semibold">
                      {Math.round(trainingHistory.reduce((acc, h) => acc + h.accuracy, 0) / trainingHistory.length)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 能力雷达图 */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">能力评估</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(userAbilities).filter(([key]) => key !== 'overall').map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400 capitalize">
                          {key === 'attention' ? '注意力' :
                           key === 'memory' ? '记忆力' :
                           key === 'cognitive' ? '认知' :
                           key === 'emotional' ? '情绪' :
                           key === 'social' ? '社交' :
                           key === 'speed' ? '速度' : key}
                        </span>
                        <span className="text-white font-semibold">{value}</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 个性化推荐 */}
        <TabsContent value="recommendations">
          <PersonalizedRecommendations
            trainingHistory={trainingHistory}
            userPreferences={userPreferences}
            userAbilities={userAbilities}
            maxRecommendations={6}
          />
        </TabsContent>

        {/* 成就系统 */}
        <TabsContent value="achievements">
          <AchievementSystem userStats={currentUser.stats} />
        </TabsContent>

        {/* 社交功能 */}
        <TabsContent value="social">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                社交功能
              </CardTitle>
              <CardDescription className="text-gray-400">
                与好友一起训练，分享成就
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">社交功能正在开发中</p>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  敬请期待
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}