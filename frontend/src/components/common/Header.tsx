'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Menu, X, User, Search, Flame, ShoppingBag } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MiniCart } from '@/components/cart/MiniCart'
import { useMobile, useTouchDevice } from '@/hooks/useMobile'
import { useAuth } from '@/contexts/AuthContext'

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

  // Handle scroll effect for modern header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle mobile menu close on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // Don't close if clicking on menu button or inside menu
      if (
        menuButtonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      // Close menu if clicking outside
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
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

  return (
    <header
      id="navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-card border-b border-neutral-200/50'
        : 'bg-white/80 backdrop-blur-sm border-b border-transparent'
        } ${isRTL ? 'rtl' : 'ltr'}`}
      style={{ WebkitTransform: 'translateZ(0)' }}
    >
      <div className="container-modern">
        <div className="flex justify-between items-center h-20">
          {/* Modern Logo */}
          <div className="flex-shrink-0">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-3 group transition-all duration-200 hover:scale-105"
              aria-label="MJ CHAUFFAGE - Accueil"
            >
              <div className="w-10 h-10 rounded-xl shadow-lg bg-white border border-neutral-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="MJ Chauffage Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-neutral-900 group-hover:text-orange-600 transition-colors">
                  MJ Chauffage
                </span>
                <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
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
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href={user.role === 'ADMIN' ? '/admin/dashboard' : `/${locale}/account`}
                    className="flex items-center gap-2 text-body-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-primary-50"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.firstName || 'Mon Compte'}</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-body-sm font-medium text-neutral-500 hover:text-error-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-error-50"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Modern Mobile menu button */}
          <div className="lg:hidden flex items-center gap-3">
            {/* Mobile Search - Quick access */}
            <button
              onClick={() => {/* TODO: Open mobile search */ }}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-neutral-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 relative z-10"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Mobile Cart */}
            <div className="md:block lg:hidden relative z-10">
              <MiniCart locale={locale} />
            </div>

            {/* Menu Button - Simplified for debugging */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(prev => {
                  const newState = !prev;
                  return newState;
                });
              }}
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 relative z-[100] touch-manipulation active:scale-95 border-2 bg-red-500 text-white font-bold ${isMobileMenuOpen ? 'bg-red-700' : 'bg-red-500'
                }`}
              aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMobileMenuOpen}
              type="button"
              style={{
                minWidth: '56px',
                minHeight: '56px',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {isMobileMenuOpen ? 'X' : '☰'}
            </button>
          </div>
        </div>

        {/* Modern Mobile Navigation */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[99]"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            {/* Menu panel */}
            <div
              ref={menuRef}
              className="lg:hidden fixed top-[80px] left-0 right-0 bottom-0 bg-white border-t border-neutral-200 z-[100] overflow-y-auto shadow-xl"
              style={{
                height: 'calc(100vh - 80px)',
              }}
            >
              {/* Navigation Links */}
              <div className="py-6 px-4 space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-2">
                    Navigation
                  </div>
                  {navigation.map((item, index) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-between px-4 py-4 text-body-lg font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 active:scale-95 border border-transparent hover:border-orange-100"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{item.name}</span>
                      <div className="w-2 h-2 bg-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-200/50 py-6 px-4">
                {/* Language Switcher Mobile */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
                    Langue
                  </div>
                  <div className="px-2">
                    <LanguageSwitcher />
                  </div>
                </div>

                {/* Search Bar Mobile */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
                    Recherche
                  </div>
                  <div className="px-2">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder={isRTL ? "...البحث عن المنتجات" : "Rechercher un produit..."}
                        className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Auth Actions */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
                    Compte
                  </div>
                  <div className="px-2 space-y-3">
                    {user ? (
                      <>
                        <Link
                          href={user.role === 'ADMIN' ? '/admin/dashboard' : `/${locale}/account`}
                          className="block w-full text-center py-4 px-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all duration-200 active:scale-95 shadow-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <User className="w-5 h-5" />
                            <span>{user.firstName || 'Mon Compte'}</span>
                          </div>
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setIsMobileMenuOpen(false)
                          }}
                          className="block w-full text-center py-4 px-4 border-2 border-neutral-200 text-neutral-600 font-semibold rounded-xl hover:bg-neutral-50 hover:text-error-600 transition-all duration-200 active:scale-95"
                        >
                          Déconnexion
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/${locale}/auth/login`}
                          className="block w-full text-center py-4 px-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all duration-200 active:scale-95 shadow-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t('login')}
                        </Link>
                        <Link
                          href={`/${locale}/auth/register`}
                          className="block w-full text-center py-4 px-4 border-2 border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-500 hover:text-white transition-all duration-200 active:scale-95"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t('register')}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}