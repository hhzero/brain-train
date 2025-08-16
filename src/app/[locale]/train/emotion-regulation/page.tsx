'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';

import { Brain, Heart, Lightbulb, Target, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmotionScenario {
  id: string;
  title: string;
  description: string;
  emotion: string;
  intensity: number; // 1-5
  situation: string;
  triggers: string[];
  strategies: {
    id: string;
    name: string;
    description: string;
    effectiveness: number; // 1-5
    type: 'cognitive' | 'behavioral' | 'physiological' | 'social';
  }[];
  correctStrategy: string;
  explanation: string;
  culturalContext?: string;
}

const emotionScenarios: EmotionScenario[] = [
  {
    id: 'work-pressure',
    title: '工作压力情境',
    description: '面对紧急项目截止日期的焦虑',
    emotion: '焦虑',
    intensity: 4,
    situation: '您的老板刚刚通知您，原本下周截止的重要项目需要明天提交。您感到心跳加速，手心出汗，脑中一片混乱。',
    triggers: ['时间压力', '工作量大', '担心失败', '完美主义'],
    strategies: [
      {
        id: 'panic',
        name: '立即恐慌',
        description: '感到绝望，认为无法完成任务',
        effectiveness: 1,
        type: 'cognitive'
      },
      {
        id: 'breathing',
        name: '深呼吸冷静',
        description: '先进行5分钟深呼吸，让心率平稳下来',
        effectiveness: 4,
        type: 'physiological'
      },
      {
        id: 'planning',
        name: '制定行动计划',
        description: '列出任务清单，按优先级排序，制定时间表',
        effectiveness: 5,
        type: 'behavioral'
      },
      {
        id: 'avoidance',
        name: '逃避现实',
        description: '刷手机或做其他事情来分散注意力',
        effectiveness: 1,
        type: 'behavioral'
      }
    ],
    correctStrategy: 'planning',
    explanation: '在高压情况下，制定清晰的行动计划是最有效的策略。它能帮助您将复杂任务分解为可管理的步骤，减少不确定性带来的焦虑。',
    culturalContext: '中国文化中的"运筹帷幄"体现了提前规划的智慧。'
  },
  {
    id: 'social-conflict',
    title: '人际冲突情境',
    description: '与朋友发生争执后的愤怒',
    emotion: '愤怒',
    intensity: 3,
    situation: '您的好朋友在聚会上当着其他人的面批评了您的观点，让您感到很没面子。您现在非常生气，想要反击。',
    triggers: ['被批评', '失去面子', '感觉不被尊重', '公开场合'],
    strategies: [
      {
        id: 'retaliate',
        name: '立即反击',
        description: '当场反驳朋友，为自己辩护',
        effectiveness: 2,
        type: 'behavioral'
      },
      {
        id: 'cool-down',
        name: '冷静思考',
        description: '暂时离开现场，给自己时间冷静下来',
        effectiveness: 4,
        type: 'behavioral'
      },
      {
        id: 'perspective',
        name: '换位思考',
        description: '尝试理解朋友的观点和动机',
        effectiveness: 5,
        type: 'cognitive'
      },
      {
        id: 'suppress',
        name: '压抑情绪',
        description: '假装没事，把愤怒埋在心里',
        effectiveness: 2,
        type: 'cognitive'
      }
    ],
    correctStrategy: 'perspective',
    explanation: '换位思考能帮助您理解冲突的根源，减少误解，为后续的沟通和解决问题奠定基础。这是情商高的表现。',
    culturalContext: '"己所不欲，勿施于人"体现了中华文化中换位思考的重要性。'
  },
  {
    id: 'failure-disappointment',
    title: '失败挫折情境',
    description: '考试失利后的沮丧',
    emotion: '沮丧',
    intensity: 4,
    situation: '您为了重要考试准备了几个月，但成绩却不如预期。看到成绩的那一刻，您感到深深的失望和自我怀疑。',
    triggers: ['期望落空', '努力未得回报', '自我怀疑', '担心未来'],
    strategies: [
      {
        id: 'self-blame',
        name: '自我责备',
        description: '认为自己能力不足，一无是处',
        effectiveness: 1,
        type: 'cognitive'
      },
      {
        id: 'acceptance',
        name: '接受现实',
        description: '承认结果，允许自己感到失望',
        effectiveness: 4,
        type: 'cognitive'
      },
      {
        id: 'learning',
        name: '从中学习',
        description: '分析失败原因，制定改进计划',
        effectiveness: 5,
        type: 'cognitive'
      },
      {
        id: 'give-up',
        name: '放弃努力',
        description: '认为再努力也没用，不再尝试',
        effectiveness: 1,
        type: 'behavioral'
      }
    ],
    correctStrategy: 'learning',
    explanation: '将失败转化为学习机会是最有价值的应对方式。它能帮助您成长，提高未来成功的可能性，同时建立韧性。',
    culturalContext: '"失败乃成功之母"体现了中华文化中从挫折中学习的智慧。'
  },
  {
    id: 'social-anxiety',
    title: '社交焦虑情境',
    description: '参加陌生聚会的紧张',
    emotion: '紧张',
    intensity: 3,
    situation: '您被邀请参加一个不太熟悉的聚会，现场都是陌生人。您站在角落里，手心出汗，不知道该如何开始对话。',
    triggers: ['陌生环境', '社交压力', '担心被拒绝', '缺乏自信'],
    strategies: [
      {
        id: 'hide',
        name: '躲在角落',
        description: '继续待在角落，避免与人交流',
        effectiveness: 1,
        type: 'behavioral'
      },
      {
        id: 'positive-self-talk',
        name: '积极自我对话',
        description: '提醒自己"我有价值，别人会喜欢我"',
        effectiveness: 4,
        type: 'cognitive'
      },
      {
        id: 'small-steps',
        name: '小步骤行动',
        description: '先对一个人微笑，然后逐步开始简单对话',
        effectiveness: 5,
        type: 'behavioral'
      },
      {
        id: 'leave-early',
        name: '提前离开',
        description: '找借口早点离开聚会',
        effectiveness: 2,
        type: 'behavioral'
      }
    ],
    correctStrategy: 'small-steps',
    explanation: '采用渐进式的方法能够逐步建立社交信心，每一个小成功都会增强您的自信心，为更深入的社交互动做准备。',
    culturalContext: '"千里之行，始于足下"体现了循序渐进的重要性。'
  }
];

interface GameState {
  currentScenario: EmotionScenario | null;
  selectedStrategy: string | null;
  showResult: boolean;
  score: number;
  completedScenarios: string[];
  round: number;
  totalRounds: number;
}

export default function EmotionRegulationPage() {
  const t = useTranslations('emotionRegulation');
  
  const [gameState, setGameState] = useState<GameState>({
    currentScenario: null,
    selectedStrategy: null,
    showResult: false,
    score: 0,
    completedScenarios: [],
    round: 0,
    totalRounds: emotionScenarios.length
  });

  const [showInstructions, setShowInstructions] = useState(true);

  // 开始训练
  const startTraining = () => {
    setShowInstructions(false);
    nextScenario();
  };

  // 下一个情境
  const nextScenario = () => {
    const availableScenarios = emotionScenarios.filter(
      scenario => !gameState.completedScenarios.includes(scenario.id)
    );
    
    if (availableScenarios.length === 0) {
      // 所有情境完成
      setGameState(prev => ({ ...prev, currentScenario: null }));
      return;
    }
    
    const randomScenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
    setGameState(prev => ({
      ...prev,
      currentScenario: randomScenario,
      selectedStrategy: null,
      showResult: false,
      round: prev.round + 1
    }));
  };

  // 选择策略
  const selectStrategy = (strategyId: string) => {
    setGameState(prev => ({ ...prev, selectedStrategy: strategyId }));
  };

  // 提交答案
  const submitAnswer = () => {
    if (!gameState.currentScenario || !gameState.selectedStrategy) return;
    
    const isCorrect = gameState.selectedStrategy === gameState.currentScenario.correctStrategy;
    const selectedStrategy = gameState.currentScenario.strategies.find(
      s => s.id === gameState.selectedStrategy
    );
    
    const points = isCorrect ? selectedStrategy?.effectiveness || 0 : 0;
    
    setGameState(prev => ({
      ...prev,
      showResult: true,
      score: prev.score + points,
      completedScenarios: [...prev.completedScenarios, prev.currentScenario!.id]
    }));
  };

  // 重新开始
  const resetGame = () => {
    setGameState({
      currentScenario: null,
      selectedStrategy: null,
      showResult: false,
      score: 0,
      completedScenarios: [],
      round: 0,
      totalRounds: emotionScenarios.length
    });
    setShowInstructions(true);
  };

  // 获取策略类型颜色
  const getStrategyTypeColor = (type: string) => {
    switch (type) {
      case 'cognitive': return 'from-purple-500 to-indigo-500';
      case 'behavioral': return 'from-green-500 to-emerald-500';
      case 'physiological': return 'from-blue-500 to-cyan-500';
      case 'social': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  // 获取策略类型图标
  const getStrategyTypeIcon = (type: string) => {
    switch (type) {
      case 'cognitive': return <Brain className="w-4 h-4" />;
      case 'behavioral': return <Target className="w-4 h-4" />;
      case 'physiological': return <Heart className="w-4 h-4" />;
      case 'social': return <Lightbulb className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  // 获取策略类型名称
  const getStrategyTypeName = (type: string) => {
    switch (type) {
      case 'cognitive': return t('strategyTypes.cognitive');
      case 'behavioral': return t('strategyTypes.behavioral');
      case 'physiological': return t('strategyTypes.physiological');
      case 'social': return t('strategyTypes.social');
      default: return t('strategyTypes.other');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {showInstructions ? (
          // 训练说明
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center text-2xl">
                  {t('instructionsTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-4">{t('trainingGoals')}</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{t('goals.identifyEmotions')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{t('goals.masterStrategies')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{t('goals.improveCoping')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{t('goals.buildHabits')}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-4">{t('strategyTypesTitle')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('strategyTypes.cognitive')}</div>
                          <div className="text-gray-400 text-sm">{t('strategyDescriptions.cognitive')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                          <Target className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('strategyTypes.behavioral')}</div>
                          <div className="text-gray-400 text-sm">{t('strategyDescriptions.behavioral')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('strategyTypes.physiological')}</div>
                          <div className="text-gray-400 text-sm">{t('strategyDescriptions.physiological')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                          <Lightbulb className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('strategyTypes.social')}</div>
                          <div className="text-gray-400 text-sm">{t('strategyDescriptions.social')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button
                    onClick={startTraining}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-3"
                  >
                    {t('startTraining')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : gameState.currentScenario ? (
          // 训练界面
          <div className="max-w-4xl mx-auto">
            {/* 进度条 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">
                  {t('scenario')} {gameState.round} / {gameState.totalRounds}
                </span>
                <span className="text-purple-400 font-medium">
                  {t('score')}: {gameState.score}
                </span>
              </div>
              <Progress 
                value={(gameState.round / gameState.totalRounds) * 100} 
                className="h-2 bg-gray-700"
              />
            </div>

            {/* 情境描述 */}
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl">
                    {gameState.currentScenario.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-white border-2 ${
                        gameState.currentScenario.intensity >= 4 ? 'border-red-500 text-red-400' :
                        gameState.currentScenario.intensity >= 3 ? 'border-orange-500 text-orange-400' :
                        'border-yellow-500 text-yellow-400'
                      }`}
                    >
                      {gameState.currentScenario.emotion} (强度: {gameState.currentScenario.intensity}/5)
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  {gameState.currentScenario.situation}
                </p>
                
                <div className="mb-4">
                  <h4 className="text-purple-400 font-semibold mb-2">{t('emotionTriggers')}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {gameState.currentScenario.triggers.map((trigger, index) => (
                      <Badge key={index} variant="outline" className="text-gray-300 border-gray-500">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {gameState.currentScenario.culturalContext && (
                  <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-4 rounded-lg border border-amber-500/30">
                    <h4 className="text-amber-400 font-semibold mb-2">{t('culturalWisdom')}:</h4>
                    <p className="text-amber-200 text-sm">
                      {gameState.currentScenario.culturalContext}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 策略选择 */}
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">
                  {t('chooseStrategy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.currentScenario.strategies.map((strategy) => (
                    <Card
                      key={strategy.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        gameState.selectedStrategy === strategy.id
                          ? 'bg-purple-900/50 border-purple-500 scale-105'
                          : 'bg-black/20 border-gray-600 hover:border-purple-500/50 hover:scale-102'
                      }`}
                      onClick={() => selectStrategy(strategy.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-white">
                            {strategy.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-gradient-to-r ${getStrategyTypeColor(strategy.type)}`}>
                              {getStrategyTypeIcon(strategy.type)}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {getStrategyTypeName(strategy.type)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-300 text-sm">
                          {strategy.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button
                    onClick={submitAnswer}
                    disabled={!gameState.selectedStrategy}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50"
                  >
                    {t('confirmChoice')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 结果反馈 */}
            <AnimatePresence>
              {gameState.showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="mb-8 bg-black/40 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {gameState.selectedStrategy === gameState.currentScenario.correctStrategy ? (
                          <CheckCircle className="w-8 h-8 text-green-400" />
                        ) : (
                          <XCircle className="w-8 h-8 text-red-400" />
                        )}
                        <CardTitle className="text-white text-xl">
                          {gameState.selectedStrategy === gameState.currentScenario.correctStrategy
                            ? t('correctChoice')
                            : t('canImprove')}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-purple-400 font-semibold mb-2">{t('bestStrategyAnalysis')}:</h4>
                          <p className="text-gray-300">
                            {gameState.currentScenario.explanation}
                          </p>
                        </div>
                        
                        {gameState.selectedStrategy !== gameState.currentScenario.correctStrategy && (
                          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                            <h4 className="text-blue-400 font-semibold mb-2">{t('recommendedStrategy')}:</h4>
                            <p className="text-blue-200">
                              {gameState.currentScenario?.strategies.find(
                                s => s.id === gameState.currentScenario?.correctStrategy
                              )?.name} - {gameState.currentScenario?.strategies.find(
                                s => s.id === gameState.currentScenario?.correctStrategy
                              )?.description}
                            </p>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <Button
                            onClick={nextScenario}
                            size="lg"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            {t('nextScenario')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // 训练完成
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-black/40 border-gray-700">
              <CardContent className="pt-8">
                <div className="mb-6">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-2">{t('trainingComplete')}</h2>
                  <p className="text-gray-300 text-lg">
                    {t('allScenariosCompleted')}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">{t('trainingSummary')}</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{gameState.score}</div>
                      <div className="text-gray-300">{t('totalScore')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {Math.round((gameState.score / (gameState.totalRounds * 5)) * 100)}%
                      </div>
                      <div className="text-gray-300">{t('accuracy')}</div>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={resetGame}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  {t('restartTraining')}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}