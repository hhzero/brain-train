'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider 
    themes={['system', 'light', 'dark', 'sunset', 'instagram', 'facebook', 'discord', 'netflix', 'reddit', 'twilight']} 
    {...props}
  >
    {children}
  </NextThemesProvider>
}
