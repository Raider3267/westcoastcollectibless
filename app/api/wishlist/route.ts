import { NextResponse } from 'next/server'
import { getSessionByToken, getUserWishlist } from '@/lib/db/storage'
import { cookies } from 'next/headers'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
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
    
    // Get user's wishlist
    const wishlist = await getUserWishlist(session.user_id)
    
    // Return list of product IDs
    const productIds = wishlist.map(w => w.product_id)
    
    return NextResponse.json({ 
      wishlist: productIds,
      items: wishlist 
    })
  } catch (error) {
    console.error('Wishlist get error:', error)
    return NextResponse.json(
      { error: 'Failed to get wishlist' },
      { status: 500 }
    )
  }
}