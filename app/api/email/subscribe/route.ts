import { NextRequest, NextResponse } from 'next/server'
import { addEmailSubscriber } from '../../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Send welcome email
    const success = await addEmailSubscriber(email, firstName)

    if (!success) {
      return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
    }

    // In a real app, you'd also store the email in a database here
    // For now, we'll just log it
    console.log(`New VIP subscriber: ${email}${firstName ? ` (${firstName})` : ''}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to VIP list!' 
    })

  } catch (error) {
    console.error('Email subscription error:', error)
    return NextResponse.json({ 
      error: 'Failed to process subscription' 
    }, { status: 500 })
  }
}