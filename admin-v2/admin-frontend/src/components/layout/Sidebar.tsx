'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  BarChart3
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Produits',
    href: '/dashboard/products',
    icon: Package,
  },
  {
    name: 'Commandes',
    href: '/dashboard/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    name: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  collapsed?: boolean
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className={cn('flex h-full flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-r border-border transition-all duration-200', collapsed ? 'w-20' : 'w-64')}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-center bg-card/80 border-b border-border">
        <h1 className={cn('font-semibold text-foreground tracking-tight transition-all', collapsed ? 'text-sm' : 'text-lg')}>MJ Chauffage</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={false}
              className={cn(
                'relative group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all',
                isActive
                  ? 'relative bg-primary/10 text-primary ring-1 ring-primary/30 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded before:bg-primary'
                  : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className={cn('ml-3', collapsed && 'hidden')}>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User info and logout */}
      <div className="border-t border-border p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-muted/40 flex items-center justify-center">
              <span className="text-sm font-medium text-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          {!collapsed && (
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.role}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={cn('mt-3 w-full flex items-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-muted/30 hover:text-foreground transition-colors', collapsed && 'justify-center')}
        >
          <LogOut className={cn('h-5 w-5', !collapsed && 'mr-3')} />
          {!collapsed && 'Déconnexion'}
        </button>
      </div>
    </div>
  )
}