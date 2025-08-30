import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json([])
    }
    
    // Show all live products that are in stock (exclude PREVIEW/coming-soon)
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { quantity: { gt: 0 } },        // Has inventory
          { outOfStock: false },          // Not marked out of stock
          { status: 'live' },             // Only live products (not coming-soon)
          { saleState: 'LIVE' }           // Only LIVE products (not PREVIEW)
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${products.length} in-stock products`)
    
    // Debug: Check if the Wacky Mart Labubu is in the results
    const labubusInResults = products.filter(p => p.sku === 'IF_9223B4D0')
    console.log('Labubu products in results:', labubusInResults.length)
    if (labubusInResults.length > 0) {
      console.log('Found Labubu:', labubusInResults[0])
    } else {
      console.log('Labubu not found - checking if it exists in database at all...')
      
      // Check if it exists in database with different criteria
      const allLabubus = await prisma.product.findMany({
        where: { sku: 'IF_9223B4D0' }
      })
      console.log('All Labubus in database:', allLabubus.length)
      if (allLabubus.length > 0) {
        console.log('Labubu exists but filtered out:', {
          sku: allLabubus[0].sku,
          saleState: allLabubus[0].saleState,
          status: allLabubus[0].status,
          quantity: allLabubus[0].quantity,
          outOfStock: allLabubus[0].outOfStock
        })
      }
    }
    
    // Format the same way as other APIs
    const formattedProducts = products.map((product) => {
      const imageUrls = product.images ? 
        product.images.split(',')
          .map(img => img.trim())
          .filter(img => img && img.length > 0) 
        : []
      
      return {
        id: product.sku || '',
        name: product.title || '',
        price: product.price ? parseFloat(product.price.toString()) : null,
        description: product.description || '',
        quantity: product.quantity || 0,
        image: imageUrls.length > 0 ? imageUrls[0] : null,
        images: imageUrls,
        status: product.status || 'live',
        featured: !!product.featured,
        out_of_stock: false // These are in-stock products
      }
    })
    
    const response = NextResponse.json(formattedProducts)
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error fetching in-stock products:', error)
    return NextResponse.json([])
  }
}