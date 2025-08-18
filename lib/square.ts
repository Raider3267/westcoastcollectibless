import { SquareClient, SquareEnvironment } from 'square'
import { randomUUID } from 'crypto'

// Handle BigInt serialization issue with Square SDK
BigInt.prototype.toJSON = function () {
  return this.toString()
}

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
    const { result } = await paymentsApi.create({
      idempotencyKey: randomUUID(),
      sourceId: paymentRequest.sourceId,
      amountMoney: paymentRequest.amountMoney,
      buyerEmailAddress: paymentRequest.buyerEmailAddress,
      note: paymentRequest.note,
      orderId: paymentRequest.orderId,
    })
    
    return {
      success: true,
      payment: result.payment,
      receipt: {
        id: result.payment?.id,
        orderId: result.payment?.orderId,
        amountMoney: result.payment?.amountMoney,
        status: result.payment?.status,
        receiptNumber: result.payment?.receiptNumber,
        receiptUrl: result.payment?.receiptUrl,
      }
    }
  } catch (error: any) {
    console.error('Square payment error:', error)
    return {
      success: false,
      error: error.errors ? error.errors[0] : { detail: 'Payment failed' },
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