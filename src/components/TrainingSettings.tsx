'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Target, 
  Volume2, 
  Clock, 
  Zap, 
  Brain, 
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TrainingMode } from '../utils/DualNBackEngine';

// 训练配置接口
interface TrainingConfig {
  nLevel: number;
  mode: TrainingMode;
  sessionLength: number;
  enableAudio: boolean;
  enableVisual: boolean;
  stimulusDuration: number;
  intervalDuration: number;
  enableAdaptiveDifficulty: boolean;
  targetAccuracy: number;
  maxLevel: number;
  minLevel: number;
}

// 默认训练配置
const DEFAULT_CONFIG: TrainingConfig = {
  nLevel: 2,
  mode: TrainingMode.DUAL,
  sessionLength: 20,
  enableAudio: true,
  enableVisual: true,
  stimulusDuration: 500,
  intervalDuration: 2500,
  enableAdaptiveDifficulty: true,
  targetAccuracy: 0.8,
  maxLevel: 9,
  minLevel: 1
};

// 训练模式选项
const getTrainingModes = (t: any) => [
  {
    value: TrainingMode.DUAL,
    label: t('trainingSettings.modes.dual.label'),
    description: t('trainingSettings.modes.dual.description'),
    icon: Brain,
    color: 'from-purple-500 to-pink-500'
  },
  {
    value: TrainingMode.VISUAL_ONLY,
    label: t('trainingSettings.modes.visual.label'),
    description: t('trainingSettings.modes.visual.description'),
    icon: Target,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    value: TrainingMode.AUDIO_ONLY,
    label: t('trainingSettings.modes.audio.label'),
    description: t('trainingSettings.modes.audio.description'),
    icon: Volume2,
    color: 'from-pink-500 to-red-500'
  }
];

// 预设配置
const PRESET_CONFIGS = [
  {
    name: 'beginner',
    config: {
      ...DEFAULT_CONFIG,
      nLevel: 1,
      sessionLength: 15,
      stimulusDuration: 750,
      intervalDuration: 3000,
      targetAccuracy: 0.7
    }
  },
  {
    name: 'standard',
    config: DEFAULT_CONFIG
  },
  {
    name: 'challenge',
    config: {
      ...DEFAULT_CONFIG,
      nLevel: 3,
      sessionLength: 30,
      stimulusDuration: 400,
      intervalDuration: 2000,
      targetAccuracy: 0.85
    }
  },
  {
    name: 'expert',
    config: {
      ...DEFAULT_CONFIG,
      nLevel: 4,
      sessionLength: 40,
      stimulusDuration: 300,
      intervalDuration: 1500,
      targetAccuracy: 0.9
    }
  }
];

// 预设配置（带翻译）
const getPresetConfigs = (t: any) => [
  {
    name: t('trainingSettings.presets.beginner.name'),
    description: t('trainingSettings.presets.beginner.description'),
    config: PRESET_CONFIGS[0].config
  },
  {
    name: t('trainingSettings.presets.standard.name'),
    description: t('trainingSettings.presets.standard.description'),
    config: PRESET_CONFIGS[1].config
  },
  {
    name: t('trainingSettings.presets.challenge.name'),
    description: t('trainingSettings.presets.challenge.description'),
    config: PRESET_CONFIGS[2].config
  },
  {
    name: t('trainingSettings.presets.expert.name'),
    description: t('trainingSettings.presets.expert.description'),
    config: PRESET_CONFIGS[3].config
  }
];

interface TrainingSettingsProps {
  config: TrainingConfig;
  onConfigChange: (config: TrainingConfig) => void;
  onPresetSelect?: (preset: typeof PRESET_CONFIGS[0]) => void;
}

export const TrainingSettingsComponent: React.FC<TrainingSettingsProps> = ({
  config,
  onConfigChange,
  onPresetSelect
}) => {
  const t = useTranslations();
  const [localConfig, setLocalConfig] = useState<TrainingConfig>(config);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  const [selectedPreset, setSelectedPreset] = useState<string>(t('trainingSettings.presets.standard.name'));

  // 同步配置变化
  useEffect(() => {
    onConfigChange(localConfig);
  }, [localConfig, onConfigChange]);

  // 更新配置
  const updateConfig = <K extends keyof TrainingConfig>(
    key: K,
    value: TrainingConfig[K]
  ) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  // 重置配置
  const resetConfig = () => {
    setLocalConfig(DEFAULT_CONFIG);
    setSelectedPreset(t('trainingSettings.presets.standard.name'));
  };

  const TRAINING_MODES = getTrainingModes(t);
  const PRESET_CONFIGS_WITH_TRANSLATION = getPresetConfigs(t);

  // 应用预设
  const applyPreset = (preset: any) => {
    setLocalConfig(preset.config);
    setSelectedPreset(preset.name);
    if (onPresetSelect) {
      onPresetSelect(preset);
    }
  };

  // 切换展开状态
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // 数值滑块组件
  const NumberSlider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
    description?: string;
    color?: string;
  }> = ({ 
    label, 
    value, 
    min, 
    max, 
    step = 1, 
    unit = '', 
    onChange, 
    description,
    color = '#06b6d4'
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <label className="font-medium text-gray-200">{label}</label>
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
        </div>
        <span className="text-sm font-semibold text-white bg-gray-700 px-3 py-1 rounded-lg">
          {value}{unit}
        </span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
          }}
        />
        
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${color};
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
          }
          
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 0 15px ${color};
          }
        `}</style>
      </div>
    </div>
  );

  // 可折叠区域组件
  const CollapsibleSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    sectionKey: string;
  }> = ({ title, icon, children, sectionKey }) => {
    const isExpanded = expandedSections.has(sectionKey);
    
    return (
      <div className="bg-gray-700/50 rounded-lg overflow-hidden">
        <motion.button
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-600/50 transition-colors"
          whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
        >
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </motion.button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 space-y-6 max-w-4xl mx-auto"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{t('trainingSettings.title')}</h2>
        </div>
        
        <motion.button
          onClick={resetConfig}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-4 h-4" />
          {t('trainingSettings.reset')}
        </motion.button>
      </div>

      {/* 预设配置 */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          {t('trainingSettings.quickPresets')}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESET_CONFIGS_WITH_TRANSLATION.map((preset) => (
            <motion.button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={`p-4 rounded-lg text-left transition-all ${
                selectedPreset === preset.name
                  ? 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-semibold">{preset.name}</div>
              <div className="text-xs opacity-75 mt-1">{preset.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 基础设置 */}
      <CollapsibleSection
        title={t('trainingSettings.basicSettings')}
        icon={<Brain className="w-5 h-5 text-purple-400" />}
        sectionKey="basic"
      >
        {/* 训练模式选择 */}
        <div className="space-y-3">
          <label className="font-medium text-gray-200">{t('trainingSettings.trainingMode')}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TRAINING_MODES.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <motion.button
                  key={mode.value}
                  onClick={() => {
                    updateConfig('mode', mode.value);
                    updateConfig('enableVisual', mode.value !== TrainingMode.AUDIO_ONLY);
                    updateConfig('enableAudio', mode.value !== TrainingMode.VISUAL_ONLY);
                  }}
                  className={`p-4 rounded-lg text-left transition-all ${
                    localConfig.mode === mode.value
                      ? `bg-gradient-to-br ${mode.color} text-white shadow-lg`
                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="w-5 h-5" />
                    <span className="font-semibold">{mode.label}</span>
                  </div>
                  <p className="text-xs opacity-75">{mode.description}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
        
        {/* N-Back 等级 */}
        <NumberSlider
          label={t('trainingSettings.nLevel')}
          value={localConfig.nLevel}
          min={1}
          max={6}
          step={1}
          onChange={(value) => updateConfig('nLevel', value)}
          description={t('trainingSettings.nLevelDescription')}
        />
        
        {/* 会话长度 */}
        <NumberSlider
          label={t('trainingSettings.sessionLength')}
          value={localConfig.sessionLength}
          min={10}
          max={100}
          step={5}
          onChange={(value) => updateConfig('sessionLength', value)}
          description={t('trainingSettings.sessionLengthDescription')}
          unit={t('trainingSettings.timesUnit')}
        />
      </CollapsibleSection>

      {/* 时间设置 */}
      <CollapsibleSection
        title={t('trainingSettings.timingSettings')}
        icon={<Clock className="w-5 h-5 text-cyan-400" />}
        sectionKey="timing"
      >
        <NumberSlider
          label={t('trainingSettings.stimulusDuration')}
          value={localConfig.stimulusDuration}
          min={200}
          max={2000}
          step={50}
          unit="ms"
          onChange={(value) => updateConfig('stimulusDuration', value)}
          description={t('trainingSettings.stimulusDurationDescription')}
          color="#06b6d4"
        />
        
        <NumberSlider
          label={t('trainingSettings.intervalDuration')}
          value={localConfig.intervalDuration}
          min={1000}
          max={5000}
          step={100}
          unit="ms"
          onChange={(value) => updateConfig('intervalDuration', value)}
          description={t('trainingSettings.intervalDurationDescription')}
          color="#06b6d4"
        />
      </CollapsibleSection>

      {/* 自适应难度 */}
      <CollapsibleSection
        title={t('trainingSettings.adaptiveDifficulty')}
        icon={<Target className="w-5 h-5 text-green-400" />}
        sectionKey="adaptive"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="font-medium text-gray-200">{t('trainingSettings.enableAdaptive')}</label>
            <p className="text-xs text-gray-400">{t('trainingSettings.enableAdaptiveDescription')}</p>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localConfig.enableAdaptiveDifficulty}
              onChange={(e) => updateConfig('enableAdaptiveDifficulty', e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-12 h-6 rounded-full transition-colors ${
              localConfig.enableAdaptiveDifficulty ? 'bg-green-500' : 'bg-gray-600'
            }`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                localConfig.enableAdaptiveDifficulty ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
          </label>
        </div>
        
        {localConfig.enableAdaptiveDifficulty && (
          <>
            <NumberSlider
              label={t('trainingSettings.targetAccuracy')}
              value={localConfig.targetAccuracy}
              min={0.5}
              max={0.95}
              step={0.05}
              unit="%"
              onChange={(value) => updateConfig('targetAccuracy', value)}
              description={t('trainingSettings.targetAccuracyDescription')}
              color="#10b981"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <NumberSlider
                label={t('trainingSettings.minLevel')}
                value={localConfig.minLevel}
                min={1}
                max={localConfig.maxLevel - 1}
                onChange={(value) => updateConfig('minLevel', value)}
                color="#f59e0b"
              />
              
              <NumberSlider
                label={t('trainingSettings.maxLevel')}
                value={localConfig.maxLevel}
                min={localConfig.minLevel + 1}
                max={9}
                onChange={(value) => updateConfig('maxLevel', value)}
                color="#ef4444"
              />
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* 配置摘要 */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">{t('trainingSettings.currentConfigSummary')}</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-purple-400 font-semibold">{localConfig.nLevel}-Back</div>
            <div className="text-gray-400">{t('trainingSettings.trainingLevel')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-cyan-400 font-semibold">{localConfig.sessionLength}</div>
            <div className="text-gray-400">{t('trainingSettings.sessionLength')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-pink-400 font-semibold">{localConfig.stimulusDuration}ms</div>
            <div className="text-gray-400">{t('trainingSettings.stimulusTime')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-green-400 font-semibold">
              {TRAINING_MODES.find(m => m.value === localConfig.mode)?.label}
            </div>
            <div className="text-gray-400">{t('trainingSettings.trainingMode')}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrainingSettingsComponent;
export type { TrainingConfig };
export { TrainingMode, DEFAULT_CONFIG, PRESET_CONFIGS };