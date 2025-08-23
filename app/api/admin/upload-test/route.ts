import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Upload test API called')
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    // Check if we can receive the form data
    const data = await request.formData()
    console.log('FormData received, entries:', data.keys())
    
    const files: File[] = data.getAll('files') as File[]
    console.log('Files count:', files.length)
    
    const fileInfo = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }))
    
    return NextResponse.json({ 
      success: true,
      message: 'Upload test successful - no actual upload performed',
      filesReceived: fileInfo,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Upload test error:', error)
    return NextResponse.json({ 
      error: 'Upload test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true,
    message: 'Upload test endpoint is working',
    timestamp: new Date().toISOString()
  })
}