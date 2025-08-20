import { NextResponse } from 'next/server'
import { getStaffPicksProducts } from '../../../lib/product-queries'

export async function GET() {
  try {
    const products = await getStaffPicksProducts('export.csv')
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/staff-picks error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff picks' }, { status: 500 })
  }
}