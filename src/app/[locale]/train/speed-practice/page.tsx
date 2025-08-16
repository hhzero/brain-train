import { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const generateMetadata = (): Metadata => ({
  title: 'Speed Practice | Brain Train',
  description: 'Speed practice training improves reaction speed and attention, an effective brain training tool.',
  keywords: ['reaction speed', 'attention', 'speed training', 'brain training', 'cognitive enhancement']
})

const SpeedPracticeClient = dynamic(() => import('./SpeedPracticeClient'), { ssr: false })

export default function SpeedPracticePage() {
  return <SpeedPracticeClient />
}