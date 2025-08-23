'use client'

import { useState } from 'react'

export default function AdminBypass() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simple password check for temporary admin access
    if (password === 'westcoast2025admin') {
      try {
        // Set temporary admin session
        sessionStorage.setItem('tempAdminAccess', 'true')
        sessionStorage.setItem('adminUser', JSON.stringify({
          email: 'jaydenreyes32@icloud.com',
          name: 'Jayden Reyes',
          isAdmin: true
        }))
        
        // Set cookie for middleware to recognize
        document.cookie = 'temp-admin-access=true; path=/; max-age=86400' // 24 hours
        
        // Use window.location instead of router to avoid React navigation issues
        window.location.href = '/admin/dashboard'
      } catch (error) {
        setError('Failed to set admin session')
        setLoading(false)
      }
    } else {
      setError('Invalid admin password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pop-pink/20 to-pop-purple/20">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border">
        <div className="text-center mb-8">
          <img 
            src="/Logo.png" 
            alt="WestCoast Collectibles Logo" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Temporary Admin Access</h1>
          <p className="text-gray-600 mt-2">Enter admin password for direct access</p>
        </div>

        <form onSubmit={handleAccess} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pop-purple focus:border-transparent"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pop-purple to-pop-pink text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Accessing...' : 'Access Admin Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Temporary access method while main authentication is being fixed
          </p>
        </div>
      </div>
    </div>
  )
}