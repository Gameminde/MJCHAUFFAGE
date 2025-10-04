
import { DashboardOverview } from '@/components/admin/DashboardOverview'

export default function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <DashboardOverview />
    </div>
  );
}
