import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json([])
    }
    
    // Show products marked for coming soon section:
    // - status: 'coming-soon' OR 'preview' 
    // - OR showInComingSoon flag is true
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { status: 'coming-soon' },
          { status: 'preview' },
          { showInComingSoon: true }
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
        status: product.status || 'coming-soon',
        show_in_coming_soon: true,
        release_at: product.releaseAt,
        drop_date: product.dropDate
      }
    })
    
    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('GET /api/coming-soon/products error:', error)
    return NextResponse.json([])
  }
}