import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' })
    }
    
    // Exact same query as in-stock API
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { quantity: { gt: 0 } },
          { outOfStock: false },
          { status: 'live' },
          { saleState: 'LIVE' }
        ]
      },
      select: {
        sku: true,
        title: true,
        saleState: true,
        status: true,
        quantity: true,
        outOfStock: true,
        price: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Check specifically for our target Labubu
    const targetLabubu = products.find(p => p.sku === 'IF_9223B4D0')
    
    return NextResponse.json({
      totalProducts: products.length,
      targetLabubuFound: !!targetLabubu,
      targetLabubu: targetLabubu || null,
      allProducts: products.map(p => ({
        sku: p.sku,
        title: p.title?.substring(0, 50),
        saleState: p.saleState,
        status: p.status,
        quantity: p.quantity,
        price: p.price
      }))
    })
    
  } catch (error) {
    console.error('Test query error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
}