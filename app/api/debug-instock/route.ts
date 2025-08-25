import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'No database connection' }, { status: 503 })
    }
    
    // Check the gummy bears product specifically
    const gummyProduct = await prisma.product.findUnique({
      where: { sku: 'dfsfdsdfsdfdsf' }
    })
    
    if (!gummyProduct) {
      return NextResponse.json({ error: 'Product not found' })
    }
    
    // Show all products that meet in-stock criteria
    const allProducts = await prisma.product.findMany({
      where: {
        AND: [
          { quantity: { gt: 0 } },
          { outOfStock: false }
        ]
      }
    })
    
    const gummyMeetsQuery = gummyProduct.quantity > 0 && !gummyProduct.outOfStock
    
    return NextResponse.json({
      gummyProduct: {
        sku: gummyProduct.sku,
        title: gummyProduct.title,
        quantity: gummyProduct.quantity,
        outOfStock: gummyProduct.outOfStock,
        meetsQuery: gummyMeetsQuery
      },
      totalInStockProducts: allProducts.length,
      gummyFoundInQuery: allProducts.some(p => p.sku === 'dfsfdsdfsdfdsf')
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}