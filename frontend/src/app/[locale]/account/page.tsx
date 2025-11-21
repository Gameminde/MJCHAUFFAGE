'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CustomerDashboard } from '@/components/customer/CustomerDashboard'
import { Loader2 } from 'lucide-react'

interface PageProps {
  params: {
    locale: string
  }
}

export default function AccountPage({ params: { locale } }: PageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user && isMounted) {
      router.push(`/${locale}/auth/login`)
    }
  }, [user, loading, locale, router, isMounted])

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  // Map user to CustomerDashboard props
  const dashboardUser = {
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: (user as any).phone || '', // Phone might not be in the interface but returned by backend
    address: (user as any).address || '', // Address might not be in the interface
  }

  return <CustomerDashboard locale={locale} user={dashboardUser} />
}

