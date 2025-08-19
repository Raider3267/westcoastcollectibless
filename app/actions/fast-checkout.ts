'use server'

export async function createSquareOrder(cartData: {
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  customerEmail: string
  billingInfo: any
  shippingInfo: any
}) {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3001'

    // Create line items for Square order
    const lineItems = cartData.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unitAmountCents: Math.round(item.price * 100)
    }))

    const response = await fetch(`${baseUrl}/api/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lineItems,
        customerEmail: cartData.customerEmail,
        metadata: {
          billingInfo: cartData.billingInfo,
          shippingInfo: cartData.shippingInfo
        }
      }),
    })

    const result = await response.json()

    if (result.success) {
      return {
        success: true,
        orderId: result.orderId,
        order: result.order
      }
    } else {
      return {
        success: false,
        error: result.error || 'Failed to create order'
      }
    }
  } catch (error: any) {
    console.error('Create order error:', error)
    return {
      success: false,
      error: error.message || 'Order creation failed'
    }
  }
}