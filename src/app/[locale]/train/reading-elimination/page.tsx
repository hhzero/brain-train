import { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import dynamic from 'next/dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ReadingElimination')
  return {
    title: `${t('title')} | Brain Train`,
    description: t('description'),
    keywords: ['Stroop', 'reading elimination', 'attention', 'cognitive flexibility', 'executive function', 'brain training']
  }
}

const ReadingEliminationClient = dynamic(() => import('./ReadingEliminationClient'), { ssr: false })

export default function ReadingEliminationPage() {
  return <ReadingEliminationClient />
}