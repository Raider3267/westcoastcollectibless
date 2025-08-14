const fs = require('fs')
const { parse } = require('csv-parse/sync')
const { stringify } = require('csv-stringify/sync')

async function addDropDateColumn() {
  try {
    console.log('Reading CSV file...')
    const csvContent = fs.readFileSync('export.csv', 'utf-8')
    
    const records = parse(csvContent, { 
      columns: true, 
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
      skip_records_with_error: true
    })
    
    console.log(`Found ${records.length} records`)
    
    // Add drop_date column to each record (empty by default)
    const updatedRecords = records.map(record => {
      if (!record.drop_date) {
        record.drop_date = '' // Add empty drop_date field
      }
      return record
    })
    
    console.log('Writing updated CSV...')
    
    // Get all possible column names in the correct order
    const columns = [
      'sku', 'title', 'description', 'quantity', 'price', 'images',
      'optionname1', 'optionname2', 'optionname3', 'optionname4', 'optionname5',
      'option1', 'option2', 'option3', 'option4', 'option5',
      'product_identifier', 'product_identifier_type', 'brand', 'cost', 'status', 'drop_date'
    ]
    
    // Convert back to CSV
    const csvOutput = stringify(updatedRecords, { 
      header: true, 
      columns: columns 
    })
    
    fs.writeFileSync('export.csv', csvOutput, 'utf-8')
    console.log('CSV file updated successfully with drop_date column!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addDropDateColumn()