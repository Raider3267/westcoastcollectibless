import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'No database connection' }, { status: 503 })
    }
    
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { featured: true },
          { showInFeatured: true }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('Raw products from database:', products)
    
    // Format products the same way as featured API
    const featuredProducts = products.map((product) => {
      const imageUrls = product.images ? 
        product.images.split(',')
          .map(img => img.trim())
          .filter(img => img && img.length > 0 && img !== 'null' && img !== 'undefined') 
        : []
      
      const primaryImage = imageUrls.length > 0 ? imageUrls[0] : null
      
      return {
        id: product.sku || `product_${Date.now()}`,
        sku: product.sku || '',
        name: product.title || 'Untitled Product',
        title: product.title || 'Untitled Product',
        price: product.price ? parseFloat(product.price.toString()) : null,
        description: product.description ? 
          product.description.replace(/[\r\n]+/g, '\n').trim() : '',
        quantity: product.quantity || 0,
        image: primaryImage,
        images: imageUrls,
        status: product.status || 'live',
        sale_state: product.saleState || 'LIVE',
        show_in_featured: !!product.showInFeatured,
        featured: !!product.featured,
        staff_pick: !!product.staffPick,
        limited_edition: !!product.limitedEdition,
        out_of_stock: !!product.outOfStock,
        weight: product.weight ? parseFloat(product.weight.toString()) : 0.3,
        length: product.length ? parseFloat(product.length.toString()) : 4,
        width: product.width ? parseFloat(product.width.toString()) : 3,
        height: product.height ? parseFloat(product.height.toString()) : 5,
        drop_date: product.dropDate || null,
        released_date: product.releasedDate || null,
        release_at: product.releaseAt || null,
        brand: product.brand || null
      }
    })
    
    return NextResponse.json({
      rawCount: products.length,
      formattedCount: featuredProducts.length,
      rawProducts: products,
      formattedProducts: featuredProducts
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}