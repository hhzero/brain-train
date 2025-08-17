'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Zap, 
  Brain, 
  Award, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Timer,
  Percent
} from 'lucide-react';
import { ProgressBar, progressConfigs } from './ProgressBar';

// 统计数据类型接口
interface StatisticData {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number; // 趋势变化百分比
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description?: string;
}

// 训练会话统计接口
interface SessionStats {
  accuracy: number;           // 准确率
  reactionTime: number;       // 平均反应时间
  totalTrials: number;        // 总试验次数
  correctTrials: number;      // 正确试验次数
  currentStreak: number;      // 当前连击
  maxStreak: number;          // 最高连击
  sessionDuration: number;    // 会话时长（秒）
  nLevel: number;             // N-Back等级
  trainingMode: string;       // 训练模式
  score: number;              // 得分
}

// 历史统计接口
interface HistoricalStats {
  totalSessions: number;      // 总会话数
  totalTrainingTime: number;  // 总训练时间（分钟）
  averageAccuracy: number;    // 平均准确率
  bestAccuracy: number;       // 最佳准确率
  averageReactionTime: number; // 平均反应时间
  bestReactionTime: number;   // 最佳反应时间
  highestLevel: number;       // 最高等级
  totalScore: number;         // 总得分

  currentLevel: number;       // 当前等级
  experiencePoints: number;   // 经验值
  nextLevelExp: number;       // 下一等级所需经验
}

// 统计面板属性
interface StatisticsPanelProps {
  sessionStats: SessionStats;
  historicalStats: HistoricalStats;
  className?: string;
  showDetailed?: boolean;
}

/**
 * 统计数据展示面板组件
 * 提供详细的训练统计信息和可视化展示
 */
export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  sessionStats,
  historicalStats,
  className = '',
  showDetailed = true
}) => {
  const [activeTab, setActiveTab] = useState<'session' | 'historical' | 'progress'>('session');
  const [isExpanded, setIsExpanded] = useState(false);

  // 计算当前会话统计数据
  const currentSessionData: StatisticData[] = [
    {
      label: '准确率',
      value: sessionStats.accuracy,
      unit: '%',
      icon: <Target className="w-5 h-5" />,
      color: 'green',
      gradient: 'from-green-400 to-emerald-500',
      description: '当前会话的答题准确率'
    },
    {
      label: '反应时间',
      value: sessionStats.reactionTime,
      unit: 'ms',
      icon: <Timer className="w-5 h-5" />,
      color: 'blue',
      gradient: 'from-blue-400 to-cyan-500',
      description: '平均反应时间'
    },
    {
      label: '当前连击',
      value: sessionStats.currentStreak,
      icon: <Zap className="w-5 h-5" />,
      color: 'yellow',
      gradient: 'from-yellow-400 to-orange-500',
      description: '连续正确答题次数'
    },
    {
      label: '训练等级',
      value: sessionStats.nLevel,
      icon: <Brain className="w-5 h-5" />,
      color: 'purple',
      gradient: 'from-purple-400 to-pink-500',
      description: '当前N-Back训练等级'
    },
    {
      label: '会话时长',
      value: Math.floor(sessionStats.sessionDuration / 60),
      unit: '分钟',
      icon: <Clock className="w-5 h-5" />,
      color: 'indigo',
      gradient: 'from-indigo-400 to-purple-500',
      description: '本次训练会话时长'
    },
    {
      label: '得分',
      value: sessionStats.score,
      icon: <Award className="w-5 h-5" />,
      color: 'pink',
      gradient: 'from-pink-400 to-rose-500',
      description: '当前会话获得的分数'
    }
  ];

  // 计算历史统计数据
  const historicalData: StatisticData[] = [
    {
      label: '总训练时间',
      value: Math.floor(historicalStats.totalTrainingTime / 60),
      unit: '小时',
      icon: <Calendar className="w-5 h-5" />,
      color: 'blue',
      gradient: 'from-blue-400 to-cyan-500',
      description: '累计训练时间'
    },
    {
      label: '平均准确率',
      value: historicalStats.averageAccuracy,
      unit: '%',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'green',
      gradient: 'from-green-400 to-emerald-500',
      description: '历史平均准确率'
    },
    {
      label: '最高等级',
      value: historicalStats.highestLevel,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'purple',
      gradient: 'from-purple-400 to-pink-500',
      description: '达到的最高训练等级'
    },
    {
      label: '总会话数',
      value: historicalStats.totalSessions,
      icon: <Activity className="w-5 h-5" />,
      color: 'orange',
      gradient: 'from-orange-400 to-red-500',
      description: '完成的训练会话总数'
    },
    {
      label: '最佳反应时间',
      value: historicalStats.bestReactionTime,
      unit: 'ms',
      icon: <Zap className="w-5 h-5" />,
      color: 'yellow',
      gradient: 'from-yellow-400 to-orange-500',
      description: '历史最佳反应时间'
    },
    {
      label: '解锁成就',
      value: 0,
      icon: <Award className="w-5 h-5" />,
      color: 'pink',
      gradient: 'from-pink-400 to-rose-500',
      description: '已解锁的成就数量'
    }
  ];

  // 渲染统计卡片
  const renderStatCard = (stat: StatisticData, index: number) => (
    <motion.div
      key={stat.label}
      className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* 背景光效 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-xl`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`text-${stat.color}-400 drop-shadow-lg`}>
            {stat.icon}
          </div>
          {stat.trend && (
            <motion.div
              className={`flex items-center text-xs ${
                stat.trend > 0 ? 'text-green-400' : 'text-red-400'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <TrendingUp className={`w-3 h-3 mr-1 ${
                stat.trend < 0 ? 'rotate-180' : ''
              }`} />
              {Math.abs(stat.trend)}%
            </motion.div>
          )}
        </div>
        
        <div className="space-y-1">
          <motion.div
            className="text-2xl font-bold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
          >
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            {stat.unit && (
              <span className={`text-sm text-${stat.color}-400 ml-1`}>
                {stat.unit}
              </span>
            )}
          </motion.div>
          
          <div className="text-sm text-gray-300 font-medium">
            {stat.label}
          </div>
          
          {stat.description && showDetailed && (
            <div className="text-xs text-gray-400 mt-2">
              {stat.description}
            </div>
          )}
        </div>
      </div>
      
      {/* 悬停时的额外光效 */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 rounded-xl blur-xl`}
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );

  // 渲染进度面板
  const renderProgressPanel = () => (
    <div className="space-y-6">
      {/* 等级进度 */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          等级进度
        </h3>
        <ProgressBar
          config={progressConfigs.level(
            historicalStats.experiencePoints,
            historicalStats.nextLevelExp
          )}
          size="large"
          style="fantasy"
        />
        <div className="flex justify-between mt-3 text-sm text-gray-300">
          <span>当前等级: {historicalStats.currentLevel}</span>
          <span>经验值: {historicalStats.experiencePoints.toLocaleString()}</span>
        </div>
      </div>
      
      {/* 技能进度 */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          技能熟练度
        </h3>
        <ProgressBar
          config={progressConfigs.skill(
            historicalStats.averageAccuracy,
            100
          )}
          size="large"
          style="fantasy"
        />
      </div>
      
      {/* 会话进度 */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          当前会话
        </h3>
        <ProgressBar
          config={progressConfigs.session(
            sessionStats.correctTrials,
            sessionStats.totalTrials
          )}
          size="large"
          style="fantasy"
        />
      </div>
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {/* 标签页导航 */}
      <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
        {[
          { key: 'session', label: '当前会话', icon: <Activity className="w-4 h-4" /> },
          { key: 'historical', label: '历史统计', icon: <BarChart3 className="w-4 h-4" /> },
          { key: 'progress', label: '进度追踪', icon: <TrendingUp className="w-4 h-4" /> }
        ].map((tab) => (
          <motion.button
            key={tab.key}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => setActiveTab(tab.key as any)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'session' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentSessionData.map((stat, index) => renderStatCard(stat, index))}
            </div>
          )}
          
          {activeTab === 'historical' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historicalData.map((stat, index) => renderStatCard(stat, index))}
            </div>
          )}
          
          {activeTab === 'progress' && renderProgressPanel()}
        </motion.div>
      </AnimatePresence>
      
      {/* 展开/收起按钮 */}
      {showDetailed && (
        <motion.button
          className="mt-6 w-full py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg text-white font-medium hover:from-gray-600 hover:to-gray-700 transition-all border border-gray-600/50"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {isExpanded ? '收起详细信息' : '展开详细信息'}
        </motion.button>
      )}
      
      {/* 详细信息面板 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mt-4 p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50 backdrop-blur-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-bold text-white mb-4">详细分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="text-gray-300">
                  <span className="text-white font-medium">训练模式:</span> {sessionStats.trainingMode}
                </div>
                <div className="text-gray-300">
                  <span className="text-white font-medium">最高连击:</span> {sessionStats.maxStreak}
                </div>
                <div className="text-gray-300">
                  <span className="text-white font-medium">总得分:</span> {historicalStats.totalScore.toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-gray-300">
                  <span className="text-white font-medium">最佳准确率:</span> {historicalStats.bestAccuracy}%
                </div>
                <div className="text-gray-300">
                  <span className="text-white font-medium">平均反应时间:</span> {historicalStats.averageReactionTime}ms
                </div>
                <div className="text-gray-300">
                  <span className="text-white font-medium">成就进度:</span> 0/50
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatisticsPanel;