'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    const verifyAuth = async () => {
      // ✅ FIXED: Wait for loading to complete first
      if (isLoading) {
        console.log('⏳ Still loading authentication state...')
        return
      }

      // Check if authenticated after loading is complete
      if (!isAuthenticated) {
        console.log('❌ Not authenticated, redirecting to login')
        router.push('/admin/login')
        return
      }

      // Verify token is still valid with backend
      console.log('✅ Authenticated, verifying token with backend...')
      const isValid = await checkAuth()
      
      if (!isValid) {
        console.log('❌ Token invalid, redirecting to login')
        router.push('/admin/login')
      } else {
        console.log('✅ Token valid, access granted!')
      }
    }

    verifyAuth()
  }, [isAuthenticated, isLoading, checkAuth, router])

  // Show loading spinner while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions administrateur...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirection...</p>
        </div>
      </div>
    )
  }

  // Render protected content
  return <>{children}</>
}
