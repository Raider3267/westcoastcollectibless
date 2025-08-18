'use server'

import { createPayment, createCustomer, type PaymentRequest } from '../../lib/square'

export async function submitPayment(
  sourceId: string,
  amount: number, // Amount in cents
  currency: string = 'USD',
  customerData?: {
    email?: string
    firstName?: string
    lastName?: string
    phone?: string
  },
  orderDetails?: {
    orderId?: string
    note?: string
  }
) {
  console.log('Server: Processing payment with:', { sourceId, amount, currency, customerData, orderDetails })
  
  try {
    // Create payment request
    const paymentRequest: PaymentRequest = {
      sourceId,
      amountMoney: {
        amount,
        currency,
      },
      buyerEmailAddress: customerData?.email,
      note: orderDetails?.note,
      orderId: orderDetails?.orderId,
    }

    console.log('Server: Created payment request:', paymentRequest)

    // Process payment
    const paymentResult = await createPayment(paymentRequest)

    console.log('Server: Payment result from Square:', paymentResult)

    if (paymentResult.success) {
      // Optionally create customer record if email provided
      if (customerData?.email) {
        console.log('Server: Creating customer record for:', customerData.email)
        await createCustomer({
          emailAddress: customerData.email,
          givenName: customerData.firstName,
          familyName: customerData.lastName,
          phoneNumber: customerData.phone,
        })
      }

      return {
        success: true,
        receipt: paymentResult.receipt,
        message: 'Payment successful!',
      }
    } else {
      console.error('Server: Payment failed:', paymentResult.error)
      return {
        success: false,
        error: paymentResult.error,
        message: paymentResult.error?.detail || 'Payment failed',
      }
    }
  } catch (error) {
    console.error('Server: Payment submission error:', error)
    return {
      success: false,
      error: { detail: 'Payment processing failed' },
      message: 'An error occurred while processing your payment',
    }
  }
}

export async function getSquareConfig() {
  return {
    appId: process.env.SQUARE_APP_ID!,
    locationId: process.env.SQUARE_LOCATION_ID!,
    environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
  }
}