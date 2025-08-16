'use client';

import React, { useEffect, useState } from 'react';
import { useTrainingStore } from '@/stores/training-store';
import { DifficultyLevel, TrainingType } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, TrendingDown, Target, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdaptiveDifficultySystemProps {
  trainingType: TrainingType;
  onDifficultyChange?: (difficulty: DifficultyLevel) => void;
}

const difficultyColors = {
  beginner: 'bg-green-500',
  intermediate: 'bg-blue-500',
  advanced: 'bg-yellow-500',
  expert: 'bg-orange-500',
  master: 'bg-red-500'
};

const difficultyLabels = {
  beginner: '初学者',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家',
  master: '大师'
};

export const AdaptiveDifficultySystem: React.FC<AdaptiveDifficultySystemProps> = ({
  trainingType,
  onDifficultyChange
}) => {
  const {
    adaptiveDifficulty,
    settings,
    updateSettings,
    getDifficultyRecommendation,
    adjustDifficulty
  } = useTrainingStore();

  const [showSettings, setShowSettings] = useState(false);
  const [tempThresholds, setTempThresholds] = useState({
    increase: 85,
    decrease: 60
  });

  const currentAdaptive = adaptiveDifficulty[trainingType];
  const currentDifficulty = currentAdaptive.currentDifficulty;
  const performanceHistory = currentAdaptive.performanceHistory;

  useEffect(() => {
    if (settings.adaptiveDifficultyEnabled) {
      const recommendedDifficulty = getDifficultyRecommendation(trainingType);
      onDifficultyChange?.(recommendedDifficulty);
    }
  }, [currentDifficulty, settings.adaptiveDifficultyEnabled]);

  useEffect(() => {
    setTempThresholds({
      increase: currentAdaptive.adjustmentThresholds.increaseThreshold,
      decrease: currentAdaptive.adjustmentThresholds.decreaseThreshold
    });
  }, [currentAdaptive.adjustmentThresholds]);

  const getPerformanceTrend = () => {
    if (performanceHistory.length < 2) return 'stable';
    
    const recent = performanceHistory.slice(-3);
    const avgRecent = recent.reduce((sum, p) => sum + p.accuracy, 0) / recent.length;
    const older = performanceHistory.slice(-6, -3);
    
    if (older.length === 0) return 'stable';
    
    const avgOlder = older.reduce((sum, p) => sum + p.accuracy, 0) / older.length;
    
    if (avgRecent > avgOlder + 5) return 'improving';
    if (avgRecent < avgOlder - 5) return 'declining';
    return 'stable';
  };

  const getProgressToNextLevel = () => {
    const difficultyLevels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
    const currentIndex = difficultyLevels.indexOf(currentDifficulty);
    
    if (currentIndex === difficultyLevels.length - 1) return 100; // 已达到最高级别
    
    const recentPerformance = performanceHistory.slice(-5);
    if (recentPerformance.length === 0) return 0;
    
    const avgAccuracy = recentPerformance.reduce((sum, p) => sum + p.accuracy, 0) / recentPerformance.length;
    const threshold = currentAdaptive.adjustmentThresholds.increaseThreshold;
    
    return Math.min(100, (avgAccuracy / threshold) * 100);
  };

  const handleThresholdUpdate = () => {
    // 这里应该更新 adaptiveDifficulty 的阈值
    // 由于当前 store 结构限制，我们暂时只关闭设置面板
    // TODO: 实现阈值更新逻辑
    setShowSettings(false);
  };

  const trend = getPerformanceTrend();
  const progressToNext = getProgressToNextLevel();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          智能难度调节
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="adaptive-mode"
              checked={settings.adaptiveDifficultyEnabled}
              onCheckedChange={(checked) => 
                updateSettings({ adaptiveDifficultyEnabled: checked })
              }
            />
            <Label htmlFor="adaptive-mode" className="text-xs">
              自动调节
            </Label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 当前难度显示 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${difficultyColors[currentDifficulty]} text-white`}
            >
              {difficultyLabels[currentDifficulty]}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {trend === 'improving' && <TrendingUp className="h-3 w-3 text-green-500" />}
              {trend === 'declining' && <TrendingDown className="h-3 w-3 text-red-500" />}
              {trend === 'stable' && <div className="h-3 w-3 rounded-full bg-gray-400" />}
              <span>
                {trend === 'improving' && '表现提升'}
                {trend === 'declining' && '表现下降'}
                {trend === 'stable' && '表现稳定'}
              </span>
            </div>
          </div>
        </div>

        {/* 升级进度 */}
        {currentDifficulty !== 'master' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>升级进度</span>
              <span>{Math.round(progressToNext)}%</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}

        {/* 性能历史图表 */}
        {performanceHistory.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium">最近表现</div>
            <div className="flex items-end gap-1 h-16">
              {performanceHistory.slice(-10).map((performance, index) => (
                <motion.div
                  key={index}
                  className="bg-blue-500 rounded-t-sm min-w-[8px] flex-1"
                  style={{ height: `${(performance.accuracy / 100) * 100}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(performance.accuracy / 100) * 100}%` }}
                  transition={{ delay: index * 0.1 }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* 设置面板 */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t pt-4"
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">提升难度阈值: {tempThresholds.increase}%</Label>
                  <Slider
                    value={[tempThresholds.increase]}
                    onValueChange={([value]) => 
                      setTempThresholds(prev => ({ ...prev, increase: value }))
                    }
                    max={100}
                    min={70}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">降低难度阈值: {tempThresholds.decrease}%</Label>
                  <Slider
                    value={[tempThresholds.decrease]}
                    onValueChange={([value]) => 
                      setTempThresholds(prev => ({ ...prev, decrease: value }))
                    }
                    max={80}
                    min={40}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={handleThresholdUpdate}>
                  应用设置
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowSettings(false)}
                >
                  取消
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 提示信息 */}
        {!settings.adaptiveDifficultyEnabled && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            💡 开启自动调节功能，系统将根据您的表现智能调整训练难度
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdaptiveDifficultySystem;