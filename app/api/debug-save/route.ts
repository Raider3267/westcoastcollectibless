import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('DEBUG: Received data:', JSON.stringify(body, null, 2))
    
    // Log what we're about to save
    const updateData: any = {}
    if (body.show_in_featured !== undefined) {
      updateData.showInFeatured = Boolean(body.show_in_featured)
      console.log('DEBUG: Setting showInFeatured to:', updateData.showInFeatured)
    }
    
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'No database connection' }, { status: 503 })
    }
    
    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { sku: body.sku },
      data: updateData
    })
    
    console.log('DEBUG: Updated product showInFeatured:', updatedProduct.showInFeatured)
    
    // Fetch it again to verify
    const verifyProduct = await prisma.product.findUnique({
      where: { sku: body.sku }
    })
    
    return NextResponse.json({
      received: body,
      updateData: updateData,
      updated: updatedProduct.showInFeatured,
      verified: verifyProduct?.showInFeatured,
      success: true
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}