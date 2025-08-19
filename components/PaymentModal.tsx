'use client'

import { useState, useEffect } from 'react'
import SquarePayment from './SquarePayment'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    price?: number | null
    image?: string | null
  }
}

export default function PaymentModal({ isOpen, onClose, product }: PaymentModalProps) {
  const [customerEmail, setCustomerEmail] = useState('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
      setShowPaymentForm(false)
      setCustomerEmail('')
    }
  }, [isOpen])

  const handleContinueToPayment = () => {
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = (receipt: any) => {
    console.log('Payment successful:', receipt)
    // You can add success tracking, redirect, or show a success message here
    setTimeout(() => {
      onClose()
    }, 3000)
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    // Handle payment error (show message, retry option, etc.)
  }

  if (!isVisible) return null

  const priceInCents = (product.price || 0) * 100

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Purchase {product.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Product Summary */}
          <div className="mb-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              {product.image && (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  ${product.price?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          {!showPaymentForm ? (
            // Customer Info Form
            <div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send you a receipt if you provide an email
                </p>
              </div>

              <button
                onClick={handleContinueToPayment}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          ) : (
            // Payment Form
            <SquarePayment
              amount={priceInCents}
              currency="USD"
              productName={product.name}
              productSku={product.id}
              customerEmail={customerEmail || undefined}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}

          {/* Security Notice */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-800">
                Payments are securely processed by Square
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}