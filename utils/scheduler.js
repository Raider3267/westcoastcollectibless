const fs = require('fs')
const { parse } = require('csv-parse/sync')
const { stringify } = require('csv-stringify/sync')

const CSV_PATH = './export.csv'

async function checkAndUpdateDropDates() {
  try {
    console.log('Checking for products to auto-launch...')
    
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
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
      
      fs.writeFileSync(CSV_PATH, csvOutput, 'utf-8')
      console.log(`Successfully auto-launched ${updatedCount} product(s)`)
    } else {
      console.log('No products ready to launch at this time')
    }

  } catch (error) {
    console.error('Error checking drop dates:', error)
  }
}

// Export for use in API routes
module.exports = { checkAndUpdateDropDates }

// Allow running directly with node
if (require.main === module) {
  checkAndUpdateDropDates()
}