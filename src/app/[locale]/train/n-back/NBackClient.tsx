'use client'
import { useState } from 'react'

export default function NBackClient() {
  // n-back demo: 随机数字n-back，n=2
  const [sequence, setSequence] = useState<number[]>([])
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const n = 2

  function next() {
    setSequence(seq => [...seq, Math.floor(Math.random() * 9) + 1])
    setInput('')
    setResult(null)
  }
  function check() {
    if (sequence.length < n) {
      setResult('请先生成足够的数字')
      return
    }
    if (parseInt(input) === sequence[sequence.length - n]) {
      setResult('回答正确！')
    } else {
      setResult('回答错误')
    }
  }

  return (
    <main className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-cyan-600">n-back 训练</h1>
      <p className="mb-6 text-gray-500">n-back 训练是一种经典的工作记忆训练方法，通过回忆 n 步之前出现的内容，提升大脑的工作记忆力和专注力。</p>
      <div className="bg-white/80 rounded-xl shadow-lg p-6 flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <span className="text-lg font-semibold">序列：</span>
          <span className="tracking-widest text-xl">{sequence.join(' ')}</span>
        </div>
        <button className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition" onClick={next}>生成下一个数字</button>
        <div className="flex gap-2 items-center">
          <label htmlFor="nback-input" className="text-gray-700">{n}步前的数字：</label>
          <input id="nback-input" className="border rounded px-2 py-1 w-16" value={input} onChange={e => setInput(e.target.value)} />
          <button className="bg-cyan-600 text-white px-3 py-1 rounded hover:bg-cyan-700" onClick={check}>提交</button>
        </div>
        {result && <div className="text-cyan-700 font-bold">{result}</div>}
      </div>
    </main>
  )
} 