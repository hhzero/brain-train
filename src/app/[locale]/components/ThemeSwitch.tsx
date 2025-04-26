'use client'
import { capitalize } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { FiSun } from 'react-icons/fi'
import Button from './Button'

export default function ThemeSwitch() {
  const t = useTranslations('')
  const { theme, setTheme, themes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close the dropdown menu if clicked outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref])

  // toggle dropdown menu
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div ref={ref} className='relative inline-block text-left'>
      <Button
        size='small'
        type='button'
        className='text-white inline-flex w-full min-w-[95px] items-center justify-between gap-3 hover:text-cyan-300 transition-colors'
        id='options-menu'
        aria-expanded={isOpen}
        onClick={toggleDropdown}
      >
        <span className='ml-2'>{t('Theme')}</span>
        <FiSun />
      </Button>
      {isOpen && (
        <div className='absolute right-0 mt-2 w-full origin-top-right rounded-md bg-black bg-opacity-60 backdrop-blur-sm shadow-lg'>
          <div
            className='py-1'
            role='menu'
            aria-orientation='vertical'
            aria-labelledby='options-menu'
          >
            {themes.map(themeItem => {
              return (
                <button
                  key={themeItem}
                  onClick={() => {
                    setTheme(themeItem)
                    setIsOpen(false)
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-cyan-900 ${
                    themeItem === theme
                      ? 'bg-cyan-800 text-white hover:bg-cyan-800'
                      : 'text-gray-200'
                  }`}
                >
                  {capitalize(themeItem)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
