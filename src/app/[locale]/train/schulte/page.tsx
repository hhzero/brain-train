import { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const generateMetadata = (): Metadata => ({
  title: '舒尔特方格 | Brain Train',
  description: '舒尔特方格训练提升注意力、视觉搜索和反应速度，是经典的专注力训练工具。',
  keywords: ['舒尔特方格', '注意力', '专注力', '视觉搜索', '反应速度', '脑力训练']
})

const SchulteClient = dynamic(() => import('./SchulteClient'), { ssr: false })

export default function SchultePage() {
  return <SchulteClient />
} 