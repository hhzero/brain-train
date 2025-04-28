'use client'
import { useEffect, useState } from 'react'

// 颜色词和颜色值
const COLORS = [
  { word: '红', color: 'red' },
  { word: '黄', color: 'gold' },
  { word: '蓝', color: 'blue' },
  { word: '绿', color: 'green' }
]

function getRandomQuestion() {
  // 随机选择一个词和一个颜色，保证有时不一致
  const wordObj = COLORS[Math.floor(Math.random() * COLORS.length)]
  let colorObj = COLORS[Math.floor(Math.random() * COLORS.length)]
  // 50%概率让颜色和词不一致
  if (Math.random() < 0.5) {
    while (colorObj.color === wordObj.color) {
      colorObj = COLORS[Math.floor(Math.random() * COLORS.length)]
    }
  } else {
    colorObj = wordObj
  }
  return { word: wordObj.word, color: colorObj.color, answer: colorObj.word }
}

export default function ReadingEliminationClient() {
  const [question, setQuestion] = useState(getRandomQuestion())
  const [count, setCount] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [best, setBest] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // 计时器
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  // 开始训练
  function start() {
    setQuestion(getRandomQuestion())
    setCount(0)
    setCorrect(0)
    setTime(0)
    setRunning(true)
    setFeedback(null)
  }

  // 回答
  function answer(color: string) {
    if (!running) return
    setCount(c => c + 1)
    if (color === question.answer) {
      setCorrect(c => c + 1)
      setFeedback('正确！')
    } else {
      setFeedback('错误')
    }
    // 10题为一轮
    if (count + 1 >= 10) {
      setRunning(false)
      setBest(b => b === null ? correct + (color === question.answer ? 1 : 0) : Math.max(b, correct + (color === question.answer ? 1 : 0)))
    } else {
      setTimeout(() => {
        setQuestion(getRandomQuestion())
        setFeedback(null)
      }, 600)
    }
  }

  return (
    <main className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-cyan-600">消除音读</h1>
      <p className="mb-6 text-gray-500">消除音读（Stroop测试）是一种经典的注意力和认知灵活性训练，通过判断字体颜色而非文字内容，提升大脑的执行功能和抗干扰能力。</p>
      <div className="bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center gap-6">
        <div className="flex gap-8 mb-2">
          <div>题数：<span className="font-bold text-cyan-700 text-xl">{count}/10</span></div>
          <div>正确：<span className="font-bold text-cyan-700 text-xl">{correct}</span></div>
          <div>最佳：<span className="font-bold text-cyan-700 text-xl">{best ?? '-'}</span></div>
          <div>用时：<span className="font-bold text-cyan-700 text-xl">{time}s</span></div>
        </div>
        {running ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl font-extrabold tracking-widest mb-2" style={{ color: question.color, letterSpacing: '0.5em' }}>{question.word}</div>
            <div className="grid grid-cols-2 gap-4">
              {COLORS.map(c => (
                <button
                  key={c.color}
                  className={`w-24 h-12 rounded-lg text-lg font-bold border-2 transition-all
                    border-cyan-200 text-cyan-700 hover:bg-cyan-50`}
                  style={{ background: c.color }}
                  onClick={() => answer(c.word)}
                  aria-label={`选择颜色${c.word}`}
                >
                  {c.word}
                </button>
              ))}
            </div>
            {feedback && <div className={`font-bold text-lg ${feedback === '正确！' ? 'text-green-600' : 'text-red-500'}`}>{feedback}</div>}
          </div>
        ) : (
          <button className="bg-cyan-600 text-white px-6 py-2 rounded-md hover:bg-cyan-700 transition" onClick={start}>开始训练</button>
        )}
        {!running && best !== null && (
          <div className="text-green-600 font-bold text-lg mb-2">本轮正确数：{best} / 10</div>
        )}
      </div>
    </main>
  )
} 