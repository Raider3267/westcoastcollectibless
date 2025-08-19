'use server'

export async function createSquareOrder(cartData: {
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    weight?: number
  }>
  customerEmail: string
  billingInfo: any
  shippingInfo: any
}) {
  try {
    // Import and call the API route handler directly
    const { randomUUID } = await import('crypto')
    const { calculateShippingRates, calculateCartWeight } = await import('../../lib/shipping')
    
    // Calculate shipping costs
    const shippingAddress = {
      name: `${cartData.shippingInfo.firstName} ${cartData.shippingInfo.lastName}`,
      address: cartData.shippingInfo.address,
      city: cartData.shippingInfo.city,
      state: cartData.shippingInfo.state,
      zipCode: cartData.shippingInfo.zipCode,
      country: cartData.shippingInfo.country || 'US'
    }
    
    // Calculate cart weight and shipping cost
    const cartItems = cartData.items.map(item => ({
      sku: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      weight: item.weight || 0.3 // Default weight for collectibles
    }))
    
    const totalWeight = calculateCartWeight(cartItems)
    const orderSubtotal = Math.round(cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100) // in cents
    const shippingRates = calculateShippingRates(shippingAddress, orderSubtotal, totalWeight)
    const cheapestShipping = shippingRates.length > 0 ? shippingRates[0] : { cost: 0, service: 'Free', description: 'No shipping cost' }
    
    // Create line items for Square order (products + shipping)
    const productLineItems = cartData.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unitAmountCents: Math.round(item.price * 100)
    }))
    
    // Add shipping as a line item if there's a cost
    const lineItems = [...productLineItems]
    if (cheapestShipping.cost > 0) {
      lineItems.push({
        name: `Shipping (${cheapestShipping.service})`,
        quantity: 1,
        unitAmountCents: cheapestShipping.cost
      })
    }

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
          name: item.name.length > 60 ? item.name.slice(0, 57) + '...' : item.name, // Truncate long names
          quantity: String(item.quantity || 1),
          base_price_money: {
            amount: parseInt(item.unitAmountCents),
            currency: "USD"
          }
        }))
      }
    }

    // Add customer email as reference (not fulfillment) - keep under 40 chars
    if (cartData.customerEmail) {
      const timestamp = Date.now().toString().slice(-6) // Last 6 digits
      const emailHash = cartData.customerEmail.slice(0, 20) // First 20 chars of email
      orderData.order.reference_id = `${emailHash}_${timestamp}`.slice(0, 40)
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
      order: result.order,
      shippingCost: cheapestShipping.cost,
      shippingAddress: shippingAddress,
      totalWeight: totalWeight
    }
  } catch (error: any) {
    console.error('Create order error:', error)
    return {
      success: false,
      error: error.message || 'Order creation failed'
    }
  }
}