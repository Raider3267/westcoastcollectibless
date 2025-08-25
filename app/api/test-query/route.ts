import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'No database connection' }, { status: 503 })
    }
    
    // Check the gummy bears product directly
    const gummyProduct = await prisma.product.findUnique({
      where: { sku: 'dfsfdsdfsdfdsf' }
    })
    
    // Test the exact in-stock query
    const inStockProducts = await prisma.product.findMany({
      where: {
        AND: [
          { quantity: { gt: 0 } },
          { outOfStock: false }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      gummyProduct: gummyProduct ? {
        sku: gummyProduct.sku,
        title: gummyProduct.title,
        quantity: gummyProduct.quantity,
        outOfStock: gummyProduct.outOfStock,
        quantityType: typeof gummyProduct.quantity,
        outOfStockType: typeof gummyProduct.outOfStock,
        meetsQuery: gummyProduct.quantity > 0 && !gummyProduct.outOfStock
      } : null,
      inStockCount: inStockProducts.length,
      inStockSkus: inStockProducts.map(p => p.sku),
      gummyInResults: inStockProducts.some(p => p.sku === 'dfsfdsdfsdfdsf')
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}