import { UnifiedAuthForm } from '@/components/auth/UnifiedAuthForm'
import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server';

interface Props {
  params: { locale: string }
}

export const metadata: Metadata = {
  title: 'التسجيل - MJ CHAUFFAGE | Register - MJ CHAUFFAGE',
  description: 'إنشاء حساب جديد في MJ CHAUFFAGE | Créer un nouveau compte MJ CHAUFFAGE',
}

// Force dynamic rendering to avoid SSG issues with useSearchParams
export const dynamic = 'force-dynamic'

export default function RegisterPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return (
    <UnifiedAuthForm defaultTab="register" />
  )
}