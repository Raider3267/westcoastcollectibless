import { NextResponse } from 'next/server'
import { existsSync } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Check environment variables (booleans only for security)
    const envVars = {
      // Square vars
      SQUARE_ENV: !!process.env.SQUARE_ENV,
      SQUARE_ACCESS_TOKEN: !!process.env.SQUARE_ACCESS_TOKEN,
      SQUARE_LOCATION_ID: !!process.env.SQUARE_LOCATION_ID,
      NEXT_PUBLIC_SQUARE_APPLICATION_ID: !!process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
      NEXT_PUBLIC_SQUARE_LOCATION_ID: !!process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      
      // Auth vars
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      ADMIN_EMAILS: !!process.env.ADMIN_EMAILS,
      
      // Base config
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_SITE_NAME: !!process.env.NEXT_PUBLIC_SITE_NAME,
      NODE_ENV: process.env.NODE_ENV,
      
      // Optional
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    }

    // Check file system paths
    const csvPath = path.join(process.cwd(), 'export.csv')
    const csvStandardizedPath = path.join(process.cwd(), 'export_standardized.csv')
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads', 'products')
    
    const fileSystem = {
      csv_exists: existsSync(csvPath),
      csv_standardized_exists: existsSync(csvStandardizedPath),
      uploads_dir_exists: existsSync(uploadsPath),
      working_directory: process.cwd()
    }

    // Try to read a few lines of CSV for basic validation
    let csvPreview = null
    try {
      if (existsSync(csvPath)) {
        const fs = await import('fs').then(m => m.promises)
        const content = await fs.readFile(csvPath, 'utf-8')
        const lines = content.split('\n').slice(0, 3) // First 3 lines
        csvPreview = {
          line_count: content.split('\n').length,
          headers: lines[0]?.split(',').map(h => h.trim()) || [],
          has_data_rows: lines.length > 1
        }
      }
    } catch (error) {
      csvPreview = { error: 'Failed to read CSV' }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      runtime: process.env.VERCEL ? 'vercel' : 'local',
      envVars,
      fileSystem,
      csvPreview
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Diagnostic failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}