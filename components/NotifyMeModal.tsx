'use client'

import { useState, useEffect } from 'react'

export interface NotifyMeModalProps {
  isOpen: boolean
  productId: string
  productName: string
  onClose: () => void
}

export default function NotifyMeModal({ 
  isOpen, 
  productId, 
  productName, 
  onClose 
}: NotifyMeModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Submit notification request
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          email: email.trim(),
          created_at: new Date().toISOString()
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        setError('Failed to sign up for notifications. Please try again.')
      }
    } catch (error) {
      console.error('Notification signup error:', error)
      setError('Failed to sign up for notifications. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError('')
    setIsSuccess(false)
    setIsSubmitting(false)
    onClose()
  }

  // Focus management for modal
  useEffect(() => {
    if (isOpen) {
      // Store the element that had focus before opening modal
      const activeElement = document.activeElement as HTMLElement
      
      // Focus the modal after a brief delay
      setTimeout(() => {
        const modal = document.querySelector('[role="dialog"]') as HTMLElement
        if (modal) {
          modal.focus()
        }
      }, 100)
      
      return () => {
        // Return focus to the element that had focus before
        if (activeElement) {
          activeElement.focus()
        }
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg max-w-md w-full p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notify-modal-title"
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="notify-modal-title" className="text-xl font-semibold text-gray-900">
            Get alerted when this drops
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product info */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Product:</p>
          <p className="font-medium text-gray-900">{productName}</p>
        </div>

        {isSuccess ? (
          /* Success state */
          <div className="text-center py-4">
            <div className="text-green-600 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">You're all set!</h3>
            <p className="text-gray-600">
              We'll email you the moment it goes live.
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
                required
                aria-describedby={error ? 'email-error' : undefined}
              />
            </div>

            {error && (
              <div 
                id="email-error" 
                className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing up...
                  </div>
                ) : 'Notify Me'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}