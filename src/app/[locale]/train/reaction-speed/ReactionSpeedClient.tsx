'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Button from '../../components/Button';

/**
 * 游戏状态枚举
 */
type GameState = 'waiting' | 'ready' | 'go' | 'clicked' | 'too-early';

/**
 * 反应速度测试客户端组件
 * 实现反应速度测试游戏的核心逻辑
 */
export default function ReactionSpeedClient() {
  const t = useTranslations('ReactionSpeed');
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  /**
   * 开始游戏
   */
  const startGame = useCallback(() => {
    setGameState('ready');
    setReactionTime(null);
    
    // 随机延迟2-5秒后变绿
    const delay = Math.random() * 3000 + 2000;
    const id = setTimeout(() => {
      setGameState('go');
      setStartTime(Date.now());
    }, delay);
    
    setTimeoutId(id);
  }, []);

  /**
   * 处理点击事件
   */
  const handleClick = useCallback(() => {
    if (gameState === 'ready') {
      // 太早点击
      setGameState('too-early');
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    } else if (gameState === 'go') {
      // 正确点击
      const endTime = Date.now();
      const reaction = endTime - startTime;
      setReactionTime(reaction);
      setGameState('clicked');
      
      // 更新记录
      const newAttempts = [...attempts, reaction];
      setAttempts(newAttempts);
      
      if (!bestTime || reaction < bestTime) {
        setBestTime(reaction);
      }
    }
  }, [gameState, startTime, timeoutId, attempts, bestTime]);

  /**
   * 重置游戏
   */
  const resetGame = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setGameState('waiting');
    setReactionTime(null);
  }, [timeoutId]);

  /**
   * 清理定时器
   */
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  /**
   * 获取游戏区域的背景色和文本
   */
  const getGameAreaStyle = () => {
    switch (gameState) {
      case 'waiting':
        return {
          bg: 'bg-gradient-to-br from-purple-500 to-pink-500',
          text: t('clickToStart'),
          textColor: 'text-white'
        };
      case 'ready':
        return {
          bg: 'bg-gradient-to-br from-red-500 to-orange-500',
          text: t('waitForGreen'),
          textColor: 'text-white'
        };
      case 'go':
        return {
          bg: 'bg-gradient-to-br from-green-400 to-emerald-500',
          text: t('clickNow'),
          textColor: 'text-white'
        };
      case 'clicked':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
          text: t('reactionTime', { time: reactionTime }),
          textColor: 'text-white'
        };
      case 'too-early':
        return {
          bg: 'bg-gradient-to-br from-red-600 to-pink-600',
          text: t('tooEarly'),
          textColor: 'text-white'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-purple-500 to-pink-500',
          text: t('clickToStart'),
          textColor: 'text-white'
        };
    }
  };

  const gameAreaStyle = getGameAreaStyle();

  /**
   * 获取反应时间评价
   */
  const getReactionRating = (time: number) => {
    if (time < 200) return { text: t('lightning'), color: 'text-yellow-400' };
    if (time < 300) return { text: t('veryFast'), color: 'text-green-400' };
    if (time < 400) return { text: t('good'), color: 'text-blue-400' };
    if (time < 500) return { text: t('notBad'), color: 'text-purple-400' };
    return { text: t('keepPracticing'), color: 'text-pink-400' };
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 游戏区域 */}
      <div 
        className={`${gameAreaStyle.bg} rounded-3xl p-16 mb-8 cursor-pointer transform transition-all duration-300 hover:scale-105 shadow-2xl border-4 border-white/20`}
        onClick={gameState === 'waiting' ? startGame : handleClick}
        style={{ minHeight: '300px' }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className={`text-4xl font-bold ${gameAreaStyle.textColor} text-center animate-bounce`}>
            {gameAreaStyle.text}
          </div>
          
          {gameState === 'clicked' && reactionTime && (
            <div className="mt-6 text-center">
              <div className={`text-2xl font-bold ${getReactionRating(reactionTime).color} animate-pulse`}>
                {getReactionRating(reactionTime).text}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center gap-4 mb-8">
        {(gameState === 'clicked' || gameState === 'too-early') && (
          <Button
            onClick={startGame}
            className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-full transform transition-all duration-200 hover:scale-110 shadow-lg"
          >
            {t('tryAgain')}
          </Button>
        )}
        
        {gameState === 'ready' && (
          <Button
            onClick={resetGame}
            className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full transform transition-all duration-200 hover:scale-110 shadow-lg"
          >
            {t('cancel')}
          </Button>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 最佳成绩 */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-center shadow-xl border-2 border-white/20">
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-white font-bold text-lg mb-1">{t('bestScore')}</div>
          <div className="text-white text-2xl font-bold">
            {bestTime ? `${bestTime}ms` : t('noRecord')}
          </div>
        </div>

        {/* 测试次数 */}
        <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-6 text-center shadow-xl border-2 border-white/20">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-white font-bold text-lg mb-1">{t('testCount')}</div>
          <div className="text-white text-2xl font-bold">{attempts.length}</div>
        </div>

        {/* 平均时间 */}
        <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl p-6 text-center shadow-xl border-2 border-white/20">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-white font-bold text-lg mb-1">{t('averageTime')}</div>
          <div className="text-white text-2xl font-bold">
            {attempts.length > 0 
              ? `${Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)}ms`
              : t('noData')
            }
          </div>
        </div>
      </div>

      {/* 游戏说明 */}
      <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 text-center">🎮 {t('gameInstructions')}</h3>
        <div className="text-purple-200 space-y-2">
          <p>• {t('instruction1')}</p>
          <p>• {t('instruction2')}</p>
          <p>• {t('instruction3')}</p>
          <p>• {t('instruction4')}</p>
        </div>
      </div>
    </div>
  );
}