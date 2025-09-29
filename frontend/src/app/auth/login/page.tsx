import { LoginForm } from '@/components/auth/LoginForm'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Access your MJ CHAUFFAGE account to manage orders and services"
    >
      <LoginForm />
    </AuthLayout>
  )
}

export const metadata = {
  title: 'Login | MJ CHAUFFAGE',
  description: 'Sign in to your MJ CHAUFFAGE account',
}