import { NextResponse } from 'next/server'
import { getSessionByToken, getUserById } from '@/lib/db/storage'
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
    
    const user = await getUserById(session.user_id)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Determine user roles (admin check for specific email)
    const roles: string[] = []
    if (user.email === 'jaydenreyes32@icloud.com') {
      roles.push('admin')
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified_at !== null,
        marketing_opt_in: user.marketing_opt_in,
        roles: roles
      }
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}