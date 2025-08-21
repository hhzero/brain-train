import type { Metadata } from 'next'
import { Inter, Rubik, Space_Grotesk } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { AbstractIntlMessages } from 'next-intl'
import { PerformanceMonitorProvider } from '@/components/PerformanceMonitorProvider'
import { ThemeProvider } from '@/app/[locale]/components/ThemeProvider'
import { Header } from './components/Header'
import { cn } from '@/lib/utils'
import { ClientStarfieldWrapper } from '@/components/ClientStarfieldWrapper'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ['latin'],
  variable: '--inter'
})
const rubik = Rubik({
  subsets: ['latin'],
  variable: '--rubik'
})
const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
})

export const metadata: Metadata = {
  title: 'Brain Train',
  description: 'Brain training application for cognitive enhancement',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: ['/favicon.svg']
  }
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()
  
  return (
    <html
      lang={locale}
      dir={locale === 'ar' || locale == 'fa' ? 'rtl' : 'ltr'}
      className={`${space_grotesk.variable} ${rubik.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className={cn(
        'min-h-screen font-sans antialiased'
      )}>
        <PerformanceMonitorProvider>
          <ThemeProvider>
            <NextIntlClientProvider
              locale={locale}
              messages={messages as AbstractIntlMessages}
            >
              {/* 星空背景 */}
              <ClientStarfieldWrapper />
              
              {/* 主要内容区域 */}
              <div className="starry-background-content">
                <Header locale={locale} />
                <main className='mx-auto max-w-screen-2xl p-4'>
                  {children}
                </main>
              </div>
            </NextIntlClientProvider>
          </ThemeProvider>
        </PerformanceMonitorProvider>
      </body>
    </html>
  )
}
