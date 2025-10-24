'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { authApi, LoginRequest, LoginResponse } from '@/lib/api'

interface User {
  id: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  phone?: string
  createdAt?: string
  lastLoginAt?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('accessToken')
      
      if (token) {
        try {
          const userData = await authApi.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', error)
          Cookies.remove('accessToken')
          Cookies.remove('refreshToken')
        }
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      const response: LoginResponse = await authApi.login(credentials)
      
      // Stocker les tokens
      Cookies.set('accessToken', response.accessToken, { expires: 7 })
      Cookies.set('refreshToken', response.refreshToken, { expires: 30 })
      
      // Mettre à jour l'état utilisateur
      setUser(response.user)
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    // Rediriger immédiatement vers la page de connexion
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}