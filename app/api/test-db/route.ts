import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'No database connection' }, { status: 503 })
    }
    
    const count = await prisma.product.count()
    const featuredCount = await prisma.product.count({
      where: {
        OR: [
          { featured: true },
          { showInFeatured: true }
        ]
      }
    })
    
    const sample = await prisma.product.findFirst({
      where: {
        OR: [
          { featured: true },
          { showInFeatured: true }
        ]
      }
    })
    
    return NextResponse.json({
      status: 'Database connected',
      totalProducts: count,
      featuredProducts: featuredCount,
      sampleProduct: sample ? {
        sku: sample.sku,
        title: sample.title,
        featured: sample.featured,
        showInFeatured: sample.showInFeatured,
        price: sample.price,
        quantity: sample.quantity,
        images: sample.images
      } : null
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}