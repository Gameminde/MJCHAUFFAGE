'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService, User } from '@/lib/auth'

interface PublicAuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
  }) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

const PublicAuthContext = createContext<PublicAuthContextType | undefined>(undefined)

export function PublicAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch if there's a token
    if (authService.isAuthenticated()) {
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const user = await authService.loginCustomer(email, password)
      if (user) {
        setUser(user)
        return true
      }
      return false
    } catch (error) {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
  }) => {
    setIsLoading(true)
    try {
      const response = await authService.registerCustomer(data)
      if (response.success && response.data?.user) {
        setUser(response.data.user)
      }
      return response
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const refetch = async () => {
    setIsLoading(true)
    await fetchUser()
  }

  return (
    <PublicAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refetch
      }}
    >
      {children}
    </PublicAuthContext.Provider>
  )
}

export function usePublicAuth() {
  const context = useContext(PublicAuthContext)
  if (context === undefined) {
    throw new Error('usePublicAuth must be used within PublicAuthProvider')
  }
  return context
}


