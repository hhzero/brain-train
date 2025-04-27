import { useTranslations } from 'next-intl'

export default function SpeedReading() {
  const t = useTranslations('')
  return (
    <div className='px-8 py-12'>
      <h1 className='mb-8 text-3xl font-bold'>{t('SpeedReading')}</h1>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg bg-card p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>快速点击</h2>
          <p className='mb-4 text-secondary'>当目标从红色变为绿色时，尽快点击。测试您的反应速度。</p>
          <div className='mt-4 flex justify-end'>
            <button className='rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary/80'>
              开始训练
            </button>
          </div>
        </div>
        
        <div className='rounded-lg bg-card p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>追踪目标</h2>
          <p className='mb-4 text-secondary'>跟踪并点击屏幕上快速移动的目标。</p>
          <div className='mt-4 flex justify-end'>
            <button className='rounded-md bg-primary px-4 py-2 text-white transition hover:bg-primary/80'>
              开始训练
            </button>
          </div>
        </div>
        
        <div className='rounded-lg bg-card p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>按键速度</h2>
          <p className='mb-4 text-secondary'>根据屏幕上显示的字母，尽快按下键盘上对应的按键。</p>
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