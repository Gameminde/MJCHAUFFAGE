import { ReactNode } from 'react'
import Link from 'next/link'
import { AdminLayoutClient } from './AdminLayoutClient'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Products', href: '/admin/products', icon: '📦' },
    { name: 'Orders', href: '/admin/orders', icon: '🛒' },
    { name: 'Customers', href: '/admin/customers', icon: '👥' },
    { name: 'Services', href: '/admin/services', icon: '🔧' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]
  
  return (
    <AdminLayoutClient navigation={navigation}>
      {children}
    </AdminLayoutClient>
  )
}
