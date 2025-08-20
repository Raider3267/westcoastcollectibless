import { NextResponse } from 'next/server'
import { getLimitedEditionsProducts } from '../../../lib/product-queries'

export async function GET() {
  try {
    const products = await getLimitedEditionsProducts('export.csv')
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/limited-editions error:', error)
    return NextResponse.json({ error: 'Failed to fetch limited editions' }, { status: 500 })
  }
}