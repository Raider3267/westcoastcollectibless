import { NextResponse } from 'next/server'
import { getListingsFromCsv } from '../../../../lib/listings'
import { enhanceListingsWithSquareData } from '../../../../lib/square-inventory'

export async function GET(request: Request) {
  try {
    // Get all live products for the public website (including out of stock)
    const products = await getListingsFromCsv('export.csv', true)
    
    // Check if Square enhancement is requested
    const url = new URL(request.url)
    const includeSquare = url.searchParams.get('includeSquare') === 'true'
    
    if (includeSquare) {
      // Enhance with real-time Square inventory and pricing
      console.log('Enhancing products with Square data...')
      const enhancedProducts = await enhanceListingsWithSquareData(products)
      return NextResponse.json(enhancedProducts)
    }
    
    // Return regular products without Square data (faster for regular page loads)
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/public/products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}