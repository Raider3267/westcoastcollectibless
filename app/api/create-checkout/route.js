import { randomUUID } from "crypto"

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, unitAmountCents, quantity, redirectUrl } = body

    // Validate required fields
    if (!name || !unitAmountCents) {
      return Response.json(
        { error: "Missing required fields: name and unitAmountCents" },
        { status: 400 }
      )
    }

    const accessToken = process.env.SQUARE_ACCESS_TOKEN
    const locationId = process.env.SQUARE_LOCATION_ID
    const idempotencyKey = randomUUID()
    
    // Determine base URL for Square API
    const baseUrl = process.env.SQUARE_ENV === "production" 
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com"

    // Create order using Square Orders API (direct HTTP)
    const orderData = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: locationId,
        line_items: [{
          name,
          quantity: String(quantity || 1),
          base_price_money: {
            amount: parseInt(unitAmountCents),
            currency: "USD"
          }
        }]
      }
    }

    const orderResponse = await fetch(`${baseUrl}/v2/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18'
      },
      body: JSON.stringify(orderData)
    })

    const orderResult = await orderResponse.json()
    
    if (!orderResponse.ok) {
      console.error('Square API error:', orderResult)
      return Response.json(
        { error: `Square API error: ${JSON.stringify(orderResult.errors)}` },
        { status: 400 }
      )
    }

    // For demo purposes, return success URL
    // In production, you'd integrate with Square's hosted checkout
    const checkoutUrl = redirectUrl || (
      process.env.NEXT_PUBLIC_SITE_URL 
        ? process.env.NEXT_PUBLIC_SITE_URL + "/success"
        : "http://localhost:3000/success"
    )

    return Response.json({ 
      url: checkoutUrl,
      orderId: orderResult.order?.id,
      message: "Order created successfully via Square API"
    })

  } catch (error) {
    console.error('Checkout creation error:', error)
    return Response.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    )
  }
}