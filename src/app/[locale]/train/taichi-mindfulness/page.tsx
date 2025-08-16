'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import StarfieldBackground from '@/components/StarfieldBackground';
import { Play, Pause, RotateCcw, Mountain, Wind, Waves, Sun, Moon, Leaf, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaichiForm {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  philosophy: string;
  duration: number; // 秒
  phases: {
    name: string;
    chineseName: string;
    duration: number;
    instruction: string;
    breathing: 'inhale' | 'exhale' | 'hold' | 'natural';
    visualization: string;
    energy: string;
  }[];
  benefits: string[];
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  difficulty: number; // 1-5
}

interface SessionState {
  currentForm: TaichiForm | null;
  currentPhase: number;
  isPlaying: boolean;
  timeRemaining: number;
  completedForms: string[];
  totalScore: number;
  sessionStarted: boolean;
}

// 太极套路数据
const getTaichiForms = (t: any): TaichiForm[] => [
  {
    id: 'opening-form',
    name: 'Opening Form',
    chineseName: t('forms.opening.chineseName'),
    description: t('forms.opening.description'),
    philosophy: t('forms.opening.philosophy'),
    duration: 120,
    phases: [
      {
        name: 'Standing Meditation',
        chineseName: t('forms.opening.phases.standingMeditation.chineseName'),
        duration: 30,
        instruction: t('forms.opening.phases.standingMeditation.instruction'),
        breathing: 'natural' as const,
        visualization: t('forms.opening.phases.standingMeditation.visualization'),
        energy: t('forms.opening.phases.standingMeditation.energy')
      },
      {
        name: 'Raising Arms',
        chineseName: t('forms.opening.phases.raisingArms.chineseName'),
        duration: 45,
        instruction: t('forms.opening.phases.raisingArms.instruction'),
        breathing: 'inhale' as const,
        visualization: t('forms.opening.phases.raisingArms.visualization'),
        energy: t('forms.opening.phases.raisingArms.energy')
      },
      {
        name: 'Pressing Down',
        chineseName: t('forms.opening.phases.pressingDown.chineseName'),
        duration: 45,
        instruction: t('forms.opening.phases.pressingDown.instruction'),
        breathing: 'exhale' as const,
        visualization: t('forms.opening.phases.pressingDown.visualization'),
        energy: t('forms.opening.phases.pressingDown.energy')
      }
    ],
    benefits: [
      t('forms.opening.benefits.0'),
      t('forms.opening.benefits.1'),
      t('forms.opening.benefits.2'),
      t('forms.opening.benefits.3')
    ],
    element: 'earth' as const,
    difficulty: 1
  },
  {
    id: 'wave-hands',
    name: 'Wave Hands Like Clouds',
    chineseName: t('forms.waveHands.chineseName'),
    description: t('forms.waveHands.description'),
    philosophy: t('forms.waveHands.philosophy'),
    duration: 180,
    phases: [
      {
        name: 'Left Cloud',
        chineseName: t('forms.waveHands.phases.leftCloud.chineseName'),
        duration: 60,
        instruction: t('forms.waveHands.phases.leftCloud.instruction'),
        breathing: 'inhale' as const,
        visualization: t('forms.waveHands.phases.leftCloud.visualization'),
        energy: t('forms.waveHands.phases.leftCloud.energy')
      },
      {
        name: 'Center Transition',
        chineseName: t('forms.waveHands.phases.centerTransition.chineseName'),
        duration: 60,
        instruction: t('forms.waveHands.phases.centerTransition.instruction'),
        breathing: 'natural' as const,
        visualization: t('forms.waveHands.phases.centerTransition.visualization'),
        energy: t('forms.waveHands.phases.centerTransition.energy')
      },
      {
        name: 'Right Cloud',
        chineseName: t('forms.waveHands.phases.rightCloud.chineseName'),
        duration: 60,
        instruction: t('forms.waveHands.phases.rightCloud.instruction'),
        breathing: 'exhale' as const,
        visualization: t('forms.waveHands.phases.rightCloud.visualization'),
        energy: t('forms.waveHands.phases.rightCloud.energy')
      }
    ],
    benefits: [
      t('forms.waveHands.benefits.0'),
      t('forms.waveHands.benefits.1'),
      t('forms.waveHands.benefits.2'),
      t('forms.waveHands.benefits.3')
    ],
    element: 'water' as const,
    difficulty: 3
  },
  {
    id: 'single-whip',
    name: 'Single Whip',
    chineseName: t('forms.singleWhip.chineseName'),
    description: t('forms.singleWhip.description'),
    philosophy: t('forms.singleWhip.philosophy'),
    duration: 150,
    phases: [
      {
        name: 'Gathering Energy',
        chineseName: t('forms.singleWhip.phases.gatheringEnergy.chineseName'),
        duration: 50,
        instruction: t('forms.singleWhip.phases.gatheringEnergy.instruction'),
        breathing: 'inhale' as const,
        visualization: t('forms.singleWhip.phases.gatheringEnergy.visualization'),
        energy: t('forms.singleWhip.phases.gatheringEnergy.energy')
      },
      {
        name: 'Opening',
        chineseName: t('forms.singleWhip.phases.opening.chineseName'),
        duration: 50,
        instruction: t('forms.singleWhip.phases.opening.instruction'),
        breathing: 'exhale' as const,
        visualization: t('forms.singleWhip.phases.opening.visualization'),
        energy: t('forms.singleWhip.phases.opening.energy')
      },
      {
        name: 'Settling',
        chineseName: t('forms.singleWhip.phases.settling.chineseName'),
        duration: 50,
        instruction: t('forms.singleWhip.phases.settling.instruction'),
        breathing: 'natural' as const,
        visualization: t('forms.singleWhip.phases.settling.visualization'),
        energy: t('forms.singleWhip.phases.settling.energy')
      }
    ],
    benefits: [
      t('forms.singleWhip.benefits.0'),
      t('forms.singleWhip.benefits.1'),
      t('forms.singleWhip.benefits.2'),
      t('forms.singleWhip.benefits.3')
    ],
    element: 'metal' as const,
    difficulty: 4
  },
  {
    id: 'white-crane',
    name: 'White Crane Spreads Wings',
    chineseName: t('forms.whiteCrane.chineseName'),
    description: t('forms.whiteCrane.description'),
    philosophy: t('forms.whiteCrane.philosophy'),
    duration: 140,
    phases: [
      {
        name: 'Preparation',
        chineseName: t('forms.whiteCrane.phases.preparation.chineseName'),
        duration: 40,
        instruction: t('forms.whiteCrane.phases.preparation.instruction'),
        breathing: 'natural' as const,
        visualization: t('forms.whiteCrane.phases.preparation.visualization'),
        energy: t('forms.whiteCrane.phases.preparation.energy')
      },
      {
        name: 'Spreading Wings',
        chineseName: t('forms.whiteCrane.phases.spreadingWings.chineseName'),
        duration: 60,
        instruction: t('forms.whiteCrane.phases.spreadingWings.instruction'),
        breathing: 'inhale' as const,
        visualization: t('forms.whiteCrane.phases.spreadingWings.visualization'),
        energy: t('forms.whiteCrane.phases.spreadingWings.energy')
      },
      {
        name: 'Graceful Landing',
        chineseName: t('forms.whiteCrane.phases.gracefulLanding.chineseName'),
        duration: 40,
        instruction: t('forms.whiteCrane.phases.gracefulLanding.instruction'),
        breathing: 'exhale' as const,
        visualization: t('forms.whiteCrane.phases.gracefulLanding.visualization'),
        energy: t('forms.whiteCrane.phases.gracefulLanding.energy')
      }
    ],
    benefits: [
      t('forms.whiteCrane.benefits.0'),
      t('forms.whiteCrane.benefits.1'),
      t('forms.whiteCrane.benefits.2'),
      t('forms.whiteCrane.benefits.3')
    ],
    element: 'metal' as const,
    difficulty: 3
  },
  {
    id: 'golden-rooster',
    name: 'Golden Rooster Stands on One Leg',
    chineseName: t('forms.goldenRooster.chineseName'),
    description: t('forms.goldenRooster.description'),
    philosophy: t('forms.goldenRooster.philosophy'),
    duration: 120,
    phases: [
      {
        name: 'Preparation',
        chineseName: t('forms.goldenRooster.phases.preparation.chineseName'),
        duration: 30,
        instruction: t('forms.goldenRooster.phases.preparation.instruction'),
        breathing: 'natural' as const,
        visualization: t('forms.goldenRooster.phases.preparation.visualization'),
        energy: t('forms.goldenRooster.phases.preparation.energy')
      },
      {
        name: 'Left Golden Rooster',
        chineseName: t('forms.goldenRooster.phases.leftGoldenRooster.chineseName'),
        duration: 45,
        instruction: t('forms.goldenRooster.phases.leftGoldenRooster.instruction'),
        breathing: 'inhale' as const,
        visualization: t('forms.goldenRooster.phases.leftGoldenRooster.visualization'),
        energy: t('forms.goldenRooster.phases.leftGoldenRooster.energy')
      },
      {
        name: 'Right Golden Rooster',
        chineseName: t('forms.goldenRooster.phases.rightGoldenRooster.chineseName'),
        duration: 45,
        instruction: t('forms.goldenRooster.phases.rightGoldenRooster.instruction'),
        breathing: 'exhale' as const,
        visualization: t('forms.goldenRooster.phases.rightGoldenRooster.visualization'),
        energy: t('forms.goldenRooster.phases.rightGoldenRooster.energy')
      }
    ],
    benefits: [
      t('forms.goldenRooster.benefits.0'),
      t('forms.goldenRooster.benefits.1'),
      t('forms.goldenRooster.benefits.2'),
      t('forms.goldenRooster.benefits.3')
    ],
    element: 'fire' as const,
    difficulty: 5
  },
  {
    id: 'embrace-tiger',
    name: 'Embrace Tiger, Return to Mountain',
    chineseName: t('forms.embraceTiger.chineseName'),
    description: t('forms.embraceTiger.description'),
    philosophy: t('forms.embraceTiger.philosophy'),
    duration: 100,
    phases: [
      {
        name: 'Embracing',
        chineseName: t('forms.embraceTiger.phases.embracing.chineseName'),
        duration: 40,
        instruction: t('forms.embraceTiger.phases.embracing.instruction'),
        breathing: 'inhale' as const,
        visualization: t('forms.embraceTiger.phases.embracing.visualization'),
        energy: t('forms.embraceTiger.phases.embracing.energy')
      },
      {
        name: 'Returning',
        chineseName: t('forms.embraceTiger.phases.returning.chineseName'),
        duration: 40,
        instruction: t('forms.embraceTiger.phases.returning.instruction'),
        breathing: 'exhale' as const,
        visualization: t('forms.embraceTiger.phases.returning.visualization'),
        energy: t('forms.embraceTiger.phases.returning.energy')
      },
      {
        name: 'Closing',
        chineseName: t('forms.embraceTiger.phases.closing.chineseName'),
        duration: 20,
        instruction: t('forms.embraceTiger.phases.closing.instruction'),
        breathing: 'natural' as const,
        visualization: t('forms.embraceTiger.phases.closing.visualization'),
        energy: t('forms.embraceTiger.phases.closing.energy')
      }
    ],
    benefits: [
      t('forms.embraceTiger.benefits.0'),
      t('forms.embraceTiger.benefits.1'),
      t('forms.embraceTiger.benefits.2'),
      t('forms.embraceTiger.benefits.3')
    ],
    element: 'wood' as const,
    difficulty: 2
  }
];

export default function TaichiMindfulnessPage() {
  const t = useTranslations('taichi');
  const taichiForms = getTaichiForms(t);
  
  const [sessionState, setSessionState] = useState<SessionState>({
    currentForm: null,
    currentPhase: 0,
    isPlaying: false,
    timeRemaining: 0,
    completedForms: [],
    totalScore: 0,
    sessionStarted: false
  });

  const [showInstructions, setShowInstructions] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 开始练习
  const startSession = () => {
    setShowInstructions(false);
    setSessionState(prev => ({ ...prev, sessionStarted: true }));
  };

  // 选择太极套路
  const selectForm = (form: TaichiForm) => {
    setSessionState({
      currentForm: form,
      currentPhase: 0,
      isPlaying: false,
      timeRemaining: form.phases[0].duration,
      completedForms: sessionState.completedForms,
      totalScore: sessionState.totalScore,
      sessionStarted: true
    });
  };

  // 开始/暂停练习
  const togglePractice = () => {
    setSessionState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  // 下一阶段
  const nextPhase = () => {
    if (!sessionState.currentForm) return;
    
    const nextPhaseIndex = sessionState.currentPhase + 1;
    
    if (nextPhaseIndex >= sessionState.currentForm.phases.length) {
      // 完成当前套路
      const points = sessionState.currentForm.difficulty * 20;
      setSessionState(prev => ({
        ...prev,
        completedForms: [...prev.completedForms, prev.currentForm!.id],
        totalScore: prev.totalScore + points,
        currentForm: null,
        currentPhase: 0,
        isPlaying: false,
        timeRemaining: 0
      }));
    } else {
      // 进入下一阶段
      setSessionState(prev => ({
        ...prev,
        currentPhase: nextPhaseIndex,
        timeRemaining: prev.currentForm!.phases[nextPhaseIndex].duration,
        isPlaying: false
      }));
    }
  };

  // 重置练习
  const resetSession = () => {
    setSessionState({
      currentForm: null,
      currentPhase: 0,
      isPlaying: false,
      timeRemaining: 0,
      completedForms: [],
      totalScore: 0,
      sessionStarted: false
    });
    setShowInstructions(true);
  };

  // 计时器
  useEffect(() => {
    if (sessionState.isPlaying && sessionState.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setSessionState(prev => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            return { ...prev, timeRemaining: 0, isPlaying: false };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionState.isPlaying, sessionState.timeRemaining]);

  // 获取元素颜色
  const getElementColor = (element: string) => {
    switch (element) {
      case 'wood': return 'from-green-500 to-emerald-500';
      case 'fire': return 'from-red-500 to-orange-500';
      case 'earth': return 'from-yellow-500 to-amber-500';
      case 'metal': return 'from-gray-400 to-slate-500';
      case 'water': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  // 获取元素图标
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'wood': return <Leaf className="w-5 h-5" />;
      case 'fire': return <Sun className="w-5 h-5" />;
      case 'earth': return <Mountain className="w-5 h-5" />;
      case 'metal': return <Moon className="w-5 h-5" />;
      case 'water': return <Waves className="w-5 h-5" />;
      default: return <Wind className="w-5 h-5" />;
    }
  };

  // 获取呼吸指导颜色
  const getBreathingColor = (breathing: string) => {
    switch (breathing) {
      case 'inhale': return 'text-blue-400';
      case 'exhale': return 'text-green-400';
      case 'hold': return 'text-yellow-400';
      case 'natural': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900">
      <StarfieldBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-purple-200">
            {t('subtitle')}
          </p>
        </div>

        {showInstructions ? (
          // 训练说明
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center text-2xl">
                  {t('guide.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-4">{t('guide.philosophy.title')}</h4>
                    <div className="space-y-3 text-gray-300">
                      <p className="text-sm leading-relaxed">
                        {t('guide.philosophy.content1')}
                      </p>
                      <p className="text-sm leading-relaxed">
                        {t('guide.philosophy.content2')}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-4">{t('guide.elements.title')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                          <Leaf className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('guide.elements.wood.title')}</div>
                          <div className="text-gray-400 text-sm">{t('guide.elements.wood.description')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500">
                          <Sun className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('guide.elements.fire.title')}</div>
                          <div className="text-gray-400 text-sm">{t('guide.elements.fire.description')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500">
                          <Mountain className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('guide.elements.earth.title')}</div>
                          <div className="text-gray-400 text-sm">{t('guide.elements.earth.description')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-gray-400 to-slate-500">
                          <Moon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('guide.elements.metal.title')}</div>
                          <div className="text-gray-400 text-sm">{t('guide.elements.metal.description')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                          <Waves className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('guide.elements.water.title')}</div>
                          <div className="text-gray-400 text-sm">{t('guide.elements.water.description')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-6 rounded-lg border border-amber-500/30">
                  <h4 className="text-amber-400 font-semibold mb-3">{t('guide.tips.title')}</h4>
                  <ul className="space-y-2 text-amber-200 text-sm">
                    <li>• {t('guide.tips.breathing')}</li>
                    <li>• {t('guide.tips.movement')}</li>
                    <li>• {t('guide.tips.focus')}</li>
                    <li>• {t('guide.tips.visualization')}</li>
                    <li>• {t('guide.tips.mindfulness')}</li>
                  </ul>
                </div>
                
                <div className="mt-8 text-center">
                  <Button
                    onClick={startSession}
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3"
                  >
                    {t('startPractice')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !sessionState.currentForm ? (
          // 套路选择
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">{t('selection.title')}</h2>
              <div className="flex justify-center items-center gap-6">
                <div className="text-amber-400">
                  <span className="text-lg font-medium">{t('selection.score')}: {sessionState.totalScore}</span>
                </div>
                <div className="text-orange-400">
                  <span className="text-lg font-medium">{t('selection.completed')}: {sessionState.completedForms.length}/{taichiForms.length}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taichiForms.map((form) => (
                <Card
                  key={form.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    sessionState.completedForms.includes(form.id)
                      ? 'bg-green-900/30 border-green-500'
                      : 'bg-black/40 border-gray-700 hover:border-amber-500'
                  }`}
                  onClick={() => selectForm(form)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getElementColor(form.element)}`}>
                          {getElementIcon(form.element)}
                        </div>
                        {sessionState.completedForms.includes(form.id) && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-white border-2 ${
                          form.difficulty >= 4 ? 'border-red-500 text-red-400' :
                          form.difficulty >= 3 ? 'border-orange-500 text-orange-400' :
                          'border-yellow-500 text-yellow-400'
                        }`}
                      >
                        {form.difficulty}/5
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">
                      {form.chineseName}
                    </CardTitle>
                    <p className="text-gray-400 text-sm">{form.name}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {form.description}
                    </p>
                    
                    <div className="mb-4">
                      <p className="text-amber-400 text-xs font-medium mb-1">{t('selection.philosophy')}:</p>
                      <p className="text-amber-200 text-xs leading-relaxed">
                        {form.philosophy}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-green-400 text-xs font-medium mb-2">{t('selection.benefits')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {form.benefits.map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-green-400 border-green-500">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center text-gray-400 text-sm">
                      {t('selection.duration')}: {Math.floor(form.duration / 60)}{t('selection.minutes')}{form.duration % 60}{t('selection.seconds')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button
                onClick={resetSession}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('practice.restart')}
              </Button>
            </div>
          </div>
        ) : (
          // 练习界面
          <div className="max-w-4xl mx-auto">
            {/* 当前套路信息 */}
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${getElementColor(sessionState.currentForm.element)}`}>
                      {getElementIcon(sessionState.currentForm.element)}
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">
                        {sessionState.currentForm.chineseName}
                      </CardTitle>
                      <p className="text-gray-400">{sessionState.currentForm.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-medium">
                      {t('practice.phase')} {sessionState.currentPhase + 1} / {sessionState.currentForm.phases.length}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {sessionState.currentForm.phases[sessionState.currentPhase].chineseName}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* 当前阶段 */}
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-amber-400 mb-2">
                    {formatTime(sessionState.timeRemaining)}
                  </div>
                  <Progress 
                    value={((sessionState.currentForm.phases[sessionState.currentPhase].duration - sessionState.timeRemaining) / sessionState.currentForm.phases[sessionState.currentPhase].duration) * 100}
                    className="h-2 bg-gray-700 mb-4"
                  />
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {sessionState.currentForm.phases[sessionState.currentPhase].chineseName}
                  </h3>
                  <p className="text-gray-400">
                    {sessionState.currentForm.phases[sessionState.currentPhase].name}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-6 rounded-lg border border-blue-500/30">
                    <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                      <Wind className="w-5 h-5" />
                      {t('practice.instruction')}
                    </h4>
                    <p className="text-blue-200 text-sm leading-relaxed">
                      {sessionState.currentForm.phases[sessionState.currentPhase].instruction}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-6 rounded-lg border border-purple-500/30">
                    <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                      <Mountain className="w-5 h-5" />
                      {t('practice.visualization')}
                    </h4>
                    <p className="text-purple-200 text-sm leading-relaxed">
                      {sessionState.currentForm.phases[sessionState.currentPhase].visualization}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className={`bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6 rounded-lg border border-green-500/30`}>
                    <h4 className={`font-semibold mb-3 flex items-center gap-2 ${getBreathingColor(sessionState.currentForm.phases[sessionState.currentPhase].breathing)}`}>
                      <Waves className="w-5 h-5" />
                      {t('practice.breathing')}
                    </h4>
                    <p className="text-green-200 text-sm">
                      {sessionState.currentForm.phases[sessionState.currentPhase].breathing === 'inhale' && t('practice.breathingTypes.inhale')}
                      {sessionState.currentForm.phases[sessionState.currentPhase].breathing === 'exhale' && t('practice.breathingTypes.exhale')}
                      {sessionState.currentForm.phases[sessionState.currentPhase].breathing === 'hold' && t('practice.breathingTypes.hold')}
                      {sessionState.currentForm.phases[sessionState.currentPhase].breathing === 'natural' && t('practice.breathingTypes.natural')}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-6 rounded-lg border border-amber-500/30">
                    <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                      <Sun className="w-5 h-5" />
                      {t('practice.energy')}
                    </h4>
                    <p className="text-amber-200 text-sm leading-relaxed">
                      {sessionState.currentForm.phases[sessionState.currentPhase].energy}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={togglePractice}
                    size="lg"
                    className={`px-8 py-3 ${
                      sessionState.isPlaying
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    }`}
                  >
                    {sessionState.isPlaying ? (
                      <><Pause className="w-5 h-5 mr-2" />{t('practice.pause')}</>
                    ) : (
                      <><Play className="w-5 h-5 mr-2" />{t('practice.start')}</>
                    )}
                  </Button>
                  
                  {sessionState.timeRemaining === 0 && (
                    <Button
                      onClick={nextPhase}
                      size="lg"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-8 py-3"
                    >
                      {sessionState.currentPhase + 1 >= sessionState.currentForm.phases.length ? t('practice.complete') : t('practice.nextPhase')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}