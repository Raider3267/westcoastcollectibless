import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }
    
    // Get first few products to debug data structure
    const products = await prisma.product.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('Raw database products:', JSON.stringify(products, null, 2))
    
    return NextResponse.json({
      count: products.length,
      sample_products: products,
      message: 'Check console logs for full data structure'
    })
    
  } catch (error) {
    console.error('Debug products error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}