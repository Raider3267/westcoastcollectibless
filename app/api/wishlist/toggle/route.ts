import { NextResponse } from 'next/server'
import { getSessionByToken, toggleWishlist } from '@/lib/db/storage'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const session = await getSessionByToken(sessionToken)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { product_id } = body
    
    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Toggle wishlist status
    const saved = await toggleWishlist(session.user_id, product_id)
    
    return NextResponse.json({ saved })
  } catch (error) {
    console.error('Wishlist toggle error:', error)
    return NextResponse.json(
      { error: 'Failed to update wishlist' },
      { status: 500 }
    )
  }
}