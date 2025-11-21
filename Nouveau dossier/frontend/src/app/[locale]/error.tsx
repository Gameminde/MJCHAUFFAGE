'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function LocalizedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const locale = params?.locale as string || 'en'
  const isArabic = locale === 'ar'

  const content = {
    ar: {
      title: 'حدث خطأ ما!',
      description: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم إذا استمرت المشكلة.',
      tryAgain: 'حاول مرة أخرى',
      goHome: 'العودة للرئيسية',
      helpText: 'إذا استمر هذا الخطأ، يرجى الاتصال بفريق الدعم مع معرف الخطأ أعلاه.',
      errorDetails: 'تفاصيل الخطأ:',
      errorId: 'معرف الخطأ:'
    },
    fr: {
      title: 'Une erreur s\'est produite !',
      description: 'Une erreur inattendue s\'est produite. Veuillez réessayer ou contacter le support si le problème persiste.',
      tryAgain: 'Réessayer',
      goHome: 'Retour à l\'accueil',
      helpText: 'Si cette erreur continue, veuillez contacter notre équipe de support avec l\'ID d\'erreur ci-dessus.',
      errorDetails: 'Détails de l\'erreur :',
      errorId: 'ID d\'erreur :'
    },
    en: {
      title: 'Something went wrong!',
      description: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      tryAgain: 'Try Again',
      goHome: 'Go Home',
      helpText: 'If this error continues, please contact our support team with the error ID above.',
      errorDetails: 'Error Details:',
      errorId: 'Error ID:'
    }
  }

  const t = content[locale as keyof typeof content] || content.en

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 ${isArabic ? 'rtl' : ''}`}>
      <div className="max-w-md w-full text-center">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <div className="text-6xl mb-4">⚠️</div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t.title}
        </h1>
        <p className="text-gray-600 mb-8">
          {t.description}
        </p>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="font-semibold text-gray-800 mb-2">{t.errorDetails}</h3>
            <p className="text-sm text-gray-600 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                {t.errorId} {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${isArabic ? 'ml-2' : 'mr-2'}`} />
            {t.tryAgain}
          </button>
          
          <Link
            href={`/${locale}`}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Home className={`h-5 w-5 ${isArabic ? 'ml-2' : 'mr-2'}`} />
            {t.goHome}
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>{t.helpText}</p>
        </div>
      </div>
    </div>
  )
}