import { NextRequest, NextResponse } from 'next/server'
import { addEmailSubscriber } from '../../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Try to send welcome email, but don't fail the subscription if it doesn't work
    const emailSent = await addEmailSubscriber(email, firstName)

    // In a real app, you'd store the email in a database here regardless of email success
    // For now, we'll just log it
    console.log(`New VIP subscriber: ${email}${firstName ? ` (${firstName})` : ''} - Email sent: ${emailSent}`)

    // Always return success to the user - the subscription is what matters
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to VIP list!',
      emailSent: emailSent
    })

  } catch (error) {
    console.error('Email subscription error:', error)
    return NextResponse.json({ 
      error: 'Failed to process subscription' 
    }, { status: 500 })
  }
}