import { RegisterForm } from '@/components/auth/RegisterForm'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join MJ CHAUFFAGE to access professional heating solutions"
    >
      <RegisterForm />
    </AuthLayout>
  )
}

export const metadata = {
  title: 'Register | MJ CHAUFFAGE',
  description: 'Create your MJ CHAUFFAGE account',
}