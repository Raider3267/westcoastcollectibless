'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Use proper email-based authentication
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Check if user is admin by calling a check endpoint
        const adminCheck = await fetch('/api/auth/me')
        const adminData = await adminCheck.json()
        
        if (adminData.user && adminData.isAdmin) {
          router.push('/admin/dashboard')
        } else {
          setError('Access denied. Admin privileges required.')
        }
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    }
    
    setLoading(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Access your store dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pop-purple focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pop-purple focus:border-transparent"
              placeholder="Enter password"
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
            className="w-full bg-gradient-to-r from-pop-purple to-pop-pink text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-2">Demo Credentials:</h3>
          <p className="text-sm text-gray-600">Username: <code className="bg-white px-2 py-1 rounded">admin</code></p>
          <p className="text-sm text-gray-600">Password: <code className="bg-white px-2 py-1 rounded">westcoast2025</code></p>
        </div>
      </div>
    </div>
  )
}