import { AuthForm } from '@/components/auth/AuthForm'
import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server';

interface Props {
  params: { locale: string }
}

export const metadata: Metadata = {
  title: 'تسجيل الدخول - MJ CHAUFFAGE | Login - MJ CHAUFFAGE',
  description: 'تسجيل الدخول إلى حساب MJ CHAUFFAGE | Se connecter à votre compte MJ CHAUFFAGE',
}

export default function LoginPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return (
    <AuthForm mode="login" locale={locale} />
  )
}