'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { GoogleLoginButton } from './GoogleLoginButton'

interface UnifiedAuthFormProps {
    defaultTab?: 'login' | 'register'
}

export function UnifiedAuthForm({ defaultTab = 'login' }: UnifiedAuthFormProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams?.get('registered') === '1') {
            setActiveTab('login')
        }
    }, [searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                        {activeTab === 'login' ? 'Bon retour parmi nous' : 'Créer un compte'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {activeTab === 'login'
                            ? 'Connectez-vous pour accéder à votre espace'
                            : 'Rejoignez-nous pour profiter de nos services'}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Google Sign In - Always visible at top */}
                    <div>
                        <GoogleLoginButton />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Ou avec email</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex rounded-md bg-gray-100 p-1">
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'login'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Se connecter
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === 'register'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            S'inscrire
                        </button>
                    </div>

                    {/* Forms */}
                    <div className="mt-6">
                        {activeTab === 'login' ? (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                <LoginForm hideGoogleButton={true} />
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <RegisterForm />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
