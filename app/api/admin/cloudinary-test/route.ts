import { NextRequest, NextResponse } from 'next/server'
import { validateCloudinaryConfig } from '../../../../lib/cloudinary'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Cloudinary configuration...')
    
    // Check environment variables
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING', 
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING'
    }
    
    console.log('Environment variables:', config)
    
    // Test validation function
    const isValid = validateCloudinaryConfig()
    console.log('Cloudinary config validation:', isValid)
    
    // Try to import Cloudinary
    let cloudinaryImported = false
    try {
      const { v2 } = require('cloudinary')
      cloudinaryImported = true
      console.log('✅ Cloudinary v2 imported successfully')
    } catch (importError) {
      console.error('❌ Failed to import Cloudinary:', importError)
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      config,
      validation: isValid,
      cloudinaryImported,
      message: 'Cloudinary test completed'
    })
    
  } catch (error) {
    console.error('Cloudinary test error:', error)
    return NextResponse.json({ 
      error: 'Cloudinary test failed', 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}