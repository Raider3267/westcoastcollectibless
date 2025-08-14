import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

const CSV_PATH = path.join(process.cwd(), 'export.csv')

export async function POST() {
  try {
    console.log('Checking for products to auto-launch...')
    
    const csvContent = await fs.readFile(CSV_PATH, 'utf-8')
    const records = parse(csvContent, { 
      columns: true, 
      skip_empty_lines: true,
      trim: true 
    })

    const currentTime = new Date()
    let updatedCount = 0

    const updatedRecords = records.map(record => {
      // Check if product is coming-soon and has a drop date
      if (record.status === 'coming-soon' && record.drop_date) {
        const dropDate = new Date(record.drop_date)
        
        // If drop date has passed, change status to live
        if (dropDate <= currentTime) {
          console.log(`Auto-launching product: ${record.title} (SKU: ${record.sku})`)
          record.status = 'live'
          record.drop_date = '' // Clear the drop date since it's now live
          record.released_date = currentTime.toISOString() // Set release timestamp
          record.show_in_new_releases = 'true' // Show in New Releases by default
          updatedCount++
        }
      }
      return record
    })

    if (updatedCount > 0) {
      // Write back to CSV if any products were updated
      const csvOutput = stringify(updatedRecords, { 
        header: true, 
        columns: Object.keys(updatedRecords[0])
      })
      
      await fs.writeFile(CSV_PATH, csvOutput, 'utf-8')
      console.log(`Successfully auto-launched ${updatedCount} product(s)`)
      
      return NextResponse.json({ 
        success: true, 
        message: `Auto-launched ${updatedCount} product(s)`,
        updatedCount 
      })
    } else {
      console.log('No products ready to launch at this time')
      return NextResponse.json({ 
        success: true, 
        message: 'No products ready to launch',
        updatedCount: 0 
      })
    }

  } catch (error) {
    console.error('Error checking drop dates:', error)
    return NextResponse.json({ 
      error: 'Failed to check drop dates',
      details: error.message 
    }, { status: 500 })
  }
}