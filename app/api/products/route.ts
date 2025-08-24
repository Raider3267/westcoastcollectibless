import { NextResponse } from 'next/server'
import { safeFallbackProducts } from '../safe-fallback'

export async function GET() {
  try {
    // Temporarily return safe data while fixing CSV/database issues
    console.log('Returning safe fallback products')
    return NextResponse.json(safeFallbackProducts)
  } catch (error) {
    console.error('Error in products API:', error)
    return NextResponse.json(safeFallbackProducts)
  }
}