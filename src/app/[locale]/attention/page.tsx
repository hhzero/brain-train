import { useTranslations } from 'next-intl'

export default function AttentionTraining() {
  const t = useTranslations('')
  return (
    <div className='px-8 py-12'>
      <h1 className='mb-8 text-3xl font-bold'>{t('Attention_Training')}</h1>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg bg-card p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>颜色辨别</h2>
          <p className='mb-4 text-secondary'>辨别文字颜色与文字内容不一致的情况，提高注意力和抑制能力。</p>
          <div className='mt-4 flex justify-end'>
            <button className='rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary/80'>
              开始训练
            </button>
          </div>
        </div>
        
        <div className='rounded-lg bg-card p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>找不同</h2>
          <p className='mb-4 text-secondary'>在两张相似的图片中找出所有不同之处。</p>
          <div className='mt-4 flex justify-end'>
            <button className='rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary/80'>
              开始训练
            </button>
          </div>
        </div>
        
        <div className='rounded-lg bg-card p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>专注计数</h2>
          <p className='mb-4 text-secondary'>在分心的情况下，准确计数屏幕上出现的特定目标。</p>
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