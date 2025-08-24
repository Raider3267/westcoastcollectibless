import { NextResponse } from 'next/server'
import { safeFallbackProducts } from '../safe-fallback'

export async function GET() {
  try {
    // Return featured products from safe fallback
    const featuredProducts = safeFallbackProducts.filter(p => p.featured)
    console.log('Returning safe featured products')
    return NextResponse.json(featuredProducts)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(safeFallbackProducts.filter(p => p.featured))
  }
}