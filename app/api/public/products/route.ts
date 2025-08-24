import { NextResponse } from 'next/server'
import { getListingsFromCsv } from '../../../../lib/listings'

export async function GET(request: Request) {
  try {
    // Temporarily revert to CSV while fixing database issues
    const products = await getListingsFromCsv('export.csv', true)
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/public/products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}