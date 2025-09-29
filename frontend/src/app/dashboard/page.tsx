import { CustomerDashboard } from '@/components/customer/CustomerDashboard'
import { requireAuth } from '@/lib/auth'

export default async function DashboardPage() {
  // This would check for customer authentication in a real app
  // const user = await requireAuth(['CUSTOMER'])
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <CustomerDashboard />
    </div>
  )
}

export const metadata = {
  title: 'Dashboard | MJ CHAUFFAGE',
  description: 'Your personal MJ CHAUFFAGE dashboard',
}