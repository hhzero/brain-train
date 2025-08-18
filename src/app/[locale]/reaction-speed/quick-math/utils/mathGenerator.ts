import { Difficulty } from '../page'

/**
 * 算术题目接口
 */
export interface MathProblem {
  id: string
  expression: string  // 显示的表达式，如 "12 + 8"
  answer: number      // 正确答案
  difficulty: Difficulty
  createdAt: number   // 创建时间戳
}

/**
 * 根据难度等级生成随机数范围
 */
const getNumberRange = (difficulty: Difficulty): { min: number; max: number } => {
  switch (difficulty) {
    case 'easy':
      return { min: 1, max: 20 }
    case 'medium':
      return { min: 50, max: 1000 }
    case 'hard':
      return { min: 1000, max: 5000 }
    default:
      return { min: 1, max: 20 }
  }
}

/**
 * 生成指定范围内的随机整数
 */
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成简单难度的算术题目（20以内加减法）
 */
const generateEasyProblem = (): MathProblem => {
  const operations = ['+', '-']
  const operation = operations[Math.floor(Math.random() * operations.length)]
  
  let num1: number
  let num2: number
  let answer: number
  
  if (operation === '+') {
    // 加法：确保结果不超过20
    num1 = getRandomInt(1, 15)
    num2 = getRandomInt(1, 20 - num1)
    answer = num1 + num2
  } else {
    // 减法：确保结果为正数
    num1 = getRandomInt(10, 20)
    num2 = getRandomInt(1, num1 - 1)
    answer = num1 - num2
  }
  
  // 有时生成三个数的运算
  if (Math.random() < 0.3) {
    const operation2 = operations[Math.floor(Math.random() * operations.length)]
    let num3: number
    
    if (operation2 === '+') {
      num3 = getRandomInt(1, Math.min(5, 20 - answer))
      answer += num3
    } else {
      num3 = getRandomInt(1, Math.min(5, answer - 1))
      answer -= num3
    }
    
    return {
      id: `easy_${Date.now()}_${Math.random()}`,
      expression: `${num1} ${operation} ${num2} ${operation2} ${num3}`,
      answer,
      difficulty: 'easy',
      createdAt: Date.now()
    }
  }
  
  return {
    id: `easy_${Date.now()}_${Math.random()}`,
    expression: `${num1} ${operation} ${num2}`,
    answer,
    difficulty: 'easy',
    createdAt: Date.now()
  }
}

/**
 * 生成中等难度的算术题目（50-1000加减法）
 */
const generateMediumProblem = (): MathProblem => {
  const operations = ['+', '-']
  const operation = operations[Math.floor(Math.random() * operations.length)]
  
  let num1: number
  let num2: number
  let answer: number
  
  if (operation === '+') {
    num1 = getRandomInt(50, 500)
    num2 = getRandomInt(50, 1000 - num1)
    answer = num1 + num2
  } else {
    num1 = getRandomInt(200, 1000)
    num2 = getRandomInt(50, num1 - 50)
    answer = num1 - num2
  }
  
  // 有时生成三个数的运算
  if (Math.random() < 0.4) {
    const operation2 = operations[Math.floor(Math.random() * operations.length)]
    let num3: number
    
    if (operation2 === '+') {
      num3 = getRandomInt(50, Math.min(300, 1500 - answer))
      answer += num3
    } else {
      num3 = getRandomInt(50, Math.min(300, answer - 50))
      answer -= num3
    }
    
    return {
      id: `medium_${Date.now()}_${Math.random()}`,
      expression: `${num1} ${operation} ${num2} ${operation2} ${num3}`,
      answer,
      difficulty: 'medium',
      createdAt: Date.now()
    }
  }
  
  return {
    id: `medium_${Date.now()}_${Math.random()}`,
    expression: `${num1} ${operation} ${num2}`,
    answer,
    difficulty: 'medium',
    createdAt: Date.now()
  }
}

/**
 * 生成困难难度的算术题目（1000以上加减法）
 */
const generateHardProblem = (): MathProblem => {
  const operations = ['+', '-']
  const operation = operations[Math.floor(Math.random() * operations.length)]
  
  let num1: number
  let num2: number
  let answer: number
  
  if (operation === '+') {
    num1 = getRandomInt(1000, 3000)
    num2 = getRandomInt(500, 2000)
    answer = num1 + num2
  } else {
    num1 = getRandomInt(2000, 5000)
    num2 = getRandomInt(500, num1 - 500)
    answer = num1 - num2
  }
  
  // 有时生成三个数的运算
  if (Math.random() < 0.5) {
    const operation2 = operations[Math.floor(Math.random() * operations.length)]
    let num3: number
    
    if (operation2 === '+') {
      num3 = getRandomInt(200, 1000)
      answer += num3
    } else {
      num3 = getRandomInt(200, Math.min(1000, answer - 200))
      answer -= num3
    }
    
    return {
      id: `hard_${Date.now()}_${Math.random()}`,
      expression: `${num1} ${operation} ${num2} ${operation2} ${num3}`,
      answer,
      difficulty: 'hard',
      createdAt: Date.now()
    }
  }
  
  return {
    id: `hard_${Date.now()}_${Math.random()}`,
    expression: `${num1} ${operation} ${num2}`,
    answer,
    difficulty: 'hard',
    createdAt: Date.now()
  }
}

// 用于存储最近生成的题目表达式，避免短时间内重复
const recentExpressions = new Map<Difficulty, Set<string>>()
const MAX_RECENT_EXPRESSIONS = 20 // 每个难度级别最多记录20个最近的表达式

/**
 * 清理过期的表达式记录
 */
const cleanupRecentExpressions = (difficulty: Difficulty) => {
  if (!recentExpressions.has(difficulty)) {
    recentExpressions.set(difficulty, new Set())
  }
  
  const expressions = recentExpressions.get(difficulty)!
  if (expressions.size > MAX_RECENT_EXPRESSIONS) {
    // 清理一半的记录，保持集合大小合理
    const expressionsArray = Array.from(expressions)
    expressions.clear()
    // 保留后一半的表达式
    expressionsArray.slice(Math.floor(expressionsArray.length / 2)).forEach(expr => {
      expressions.add(expr)
    })
  }
}

/**
 * 根据难度等级生成算术题目（带防重复逻辑）
 */
export const generateMathProblem = (difficulty: Difficulty, excludeExpressions: string[] = []): MathProblem => {
  cleanupRecentExpressions(difficulty)
  
  const recentExprs = recentExpressions.get(difficulty)!
  const allExcluded = new Set([...excludeExpressions, ...Array.from(recentExprs)])
  
  let problem: MathProblem
  let attempts = 0
  const maxAttempts = 50 // 增加最大尝试次数
  
  do {
    switch (difficulty) {
      case 'easy':
        problem = generateEasyProblem()
        break
      case 'medium':
        problem = generateMediumProblem()
        break
      case 'hard':
        problem = generateHardProblem()
        break
      default:
        problem = generateEasyProblem()
    }
    attempts++
  } while (allExcluded.has(problem.expression) && attempts < maxAttempts)
  
  // 记录新生成的表达式
  recentExprs.add(problem.expression)
  
  return problem
}

/**
 * 生成指定数量的数学题目（防重复）
 * @param count 题目数量
 * @param difficulty 难度级别
 * @returns 数学题目数组
 */
export function generateMathProblems(count: number, difficulty: Difficulty): MathProblem[] {
  const problems: MathProblem[] = []
  const usedExpressions = new Set<string>() // 用于记录已生成的表达式
  
  let attempts = 0
  const maxAttempts = count * 10 // 最大尝试次数，避免无限循环
  
  while (problems.length < count && attempts < maxAttempts) {
    const problem = generateMathProblem(difficulty)
    
    // 检查表达式是否已存在
    if (!usedExpressions.has(problem.expression)) {
      usedExpressions.add(problem.expression)
      problems.push(problem)
    }
    
    attempts++
  }
  
  // 如果无法生成足够的不重复题目，填充剩余数量
  while (problems.length < count) {
    problems.push(generateMathProblem(difficulty))
  }
  
  return problems
}