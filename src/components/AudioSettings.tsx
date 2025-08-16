'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Headphones, Settings, RotateCcw, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

// 音频设置接口 - 移除音乐相关功能，保留音效和音调
interface AudioSettings {
  masterVolume: number;
  effectsVolume: number;
  tonesVolume: number;
  enableEffects: boolean;
  enableTones: boolean;
  toneType: 'sine' | 'square' | 'triangle' | 'sawtooth';
  effectsType: 'digital' | 'organic' | 'minimal';
}

// 默认音频设置
const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  effectsVolume: 0.8,
  tonesVolume: 0.6,
  enableEffects: true,
  enableTones: true,
  toneType: 'sine',
  effectsType: 'digital'
};



interface AudioSettingsProps {
  settings: AudioSettings;
  onSettingsChange: (settings: AudioSettings) => void;
  onTestAudio?: (type: 'tone' | 'effect', value?: any) => void;
}

export const AudioSettingsComponent: React.FC<AudioSettingsProps> = ({
  settings,
  onSettingsChange,
  onTestAudio
}) => {
  const t = useTranslations('audioSettings');
  const [localSettings, setLocalSettings] = useState<AudioSettings>(settings);
  const [isTestingAudio, setIsTestingAudio] = useState<string | null>(null);

  // 音调类型选项
  const TONE_TYPES = [
    { value: 'sine', label: t('toneTypes.sine.label'), description: t('toneTypes.sine.description') },
    { value: 'square', label: t('toneTypes.square.label'), description: t('toneTypes.square.description') },
    { value: 'triangle', label: t('toneTypes.triangle.label'), description: t('toneTypes.triangle.description') },
    { value: 'sawtooth', label: t('toneTypes.sawtooth.label'), description: t('toneTypes.sawtooth.description') }
  ];

  // 音效类型选项
  const EFFECT_TYPES = [
    { value: 'digital', label: t('effectStyles.digital.label'), description: t('effectStyles.digital.description') },
    { value: 'organic', label: t('effectStyles.organic.label'), description: t('effectStyles.organic.description') },
    { value: 'minimal', label: t('effectStyles.minimal.label'), description: t('effectStyles.minimal.description') }
  ];

  // 同步设置变化
  useEffect(() => {
    onSettingsChange(localSettings);
  }, [localSettings, onSettingsChange]);

  // 更新设置
  const updateSetting = <K extends keyof AudioSettings>(
    key: K,
    value: AudioSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  // 重置设置
  const resetSettings = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  // 测试音频
  const testAudio = async (type: 'tone' | 'effect', value?: any) => {
    if (!onTestAudio) return;
    
    setIsTestingAudio(`${type}-${value || 'default'}`);
    onTestAudio(type, value);
    
    // 测试音频播放时间
    setTimeout(() => {
      setIsTestingAudio(null);
    }, 1000);
  };

  // 音量滑块组件
  const VolumeSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon: React.ReactNode;
    color: string;
    disabled?: boolean;
  }> = ({ label, value, onChange, icon, color, disabled = false }) => (
    <div className={`space-y-3 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-200">{label}</span>
        </div>
        <span className="text-sm text-gray-400">{Math.round(value * 100)}%</span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 100}%, #374151 ${value * 100}%, #374151 100%)`
          }}
        />
        
        {/* 滑块样式 */}
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
          
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${color};
            cursor: pointer;
            border: none;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 space-y-6 max-w-2xl mx-auto"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
        </div>
        
        <motion.button
          onClick={resetSettings}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-4 h-4" />
          {t('reset')}
        </motion.button>
      </div>

      {/* 主音量控制 */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <VolumeSlider
          label={t('masterVolume')}
          value={localSettings.masterVolume}
          onChange={(value) => updateSetting('masterVolume', value)}
          icon={localSettings.masterVolume > 0 ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          color="#06b6d4"
        />
      </div>

      {/* 音效设置 */}
      <div className="bg-gray-700/50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            {t('effectsSettings')}
          </h3>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.enableEffects}
              onChange={(e) => updateSetting('enableEffects', e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-12 h-6 rounded-full transition-colors ${
              localSettings.enableEffects ? 'bg-purple-500' : 'bg-gray-600'
            }`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                localSettings.enableEffects ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-sm text-gray-300">
              {localSettings.enableEffects ? t('enabled') : t('disabled')}
            </span>
          </label>
        </div>
        
        <VolumeSlider
          label={t('effectsVolume')}
          value={localSettings.effectsVolume}
          onChange={(value) => updateSetting('effectsVolume', value)}
          icon={<Zap className="w-5 h-5 text-purple-400" />}
          color="#a855f7"
          disabled={!localSettings.enableEffects}
        />
        
        {/* 音效类型选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">{t('effectsStyle')}</label>
          <div className="grid grid-cols-3 gap-2">
            {EFFECT_TYPES.map((type) => (
              <motion.button
                key={type.value}
                onClick={() => {
                  updateSetting('effectsType', type.value as any);
                  testAudio('effect', type.value);
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  localSettings.effectsType === type.value
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                } ${!localSettings.enableEffects ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!localSettings.enableEffects}
                whileHover={localSettings.enableEffects ? { scale: 1.02 } : {}}
                whileTap={localSettings.enableEffects ? { scale: 0.98 } : {}}
              >
                <div className="font-semibold">{type.label}</div>
                <div className="text-xs opacity-75">{type.description}</div>
                {isTestingAudio === `effect-${type.value}` && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* 音调设置 */}
      <div className="bg-gray-700/50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-pink-400" />
            {t('toneSettings')}
          </h3>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.enableTones}
              onChange={(e) => updateSetting('enableTones', e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-12 h-6 rounded-full transition-colors ${
              localSettings.enableTones ? 'bg-pink-500' : 'bg-gray-600'
            }`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                localSettings.enableTones ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-sm text-gray-300">
              {localSettings.enableTones ? t('enabled') : t('disabled')}
            </span>
          </label>
        </div>
        
        <VolumeSlider
          label={t('toneVolume')}
          value={localSettings.tonesVolume}
          onChange={(value) => updateSetting('tonesVolume', value)}
          icon={<Volume2 className="w-5 h-5 text-pink-400" />}
          color="#ec4899"
          disabled={!localSettings.enableTones}
        />
        
        {/* 音调类型选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">{t('toneType')}</label>
          <div className="grid grid-cols-2 gap-2">
            {TONE_TYPES.map((type) => (
              <motion.button
                key={type.value}
                onClick={() => {
                  updateSetting('toneType', type.value as any);
                  testAudio('tone', type.value);
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-all relative overflow-hidden ${
                  localSettings.toneType === type.value
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                } ${!localSettings.enableTones ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!localSettings.enableTones}
                whileHover={localSettings.enableTones ? { scale: 1.02 } : {}}
                whileTap={localSettings.enableTones ? { scale: 0.98 } : {}}
              >
                <div className="font-semibold">{type.label}</div>
                <div className="text-xs opacity-75">{type.description}</div>
                {isTestingAudio === `tone-${type.value}` && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* 测试按钮 */}
      <div className="flex gap-4">
        <motion.button
          onClick={() => testAudio('effect')}
          disabled={!localSettings.enableEffects}
          className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          whileHover={localSettings.enableEffects ? { scale: 1.02 } : {}}
          whileTap={localSettings.enableEffects ? { scale: 0.98 } : {}}
        >
          {t('audioSettings.testEffects')}
        </motion.button>
        
        <motion.button
          onClick={() => testAudio('tone')}
          disabled={!localSettings.enableTones}
          className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          whileHover={localSettings.enableTones ? { scale: 1.02 } : {}}
          whileTap={localSettings.enableTones ? { scale: 0.98 } : {}}
        >
          {t('audioSettings.testTones')}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AudioSettingsComponent;
export type { AudioSettings };