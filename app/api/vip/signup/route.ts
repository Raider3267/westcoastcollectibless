import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json()

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create mailing list entry
    const mailingListEntry = {
      email: trimmedEmail,
      created_at: new Date().toISOString(),
      source: source || 'vip_home'
    }

    // For now, append to a simple JSON file - in production this would be a database
    const dataDir = path.join(process.cwd(), 'data')
    const mailingListFile = path.join(dataDir, 'mailing_list.json')

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    let mailingList = []
    
    // Read existing mailing list if it exists
    if (fs.existsSync(mailingListFile)) {
      try {
        const fileContent = fs.readFileSync(mailingListFile, 'utf-8')
        mailingList = JSON.parse(fileContent)
      } catch (error) {
        console.error('Error reading mailing list file:', error)
        mailingList = []
      }
    }

    // Check if email already exists
    const existingEntry = mailingList.find((entry: any) => entry.email === trimmedEmail)
    if (existingEntry) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 200 }
      )
    }

    // Add new entry
    mailingList.push(mailingListEntry)

    // Write back to file
    fs.writeFileSync(mailingListFile, JSON.stringify(mailingList, null, 2))

    console.log(`New VIP signup: ${trimmedEmail} (source: ${source})`)

    return NextResponse.json(
      { message: 'Successfully joined VIP list' },
      { status: 200 }
    )

  } catch (error) {
    console.error('VIP signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}