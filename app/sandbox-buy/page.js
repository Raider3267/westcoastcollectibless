'use client'

import { useState } from 'react'

export default function SandboxBuyPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBuyNow = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "Sample Product",
          unitAmountCents: 2499,
          quantity: 1,
          redirectUrl: window.location.origin + "/success"
        })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.url) {
        window.location = data.url
      }
    } catch (err) {
      setError('Failed to create checkout')
      console.error('Checkout error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Square Checkout Test</h1>
          <p className="text-gray-600 text-sm">
            This is a test page for Square hosted checkout integration
          </p>
        </div>

        <div className="border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Sample Product</h3>
              <p className="text-gray-600 text-sm">Test item for Square checkout</p>
              <p className="text-xl font-bold text-green-600">$24.99</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleBuyNow}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {isLoading ? 'Creating checkout...' : 'Buy Now with Square'}
        </button>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-semibold mb-2">TODO for integration:</p>
          <p className="text-xs text-yellow-700">
            Wire your real product cards to call the /api/create-checkout endpoint with their name and price data. 
            Replace this test page with actual product components.
          </p>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to main site
          </a>
        </div>
      </div>
    </div>
  )
}