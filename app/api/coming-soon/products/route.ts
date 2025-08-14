import { NextResponse } from 'next/server'
import { getComingSoonProducts } from '../../../../lib/listings'

export async function GET() {
  try {
    // Get coming-soon products for the preview section
    const products = await getComingSoonProducts('export.csv')
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/coming-soon/products error:', error)
    return NextResponse.json({ error: 'Failed to fetch coming soon products' }, { status: 500 })
  }
}