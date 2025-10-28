'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, loading } = useAdminAuth()
  const isAuthenticated = !!user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
  const router = useRouter()

  useEffect(() => {
    console.log('🛡️ AdminAuthGuard: loading=', loading, 'user=', user)
    
    // Wait for loading to complete
    if (loading) {
      return
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      console.log('❌ AdminAuthGuard: Not authenticated, redirecting to login')
      router.replace('/admin/login')
      return
    }

    console.log('✅ AdminAuthGuard: Admin access granted!')
  }, [isAuthenticated, loading, router, user])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions administrateur...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Render protected content
  return <>{children}</>
}
