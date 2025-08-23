'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function QuickAdmin() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const key = searchParams.get('key')
    
    // Check for the admin key
    if (key === 'westcoast2025admin') {
      // Set admin session immediately
      sessionStorage.setItem('tempAdminAccess', 'true')
      sessionStorage.setItem('adminUser', JSON.stringify({
        email: 'jaydenreyes32@icloud.com',
        name: 'Jayden Reyes',
        isAdmin: true
      }))
      
      // Redirect to admin dashboard
      router.replace('/admin/dashboard')
    } else {
      // Show error message
      router.replace('/?error=invalid-admin-key')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pop-pink/20 to-pop-purple/20">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border">
        <div className="text-center">
          <img 
            src="/Logo.png" 
            alt="WestCoast Collectibles Logo" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Setting up admin access...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pop-purple mx-auto"></div>
        </div>
      </div>
    </div>
  )
}