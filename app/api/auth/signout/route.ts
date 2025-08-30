import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/db/storage'
import { cookies } from 'next/headers'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session')?.value
    
    if (sessionToken) {
      await deleteSession(sessionToken)
    }
    
    const response = NextResponse.json({ success: true })
    
    // Clear session cookie
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}