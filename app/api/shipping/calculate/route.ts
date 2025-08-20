import { NextRequest, NextResponse } from 'next/server'
import { calculateShippingRates, validateShippingAddress, calculateCartWeight, type ShippingAddress, type CartItem } from '../../../../lib/shipping'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, orderSubtotal, cartItems } = body
    
    // Validate input
    if (!address || typeof orderSubtotal !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: address and orderSubtotal' },
        { status: 400 }
      )
    }
    
    // Validate shipping address
    const validation = validateShippingAddress(address)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid shipping address', details: validation.errors },
        { status: 400 }
      )
    }
    
    // Calculate total weight from cart items
    const totalWeight = cartItems ? calculateCartWeight(cartItems as CartItem[]) : 1 // Default 1 lb if no items provided
    
    // Calculate shipping rates with weight
    const shippingRates = calculateShippingRates(address as ShippingAddress, orderSubtotal, totalWeight)
    
    return NextResponse.json({
      success: true,
      rates: shippingRates,
      address: address,
      orderSubtotal: orderSubtotal,
      totalWeight: totalWeight,
      cartItems: cartItems || []
    })
    
  } catch (error) {
    console.error('Shipping calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate shipping rates' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve shipping zones and countries
export async function GET() {
  try {
    const countries = [
      { code: 'US', name: 'United States' },
      { code: 'CA', name: 'Canada' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'AU', name: 'Australia' },
      { code: 'DE', name: 'Germany' },
      { code: 'FR', name: 'France' },
      { code: 'JP', name: 'Japan' },
      { code: 'KR', name: 'South Korea' },
      { code: 'SG', name: 'Singapore' },
      { code: 'HK', name: 'Hong Kong' },
    ]
    
    const states = [
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
      { code: 'DE', name: 'Delaware' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' },
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'MO', name: 'Missouri' },
      { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'OR', name: 'Oregon' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' },
      { code: 'WI', name: 'Wisconsin' },
      { code: 'WY', name: 'Wyoming' },
    ]
    
    return NextResponse.json({
      countries,
      states,
      info: {
        freeShippingThreshold: 7500, // $75.00 in cents
        freeShippingCountries: ['US']
      }
    })
    
  } catch (error) {
    console.error('Error fetching shipping info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping information' },
      { status: 500 }
    )
  }
}