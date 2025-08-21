import { NextResponse } from 'next/server'
import { getPreviewProducts } from '../../../lib/product-queries'

export async function GET() {
  try {
    const products = await getPreviewProducts()
    console.log(`Preview API: Found ${products.length} products`)
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching preview products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preview products' },
      { status: 500 }
    )
  }
}