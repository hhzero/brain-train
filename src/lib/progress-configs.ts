// 进度配置相关的工具函数和常量

export interface ProgressConfig {
  id: string
  name: string
  description: string
  totalSteps: number
  currentStep: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // 分钟
  category: string
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan'
}

export interface TrainingProgress {
  sessionId: string
  moduleId: string
  startTime: Date
  endTime?: Date
  score: number
  accuracy: number
  completionRate: number
  timeSpent: number // 秒
  mistakes: number
  improvements: string[]
}

// 获取进度配置（接受翻译函数参数）
export const getProgressConfigs = (t?: (key: string) => string): Record<string, ProgressConfig> => ({
  'attention-multidimensional': {
    id: 'attention-multidimensional',
    name: t ? t('progressConfigs.attentionMultidimensional.name') : '多维注意力训练',
    description: t ? t('progressConfigs.attentionMultidimensional.description') : '提升多维度注意力集中能力',
    totalSteps: 10,
    currentStep: 0,
    difficulty: 'intermediate',
    estimatedTime: 15,
    category: 'attention',
    color: 'blue'
  },
  'cognitive-flexibility': {
    id: 'cognitive-flexibility',
    name: t ? t('progressConfigs.cognitiveFlexibility.name') : '认知灵活性训练',
    description: t ? t('progressConfigs.cognitiveFlexibility.description') : '增强思维转换和适应能力',
    totalSteps: 8,
    currentStep: 0,
    difficulty: 'advanced',
    estimatedTime: 20,
    category: 'cognitive',
    color: 'purple'
  },
  'emotion-management': {
    id: 'emotion-management',
    name: t ? t('progressConfigs.emotionManagement.name') : '情绪管理训练',
    description: t ? t('progressConfigs.emotionManagement.description') : '学习情绪调节和管理技巧',
    totalSteps: 12,
    currentStep: 0,
    difficulty: 'beginner',
    estimatedTime: 25,
    category: 'emotion',
    color: 'green'
  }
});

// 默认进度配置（向后兼容）
export const defaultProgressConfigs = getProgressConfigs();

// 兼容性导出
export const progressConfigs = defaultProgressConfigs

// 兼容性配置（使用国际化版本）
const configs = getProgressConfigs();

// 计算进度百分比
export function calculateProgress(config: ProgressConfig): number {
  return Math.round((config.currentStep / config.totalSteps) * 100)
}

// 获取进度状态
export function getProgressStatus(config: ProgressConfig): 'not-started' | 'in-progress' | 'completed' {
  if (config.currentStep === 0) return 'not-started'
  if (config.currentStep >= config.totalSteps) return 'completed'
  return 'in-progress'
}

// 获取难度颜色
export function getDifficultyColor(difficulty: ProgressConfig['difficulty']): string {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-400 bg-green-400/10'
    case 'intermediate':
      return 'text-yellow-400 bg-yellow-400/10'
    case 'advanced':
      return 'text-red-400 bg-red-400/10'
    default:
      return 'text-gray-400 bg-gray-400/10'
  }
}

// 格式化时间
export function formatTime(minutes: number, t?: (key: string, params?: any) => string): string {
  if (minutes < 60) {
    return t ? t('common.time.minutes', { count: minutes }) : `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes > 0) {
    return t ? t('common.time.hoursAndMinutes', { hours, minutes: remainingMinutes }) : `${hours}小时${remainingMinutes}分钟`
  } else {
    return t ? t('common.time.hours', { count: hours }) : `${hours}小时`
  }
}

// 计算训练统计
export function calculateTrainingStats(progressList: TrainingProgress[]) {
  const totalSessions = progressList.length
  const completedSessions = progressList.filter(p => p.completionRate >= 100).length
  const averageScore = progressList.reduce((sum, p) => sum + p.score, 0) / totalSessions || 0
  const averageAccuracy = progressList.reduce((sum, p) => sum + p.accuracy, 0) / totalSessions || 0
  const totalTimeSpent = progressList.reduce((sum, p) => sum + p.timeSpent, 0)

  return {
    totalSessions,
    completedSessions,
    averageScore: Math.round(averageScore),
    averageAccuracy: Math.round(averageAccuracy),
    totalTimeSpent: Math.round(totalTimeSpent / 60), // 转换为分钟
    completionRate: Math.round((completedSessions / totalSessions) * 100) || 0
  }
}

// 生成进度报告
export function generateProgressReport(config: ProgressConfig, progressList: TrainingProgress[]) {
  const stats = calculateTrainingStats(progressList)
  const progressPercentage = calculateProgress(config)
  const status = getProgressStatus(config)

  return {
    config,
    stats,
    progressPercentage,
    status,
    nextStep: config.currentStep + 1,
    remainingSteps: config.totalSteps - config.currentStep,
    estimatedTimeToComplete: (config.totalSteps - config.currentStep) * (config.estimatedTime / config.totalSteps)
  }
}