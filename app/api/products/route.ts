import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'
import { safeFallbackProducts } from '../safe-fallback'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      console.log('Database not available, returning empty array')
      return NextResponse.json([])
    }
    
    const products = await prisma.product.findMany({
      where: {
        // Only show products that are specifically marked to show somewhere
        OR: [
          { showInFeatured: true },
          { showInComingSoon: true },
          { showInNewReleases: true },
          { showInStaffPicks: true },
          { showInLimitedEditions: true },
          { featured: true },
          { staffPick: true },
          { limitedEdition: true }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (products.length === 0) {
      console.log('No products match display criteria, returning empty array')
      return NextResponse.json([])
    }
    
    // Format with complete field mapping and safety
    const safeProducts = products.map((product) => {
      // Process images safely
      const imageUrls = product.images ? 
        product.images.split(',')
          .map(img => img.trim())
          .filter(img => img && img.length > 0 && img !== 'null' && img !== 'undefined') 
        : []
      
      // Get primary image (first valid image)
      const primaryImage = imageUrls.length > 0 ? imageUrls[0] : null
      
      return {
        // Basic identifiers
        id: product.sku || `product_${Date.now()}`,
        sku: product.sku || '',
        name: product.title || 'Untitled Product',
        title: product.title || 'Untitled Product',
        
        // Pricing - make sure to show actual prices
        price: product.price ? parseFloat(product.price.toString()) : null,
        
        // Full description with line breaks preserved but cleaned
        description: product.description ? 
          product.description.replace(/[\r\n]+/g, '\n').trim() : '',
        
        // Inventory
        quantity: product.quantity || 0,
        
        // Images
        image: primaryImage,
        images: imageUrls,
        
        // Status and visibility
        status: product.status || 'live',
        sale_state: product.saleState || 'LIVE',
        
        // Display flags
        show_in_featured: !!product.showInFeatured,
        show_in_coming_soon: !!product.showInComingSoon,
        show_in_new_releases: !!product.showInNewReleases,
        show_in_staff_picks: !!product.showInStaffPicks,
        show_in_limited_editions: !!product.showInLimitedEditions,
        out_of_stock: !!product.outOfStock,
        show_in_featured_while_coming_soon: !!product.showInFeaturedWhileComingSoon,
        
        // Physical attributes
        weight: product.weight ? parseFloat(product.weight.toString()) : 0.3,
        length: product.length ? parseFloat(product.length.toString()) : 4,
        width: product.width ? parseFloat(product.width.toString()) : 3,
        height: product.height ? parseFloat(product.height.toString()) : 5,
        
        // Feature flags
        featured: !!product.featured,
        staff_pick: !!product.staffPick,
        limited_edition: !!product.limitedEdition,
        
        // Dates
        drop_date: product.dropDate || null,
        released_date: product.releasedDate || null,
        release_at: product.releaseAt || null,
        
        // Cost tracking (for internal use)
        purchase_cost: product.purchaseCost ? parseFloat(product.purchaseCost.toString()) : null,
        shipping_cost: product.shippingCost ? parseFloat(product.shippingCost.toString()) : null,
        total_cost: product.totalCost ? parseFloat(product.totalCost.toString()) : null,
        purchase_date: product.purchaseDate || null,
        supplier: product.supplier || null,
        tracking_number: product.trackingNumber || null,
        
        // Brand info
        brand: product.brand || null
      }
    })
    
    console.log(`Returning ${safeProducts.length} products from database`)
    return NextResponse.json(safeProducts)
    
  } catch (error) {
    console.error('Error in products API:', error)
    return NextResponse.json([])
  }
}