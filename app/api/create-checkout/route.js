import { randomUUID } from "crypto"
import { Client, Environment } from "squareup"

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

    // Initialize Square client
    const accessToken = process.env.SQUARE_ACCESS_TOKEN
    const environment = process.env.SQUARE_ENV === "production" 
      ? Environment.Production 
      : Environment.Sandbox

    const client = new Client({
      accessToken,
      environment
    })

    const locationId = process.env.SQUARE_LOCATION_ID
    const idempotencyKey = randomUUID()

    // Create checkout
    const { result } = await client.checkoutApi.createCheckout(locationId, {
      idempotencyKey,
      order: {
        locationId,
        lineItems: [{
          name,
          quantity: String(quantity || 1),
          basePriceMoney: {
            amount: Number(unitAmountCents),
            currency: "USD"
          }
        }]
      },
      redirectUrl: redirectUrl || (
        process.env.NEXT_PUBLIC_SITE_URL 
          ? process.env.NEXT_PUBLIC_SITE_URL + "/success"
          : "http://localhost:3000/success"
      )
    })

    return Response.json({ url: result.checkout.checkoutPageUrl })

  } catch (error) {
    console.error('Checkout creation error:', error)
    return Response.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    )
  }
}