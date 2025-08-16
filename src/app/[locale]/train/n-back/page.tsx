import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getTranslations } from 'next-intl/server'

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

// 动态导入客户端组件，避免 SSR 问题
const NBackClient = dynamic(() => import('./NBackClient'), { ssr: false })

export default function NBackPage() {
  return <NBackClient />
}