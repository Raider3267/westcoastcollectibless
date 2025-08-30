import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      console.log('Database not available, returning empty array')
      return NextResponse.json([])
    }
    
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { featured: true },
          { showInFeatured: true }
        ],
        saleState: 'LIVE'  // Only show LIVE products in featured, not PREVIEW
      },
      orderBy: { createdAt: 'desc' }
      // Removed limit - show all featured products
    })
    
    // Format products the same way as main API
    const featuredProducts = products.map((product) => {
      const imageUrls = product.images ? 
        product.images.split(',')
          .map(img => img.trim())
          .filter(img => img && img.length > 0 && img !== 'null' && img !== 'undefined') 
        : []
      
      const primaryImage = imageUrls.length > 0 ? imageUrls[0] : null
      
      return {
        id: product.sku || `product_${Date.now()}`,
        sku: product.sku || '',
        name: product.title || 'Untitled Product',
        title: product.title || 'Untitled Product',
        price: product.price ? parseFloat(product.price.toString()) : null,
        description: product.description ? 
          product.description.replace(/[\r\n]+/g, '\n').trim() : '',
        quantity: product.quantity || 0,
        image: primaryImage,
        images: imageUrls,
        status: product.status || 'live',
        sale_state: product.saleState || 'LIVE',
        show_in_featured: !!product.showInFeatured,
        featured: !!product.featured,
        staff_pick: !!product.staffPick,
        limited_edition: !!product.limitedEdition,
        out_of_stock: !!product.outOfStock,
        weight: product.weight ? parseFloat(product.weight.toString()) : 0.3,
        length: product.length ? parseFloat(product.length.toString()) : 4,
        width: product.width ? parseFloat(product.width.toString()) : 3,
        height: product.height ? parseFloat(product.height.toString()) : 5,
        drop_date: product.dropDate || null,
        released_date: product.releasedDate || null,
        release_at: product.releaseAt || null,
        brand: product.brand || null
      }
    })
    
    console.log(`Returning ${featuredProducts.length} featured products from database`)
    const response = NextResponse.json(featuredProducts)
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
    
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json([])
  }
}