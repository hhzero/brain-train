'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, Clock, Target, Award, Filter, ChevronDown, BarChart3 } from 'lucide-react';
import { dataPersistence, TrainingSession } from '@/utils/DataPersistenceManager';

/**
 * 训练历史记录组件
 * 展示用户的训练历史、统计数据和趋势分析
 */
export const TrainingHistory: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 获取用户数据
  const userData = dataPersistence.getUserData();
  const sessions = userData?.sessions || [];
  const statistics = userData?.statistics;

  // 过滤会话数据
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // 按时间过滤
    const now = new Date();
    if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(session => new Date(session.timestamp) >= weekAgo);
    } else if (selectedPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(session => new Date(session.timestamp) >= monthAgo);
    }

    // 按训练模式过滤
    if (selectedMode !== 'all') {
      filtered = filtered.filter(session => session.mode === selectedMode);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [sessions, selectedPeriod, selectedMode]);

  // 计算统计数据
  const stats = useMemo(() => {
    if (filteredSessions.length === 0) {
      return {
        totalSessions: 0,
        totalTime: 0,
        averageAccuracy: 0,
        averageReactionTime: 0,
        bestStreak: 0,
        totalScore: 0
      };
    }

    const totalTime = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalAccuracy = filteredSessions.reduce((sum, session) => sum + session.accuracy, 0);
    const totalReactionTime = filteredSessions.reduce((sum, session) => sum + session.averageReactionTime, 0);
    // 计算最佳连击数（基于准确率计算）
    const bestStreak = Math.max(...filteredSessions.map(session => Math.floor(session.accuracy * 10)));
    const totalScore = filteredSessions.reduce((sum, session) => sum + session.score, 0);

    return {
      totalSessions: filteredSessions.length,
      totalTime,
      averageAccuracy: totalAccuracy / filteredSessions.length,
      averageReactionTime: totalReactionTime / filteredSessions.length,
      bestStreak,
      totalScore
    };
  }, [filteredSessions]);

  // 获取可用的训练模式
  const availableModes = useMemo(() => {
    const modes = new Set(sessions.map(session => session.mode));
    return Array.from(modes);
  }, [sessions]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取训练模式显示名称
  const getModeDisplayName = (mode: string) => {
    const modeNames: Record<string, string> = {
      'tutorial': '教程模式',
      'visual': '视觉训练',
      'audio': '听觉训练',
      'dual': '双重训练'
    };
    return modeNames[mode] || mode;
  };

  // 获取准确率颜色
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-400';
    if (accuracy >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* 标题和过滤器 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">训练历史</h3>
        </div>
        
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Filter className="w-4 h-4 text-white" />
          <span className="text-white">筛选</span>
          <ChevronDown className={`w-4 h-4 text-white transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      {/* 筛选器 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 时间范围 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">时间范围</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'all')}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="week">最近一周</option>
                  <option value="month">最近一月</option>
                  <option value="all">全部时间</option>
                </select>
              </div>
              
              {/* 训练模式 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">训练模式</label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="all">全部模式</option>
                  {availableModes.map(mode => (
                    <option key={mode} value={mode}>{getModeDisplayName(mode)}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">训练次数</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">总时长</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatTime(stats.totalTime)}</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">平均准确率</span>
          </div>
          <div className={`text-2xl font-bold ${getAccuracyColor(stats.averageAccuracy)}`}>
            {stats.averageAccuracy.toFixed(1)}%
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">总分数</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalScore.toLocaleString()}</div>
        </motion.div>
      </div>

      {/* 训练记录列表 */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
        <div className="p-6 border-b border-white/10">
          <h4 className="text-lg font-bold text-white">训练记录</h4>
          <p className="text-gray-300 text-sm mt-1">共 {filteredSessions.length} 条记录</p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">暂无训练记录</div>
              <div className="text-sm text-gray-500">开始训练后，记录将显示在这里</div>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-white">{getModeDisplayName(session.mode)}</span>
                      <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full">
                        N={session.nLevel}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">{formatDate(session.timestamp)}</div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-gray-400">时长</div>
                      <div className="text-white font-medium">{formatTime(session.duration)}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-gray-400">准确率</div>
                      <div className={`font-medium ${getAccuracyColor(session.accuracy)}`}>
                        {session.accuracy.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-gray-400">分数</div>
                      <div className="text-white font-medium">{session.score.toLocaleString()}</div>
                    </div>
                    
                    {session.averageReactionTime && (
                      <div className="text-center">
                        <div className="text-gray-400">反应时间</div>
                        <div className="text-white font-medium">{session.averageReactionTime.toFixed(0)}ms</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingHistory;