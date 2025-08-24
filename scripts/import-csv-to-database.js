#!/usr/bin/env node

/**
 * CSV to Database Import Script
 * Migrates product data from export.csv to PostgreSQL database
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const CSV_PATH = path.join(process.cwd(), 'export.csv')

// Helper function to parse CSV manually (handles commas in quoted values)
function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const values = []
    let current = ''
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    // Create object from headers and values
    const row = {}
    headers.forEach((header, index) => {
      let value = values[index] || ''
      // Remove surrounding quotes
      value = value.replace(/^"|"$/g, '')
      row[header] = value
    })
    
    rows.push(row)
  }

  return rows
}

// Helper function to convert string values to appropriate types
function convertValue(value, field) {
  if (!value || value === 'null' || value === '') {
    // Set defaults for required fields
    if (field === 'quantity') return 0
    if (['showInNewReleases', 'showInFeatured', 'showInComingSoon', 'showInStaffPicks', 
         'showInLimitedEditions', 'outOfStock', 'showInFeaturedWhileComingSoon',
         'featured', 'staffPick', 'limitedEdition'].includes(field)) {
      return false
    }
    return null
  }
  
  // Boolean fields
  if (['showInNewReleases', 'showInFeatured', 'showInComingSoon', 'showInStaffPicks', 
       'showInLimitedEditions', 'outOfStock', 'showInFeaturedWhileComingSoon',
       'featured', 'staffPick', 'limitedEdition'].includes(field)) {
    return value.toLowerCase() === 'true' || value === '1'
  }
  
  // Decimal/Number fields
  if (['price', 'weight', 'length', 'width', 'height', 'purchaseCost', 
       'shippingCost', 'totalCost'].includes(field)) {
    const num = parseFloat(value)
    return isNaN(num) ? null : num
  }
  
  // Integer fields
  if (field === 'quantity') {
    const num = parseInt(value)
    return isNaN(num) ? 0 : num
  }
  
  return value
}

async function importProducts() {
  try {
    console.log('🔍 Reading CSV file...')
    
    if (!fs.existsSync(CSV_PATH)) {
      console.error(`❌ CSV file not found at: ${CSV_PATH}`)
      process.exit(1)
    }

    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
    const rows = parseCSV(csvContent)
    
    console.log(`📊 Found ${rows.length} products in CSV`)

    if (rows.length === 0) {
      console.log('⚠️  No products to import')
      return
    }

    console.log('🧹 Clearing existing products...')
    await prisma.product.deleteMany()

    console.log('📥 Importing products to database...')
    let successCount = 0
    let errorCount = 0

    for (const [index, row] of rows.entries()) {
      try {
        // Skip invalid rows (those without proper SKU or where SKU starts with •)
        if (!row.sku || row.sku.startsWith('•') || row.sku.includes(',')) {
          console.log(`⚠️  Skipping invalid row ${index + 1}: ${row.sku}`)
          continue
        }

        // Map CSV fields to database schema
        const productData = {
          sku: row.sku,
          title: row.title || 'Untitled Product',
          description: convertValue(row.description, 'description'),
          brand: convertValue(row.brand, 'brand'),
          price: convertValue(row.price, 'price'),
          quantity: convertValue(row.quantity, 'quantity'),
          weight: convertValue(row.weight, 'weight'),
          length: convertValue(row.length, 'length'),
          width: convertValue(row.width, 'width'),
          height: convertValue(row.height, 'height'),
          images: convertValue(row.images, 'images'),
          status: row.status || 'live',
          saleState: convertValue(row.sale_state, 'saleState'),
          releaseAt: convertValue(row.release_at, 'releaseAt'),
          featured: convertValue(row.featured, 'featured'),
          staffPick: convertValue(row.staff_pick, 'staffPick'),
          limitedEdition: convertValue(row.limited_edition, 'limitedEdition'),
          showInNewReleases: convertValue(row.show_in_new_releases, 'showInNewReleases'),
          showInFeatured: convertValue(row.show_in_featured, 'showInFeatured'),
          showInComingSoon: convertValue(row.show_in_coming_soon, 'showInComingSoon'),
          showInStaffPicks: convertValue(row.show_in_staff_picks, 'showInStaffPicks'),
          showInLimitedEditions: convertValue(row.show_in_limited_editions, 'showInLimitedEditions'),
          outOfStock: convertValue(row.out_of_stock, 'outOfStock'),
          showInFeaturedWhileComingSoon: convertValue(row.show_in_featured_while_coming_soon, 'showInFeaturedWhileComingSoon'),
          purchaseCost: convertValue(row.purchase_cost, 'purchaseCost'),
          shippingCost: convertValue(row.shipping_cost, 'shippingCost'),
          totalCost: convertValue(row.total_cost, 'totalCost'),
          purchaseDate: convertValue(row.purchase_date, 'purchaseDate'),
          supplier: convertValue(row.supplier, 'supplier'),
          trackingNumber: convertValue(row.tracking_number, 'trackingNumber'),
          dropDate: convertValue(row.drop_date, 'dropDate'),
          releasedDate: convertValue(row.released_date, 'releasedDate'),
        }

        await prisma.product.create({
          data: productData
        })

        successCount++
        
        // Progress indicator
        if (successCount % 10 === 0 || successCount === rows.length) {
          console.log(`✅ Imported ${successCount}/${rows.length} products`)
        }

      } catch (error) {
        errorCount++
        console.error(`❌ Failed to import product ${row.sku || index}:`, error.message)
        
        // Show first few errors in detail, then just count
        if (errorCount <= 3) {
          console.error('   Product data:', JSON.stringify(row, null, 2))
        }
      }
    }

    console.log('\n🎉 Import completed!')
    console.log(`✅ Successfully imported: ${successCount} products`)
    if (errorCount > 0) {
      console.log(`❌ Failed imports: ${errorCount} products`)
    }

    // Verify import
    const totalInDB = await prisma.product.count()
    console.log(`📊 Total products in database: ${totalInDB}`)

  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

async function main() {
  console.log('🚀 Starting CSV to Database Import...\n')
  
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    await importProducts()
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Disconnected from database')
  }
}

if (require.main === module) {
  main()
}

module.exports = { importProducts }