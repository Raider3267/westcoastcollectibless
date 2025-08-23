import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow this in development or for debugging
  const isDev = process.env.NODE_ENV === 'development'
  
  if (!isDev) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }
  
  const config = {
    NODE_ENV: process.env.NODE_ENV,
    hasCloudinaryCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasCloudinaryApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasCloudinaryApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME?.substring(0, 5) + '...' // Show only first 5 chars for security
  }
  
  return NextResponse.json(config)
}