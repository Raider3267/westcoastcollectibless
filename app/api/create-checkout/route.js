import { randomUUID } from "crypto"

export async function POST(request) {
  try {
    const body = await request.json()
    const { lineItems, customerEmail, successUrl, cancelUrl, metadata } = body

    // Support both single item and line items formats
    let items = []
    if (lineItems && Array.isArray(lineItems)) {
      items = lineItems
    } else if (body.name && body.unitAmountCents) {
      // Legacy single item format
      items = [{
        name: body.name,
        quantity: body.quantity || 1,
        unitAmountCents: body.unitAmountCents
      }]
    }

    // Validate required fields
    if (!items.length) {
      return Response.json(
        { error: "Missing required fields: lineItems or name/unitAmountCents" },
        { status: 400 }
      )
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
        line_items: items.map(item => ({
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
    if (customerEmail) {
      orderData.order.reference_id = `email_${customerEmail.replace('@', '_at_')}_${Date.now()}`
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

    // Return order data for client-side payment processing
    return Response.json({ 
      success: true,
      orderId: orderResult.order?.id,
      order: orderResult.order,
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