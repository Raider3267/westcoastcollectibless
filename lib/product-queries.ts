import { getListingsFromCsv, type Listing } from './listings'

// New query functions for the updated product state system

export async function getFeaturedProducts(filename = 'export.csv'): Promise<Listing[]> {
  const allProducts = await getListingsFromCsv(filename, true) // Include out of stock for featured
  
  return allProducts.filter(product => {
    // Featured: featured = true OR legacy show_in_featured = true
    const isFeatured = product.featured || product.show_in_featured
    if (!isFeatured) return false
    
    // Check if product is available (PREVIEW or LIVE state)
    if (product.sale_state) {
      return ['PREVIEW', 'LIVE'].includes(product.sale_state)
    }
    
    // Legacy: any live status product that's marked as featured
    return product.status === 'live'
  }).slice(0, 3) // Max 3 products
}

export async function getInStockProducts(filename = 'export.csv'): Promise<Listing[]> {
  const allProducts = await getListingsFromCsv(filename, false) // Exclude out of stock
  
  return allProducts.filter(product => {
    // In Stock: sale_state = LIVE AND quantity > 0
    const saleState = product.sale_state || (
      product.status === 'live' ? 'LIVE' : 'DRAFT'
    )
    
    return saleState === 'LIVE' && (product.quantity || 0) > 0
  })
}

export async function getPreviewProducts(filename = 'export.csv'): Promise<Listing[]> {
  const allProducts = await getListingsFromCsv(filename, true) // Include all for preview
  
  console.log(`getPreviewProducts: Processing ${allProducts.length} total products`)
  
  const previewProducts = allProducts.filter(product => {
    // Coming Soon: sale_state = PREVIEW (ordered but not yet received)
    // Quantity may be non-zero for tracking on-order units, but customers cannot purchase
    if (product.sale_state) {
      const isPreview = product.sale_state === 'PREVIEW'
      if (isPreview) {
        console.log(`Found PREVIEW product: ${product.name} (sale_state: ${product.sale_state})`)
      }
      return isPreview
    }
    
    // Fallback to legacy field for backward compatibility
    const isComingSoon = product.show_in_coming_soon === true
    if (isComingSoon) {
      console.log(`Found coming-soon product: ${product.name} (show_in_coming_soon: ${product.show_in_coming_soon})`)
    }
    return isComingSoon
  })
  
  console.log(`getPreviewProducts: Filtered to ${previewProducts.length} preview products`)
  return previewProducts
}

export async function getStaffPicksProducts(filename = 'export.csv'): Promise<Listing[]> {
  const allProducts = await getListingsFromCsv(filename, false) // Exclude out of stock
  
  return allProducts.filter(product => {
    // Staff picks: staff_pick = true OR legacy show_in_staff_picks = true
    const isStaffPick = product.staff_pick || product.show_in_staff_picks
    if (!isStaffPick) return false
    
    // Must be available for purchase
    if (product.sale_state) {
      return product.sale_state === 'LIVE' && (product.quantity || 0) > 0
    }
    
    // Legacy: live status with quantity
    return product.status === 'live' && (product.quantity || 0) > 0
  })
}

export async function getLimitedEditionsProducts(filename = 'export.csv'): Promise<Listing[]> {
  const allProducts = await getListingsFromCsv(filename, false) // Exclude out of stock
  
  return allProducts.filter(product => {
    // Limited editions: limited_edition = true OR legacy show_in_limited_editions = true
    const isLimitedEdition = product.limited_edition || product.show_in_limited_editions
    if (!isLimitedEdition) return false
    
    // Must be available for purchase
    if (product.sale_state) {
      return product.sale_state === 'LIVE' && (product.quantity || 0) > 0
    }
    
    // Legacy: live status with quantity
    return product.status === 'live' && (product.quantity || 0) > 0
  })
}

// Helper function to check if a product can be purchased
export function canPurchaseProduct(product: Listing): boolean {
  // Hard requirement: sale_state must be LIVE and quantity must be > 0
  // PREVIEW items are NEVER purchasable regardless of quantity (quantity is for tracking on-order units)
  const saleState = product.sale_state || (
    product.status === 'live' ? 'LIVE' : 'DRAFT'
  )
  
  return saleState === 'LIVE' && (product.quantity || 0) > 0
}

// Helper function to determine if product should show "Notify Me" button
export function shouldShowNotifyMe(product: Listing): boolean {
  const saleState = product.sale_state || (
    product.status === 'coming-soon' ? 'PREVIEW' : 'LIVE'
  )
  
  return saleState === 'PREVIEW'
}