'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Brain,
  Target,
  Zap,
  Trophy,
  Calendar,
  Clock,
  TrendingUp,
  Star,
  Activity,
  Eye,
  Shuffle,
  Timer,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import { ProgressBar, progressConfigs } from '@/components/ProgressBar';

// 训练类型枚举
enum TrainingType {
  MEMORY = 'memory',
  ATTENTION = 'attention',
  REACTION = 'reaction',
  SPEED_READING = 'speed_reading'
}

// 训练记录接口
interface TrainingRecord {
  id: string;
  type: TrainingType;
  name: string;
  date: string;
  duration: number; // 秒
  score: number;
  accuracy: number; // 百分比
  reactionTime?: number; // 毫秒
  level?: number;
}

// 统计数据接口
interface DashboardStats {
  totalTrainingSessions: number;
  totalTrainingTime: number; // 分钟
  averageScore: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  favoriteTrainingType: TrainingType;
  weeklyProgress: number; // 百分比
  monthlyGoalProgress: number; // 百分比
}

// 能力雷达图数据
interface AbilityRadarData {
  ability: string;
  score: number;
  maxScore: number;
}

// 模拟训练数据
const mockTrainingRecords: TrainingRecord[] = [
  {
    id: '1',
    type: TrainingType.MEMORY,
    name: 'nback_training',
    date: '2024-01-15',
    duration: 300,
    score: 1250,
    accuracy: 85.5,
    level: 3,

  },
  {
    id: '2',
    type: TrainingType.ATTENTION,
    name: 'multi_attention',
    date: '2024-01-14',
    duration: 240,
    score: 980,
    accuracy: 78.2,
    reactionTime: 450,

  },
  {
    id: '3',
    type: TrainingType.REACTION,
    name: 'reaction_speed',
    date: '2024-01-13',
    duration: 180,
    score: 1580,
    accuracy: 92.1,
    reactionTime: 320,

  },
  {
    id: '4',
    type: TrainingType.ATTENTION,
    name: 'cognitive_flexibility',
    date: '2024-01-12',
    duration: 360,
    score: 1120,
    accuracy: 81.7,
    reactionTime: 520,

  },
  {
    id: '5',
    type: TrainingType.SPEED_READING,
    name: 'speed_reading',
    date: '2024-01-11',
    duration: 420,
    score: 890,
    accuracy: 76.3,

  }
];

// 图表颜色配置
const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#a855f7',
  pink: '#ec4899'
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.success, CHART_COLORS.warning];

/**
 * 训练仪表板页面组件
 * 展示用户的训练进度、统计数据和成就
 */
export default function DashboardPage() {
  const t = useTranslations();
  
  // 状态管理
  const [trainingRecords] = useState<TrainingRecord[]>(mockTrainingRecords);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'thisWeek' | 'thisMonth' | 'thisYear'>('thisWeek');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTrainingSessions: 0,
    totalTrainingTime: 0,
    averageScore: 0,
    averageAccuracy: 0,
    currentStreak: 0,
    longestStreak: 0,

    favoriteTrainingType: TrainingType.MEMORY,
    weeklyProgress: 0,
    monthlyGoalProgress: 0
  });

  // 计算统计数据
  useEffect(() => {
    const calculateStats = () => {
      const totalSessions = trainingRecords.length;
      const totalTime = trainingRecords.reduce((sum, record) => sum + record.duration, 0) / 60; // 转换为分钟
      const avgScore = totalSessions > 0 ? trainingRecords.reduce((sum, record) => sum + record.score, 0) / totalSessions : 0;
      const avgAccuracy = totalSessions > 0 ? trainingRecords.reduce((sum, record) => sum + record.accuracy, 0) / totalSessions : 0;
      
      // 计算训练类型分布
      const typeCount = trainingRecords.reduce((acc, record) => {
        acc[record.type] = (acc[record.type] || 0) + 1;
        return acc;
      }, {} as Record<TrainingType, number>);
      
      const favoriteType = Object.entries(typeCount).reduce((a, b) => 
        typeCount[a[0] as TrainingType] > typeCount[b[0] as TrainingType] ? a : b
      )[0] as TrainingType;
      

      
      setDashboardStats({
        totalTrainingSessions: totalSessions,
        totalTrainingTime: Math.round(totalTime),
        averageScore: Math.round(avgScore),
        averageAccuracy: Math.round(avgAccuracy * 10) / 10,
        currentStreak: 5, // 模拟数据
        longestStreak: 12, // 模拟数据

        favoriteTrainingType: favoriteType,
        weeklyProgress: 75, // 模拟数据
        monthlyGoalProgress: 60 // 模拟数据
      });
    };
    
    calculateStats();
  }, [trainingRecords]);

  // 准备图表数据
  const prepareChartData = () => {
    // 按日期分组的训练数据
    const dailyData = trainingRecords.reduce((acc, record) => {
      const date = record.date;
      if (!acc[date]) {
        acc[date] = { date, sessions: 0, totalScore: 0, totalAccuracy: 0, totalTime: 0 };
      }
      acc[date].sessions += 1;
      acc[date].totalScore += record.score;
      acc[date].totalAccuracy += record.accuracy;
      acc[date].totalTime += record.duration;
      return acc;
    }, {} as Record<string, any>);
    
    const chartData = Object.values(dailyData).map((day: any) => ({
      date: day.date,
      sessions: day.sessions,
      avgScore: Math.round(day.totalScore / day.sessions),
      avgAccuracy: Math.round((day.totalAccuracy / day.sessions) * 10) / 10,
      totalTime: Math.round(day.totalTime / 60) // 转换为分钟
    }));
    
    return chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // 准备训练类型分布数据
  const prepareTypeDistribution = () => {
    const typeCount = trainingRecords.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<TrainingType, number>);
    
    return Object.entries(typeCount).map(([type, count]) => ({
      name: t(`dashboard.trainingTypes.${type}`),
      value: count,
      type
    }));
  };

  // 准备能力雷达图数据
  const prepareAbilityRadar = (): AbilityRadarData[] => {
    const abilities = {
      memory: { total: 0, count: 0 },
      attention: { total: 0, count: 0 },
      reaction: { total: 0, count: 0 },
      speedReading: { total: 0, count: 0 },
      cognitiveFlexibility: { total: 0, count: 0 },
      focus: { total: 0, count: 0 }
    };
    
    trainingRecords.forEach(record => {
      switch (record.type) {
        case TrainingType.MEMORY:
          abilities.memory.total += record.accuracy;
          abilities.memory.count += 1;
          break;
        case TrainingType.ATTENTION:
          abilities.attention.total += record.accuracy;
          abilities.attention.count += 1;
          abilities.cognitiveFlexibility.total += record.accuracy * 0.8;
          abilities.cognitiveFlexibility.count += 0.8;
          abilities.focus.total += record.accuracy * 0.9;
          abilities.focus.count += 0.9;
          break;
        case TrainingType.REACTION:
          abilities.reaction.total += record.accuracy;
          abilities.reaction.count += 1;
          break;
        case TrainingType.SPEED_READING:
          abilities.speedReading.total += record.accuracy;
          abilities.speedReading.count += 1;
          break;
      }
    });
    
    return Object.entries(abilities).map(([abilityKey, data]) => ({
      ability: t(`dashboard.abilities.${abilityKey}`),
      score: data.count > 0 ? Math.round(data.total / data.count) : 0,
      maxScore: 100
    }));
  };

  const chartData = prepareChartData();
  const typeDistribution = prepareTypeDistribution();
  const abilityRadar = prepareAbilityRadar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <BarChart3 className="w-10 h-10 text-blue-400" />
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            {t('dashboard.description')}
          </p>
        </motion.div>

        {/* 时间范围选择 */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 rounded-lg p-1 flex gap-1">
            {(['thisWeek', 'thisMonth', 'thisYear'] as const).map((range) => (
              <Button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                variant={selectedTimeRange === range ? 'default' : 'ghost'}
                className={`px-6 py-2 ${
                  selectedTimeRange === range 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {t(`dashboard.timeRanges.${range}`)}
              </Button>
            ))}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 总训练次数 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">{t('dashboard.stats.totalTrainings')}</p>
                    <p className="text-3xl font-bold text-white">{dashboardStats.totalTrainingSessions}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 总训练时间 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">{t('dashboard.stats.totalTime')}</p>
                    <p className="text-3xl font-bold text-white">{dashboardStats.totalTrainingTime}{t('dashboard.units.minutes')}</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 平均准确率 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">{t('dashboard.stats.averageAccuracy')}</p>
                    <p className="text-3xl font-bold text-white">{dashboardStats.averageAccuracy}%</p>
                  </div>
                  <Target className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 当前连胜 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-sm font-medium">{t('dashboard.stats.currentStreak')}</p>
                    <p className="text-3xl font-bold text-white">{dashboardStats.currentStreak}{t('dashboard.units.days')}</p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 训练进度趋势 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-blue-400" />
                  {t('dashboard.charts.progressTrend')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      fontSize={12}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgScore" 
                      stroke={CHART_COLORS.primary} 
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                      name={t('dashboard.charts.averageScore')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgAccuracy" 
                      stroke={CHART_COLORS.success} 
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 4 }}
                      name={t('dashboard.charts.accuracyPercent')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* 训练类型分布 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-purple-400" />
                  {t('dashboard.charts.typeDistribution')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 能力雷达图和目标进度 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 能力雷达图 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-pink-400" />
                  {t('dashboard.charts.cognitiveAnalysis')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={abilityRadar}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="ability" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                    />
                    <Radar
                      name={t('dashboard.abilities.abilityScore')}
                      dataKey="score"
                      stroke={CHART_COLORS.pink}
                      fill={CHART_COLORS.pink}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* 目标进度 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  {t('dashboard.goals.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 周目标 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">{t('dashboard.goals.weeklyGoal')}</span>
                    <span className="text-white font-bold">{dashboardStats.weeklyProgress}%</span>
                  </div>
                  <ProgressBar
                    config={progressConfigs.session(dashboardStats.weeklyProgress, 100)}
                    className="mb-2"
                  />
                  <p className="text-sm text-gray-400">{t('dashboard.goals.weeklyTarget')}</p>
                </div>

                {/* 月目标 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">{t('dashboard.goals.monthlyGoal')}</span>
                    <span className="text-white font-bold">{dashboardStats.monthlyGoalProgress}%</span>
                  </div>
                  <ProgressBar
                    config={progressConfigs.level(dashboardStats.monthlyGoalProgress, 100)}
                    className="mb-2"
                  />
                  <p className="text-sm text-gray-400">{t('dashboard.goals.monthlyTarget')}</p>
                </div>


              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 最近训练记录 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="bg-gray-800/50 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                {t('dashboard.recentRecords')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingRecords.slice(0, 5).map((record, index) => (
                  <motion.div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {record.type === TrainingType.MEMORY && <Brain className="w-6 h-6 text-white" />}
                        {record.type === TrainingType.ATTENTION && <Eye className="w-6 h-6 text-white" />}
                        {record.type === TrainingType.REACTION && <Zap className="w-6 h-6 text-white" />}
                        {record.type === TrainingType.SPEED_READING && <Timer className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{t(`dashboard.trainingTypes.${record.type}`)}</h4>
                        <p className="text-gray-400 text-sm">{record.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{record.score}{t('dashboard.units.points')}</div>
                      <div className="text-gray-400 text-sm">{record.accuracy}%{t('dashboard.units.accuracy')}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>


      </div>
    </div>
  );
}