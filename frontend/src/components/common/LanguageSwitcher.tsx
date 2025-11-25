'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface Language {
  code: 'ar' | 'fr'
  name: string
  nativeName: string
  flag: string
  dir: 'rtl' | 'ltr'
}

const languages: Language[] = [
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
  },
  {
    code: 'ar',
    name: 'العربية',
    nativeName: 'العربية',
    flag: '🇩🇿',
    dir: 'rtl',
  },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale() as 'ar' | 'fr'
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = (newLocale: 'ar' | 'fr') => {
    if (newLocale === locale) {
      setIsOpen(false)
      return
    }

    setIsChanging(true)
    setIsOpen(false)
    
    // Extract the path without locale prefix
    // Handle cases: /fr/products, /ar/products, /products (default locale)
    let newPath = pathname || '/'
    
    // Remove existing locale prefix if present
    const localePattern = /^\/(fr|ar)(\/|$)/
    if (localePattern.test(newPath)) {
      newPath = newPath.replace(localePattern, '/')
    }
    
    // Ensure path starts with /
    if (!newPath.startsWith('/')) {
      newPath = '/' + newPath
    }
    
    // Handle root path
    if (newPath === '/') {
      newPath = ''
    }
    
    // Build the new URL with the new locale
    const newUrl = `/${newLocale}${newPath}`
    
    // Use window.location for a full page reload to ensure all translations are loaded
    // This is more reliable than router.push for language changes
    window.location.href = newUrl
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
        aria-label="Changer de langue"
        aria-expanded={isOpen}
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="hidden sm:inline font-semibold">{locale.toUpperCase()}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
        >
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              disabled={isChanging}
              className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${
                language.code === locale 
                  ? 'bg-orange-50 text-orange-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
              role="menuitem"
              dir={language.dir}
            >
              <span className="text-xl">{language.flag}</span>
              <div className="flex-1">
                <div className="font-semibold">{language.nativeName}</div>
              </div>
              {language.code === locale && (
                <Check className="w-4 h-4 text-orange-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}