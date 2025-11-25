'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Menu, X, User, Search, Flame, ShoppingBag, ShoppingCart, LogIn, UserPlus } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MiniCart } from '@/components/cart/MiniCart'
import { useMobile, useTouchDevice } from '@/hooks/useMobile'
import { useAuth } from '@/contexts/AuthContext'
import { createPortal } from 'react-dom'

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('navigation')
  const tAuth = useTranslations('auth')
  const currentLocale = useLocale()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isMobile } = useMobile()
  const isTouchDevice = useTouchDevice()
  const isRTL = locale === 'ar'
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu when clicking outside - support both mouse and touch
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (
        menuButtonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Handle navigation with explicit router push for mobile
  const handleMobileNavigation = (href: string) => {
    setIsMobileMenuOpen(false)
    // Small delay to allow menu to close smoothly
    setTimeout(() => {
      router.push(href)
    }, 100)
  }

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('products'), href: `/${locale}/products` },
    { name: t('services'), href: `/${locale}/services` },
    { name: t('about'), href: `/${locale}/about` },
    { name: t('contact'), href: `/${locale}/contact` },
  ]

  const isHeaderWhite = isScrolled || isMobileMenuOpen || isMobile

  // Mobile menu portal - TRANSPARENT VERSION with fixed navigation
  const MobileMenuPortal = () => {
    if (!isMobileMenuOpen) return null;
    if (typeof document === 'undefined') return null;

    return createPortal(
      <div 
        ref={menuRef}
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xl overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Close button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 active:bg-white/30 transition-all group z-50`}
          aria-label="Close menu"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center pt-12 pb-8">
          <button 
            onClick={() => handleMobileNavigation(`/${locale}`)}
            className="flex items-center gap-3"
          >
            <Flame className="w-12 h-12 text-orange-400" />
            <span className="text-2xl font-bold text-white">MJ CHAUFFAGE</span>
          </button>
        </div>

        {/* Navigation Links - using buttons instead of Links for better mobile support */}
        <nav className="px-6 space-y-3">
          {navigation.map((item, index) => (
            <button
              key={item.name}
              onClick={() => handleMobileNavigation(item.href)}
              className="group block w-full text-left relative"
              style={{ opacity: 1 }}
            >
              <div className="relative bg-white/5 backdrop-blur-sm hover:bg-white/15 active:bg-white/20 rounded-2xl p-5 transition-all border border-white/10 hover:border-orange-400/50">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">
                    {item.name}
                  </span>
                  <svg
                    className={`w-5 h-5 text-white/40 group-hover:text-orange-300 transition-all ${isRTL ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="px-6 mt-8 mb-8 space-y-3">
          {user ? (
            <>
              <button
                onClick={() => handleMobileNavigation(user.role === 'ADMIN' ? '/admin/dashboard' : `/${locale}/account`)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30 active:scale-95 transition-all"
              >
                <User className="w-5 h-5" />
                {user.role === 'ADMIN' ? t('dashboard') : t('account')}
              </button>
              <button
                onClick={() => {
                  logout()
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center justify-center gap-2 w-full py-4 bg-white/10 text-white rounded-2xl font-bold border border-white/20 active:scale-95 transition-all"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              {/* Se connecter button */}
              <button
                onClick={() => handleMobileNavigation(`/${locale}/auth/login`)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30 active:scale-95 transition-all"
              >
                <LogIn className="w-5 h-5" />
                {tAuth('signIn')}
              </button>
              {/* S'inscrire button */}
              <button
                onClick={() => handleMobileNavigation(`/${locale}/auth/register`)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-white/10 text-white rounded-2xl font-bold border border-white/20 hover:bg-white/20 active:scale-95 transition-all"
              >
                <UserPlus className="w-5 h-5" />
                {tAuth('signUp')}
              </button>
            </>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-600/20 to-transparent pointer-events-none" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>,
      document.body
    );
  };

  return (
    <>
      <header
        id="navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHeaderWhite
          ? 'bg-white shadow-lg py-4'
          : 'bg-gradient-to-r from-orange-950/30 via-orange-900/20 to-orange-950/30 backdrop-blur-lg py-5'
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <div className="w-12 h-12 lg:w-16 lg:h-16 relative transition-transform hover:scale-105">
                <img src="/logo.png" alt="MJ Chauffage" className="w-full h-full object-contain" />
              </div>
              <span className={`text-xl lg:text-2xl font-bold ${isHeaderWhite ? 'text-black' : 'text-white'}`}>
                MJ Chauffage
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-12 absolute left-1/2 transform -translate-x-1/2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-base lg:text-lg font-semibold transition-all hover:text-[#D9772F] hover:-translate-y-0.5 ${isHeaderWhite ? 'text-black' : 'text-white'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isHeaderWhite ? 'text-black' : 'text-white'}`}>
                <Search className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>

              <div className={`${isHeaderWhite ? 'text-black' : 'text-white'}`}>
                <MiniCart locale={locale} />
              </div>

              <div className={`${isHeaderWhite ? 'text-black' : 'text-white'}`}>
                <LanguageSwitcher />
              </div>

              <div className="hidden lg:flex items-center gap-3">
                {user ? (
                  <>
                    <Link
                      href={user.role === 'ADMIN' ? '/admin/dashboard' : `/${locale}/account`}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-base font-semibold transition-all hover:scale-105 ${isHeaderWhite
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-lg'
                        : 'bg-white text-black border border-transparent hover:bg-orange-50 shadow-lg'
                        }`}
                    >
                      <User className="w-4 h-4" />
                      {user.role === 'ADMIN' ? t('dashboard') : t('account')}
                    </Link>
                    <button
                      onClick={logout}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${isHeaderWhite
                        ? 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Se connecter button */}
                    <Link
                      href={`/${locale}/auth/login`}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-base font-semibold transition-all hover:scale-105 ${isHeaderWhite
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-lg'
                        : 'bg-white text-black border border-transparent hover:bg-orange-50 shadow-lg'
                        }`}
                    >
                      <LogIn className="w-4 h-4" />
                      {tAuth('signIn')}
                    </Link>
                    {/* S'inscrire button */}
                    <Link
                      href={`/${locale}/auth/register`}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${isHeaderWhite
                        ? 'text-orange-600 border border-orange-300 hover:bg-orange-50'
                        : 'text-white border border-white/30 hover:bg-white/10'
                        }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      {tAuth('signUp')}
                    </Link>
                  </>
                )}
              </div>

              <button
                ref={menuButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 ${isHeaderWhite ? 'text-black' : 'text-white'}`}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenuPortal />
    </>
  )
}