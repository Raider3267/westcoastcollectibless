'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load the admin dashboard to reduce main bundle size
const AdminDashboard = dynamic(() => import('../app/admin/dashboard/page'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pop-purple"></div>
    </div>
  ),
  ssr: false
})

export default function AdminDashboardLazy() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboard />
    </Suspense>
  )
}