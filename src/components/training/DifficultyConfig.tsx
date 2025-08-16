'use client';

import React from 'react';
import { DifficultyLevel, TrainingType } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Target, Zap, Brain } from 'lucide-react';

interface DifficultyConfigProps {
  trainingType: TrainingType;
  difficulty: DifficultyLevel;
}

// 不同训练类型的难度配置
const difficultyConfigs = {
  gaze: {
    beginner: {
      duration: 30,
      distractorCount: 0,
      targetSize: 'large',
      movementSpeed: 'slow',
      description: '30秒静态凝视，无干扰'
    },
    intermediate: {
      duration: 45,
      distractorCount: 2,
      targetSize: 'medium',
      movementSpeed: 'medium',
      description: '45秒凝视，轻微干扰'
    },
    advanced: {
      duration: 60,
      distractorCount: 4,
      targetSize: 'small',
      movementSpeed: 'fast',
      description: '60秒凝视，中等干扰'
    },
    expert: {
      duration: 90,
      distractorCount: 6,
      targetSize: 'small',
      movementSpeed: 'fast',
      description: '90秒凝视，强干扰'
    },
    master: {
      duration: 120,
      distractorCount: 8,
      targetSize: 'tiny',
      movementSpeed: 'very-fast',
      description: '120秒凝视，极强干扰'
    }
  },
  schulte: {
    beginner: {
      gridSize: '3x3',
      timeLimit: 60,
      mode: 'sequential',
      highlightEnabled: true,
      description: '3×3网格，顺序模式，60秒'
    },
    intermediate: {
      gridSize: '4x4',
      timeLimit: 90,
      mode: 'sequential',
      highlightEnabled: true,
      description: '4×4网格，顺序模式，90秒'
    },
    advanced: {
      gridSize: '5x5',
      timeLimit: 120,
      mode: 'sequential',
      highlightEnabled: false,
      description: '5×5网格，顺序模式，120秒'
    },
    expert: {
      gridSize: '6x6',
      timeLimit: 150,
      mode: 'random',
      highlightEnabled: false,
      description: '6×6网格，随机模式，150秒'
    },
    master: {
      gridSize: '7x7',
      timeLimit: 180,
      mode: 'reverse',
      highlightEnabled: false,
      description: '7×7网格，逆序模式，180秒'
    }
  },
  'multi-attention': {
    beginner: {
      stimuliCount: 2,
      modalityCount: 1,
      switchFrequency: 'low',
      timeLimit: 60,
      description: '单感官，2个刺激，低切换频率'
    },
    intermediate: {
      stimuliCount: 3,
      modalityCount: 2,
      switchFrequency: 'medium',
      timeLimit: 90,
      description: '双感官，3个刺激，中等切换频率'
    },
    advanced: {
      stimuliCount: 4,
      modalityCount: 2,
      switchFrequency: 'high',
      timeLimit: 120,
      description: '双感官，4个刺激，高切换频率'
    },
    expert: {
      stimuliCount: 5,
      modalityCount: 3,
      switchFrequency: 'high',
      timeLimit: 150,
      description: '三感官，5个刺激，高切换频率'
    },
    master: {
      stimuliCount: 6,
      modalityCount: 3,
      switchFrequency: 'very-high',
      timeLimit: 180,
      description: '三感官，6个刺激，极高切换频率'
    }
  },
  'cognitive-flexibility': {
    beginner: {
      taskTypes: 1,
      switchFrequency: 'low',
      contextComplexity: 'simple',
      timeLimit: 60,
      description: '单任务类型，简单情境，低切换频率'
    },
    intermediate: {
      taskTypes: 2,
      switchFrequency: 'medium',
      contextComplexity: 'medium',
      timeLimit: 90,
      description: '双任务类型，中等情境，中等切换频率'
    },
    advanced: {
      taskTypes: 3,
      switchFrequency: 'high',
      contextComplexity: 'medium',
      timeLimit: 120,
      description: '三任务类型，中等情境，高切换频率'
    },
    expert: {
      taskTypes: 4,
      switchFrequency: 'high',
      contextComplexity: 'complex',
      timeLimit: 150,
      description: '四任务类型，复杂情境，高切换频率'
    },
    master: {
      taskTypes: 5,
      switchFrequency: 'very-high',
      contextComplexity: 'very-complex',
      timeLimit: 180,
      description: '五任务类型，极复杂情境，极高切换频率'
    }
  }
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-blue-100 text-blue-800 border-blue-200',
  advanced: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  expert: 'bg-orange-100 text-orange-800 border-orange-200',
  master: 'bg-red-100 text-red-800 border-red-200'
};

const difficultyLabels = {
  beginner: '初学者',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家',
  master: '大师'
};

const trainingIcons = {
  gaze: Target,
  schulte: Brain,
  'multi-attention': Zap,
  'cognitive-flexibility': Clock
};

export const DifficultyConfig: React.FC<DifficultyConfigProps> = ({
  trainingType,
  difficulty
}) => {
  const config = difficultyConfigs[trainingType][difficulty];
  const Icon = trainingIcons[trainingType];

  const renderConfigDetails = () => {
    switch (trainingType) {
      case 'gaze': {
        const gazeConfig = config as any;
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">训练时长</div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {gazeConfig.duration}秒
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">干扰数量</div>
              <div>{gazeConfig.distractorCount}个</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">目标大小</div>
              <div>{gazeConfig.targetSize}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">移动速度</div>
              <div>{gazeConfig.movementSpeed}</div>
            </div>
          </div>
        );
      }
      
      case 'schulte': {
        const schulteConfig = config as any;
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">网格规格</div>
              <div>{schulteConfig.gridSize}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">时间限制</div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {schulteConfig.timeLimit}秒
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">训练模式</div>
              <div>{schulteConfig.mode}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">高亮提示</div>
              <div>{schulteConfig.highlightEnabled ? '开启' : '关闭'}</div>
            </div>
          </div>
        );
      }
      
      case 'multi-attention': {
        const multiConfig = config as any;
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">刺激数量</div>
              <div>{multiConfig.stimuliCount}个</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">感官模态</div>
              <div>{multiConfig.modalityCount}种</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">切换频率</div>
              <div>{multiConfig.switchFrequency}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">时间限制</div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {multiConfig.timeLimit}秒
              </div>
            </div>
          </div>
        );
      }
      
      case 'cognitive-flexibility': {
        const cognitiveConfig = config as any;
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">任务类型</div>
              <div>{cognitiveConfig.taskTypes}种</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">切换频率</div>
              <div>{cognitiveConfig.switchFrequency}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">情境复杂度</div>
              <div>{cognitiveConfig.contextComplexity}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">时间限制</div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {cognitiveConfig.timeLimit}秒
              </div>
            </div>
          </div>
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4" />
          难度配置
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 难度等级显示 */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`${difficultyColors[difficulty]} border`}
          >
            {difficultyLabels[difficulty]}
          </Badge>
        </div>

        {/* 配置描述 */}
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          {config.description}
        </div>

        <Separator />

        {/* 详细配置参数 */}
        {renderConfigDetails()}
      </CardContent>
    </Card>
  );
};

export default DifficultyConfig;

// 导出配置获取函数
export const getDifficultyConfig = (trainingType: TrainingType, difficulty: DifficultyLevel) => {
  return difficultyConfigs[trainingType][difficulty];
};

// 导出所有难度级别
export const getAllDifficultyLevels = (): DifficultyLevel[] => {
  return ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
};

// 获取下一个难度级别
export const getNextDifficultyLevel = (current: DifficultyLevel): DifficultyLevel | null => {
  const levels = getAllDifficultyLevels();
  const currentIndex = levels.indexOf(current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};

// 获取上一个难度级别
export const getPreviousDifficultyLevel = (current: DifficultyLevel): DifficultyLevel | null => {
  const levels = getAllDifficultyLevels();
  const currentIndex = levels.indexOf(current);
  return currentIndex > 0 ? levels[currentIndex - 1] : null;
};