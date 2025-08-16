'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Settings, 
  Trophy, 
  Target, 
  Clock, 
  Zap,
  Star,
  Award,
  TrendingUp,
  RotateCcw,
  Home,
  HelpCircle,
  Headphones
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import AchievementSystem, { Achievement, AchievementType, AchievementRarity } from '../../../../components/AchievementSystem';
import { StatisticsPanel } from '../../../../components/StatisticsPanel';
import { LevelSystem } from '../../../../components/LevelSystem';
import { TrainingHistory } from '../../../../components/TrainingHistory';
import { AchievementUnlockAnimation } from '../../../../components/AchievementUnlockAnimation';
import { AudioTestPanel } from '../../../../components/AudioTestPanel';
import TrainingSettingsComponent, { TrainingConfig, DEFAULT_CONFIG } from '../../../../components/TrainingSettings';
import { AudioSettingsComponent } from '../../../../components/AudioSettings';
import { SoundEffectManagerComponent, SoundEffectManager } from '../../../../components/SoundEffectManager';
import { TutorialSystem, TutorialLauncher } from '../../../../components/TutorialSystem';
import { UserGuidance, GuidanceLauncher, SmartTooltip } from '../../../../components/UserGuidance';
import { InteractiveDemo, DemoSelector } from '../../../../components/InteractiveDemo';
import DualNBackEngine, { TrainingState, TrainingMode } from '../../../../utils/DualNBackEngine';
import AdaptiveDifficultyManager from '../../../../utils/AdaptiveDifficultyManager';
import NBackAudioManager, { SoundEffect } from '../../../../utils/NBackAudioManager';



// 游戏状态枚举
enum GameState {
  MENU = 'menu',
  TRAINING = 'training',
  PAUSED = 'paused',
  RESULTS = 'results',
  SETTINGS = 'settings',
  STATISTICS = 'statistics',
  ACHIEVEMENTS = 'achievements',
  HISTORY = 'history'
}

// 视觉网格位置
const GRID_POSITIONS = [
  { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
  { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
  { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
];

export default function NBackTraining() {
  const t = useTranslations('nback');
  
  // 核心状态
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [config, setConfig] = useState<TrainingConfig>(DEFAULT_CONFIG);
  const [currentStimulus, setCurrentStimulus] = useState<any>(null);
  const [userResponses, setUserResponses] = useState<{ visual: boolean; audio: boolean }>({ visual: false, audio: false });
  const [sessionStats, setSessionStats] = useState<any>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showTrainingSettings, setShowTrainingSettings] = useState(false);
  const [showAudioTest, setShowAudioTest] = useState(false);
  const [showSoundManager, setShowSoundManager] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [selectedDemoSequence, setSelectedDemoSequence] = useState<'1-back-visual' | '2-back-visual' | '1-back-audio' | 'dual-nback'>('1-back-visual');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>(DEFAULT_CONFIG);
  const [soundManager] = useState(() => new SoundEffectManager());
  
  // 游戏状态
  const [currentTrial, setCurrentTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  
  // 引用
  const engineRef = useRef<DualNBackEngine | null>(null);
  const difficultyManagerRef = useRef<AdaptiveDifficultyManager | null>(null);
  const audioManagerRef = useRef<NBackAudioManager | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  // 音效设置状态
  const [audioSettings, setAudioSettings] = useState<{
    masterVolume: number;
    effectsVolume: number;
    tonesVolume: number;
    enableEffects: boolean;
    enableTones: boolean;
    toneType: 'sine' | 'square' | 'triangle' | 'sawtooth';
    effectsType: 'digital' | 'organic' | 'minimal';
  }>({
    masterVolume: 0.7,
    effectsVolume: 0.8,
    tonesVolume: 0.6,
    enableEffects: true,
    enableTones: true,
    toneType: 'sine',
    effectsType: 'digital'
  });
  
  // 初始化系统
  useEffect(() => {
    // 初始化训练引擎
    engineRef.current = new DualNBackEngine({
      nLevel: config.nLevel,
      mode: config.mode || TrainingMode.DUAL,
      trialsPerSession: config.sessionLength,
      stimulusDuration: config.stimulusDuration,
      intervalDuration: config.intervalDuration,
      targetProbability: 0.25,
      adaptiveMode: true
    });
    
    // 初始化难度管理器
    difficultyManagerRef.current = new AdaptiveDifficultyManager();
    
    // 初始化音频管理器
    audioManagerRef.current = NBackAudioManager.getInstance();
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (audioManagerRef.current) {
        audioManagerRef.current.dispose();
      }
    };
  }, []);
  
  // 开始训练
  const startTraining = useCallback(async () => {
    if (!engineRef.current) return;
    
    engineRef.current.startSession();
    setGameState(GameState.TRAINING);
    setUserResponses({ visual: false, audio: false });
    
    // 播放开始音效
    await soundManager.playSystem('start');
    audioManagerRef.current?.playSoundEffect(SoundEffect.START);
    
    // 开始游戏循环
    gameLoopRef.current = setInterval(() => {
      if (engineRef.current?.getState() === TrainingState.RUNNING) {
        const stimulus = engineRef.current.getCurrentStimulus();
        setCurrentStimulus(stimulus);
        
        // 播放听觉刺激
        if (stimulus?.tone !== undefined && trainingConfig.enableAudio) {
          audioManagerRef.current?.playTone(stimulus.tone);
        }
        
        // 播放节拍音效
        audioManagerRef.current?.playSoundEffect(SoundEffect.TICK);
      } else if (engineRef.current?.getState() === TrainingState.COMPLETED) {
        // 训练完成
        completeSession();
      }
    }, trainingConfig.intervalDuration);
  }, [trainingConfig, soundManager]);
  
  // 完成训练会话
  const completeSession = useCallback(() => {
    if (!engineRef.current) return;
    
    const stats = engineRef.current.getSessionStats();
    setSessionStats(stats);
    setGameState(GameState.RESULTS);
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // 播放完成音效
    audioManagerRef.current?.playSoundEffect(SoundEffect.COMPLETE);
    
    // 检查成就
    const achievements = checkAchievements(stats);
    if (achievements.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...achievements]);
      setShowAchievement(achievements[0]);
    }
    
    // 更新难度
    if (difficultyManagerRef.current) {
      // 转换为DualNBackEngine所需的TrainingConfig格式
      const engineConfig = {
        nLevel: trainingConfig.nLevel,
        mode: trainingConfig.mode,
        trialsPerSession: trainingConfig.sessionLength || 20,
        stimulusDuration: trainingConfig.stimulusDuration,
        intervalDuration: trainingConfig.intervalDuration,
        targetProbability: 0.25,
        adaptiveMode: true
      };
      
      difficultyManagerRef.current.recordSessionPerformance(stats, engineConfig);
      const adjustment = difficultyManagerRef.current.getDifficultyAdjustment(engineConfig);
      if (adjustment.newNLevel !== trainingConfig.nLevel) {
        setConfig(prev => ({ ...prev, nLevel: adjustment.newNLevel }));
        toast.success(t('nback.difficulty.adjusted', { level: adjustment.newNLevel, reason: adjustment.reason }));
      }
    }
  }, []);
  
  // 处理用户响应
  const handleResponse = useCallback(async (type: 'visual' | 'audio') => {
    if (!engineRef.current || gameState !== GameState.TRAINING) return;
    
    const responseTime = Date.now();
    
    // 更新用户响应状态
    setUserResponses(prev => {
      const newResponses = { ...prev, [type]: true };
      
      // 提交响应到引擎
      engineRef.current?.handleResponse(
        type === 'visual' ? true : null,
        type === 'audio' ? true : null
      );
      
      return newResponses;
    });
    
    // 重置响应状态
    setTimeout(() => {
      setUserResponses(prev => ({ ...prev, [type]: false }));
    }, 200);
  }, [gameState]);
  
  // 检查成就
  const checkAchievements = useCallback((stats?: any): Achievement[] => {
    const achievements: Achievement[] = [];
    
    if (stats) {
      // 这里可以添加成就检查逻辑
      if (stats.accuracy >= 0.8 && stats.nLevel >= 3) {
        achievements.push({
          id: 'high-accuracy',
          title: t('nback.achievements.highAccuracy.name'),
          description: t('nback.achievements.highAccuracy.description'),
          type: AchievementType.CONSISTENCY,
          icon: Target,
          rarity: AchievementRarity.RARE,
          requirement: 80,
          points: 150,
          unlocked: true,
          unlockedAt: new Date(),
          progress: 100,
          category: 'accuracy'
        });
      }
    }
    
    return achievements;
  }, []);
  
  // 检查是否为首次使用
  useEffect(() => {
    const hasVisited = localStorage.getItem('nback-visited');
    if (!hasVisited) {
      setIsFirstTime(true);
      localStorage.setItem('nback-visited', 'true');
    }
  }, []);
  
  // 首次使用引导
  const handleFirstTimeGuidance = () => {
    setIsFirstTime(false);
    setShowGuidance(true);
  };
  
  // 暂停/恢复训练
  const togglePause = useCallback(async () => {
    if (gameState === GameState.TRAINING) {
      setGameState(GameState.PAUSED);
      await soundManager.playSystem('pause');
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    } else if (gameState === GameState.PAUSED) {
      setGameState(GameState.TRAINING);
      await soundManager.playSystem('resume');
      startTraining();
    }
  }, [gameState, startTraining, soundManager]);
  
  // 停止训练
  const stopTraining = useCallback(async () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setGameState(GameState.MENU);
    setCurrentStimulus(null);
    setUserResponses({ visual: false, audio: false });
    await soundManager.playSystem('complete');
  }, [soundManager]);
  
  // 渲染训练界面
  const renderTrainingInterface = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* 视觉刺激网格 */}
      {trainingConfig.enableVisual && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {GRID_POSITIONS.map((pos, index) => (
            <motion.div
              key={index}
              className={`w-20 h-20 rounded-lg border-2 transition-all duration-200 ${
                currentStimulus?.visualStimulus === index
                  ? 'bg-cyan-400 border-cyan-300 shadow-lg shadow-cyan-400/50'
                  : 'bg-gray-800/50 border-gray-600'
              }`}
              animate={{
                scale: currentStimulus?.visualStimulus === index ? 1.1 : 1,
                boxShadow: currentStimulus?.visualStimulus === index 
                  ? '0 0 20px rgba(34, 211, 238, 0.6)' 
                  : '0 0 0px rgba(34, 211, 238, 0)'
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      )}
      
      {/* 响应按钮 */}
      <div className="flex gap-6">
        {trainingConfig.enableVisual && (
          <motion.button
            onClick={() => handleResponse('visual')}
            className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
              userResponses.visual
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Target className="w-6 h-6 mr-2 inline" />
            {t('nback.training.visualMatch')}
          </motion.button>
        )}
        
        {trainingConfig.enableAudio && (
          <motion.button
            onClick={() => handleResponse('audio')}
            className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
              userResponses.audio
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                : 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Volume2 className="w-6 h-6 mr-2 inline" />
            {t('nback.training.audioMatch')}
          </motion.button>
        )}
      </div>
      
      {/* 训练控制 */}
      <div className="absolute top-4 right-4 flex gap-2">
        <motion.button
          onClick={togglePause}
          className="p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {gameState === GameState.PAUSED ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </motion.button>
        
        <motion.button
          onClick={stopTraining}
          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Square className="w-5 h-5" />
        </motion.button>
      </div>
      
      {/* 进度条 */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">{t('nback.training.progress')}</span>
            <span className="text-sm text-gray-300">
              {Math.round(((engineRef.current?.getCurrentTrial() || 0) / trainingConfig.sessionLength) * 100)}%
            </span>
          </div>
          <Progress 
            value={((engineRef.current?.getCurrentTrial() || 0) / trainingConfig.sessionLength) * 100} 
            className="h-2"
          />
        </div>
      </div>
    </div>
  );
  
  // 渲染主菜单
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-4">
          {t('nback.title')}
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          {t('nback.description')}
        </p>
      </motion.div>
      
      <div className="grid grid-cols-2 gap-6 max-w-4xl w-full">
        <motion.button
          onClick={startTraining}
          className="p-8 bg-gradient-to-br from-cyan-600 to-purple-700 rounded-xl text-white font-semibold text-xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play className="w-8 h-8 mx-auto mb-3" />
          {t('nback.menu.startTraining')}
        </motion.button>
        
        <motion.button
          onClick={() => setGameState(GameState.STATISTICS)}
          className="p-8 bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl text-white font-semibold text-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <TrendingUp className="w-8 h-8 mx-auto mb-3" />
          {t('nback.menu.statistics')}
        </motion.button>
        
        <motion.button
          onClick={() => setGameState(GameState.ACHIEVEMENTS)}
          className="p-8 bg-gradient-to-br from-pink-600 to-red-700 rounded-xl text-white font-semibold text-xl shadow-2xl hover:shadow-pink-500/25 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trophy className="w-8 h-8 mx-auto mb-3" />
          {t('nback.menu.achievements')}
        </motion.button>
        
        <motion.button
          onClick={() => setShowTrainingSettings(true)}
          className="p-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl text-white font-semibold text-xl shadow-2xl hover:shadow-gray-500/25 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Settings className="w-8 h-8 mx-auto mb-3" />
          {t('nback.menu.settings')}
        </motion.button>
        
        <motion.button
          onClick={() => setShowTutorial(true)}
          className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white font-semibold text-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <HelpCircle className="w-8 h-8 mx-auto mb-3" />
          {t('nback.menu.tutorial')}
        </motion.button>
        
        <motion.button
          onClick={() => setShowDemo(true)}
          className="p-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl text-white font-semibold text-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play className="w-8 h-8 mx-auto mb-3" />
          {t('nback.menu.demo')}
        </motion.button>
      </div>
    </div>
  );
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 主要内容 */}
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">
          {gameState === GameState.MENU && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full p-8"
            >
              {renderMenu()}
            </motion.div>
          )}
          
          {(gameState === GameState.TRAINING || gameState === GameState.PAUSED) && (
            <motion.div
              key="training"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full p-8"
            >
              {renderTrainingInterface()}
              {gameState === GameState.PAUSED && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-800 p-8 rounded-xl text-center"
                  >
                    <Pause className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white mb-4">{t('nback.training.paused')}</h2>
                    <button
                      onClick={togglePause}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                    >
                      {t('nback.training.resume')}
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
          
          {gameState === GameState.STATISTICS && (
            <motion.div
              key="statistics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full p-8"
            >
              <StatisticsPanel
                sessionStats={sessionStats}
                historicalStats={{
                  totalSessions: 0,
                  totalTrainingTime: 0,
                  averageAccuracy: 0,
                  bestAccuracy: 0,
                  averageReactionTime: 0,
                  bestReactionTime: 0,
                  highestLevel: 1,
                  totalScore: 0,
                  achievementsUnlocked: 0,
                  currentLevel: 1,
                  experiencePoints: 0,
                  nextLevelExp: 100
                }}
              />
              <button
                onClick={() => setGameState(GameState.MENU)}
                className="absolute top-4 left-4 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                <Home className="w-5 h-5" />
              </button>
            </motion.div>
          )}
          
          {gameState === GameState.ACHIEVEMENTS && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full p-8"
            >
              <AchievementSystem
                userStats={{
                  totalTrainingTime: sessionStats?.totalTime || 0,
                  trainingStreak: 1,
                  totalScore: sessionStats?.score || 0,
                  modulesCompleted: 1,
                  perfectScores: sessionStats?.accuracy === 1 ? 1 : 0,
                  averageAccuracy: sessionStats?.accuracy || 0,
                  fastestReaction: sessionStats?.reactionTime || 0,
                  socialInteractions: 0,
                  achievementsUnlocked: unlockedAchievements.length,
                  totalSessions: 1
                }}
                onAchievementUnlock={(achievement) => {
                  setUnlockedAchievements(prev => [...prev, achievement]);
                  setShowAchievement(achievement);
                }}
              />
              <button
                onClick={() => setGameState(GameState.MENU)}
                className="absolute top-4 left-4 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                <Home className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 成就解锁动画 */}
      <AnimatePresence>
        {showAchievement && (
          <AchievementUnlockAnimation
            achievement={showAchievement}
            isVisible={!!showAchievement}
            onClose={() => setShowAchievement(null)}
            onComplete={() => setShowAchievement(null)}
          />
        )}
      </AnimatePresence>
      
      {/* 训练设置对话框 */}
      <AnimatePresence>
        {showTrainingSettings && (
          <TrainingSettingsComponent
            config={trainingConfig}
            onConfigChange={setTrainingConfig}
          />
        )}
      </AnimatePresence>
      
      {/* 音频设置对话框 */}
      <AnimatePresence>
        {showAudioSettings && (
          <AudioSettingsComponent
            settings={audioSettings}
            onSettingsChange={setAudioSettings}
            onTestAudio={async (type, value) => {
              // 测试音频功能
              if (type === 'tone' && audioManagerRef.current) {
                await audioManagerRef.current.playTone(0, 0.5, audioSettings.tonesVolume);
              } else if (type === 'effect') {
                await soundManager.playSystem('start');
              }
            }}
          />
        )}
      </AnimatePresence>
      
      {/* 音效管理器 */}
      <SoundEffectManagerComponent 
        masterVolume={audioSettings.masterVolume}
        effectsVolume={audioSettings.effectsVolume}
        tonesVolume={audioSettings.tonesVolume}
        enableEffects={audioSettings.enableEffects}
        enableTones={audioSettings.enableTones}
        onVolumeChange={(type, volume) => {
          setAudioSettings(prev => ({
            ...prev,
            [`${type}Volume`]: volume
          }));
        }}
        onToggle={(type, enabled) => {
          setAudioSettings(prev => ({
            ...prev,
            [`enable${type.charAt(0).toUpperCase() + type.slice(1)}`]: enabled
          }));
        }}
      />
      
      {/* 音频测试面板 */}
      <AnimatePresence>
        {showAudioTest && (
          <AudioTestPanel
            onClose={() => setShowAudioTest(false)}
            audioManager={audioManagerRef.current || undefined}
            soundManager={soundManager}
          />
        )}
      </AnimatePresence>
      
      {/* 教程系统 */}
      <AnimatePresence>
        {showTutorial && (
          <TutorialSystem
            onClose={() => setShowTutorial(false)}
            onComplete={() => {
              setShowTutorial(false);
              // 可以在这里添加完成教程后的逻辑
            }}
          />
        )}
      </AnimatePresence>
      
      {/* 用户引导 */}
      <AnimatePresence>
        {showGuidance && (
          <UserGuidance
            isActive={true}
            onComplete={() => {
              setShowGuidance(false);
              // 可以在这里保存用户已完成引导的状态
            }}
            onSkip={() => setShowGuidance(false)}
          />
        )}
      </AnimatePresence>
      
      {/* 训练演示 */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{t('nback.demo.title')}</h2>
                <button
                  onClick={() => setShowDemo(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <DemoSelector
                    onSelect={setSelectedDemoSequence}
                  />
                </div>
                <div className="lg:col-span-2">
                  <InteractiveDemo
                    sequence={selectedDemoSequence}
                    autoPlay={false}
                    showControls={true}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 首次使用提示 */}
      <AnimatePresence>
        {isFirstTime && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-2xl p-8 max-w-md w-full border border-purple-500/30"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('nback.welcome.title')}</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {t('nback.welcome.description')}
                </p>
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setIsFirstTime(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('nback.welcome.skip')}
                  </motion.button>
                  <motion.button
                    onClick={handleFirstTimeGuidance}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('nback.welcome.startGuide')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}