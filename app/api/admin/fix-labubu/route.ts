import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../../lib/database'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }
    
    // Force the specific Labubu to show correctly
    const updatedProduct = await prisma.product.update({
      where: { sku: 'IF_9223B4D0' },
      data: {
        saleState: 'LIVE',
        status: 'live',
        quantity: 5,
        outOfStock: false,
        // Keep it featured but ensure it shows in in-stock too
        featured: true,
        showInFeatured: true
      }
    })
    
    console.log('Updated Labubu product:', updatedProduct.sku)
    
    return NextResponse.json({ 
      success: true, 
      product: {
        sku: updatedProduct.sku,
        title: updatedProduct.title,
        saleState: updatedProduct.saleState,
        status: updatedProduct.status,
        quantity: updatedProduct.quantity,
        outOfStock: updatedProduct.outOfStock,
        featured: updatedProduct.featured,
        showInFeatured: updatedProduct.showInFeatured
      }
    })
    
  } catch (error) {
    console.error('Fix Labubu failed:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}