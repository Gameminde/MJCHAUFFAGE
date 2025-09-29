
export default function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Welcome to the admin dashboard. This is a test page to verify routing works.</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800">System Status</h2>
          <p className="text-blue-600">✅ Admin routing is working correctly</p>
          <p className="text-blue-600">✅ Layout is rendering properly</p>
        </div>
      </div>
    </div>
  );
}
