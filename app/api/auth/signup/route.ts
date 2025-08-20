import { NextResponse } from 'next/server'
import { createUser, createSession } from '@/lib/db/storage'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, marketing_opt_in = true } = body
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }
    
    // Create user
    const user = await createUser(email, password, name, marketing_opt_in)
    
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
    console.error('Signup error:', error)
    
    if (error instanceof Error && error.message === 'Email already exists') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}