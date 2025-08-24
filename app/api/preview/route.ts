import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return empty array for preview (no coming soon items in safe mode)
    console.log('Returning empty preview products in safe mode')
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching preview products:', error)
    return NextResponse.json([])
  }
}