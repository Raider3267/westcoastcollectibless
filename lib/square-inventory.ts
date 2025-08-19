'use server'

import { getSquareProductById, catalogApi, inventoryApi } from './square'

// Enhanced listing type that includes Square data
export interface EnhancedListing {
  // Your existing listing data
  id: string
  name: string
  price?: number | null
  description?: string | null
  images?: string[]
  quantity?: number
  status?: 'live' | 'coming-soon' | 'draft'
  out_of_stock?: boolean
  
  // Square integration fields
  squareData?: {
    squareId?: string
    realTimePrice?: number
    realTimeQuantity?: number
    isAvailable?: boolean
    lastUpdated?: string
  }
}

// SKU mapping - map your website SKUs to Square catalog item IDs
const SKU_TO_SQUARE_ID: Record<string, string> = {
  // Add mappings like:
  // 'IF_9223B4D0': 'SQUARE_CATALOG_ID_HERE',
  // 'IF_FACE0CEA': 'ANOTHER_SQUARE_ID',
  // You can populate this as you add products to Square
}

// Get real-time inventory for a specific product SKU
export async function getSquareInventoryForSku(sku: string): Promise<{
  quantity: number
  price?: number
  isAvailable: boolean
  error?: string
}> {
  try {
    const squareId = SKU_TO_SQUARE_ID[sku]
    if (!squareId) {
      // No Square mapping - use your existing data
      return { quantity: 0, isAvailable: false, error: 'No Square mapping found' }
    }

    // Get Square product data
    const squareResult = await getSquareProductById(squareId)
    if (!squareResult.success || !squareResult.product) {
      return { quantity: 0, isAvailable: false, error: squareResult.error?.detail }
    }

    const product = squareResult.product
    return {
      quantity: product.quantity || 0,
      price: product.price,
      isAvailable: product.isAvailable,
    }
  } catch (error: any) {
    console.error('Error fetching Square inventory for SKU:', sku, error)
    return { quantity: 0, isAvailable: false, error: error.message }
  }
}

// Enhance multiple listings with Square data
export async function enhanceListingsWithSquareData(listings: any[]): Promise<EnhancedListing[]> {
  const enhancedListings: EnhancedListing[] = []
  
  for (const listing of listings) {
    const enhanced: EnhancedListing = { ...listing }
    
    // Try to get Square data if we have a mapping
    if (listing.id && SKU_TO_SQUARE_ID[listing.id]) {
      try {
        const squareInventory = await getSquareInventoryForSku(listing.id)
        enhanced.squareData = {
          squareId: SKU_TO_SQUARE_ID[listing.id],
          realTimePrice: squareInventory.price,
          realTimeQuantity: squareInventory.quantity,
          isAvailable: squareInventory.isAvailable,
          lastUpdated: new Date().toISOString()
        }
        
        // Override local stock status with Square data
        if (squareInventory.isAvailable !== undefined) {
          enhanced.out_of_stock = !squareInventory.isAvailable
          enhanced.quantity = squareInventory.quantity
        }
        
        // Optionally override price with Square price
        if (squareInventory.price && squareInventory.price > 0) {
          enhanced.price = squareInventory.price
        }
      } catch (error) {
        console.log(`Could not fetch Square data for ${listing.id}:`, error)
      }
    }
    
    enhancedListings.push(enhanced)
  }
  
  return enhancedListings
}

// Check stock before checkout - called during payment processing
export async function verifyStockBeforeCheckout(cartItems: Array<{ id: string; quantity: number }>): Promise<{
  valid: boolean
  errors: string[]
  updates: Array<{ id: string; availableQuantity: number }>
}> {
  const errors: string[] = []
  const updates: Array<{ id: string; availableQuantity: number }> = []
  
  for (const item of cartItems) {
    const squareInventory = await getSquareInventoryForSku(item.id)
    
    if (squareInventory.error) {
      // No Square data available - allow purchase (using your existing system)
      continue
    }
    
    if (!squareInventory.isAvailable) {
      errors.push(`${item.id} is out of stock`)
    } else if (squareInventory.quantity < item.quantity) {
      errors.push(`${item.id}: Only ${squareInventory.quantity} available, but ${item.quantity} requested`)
      updates.push({ id: item.id, availableQuantity: squareInventory.quantity })
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    updates
  }
}

// Update SKU mapping (call this when you add products to Square)
export async function addSkuMapping(websiteSku: string, squareId: string) {
  // In a real app, you'd save this to a database
  // For now, you can manually add to the SKU_TO_SQUARE_ID object above
  console.log(`Add this mapping: "${websiteSku}": "${squareId}"`)
}