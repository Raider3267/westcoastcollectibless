import { SquareClient, SquareEnvironment } from 'square'
import { randomUUID } from 'crypto'

// Note: Removed BigInt.prototype.toJSON override to let Square SDK handle BigInt properly

// Initialize Square Client
const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: SquareEnvironment.Sandbox,
})

export const paymentsApi = client.payments
export const customersApi = client.customers

export interface PaymentRequest {
  sourceId: string
  amountMoney: {
    amount: number // Amount in cents (e.g., $10.00 = 1000)
    currency: string
  }
  buyerEmailAddress?: string
  note?: string
  orderId?: string
}

export async function createPayment(paymentRequest: PaymentRequest) {
  try {
    // Ensure amount is a valid integer in cents
    const amountCents = Math.round(paymentRequest.amountMoney.amount)
    
    console.log('Creating payment with amount:', amountCents, 'type:', typeof amountCents)
    
    // Clean payload - remove undefined fields that might cause parsing issues
    const paymentData: any = {
      idempotency_key: randomUUID(),
      source_id: paymentRequest.sourceId,
      amount_money: {
        amount: amountCents,
        currency: paymentRequest.amountMoney.currency
      }
    }
    
    // Only add optional fields if they exist
    if (paymentRequest.buyerEmailAddress) {
      paymentData.buyer_email_address = paymentRequest.buyerEmailAddress
    }
    if (paymentRequest.note) {
      paymentData.note = paymentRequest.note
    }
    if (paymentRequest.orderId) {
      paymentData.order_id = paymentRequest.orderId
    }
    
    console.log('Clean payment data:', JSON.stringify(paymentData, null, 2))
    
    const response = await fetch('https://connect.squareupsandbox.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18'
      },
      body: JSON.stringify(paymentData)
    })
    
    const result = await response.json()
    console.log('Square API response:', result)
    
    if (response.ok && result.payment) {
      return {
        success: true,
        payment: result.payment,
        receipt: {
          id: result.payment.id,
          orderId: result.payment.order_id,
          amountMoney: result.payment.amount_money,
          status: result.payment.status,
          receiptNumber: result.payment.receipt_number,
          receiptUrl: result.payment.receipt_url,
        }
      }
    } else {
      console.error('Square API error:', result)
      return {
        success: false,
        error: result.errors ? result.errors[0] : { detail: 'Payment failed' },
      }
    }
  } catch (error: any) {
    console.error('Square payment error:', error)
    return {
      success: false,
      error: { detail: 'Payment processing failed' },
    }
  }
}

export async function createCustomer(customerData: {
  emailAddress?: string
  givenName?: string
  familyName?: string
  phoneNumber?: string
}) {
  try {
    const { result } = await customersApi.create({
      emailAddress: customerData.emailAddress,
      givenName: customerData.givenName,
      familyName: customerData.familyName,
      phoneNumber: customerData.phoneNumber,
    })
    
    return {
      success: true,
      customer: result.customer,
    }
  } catch (error: any) {
    console.error('Square customer creation error:', error)
    return {
      success: false,
      error: error.errors ? error.errors[0] : { detail: 'Customer creation failed' },
    }
  }
}