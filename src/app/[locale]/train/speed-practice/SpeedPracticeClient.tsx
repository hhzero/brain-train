'use client'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

export default function SpeedPracticeClient() {
  const t = useTranslations('SpeedPractice')
  
  // 状态：idle=未开始，waiting=等待变色，ready=可点击，result=显示结果
  const [status, setStatus] = useState<'idle'|'waiting'|'ready'|'result'>('idle')
  const [message, setMessage] = useState(t('clickToStart'))
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [records, setRecords] = useState<number[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // 开始测试
  function start() {
    setStatus('waiting')
    setMessage(t('waitForColorChange'))
    setReactionTime(null)
    // 随机延迟1-3秒
    const delay = 1000 + Math.random() * 2000
    timerRef.current = setTimeout(() => {
      setStatus('ready')
      setMessage(t('clickNow'))
      startTimeRef.current = Date.now()
    }, delay)
  }

  // 点击方块
  function handleClick() {
    if (status === 'waiting') {
      // 误点
      if (timerRef.current) clearTimeout(timerRef.current)
      setStatus('idle')
      setMessage(t('tooFast'))
      setReactionTime(null)
    } else if (status === 'ready') {
      const rt = Date.now() - startTimeRef.current
      setReactionTime(rt)
      setRecords(rs => [...rs, rt])
      setStatus('result')
      setMessage(t('reactionTime', { time: rt }))
    }
  }

  // 再试一次
  function retry() {
    setStatus('idle')
    setMessage(t('clickToStart'))
    setReactionTime(null)
  }

  // 计算最快和平均反应时间
  const best = records.length ? Math.min(...records) : null
  const avg = records.length ? Math.round(records.reduce((a, b) => a + b, 0) / records.length) : null

  return (
    <main className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-cyan-600">{t('title')}</h1>
      <p className="mb-6 text-gray-500">{t('description')}</p>
      <div className="bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center gap-6">
        <div className="flex gap-8 mb-2">
          <div>{t('fastest')}：<span className="font-bold text-cyan-700 text-xl">{best ?? '-'}</span> ms</div>
          <div>{t('average')}：<span className="font-bold text-cyan-700 text-xl">{avg ?? '-'}</span> ms</div>
          <div>{t('attempts')}：<span className="font-bold text-cyan-700 text-xl">{records.length}</span></div>
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
            aria-label={t('gameAreaLabel')}
          >
            {status === 'idle' && t('waitingToStart')}
            {status === 'waiting' && t('waitingForColor')}
            {status === 'ready' && t('clickNow')}
            {status === 'result' && (reactionTime ? reactionTime + ' ms' : '—')}
          </div>
          <div className="text-gray-700 mt-2">{message}</div>
          {status !== 'waiting' && (
            <button className="bg-cyan-600 text-white px-6 py-2 rounded-md hover:bg-cyan-700 transition" onClick={status === 'result' ? retry : start}>
              {status === 'result' ? t('tryAgain') : t('startTest')}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}