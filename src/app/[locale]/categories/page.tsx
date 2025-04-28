import { useTranslations } from 'next-intl'

export default function Categories({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('')
  return (
    <div className='px-8 py-12'>
      <h1 className='mb-8 text-3xl font-bold'>{t('Categories')}</h1>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg bg-card p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>分类1</h2>
          <p className='mb-4 text-secondary'>翻转卡片并记住它们的位置，然后匹配相同的卡片。</p>
          <div className='mt-4 flex justify-end'>
            <button className='rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary/80'>
              开始训练
            </button>
          </div>
        </div>
        
        <div className='rounded-lg bg-card p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>分类2</h2>
          <p className='mb-4 text-secondary'>记住一系列数字，然后按照显示的顺序重复它们。</p>
          <div className='mt-4 flex justify-end'>
            <button className='rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary/80'>
              开始训练
            </button>
          </div>
        </div>
        
        <div className='rounded-lg bg-card p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>分3</h2>
          <p className='mb-4 text-secondary'>观察并记忆图案，然后从多个选项中选择正确的一个。</p>
          <div className='mt-4 flex justify-end'>
            <button className='rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary/80'>
              开始训练
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 