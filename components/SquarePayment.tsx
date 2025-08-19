'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  GooglePay, 
  ApplePay, 
  PaymentForm,
  type TokenResult
} from 'react-square-web-payments-sdk'
import { submitPayment, getSquareConfig } from '../app/actions/square'

interface SquarePaymentProps {
  amount: number // Amount in cents
  currency?: string
  productName: string
  productSku: string
  onSuccess?: (receipt: any) => void
  onError?: (error: any) => void
  customerEmail?: string
  orderId?: string
}

export default function SquarePayment({ 
  amount, 
  currency = 'USD', 
  productName, 
  productSku,
  onSuccess,
  onError,
  customerEmail,
  orderId
}: SquarePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  // Get Square credentials from environment variables
  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID!
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
  
  // Debug logging to check if credentials are loaded
  console.log('Square App ID:', appId)
  console.log('Square Location ID:', locationId)
  
  if (!appId || !locationId) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-semibold">Configuration Error</h3>
        <p>Square payment credentials are not configured. Please check your environment variables.</p>
      </div>
    )
  }

  const handlePaymentSubmit = async (token: TokenResult) => {
    console.log('Payment form submitted with token:', token)
    setIsProcessing(true)
    setPaymentStatus('idle')
    setErrorMessage('')

    try {
      console.log('Submitting payment with amount:', amount, 'currency:', currency)
      const result = await submitPayment(
        token.token,
        amount,
        currency,
        customerEmail ? {
          email: customerEmail
        } : undefined,
        {
          note: `Purchase of ${productName} (SKU: ${productSku})`,
        }
      )

      console.log('Payment result:', result)

      if (result.success) {
        console.log('Payment successful!')
        setPaymentStatus('success')
        onSuccess?.(result.receipt)
      } else {
        console.log('Payment failed:', result.error)
        setPaymentStatus('error')
        setErrorMessage(result.message || 'Payment failed')
        onError?.(result.error)
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStatus('error')
      setErrorMessage('An unexpected error occurred')
      onError?.(error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentStatus === 'success') {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 text-green-600">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Thank you for your purchase of {productName}</p>
      </div>
    )
  }

  return (
    <div className="square-payment-form">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Purchase</h3>
        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
          <span className="text-gray-700">{productName}</span>
          <span className="font-semibold text-gray-900">
            ${(amount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {paymentStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <PaymentForm
        applicationId={appId}
        locationId={locationId}
        cardTokenizeResponseReceived={handlePaymentSubmit}
        createPaymentRequest={() => ({
          countryCode: 'US',
          currencyCode: currency,
          total: {
            amount: (amount / 100).toString(),
            label: productName,
          },
        })}
      >
        <div className="space-y-4">
          <CreditCard 
            includeInputLabels
          />
          
          <div className="flex gap-3">
            <div className="flex-1">
              <ApplePay />
            </div>
            <div className="flex-1">
              <GooglePay />
            </div>
          </div>
        </div>
      </PaymentForm>

      {isProcessing && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-blue-100">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing payment...
          </div>
        </div>
      )}
    </div>
  )
}