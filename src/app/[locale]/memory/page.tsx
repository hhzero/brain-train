'use client'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import { useEffect, useState } from 'react'

export default function MemoryTraining({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('')
  const [memoryData, setMemoryData] = useState<any>(null)

  useEffect(() => {
    fetch(`/data/data.${locale}.json`)
      .then(res => res.json())
      .then(data => {
        setMemoryData(data.Memory)
      })
      .catch(err => {
        console.error('加载数据失败:', err)
      })
  }, [locale])

  if (!memoryData) {
    return <div className='px-8 py-12'>Loading...</div>
  }

  return (
    <div className='px-8 py-12'>
      <h1 className='mb-8 text-3xl font-bold text-gray-300'>{memoryData.name}</h1>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
        {memoryData.list.map((item: any) => (
          <div key={item.id} className='rounded-lg bg-card p-6 shadow-md bg-black/30'>
            <h2 className='mb-4 text-xl font-semibold text-gray-300'>{item.name}</h2>
            <p className='mb-4 text-cyan-300'>{item.description}</p>
            <div className='mt-4 flex justify-end'> 
              <Link href={item.link as '/memory' | '/reaction' | '/attention' | '/speedreading' | '/categories' | '/about' | '/'} lang={locale}>
                <button className='rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary/80'>
                  {t('StartTraining')}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 