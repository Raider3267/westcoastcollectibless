import { NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword, createSession } from '@/lib/db/storage'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Find user
    const user = await getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValid = await verifyPassword(user, password)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Create session
    const session = await createSession(user.id)
    
    // Set session cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified_at !== null,
        marketing_opt_in: user.marketing_opt_in
      }
    })
    
    response.cookies.set('session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}