import { NextResponse } from 'next/server'
import { getListingsFromCsv } from '../../../lib/listings'

export async function GET() {
  try {
    // Try CSV first, fallback to safe default if corrupted
    const products = await getListingsFromCsv('export.csv', true)
    
    // Filter out any corrupted/invalid products
    const validProducts = products.filter(product => 
      product && 
      product.id && 
      product.name && 
      typeof product.name === 'string'
    )
    
    return NextResponse.json(validProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    
    // Return safe fallback data if CSV is corrupted
    const fallbackProducts = [
      {
        id: "sample-product-1",
        name: "Sample Product",
        price: 10,
        description: "Sample product while fixing data issues",
        quantity: 1,
        image: null,
        images: [],
        status: 'live',
        sale_state: 'LIVE',
        show_in_featured: true,
        out_of_stock: false,
        weight: 0.3,
        length: 4,
        width: 3,
        height: 5,
        featured: false,
        staff_pick: false,
        limited_edition: false
      }
    ]
    
    return NextResponse.json(fallbackProducts)
  }
}