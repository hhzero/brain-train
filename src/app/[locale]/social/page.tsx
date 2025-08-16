'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  MessageCircle, 
  UserPlus, 
  Star, 
  Target, 
  Award, 
  Heart, 
  MoreHorizontal, 
  Eye, 
  Flame,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';

// 用户接口
interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  totalScore: number;
  weeklyScore: number;
  streak: number;
  rank: number;
  status: 'online' | 'offline' | 'training';
  isFriend?: boolean;
}

// 好友请求接口
interface FriendRequest {
  id: string;
  from: User;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: number;
}

// 活动接口
interface Activity {
  id: string;
  user: User;
  type: 'achievement' | 'training' | 'milestone' | 'challenge';
  title: string;
  description: string;
  timestamp: number;
  likes: number;
  isLiked: boolean;
}

// 排行榜类型
type LeaderboardType = 'weekly' | 'monthly' | 'allTime';

export default function SocialPage() {
  const t = useTranslations('social');
  const [activeTab, setActiveTab] = useState('friends');
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('weekly');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 模拟用户数据
  const [currentUser, setCurrentUser] = useState<User>({
    id: '1',
    username: 'player1',
    displayName: '脑力训练师',
    avatar: '/avatars/user1.jpg',
    level: 15,
    totalScore: 12500,
    weeklyScore: 850,
    streak: 7,
    rank: 3,
    status: 'online'
  });

  // 好友列表
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);

  // 模拟数据加载
  useEffect(() => {
    // 模拟好友数据
    const mockFriends: User[] = [
      {
        id: '2',
        username: 'smartbrain',
        displayName: '智慧大脑',
        avatar: '/avatars/user2.jpg',
        level: 18,
        totalScore: 15200,
        weeklyScore: 920,
        streak: 12,
        rank: 1,
        status: 'training',
        isFriend: true
      },
      {
        id: '3',
        username: 'quickthink',
        displayName: '快速思考者',
        avatar: '/avatars/user3.jpg',
        level: 12,
        totalScore: 8900,
        weeklyScore: 680,
        streak: 5,
        rank: 8,
        status: 'online',
        isFriend: true
      },
      {
        id: '4',
        username: 'memoryking',
        displayName: '记忆之王',
        avatar: '/avatars/user4.jpg',
        level: 20,
        totalScore: 18500,
        weeklyScore: 1100,
        streak: 15,
        rank: 2,
        status: 'offline',
        isFriend: true
      }
    ];

    // 模拟好友请求
    const mockRequests: FriendRequest[] = [
      {
        id: 'req1',
        from: {
          id: '5',
          username: 'newplayer',
          displayName: '新手玩家',
          avatar: '/avatars/user5.jpg',
          level: 3,
          totalScore: 1200,
          weeklyScore: 150,
          streak: 2,
          rank: 45,
          status: 'online'
        },
        status: 'pending',
        timestamp: Date.now() - 3600000
      }
    ];

    // 模拟活动流
    const mockActivities: Activity[] = [
      {
        id: 'act1',
        user: mockFriends[0],
        type: 'achievement',
        title: '获得新成就',
        description: '完成了"记忆大师"挑战',
        timestamp: Date.now() - 1800000,
        likes: 5,
        isLiked: false
      },
      {
        id: 'act2',
        user: mockFriends[1],
        type: 'training',
        title: '完成训练',
        description: '完成了数学运算训练，得分95分',
        timestamp: Date.now() - 3600000,
        likes: 3,
        isLiked: true
      }
    ];

    setFriends(mockFriends);
    setFriendRequests(mockRequests);
    setActivities(mockActivities);
    setLeaderboard([...mockFriends, currentUser].sort((a, b) => b.weeklyScore - a.weeklyScore));
  }, [currentUser]);

  // 获取状态颜色
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-400';
      case 'training':
        return 'bg-blue-400';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  // 获取状态文本
  const getStatusText = (status: User['status']) => {
    switch (status) {
      case 'online':
        return t('status.online');
      case 'training':
        return t('status.training');
      case 'offline':
        return t('status.offline');
      default:
        return t('status.unknown');
    }
  };

  // 获取活动图标
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'achievement':
        return Trophy;
      case 'training':
        return Target;
      case 'milestone':
        return Star;
      case 'challenge':
        return Award;
      default:
        return Star;
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return t('time.minutesAgo', { minutes });
    } else if (hours < 24) {
      return t('time.hoursAgo', { hours });
    } else {
      return t('time.daysAgo', { days });
    }
  };

  // 处理好友请求
  const handleFriendRequest = (requestId: string, action: 'accept' | 'decline') => {
    setFriendRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'accept' ? 'accepted' : 'declined' }
          : req
      )
    );

    if (action === 'accept') {
      const request = friendRequests.find(req => req.id === requestId);
      if (request) {
        setFriends(prev => [...prev, { ...request.from, isFriend: true }]);
      }
    }
  };

  // 点赞活动
  const handleLikeActivity = (activityId: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId
          ? {
              ...activity,
              isLiked: !activity.isLiked,
              likes: activity.isLiked ? activity.likes - 1 : activity.likes + 1
            }
          : activity
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      {/* 星空背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Users className="w-12 h-12 text-pink-400" />
            {t('title')}
          </h1>
          <p className="text-xl text-purple-200">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* 用户信息卡片 */}
        {currentUser && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-4 border-pink-400">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
                      <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-2xl">
                        {currentUser.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-gray-800 ${getStatusColor(currentUser.status)}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{currentUser.displayName}</h2>
                    <p className="text-gray-400">@{currentUser.username}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className="bg-purple-600 text-white">
                        {t('level')} {currentUser.level}
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Trophy className="w-4 h-4" />
                        <span className="font-bold">{currentUser.totalScore}</span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <Flame className="w-4 h-4" />
                        <span>{t('streakDays', { days: currentUser.streak })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">#{currentUser.rank}</div>
                    <div className="text-gray-400 text-sm">{t('totalRank')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 主要内容区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <TabsTrigger value="friends" className="text-white data-[state=active]:bg-purple-600">
                <Users className="w-4 h-4 mr-2" />
                {t('tabs.friends')}
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-white data-[state=active]:bg-purple-600">
                <Trophy className="w-4 h-4 mr-2" />
                {t('tabs.leaderboard')}
              </TabsTrigger>
              <TabsTrigger value="activities" className="text-white data-[state=active]:bg-purple-600">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('tabs.activities')}
              </TabsTrigger>
              <TabsTrigger value="requests" className="text-white data-[state=active]:bg-purple-600">
                <UserPlus className="w-4 h-4 mr-2" />
                {t('tabs.requests')}
                {friendRequests.filter(req => req.status === 'pending').length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs">
                    {friendRequests.filter(req => req.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* 好友列表 */}
            <TabsContent value="friends" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">{t('myFriends')}</h3>
                <Button
                  onClick={() => setShowAddFriend(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('addFriend')}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend, index) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:border-purple-500 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={friend.avatar} alt={friend.displayName} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {friend.displayName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(friend.status)}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{friend.displayName}</h4>
                            <p className="text-sm text-gray-400">@{friend.username}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem className="text-white hover:bg-gray-700">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                {t('sendMessage')}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-gray-700">
                                <Target className="w-4 h-4 mr-2" />
                                {t('inviteTraining')}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-gray-700">
                                <Eye className="w-4 h-4 mr-2" />
                                {t('viewProfile')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{t('level')}</span>
                            <Badge className="bg-purple-600 text-white">{friend.level}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{t('status.label')}</span>
                            <span className="text-white">{getStatusText(friend.status)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{t('weeklyScore')}</span>
                            <span className="text-yellow-400 font-bold">{friend.weeklyScore}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{t('streak')}</span>
                            <span className="text-orange-400">{friend.streak} {t('days')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* 排行榜 */}
            <TabsContent value="leaderboard" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">{t('leaderboard')}</h3>
                <div className="flex gap-2">
                  <Button
                    variant={leaderboardType === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLeaderboardType('weekly')}
                    className="text-white"
                  >
                    {t('weekly')}
                  </Button>
                  <Button
                    variant={leaderboardType === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLeaderboardType('monthly')}
                    className="text-white"
                  >
                    {t('monthly')}
                  </Button>
                  <Button
                    variant={leaderboardType === 'allTime' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLeaderboardType('allTime')}
                    className="text-white"
                  >
                    {t('allTime')}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className={`bg-gray-800/80 backdrop-blur-sm border-gray-700 ${
                      user.id === currentUser.id ? 'border-purple-500 bg-purple-900/20' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold">
                            {index + 1}
                          </div>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar} alt={user.displayName} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {user.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{user.displayName}</h4>
                            <p className="text-sm text-gray-400">@{user.username}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-yellow-400">{user.weeklyScore}</div>
                            <div className="text-sm text-gray-400">{t('points')}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* 活动流 */}
            <TabsContent value="activities" className="space-y-4">
              <h3 className="text-2xl font-bold text-white">{t('activityFeed')}</h3>
              
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={activity.user.avatar} alt={activity.user.displayName} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {activity.user.displayName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <IconComponent className="w-4 h-4 text-purple-400" />
                                <span className="font-bold text-white">{activity.user.displayName}</span>
                                <span className="text-gray-400">{activity.title}</span>
                              </div>
                              <p className="text-gray-300 mb-2">{activity.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{formatTime(activity.timestamp)}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikeActivity(activity.id)}
                                  className={`text-gray-400 hover:text-red-400 ${
                                    activity.isLiked ? 'text-red-400' : ''
                                  }`}
                                >
                                  <Heart className={`w-4 h-4 mr-1 ${
                                    activity.isLiked ? 'fill-current' : ''
                                  }`} />
                                  {activity.likes}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* 好友请求 */}
            <TabsContent value="requests" className="space-y-4">
              <h3 className="text-2xl font-bold text-white">{t('friendRequests')}</h3>
              
              <div className="space-y-4">
                {friendRequests.filter(req => req.status === 'pending').map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={request.from.avatar} alt={request.from.displayName} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {request.from.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{request.from.displayName}</h4>
                            <p className="text-sm text-gray-400">@{request.from.username}</p>
                            <p className="text-sm text-gray-400">{formatTime(request.timestamp)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleFriendRequest(request.id, 'accept')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {t('accept')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFriendRequest(request.id, 'decline')}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              {t('decline')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                
                {friendRequests.filter(req => req.status === 'pending').length === 0 && (
                  <div className="text-center py-8">
                    <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">{t('noRequests')}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* 添加好友弹窗 */}
      <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{t('addFriend')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="text-center py-8">
              <p className="text-gray-400">{t('searchHint')}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}