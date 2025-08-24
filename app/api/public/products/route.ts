import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../../lib/database'
import { getListingsFromCsv } from '../../../../lib/listings'

export async function GET(request: Request) {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      console.log('Database not available, falling back to CSV')
      try {
        const products = await getListingsFromCsv('export.csv', true)
        return NextResponse.json(products)
      } catch (csvError) {
        console.error('CSV fallback failed:', csvError)
        return NextResponse.json([])
      }
    }
    
    // Get all live products for the public website (including out of stock)
    const products = await prisma.product.findMany({
      where: { 
        status: 'live' // Only return live products for the public API
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Format products to match the expected structure
    const formattedProducts = products.map((product) => ({
      sku: product.sku || '',
      title: product.title || '',
      description: product.description || '',
      quantity: product.quantity || 0,
      price: product.price ? parseFloat(product.price.toString()) : 0,
      images: product.images ? product.images.split(',').map(img => img.trim()).filter(img => img) : [],
      status: product.status || 'live',
      saleState: product.saleState || '',
      releaseAt: product.releaseAt || '',
      featured: !!product.featured,
      staffPick: !!product.staffPick,
      limitedEdition: !!product.limitedEdition,
      dropDate: product.dropDate || '',
      releasedDate: product.releasedDate || '',
      showInNewReleases: !!product.showInNewReleases,
      showInFeatured: !!product.showInFeatured,
      showInComingSoon: !!product.showInComingSoon,
      showInStaffPicks: !!product.showInStaffPicks,
      showInLimitedEditions: !!product.showInLimitedEditions,
      outOfStock: !!product.outOfStock,
      showInFeaturedWhileComingSoon: !!product.showInFeaturedWhileComingSoon,
      weight: product.weight ? parseFloat(product.weight.toString()) : 0.3,
      length: product.length ? parseFloat(product.length.toString()) : 4,
      width: product.width ? parseFloat(product.width.toString()) : 3,
      height: product.height ? parseFloat(product.height.toString()) : 5,
    }))
    
    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('GET /api/public/products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}