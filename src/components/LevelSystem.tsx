'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Crown, 
  Zap, 
  Shield, 
  Gem, 
  Trophy, 
  Sparkles, 
  ChevronUp,
  Gift,
  Lock,
  Unlock
} from 'lucide-react';
import { ProgressBar, progressConfigs } from './ProgressBar';

// 等级数据接口
interface LevelData {
  level: number;
  title: string;
  description: string;
  requiredExp: number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  rewards: string[];
  privileges: string[];
}

// 用户等级状态接口
interface UserLevelState {
  currentLevel: number;
  currentExp: number;
  totalExp: number;
  nextLevelExp: number;
  expToNextLevel: number;
}

// 等级提升事件接口
interface LevelUpEvent {
  fromLevel: number;
  toLevel: number;
  newRewards: string[];
  newPrivileges: string[];
}

// 等级系统组件属性
interface LevelSystemProps {
  userState: UserLevelState;
  onLevelUp?: (event: LevelUpEvent) => void;
  className?: string;
  showAnimation?: boolean;
}

// 预定义等级数据
const LEVEL_DATA: LevelData[] = [
  {
    level: 1,
    title: '新手训练者',
    description: '刚开始你的大脑训练之旅',
    requiredExp: 0,
    icon: <Star className="w-6 h-6" />,
    color: 'gray',
    gradient: 'from-gray-400 to-gray-600',
    rewards: ['基础训练模式'],
    privileges: ['访问教程', '基础统计']
  },
  {
    level: 2,
    title: '专注学徒',
    description: '开始掌握注意力控制技巧',
    requiredExp: 100,
    icon: <Zap className="w-6 h-6" />,
    color: 'blue',
    gradient: 'from-blue-400 to-cyan-500',
    rewards: ['音效反馈'],
    privileges: ['自定义训练时长', '详细统计']
  },
  {
    level: 3,
    title: '记忆探索者',
    description: '工作记忆能力显著提升',
    requiredExp: 300,
    icon: <Shield className="w-6 h-6" />,
    color: 'green',
    gradient: 'from-green-400 to-emerald-500',
    rewards: ['双重模式解锁'],
    privileges: ['自适应难度', '训练计划']
  },
  {
    level: 4,
    title: '认知战士',
    description: '多任务处理能力大幅增强',
    requiredExp: 600,
    icon: <Trophy className="w-6 h-6" />,
    color: 'purple',
    gradient: 'from-purple-400 to-pink-500',
    rewards: ['高级训练模式', '特殊徽章'],
    privileges: ['个性化建议', '高级分析']
  },
  {
    level: 5,
    title: '大脑大师',
    description: '达到了认知训练的高级水平',
    requiredExp: 1000,
    icon: <Crown className="w-6 h-6" />,
    color: 'yellow',
    gradient: 'from-yellow-400 to-orange-500',
    rewards: ['大师模式', '专属头像'],
    privileges: ['无限训练', '导出数据']
  },
  {
    level: 6,
    title: '认知传奇',
    description: '超越常人的认知能力',
    requiredExp: 1500,
    icon: <Gem className="w-6 h-6" />,
    color: 'pink',
    gradient: 'from-pink-400 to-rose-500',
    rewards: ['传奇徽章', '特效解锁'],
    privileges: ['创建挑战', '社区功能']
  },
  {
    level: 7,
    title: '超脑精英',
    description: '认知能力达到精英水准',
    requiredExp: 2200,
    icon: <Sparkles className="w-6 h-6" />,
    color: 'indigo',
    gradient: 'from-indigo-400 to-purple-500',
    rewards: ['精英特权', '独家内容'],
    privileges: ['优先支持', '测试版功能']
  },
  {
    level: 8,
    title: '思维宗师',
    description: '思维能力已臻化境',
    requiredExp: 3000,
    icon: <Crown className="w-6 h-6" />,
    color: 'red',
    gradient: 'from-red-400 to-pink-500',
    rewards: ['宗师称号', '终极挑战'],
    privileges: ['全功能访问', '专属客服']
  }
];

/**
 * 用户等级系统组件
 * 提供等级展示、经验值管理和等级提升动画
 */
export const LevelSystem: React.FC<LevelSystemProps> = ({
  userState,
  onLevelUp,
  className = '',
  showAnimation = true
}) => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<LevelUpEvent | null>(null);
  const [previousLevel, setPreviousLevel] = useState(userState.currentLevel);

  // 获取当前等级数据
  const getCurrentLevelData = (level: number): LevelData => {
    return LEVEL_DATA.find(data => data.level === level) || LEVEL_DATA[0];
  };

  // 获取下一等级数据
  const getNextLevelData = (level: number): LevelData | null => {
    return LEVEL_DATA.find(data => data.level === level + 1) || null;
  };

  // 检测等级提升
  useEffect(() => {
    if (userState.currentLevel > previousLevel) {
      const fromLevelData = getCurrentLevelData(previousLevel);
      const toLevelData = getCurrentLevelData(userState.currentLevel);
      
      const levelUpEvent: LevelUpEvent = {
        fromLevel: previousLevel,
        toLevel: userState.currentLevel,
        newRewards: toLevelData.rewards,
        newPrivileges: toLevelData.privileges
      };
      
      setLevelUpData(levelUpEvent);
      setShowLevelUp(true);
      
      if (onLevelUp) {
        onLevelUp(levelUpEvent);
      }
      
      setPreviousLevel(userState.currentLevel);
    }
  }, [userState.currentLevel, previousLevel, onLevelUp]);

  const currentLevelData = getCurrentLevelData(userState.currentLevel);
  const nextLevelData = getNextLevelData(userState.currentLevel);
  const progressPercentage = nextLevelData 
    ? ((userState.currentExp - currentLevelData.requiredExp) / (nextLevelData.requiredExp - currentLevelData.requiredExp)) * 100
    : 100;

  // 渲染等级卡片
  const renderLevelCard = () => (
    <motion.div
      className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 背景装饰 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentLevelData.gradient} opacity-5`} />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
      
      <div className="relative z-10">
        {/* 等级头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-br ${currentLevelData.gradient} shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-white drop-shadow-lg">
                {currentLevelData.icon}
              </div>
            </motion.div>
            
            <div>
              <motion.div
                className="text-2xl font-bold text-white mb-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                等级 {userState.currentLevel}
              </motion.div>
              <motion.div
                className={`text-lg font-medium text-${currentLevelData.color}-400`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentLevelData.title}
              </motion.div>
            </div>
          </div>
          
          <motion.div
            className="text-right"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-sm text-gray-400">总经验值</div>
            <div className="text-xl font-bold text-white">
              {userState.totalExp.toLocaleString()}
            </div>
          </motion.div>
        </div>
        
        {/* 等级描述 */}
        <motion.p
          className="text-gray-300 mb-6 text-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {currentLevelData.description}
        </motion.p>
        
        {/* 经验值进度 */}
        {nextLevelData && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">距离下一等级</span>
              <span className="text-white font-medium">
                {userState.expToNextLevel.toLocaleString()} EXP
              </span>
            </div>
            
            <ProgressBar
              config={{
                ...progressConfigs.level(userState.currentExp - currentLevelData.requiredExp, nextLevelData.requiredExp - currentLevelData.requiredExp),
                label: `${currentLevelData.title} → ${nextLevelData.title}`
              }}
              size="medium"
              style="fantasy"
            />
          </div>
        )}
        
        {/* 已达到最高等级 */}
        {!nextLevelData && (
          <motion.div
            className="text-center py-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <div className="text-yellow-400 text-lg font-bold mb-2">
              🎉 已达到最高等级！
            </div>
            <div className="text-gray-300 text-sm">
              你已经是真正的认知大师了！
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  // 渲染等级特权和奖励
  const renderRewardsAndPrivileges = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 当前奖励 */}
      <motion.div
        className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-6 border border-gray-700/50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-pink-400" />
          当前奖励
        </h3>
        <div className="space-y-2">
          {currentLevelData.rewards.map((reward, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-300"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <Unlock className="w-4 h-4 text-green-400" />
              {reward}
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* 当前特权 */}
      <motion.div
        className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-6 border border-gray-700/50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          特殊特权
        </h3>
        <div className="space-y-2">
          {currentLevelData.privileges.map((privilege, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-300"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <Star className="w-4 h-4 text-yellow-400" />
              {privilege}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // 渲染下一等级预览
  const renderNextLevelPreview = () => {
    if (!nextLevelData) return null;
    
    return (
      <motion.div
        className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-6 border border-gray-700/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ChevronUp className="w-5 h-5 text-blue-400" />
          下一等级预览
        </h3>
        
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${nextLevelData.gradient} opacity-70`}>
            <div className="text-white">
              {nextLevelData.icon}
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              等级 {nextLevelData.level} - {nextLevelData.title}
            </div>
            <div className="text-sm text-gray-400">
              {nextLevelData.description}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">解锁奖励</h4>
            <div className="space-y-1">
              {nextLevelData.rewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock className="w-3 h-3" />
                  {reward}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">新增特权</h4>
            <div className="space-y-1">
              {nextLevelData.privileges.map((privilege, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock className="w-3 h-3" />
                  {privilege}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // 渲染等级提升动画
  const renderLevelUpAnimation = () => {
    if (!levelUpData) return null;
    
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowLevelUp(false)}
      >
        <motion.div
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-600 max-w-md w-full mx-4 relative overflow-hidden"
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.5, y: 50 }}
          transition={{ type: "spring", duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 庆祝背景效果 */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10" />
          
          {/* 粒子效果 */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0], 
                opacity: [0, 1, 0],
                y: [-20, -60, -100]
              }}
              transition={{ 
                duration: 2, 
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 3
              }}
            />
          ))}
          
          <div className="relative z-10 text-center">
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              🎉
            </motion.div>
            
            <motion.h2
              className="text-2xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              等级提升！
            </motion.h2>
            
            <motion.p
              className="text-gray-300 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              恭喜你从等级 {levelUpData.fromLevel} 提升到等级 {levelUpData.toLevel}！
            </motion.p>
            
            <motion.div
              className="space-y-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">新解锁奖励</h3>
                <div className="space-y-1">
                  {levelUpData.newRewards.map((reward, index) => (
                    <div key={index} className="text-sm text-green-400">
                      ✨ {reward}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">新增特权</h3>
                <div className="space-y-1">
                  {levelUpData.newPrivileges.map((privilege, index) => (
                    <div key={index} className="text-sm text-blue-400">
                      👑 {privilege}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              onClick={() => setShowLevelUp(false)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              继续训练
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* 主等级卡片 */}
      {renderLevelCard()}
      
      {/* 奖励和特权 */}
      {renderRewardsAndPrivileges()}
      
      {/* 下一等级预览 */}
      {renderNextLevelPreview()}
      
      {/* 等级提升动画 */}
      <AnimatePresence>
        {showLevelUp && showAnimation && renderLevelUpAnimation()}
      </AnimatePresence>
    </div>
  );
};

export default LevelSystem;