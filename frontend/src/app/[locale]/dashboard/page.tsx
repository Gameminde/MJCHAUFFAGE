import { CustomerDashboard } from '@/components/customer/CustomerDashboard'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { authService } from '@/services/authService'
import { setRequestLocale } from 'next-intl/server'

interface Props {
  params: { locale: string }
}

export const metadata: Metadata = {
  title: 'لوحة التحكم - MJ CHAUFFAGE | Tableau de bord - MJ CHAUFFAGE',
  description: 'إدارة حسابك وطلباتك وخدماتك | Gérez votre compte, commandes et services',
}

export default function DashboardPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  // Note: In a real app, you'd get the user from server-side authentication
  // This is a simplified example for demonstration
  const user = {
    id: '1',
    firstName: 'أحمد',
    lastName: 'بن محمد',
    email: 'ahmed@example.com',
    phone: '+213 555 123 456',
    address: 'حي البدر، الجزائر العاصمة',
  }

  // Note: In a real app, route protection should be handled by middleware or a Higher-Order Component.

  return (
    <CustomerDashboard locale={locale} user={user} />
  )
}