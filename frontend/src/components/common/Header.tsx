'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Menu, X, User, Search, Flame, ShoppingBag } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MiniCart } from '@/components/cart/MiniCart'

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('navigation')
  const currentLocale = useLocale()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const isRTL = locale === 'ar'

  // Handle scroll effect for modern header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('products'), href: `/${locale}/products` },
    { name: t('services'), href: `/${locale}/services` },
    { name: t('about'), href: `/${locale}/about` },
    { name: t('contact'), href: `/${locale}/contact` },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-card border-b border-neutral-200/50' 
        : 'bg-white/80 backdrop-blur-sm border-b border-transparent'
    } ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container-modern">
        <div className="flex justify-between items-center h-20">
          {/* Modern Logo */}
          <div className="flex-shrink-0">
            <Link 
              href={`/${locale}`} 
              className="flex items-center gap-3 group transition-all duration-200 hover:scale-105"
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-heading-md font-display font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                  MJ CHAUFFAGE
                </span>
                <span className="text-body-xs text-neutral-500 font-medium uppercase tracking-wider">
                  Professional Heating
                </span>
              </div>
            </Link>
          </div>

          {/* Modern Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-link px-4 py-2 text-body-md font-medium text-neutral-700 hover:text-primary-600 rounded-xl transition-all duration-200 hover:bg-primary-50 relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-primary rounded-full transition-all duration-200 group-hover:w-8 transform -translate-x-1/2"></span>
              </Link>
            ))}
          </nav>

          {/* Modern Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search Button */}
            <button className="w-11 h-11 rounded-xl flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 interactive-scale">
              <Search className="h-5 w-5" />
            </button>
            
            {/* Cart */}
            <div className="relative">
              <MiniCart locale={locale} />
            </div>

            {/* Language Switcher */}
            <div className="px-2">
              <LanguageSwitcher />
            </div>

            {/* Auth Actions */}
            <div className="flex items-center space-x-3 pl-3 border-l border-neutral-200">
              <Link
                href={`/${locale}/auth/login`}
                className="text-body-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-primary-50"
              >
                {t('login')}
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="btn btn-primary btn-sm"
              >
                {t('register')}
              </Link>
            </div>
          </div>

          {/* Modern Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Mobile Cart */}
            <div className="md:block lg:hidden">
              <MiniCart locale={locale} />
            </div>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 interactive-scale"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Modern Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200/50 bg-white/95 backdrop-blur-lg">
            <div className="py-6 space-y-1">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-6 py-3 text-body-md font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl mx-4 transition-all duration-200 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-neutral-200/50 py-6">
              {/* Search Bar */}
              <div className="px-6 mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="form-input pl-12 w-full"
                  />
                </div>
              </div>

              {/* Language Switcher */}
              <div className="px-6 mb-6">
                <LanguageSwitcher />
              </div>

              {/* Auth Actions */}
              <div className="px-6 space-y-3">
                <Link
                  href={`/${locale}/auth/login`}
                  className="btn btn-secondary w-full justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  className="btn btn-primary w-full justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('register')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}