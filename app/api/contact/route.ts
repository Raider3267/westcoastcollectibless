import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    const { name, email, subject, orderNumber, message } = requestData
    
    console.log('Contact form submission:', { name, email, subject, orderNumber, message })

    if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Subject is required for new contact form, orderNumber is optional for legacy support
    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      )
    }

    const trimmedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || `Order Inquiry: ${orderNumber?.trim()}`,
      orderNumber: orderNumber?.trim() || '',
      message: message.trim()
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create contact message entry
    const contactEntry = {
      ...trimmedData,
      created_at: new Date().toISOString(),
      status: 'new'
    }

    // For now, append to a simple JSON file - in production this would be a database
    const dataDir = path.join(process.cwd(), 'data')
    const contactFile = path.join(dataDir, 'contact_messages.json')

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    let contactMessages = []
    
    // Read existing contact messages if file exists
    if (fs.existsSync(contactFile)) {
      try {
        const fileContent = fs.readFileSync(contactFile, 'utf-8')
        contactMessages = JSON.parse(fileContent)
      } catch (error) {
        console.error('Error reading contact messages file:', error)
        contactMessages = []
      }
    }

    // Add new entry
    contactMessages.push(contactEntry)

    // Write back to file
    fs.writeFileSync(contactFile, JSON.stringify(contactMessages, null, 2))

    console.log(`New contact message from: ${trimmedData.email} (${trimmedData.name})`)

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}