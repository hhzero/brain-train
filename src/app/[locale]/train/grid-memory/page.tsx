import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getTranslations } from 'next-intl/server'

type Props = {
  params: { locale: string }
}

/**
 * 生成方格记忆游戏页面的元数据
 * @param params 包含语言环境的参数
 * @returns 页面元数据
 */
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'gridMemory' })
  
  return {
    title: `${t('meta.title')} | Brain Train`,
    description: t('meta.description'),
    keywords: t('meta.keywords').split(',')
  }
}

// 动态导入客户端组件，避免 SSR 问题
const GridMemoryClient = dynamic(() => import('./GridMemoryClient'), { ssr: false })

/**
 * 方格记忆游戏页面组件
 * @returns 方格记忆游戏页面
 */
export default function GridMemoryPage() {
  return <GridMemoryClient />
}