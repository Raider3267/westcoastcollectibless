import { NextResponse } from 'next/server'
import { getSessionByToken, createNotificationSubscription } from '@/lib/db/storage'
import { cookies } from 'next/headers'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

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
    const { product_id, source = 'wishlist' } = body
    
    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    // Create notification subscription (deduped in storage layer)
    const subscription = await createNotificationSubscription(
      session.user_id,
      product_id,
      source as 'wishlist' | 'notify_me' | 'admin_add'
    )
    
    return NextResponse.json({ 
      success: true,
      subscription: {
        id: subscription.id,
        product_id: subscription.product_id,
        source: subscription.source
      }
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}