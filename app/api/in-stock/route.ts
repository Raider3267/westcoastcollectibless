import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json([])
    }
    
    // Only show products from admin dashboard that are in stock
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { quantity: { gt: 0 } }, // Has inventory
          { outOfStock: false },    // Not marked out of stock
          // Must have at least one display flag set
          {
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
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Format the same way as other APIs
    const formattedProducts = products.map((product) => {
      const imageUrls = product.images ? 
        product.images.split(',')
          .map(img => img.trim())
          .filter(img => img && img.length > 0) 
        : []
      
      return {
        id: product.sku || '',
        name: product.title || '',
        price: product.price ? parseFloat(product.price.toString()) : null,
        description: product.description || '',
        quantity: product.quantity || 0,
        image: imageUrls.length > 0 ? imageUrls[0] : null,
        images: imageUrls,
        status: product.status || 'live',
        featured: !!product.featured,
        out_of_stock: false // These are in-stock products
      }
    })
    
    const response = NextResponse.json(formattedProducts)
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error fetching in-stock products:', error)
    return NextResponse.json([])
  }
}