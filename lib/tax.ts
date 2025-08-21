// Sales tax calculation utility
// California-based business with tax obligations

interface TaxCalculationParams {
  subtotal: number // in dollars
  shippingCost?: number // in dollars  
  state: string
  zipCode?: string
}

interface TaxResult {
  taxRate: number // as decimal (e.g., 0.0875 for 8.75%)
  taxAmount: number // in dollars
  total: number // subtotal + shipping + tax
}

// California base rate + typical local rates by major areas
const CA_TAX_RATES: Record<string, number> = {
  // State rate 7.25% + local rates
  'default': 0.0725, // Base CA rate
  
  // Major cities with higher local rates
  'los_angeles': 0.1000, // 10%
  'san_francisco': 0.0875, // 8.75%
  'oakland': 0.1025, // 10.25%
  'san_diego': 0.0775, // 7.75%
  'san_jose': 0.0925, // 9.25%
  'sacramento': 0.0825, // 8.25%
  'long_beach': 0.1025, // 10.25%
  'anaheim': 0.0775, // 7.75%
  'santa_monica': 0.1000, // 10%
  'beverly_hills': 0.1000, // 10%
  'west_hollywood': 0.1000, // 10%
  
  // Major ZIP code prefixes
  '900': 0.1000, // LA area
  '901': 0.1000, // LA area  
  '902': 0.1000, // LA area
  '903': 0.1000, // LA area
  '904': 0.1000, // LA area
  '905': 0.1000, // LA area
  '906': 0.1000, // LA area
  '907': 0.1000, // LA area
  '908': 0.1000, // LA area
  '910': 0.1000, // LA area
  '911': 0.1000, // LA area
  '912': 0.1000, // LA area
  '913': 0.1000, // LA area
  '914': 0.1000, // LA area
  '915': 0.1000, // LA area
  '916': 0.0825, // Sacramento
  '917': 0.1000, // LA area
  '918': 0.1000, // LA area
  '919': 0.1000, // LA area
  '920': 0.1000, // LA area
  '921': 0.1000, // LA area
  '922': 0.1000, // LA area
  '923': 0.1000, // LA area
  '924': 0.1000, // LA area
  '925': 0.0900, // East Bay
  '926': 0.0900, // East Bay
  '927': 0.0900, // East Bay
  '928': 0.0900, // East Bay
  '930': 0.0900, // Central Valley
  '931': 0.0900, // Central Valley
  '932': 0.0900, // Central Valley
  '933': 0.0900, // Central Valley
  '934': 0.0900, // Central Valley
  '935': 0.0900, // Central Valley
  '936': 0.0900, // Central Valley
  '937': 0.0900, // Central Valley
  '938': 0.0900, // Central Valley
  '939': 0.0900, // Central Valley
  '940': 0.0875, // SF Bay Area
  '941': 0.0875, // SF Bay Area
  '942': 0.0875, // SF Bay Area
  '943': 0.0875, // SF Bay Area
  '944': 0.0875, // SF Bay Area
  '945': 0.0875, // SF Bay Area
  '946': 0.0875, // SF Bay Area
  '947': 0.0875, // SF Bay Area
  '948': 0.0875, // SF Bay Area
  '949': 0.0825, // Orange County
  '950': 0.0900, // Central Valley
  '951': 0.0900, // Riverside
  '952': 0.0900, // Riverside  
  '953': 0.0900, // Central Valley
  '954': 0.0900, // Central Valley
  '955': 0.0900, // Central Valley
  '956': 0.0900, // Central Valley
  '957': 0.0900, // Central Valley
  '958': 0.0900, // Central Valley
  '959': 0.0900, // Central Valley
  '960': 0.0900, // Central Valley
  '961': 0.0900, // Central Valley
}

// States where we need to collect sales tax (nexus states)
// Start with California since that's where the business is based
const NEXUS_STATES = new Set(['CA', 'CALIFORNIA'])

/**
 * Calculate sales tax for an order
 */
export function calculateSalesTax(params: TaxCalculationParams): TaxResult {
  const { subtotal, shippingCost = 0, state, zipCode } = params
  
  // Normalize state
  const normalizedState = state.toUpperCase().trim()
  
  // Check if we have tax nexus in this state
  if (!NEXUS_STATES.has(normalizedState)) {
    return {
      taxRate: 0,
      taxAmount: 0,
      total: subtotal + shippingCost
    }
  }
  
  // Get tax rate for California
  let taxRate = CA_TAX_RATES.default
  
  if (zipCode) {
    const zip = zipCode.replace(/[^0-9]/g, '') // Remove non-numeric chars
    
    // Try exact city matches first
    const cityKey = getCityKeyFromZip(zip)
    if (cityKey && CA_TAX_RATES[cityKey]) {
      taxRate = CA_TAX_RATES[cityKey]
    } else {
      // Try ZIP prefix match
      const zipPrefix = zip.substring(0, 3)
      if (CA_TAX_RATES[zipPrefix]) {
        taxRate = CA_TAX_RATES[zipPrefix]
      }
    }
  }
  
  // Calculate tax on subtotal only (shipping typically not taxed in CA for most items)
  const taxableAmount = subtotal
  const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100 // Round to nearest cent
  const total = subtotal + shippingCost + taxAmount
  
  return {
    taxRate,
    taxAmount,
    total
  }
}

/**
 * Helper to get city key from ZIP code for major cities
 */
function getCityKeyFromZip(zip: string): string | null {
  // Major city ZIP code mappings
  const cityZips: Record<string, string> = {
    // Los Angeles area
    '90001': 'los_angeles', '90002': 'los_angeles', '90003': 'los_angeles',
    '90210': 'beverly_hills', '90211': 'beverly_hills', '90212': 'beverly_hills',
    '90069': 'west_hollywood', '90048': 'west_hollywood',
    '90401': 'santa_monica', '90402': 'santa_monica', '90403': 'santa_monica',
    
    // San Francisco
    '94102': 'san_francisco', '94103': 'san_francisco', '94104': 'san_francisco',
    '94105': 'san_francisco', '94107': 'san_francisco', '94108': 'san_francisco',
    '94109': 'san_francisco', '94110': 'san_francisco', '94111': 'san_francisco',
    '94112': 'san_francisco', '94114': 'san_francisco', '94115': 'san_francisco',
    '94116': 'san_francisco', '94117': 'san_francisco', '94118': 'san_francisco',
    '94121': 'san_francisco', '94122': 'san_francisco', '94123': 'san_francisco',
    '94124': 'san_francisco', '94127': 'san_francisco', '94131': 'san_francisco',
    '94132': 'san_francisco', '94133': 'san_francisco', '94134': 'san_francisco',
    
    // Oakland
    '94601': 'oakland', '94602': 'oakland', '94603': 'oakland', '94605': 'oakland',
    '94606': 'oakland', '94607': 'oakland', '94608': 'oakland', '94609': 'oakland',
    '94610': 'oakland', '94611': 'oakland', '94612': 'oakland',
    
    // San Diego
    '92101': 'san_diego', '92102': 'san_diego', '92103': 'san_diego',
    '92104': 'san_diego', '92105': 'san_diego', '92106': 'san_diego',
    '92107': 'san_diego', '92108': 'san_diego', '92109': 'san_diego',
    '92110': 'san_diego', '92111': 'san_diego', '92113': 'san_diego',
    
    // San Jose
    '95110': 'san_jose', '95111': 'san_jose', '95112': 'san_jose',
    '95113': 'san_jose', '95116': 'san_jose', '95117': 'san_jose',
    '95118': 'san_jose', '95119': 'san_jose', '95120': 'san_jose',
    '95121': 'san_jose', '95122': 'san_jose', '95123': 'san_jose',
    
    // Sacramento
    '95814': 'sacramento', '95815': 'sacramento', '95816': 'sacramento',
    '95817': 'sacramento', '95818': 'sacramento', '95819': 'sacramento',
    '95820': 'sacramento', '95821': 'sacramento', '95822': 'sacramento',
    
    // Long Beach
    '90801': 'long_beach', '90802': 'long_beach', '90803': 'long_beach',
    '90804': 'long_beach', '90805': 'long_beach', '90806': 'long_beach',
    '90807': 'long_beach', '90808': 'long_beach', '90810': 'long_beach',
    
    // Anaheim
    '92801': 'anaheim', '92802': 'anaheim', '92803': 'anaheim',
    '92804': 'anaheim', '92805': 'anaheim', '92806': 'anaheim',
    '92807': 'anaheim', '92808': 'anaheim'
  }
  
  return cityZips[zip] || null
}

/**
 * Format tax rate as percentage string
 */
export function formatTaxRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`
}

/**
 * Check if tax should be collected for a given state
 */
export function shouldCollectTax(state: string): boolean {
  return NEXUS_STATES.has(state.toUpperCase().trim())
}