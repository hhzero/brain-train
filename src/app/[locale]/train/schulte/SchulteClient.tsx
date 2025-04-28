'use client'
import { useEffect, useState } from 'react'

// 洗牌算法，生成乱序数组
function shuffle(arr: number[]) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function SchulteClient() {
  const [grid, setGrid] = useState<number[]>([])
  const [current, setCurrent] = useState(1)
  const [time, setTime] = useState(0)
  const [best, setBest] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  // 开始训练，初始化状态
  function start() {
    setGrid(shuffle([1,2,3,4,5,6,7,8,9]))
    setCurrent(1)
    setTime(0)
    setRunning(true)
    setFinished(false)
  }

  // 计时器
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  // 点击格子
  function clickCell(num: number) {
    if (!running || finished) return
    if (num === current) {
      if (current === 9) {
        setRunning(false)
        setFinished(true)
        setBest(b => b === null ? time + 1 : Math.min(b, time + 1))
      }
      setCurrent(c => c + 1)
    }
  }

  return (
    <main className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-cyan-600">舒尔特方格</h1>
      <p className="mb-6 text-gray-500">舒尔特方格训练是一种经典的专注力和视觉搜索训练方法，通过顺序点击数字，提升注意力集中和反应速度。</p>
      <div className="bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center gap-6">
        <div className="flex gap-8 mb-2">
          <div>用时：<span className="font-bold text-cyan-700 text-xl">{running ? time : finished ? time : 0}s</span></div>
          <div>最佳：<span className="font-bold text-cyan-700 text-xl">{best ?? '-'}</span></div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {grid.map((num, i) => (
            <button
              key={num}
              className={`w-16 h-16 rounded-lg text-2xl font-bold border-2 transition-all
                ${num < current ? 'bg-cyan-100 border-cyan-200 text-gray-400' :
                  num === current ? 'bg-cyan-600 border-cyan-700 text-white animate-pulse' :
                  'bg-white border-cyan-200 text-cyan-700 hover:bg-cyan-50'}`}
              onClick={() => clickCell(num)}
              disabled={num < current || finished}
              aria-label={`数字${num}`}
            >
              {num}
            </button>
          ))}
        </div>
        {!running && !finished && (
          <button className="bg-cyan-600 text-white px-6 py-2 rounded-md hover:bg-cyan-700 transition" onClick={start}>开始训练</button>
        )}
        {finished && (
          <div className="text-green-600 font-bold text-lg mb-2">完成！用时 {time + 1} 秒</div>
        )}
      </div>
    </main>
  )
} 