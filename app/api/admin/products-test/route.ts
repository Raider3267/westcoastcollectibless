import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const CSV_PATH = path.join(process.cwd(), 'export.csv')

export async function GET() {
  try {
    console.log('Testing CSV file access...')
    
    // Test if file exists
    const fileExists = await fs.access(CSV_PATH).then(() => true).catch(() => false)
    console.log('CSV file exists:', fileExists)
    
    if (fileExists) {
      // Test reading the file
      const content = await fs.readFile(CSV_PATH, 'utf-8')
      const lines = content.split('\n')
      console.log('CSV file read successfully, lines:', lines.length)
      
      return NextResponse.json({
        success: true,
        fileExists: true,
        csvPath: CSV_PATH,
        totalLines: lines.length,
        firstLine: lines[0],
        canRead: true,
        message: 'CSV file is accessible and readable'
      })
    } else {
      return NextResponse.json({
        success: false,
        fileExists: false,
        csvPath: CSV_PATH,
        message: 'CSV file does not exist'
      })
    }
    
  } catch (error) {
    console.error('CSV test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      csvPath: CSV_PATH,
      message: 'Failed to access CSV file'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Testing CSV write capability...')
    
    const body = await request.json()
    const testData = body.testData || 'test,data,write'
    
    // Try to append test data
    await fs.appendFile(CSV_PATH, `\n# TEST LINE: ${new Date().toISOString()}`)
    
    return NextResponse.json({
      success: true,
      message: 'Successfully wrote test data to CSV',
      csvPath: CSV_PATH,
      testData
    })
    
  } catch (error) {
    console.error('CSV write test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Failed to write to CSV file'
    }, { status: 500 })
  }
}