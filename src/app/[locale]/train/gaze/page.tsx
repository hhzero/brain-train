import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getTranslations } from 'next-intl/server'

type Props = {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations()
  
  return {
    title: `${t('gaze.title')} | Brain Train`,
    description: t('gaze.desc'),
    keywords: ['gaze training', 'focus', 'attention', 'distraction resistance', 'brain training']
  }
}

const GazeClient = dynamic(() => import('./GazeClient'), { ssr: false })

export default function GazePage() {
  return <GazeClient />
} 