import { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const generateMetadata = (): Metadata => ({
  title: 'n-back 训练 | Brain Train',
  description: 'n-back 训练提升工作记忆力和专注力，科学有效的脑力训练工具。',
  keywords: ['n-back', '工作记忆', '专注力', '脑力训练', '认知提升']
})

// 动态导入客户端组件，避免 SSR 问题
const NBackClient = dynamic(() => import('./NBackClient'), { ssr: false })

export default function NBackPage() {
  return <NBackClient />
} 