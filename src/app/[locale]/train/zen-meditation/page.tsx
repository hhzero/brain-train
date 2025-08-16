'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { Play, Pause, RotateCcw, Mountain, Waves, Sun, Moon, Leaf, CheckCircle, Bell, Heart, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface MeditationSession {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  philosophy: string;
  duration: number; // 秒
  type: 'breathing' | 'mindfulness' | 'loving-kindness' | 'walking' | 'body-scan';
  phases: {
    name: string;
    chineseName: string;
    duration: number;
    instruction: string;
    focus: string;
    mantra?: string;
    visualization: string;
    wisdom: string;
  }[];
  benefits: string[];
  difficulty: number; // 1-5
  tradition: 'zen' | 'vipassana' | 'tibetan' | 'chan' | 'pure-land';
}

export default function ZenMeditationPage() {
  const t = useTranslations('zenMeditation');
  
  const meditationSessions: MeditationSession[] = [
    {
      id: 'basic-breathing',
      name: 'Basic Breathing Meditation',
      chineseName: t('sessions.basicBreathing.name'),
      description: t('sessions.basicBreathing.description'),
      philosophy: t('sessions.basicBreathing.philosophy'),
    duration: 300,
    type: 'breathing',
    phases: [
      {
        name: 'Settling',
        chineseName: t('sessions.basicBreathing.phases.settling.name'),
        duration: 60,
        instruction: t('sessions.basicBreathing.phases.settling.instruction'),
        focus: t('sessions.basicBreathing.phases.settling.focus'),
        visualization: t('sessions.basicBreathing.phases.settling.visualization'),
        wisdom: t('sessions.basicBreathing.phases.settling.wisdom')
      },
      {
        name: 'Breath Awareness',
        chineseName: t('sessions.basicBreathing.phases.breathAwareness.name'),
        duration: 180,
        instruction: t('sessions.basicBreathing.phases.breathAwareness.instruction'),
        focus: t('sessions.basicBreathing.phases.breathAwareness.focus'),
        visualization: t('sessions.basicBreathing.phases.breathAwareness.visualization'),
        wisdom: t('sessions.basicBreathing.phases.breathAwareness.wisdom')
      },
      {
        name: 'Integration',
        chineseName: t('sessions.basicBreathing.phases.integration.name'),
        duration: 60,
        instruction: t('sessions.basicBreathing.phases.integration.instruction'),
        focus: t('sessions.basicBreathing.phases.integration.focus'),
        visualization: t('sessions.basicBreathing.phases.integration.visualization'),
        wisdom: t('sessions.basicBreathing.phases.integration.wisdom')
      }
    ],
    benefits: [t('sessions.basicBreathing.benefits.focus'), t('sessions.basicBreathing.benefits.anxiety'), t('sessions.basicBreathing.benefits.awareness'), t('sessions.basicBreathing.benefits.sleep')],
    difficulty: 1,
    tradition: 'zen'
  },
  {    id: 'mindfulness-present',    name: 'Mindfulness of Present Moment',    chineseName: t('sessions.mindfulnessPresent.name'),    description: t('sessions.mindfulnessPresent.description'),    philosophy: t('sessions.mindfulnessPresent.philosophy'),    duration: 420,    type: 'mindfulness',    phases: [      {        name: 'Grounding',        chineseName: t('sessions.mindfulnessPresent.phases.grounding.name'),        duration: 90,        instruction: t('sessions.mindfulnessPresent.phases.grounding.instruction'),        focus: t('sessions.mindfulnessPresent.phases.grounding.focus'),        visualization: t('sessions.mindfulnessPresent.phases.grounding.visualization'),        wisdom: t('sessions.mindfulnessPresent.phases.grounding.wisdom')      },      {        name: 'Sensory Awareness',        chineseName: t('sessions.mindfulnessPresent.phases.sensoryAwareness.name'),        duration: 150,        instruction: t('sessions.mindfulnessPresent.phases.sensoryAwareness.instruction'),        focus: t('sessions.mindfulnessPresent.phases.sensoryAwareness.focus'),        visualization: t('sessions.mindfulnessPresent.phases.sensoryAwareness.visualization'),        wisdom: t('sessions.mindfulnessPresent.phases.sensoryAwareness.wisdom')      },      {        name: 'Thought Observation',        chineseName: t('sessions.mindfulnessPresent.phases.thoughtObservation.name'),        duration: 120,        instruction: t('sessions.mindfulnessPresent.phases.thoughtObservation.instruction'),        focus: t('sessions.mindfulnessPresent.phases.thoughtObservation.focus'),        visualization: t('sessions.mindfulnessPresent.phases.thoughtObservation.visualization'),        wisdom: t('sessions.mindfulnessPresent.phases.thoughtObservation.wisdom')      },      {        name: 'Pure Awareness',        chineseName: t('sessions.mindfulnessPresent.phases.pureAwareness.name'),        duration: 60,        instruction: t('sessions.mindfulnessPresent.phases.pureAwareness.instruction'),        focus: t('sessions.mindfulnessPresent.phases.pureAwareness.focus'),        visualization: t('sessions.mindfulnessPresent.phases.pureAwareness.visualization'),        wisdom: t('sessions.mindfulnessPresent.phases.pureAwareness.wisdom')      }    ],    benefits: [t('sessions.mindfulnessPresent.benefits.awareness'), t('sessions.mindfulnessPresent.benefits.rumination'), t('sessions.mindfulnessPresent.benefits.emotion'), t('sessions.mindfulnessPresent.benefits.insight')],    difficulty: 3,    tradition: 'vipassana'  },
  {
    id: 'loving-kindness',
    name: 'Loving-Kindness Meditation',
    chineseName: t('sessions.lovingKindness.name'),
    description: t('sessions.lovingKindness.description'),
    philosophy: t('sessions.lovingKindness.philosophy'),
    duration: 360,
    type: 'loving-kindness',
    phases: [
      {
        name: 'Self-Love',
        chineseName: t('sessions.lovingKindness.phases.selfLove.name'),
        duration: 90,
        instruction: t('sessions.lovingKindness.phases.selfLove.instruction'),
        focus: t('sessions.lovingKindness.phases.selfLove.focus'),
        mantra: t('sessions.lovingKindness.phases.selfLove.mantra'),
        visualization: t('sessions.lovingKindness.phases.selfLove.visualization'),
        wisdom: t('sessions.lovingKindness.phases.selfLove.wisdom')
      },
      {
        name: 'Loved Ones',
        chineseName: t('sessions.lovingKindness.phases.lovedOnes.name'),
        duration: 90,
        instruction: t('sessions.lovingKindness.phases.lovedOnes.instruction'),
        focus: t('sessions.lovingKindness.phases.lovedOnes.focus'),
        mantra: t('sessions.lovingKindness.phases.lovedOnes.mantra'),
        visualization: t('sessions.lovingKindness.phases.lovedOnes.visualization'),
        wisdom: t('sessions.lovingKindness.phases.lovedOnes.wisdom')
      },
      {
        name: 'Neutral People',
        chineseName: t('sessions.lovingKindness.phases.neutralPeople.name'),
        duration: 90,
        instruction: t('sessions.lovingKindness.phases.neutralPeople.instruction'),
        focus: t('sessions.lovingKindness.phases.neutralPeople.focus'),
        mantra: t('sessions.lovingKindness.phases.neutralPeople.mantra'),
        visualization: t('sessions.lovingKindness.phases.neutralPeople.visualization'),
        wisdom: t('sessions.lovingKindness.phases.neutralPeople.wisdom')
      },
      {
        name: 'Difficult People',
        chineseName: t('sessions.lovingKindness.phases.difficultPeople.name'),
        duration: 90,
        instruction: t('sessions.lovingKindness.phases.difficultPeople.instruction'),
        focus: t('sessions.lovingKindness.phases.difficultPeople.focus'),
        mantra: t('sessions.lovingKindness.phases.difficultPeople.mantra'),
        visualization: t('sessions.lovingKindness.phases.difficultPeople.visualization'),
        wisdom: t('sessions.lovingKindness.phases.difficultPeople.wisdom')
      }
    ],
    benefits: [t('sessions.lovingKindness.benefits.empathy'), t('sessions.lovingKindness.benefits.anger'), t('sessions.lovingKindness.benefits.relationships'), t('sessions.lovingKindness.benefits.tolerance')],
    difficulty: 4,
    tradition: 'tibetan'
  },
  {
    id: 'walking-meditation',
    name: 'Walking Meditation',
    chineseName: t('sessions.walkingMeditation.name'),
    description: t('sessions.walkingMeditation.description'),
    philosophy: t('sessions.walkingMeditation.philosophy'),
    duration: 480,
    type: 'walking',
    phases: [
      {
        name: 'Standing Preparation',
        chineseName: t('sessions.walkingMeditation.phases.standingPreparation.name'),
        duration: 60,
        instruction: t('sessions.walkingMeditation.phases.standingPreparation.instruction'),
        focus: t('sessions.walkingMeditation.phases.standingPreparation.focus'),
        visualization: t('sessions.walkingMeditation.phases.standingPreparation.visualization'),
        wisdom: t('sessions.walkingMeditation.phases.standingPreparation.wisdom')
      },
      {
        name: 'Slow Walking',
        chineseName: t('sessions.walkingMeditation.phases.slowWalking.name'),
        duration: 240,
        instruction: t('sessions.walkingMeditation.phases.slowWalking.instruction'),
        focus: t('sessions.walkingMeditation.phases.slowWalking.focus'),
        visualization: t('sessions.walkingMeditation.phases.slowWalking.visualization'),
        wisdom: t('sessions.walkingMeditation.phases.slowWalking.wisdom')
      },
      {
        name: 'Coordinated Movement',
        chineseName: t('sessions.walkingMeditation.phases.coordinatedMovement.name'),
        duration: 120,
        instruction: t('sessions.walkingMeditation.phases.coordinatedMovement.instruction'),
        focus: t('sessions.walkingMeditation.phases.coordinatedMovement.focus'),
        visualization: t('sessions.walkingMeditation.phases.coordinatedMovement.visualization'),
        wisdom: t('sessions.walkingMeditation.phases.coordinatedMovement.wisdom')
      },
      {
        name: 'Mindful Return',
        chineseName: t('sessions.walkingMeditation.phases.mindfulReturn.name'),
        duration: 60,
        instruction: t('sessions.walkingMeditation.phases.mindfulReturn.instruction'),
        focus: t('sessions.walkingMeditation.phases.mindfulReturn.focus'),
        visualization: t('sessions.walkingMeditation.phases.mindfulReturn.visualization'),
        wisdom: t('sessions.walkingMeditation.phases.mindfulReturn.wisdom')
      }
    ],
    benefits: [t('sessions.walkingMeditation.benefits.integration'), t('sessions.walkingMeditation.benefits.bodyAwareness'), t('sessions.walkingMeditation.benefits.dailyMindfulness'), t('sessions.walkingMeditation.benefits.focus')],
    difficulty: 2,
    tradition: 'chan'
  },
  {
    id: 'body-scan',
    name: 'Body Scan Meditation',
    chineseName: t('sessions.bodyScan.name'),
    description: t('sessions.bodyScan.description'),
    philosophy: t('sessions.bodyScan.philosophy'),
    duration: 540,
    type: 'body-scan',
    phases: [
      {
        name: 'Relaxation',
        chineseName: t('sessions.bodyScan.phases.relaxation.name'),
        duration: 60,
        instruction: t('sessions.bodyScan.phases.relaxation.instruction'),
        focus: t('sessions.bodyScan.phases.relaxation.focus'),
        visualization: t('sessions.bodyScan.phases.relaxation.visualization'),
        wisdom: t('sessions.bodyScan.phases.relaxation.wisdom')
      },
      {
        name: 'Feet and Legs',
        chineseName: t('sessions.bodyScan.phases.feetAndLegs.name'),
        duration: 120,
        instruction: t('sessions.bodyScan.phases.feetAndLegs.instruction'),
        focus: t('sessions.bodyScan.phases.feetAndLegs.focus'),
        visualization: t('sessions.bodyScan.phases.feetAndLegs.visualization'),
        wisdom: t('sessions.bodyScan.phases.feetAndLegs.wisdom')
      },
      {
        name: 'Torso and Arms',
        chineseName: t('sessions.bodyScan.phases.torsoAndArms.name'),
        duration: 180,
        instruction: t('sessions.bodyScan.phases.torsoAndArms.instruction'),
        focus: t('sessions.bodyScan.phases.torsoAndArms.focus'),
        visualization: t('sessions.bodyScan.phases.torsoAndArms.visualization'),
        wisdom: t('sessions.bodyScan.phases.torsoAndArms.wisdom')
      },
      {
        name: 'Head and Face',
        chineseName: t('sessions.bodyScan.phases.headAndFace.name'),
        duration: 120,
        instruction: t('sessions.bodyScan.phases.headAndFace.instruction'),
        focus: t('sessions.bodyScan.phases.headAndFace.focus'),
        visualization: t('sessions.bodyScan.phases.headAndFace.visualization'),
        wisdom: t('sessions.bodyScan.phases.headAndFace.wisdom')
      },
      {
        name: 'Whole Body',
        chineseName: t('sessions.bodyScan.phases.wholeBody.name'),
        duration: 60,
        instruction: t('sessions.bodyScan.phases.wholeBody.instruction'),
        focus: t('sessions.bodyScan.phases.wholeBody.focus'),
        visualization: t('sessions.bodyScan.phases.wholeBody.visualization'),
        wisdom: t('sessions.bodyScan.phases.wholeBody.wisdom')
      }
    ],
    benefits: [t('sessions.bodyScan.benefits.tension'), t('sessions.bodyScan.benefits.awareness'), t('sessions.bodyScan.benefits.sleep'), t('sessions.bodyScan.benefits.pain')],
    difficulty: 2,
    tradition: 'pure-land'
  }
];

interface SessionState {
  currentSession: MeditationSession | null;
  currentPhase: number;
  isPlaying: boolean;
  timeRemaining: number;
  completedSessions: string[];
  totalScore: number;
  sessionStarted: boolean;
  showMantra: boolean;
}

  const [sessionState, setSessionState] = useState<SessionState>({
    currentSession: null,
    currentPhase: 0,
    isPlaying: false,
    timeRemaining: 0,
    completedSessions: [],
    totalScore: 0,
    sessionStarted: false,
    showMantra: false
  });

  const [showInstructions, setShowInstructions] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);

  // 开始练习
  const startSession = () => {
    setShowInstructions(false);
    setSessionState(prev => ({ ...prev, sessionStarted: true }));
  };

  // 选择禅修会话
  const selectSession = (session: MeditationSession) => {
    setSessionState({
      currentSession: session,
      currentPhase: 0,
      isPlaying: false,
      timeRemaining: session.phases[0].duration,
      completedSessions: sessionState.completedSessions,
      totalScore: sessionState.totalScore,
      sessionStarted: true,
      showMantra: false
    });
  };

  // 开始/暂停禅修
  const toggleMeditation = () => {
    setSessionState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    if (!sessionState.isPlaying) {
      // 播放开始铃声
      playBell();
    }
  };

  // 播放铃声
  const playBell = () => {
    if (bellAudioRef.current) {
      bellAudioRef.current.currentTime = 0;
      bellAudioRef.current.play().catch(() => {
        // 忽略自动播放限制错误
      });
    }
  };

  // 下一阶段
  const nextPhase = () => {
    if (!sessionState.currentSession) return;
    
    const nextPhaseIndex = sessionState.currentPhase + 1;
    
    if (nextPhaseIndex >= sessionState.currentSession.phases.length) {
      // 完成当前会话
      const points = sessionState.currentSession.difficulty * 25;
      setSessionState(prev => ({
        ...prev,
        completedSessions: [...prev.completedSessions, prev.currentSession!.id],
        totalScore: prev.totalScore + points,
        currentSession: null,
        currentPhase: 0,
        isPlaying: false,
        timeRemaining: 0,
        showMantra: false
      }));
      playBell();
    } else {
      // 进入下一阶段
      setSessionState(prev => ({
        ...prev,
        currentPhase: nextPhaseIndex,
        timeRemaining: prev.currentSession!.phases[nextPhaseIndex].duration,
        isPlaying: false,
        showMantra: false
      }));
      playBell();
    }
  };

  // 重置练习
  const resetSession = () => {
    setSessionState({
      currentSession: null,
      currentPhase: 0,
      isPlaying: false,
      timeRemaining: 0,
      completedSessions: [],
      totalScore: 0,
      sessionStarted: false,
      showMantra: false
    });
    setShowInstructions(true);
  };

  // 切换真言显示
  const toggleMantra = () => {
    setSessionState(prev => ({ ...prev, showMantra: !prev.showMantra }));
  };

  // 计时器
  useEffect(() => {
    if (sessionState.isPlaying && sessionState.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setSessionState(prev => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            playBell();
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

  // 获取传统颜色
  const getTraditionColor = (tradition: string) => {
    switch (tradition) {
      case 'zen': return 'from-purple-500 to-indigo-500';
      case 'vipassana': return 'from-orange-500 to-red-500';
      case 'tibetan': return 'from-orange-500 to-red-500';
      case 'chan': return 'from-green-500 to-teal-500';
      case 'pure-land': return 'from-blue-500 to-cyan-500';
      case 'mindfulness': return 'from-pink-500 to-rose-500';
      case 'buddhist': return 'from-amber-500 to-yellow-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breathing': return <Waves className="w-5 h-5" />;
      case 'mindfulness': return <Eye className="w-5 h-5" />;
      case 'loving-kindness': return <Heart className="w-5 h-5" />;
      case 'walking': return <Mountain className="w-5 h-5" />;
      case 'body-scan': return <Leaf className="w-5 h-5" />;
      default: return <Leaf className="w-5 h-5" />;
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* 隐藏的音频元素 */}
      <audio ref={bellAudioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmHgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>
      
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
                  {t('guide.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-4">{t('guide.traditions.title')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-gray-600 to-slate-700">
                          <Mountain className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('guide.traditions.zen.name')}</div>
                          <div className="text-gray-400 text-sm">{t('guide.traditions.zen.description')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('guide.traditions.vipassana.name')}</div>
                          <div className="text-gray-400 text-sm">{t('guide.traditions.vipassana.description')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('guide.traditions.tibetan.name')}</div>
                          <div className="text-gray-400 text-sm">{t('guide.traditions.tibetan.description')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
                          <Leaf className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{t('guide.traditions.chan.name')}</div>
                          <div className="text-gray-400 text-sm">{t('guide.traditions.chan.description')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-4">{t('guide.types.title')}</h4>
                    <div className="space-y-3 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{t('guide.types.breathing')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-orange-400" />
                        <span className="text-sm">{t('guide.types.mindfulness')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span className="text-sm">{t('guide.types.lovingKindness')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mountain className="w-4 h-4 text-green-400" />
                        <span className="text-sm">{t('guide.types.walking')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-purple-400" />
                        <span className="text-sm">{t('guide.types.bodyScan')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6 rounded-lg border border-purple-500/30">
                  <h4 className="text-purple-400 font-semibold mb-3">{t('guide.tips.title')}</h4>
                  <ul className="space-y-2 text-purple-200 text-sm">
                    <li>• {t('guide.tips.posture')}</li>
                    <li>• {t('guide.tips.expectation')}</li>
                    <li>• {t('guide.tips.wandering')}</li>
                    <li>• {t('guide.tips.compassion')}</li>
                    <li>• {t('guide.tips.integration')}</li>
                  </ul>
                </div>
                
                <div className="mt-8 text-center">
                  <Button
                    onClick={startSession}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-3"
                  >
                    {t('guide.startButton')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !sessionState.currentSession ? (
          // 会话选择
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">{t('sessions.title')}</h2>
              <div className="flex justify-center items-center gap-6">
                <div className="text-purple-400">
                  <span className="text-lg font-medium">{t('sessions.score')}: {sessionState.totalScore}</span>
                </div>
                <div className="text-indigo-400">
                  <span className="text-lg font-medium">{t('sessions.completed')}: {sessionState.completedSessions.length}/{meditationSessions.length}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meditationSessions.map((session) => (
                <Card
                  key={session.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    sessionState.completedSessions.includes(session.id)
                      ? 'bg-green-900/30 border-green-500'
                      : 'bg-black/40 border-gray-700 hover:border-purple-500'
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getTraditionColor(session.tradition)}`}>
                          {getTypeIcon(session.type)}
                        </div>
                        {sessionState.completedSessions.includes(session.id) && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-white border-2 ${
                          session.difficulty >= 4 ? 'border-red-500 text-red-400' :
                          session.difficulty >= 3 ? 'border-orange-500 text-orange-400' :
                          'border-yellow-500 text-yellow-400'
                        }`}
                      >
                        {session.difficulty}/5
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">
                      {session.chineseName}
                    </CardTitle>
                    <p className="text-gray-400 text-sm">{session.name}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {session.description}
                    </p>
                    
                    <div className="mb-4">
                      <p className="text-purple-400 text-xs font-medium mb-1">{t('sessions.philosophy')}:</p>
                      <p className="text-purple-200 text-xs leading-relaxed">
                        {session.philosophy}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-green-400 text-xs font-medium mb-2">{t('sessions.benefits')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {session.benefits.map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-green-400 border-green-500">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center text-gray-400 text-sm">
                      {t('sessions.duration')}: {Math.floor(session.duration / 60)}{t('sessions.minutes')}{session.duration % 60}{t('sessions.seconds')}
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
                {t('sessions.resetButton')}
              </Button>
            </div>
          </div>
        ) : (
          // 禅修界面
          <div className="max-w-4xl mx-auto">
            {/* 当前会话信息 */}
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${getTraditionColor(sessionState.currentSession.tradition)}`}>
                      {getTypeIcon(sessionState.currentSession.type)}
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">
                        {sessionState.currentSession.chineseName}
                      </CardTitle>
                      <p className="text-gray-400">{sessionState.currentSession.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-400 font-medium">
                      {t('practice.phase')} {sessionState.currentPhase + 1} / {sessionState.currentSession.phases.length}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {sessionState.currentSession.phases[sessionState.currentPhase].chineseName}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* 当前阶段 */}
            <Card className="mb-8 bg-black/40 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-purple-400 mb-2">
                    {formatTime(sessionState.timeRemaining)}
                  </div>
                  <Progress 
                    value={((sessionState.currentSession.phases[sessionState.currentPhase].duration - sessionState.timeRemaining) / sessionState.currentSession.phases[sessionState.currentPhase].duration) * 100}
                    className="h-2 bg-gray-700 mb-4"
                  />
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {sessionState.currentSession.phases[sessionState.currentPhase].chineseName}
                  </h3>
                  <p className="text-gray-400">
                    {sessionState.currentSession.phases[sessionState.currentPhase].name}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-6 rounded-lg border border-blue-500/30">
                    <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                      <Leaf className="w-5 h-5" />
                      {t('practice.instruction')}
                    </h4>
                    <p className="text-blue-200 text-sm leading-relaxed">
                      {sessionState.currentSession.phases[sessionState.currentPhase].instruction}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-6 rounded-lg border border-purple-500/30">
                    <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      {t('practice.focusObject')}
                    </h4>
                    <p className="text-purple-200 text-sm leading-relaxed">
                      {sessionState.currentSession.phases[sessionState.currentPhase].focus}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6 rounded-lg border border-green-500/30">
                    <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                      <Mountain className="w-5 h-5" />
                      {t('practice.visualization')}
                    </h4>
                    <p className="text-green-200 text-sm leading-relaxed">
                      {sessionState.currentSession.phases[sessionState.currentPhase].visualization}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-6 rounded-lg border border-amber-500/30">
                    <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                      <Sun className="w-5 h-5" />
                      {t('practice.wisdom')}
                    </h4>
                    <p className="text-amber-200 text-sm leading-relaxed">
                      {sessionState.currentSession.phases[sessionState.currentPhase].wisdom}
                    </p>
                  </div>
                </div>
                
                {/* 真言显示 */}
                {sessionState.currentSession.phases[sessionState.currentPhase].mantra && (
                  <AnimatePresence>
                    {sessionState.showMantra && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-8 bg-gradient-to-r from-pink-900/30 to-rose-900/30 p-6 rounded-lg border border-pink-500/30 text-center"
                      >
                        <h4 className="text-pink-400 font-semibold mb-3 flex items-center justify-center gap-2">
                          <Heart className="w-5 h-5" />
                          {t('practice.mantra')}
                        </h4>
                        <p className="text-pink-200 text-lg leading-relaxed">
                          {sessionState.currentSession.phases[sessionState.currentPhase].mantra}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
                
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={toggleMeditation}
                    size="lg"
                    className={`px-8 py-3 ${
                      sessionState.isPlaying
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    }`}
                  >
                    {sessionState.isPlaying ? (
                      <><Pause className="w-5 h-5 mr-2" />{t('practice.pauseMeditation')}</>
                    ) : (
                      <><Play className="w-5 h-5 mr-2" />{t('practice.startMeditation')}</>
                    )}
                  </Button>
                  
                  {sessionState.currentSession.phases[sessionState.currentPhase].mantra && (
                    <Button
                      onClick={toggleMantra}
                      variant="outline"
                      className="border-pink-500 text-pink-400 hover:bg-pink-900/30"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {sessionState.showMantra ? t('practice.hideMantra') : t('practice.showMantra')}
                    </Button>
                  )}
                  
                  {sessionState.timeRemaining === 0 && (
                    <Button
                      onClick={nextPhase}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-8 py-3"
                    >
                      <Bell className="w-5 h-5 mr-2" />
                      {sessionState.currentPhase + 1 >= sessionState.currentSession.phases.length ? t('practice.completeMeditation') : t('practice.nextPhase')}
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