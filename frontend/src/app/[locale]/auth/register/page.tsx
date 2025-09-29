import { AuthForm } from '@/components/auth/AuthForm'
import { Metadata } from 'next'

interface Props {
  params: { locale: string }
}

export const metadata: Metadata = {
  title: 'إنشاء حساب - MJ CHAUFFAGE | Créer un compte - MJ CHAUFFAGE',
  description: 'إنشاء حساب جديد في MJ CHAUFFAGE | Créer un nouveau compte MJ CHAUFFAGE',
}

export default function RegisterPage({ params: { locale } }: Props) {
  return (
    <AuthForm mode="register" locale={locale} />
  )
}