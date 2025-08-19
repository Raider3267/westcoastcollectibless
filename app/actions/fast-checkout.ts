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
    // Import and call the API route handler directly
    const { randomUUID } = await import('crypto')
    
    // Create line items for Square order
    const lineItems = cartData.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unitAmountCents: Math.round(item.price * 100)
    }))

    const accessToken = process.env.SQUARE_ACCESS_TOKEN
    const locationId = process.env.SQUARE_LOCATION_ID
    const idempotencyKey = randomUUID()
    
    // Determine base URL for Square API
    const baseUrl = process.env.SQUARE_ENVIRONMENT === "production" 
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com"

    // Create order using Square Orders API (direct HTTP)
    const orderData = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: locationId,
        line_items: lineItems.map(item => ({
          name: item.name,
          quantity: String(item.quantity || 1),
          base_price_money: {
            amount: parseInt(item.unitAmountCents),
            currency: "USD"
          }
        }))
      }
    }

    // Add customer email as reference (not fulfillment)
    if (cartData.customerEmail) {
      orderData.order.reference_id = `email_${cartData.customerEmail.replace('@', '_at_')}_${Date.now()}`
    }

    const response = await fetch(`${baseUrl}/v2/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18'
      },
      body: JSON.stringify(orderData)
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('Square API error:', result)
      return {
        success: false,
        error: result.errors ? result.errors[0].detail : 'Failed to create order'
      }
    }

    return {
      success: true,
      orderId: result.order?.id,
      order: result.order
    }
  } catch (error: any) {
    console.error('Create order error:', error)
    return {
      success: false,
      error: error.message || 'Order creation failed'
    }
  }
}