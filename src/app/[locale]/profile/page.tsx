/**
 * 个人资料和设置页面
 * 包含用户信息编辑、训练偏好设置、隐私设置等功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Camera,
  Edit3,
  Save,
  X,
  Check,
  Trophy,
  Target,
  Clock,
  Calendar,
  Zap,
  Brain,
  Heart,
  Star,
  Award,
  Flame,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';

// 用户资料接口
interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  level: number;
  totalScore: number;
  totalTrainingTime: number;

  joinDate: string;
  lastActive: string;
  streak: number;
  favoriteTraining: string;
  rank: number;
  completedSessions: number;
  averageAccuracy: number;
  bestReactionTime: number;
}

// 设置接口
interface UserSettings {
  // 通知设置
  notifications: {

    friendRequests: boolean;
    trainingReminders: boolean;
    weeklyReports: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
  // 隐私设置
  privacy: {
    profileVisible: boolean;
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
    showTrainingStats: boolean;

  };
  // 训练偏好
  training: {
    difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
    sessionDuration: number; // 分钟
    breakReminders: boolean;
    autoSave: boolean;
    showHints: boolean;
    adaptiveDifficulty: boolean;
  };
  // 界面设置
  interface: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    animations: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: 'default' | 'colorblind' | 'highContrast';
  };
  // 音频设置 - 移除音乐相关配置
  audio: {
    masterVolume: number;
    effectsVolume: number;
    voiceVolume: number;
    muteAll: boolean;
  };
}

// 统计数据接口
interface UserStats {
  totalSessions: number;
  totalTime: number;
  averageAccuracy: number;
  bestStreak: number;
  favoriteTraining: string;
  improvementRate: number;
  weeklyGoalProgress: number;
  monthlyGoalProgress: number;
  trainingDistribution: {
    attention: number;
    memory: number;
    reaction: number;
    cognitive: number;
  };

}

/**
 * 个人资料和设置页面组件
 */
const ProfilePage: React.FC = () => {
  const t = useTranslations('profile');
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 初始化数据
  useEffect(() => {
    // 模拟用户资料
    const mockProfile: UserProfile = {
      id: 'current-user',
      username: 'brainmaster2024',
      displayName: t('profile.mockData.displayName'),
      email: 'user@example.com',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20brain%20training%20master%20character%20with%20glowing%20brain&image_size=square',
      bio: t('profile.mockData.bio'),
      level: 15,
      totalScore: 12500,
      totalTrainingTime: 4800, // 分钟

      joinDate: '2024-01-15',
      lastActive: new Date().toISOString(),
      streak: 7,
      favoriteTraining: t('profile.mockData.favoriteTraining'),
      rank: 5,
      completedSessions: 156,
      averageAccuracy: 87.5,
      bestReactionTime: 245 // 毫秒
    };
    setUserProfile(mockProfile);
    setTempProfile(mockProfile);

    // 模拟用户设置
    const mockSettings: UserSettings = {
      notifications: {
  
        friendRequests: true,
        trainingReminders: true,
        weeklyReports: true,
        soundEnabled: true,
        vibrationEnabled: false
      },
      privacy: {
        profileVisible: true,
        showOnlineStatus: true,
        allowFriendRequests: true,
        showTrainingStats: true,
  
      },
      training: {
        difficulty: 'adaptive',
        sessionDuration: 15,
        breakReminders: true,
        autoSave: true,
        showHints: true,
        adaptiveDifficulty: true
      },
      interface: {
        theme: 'dark',
        language: 'zh',
        animations: true,
        reducedMotion: false,
        fontSize: 'medium',
        colorScheme: 'default'
      },
      audio: {
        masterVolume: 80,
        effectsVolume: 70,
        voiceVolume: 85,
        muteAll: false
      }
    };
    setUserSettings(mockSettings);

    // 模拟统计数据
    const mockStats: UserStats = {
      totalSessions: 156,
      totalTime: 4800,
      averageAccuracy: 87.5,
      bestStreak: 15,
      favoriteTraining: t('profile.mockData.favoriteTraining'),
      improvementRate: 12.5,
      weeklyGoalProgress: 75,
      monthlyGoalProgress: 68,
      trainingDistribution: {
        attention: 35,
        memory: 25,
        reaction: 20,
        cognitive: 20
      },

    };
    setUserStats(mockStats);
  }, []);

  // 保存资料
  const handleSaveProfile = () => {
    if (tempProfile) {
      setUserProfile(tempProfile);
      setIsEditing(false);
      // 这里应该调用API保存到后端
      console.log(t('profile.actions.saveProfile'), tempProfile);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setTempProfile(userProfile);
    setIsEditing(false);
  };

  // 更新设置
  const updateSettings = (category: keyof UserSettings, key: string, value: any) => {
    if (!userSettings) return;
    
    setUserSettings(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [key]: value
      }
    }));
  };

  // 格式化时间
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return t('profile.utils.timeFormat', { hours, minutes: mins });
  };

  // 获取稀有度颜色


  if (!userProfile || !userSettings || !userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">{t('profile.loading')}</div>
      </div>
    );
  }

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

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <User className="w-12 h-12 text-pink-400" />
            {t('profile.title')}
          </h1>
          <p className="text-xl text-purple-200">
            {t('profile.subtitle')}
          </p>
        </motion.div>

        {/* 主要内容区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <TabsTrigger value="profile" className="text-white data-[state=active]:bg-purple-600">
                <User className="w-4 h-4 mr-2" />
                {t('profile.tabs.profile')}
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-white data-[state=active]:bg-purple-600">
                <BarChart3 className="w-4 h-4 mr-2" />
                {t('profile.tabs.stats')}
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-white data-[state=active]:bg-purple-600">
                <Settings className="w-4 h-4 mr-2" />
                {t('profile.tabs.settings')}
              </TabsTrigger>
              <TabsTrigger value="privacy" className="text-white data-[state=active]:bg-purple-600">
                <Shield className="w-4 h-4 mr-2" />
                {t('profile.tabs.privacy')}
              </TabsTrigger>
            </TabsList>

            {/* 个人资料标签页 */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 基本信息卡片 */}
                <div className="lg:col-span-2">
                  <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {t('profile.basicInfo.title')}
                      </CardTitle>
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          {t('profile.basicInfo.edit')}
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveProfile}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {t('profile.basicInfo.save')}
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <X className="w-4 h-4 mr-2" />
                            {t('profile.basicInfo.cancel')}
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 头像 */}
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="w-24 h-24 border-4 border-purple-400">
                            <AvatarImage src={userProfile.avatar} alt={userProfile.displayName} />
                            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-3xl">
                              {userProfile.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {isEditing && (
                            <Button
                              size="sm"
                              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-purple-600 hover:bg-purple-700"
                            >
                              <Camera className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-600 text-white">
                              {t('profile.basicInfo.level')} {userProfile.level}
                            </Badge>
                            <Badge className="bg-yellow-600 text-white">
                              {t('profile.basicInfo.rank')} #{userProfile.rank}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">
                            {t('profile.basicInfo.joinDate')}: {new Date(userProfile.joinDate).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      </div>

                      {/* 表单字段 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="displayName" className="text-gray-300">{t('profile.basicInfo.displayName')}</Label>
                          <Input
                            id="displayName"
                            value={isEditing ? tempProfile?.displayName || '' : userProfile.displayName}
                            onChange={(e) => setTempProfile(prev => prev ? { ...prev, displayName: e.target.value } : null)}
                            disabled={!isEditing}
                            className="bg-gray-700 border-gray-600 text-white disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <Label htmlFor="username" className="text-gray-300">{t('profile.basicInfo.username')}</Label>
                          <Input
                            id="username"
                            value={isEditing ? tempProfile?.username || '' : userProfile.username}
                            onChange={(e) => setTempProfile(prev => prev ? { ...prev, username: e.target.value } : null)}
                            disabled={!isEditing}
                            className="bg-gray-700 border-gray-600 text-white disabled:opacity-60"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="email" className="text-gray-300">{t('profile.basicInfo.email')}</Label>
                          <Input
                            id="email"
                            type="email"
                            value={isEditing ? tempProfile?.email || '' : userProfile.email}
                            onChange={(e) => setTempProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                            disabled={!isEditing}
                            className="bg-gray-700 border-gray-600 text-white disabled:opacity-60"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="bio" className="text-gray-300">{t('profile.basicInfo.bio')}</Label>
                          <Textarea
                            id="bio"
                            value={isEditing ? tempProfile?.bio || '' : userProfile.bio || ''}
                            onChange={(e) => setTempProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                            disabled={!isEditing}
                            placeholder={t('profile.basicInfo.bioPlaceholder')}
                            className="bg-gray-700 border-gray-600 text-white disabled:opacity-60 resize-none"
                            rows={3}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 快速统计卡片 */}
                <div className="space-y-4">
                  <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        {t('profile.stats.quickStats')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">{userProfile.streak}</div>
                          <div className="text-sm text-gray-400">{t('profile.stats.currentStreak')}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{userProfile.totalScore.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">{t('profile.stats.totalScore')}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{formatTime(userProfile.totalTrainingTime)}</div>
                          <div className="text-sm text-gray-400">{t('profile.stats.trainingTime')}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{userProfile.completedSessions}</div>
                          <div className="text-sm text-gray-400">{t('profile.stats.completedSessions')}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* 统计标签页 */}
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{userStats.totalSessions}</div>
                    <div className="text-sm text-gray-400">{t('profile.stats.totalSessions')}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{formatTime(userStats.totalTime)}</div>
                    <div className="text-sm text-gray-400">{t('profile.stats.totalTime')}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{userStats.averageAccuracy}%</div>
                    <div className="text-sm text-gray-400">{t('profile.stats.averageAccuracy')}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{userStats.bestStreak}</div>
                    <div className="text-sm text-gray-400">{t('profile.stats.bestStreak')}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 训练分布 */}
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      {t('profile.stats.trainingDistribution')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(userStats.trainingDistribution).map(([type, percentage]) => {
                      const typeNames = {
                        attention: t('profile.stats.types.attention'),
                        memory: t('profile.stats.types.memory'),
                        reaction: t('profile.stats.types.reaction'),
                        cognitive: t('profile.stats.types.cognitive')
                      };
                      const colors = {
                        attention: 'bg-blue-500',
                        memory: 'bg-green-500',
                        reaction: 'bg-yellow-500',
                        cognitive: 'bg-purple-500'
                      };
                      
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{typeNames[type as keyof typeof typeNames]}</span>
                            <span className="text-white font-medium">{percentage}%</span>
                          </div>
                          <Progress 
                            value={percentage} 
                            className="h-2"
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* 目标进度 */}
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      {t('profile.stats.goalProgress')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">{t('profile.stats.weeklyGoalLabel')}</span>
                        <span className="text-white font-medium">{userStats.weeklyGoalProgress}%</span>
                      </div>
                      <Progress value={userStats.weeklyGoalProgress} className="h-3" />
                      <div className="text-xs text-gray-400 mt-1">{t('profile.stats.weeklyGoal')}</div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">{t('profile.stats.monthlyGoalLabel')}</span>
                        <span className="text-white font-medium">{userStats.monthlyGoalProgress}%</span>
                      </div>
                      <Progress value={userStats.monthlyGoalProgress} className="h-3" />
                      <div className="text-xs text-gray-400 mt-1">{t('profile.stats.monthlyGoal')}</div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <div className="text-sm text-gray-300 mb-2">{t('profile.stats.improvementRate')}</div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="text-xl font-bold text-green-400">+{userStats.improvementRate}%</span>
                        <span className="text-sm text-gray-400">{t('profile.stats.comparedToLastMonth')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 设置标签页 */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 通知设置 */}
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      {t('profile.settings.notifications.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(userSettings.notifications).map(([key, value]) => {
                      const labels = {
                        friendRequests: t('profile.settings.notifications.friendRequests'),
                        trainingReminders: t('profile.settings.notifications.trainingReminders'),
                        weeklyReports: t('profile.settings.notifications.weeklyReports'),
                        soundEnabled: t('profile.settings.notifications.soundEffects'),
                        vibrationEnabled: t('profile.settings.notifications.vibration')
                      };
                      
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="text-gray-300">
                            {labels[key as keyof typeof labels]}
                          </Label>
                          <Switch
                            id={key}
                            checked={value}
                            onCheckedChange={(checked) => updateSettings('notifications', key, checked)}
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* 训练偏好 */}
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      {t('profile.settings.training.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300 mb-2 block">{t('profile.settings.training.difficulty')}</Label>
                      <Select
                        value={userSettings.training.difficulty}
                        onValueChange={(value) => updateSettings('training', 'difficulty', value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="easy" className="text-white hover:bg-gray-700">{t('profile.settings.training.difficultyLevels.easy')}</SelectItem>
                          <SelectItem value="medium" className="text-white hover:bg-gray-700">{t('profile.settings.training.difficultyLevels.medium')}</SelectItem>
                          <SelectItem value="hard" className="text-white hover:bg-gray-700">{t('profile.settings.training.difficultyLevels.hard')}</SelectItem>
                          <SelectItem value="adaptive" className="text-white hover:bg-gray-700">{t('profile.settings.training.difficultyLevels.adaptive')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-gray-300 mb-2 block">
                        {t('profile.settings.training.duration')}: {userSettings.training.sessionDuration}{t('profile.settings.training.minutes')}
                      </Label>
                      <Slider
                        value={[userSettings.training.sessionDuration]}
                        onValueChange={([value]) => updateSettings('training', 'sessionDuration', value)}
                        max={60}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {['breakReminders', 'autoSave', 'showHints', 'adaptiveDifficulty'].map((key) => {
                      const labels = {
                        breakReminders: t('profile.settings.training.breakReminders'),
                        autoSave: t('profile.settings.training.autoSave'),
                        showHints: t('profile.settings.training.showHints'),
                        adaptiveDifficulty: t('profile.settings.training.adaptiveDifficulty')
                      };
                      
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="text-gray-300">
                            {labels[key as keyof typeof labels]}
                          </Label>
                          <Switch
                            id={key}
                            checked={userSettings.training[key as keyof typeof userSettings.training] as boolean}
                            onCheckedChange={(checked) => updateSettings('training', key, checked)}
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* 界面设置 */}
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      {t('profile.settings.interface.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300 mb-2 block">{t('profile.settings.interface.theme')}</Label>
                      <Select
                        value={userSettings.interface.theme}
                        onValueChange={(value) => updateSettings('interface', 'theme', value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="light" className="text-white hover:bg-gray-700">
                            <div className="flex items-center gap-2">
                              <Sun className="w-4 h-4" />
                              {t('profile.settings.interface.themes.light')}
                            </div>
                          </SelectItem>
                          <SelectItem value="dark" className="text-white hover:bg-gray-700">
                            <div className="flex items-center gap-2">
                              <Moon className="w-4 h-4" />
                              {t('profile.settings.interface.themes.dark')}
                            </div>
                          </SelectItem>
                          <SelectItem value="auto" className="text-white hover:bg-gray-700">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4" />
                              {t('profile.settings.interface.themes.auto')}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300 mb-2 block">{t('profile.settings.interface.language')}</Label>
                      <Select
                        value={userSettings.interface.language}
                        onValueChange={(value) => updateSettings('interface', 'language', value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="zh" className="text-white hover:bg-gray-700">{t('profile.settings.interface.languages.zh')}</SelectItem>
                          <SelectItem value="en" className="text-white hover:bg-gray-700">{t('profile.settings.interface.languages.en')}</SelectItem>
                          <SelectItem value="ja" className="text-white hover:bg-gray-700">{t('profile.settings.interface.languages.ja')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300 mb-2 block">{t('profile.settings.interface.fontSize')}</Label>
                      <Select
                        value={userSettings.interface.fontSize}
                        onValueChange={(value) => updateSettings('interface', 'fontSize', value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="small" className="text-white hover:bg-gray-700">{t('profile.settings.interface.fontSizes.small')}</SelectItem>
                          <SelectItem value="medium" className="text-white hover:bg-gray-700">{t('profile.settings.interface.fontSizes.medium')}</SelectItem>
                          <SelectItem value="large" className="text-white hover:bg-gray-700">{t('profile.settings.interface.fontSizes.large')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {['animations', 'reducedMotion'].map((key) => {
                      const labels = {
                        animations: t('profile.settings.interface.animations'),
                        reducedMotion: t('profile.settings.interface.reducedMotion')
                      };
                      
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="text-gray-300">
                            {labels[key as keyof typeof labels]}
                          </Label>
                          <Switch
                            id={key}
                            checked={userSettings.interface[key as keyof typeof userSettings.interface] as boolean}
                            onCheckedChange={(checked) => updateSettings('interface', key, checked)}
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* 音频设置 */}
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Volume2 className="w-5 h-5" />
                      {t('profile.settings.audio.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-gray-300">{t('profile.settings.audio.muteAll')}</Label>
                      <Switch
                        checked={userSettings.audio.muteAll}
                        onCheckedChange={(checked) => updateSettings('audio', 'muteAll', checked)}
                      />
                    </div>

                    {!userSettings.audio.muteAll && (
                      <>
                        {Object.entries(userSettings.audio)
                          .filter(([key]) => key !== 'muteAll')
                          .map(([key, value]) => {
                            const labels = {
                              masterVolume: t('profile.settings.audio.masterVolume'),
                              effectsVolume: t('profile.settings.audio.effectsVolume'),
                              voiceVolume: t('profile.settings.audio.voiceVolume')
                            };
                            
                            return (
                              <div key={key}>
                                <Label className="text-gray-300 mb-2 block">
                                  {labels[key as keyof typeof labels]}: {value}%
                                </Label>
                                <Slider
                                  value={[value as number]}
                                  onValueChange={([newValue]) => updateSettings('audio', key, newValue)}
                                  max={100}
                                  min={0}
                                  step={5}
                                  className="w-full"
                                />
                              </div>
                            );
                          })
                        }
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 隐私标签页 */}
            <TabsContent value="privacy" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 隐私设置 */}
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {t('profile.settings.privacy.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(userSettings.privacy).map(([key, value]) => {
                      const labels = {
                        profileVisible: t('profile.settings.privacy.profileVisible'),
                        showOnlineStatus: t('profile.settings.privacy.showOnlineStatus'),
                        allowFriendRequests: t('profile.settings.privacy.allowFriendRequests'),
                        showTrainingStats: t('profile.settings.privacy.showTrainingStats')
                      };
                      
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key} className="text-gray-300">
                            {labels[key as keyof typeof labels]}
                          </Label>
                          <Switch
                            id={key}
                            checked={value}
                            onCheckedChange={(checked) => updateSettings('privacy', key, checked)}
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* 数据管理 */}
                <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      {t('profile.settings.dataManagement.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t('profile.settings.dataManagement.exportData')}
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {t('profile.settings.dataManagement.importData')}
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('profile.settings.dataManagement.resetData')}
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('profile.settings.dataManagement.deleteAccount')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* 删除确认弹窗 */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
            />
            
            <motion.div
              className="relative bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-red-400" />
                  {t('profile.settings.dataManagement.deleteAccount')}
                </h3>
                
                <p className="text-gray-300 mb-6">
                  {t('profile.settings.dataManagement.deleteConfirmation')}
                </p>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                  >
                    {t('profile.settings.dataManagement.confirmDelete')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;