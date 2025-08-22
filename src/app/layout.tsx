import type { Metadata } from 'next'
import './[locale]/globals.css'
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'Brain Train',
  description: '大脑训练应用 - 提升认知能力和反应速度',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}