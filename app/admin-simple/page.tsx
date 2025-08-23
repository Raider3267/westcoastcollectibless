'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SimpleAdmin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password === 'westcoast2025admin') {
      // Direct redirect without any session management
      window.location.href = '/admin-dash'
    } else {
      setError('Invalid password')
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
          <h1 className="text-2xl font-bold text-gray-900">Simple Admin Access</h1>
        </div>

        <form onSubmit={handleAccess} className="space-y-6">
          <div>
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
            className="w-full bg-gradient-to-r from-pop-purple to-pop-pink text-white py-3 px-6 rounded-xl font-medium"
          >
            {loading ? 'Accessing...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}