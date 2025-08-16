'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Play, Pause, RotateCcw, Heart, Waves, Wind, Mountain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface MeditationSession {
  id: string;
  name: string;
  duration: number; // 分钟
  description: string;
  breathPattern: {
    inhale: number;
    hold: number;
    exhale: number;
    pause: number;
  };
  backgroundSound: string;
  color: string;
  icon: React.ReactNode;
}

// 冥想会话配置将在组件内部定义以正确使用翻译函数

interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  currentPhase: 'inhale' | 'hold' | 'exhale' | 'pause';
  phaseTimeLeft: number;
  totalTimeLeft: number;
  cycleCount: number;
  selectedSession: MeditationSession | null;
}

export default function StressReliefPage() {
  const t = useTranslations('stressRelief');
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    isPaused: false,
    currentPhase: 'inhale',
    phaseTimeLeft: 0,
    totalTimeLeft: 0,
    cycleCount: 0,
    selectedSession: null
  });

  // 冥想会话配置
  const meditationSessions: MeditationSession[] = [
    {
      id: 'basic-breathing',
      name: t('sessions.basicBreathing.name'),
      duration: 5,
      description: t('sessions.basicBreathing.description'),
      breathPattern: { inhale: 4, hold: 2, exhale: 6, pause: 2 },
      backgroundSound: 'ocean',
      color: 'from-blue-400 to-cyan-500',
      icon: <Waves className="w-6 h-6" />
    },
    {
      id: 'box-breathing',
      name: t('sessions.boxBreathing.name'),
      duration: 8,
      description: t('sessions.boxBreathing.description'),
      breathPattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
      backgroundSound: 'forest',
      color: 'from-green-400 to-emerald-500',
      icon: <Wind className="w-6 h-6" />
    },
    {
      id: 'extended-exhale',
      name: t('sessions.extendedExhale.name'),
      duration: 10,
      description: t('sessions.extendedExhale.description'),
      breathPattern: { inhale: 4, hold: 2, exhale: 8, pause: 2 },
      backgroundSound: 'rain',
      color: 'from-purple-400 to-indigo-500',
      icon: <Heart className="w-6 h-6" />
    },
    {
      id: 'mountain-meditation',
      name: t('sessions.mountainMeditation.name'),
      duration: 15,
      description: t('sessions.mountainMeditation.description'),
      breathPattern: { inhale: 6, hold: 3, exhale: 9, pause: 3 },
      backgroundSound: 'mountain',
      color: 'from-gray-400 to-slate-500',
      icon: <Mountain className="w-6 h-6" />
    }
  ];

  const [showInstructions, setShowInstructions] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 开始冥想会话
  const startSession = (session: MeditationSession) => {
    setSessionState({
      isActive: true,
      isPaused: false,
      currentPhase: 'inhale',
      phaseTimeLeft: session.breathPattern.inhale,
      totalTimeLeft: session.duration * 60,
      cycleCount: 0,
      selectedSession: session
    });
    setShowInstructions(false);
    
    // 播放背景音乐
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  // 暂停/继续
  const togglePause = () => {
    setSessionState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    
    if (audioRef.current) {
      if (sessionState.isPaused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  // 重置会话
  const resetSession = () => {
    setSessionState({
      isActive: false,
      isPaused: false,
      currentPhase: 'inhale',
      phaseTimeLeft: 0,
      totalTimeLeft: 0,
      cycleCount: 0,
      selectedSession: null
    });
    setShowInstructions(true);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // 获取下一个呼吸阶段
  const getNextPhase = (currentPhase: string): 'inhale' | 'hold' | 'exhale' | 'pause' => {
    switch (currentPhase) {
      case 'inhale': return 'hold';
      case 'hold': return 'exhale';
      case 'exhale': return 'pause';
      case 'pause': return 'inhale';
      default: return 'inhale';
    }
  };

  // 获取阶段持续时间
  const getPhaseDuration = (phase: string, session: MeditationSession): number => {
    switch (phase) {
      case 'inhale': return session.breathPattern.inhale;
      case 'hold': return session.breathPattern.hold;
      case 'exhale': return session.breathPattern.exhale;
      case 'pause': return session.breathPattern.pause;
      default: return 4;
    }
  };

  // 获取阶段指导文本
  const getPhaseText = (phase: string): string => {
    switch (phase) {
      case 'inhale': return t('breathingPhases.inhale');
      case 'hold': return t('breathingPhases.hold');
      case 'exhale': return t('breathingPhases.exhale');
      case 'pause': return t('breathingPhases.pause');
      default: return t('breathingPhases.prepare');
    }
  };

  // 计时器逻辑
  useEffect(() => {
    if (!sessionState.isActive || sessionState.isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSessionState(prev => {
        if (prev.totalTimeLeft <= 1) {
          // 会话结束
          if (audioRef.current) {
            audioRef.current.pause();
          }
          return {
            ...prev,
            isActive: false,
            totalTimeLeft: 0
          };
        }

        if (prev.phaseTimeLeft <= 1) {
          // 切换到下一个呼吸阶段
          const nextPhase = getNextPhase(prev.currentPhase);
          const nextDuration = getPhaseDuration(nextPhase, prev.selectedSession!);
          const newCycleCount = nextPhase === 'inhale' ? prev.cycleCount + 1 : prev.cycleCount;
          
          return {
            ...prev,
            currentPhase: nextPhase,
            phaseTimeLeft: nextDuration,
            totalTimeLeft: prev.totalTimeLeft - 1,
            cycleCount: newCycleCount
          };
        }

        return {
          ...prev,
          phaseTimeLeft: prev.phaseTimeLeft - 1,
          totalTimeLeft: prev.totalTimeLeft - 1
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionState.isActive, sessionState.isPaused]);

  // 呼吸圆圈动画大小
  const getCircleScale = () => {
    if (!sessionState.selectedSession) return 1;
    
    const { breathPattern } = sessionState.selectedSession;
    const totalPhaseTime = getPhaseDuration(sessionState.currentPhase, sessionState.selectedSession);
    const progress = 1 - (sessionState.phaseTimeLeft / totalPhaseTime);
    
    switch (sessionState.currentPhase) {
      case 'inhale':
        return 1 + progress * 0.8; // 从1放大到1.8
      case 'hold':
        return 1.8; // 保持最大
      case 'exhale':
        return 1.8 - progress * 0.8; // 从1.8缩小到1
      case 'pause':
        return 1; // 保持最小
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      
      {/* 背景音频 */}
      <audio ref={audioRef} loop>
        <source src="/audio/ocean-waves.mp3" type="audio/mpeg" />
      </audio>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {showInstructions ? (
          // 选择会话界面
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center text-2xl">
                  {t('selectSession')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {meditationSessions.map((session) => (
                    <Card 
                      key={session.id}
                      className="group cursor-pointer bg-black/20 border-gray-600 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
                      onClick={() => startSession(session)}
                    >
                      <CardHeader className="text-center pb-4">
                        <div className={`mx-auto mb-3 p-3 rounded-full bg-gradient-to-br ${session.color} text-white shadow-lg`}>
                          {session.icon}
                        </div>
                        <CardTitle className="text-lg text-white group-hover:text-blue-300 transition-colors">
                          {session.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-blue-400 border-blue-500">
                          {session.duration} {t('ui.minutes')}
                        </Badge>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-300 text-center text-sm mb-4">
                          {session.description}
                        </p>
                        <div className="text-xs text-gray-400 text-center">
                          {t('ui.breathingRhythm')}: {session.breathPattern.inhale}-{session.breathPattern.hold}-{session.breathPattern.exhale}-{session.breathPattern.pause}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 冥想指导 */}
            <Card className="bg-black/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center">{t('ui.meditationGuide')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">{t('ui.preparation')}</h4>
                    <ul className="space-y-1 text-sm">
                      {t.raw('preparation.items').map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">{t('ui.breathingTechniques')}</h4>
                    <ul className="space-y-1 text-sm">
                      {t.raw('breathingTechniques.items').map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // 冥想会话界面
          <div className="max-w-2xl mx-auto">
            {/* 会话控制栏 */}
            <div className="flex justify-between items-center mb-8 bg-black/40 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-white border-blue-500">
                  {sessionState.selectedSession?.name}
                </Badge>
                <Badge variant="outline" className="text-blue-400 border-blue-500">
                  {t('ui.cycle', { count: sessionState.cycleCount })}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">
                  {Math.floor(sessionState.totalTimeLeft / 60)}:{(sessionState.totalTimeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* 呼吸指导圆圈 */}
            <div className="text-center mb-8">
              <div className="relative mx-auto w-80 h-80 flex items-center justify-center">
                {/* 背景圆圈 */}
                <div className="absolute inset-0 rounded-full border-2 border-gray-600 opacity-30" />
                
                {/* 动态呼吸圆圈 */}
                <motion.div
                  animate={{
                    scale: getCircleScale(),
                    opacity: sessionState.isPaused ? 0.5 : 1
                  }}
                  transition={{
                    duration: sessionState.phaseTimeLeft,
                    ease: "easeInOut"
                  }}
                  className={`w-48 h-48 rounded-full bg-gradient-to-br ${sessionState.selectedSession?.color || 'from-blue-400 to-cyan-500'} shadow-2xl flex items-center justify-center`}
                >
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold mb-2">
                      {getPhaseText(sessionState.currentPhase)}
                    </div>
                    <div className="text-lg">
                      {sessionState.phaseTimeLeft}s
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={togglePause}
                variant="outline"
                size="lg"
                className="bg-black/20 border-gray-600 text-white hover:border-blue-500"
              >
                {sessionState.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                {sessionState.isPaused ? t('ui.continue') : t('ui.pause')}
              </Button>
              
              <Button
                onClick={resetSession}
                variant="outline"
                size="lg"
                className="bg-black/20 border-gray-600 text-white hover:border-red-500"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {t('ui.restart')}
              </Button>
            </div>

            {/* 会话完成提示 */}
            {!sessionState.isActive && sessionState.totalTimeLeft === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <Card className="bg-green-900/30 border-green-500/30">
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold text-green-400 mb-2">{t('completion.title')}</h3>
                    <p className="text-gray-300 mb-4">
                      {t('completion.congratulations', { duration: sessionState.selectedSession?.duration })}
                    </p>
                    <p className="text-gray-300 mb-6">
                      {t('completion.totalCycles', { cycles: sessionState.cycleCount })}
                    </p>
                    <Button
                      onClick={resetSession}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      {t('completion.backToSelection')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}