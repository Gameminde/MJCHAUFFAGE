import { redirect } from 'next/navigation'

export default function AdminRootPage() {
  // /admin always redirects to /admin/dashboard
  redirect('/admin/dashboard')
}
