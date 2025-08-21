'use server'

import { createPayment, createCustomer, type PaymentRequest } from '../../lib/square'
import { sendEmailReceipt, type EmailReceiptData } from '../../lib/email'
import { type ShippingAddress } from '../../lib/shipping'

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
    items?: Array<{
      name: string
      sku: string
      quantity: number
      price: number
    }>
  },
  shippingAddress?: ShippingAddress,
  shippingCost?: number
) {
  console.log('Server: Processing payment with:', { sourceId, amount, currency, customerData, orderDetails, shippingAddress, shippingCost })
  
  try {
    // Create payment request with enhanced order details
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
    
    // Add shipping address if provided
    if (shippingAddress) {
      paymentRequest.shippingAddress = {
        address_line_1: shippingAddress.address,
        locality: shippingAddress.city,
        administrative_district_level_1: shippingAddress.state,
        postal_code: shippingAddress.zipCode,
        country: shippingAddress.country,
        first_name: shippingAddress.name.split(' ')[0],
        last_name: shippingAddress.name.split(' ').slice(1).join(' ') || ''
      }
    }
    
    // Add line items if provided
    if (orderDetails?.items && orderDetails.items.length > 0) {
      paymentRequest.lineItems = orderDetails.items.map(item => ({
        name: item.name,
        quantity: item.quantity.toString(),
        item_type: 'ITEM',
        base_price_money: {
          amount: item.price,
          currency: currency
        },
        variation_name: `SKU: ${item.sku}`
      }))
      
      // Add shipping as a line item if there's a shipping cost
      if (shippingCost && shippingCost > 0) {
        paymentRequest.lineItems.push({
          name: 'Shipping',
          quantity: '1',
          item_type: 'ITEM',
          base_price_money: {
            amount: shippingCost,
            currency: currency
          }
        })
      }
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

      // Send email receipt if customer email provided
      if (customerData?.email && paymentResult.receipt) {
        console.log('Server: Sending email receipt to:', customerData.email)
        
        const receiptData: EmailReceiptData = {
          customerEmail: customerData.email,
          receiptNumber: paymentResult.receipt.receiptNumber || 'N/A',
          receiptUrl: paymentResult.receipt.receiptUrl || '',
          orderTotal: amount,
          currency,
          orderItems: orderDetails?.items || [{
            name: 'Order',
            sku: 'unknown',
            quantity: 1,
            price: amount
          }],
          paymentMethod: 'Credit Card',
          transactionId: paymentResult.receipt.id,
          orderDate: new Date().toISOString(),
          shippingAddress,
          shippingCost
        }
        
        try {
          const emailResult = await sendEmailReceipt(receiptData)
          if (emailResult.success) {
            console.log('Server: Email receipt sent successfully')
          } else {
            console.error('Server: Failed to send email receipt:', emailResult.error)
          }
        } catch (emailError) {
          console.error('Server: Email receipt error:', emailError)
        }
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
    environment: process.env.SQUARE_ENV || 'sandbox',
  }
}