'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Home, ArrowLeft } from 'lucide-react'

export default function LocalizedNotFound() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string || 'en'
  
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  const content = {
    ar: {
      title: 'الصفحة غير موجودة',
      description: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
      goHome: 'العودة للرئيسية',
      goBack: 'العودة للخلف',
      helpText: 'إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بفريق الدعم.'
    },
    fr: {
      title: 'Page non trouvée',
      description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
      goHome: 'Retour à l\'accueil',
      goBack: 'Retour',
      helpText: 'Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter notre équipe de support.'
    },
    en: {
      title: 'Page Not Found',
      description: 'The page you\'re looking for doesn\'t exist or has been moved.',
      goHome: 'Go Home',
      goBack: 'Go Back',
      helpText: 'If you believe this is an error, please contact our support team.'
    }
  }

  const t = content[locale as keyof typeof content] || content.en

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 ${isArabic ? 'rtl' : ''}`}>
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
          <div className="text-6xl mb-4">🔍</div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t.title}
        </h1>
        <p className="text-gray-600 mb-8">
          {t.description}
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href={`/${locale}`}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className={`h-5 w-5 ${isArabic ? 'ml-2' : 'mr-2'}`} />
            {t.goHome}
          </Link>
          
          <button
            onClick={() => router.back()}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className={`h-5 w-5 ${isArabic ? 'ml-2' : 'mr-2'}`} />
            {t.goBack}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>{t.helpText}</p>
        </div>
      </div>
    </div>
  )
}