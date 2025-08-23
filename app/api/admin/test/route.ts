import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Admin API test successful',
      timestamp: new Date().toISOString(),
      cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.slice(0, 10) + '...']))
    })
  } catch (error) {
    console.error('Admin test API error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin POST test successful',
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Admin test POST error:', error)
    return NextResponse.json({ 
      error: 'POST test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}