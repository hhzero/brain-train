'use client'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'
import { FC, useState } from 'react'
import GithubIcon from '../../icons/github'
import LogoIcon from '../../icons/logo'
import LangSwitcher from './LangSwitcher'
import ThemeSwitch from './ThemeSwitch'
import UserMenu from './UserMenu'
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
      <Link href='/'>
        <div className='flex flex-row items-center'>
          <div className='mb-2 h-14 w-14'>
            <LogoIcon />
          </div>
          <strong className='mx-2 select-none text-white'>Zero Brain</strong>
        </div>
      </Link>
      <div className='flex flex-row items-center gap-3'>
        <nav className='mr-10 inline-flex gap-5'>
          <Link href='/' className={`text-white hover:text-cyan-300 transition-colors${pathname === `/${locale}` || pathname === `/${locale}/` ? ' active' : ''}`}>
            {t('Home')}
          </Link>
          
          <Link href={`/memory`} className={`text-white hover:text-cyan-300 transition-colors${pathname === `/${locale}/memory` ? ' active' : ''}`}>
            {t('Memory')}
          </Link>
          <Link href={`/attention`} className={`text-white hover:text-cyan-300 transition-colors${pathname === `/${locale}/attention` ? ' active' : ''}`}>
            {t('Attention')}
          </Link>
          <Link href={`/speedreading`} className={`text-white hover:text-cyan-300 transition-colors${pathname === `/${locale}/speedreading` ? ' active' : ''}`}>
            {t('SpeedReading')}
          </Link>
          <Link href={`/about`} className={`text-white hover:text-cyan-300 transition-colors${pathname === `/${locale}/about` ? ' active' : ''}`}>
            {t('About')}
          </Link>
          
          {/* <a href=''>{t('Support')}</a> */}
          {/* <a href=''>{t('Other')}</a> */}
        </nav>
        {/* 这是主题按钮，后续这里也需要启用起来
         <ThemeSwitch /> */}
        <LangSwitcher />
        <UserMenu />
      </div>
    </div>
  )
}
