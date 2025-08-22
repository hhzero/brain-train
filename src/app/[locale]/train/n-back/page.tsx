import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import NBackClient from './NBackClient'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'nback' })
  
  return {
    title: `${t('meta.title')} | Brain Train`,
    description: t('meta.description'),
    keywords: t('meta.keywords').split(',')
  }
}

export default function NBackPage() {
  return <NBackClient />
}