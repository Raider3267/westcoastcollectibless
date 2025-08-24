import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sku = searchParams.get('sku')
    
    if (!sku) {
      return NextResponse.json({ error: 'SKU parameter required' }, { status: 400 })
    }
    
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'No database connection' }, { status: 503 })
    }
    
    const product = await prisma.product.findUnique({
      where: { sku: sku }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      sku: product.sku,
      title: product.title,
      flags: {
        showInFeatured: product.showInFeatured,
        showInNewReleases: product.showInNewReleases,
        showInStaffPicks: product.showInStaffPicks,
        showInLimitedEditions: product.showInLimitedEditions,
        featured: product.featured,
        staffPick: product.staffPick,
        limitedEdition: product.limitedEdition
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}