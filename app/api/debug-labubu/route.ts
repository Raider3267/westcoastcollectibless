import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' })
    }
    
    // Check specifically for the Wacky Mart Labubu
    const labubu = await prisma.product.findUnique({
      where: { sku: 'IF_9223B4D0' }
    })
    
    // Also check all products matching our in-stock criteria 
    const inStockProducts = await prisma.product.findMany({
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
        outOfStock: true
      }
    })
    
    const labubusInResult = inStockProducts.filter(p => p.sku === 'IF_9223B4D0')
    
    return NextResponse.json({
      targetLabubu: labubu ? {
        sku: labubu.sku,
        title: labubu.title,
        saleState: labubu.saleState,
        status: labubu.status,
        quantity: labubu.quantity,
        outOfStock: labubu.outOfStock
      } : 'NOT FOUND',
      totalInStock: inStockProducts.length,
      labubusInInStockResult: labubusInResult,
      allInStockSkus: inStockProducts.map(p => p.sku)
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
}