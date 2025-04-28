'use client'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { FC, useState } from 'react'
import GithubIcon from '../../icons/github'
import LogoIcon from '../../icons/logo'
import LangSwitcher from './LangSwitcher'
import ThemeSwitch from './ThemeSwitch'
import { FiChevronDown } from 'react-icons/fi'
import { usePathname } from 'next/navigation'

interface Props {
  locale: string
}
export const Header: FC<Props> = ({ locale }) => {
  const t = useTranslations('')
  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(false)
  const pathname = usePathname()

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
          <Link lang={locale} href='/' className={`text-white hover:text-cyan-300 transition-colors${pathname === `/${locale}` || pathname === `/${locale}/` ? ' active' : ''}`}>
            {t('Home')}
          </Link>
          
          <Link lang={locale} href={`/memory`} className={`text-white hover:text-cyan-300 transition-colors${pathname === `/${locale}/memory` ? ' active' : ''}`}>
            {t('Memory')}
          </Link>

          <Link lang={locale} href={`/reaction`} className={`text-white hover:text-cyan-300 transition-colors${pathname === `/${locale}/reaction` ? ' active' : ''}`}>
            {t('Reaction')}
          </Link>
          <Link lang={locale} href={`/attention`} className={`text-white hover:text-cyan-300 transition-colors${pathname === `/${locale}/attention` ? ' active' : ''}`}>
            {t('Attention')}
          </Link>
          <Link lang={locale} href={`/speedreading`} className={`text-white hover:text-cyan-300 transition-colors${pathname === `/${locale}/speedreading` ? ' active' : ''}`}>
            {t('SpeedReading')}
          </Link>
          <Link lang={locale} href={`/about`} className={`text-white hover:text-cyan-300 transition-colors${pathname === `/${locale}/about` ? ' active' : ''}`}>
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
