import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getTranslations } from 'next-intl/server'

export const generateMetadata = async ({ params }: { params: { locale: string } }): Promise<Metadata> => {
  const t = await getTranslations({ locale: params.locale, namespace: 'schulte' })
  
  return {
    title: `${t('title')} | Brain Train`,
    description: t('description'),
    keywords: [t('title'), 'attention', 'focus', 'visual search', 'reaction speed', 'brain training']
  }
}

const SchulteClient = dynamic(() => import('./SchulteClient'), { ssr: false })

export default function SchultePage() {
  return <SchulteClient />
}