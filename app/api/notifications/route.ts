import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'

interface Notification {
  product_id: string
  email: string
  created_at: string
}

const NOTIFICATIONS_FILE = path.join(process.cwd(), 'notifications.json')

async function loadNotifications(): Promise<Notification[]> {
  try {
    const data = await readFile(NOTIFICATIONS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

async function saveNotifications(notifications: Notification[]): Promise<void> {
  await writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, email, created_at } = body

    // Validate required fields
    if (!product_id || !email || !created_at) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, email, created_at' },
        { status: 400 }
      )
    }

    // Basic email validation
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Load existing notifications
    const notifications = await loadNotifications()

    // Check if this email is already registered for this product
    const existingNotification = notifications.find(
      n => n.product_id === product_id && n.email.toLowerCase() === email.toLowerCase()
    )

    if (existingNotification) {
      return NextResponse.json(
        { message: 'Email already registered for this product' },
        { status: 200 }
      )
    }

    // Add new notification
    const newNotification: Notification = {
      product_id,
      email: email.toLowerCase().trim(),
      created_at
    }

    notifications.push(newNotification)

    // Save to file
    await saveNotifications(notifications)

    return NextResponse.json(
      { message: 'Notification registered successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const product_id = searchParams.get('product_id')

    const notifications = await loadNotifications()

    if (product_id) {
      // Return notifications for specific product
      const productNotifications = notifications.filter(n => n.product_id === product_id)
      return NextResponse.json({ notifications: productNotifications })
    } else {
      // Return all notifications (for admin use)
      return NextResponse.json({ notifications })
    }
  } catch (error) {
    console.error('Notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}