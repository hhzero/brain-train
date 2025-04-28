'use client'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

export default function GazeClient() {
  const t = useTranslations('gaze')
  const [isFocusing, setIsFocusing] = useState(false)
  const [time, setTime] = useState(0)
  const [best, setBest] = useState(0)
  const [interrupted, setInterrupted] = useState(false)
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isFocusing) {
      timer.current = setInterval(() => setTime(t => t + 1), 1000)
    } else if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [isFocusing])

  function start() {
    setIsFocusing(true)
    setTime(0)
    setInterrupted(false)
  }
  function stop() {
    setIsFocusing(false)
    setInterrupted(true)
    setBest(b => Math.max(b, time))
  }

  // 干扰动画：每隔一段时间在屏幕随机位置闪现小圆点
  const [distract, setDistract] = useState<{x: number, y: number} | null>(null)
  useEffect(() => {
    if (!isFocusing) return
    const id = setInterval(() => {
      setDistract({ x: Math.random() * 90, y: Math.random() * 80 })
      setTimeout(() => setDistract(null), 600)
    }, 3000)
    return () => clearInterval(id)
  }, [isFocusing])

  return (
    <main className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-cyan-600">{t('title')}</h1>
      <p className="mb-6 text-gray-500">{t('desc')}</p>
      <div className="bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="mb-2 text-gray-700">{isFocusing ? t('statusFocusing') : t('statusIdle')}</div>
        <div className="flex gap-8 mb-2">
          <div>{t('focusLabel')}<span className="font-bold text-cyan-700 text-xl">{time}s</span></div>
          <div>{t('bestLabel')}<span className="font-bold text-cyan-700 text-xl">{best}s</span></div>
        </div>
        <div className="flex justify-center items-center h-48">
          <div
            className="w-16 h-16 rounded-full bg-black shadow-lg border-4 border-cyan-200 cursor-pointer flex items-center justify-center"
            tabIndex={0}
            onMouseDown={start}
            onMouseUp={stop}
            onMouseLeave={isFocusing ? stop : undefined}
            title={t('dotAriaLabel')}
          >
            <span className="sr-only">{t('dotAriaLabel')}</span>
          </div>
          {distract && (
            <div
              className="absolute w-6 h-6 rounded-full bg-pink-400 opacity-80 animate-pulse"
              style={{ left: `${distract.x}%`, top: `${distract.y}%` }}
            />
          )}
        </div>
        {interrupted && <div className="text-red-500 font-semibold">{t('interrupted')}</div>}
      </div>
    </main>
  )
} 