'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

import { Brain, Heart, Smile, Frown, Meh, Angry, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmotionData {
  id: string;
  emotion: string;
  description: string;
  facialFeatures: string[];
  color: string;
  icon: React.ReactNode;
}

export default function EmotionRecognitionPage() {
  const t = useTranslations('emotionRecognition');
  
  const emotions: EmotionData[] = [
    {
      id: 'happy',
      emotion: t('emotions.happy.name'),
      description: t('emotions.happy.description'),
      facialFeatures: t('emotions.happy.features').split(','),
      color: 'text-yellow-400',
      icon: '😊'
    },
    {
      id: 'sad',
      emotion: t('emotions.sad.name'),
      description: t('emotions.sad.description'),
      facialFeatures: t('emotions.sad.features').split(','),
      color: 'text-blue-400',
      icon: '😢'
    },
    {
      id: 'angry',
      emotion: t('emotions.angry.name'),
      description: t('emotions.angry.description'),
      facialFeatures: t('emotions.angry.features').split(','),
      color: 'text-red-400',
      icon: '😠'
    },
    {
      id: 'surprised',
      emotion: t('emotions.surprised.name'),
      description: t('emotions.surprised.description'),
      facialFeatures: t('emotions.surprised.features').split(','),
      color: 'text-purple-400',
      icon: '😲'
    },
    {
      id: 'fearful',
      emotion: t('emotions.fearful.name'),
      description: t('emotions.fearful.description'),
      facialFeatures: t('emotions.fearful.features').split(','),
      color: 'text-gray-400',
      icon: '😨'
    },
    {
      id: 'disgusted',
      emotion: t('emotions.disgusted.name'),
      description: t('emotions.disgusted.description'),
      facialFeatures: t('emotions.disgusted.features').split(','),
      color: 'text-green-400',
      icon: '🤢'
    }
  ];

interface GameState {
  currentEmotion: EmotionData | null;
  score: number;
  round: number;
  totalRounds: number;
  isGameActive: boolean;
  feedback: string;
  showFeedback: boolean;
  streak: number;
  timeLeft: number;
}

  const [gameState, setGameState] = useState<GameState>({
    currentEmotion: null,
    score: 0,
    round: 0,
    totalRounds: 10,
    isGameActive: false,
    feedback: '',
    showFeedback: false,
    streak: 0,
    timeLeft: 10
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [options, setOptions] = useState<EmotionData[]>([]);

  // 生成随机选项
  const generateOptions = useCallback((correctEmotion: EmotionData) => {
    const wrongOptions = emotions.filter(e => e.id !== correctEmotion.id);
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [correctEmotion, ...shuffledWrong].sort(() => Math.random() - 0.5);
    return allOptions;
  }, []);

  // 开始新一轮
  const startNewRound = useCallback(() => {
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const newOptions = generateOptions(randomEmotion);
    
    setGameState(prev => ({
      ...prev,
      currentEmotion: randomEmotion,
      round: prev.round + 1,
      showFeedback: false,
      timeLeft: 10
    }));
    
    setOptions(newOptions);
    setSelectedAnswer('');
  }, [generateOptions]);

  // 开始游戏
  const startGame = () => {
    setGameState({
      currentEmotion: null,
      score: 0,
      round: 0,
      totalRounds: 10,
      isGameActive: true,
      feedback: '',
      showFeedback: false,
      streak: 0,
      timeLeft: 10
    });
    startNewRound();
  };

  // 提交答案
  const submitAnswer = (emotionId: string) => {
    if (!gameState.currentEmotion || gameState.showFeedback) return;
    
    setSelectedAnswer(emotionId);
    const isCorrect = emotionId === gameState.currentEmotion.id;
    
    setGameState(prev => {
      const newScore = isCorrect ? prev.score + 10 + prev.streak * 2 : prev.score;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      
      return {
        ...prev,
        score: newScore,
        streak: newStreak,
        feedback: isCorrect ? 
          t('emotionRecognition.feedback.correct', { emotion: prev.currentEmotion?.emotion, description: prev.currentEmotion?.description }) :
          t('emotionRecognition.feedback.incorrect', { emotion: prev.currentEmotion?.emotion, description: prev.currentEmotion?.description }),
        showFeedback: true
      };
    });

    // 2秒后进入下一轮或结束游戏
    setTimeout(() => {
      if (gameState.round >= gameState.totalRounds) {
        setGameState(prev => ({ ...prev, isGameActive: false }));
      } else {
        startNewRound();
      }
    }, 2000);
  };

  // 计时器
  useEffect(() => {
    if (!gameState.isGameActive || gameState.showFeedback || gameState.timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          // 时间到，自动提交错误答案
          setTimeout(() => submitAnswer('timeout'), 0);
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isGameActive, gameState.showFeedback, gameState.timeLeft]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            {t('emotionRecognition.title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('emotionRecognition.description')}
          </p>
        </div>

        {!gameState.isGameActive ? (
          // 开始界面
          <Card className="max-w-2xl mx-auto bg-black/40 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                <Brain className="w-8 h-8 text-purple-400" />
                {t('emotionRecognition.challenge.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="text-gray-300">
                <p className="mb-4">{t('emotionRecognition.challenge.intro')}</p>
                <ul className="text-left space-y-2 max-w-md mx-auto">
                  <li>• {t('emotionRecognition.challenge.features.identify')}</li>
                  <li>• {t('emotionRecognition.challenge.features.learn')}</li>
                  <li>• {t('emotionRecognition.challenge.features.improve')}</li>
                  <li>• {t('emotionRecognition.challenge.features.enhance')}</li>
                </ul>
              </div>
              
              {gameState.round > 0 && (
                <div className="bg-purple-900/30 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">{t('emotionRecognition.lastScore.title')}</h3>
                  <p className="text-purple-300">{t('emotionRecognition.lastScore.score')}: {gameState.score}</p>
                  <p className="text-purple-300">{t('emotionRecognition.lastScore.accuracy')}: {Math.round((gameState.score / (gameState.totalRounds * 10)) * 100)}%</p>
                </div>
              )}
              
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
              >
                {t('emotionRecognition.startTraining')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          // 游戏界面
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 游戏状态栏 */}
            <div className="flex justify-between items-center bg-black/40 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-white border-purple-500">
                  {t('emotionRecognition.game.roundProgress', { current: gameState.round, total: gameState.totalRounds })}
                </Badge>
                <Badge variant="outline" className="text-yellow-400 border-yellow-500">
                  {t('emotionRecognition.game.score')}: {gameState.score}
                </Badge>
                {gameState.streak > 0 && (
                  <Badge variant="outline" className="text-green-400 border-green-500">
                    {t('emotionRecognition.game.streak')}: {gameState.streak}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-white font-semibold">{gameState.timeLeft}s</span>
              </div>
            </div>

            {/* 进度条 */}
            <Progress 
              value={(gameState.round / gameState.totalRounds) * 100} 
              className="h-2"
            />

            {gameState.currentEmotion && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={gameState.round}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-black/40 border-gray-700">
                    <CardHeader className="text-center">
                      <CardTitle className="text-white text-xl">
                        {t('emotionRecognition.game.question')}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      {/* 情绪表情显示区域 */}
                      <div className="text-center mb-8">
                        <div className={`mx-auto w-32 h-32 rounded-full bg-gradient-to-br ${gameState.currentEmotion.color} flex items-center justify-center mb-4 shadow-2xl`}>
                          <div className="text-white text-6xl">
                            {gameState.currentEmotion.icon}
                          </div>
                        </div>
                        
                        {/* 面部特征提示 */}
                        <div className="text-gray-400 text-sm">
                          {t('emotionRecognition.game.observeFeatures')}: {gameState.currentEmotion.facialFeatures.join(', ')}
                        </div>
                      </div>

                      {/* 选项按钮 */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {options.map((option) => (
                          <Button
                            key={option.id}
                            onClick={() => submitAnswer(option.id)}
                            disabled={gameState.showFeedback}
                            variant={selectedAnswer === option.id ? "default" : "outline"}
                            className={`h-16 text-lg transition-all duration-200 ${
                              selectedAnswer === option.id
                                ? gameState.currentEmotion?.id === option.id
                                  ? 'bg-green-600 hover:bg-green-700 border-green-500'
                                  : 'bg-red-600 hover:bg-red-700 border-red-500'
                                : 'bg-black/20 border-gray-600 hover:border-purple-500 text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {option.icon}
                              {option.emotion}
                            </div>
                          </Button>
                        ))}
                      </div>

                      {/* 反馈信息 */}
                      {gameState.showFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 rounded-lg bg-purple-900/30 border border-purple-500/30"
                        >
                          <p className="text-white text-center">{gameState.feedback}</p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
}