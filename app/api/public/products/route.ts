import { NextResponse } from 'next/server'
import { getListingsFromCsv } from '../../../../lib/listings'

export async function GET() {
  try {
    // Get all live products for the public website (including out of stock)
    const products = await getListingsFromCsv('export.csv', true)
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/public/products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}