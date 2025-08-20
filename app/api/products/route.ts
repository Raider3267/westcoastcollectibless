import { NextResponse } from 'next/server'
import { getListingsFromCsv } from '../../../lib/listings'

export async function GET() {
  try {
    const products = await getListingsFromCsv('export.csv', true)
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}