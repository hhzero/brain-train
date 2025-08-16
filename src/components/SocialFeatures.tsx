'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Trophy, 
  Target, 
  Crown, 
  Medal, 
  Star, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Zap, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Share2, 
  Gift,
  ChevronRight,
  Filter,
  Search,
  MoreHorizontal,
  Award,
  Flame,
  Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 用户信息
export interface User {
  id: string
  username: string
  avatar?: string
  level: number
  totalScore: number
  streak: number
  joinedAt: Date
  lastActive: Date
  badges: Badge[]
  stats: UserStats
}

// 用户统计
export interface UserStats {
  totalTrainings: number
  totalMinutes: number
  averageScore: number
  bestStreak: number
  favoriteModule: string
  achievements: number
}

// 徽章
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: Date
}

// 好友
export interface Friend {
  user: User
  status: 'pending' | 'accepted' | 'blocked'
  addedAt: Date
  mutualFriends: number
}

// 挑战赛
export interface Challenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  module: string
  difficulty: 'easy' | 'medium' | 'hard'
  startDate: Date
  endDate: Date
  participants: number
  maxParticipants?: number
  rewards: Reward[]
  requirements: string[]
  status: 'upcoming' | 'active' | 'ended'
  userParticipated: boolean
  userRank?: number
}

// 奖励
export interface Reward {
  type: 'badge' | 'points' | 'title' | 'avatar'
  name: string
  description: string
  value: number
  icon: string
}

// 排行榜条目
export interface LeaderboardEntry {
  rank: number
  user: User
  score: number
  change: number // 排名变化
  isCurrentUser: boolean
}

// 活动动态
export interface Activity {
  id: string
  user: User
  type: 'achievement' | 'challenge_complete' | 'new_record' | 'level_up' | 'badge_earned'
  content: string
  timestamp: Date
  data?: any
}

interface SocialFeaturesProps {
  currentUser: User
  friends: Friend[]
  challenges: Challenge[]
  leaderboard: LeaderboardEntry[]
  activities: Activity[]
  className?: string
}

export default function SocialFeatures({
  currentUser,
  friends,
  challenges,
  leaderboard,
  activities,
  className = ''
}: SocialFeaturesProps) {
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showInviteModal, setShowInviteModal] = useState(false)

  // 过滤好友
  const filteredFriends = friends.filter(friend => 
    friend.user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedFilter === 'all' || friend.status === selectedFilter)
  )

  // 过滤挑战
  const filteredChallenges = challenges.filter(challenge => 
    challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedFilter === 'all' || challenge.status === selectedFilter)
  )

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-400/10'
      case 'rare': return 'text-blue-400 bg-blue-400/10'
      case 'epic': return 'text-purple-400 bg-purple-400/10'
      case 'legendary': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'text-green-400 bg-green-400/10'
      case 'weekly': return 'text-blue-400 bg-blue-400/10'
      case 'monthly': return 'text-purple-400 bg-purple-400/10'
      case 'special': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement': return Trophy
      case 'challenge_complete': return Target
      case 'new_record': return TrendingUp
      case 'level_up': return Star
      case 'badge_earned': return Medal
      default: return Star
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    return `${days}天前`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 标题和用户信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">社交中心</h2>
          <p className="text-gray-300">与好友一起训练，参与挑战，分享成就</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-white font-semibold">{currentUser.username}</div>
            <div className="text-sm text-gray-400">等级 {currentUser.level} · {currentUser.totalScore}分</div>
          </div>
          <Avatar className="w-12 h-12 border-2 border-cyan-400">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              {currentUser.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-semibold">{friends.filter(f => f.status === 'accepted').length}</div>
              <div className="text-sm text-gray-400">好友</div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-white font-semibold">{leaderboard.find(l => l.isCurrentUser)?.rank || '-'}</div>
              <div className="text-sm text-gray-400">排名</div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-white font-semibold">{currentUser.streak}</div>
              <div className="text-sm text-gray-400">连胜</div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-white font-semibold">{currentUser.badges.length}</div>
              <div className="text-sm text-gray-400">徽章</div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/10 border border-white/20">
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Trophy className="w-4 h-4 mr-2" />
            排行榜
          </TabsTrigger>
          <TabsTrigger value="friends" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            好友
          </TabsTrigger>
          <TabsTrigger value="challenges" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Target className="w-4 h-4 mr-2" />
            挑战赛
          </TabsTrigger>
          <TabsTrigger value="activities" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            动态
          </TabsTrigger>
        </TabsList>

        {/* 排行榜 */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">全球排行榜</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Filter className="w-4 h-4 mr-2" />
                本周
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((entry, index) => (
              <motion.div
                key={entry.user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20
                  ${entry.isCurrentUser ? 'border-cyan-400 bg-cyan-400/10' : ''}
                  hover:border-cyan-400/50 transition-all duration-300
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* 排名 */}
                    <div className="flex items-center justify-center w-10 h-10">
                      {entry.rank <= 3 ? (
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          ${entry.rank === 1 ? 'bg-yellow-500' : 
                            entry.rank === 2 ? 'bg-gray-400' : 'bg-orange-500'}
                        `}>
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-gray-400">#{entry.rank}</span>
                      )}
                    </div>
                    
                    {/* 用户信息 */}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={entry.user.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                        {entry.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${entry.isCurrentUser ? 'text-cyan-400' : 'text-white'}`}>
                          {entry.user.username}
                        </span>
                        {entry.isCurrentUser && (
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/50">
                            你
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        等级 {entry.user.level} · {entry.user.streak}天连胜
                      </div>
                    </div>
                  </div>
                  
                  {/* 分数和变化 */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className={`text-sm flex items-center ${
                      entry.change > 0 ? 'text-green-400' : 
                      entry.change < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {entry.change > 0 && <TrendingUp className="w-3 h-3 mr-1" />}
                      {entry.change !== 0 && (
                        <span>{entry.change > 0 ? '+' : ''}{entry.change}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* 好友 */}
        <TabsContent value="friends" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">我的好友</h3>
            <Button 
              onClick={() => setShowInviteModal(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              添加好友
            </Button>
          </div>
          
          {/* 搜索和筛选 */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索好友..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFriends.map((friend, index) => (
              <motion.div
                key={friend.user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-cyan-400/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={friend.user.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                        {friend.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-white">{friend.user.username}</div>
                      <div className="text-sm text-gray-400">
                        等级 {friend.user.level} · {formatTimeAgo(friend.user.lastActive)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Target className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* 好友统计 */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-white font-semibold">{friend.user.totalScore.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">总分</div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{friend.user.streak}</div>
                    <div className="text-xs text-gray-400">连胜</div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{friend.user.badges.length}</div>
                    <div className="text-xs text-gray-400">徽章</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* 挑战赛 */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">挑战赛</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                进行中
              </Button>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                即将开始
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getChallengeTypeColor(challenge.type)}>
                        {challenge.type === 'daily' ? '每日' :
                         challenge.type === 'weekly' ? '每周' :
                         challenge.type === 'monthly' ? '每月' : '特殊'}
                      </Badge>
                      <Badge className={`${challenge.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-gray-400 bg-gray-400/10'}`}>
                        {challenge.status === 'active' ? '进行中' :
                         challenge.status === 'upcoming' ? '即将开始' : '已结束'}
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{challenge.title}</h4>
                    <p className="text-gray-300 text-sm mb-3">{challenge.description}</p>
                  </div>
                  
                  {challenge.userParticipated && (
                    <div className="text-right">
                      <div className="text-cyan-400 font-semibold">#{challenge.userRank}</div>
                      <div className="text-xs text-gray-400">当前排名</div>
                    </div>
                  )}
                </div>
                
                {/* 挑战信息 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-400">
                      <Users className="w-4 h-4 mr-1" />
                      {challenge.participants}人参与
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {challenge.endDate.toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* 奖励 */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">奖励</div>
                    <div className="flex flex-wrap gap-2">
                      {challenge.rewards.slice(0, 3).map((reward, idx) => (
                        <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                          <Gift className="w-3 h-3" />
                          {reward.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 参与按钮 */}
                  <Button 
                    className={`w-full ${
                      challenge.userParticipated 
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                        : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                    }`}
                    disabled={challenge.userParticipated || challenge.status !== 'active'}
                  >
                    {challenge.userParticipated ? '已参与' : 
                     challenge.status === 'active' ? '立即参与' : '即将开始'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* 动态 */}
        <TabsContent value="activities" className="space-y-4">
          <h3 className="text-xl font-bold text-white">好友动态</h3>
          
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type)
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-cyan-400/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                        {activity.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{activity.user.username}</span>
                        <IconComponent className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                      <p className="text-gray-300">{activity.content}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}