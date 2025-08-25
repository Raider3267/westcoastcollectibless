import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function POST() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'No database connection' }, { status: 503 })
    }
    
    // Fix the gummy bears product
    const updatedProduct = await prisma.product.update({
      where: { sku: 'dfsfdsdfsdfdsf' },
      data: {
        outOfStock: false,
        quantity: 2  // Ensure quantity is correct
      }
    })
    
    return NextResponse.json({
      success: true,
      updated: {
        sku: updatedProduct.sku,
        title: updatedProduct.title,
        quantity: updatedProduct.quantity,
        outOfStock: updatedProduct.outOfStock
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}