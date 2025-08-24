import { NextResponse } from 'next/server'
import { safeFallbackProducts } from '../../safe-fallback'

export async function GET(request: Request) {
  try {
    // Temporarily return safe data while fixing CSV/database issues
    console.log('Returning safe fallback products for public API')
    return NextResponse.json(safeFallbackProducts)
  } catch (error) {
    console.error('GET /api/public/products error:', error)
    return NextResponse.json(safeFallbackProducts)
  }
}