import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json([])
    }
    
    // Only show products from admin dashboard marked as limited editions
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { limitedEdition: true },
          { showInLimitedEditions: true }
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
        limited_edition: true
      }
    })
    
    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('GET /api/limited-editions error:', error)
    return NextResponse.json([])
  }
}