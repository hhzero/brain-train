'use client'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { useEffect, useState } from 'react'

/**
 * 反应速度训练页面组件
 * 展示各种反应速度训练模块，包括速算训练等
 * 样式与注意力页面保持一致
 */
export default function ReactionSpeedTraining({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('')
  const [reactionData, setReactionData] = useState<any>(null)

  // 加载反应速度训练数据
  useEffect(() => {
    fetch(`/data/data.${locale}.json`)
      .then(res => res.json())
      .then(data => {
        setReactionData(data.ReactionSpeed)
      })
      .catch(err => {
        console.error('加载数据失败:', err)
      })
  }, [locale])

  if (!reactionData) {
    return <div className='px-8 py-12'>Loading...</div>
  }

  return (
    <div className='px-8 py-12'>
      <h1 className='mb-8 text-3xl font-bold text-gray-300'>{reactionData.name}</h1>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
        {reactionData.list.map((item: any) => (
          <div key={item.id} className='rounded-lg bg-card p-6 shadow-md bg-black/40'>
            <h2 className='mb-4 text-xl font-semibold text-gray-300'>{item.name}</h2>
            <p className='mb-4 text-cyan-300'>{item.description}</p>
            <div className='mt-4 flex justify-end'> 
              <Link href={item.link as '/memory' | '/reaction-speed/quick-math' | '/attention' | '/speedreading' | '/categories' | '/about' | '/'}>
                <button className='rounded-md bg-cyan-600 px-4 py-2 text-white transition hover:bg-cyan-700'>
                  {t('startTraining')}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}