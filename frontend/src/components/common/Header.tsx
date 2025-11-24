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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle mobile menu close
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

  // Determine if header should be white (scrolled OR mobile menu open OR mobile device)
  const isHeaderWhite = isScrolled || isMobileMenuOpen || isMobile

  // Portal for mobile menu
  const MobileMenuPortal = () => {
    if (!isMobileMenuOpen) return null;

    // Ensure we only render on client
    if (typeof document === 'undefined') return null;

    return createPortal(
      <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto pt-24">
        <div className="p-4 space-y-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block p-4 text-lg font-medium text-black border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 space-y-4">
            {user ? (
              <Link
                href={user.role === 'ADMIN' ? '/admin/dashboard' : `/${locale}/account`}
                className="block w-full text-center py-3 bg-black text-white rounded-full font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {user.role === 'ADMIN' ? 'Dashboard Admin' : 'Mon Compte'}
              </Link>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className="block w-full text-center py-3 bg-black text-white rounded-full font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Connexion Admin
              </Link>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <header
        id="navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHeaderWhite
          ? 'bg-white shadow-md py-2'
          : 'bg-transparent py-4'
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <div className="w-10 h-10 relative">
                <img src="/logo.png" alt="MJ Chauffage" className="w-full h-full object-contain" />
              </div>
              <span className={`text-xl font-bold ${isHeaderWhite ? 'text-black' : 'text-white'}`}>
                MJ Chauffage
              </span>
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-[#D9772F] ${isHeaderWhite ? 'text-black' : 'text-white/90'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <button className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isHeaderWhite ? 'text-black' : 'text-white'}`}>
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <div className={`${isHeaderWhite ? 'text-black' : 'text-white'}`}>
                <MiniCart locale={locale} />
              </div>

              {/* Language */}
              <div className={`${isHeaderWhite ? 'text-black' : 'text-white'}`}>
                <LanguageSwitcher />
              </div>

              {/* Admin / Auth Button */}
              <div className="hidden lg:block">
                {user ? (
                  <Link
                    href={user.role === 'ADMIN' ? '/admin/dashboard' : `/${locale}/account`}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isHeaderWhite
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-white text-black border border-transparent hover:bg-gray-100'
                      }`}
                  >
                    {user.role === 'ADMIN' ? 'Admin' : 'Compte'}
                  </Link>
                ) : (
                  <Link
                    href={`/${locale}/auth/login`}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isHeaderWhite
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-white text-black border border-transparent hover:bg-gray-100'
                      }`}
                  >
                    Admin
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
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

      {/* Render Mobile Menu Portal */}
      <MobileMenuPortal />
    </>
  )
}