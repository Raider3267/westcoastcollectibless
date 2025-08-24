import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'No database connection' }, { status: 503 })
    }
    
    // Same query as in-stock API - show ALL in-stock products
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { quantity: { gt: 0 } }, // Has inventory
          { outOfStock: false }     // Not marked out of stock
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      totalFound: products.length,
      products: products.map(p => ({
        sku: p.sku,
        title: p.title,
        quantity: p.quantity,
        outOfStock: p.outOfStock,
        showInFeatured: p.showInFeatured,
        showInNewReleases: p.showInNewReleases,
        showInStaffPicks: p.showInStaffPicks,
        showInLimitedEditions: p.showInLimitedEditions,
        featured: p.featured,
        staffPick: p.staffPick,
        limitedEdition: p.limitedEdition
      }))
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}