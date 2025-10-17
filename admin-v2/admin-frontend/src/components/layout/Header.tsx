'use client'

import { useEffect, useState } from 'react'
import { Bell, Search, Sun, Moon, Menu } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface HeaderProps {
  title: string
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

export function Header({ title, onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const [isDark, setIsDark] = useState<boolean>(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialDark = stored ? stored === 'dark' : prefersDark
    setIsDark(initialDark)
    document.documentElement.classList.toggle('dark', initialDark)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <header className="bg-gradient-to-r from-background via-card/80 to-muted/20 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <Button variant="ghost" size="icon" aria-label="Basculer la barre latérale" onClick={onToggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{title}</h1>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-10 w-56 md:w-64 rounded-full bg-muted/20 text-foreground placeholder:text-muted-foreground ring-1 ring-border/50 focus-visible:ring-primary/50 shadow-sm"
            />
          </div>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" aria-label="Basculer le thème" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}