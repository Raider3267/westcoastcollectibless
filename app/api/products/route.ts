import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'
import { safeFallbackProducts } from '../safe-fallback'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      console.log('Database not available, using safe fallback')
      return NextResponse.json(safeFallbackProducts)
    }
    
    const products = await prisma.product.findMany({
      where: { 
        status: 'live'
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (products.length === 0) {
      console.log('No products in database, using safe fallback')
      return NextResponse.json(safeFallbackProducts)
    }
    
    // Format with extreme safety - ensure no undefined values
    const safeProducts = products.map((product) => ({
      id: product.sku || `product_${Date.now()}`,
      name: product.title || 'Untitled Product',
      price: product.price ? parseFloat(product.price.toString()) : 0,
      description: (product.description || '').replace(/[\r\n]+/g, ' ').trim(),
      quantity: product.quantity || 0,
      image: null,
      images: product.images ? 
        product.images.split(',')
          .map(img => img.trim())
          .filter(img => img && img.length > 0) 
        : [],
      status: product.status || 'live',
      sale_state: product.saleState || 'LIVE',
      show_in_featured: !!product.showInFeatured,
      show_in_coming_soon: !!product.showInComingSoon,
      show_in_new_releases: !!product.showInNewReleases,
      show_in_staff_picks: !!product.showInStaffPicks,
      show_in_limited_editions: !!product.showInLimitedEditions,
      out_of_stock: !!product.outOfStock,
      weight: product.weight ? parseFloat(product.weight.toString()) : 0.3,
      length: product.length ? parseFloat(product.length.toString()) : 4,
      width: product.width ? parseFloat(product.width.toString()) : 3,
      height: product.height ? parseFloat(product.height.toString()) : 5,
      featured: !!product.featured,
      staff_pick: !!product.staffPick,
      limited_edition: !!product.limitedEdition,
      drop_date: product.dropDate || null,
      released_date: product.releasedDate || null,
      release_at: product.releaseAt || null
    }))
    
    console.log(`Returning ${safeProducts.length} products from database`)
    return NextResponse.json(safeProducts)
    
  } catch (error) {
    console.error('Error in products API:', error)
    return NextResponse.json(safeFallbackProducts)
  }
}