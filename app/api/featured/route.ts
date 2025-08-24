import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { 
        AND: [
          { status: 'live' },
          { 
            OR: [
              { featured: true },
              { showInFeatured: true }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Format products to match the expected structure
    const formattedProducts = products.map((product) => ({
      sku: product.sku,
      title: product.title,
      description: product.description,
      quantity: product.quantity,
      price: product.price ? parseFloat(product.price.toString()) : 0,
      images: product.images ? product.images.split(',').map(img => img.trim()).filter(img => img) : [],
      status: product.status,
      saleState: product.saleState,
      releaseAt: product.releaseAt,
      featured: product.featured,
      staffPick: product.staffPick,
      limitedEdition: product.limitedEdition,
      dropDate: product.dropDate,
      releasedDate: product.releasedDate,
      showInNewReleases: product.showInNewReleases,
      showInFeatured: product.showInFeatured,
      showInComingSoon: product.showInComingSoon,
      showInStaffPicks: product.showInStaffPicks,
      showInLimitedEditions: product.showInLimitedEditions,
      outOfStock: product.outOfStock,
      showInFeaturedWhileComingSoon: product.showInFeaturedWhileComingSoon,
      weight: product.weight ? parseFloat(product.weight.toString()) : 0.3,
      length: product.length ? parseFloat(product.length.toString()) : 4,
      width: product.width ? parseFloat(product.width.toString()) : 3,
      height: product.height ? parseFloat(product.height.toString()) : 5,
    }))
    
    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
}