import { UnifiedAuthForm } from '@/components/auth/UnifiedAuthForm'
import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server';

interface Props {
  params: { locale: string }
}

export const metadata: Metadata = {
  title: 'تسجيل الدخول - MJ CHAUFFAGE | Login - MJ CHAUFFAGE',
  description: 'تسجيل الدخول إلى حساب MJ CHAUFFAGE | Se connecter à votre compte MJ CHAUFFAGE',
}

// Force dynamic rendering to avoid SSG issues with useSearchParams
export const dynamic = 'force-dynamic'

export default function LoginPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return (
    <UnifiedAuthForm defaultTab="login" />
  )
}