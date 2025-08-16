'use client'
import { capitalize } from '@/lib/utils'
import Link from 'next/link'
import { usePathname, useSelectedLayoutSegments } from 'next/navigation'
import React, { useState } from 'react'
import { FiGlobe } from 'react-icons/fi'
import Button from './Button'
import { locales, languageConfig, type Locale } from '@/i18n'

const LangSwitcher: React.FC = () => {
  const pathname = usePathname()
  const urlSegments = useSelectedLayoutSegments()
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false)
  
  // 获取当前语言
  const currentLocale = pathname.split('/')[1] as Locale
  const currentLang = languageConfig[currentLocale] || languageConfig.zh

  return (
    <div className='flex items-center justify-center'>
      <div className='relative'>
        <Button
          className='text-white inline-flex w-full items-center justify-between gap-3 hover:text-cyan-300 transition-colors'
          size='small'
          onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
          onBlur={() => setIsOptionsExpanded(false)}
        >
          <span className="flex items-center gap-2">
            <span>{currentLang.flag}</span>
            <span>{currentLang.name}</span>
          </span>
          <FiGlobe />
        </Button>
        
        {isOptionsExpanded && (
          <div className='absolute right-0 mt-2 w-full origin-top-right rounded-md bg-black bg-opacity-60 backdrop-blur-sm shadow-lg z-[1000]'>
            <div
              className='py-1'
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='options-menu'
            >
              {locales.map(locale => {
                const lang = languageConfig[locale]
                const isActive = currentLocale === locale
                
                return (
                  <Link
                    key={locale}
                    href={`/${locale}/${urlSegments.join('/')}`}
                  >
                    <button
                      lang={locale}
                      onMouseDown={e => {
                        e.preventDefault()
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-cyan-900 transition-colors ${
                        isActive
                          ? 'bg-cyan-800 text-white hover:bg-cyan-800'
                          : 'text-gray-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </button>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LangSwitcher
