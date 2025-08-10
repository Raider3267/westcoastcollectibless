import { NextResponse } from 'next/server'
import { getListingsFromCsv } from '../../../../lib/listings'

export async function GET() {
  try {
    // Get only in-stock products for the public website
    const products = await getListingsFromCsv('export.csv', false)
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/public/products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}