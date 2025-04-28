import { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const generateMetadata = (): Metadata => ({
  title: '速度实战 | Brain Train',
  description: '速度实战训练提升反应速度和注意力，是科学有效的脑力训练工具。',
  keywords: ['反应速度', '注意力', '速度训练', '脑力训练', '认知提升']
})

const SpeedPracticeClient = dynamic(() => import('./SpeedPracticeClient'), { ssr: false })

export default function SpeedPracticePage() {
  return <SpeedPracticeClient />
} 