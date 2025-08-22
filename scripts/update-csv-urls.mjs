#!/usr/bin/env node

import { promises as fs } from 'fs'
import Papa from 'papaparse'

console.log('🔄 Updating CSV with Cloudinary URLs...\n')

try {
  // Load the image manifest
  const manifestContent = await fs.readFile('image-manifest.json', 'utf-8')
  const manifest = JSON.parse(manifestContent)
  
  console.log(`📋 Loaded manifest with ${manifest.total_images} images`)
  
  // Load the CSV
  const csvContent = await fs.readFile('export.csv', 'utf-8')
  const parseResult = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true
  })
  
  let updatedRows = 0
  let updatedImages = 0
  
  // Update each row
  for (const row of parseResult.data) {
    if (row.images) {
      const imageUrls = row.images
        .split(',')
        .map(img => img.trim())
        .filter(img => img && img !== '')
      
      const updatedUrls = imageUrls.map(url => {
        // Check if this URL is in our manifest
        if (manifest.images[url]) {
          updatedImages++
          return manifest.images[url].cloudinary_url
        }
        return url
      })
      
      // Update the row if any images were changed
      const newImageString = updatedUrls.join(', ')
      if (newImageString !== row.images) {
        row.images = newImageString
        updatedRows++
      }
    }
  }
  
  // Convert back to CSV
  const updatedCsv = Papa.unparse(parseResult.data)
  
  // Backup the original
  await fs.copyFile('export.csv', 'export.csv.backup')
  console.log('💾 Created backup: export.csv.backup')
  
  // Write the updated CSV
  await fs.writeFile('export.csv', updatedCsv)
  
  console.log(`✅ Updated ${updatedRows} rows with ${updatedImages} image URLs`)
  console.log('📝 CSV has been updated with Cloudinary URLs')
  
} catch (error) {
  console.error('❌ Error updating CSV:', error.message)
  process.exit(1)
}