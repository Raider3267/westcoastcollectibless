import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'No database connection' }, { status: 503 })
    }
    
    // Get the most recent product
    const latestProduct = await prisma.product.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    
    if (!latestProduct) {
      return NextResponse.json({ error: 'No products found' })
    }
    
    return NextResponse.json({
      product: latestProduct,
      flags: {
        showInFeatured: latestProduct.showInFeatured,
        showInNewReleases: latestProduct.showInNewReleases,
        showInStaffPicks: latestProduct.showInStaffPicks,
        showInLimitedEditions: latestProduct.showInLimitedEditions,
        featured: latestProduct.featured,
        staffPick: latestProduct.staffPick,
        limitedEdition: latestProduct.limitedEdition,
        quantity: latestProduct.quantity,
        outOfStock: latestProduct.outOfStock
      },
      wouldAppearIn: {
        inStock: latestProduct.quantity > 0 && !latestProduct.outOfStock && (
          latestProduct.showInFeatured ||
          latestProduct.showInNewReleases ||
          latestProduct.showInStaffPicks ||
          latestProduct.showInLimitedEditions ||
          latestProduct.featured ||
          latestProduct.staffPick ||
          latestProduct.limitedEdition
        ),
        featured: latestProduct.showInFeatured || latestProduct.featured,
        newReleases: latestProduct.showInNewReleases,
        staffPicks: latestProduct.showInStaffPicks || latestProduct.staffPick,
        limitedEditions: latestProduct.showInLimitedEditions || latestProduct.limitedEdition
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}