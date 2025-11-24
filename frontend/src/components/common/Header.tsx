'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Menu, X, User, Search, Flame, ShoppingBag, ShoppingCart } from 'lucide-react'
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
  const currentLocale = useLocale()
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('products'), href: `/${locale}/products` },
    { name: t('services'), href: `/${locale}/services` },
    { name: t('about'), href: `/${locale}/about` },
    { name: t('contact'), href: `/${locale}/contact` },
  ]

  const isHeaderWhite = isScrolled || isMobileMenuOpen || isMobile

  // Mobile menu portal - TRANSPARENT VERSION
  const MobileMenuPortal = () => {
    if (!isMobileMenuOpen) return null;
    if (typeof document === 'undefined') return null;

    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xl overflow-y-auto">
        <style jsx global>{`
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>

        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all group z-50"
          aria-label="Close menu"
        >
          <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="flex items-center justify-center pt-12 pb-8">
          <div className="flex items-center gap-3">
            <Flame className="w-12 h-12 text-orange-400" />
            <span className="text-2xl font-bold text-white">MJ CHAUFFAGE</span>
          </div>
        </div>

        <div className="px-6 space-y-2">
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className="group block relative overflow-hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                animation: `slideInLeft 0.4s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="relative bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-2xl p-5 transition-all border border-white/10 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">
                    {item.name}
                  </span>
                  <svg
                    className="w-5 h-5 text-white/40 group-hover:text-orange-300 group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="px-6 mt-8 mb-8">
          {user ? (
            <Link
              href={user.role === 'ADMIN' ? '/admin/dashboard' : `/${locale}/account`}
              className="block w-full text-center py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {user.role === 'ADMIN' ? '🔧 Dashboard Admin' : '👤 Mon Compte'}
            </Link>
          ) : (
            <Link
              href={`/${locale}/auth/login`}
              className="block w-full text-center py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              🔐 Connexion Admin
            </Link>
          )}
        </div>

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

              <div className="hidden lg:block">
                {user ? (
                  <Link
                    href={user.role === 'ADMIN' ? '/admin/dashboard' : `/${locale}/account`}
                    className={`px-8 py-3 rounded-full text-base font-semibold transition-all hover:scale-105 ${isHeaderWhite
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-xl'
                      : 'bg-white text-black border border-transparent hover:bg-orange-50 shadow-lg'
                      }`}
                  >
                    {user.role === 'ADMIN' ? 'Admin' : 'Compte'}
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/auth/login`}
                    className={`px-8 py-3 rounded-full text-base font-semibold transition-all hover:scale-105 ${isHeaderWhite
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-xl'
                      : 'bg-white text-black border border-transparent hover:bg-orange-50 shadow-lg'
                      }`}
                  >
                    Admin
                  </Link>
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