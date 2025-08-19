export interface ShippingAddress {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface ShippingRate {
  service: string
  cost: number // in cents
  estimatedDays: string
  description: string
}

export interface CartItem {
  sku: string
  name: string
  quantity: number
  price: number
  weight?: number // in lbs
}

// Calculate total weight from cart items
export function calculateCartWeight(items: CartItem[]): number {
  return items.reduce((totalWeight, item) => {
    const itemWeight = item.weight || 0.5 // Default 0.5 lbs if no weight specified
    return totalWeight + (itemWeight * item.quantity)
  }, 0)
}

// Weight-based shipping rates (base cost + per lb cost, all in cents)
const SHIPPING_ZONES = {
  US: {
    'standard': { 
      baseCost: 399, // $3.99 base
      perLbCost: 200, // $2.00 per lb
      days: '5-7', 
      description: 'Standard Ground Shipping',
      maxWeight: 50 // 50 lbs max
    },
    'expedited': { 
      baseCost: 899, // $8.99 base
      perLbCost: 300, // $3.00 per lb
      days: '2-3', 
      description: 'Expedited Shipping',
      maxWeight: 30 // 30 lbs max
    },
    'overnight': { 
      baseCost: 1899, // $18.99 base
      perLbCost: 500, // $5.00 per lb
      days: '1', 
      description: 'Overnight Express',
      maxWeight: 20 // 20 lbs max
    }
  },
  CA: {
    'standard': { 
      baseCost: 999, // $9.99 base
      perLbCost: 350, // $3.50 per lb
      days: '7-14', 
      description: 'International Standard',
      maxWeight: 40
    },
    'expedited': { 
      baseCost: 1999, // $19.99 base
      perLbCost: 600, // $6.00 per lb
      days: '3-5', 
      description: 'International Express',
      maxWeight: 25
    }
  },
  INTERNATIONAL: {
    'standard': { 
      baseCost: 1499, // $14.99 base
      perLbCost: 500, // $5.00 per lb
      days: '10-21', 
      description: 'International Standard',
      maxWeight: 30
    },
    'expedited': { 
      baseCost: 2999, // $29.99 base
      perLbCost: 800, // $8.00 per lb
      days: '5-10', 
      description: 'International Express',
      maxWeight: 20
    }
  }
}

// Weight thresholds for free shipping (weight in lbs, order value in cents)
const FREE_SHIPPING_RULES = {
  US: {
    minOrderValue: 7500, // $75.00
    maxWeight: 5 // Free shipping only for orders under 5 lbs
  }
}

// Free shipping thresholds (in cents)
const FREE_SHIPPING_THRESHOLD = 7500 // $75.00

export function calculateShippingRates(
  address: ShippingAddress, 
  orderSubtotal: number, // in cents
  totalWeight: number = 1 // in lbs, required for weight-based shipping
): ShippingRate[] {
  const country = address.country.toUpperCase()
  
  // Determine shipping zone
  let zone: keyof typeof SHIPPING_ZONES
  if (country === 'US' || country === 'USA') {
    zone = 'US'
  } else if (country === 'CA' || country === 'CANADA') {
    zone = 'CA'
  } else {
    zone = 'INTERNATIONAL'
  }
  
  const rates = SHIPPING_ZONES[zone]
  const shippingRates: ShippingRate[] = []
  
  // Check for free shipping eligibility (US only, order value + weight restrictions)
  const freeShippingRules = FREE_SHIPPING_RULES[zone as keyof typeof FREE_SHIPPING_RULES]
  const qualifiesForFreeShipping = freeShippingRules && 
    orderSubtotal >= freeShippingRules.minOrderValue && 
    totalWeight <= freeShippingRules.maxWeight
  
  Object.entries(rates).forEach(([service, rate]) => {
    // Skip if weight exceeds service limit
    if (totalWeight > rate.maxWeight) {
      return // Skip this service
    }
    
    // Calculate weight-based cost: base cost + (weight * per-lb cost)
    let cost = rate.baseCost + Math.ceil(totalWeight * rate.perLbCost)
    
    // Apply free shipping for qualifying US orders
    if (qualifiesForFreeShipping && service === 'standard') {
      cost = 0
    }
    
    // Add weight info to description
    const weightInfo = totalWeight > rate.maxWeight ? 
      ` (Exceeds ${rate.maxWeight}lb limit)` : 
      ` (${totalWeight}lbs)`
    
    shippingRates.push({
      service,
      cost,
      estimatedDays: rate.days,
      description: cost === 0 ? 
        `${rate.description} (FREE!)${weightInfo}` : 
        `${rate.description}${weightInfo}`
    })
  })
  
  // Sort by cost (cheapest first)
  return shippingRates.sort((a, b) => a.cost - b.cost)
}

export function getFastestShippingRate(address: ShippingAddress, orderSubtotal: number, totalWeight: number): ShippingRate {
  const rates = calculateShippingRates(address, orderSubtotal, totalWeight)
  
  // Return the fastest option (shortest estimated days)
  return rates.reduce((fastest, current) => {
    const fastestDays = parseInt(fastest.estimatedDays.split('-')[0])
    const currentDays = parseInt(current.estimatedDays.split('-')[0])
    return currentDays < fastestDays ? current : fastest
  })
}

export function getCheapestShippingRate(address: ShippingAddress, orderSubtotal: number, totalWeight: number): ShippingRate {
  const rates = calculateShippingRates(address, orderSubtotal, totalWeight)
  
  // Return the cheapest option
  return rates.reduce((cheapest, current) => 
    current.cost < cheapest.cost ? current : cheapest
  )
}

// Validate shipping address
export function validateShippingAddress(address: Partial<ShippingAddress>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!address.name?.trim()) {
    errors.push('Name is required')
  }
  
  if (!address.address?.trim()) {
    errors.push('Address is required')
  }
  
  if (!address.city?.trim()) {
    errors.push('City is required')
  }
  
  if (!address.state?.trim()) {
    errors.push('State/Province is required')
  }
  
  if (!address.zipCode?.trim()) {
    errors.push('ZIP/Postal code is required')
  }
  
  if (!address.country?.trim()) {
    errors.push('Country is required')
  }
  
  // Basic ZIP code validation for US
  if (address.country === 'US' && address.zipCode) {
    const zipRegex = /^\d{5}(-\d{4})?$/
    if (!zipRegex.test(address.zipCode)) {
      errors.push('Invalid US ZIP code format (should be 12345 or 12345-6789)')
    }
  }
  
  // Basic postal code validation for Canada
  if (address.country === 'CA' && address.zipCode) {
    const postalRegex = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/
    if (!postalRegex.test(address.zipCode)) {
      errors.push('Invalid Canadian postal code format (should be A1A 1A1)')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get shipping zones for display
export function getAvailableShippingCountries(): Array<{ code: string; name: string }> {
  return [
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
    // Add more countries as needed
  ]
}

// Get US states for dropdown
export function getUSStates(): Array<{ code: string; name: string }> {
  return [
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
}