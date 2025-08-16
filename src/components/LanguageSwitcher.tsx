'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale, addLocaleToPathname, removeLocaleFromPathname } from '@/i18n/config';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'toggle';
}

export default function LanguageSwitcher({ className = '', variant = 'dropdown' }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;
    
    const cleanPathname = removeLocaleFromPathname(pathname);
    const newPathname = addLocaleToPathname(cleanPathname, newLocale);
    
    router.push(newPathname);
    setIsOpen(false);
  };

  if (variant === 'toggle') {
    const otherLocale = locale === 'zh' ? 'en' : 'zh';
    return (
      <button
        onClick={() => handleLocaleChange(otherLocale)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-white/10 hover:bg-white/20 backdrop-blur-sm
          text-white/90 hover:text-white
          transition-all duration-200
          border border-white/20 hover:border-white/30
          ${className}
        `}
        title={`Switch to ${localeNames[otherLocale]}`}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {localeFlags[otherLocale]} {localeNames[otherLocale]}
        </span>
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-white/10 hover:bg-white/20 backdrop-blur-sm
          text-white/90 hover:text-white
          transition-all duration-200
          border border-white/20 hover:border-white/30
        "
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {localeFlags[locale]} {localeNames[locale]}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="
            absolute top-full left-0 mt-2 z-50
            min-w-[140px] py-2 rounded-lg
            bg-gray-900/95 backdrop-blur-sm
            border border-white/20
            shadow-xl shadow-black/20
          ">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2
                  text-left text-sm font-medium
                  transition-colors duration-150
                  ${
                    loc === locale
                      ? 'text-blue-400 bg-blue-500/20'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <span className="text-base">{localeFlags[loc]}</span>
                <span>{localeNames[loc]}</span>
                {loc === locale && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-blue-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Hook for programmatic locale switching
export function useLocaleSwitch() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    
    const cleanPathname = removeLocaleFromPathname(pathname);
    const newPathname = addLocaleToPathname(cleanPathname, newLocale);
    
    router.push(newPathname);
  };

  return { locale, switchLocale, availableLocales: locales };
}