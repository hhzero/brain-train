import { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const generateMetadata = (): Metadata => ({
  title: '消除音读 | Brain Train',
  description: '消除音读（Stroop测试）训练提升注意力控制和认知灵活性，是经典的执行功能训练工具。',
  keywords: ['Stroop', '消除音读', '注意力', '认知灵活性', '执行功能', '脑力训练']
})

const ReadingEliminationClient = dynamic(() => import('./ReadingEliminationClient'), { ssr: false })

export default function ReadingEliminationPage() {
  return <ReadingEliminationClient />
} 