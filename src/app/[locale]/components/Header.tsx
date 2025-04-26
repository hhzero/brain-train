'use client'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { FC, useState } from 'react'
import GithubIcon from '../../icons/github'
import LogoIcon from '../../icons/logo'
import LangSwitcher from './LangSwitcher'
import ThemeSwitch from './ThemeSwitch'
import { FiChevronDown } from 'react-icons/fi'

interface Props {
  locale: string
}
export const Header: FC<Props> = ({ locale }) => {
  const t = useTranslations('')
  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(false)

  return (
    <div className='mx-auto flex max-w-screen-2xl flex-row items-center justify-between p-5 z-10 relative'>
      <Link lang={locale} href='/'>
        <div className='flex flex-row items-center'>
          <div className='mb-2 h-14 w-14'>
            <LogoIcon />
          </div>
          <strong className='mx-2 select-none text-white'>Zero Brain</strong>
        </div>
      </Link>
      <div className='flex flex-row items-center gap-3'>
        <nav className='mr-10 inline-flex gap-5'>
          <Link lang={locale} href='/' className='text-white hover:text-cyan-300 transition-colors'>
            {t('Home')}
          </Link>
          <div 
            className='relative'
            onMouseEnter={() => setIsGamesMenuOpen(true)} 
            onMouseLeave={() => setIsGamesMenuOpen(false)}
          >
            <button className='flex items-center gap-1 text-white hover:text-cyan-300 transition-colors'>
              {t('Games')}
              <FiChevronDown className='h-4 w-4' />
            </button>
            {isGamesMenuOpen && (
              <div className='absolute left-0 mt-2 w-48 rounded-md bg-black bg-opacity-60 shadow-lg z-10 backdrop-blur-sm'>
                <div className='py-1'>
                  <Link 
                    lang={locale} 
                    href='/games/memory-training'
                    className='block px-4 py-2 text-sm hover:bg-cyan-900 text-gray-200'
                  >
                    {t('Memory_Training')}
                  </Link>
                  <Link 
                    lang={locale} 
                    href='/games/reaction-speed'
                    className='block px-4 py-2 text-sm hover:bg-cyan-900 text-gray-200'
                  >
                    {t('Reaction_Speed')}
                  </Link>
                  <Link 
                    lang={locale} 
                    href='/games/attention-training'
                    className='block px-4 py-2 text-sm hover:bg-cyan-900 text-gray-200'
                  >
                    {t('Attention_Training')}
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link lang={locale} href={`/about`} className='text-white hover:text-cyan-300 transition-colors'>
            {t('About')}
          </Link>
          {/* <a href=''>{t('Support')}</a> */}
          {/* <a href=''>{t('Other')}</a> */}
        </nav>
        <ThemeSwitch />
        <LangSwitcher />
        <a
          href='https://github.com/yahyaparvar/nextjs-template'
          target='_blank'
        >
          <div className='size-8 text-white hover:text-cyan-300 transition-colors'>
            <GithubIcon />
          </div>
        </a>
      </div>
    </div>
  )
}
