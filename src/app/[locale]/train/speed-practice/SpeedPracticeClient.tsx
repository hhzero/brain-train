'use client'
import { useRef, useState } from 'react'

export default function SpeedPracticeClient() {
  // 状态：idle=未开始，waiting=等待变色，ready=可点击，result=显示结果
  const [status, setStatus] = useState<'idle'|'waiting'|'ready'|'result'>('idle')
  const [message, setMessage] = useState('点击下方按钮开始测试')
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [records, setRecords] = useState<number[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // 开始测试
  function start() {
    setStatus('waiting')
    setMessage('请等待方块变色...')
    setReactionTime(null)
    // 随机延迟1-3秒
    const delay = 1000 + Math.random() * 2000
    timerRef.current = setTimeout(() => {
      setStatus('ready')
      setMessage('快点！点击变色方块！')
      startTimeRef.current = Date.now()
    }, delay)
  }

  // 点击方块
  function handleClick() {
    if (status === 'waiting') {
      // 误点
      if (timerRef.current) clearTimeout(timerRef.current)
      setStatus('idle')
      setMessage('太快了！请等方块变色后再点击。')
      setReactionTime(null)
    } else if (status === 'ready') {
      const rt = Date.now() - startTimeRef.current
      setReactionTime(rt)
      setRecords(rs => [...rs, rt])
      setStatus('result')
      setMessage('反应时间：' + rt + ' 毫秒')
    }
  }

  // 再试一次
  function retry() {
    setStatus('idle')
    setMessage('点击下方按钮开始测试')
    setReactionTime(null)
  }

  // 计算最快和平均反应时间
  const best = records.length ? Math.min(...records) : null
  const avg = records.length ? Math.round(records.reduce((a, b) => a + b, 0) / records.length) : null

  return (
    <main className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-cyan-600">速度实战</h1>
      <p className="mb-6 text-gray-500">速度实战训练是一种提升反应速度和注意力集中的科学方法，通过快速点击变色方块，锻炼大脑的反应能力和专注力。</p>
      <div className="bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center gap-6">
        <div className="flex gap-8 mb-2">
          <div>最快：<span className="font-bold text-cyan-700 text-xl">{best ?? '-'}</span> ms</div>
          <div>平均：<span className="font-bold text-cyan-700 text-xl">{avg ?? '-'}</span> ms</div>
          <div>次数：<span className="font-bold text-cyan-700 text-xl">{records.length}</span></div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-48 h-32 rounded-xl flex items-center justify-center text-2xl font-bold cursor-pointer select-none transition-all
              ${status === 'idle' ? 'bg-cyan-200 text-cyan-700' :
                status === 'waiting' ? 'bg-gray-300 text-gray-400 animate-pulse' :
                status === 'ready' ? 'bg-cyan-600 text-white animate-pulse' :
                status === 'result' ? 'bg-green-400 text-white' : ''}`}
            onClick={handleClick}
            tabIndex={0}
            aria-label="反应速度测试区块"
          >
            {status === 'idle' && '等待开始'}
            {status === 'waiting' && '等待变色...'}
            {status === 'ready' && '点击！'}
            {status === 'result' && (reactionTime ? reactionTime + ' ms' : '—')}
          </div>
          <div className="text-gray-700 mt-2">{message}</div>
          {status !== 'waiting' && (
            <button className="bg-cyan-600 text-white px-6 py-2 rounded-md hover:bg-cyan-700 transition" onClick={status === 'result' ? retry : start}>
              {status === 'result' ? '再试一次' : '开始测试'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
} 