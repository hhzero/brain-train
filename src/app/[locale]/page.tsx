'use client'
import { useTranslations } from 'next-intl'
import Button from './components/Button'
import MusicPlayer from './components/MusicPlayer'
import ErrorBoundary from './components/ErrorBoundary'
import { Link } from '@/navigation'

export default function DashboardPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('')
  const titleText = t('the_title_homepage01')
  
  return (
    <>
      <section className='flex flex-col items-center justify-center py-24 relative z-20'>
        <h1 className='text-center font-extrabold leading-tight'>
          <div className='nebula-text-container'>
            <span 
              className='nebula-text text-6xl md:text-7xl block mb-4' 
              data-text={titleText}
            >
              {titleText}
            </span>
          </div>
          <span className='text-3xl md:text-4xl text-gray-300/70 block'>
            {t('the_title_homepage02')}
          </span>
        </h1>
        <div className='mt-8 flex flex-row gap-4'>
          <Link href='/attention'>
            <Button rounded size='large' className='training-btn'>
              <span className='training-btn-text'>{t('Use_Start')}</span>
            </Button>
          </Link>
        </div>
      </section>
      {/* 音乐播放器 - 使用错误边界包装 */}
      <ErrorBoundary>
        <MusicPlayer />
      </ErrorBoundary>
    </>
  )
}
