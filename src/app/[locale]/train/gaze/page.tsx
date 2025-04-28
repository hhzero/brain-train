import { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const generateMetadata = (): Metadata => ({
  title: '凝视训练 | Brain Train',
  description: '凝视训练帮助提升专注力和抗干扰能力，适合所有年龄段的注意力训练。',
  keywords: ['凝视训练', '专注力', '注意力', '抗干扰', '脑力训练']
})

const GazeClient = dynamic(() => import('./GazeClient'), { ssr: false })

export default function GazePage() {
  return <GazeClient />
} 