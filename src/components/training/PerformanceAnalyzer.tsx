'use client';

import React, { useMemo } from 'react';
import { useTrainingStore } from '@/stores/training-store';
import { TrainingType, TrainingResult } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Zap, 
  Brain,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PerformanceAnalyzerProps {
  trainingType: TrainingType;
  className?: string;
}

interface PerformanceMetrics {
  averageAccuracy: number;
  averageReactionTime: number;
  averageScore: number;
  improvementRate: number;
  consistencyScore: number;
  strengthAreas: string[];
  weaknessAreas: string[];
  recommendations: string[];
}

const trainingTypeLabels = {
  gaze: '凝视训练',
  schulte: '舒尔特方格',
  'multi-attention': '多维注意力',
  'cognitive-flexibility': '认知灵活性'
};

export const PerformanceAnalyzer: React.FC<PerformanceAnalyzerProps> = ({
  trainingType,
  className = ''
}) => {
  const { trainingHistory, userProgress } = useTrainingStore();

  const typeHistory = useMemo(() => {
    return trainingHistory.filter(result => result.type === trainingType);
  }, [trainingHistory, trainingType]);

  const progress = userProgress[trainingType];

  const metrics = useMemo((): PerformanceMetrics => {
    if (typeHistory.length === 0) {
      return {
        averageAccuracy: 0,
        averageReactionTime: 0,
        averageScore: 0,
        improvementRate: 0,
        consistencyScore: 0,
        strengthAreas: [],
        weaknessAreas: [],
        recommendations: ['开始训练以获取性能分析']
      };
    }

    const recent = typeHistory.slice(-10); // 最近10次训练
    const older = typeHistory.slice(-20, -10); // 之前10次训练

    // 基础指标计算
    const avgAccuracy = recent.reduce((sum, r) => sum + r.accuracy, 0) / recent.length;
    const avgReactionTime = recent.reduce((sum, r) => sum + r.reactionTime, 0) / recent.length;
    const avgScore = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;

    // 改进率计算
    let improvementRate = 0;
    if (older.length > 0) {
      const oldAvgScore = older.reduce((sum, r) => sum + r.score, 0) / older.length;
      improvementRate = ((avgScore - oldAvgScore) / oldAvgScore) * 100;
    }

    // 一致性评分（基于标准差）
    const scoreMean = avgScore;
    const scoreVariance = recent.reduce((sum, r) => sum + Math.pow(r.score - scoreMean, 2), 0) / recent.length;
    const scoreStdDev = Math.sqrt(scoreVariance);
    const consistencyScore = Math.max(0, 100 - (scoreStdDev / scoreMean) * 100);

    // 优势和劣势分析
    const strengthAreas: string[] = [];
    const weaknessAreas: string[] = [];
    const recommendations: string[] = [];

    // 准确率分析
    if (avgAccuracy >= 90) {
      strengthAreas.push('准确率优秀');
    } else if (avgAccuracy < 70) {
      weaknessAreas.push('准确率需要提升');
      recommendations.push('建议降低训练难度，专注于准确性');
    }

    // 反应时间分析
    if (avgReactionTime <= 500) {
      strengthAreas.push('反应速度快');
    } else if (avgReactionTime > 1000) {
      weaknessAreas.push('反应速度较慢');
      recommendations.push('建议进行反应速度专项训练');
    }

    // 一致性分析
    if (consistencyScore >= 80) {
      strengthAreas.push('表现稳定');
    } else if (consistencyScore < 60) {
      weaknessAreas.push('表现不够稳定');
      recommendations.push('建议保持规律训练，提高稳定性');
    }

    // 改进趋势分析
    if (improvementRate > 10) {
      strengthAreas.push('进步明显');
    } else if (improvementRate < -5) {
      weaknessAreas.push('表现有所下降');
      recommendations.push('建议调整训练策略或适当休息');
    }

    // 训练类型特定建议
    switch (trainingType) {
      case 'gaze':
        if (avgAccuracy < 80) {
          recommendations.push('建议从静态凝视开始，逐步增加难度');
        }
        break;
      case 'schulte':
        if (avgReactionTime > 800) {
          recommendations.push('建议从小网格开始，提高数字识别速度');
        }
        break;
      case 'multi-attention':
        if (avgAccuracy < 75) {
          recommendations.push('建议先练习单一感官刺激，再进行多感官训练');
        }
        break;
      case 'cognitive-flexibility':
        if (avgReactionTime > 1200) {
          recommendations.push('建议加强任务切换练习，提高认知灵活性');
        }
        break;
    }

    return {
      averageAccuracy: Math.round(avgAccuracy),
      averageReactionTime: Math.round(avgReactionTime),
      averageScore: Math.round(avgScore),
      improvementRate: Math.round(improvementRate * 10) / 10,
      consistencyScore: Math.round(consistencyScore),
      strengthAreas,
      weaknessAreas,
      recommendations
    };
  }, [typeHistory, trainingType]);

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: '优秀', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { label: '良好', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 70) return { label: '中等', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 60) return { label: '及格', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: '需改进', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const accuracyLevel = getPerformanceLevel(metrics.averageAccuracy);
  const consistencyLevel = getPerformanceLevel(metrics.consistencyScore);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {trainingTypeLabels[trainingType]} - 性能分析
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="trends">趋势</TabsTrigger>
            <TabsTrigger value="recommendations">建议</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* 核心指标 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">平均准确率</span>
                  <Badge className={`${accuracyLevel.bg} ${accuracyLevel.color}`}>
                    {accuracyLevel.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={metrics.averageAccuracy} className="flex-1" />
                  <span className="text-sm font-medium">{metrics.averageAccuracy}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">表现稳定性</span>
                  <Badge className={`${consistencyLevel.bg} ${consistencyLevel.color}`}>
                    {consistencyLevel.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={metrics.consistencyScore} className="flex-1" />
                  <span className="text-sm font-medium">{metrics.consistencyScore}%</span>
                </div>
              </div>
            </div>

            {/* 详细数据 */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">{metrics.averageScore}</div>
                <div className="text-xs text-muted-foreground">平均得分</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{metrics.averageReactionTime}ms</div>
                <div className="text-xs text-muted-foreground">平均反应时间</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  {metrics.improvementRate > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : metrics.improvementRate < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-gray-400" />
                  )}
                  <span className={metrics.improvementRate > 0 ? 'text-green-600' : metrics.improvementRate < 0 ? 'text-red-600' : 'text-gray-600'}>
                    {metrics.improvementRate > 0 ? '+' : ''}{metrics.improvementRate}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">改进率</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            {/* 优势领域 */}
            {metrics.strengthAreas.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  优势领域
                </div>
                <div className="flex flex-wrap gap-2">
                  {metrics.strengthAreas.map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {strength}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 待改进领域 */}
            {metrics.weaknessAreas.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  待改进领域
                </div>
                <div className="flex flex-wrap gap-2">
                  {metrics.weaknessAreas.map((weakness, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {weakness}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 训练历史图表 */}
            {typeHistory.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">最近表现趋势</div>
                <div className="flex items-end gap-1 h-20 bg-muted p-2 rounded">
                  {typeHistory.slice(-15).map((result, index) => (
                    <motion.div
                      key={index}
                      className="bg-blue-500 rounded-t-sm min-w-[4px] flex-1"
                      style={{ height: `${(result.score / 100) * 100}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(result.score / 100) * 100}%` }}
                      transition={{ delay: index * 0.05 }}
                      title={`得分: ${result.score}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <Info className="h-4 w-4" />
                个性化建议
              </div>
              {metrics.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">{recommendation}</div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceAnalyzer;