'use client'
import { useTranslations } from 'next-intl'
import data from '../../../../public/data/data.json'
import { Link } from '@/src/navigation'

export default function AttentionTraining({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('')
    // 获取Memory部分的数据
  const attentionData = data.Attention;

  return (
    <div className='px-8 py-12'>
      <h1 className='mb-8 text-3xl font-bold'>{t('Attention')}</h1>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
      {/* 动态生成记忆训练卡片 */}
      {attentionData.list.map((item) => {
          // 提取link中的路径名称（去掉开头的/）
          const linkPath = item.link.startsWith('/') ? item.link.substring(1) : item.link;
          return (
            <div key={item.id} className='rounded-lg bg-card p-6 shadow-md'>
              <h2 className='mb-4 text-xl font-semibold'>{item.name}</h2>
              <p className='mb-4 text-secondary'>{item.description}</p>
              <div className='mt-4 flex justify-end'> 
                <Link href={item.link as '/memory' | '/reaction' | '/attention' | '/speedreading' | '/categories' | '/about' | '/'} lang={locale}>
                  <button className='rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary/80'>
                    开始训练
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
} 