import { NextResponse } from 'next/server'
import { getInStockProducts } from '../../../lib/product-queries'

export async function GET() {
  try {
    const products = await getInStockProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching in-stock products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch in-stock products' },
      { status: 500 }
    )
  }
}