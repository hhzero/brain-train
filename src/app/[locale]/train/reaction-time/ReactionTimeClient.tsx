'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '../../components/Button';

/**
 * 游戏状态枚举
 */
type GameState = 'waiting' | 'playing' | 'finished';

/**
 * 目标对象接口
 */
interface Target {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  createdAt: number;
}

/**
 * 反应时间训练客户端组件
 * 实现连续点击目标的反应训练游戏
 */
export default function ReactionTimeClient() {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [gameAreaRef, setGameAreaRef] = useState<HTMLDivElement | null>(null);
  const [bestScore, setBestScore] = useState<number>(0);
  const [averageReaction, setAverageReaction] = useState<number>(0);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 生成随机颜色
   */
  const getRandomColor = () => {
    const colors = [
      'bg-gradient-to-br from-pink-400 to-rose-500',
      'bg-gradient-to-br from-purple-400 to-violet-500',
      'bg-gradient-to-br from-blue-400 to-cyan-500',
      'bg-gradient-to-br from-green-400 to-emerald-500',
      'bg-gradient-to-br from-yellow-400 to-orange-500',
      'bg-gradient-to-br from-red-400 to-pink-500',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  /**
   * 创建新目标
   */
  const createTarget = useCallback(() => {
    if (!gameAreaRef || gameState !== 'playing') return;

    const rect = gameAreaRef.getBoundingClientRect();
    const size = Math.random() * 40 + 40; // 40-80px
    const x = Math.random() * (rect.width - size);
    const y = Math.random() * (rect.height - size);

    const newTarget: Target = {
      id: Date.now(),
      x,
      y,
      color: getRandomColor(),
      size,
      createdAt: Date.now(),
    };

    setTargets(prev => [...prev, newTarget]);

    // 3秒后自动移除目标
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== newTarget.id));
    }, 3000);
  }, [gameAreaRef, gameState]);

  /**
   * 开始游戏
   */
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setReactionTimes([]);

    // 游戏计时器
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 目标生成计时器
    const generateTarget = () => {
      createTarget();
      const nextDelay = Math.random() * 1000 + 500; // 0.5-1.5秒
      targetTimerRef.current = setTimeout(generateTarget, nextDelay);
    };
    
    generateTarget();
  }, [createTarget]);

  /**
   * 点击目标
   */
  const hitTarget = useCallback((target: Target) => {
    const reactionTime = Date.now() - target.createdAt;
    setReactionTimes(prev => [...prev, reactionTime]);
    setScore(prev => prev + 1);
    setTargets(prev => prev.filter(t => t.id !== target.id));
  }, []);

  /**
   * 重置游戏
   */
  const resetGame = useCallback(() => {
    setGameState('waiting');
    setTargets([]);
    setScore(0);
    setTimeLeft(30);
    setReactionTimes([]);
    
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    
    if (targetTimerRef.current) {
      clearTimeout(targetTimerRef.current);
      targetTimerRef.current = null;
    }
  }, []);

  /**
   * 游戏结束处理
   */
  useEffect(() => {
    if (gameState === 'finished') {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
      
      if (targetTimerRef.current) {
        clearTimeout(targetTimerRef.current);
        targetTimerRef.current = null;
      }

      // 更新最佳成绩
      if (score > bestScore) {
        setBestScore(score);
      }

      // 计算平均反应时间
      if (reactionTimes.length > 0) {
        const avg = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
        setAverageReaction(Math.round(avg));
      }
    }
  }, [gameState, score, bestScore, reactionTimes]);

  /**
   * 清理定时器
   */
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
      if (targetTimerRef.current) {
        clearTimeout(targetTimerRef.current);
      }
    };
  }, []);

  /**
   * 获取成绩评价
   */
  const getScoreRating = (score: number) => {
    if (score >= 50) return { text: '传奇级别！🏆', color: 'text-yellow-400' };
    if (score >= 40) return { text: '大师级别！🌟', color: 'text-purple-400' };
    if (score >= 30) return { text: '专家级别！⚡', color: 'text-blue-400' };
    if (score >= 20) return { text: '熟练级别！👍', color: 'text-green-400' };
    if (score >= 10) return { text: '入门级别！😊', color: 'text-pink-400' };
    return { text: '继续练习！💪', color: 'text-gray-400' };
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 游戏状态栏 */}
      <div className="flex justify-between items-center mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <div className="text-white font-bold text-xl">
          得分: <span className="text-yellow-400">{score}</span>
        </div>
        <div className="text-white font-bold text-xl">
          时间: <span className="text-green-400">{timeLeft}s</span>
        </div>
        <div className="text-white font-bold text-xl">
          目标: <span className="text-purple-400">{targets.length}</span>
        </div>
      </div>

      {/* 游戏区域 */}
      <div 
        ref={setGameAreaRef}
        className="relative bg-gradient-to-br from-indigo-800/50 to-purple-800/50 rounded-3xl border-4 border-white/20 shadow-2xl overflow-hidden"
        style={{ height: '500px' }}
      >
        {gameState === 'waiting' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-4 animate-bounce">
                🎯 准备开始训练！
              </div>
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-full transform transition-all duration-200 hover:scale-110 shadow-lg text-xl"
              >
                🚀 开始训练
              </Button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            {targets.map(target => (
              <div
                key={target.id}
                className={`absolute ${target.color} rounded-full cursor-pointer transform transition-all duration-200 hover:scale-110 shadow-lg border-2 border-white/30 animate-pulse`}
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                }}
                onClick={() => hitTarget(target)}
              >
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  🎯
                </div>
              </div>
            ))}
          </>
        )}

        {gameState === 'finished' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="text-4xl font-bold text-white mb-4">
                🎉 训练完成！
              </div>
              <div className="text-2xl text-yellow-400 font-bold mb-2">
                最终得分: {score}
              </div>
              <div className={`text-xl font-bold mb-4 ${getScoreRating(score).color}`}>
                {getScoreRating(score).text}
              </div>
              <div className="text-purple-200 mb-6">
                平均反应时间: {averageReaction}ms
              </div>
              <Button
                onClick={resetGame}
                className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full transform transition-all duration-200 hover:scale-110 shadow-lg mr-4"
              >
                🔄 再玩一次
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      {gameState === 'playing' && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={resetGame}
            className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full transform transition-all duration-200 hover:scale-110 shadow-lg"
          >
            ❌ 结束训练
          </Button>
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* 最佳成绩 */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-center shadow-xl border-2 border-white/20">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-white font-bold text-lg mb-1">最佳成绩</div>
          <div className="text-white text-2xl font-bold">{bestScore}</div>
        </div>

        {/* 当前得分 */}
        <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-6 text-center shadow-xl border-2 border-white/20">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-white font-bold text-lg mb-1">当前得分</div>
          <div className="text-white text-2xl font-bold">{score}</div>
        </div>

        {/* 平均反应时间 */}
        <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl p-6 text-center shadow-xl border-2 border-white/20">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-white font-bold text-lg mb-1">平均反应</div>
          <div className="text-white text-2xl font-bold">
            {averageReaction > 0 ? `${averageReaction}ms` : '暂无数据'}
          </div>
        </div>
      </div>

      {/* 游戏说明 */}
      <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 text-center">🎮 游戏说明</h3>
        <div className="text-purple-200 space-y-2">
          <p>• 点击开始训练按钮开始游戏</p>
          <p>• 快速点击出现的彩色目标</p>
          <p>• 目标会在3秒后自动消失</p>
          <p>• 在30秒内尽可能多地点击目标</p>
          <p>• 挑战你的反应速度和准确性！</p>
        </div>
      </div>
    </div>
  );
}