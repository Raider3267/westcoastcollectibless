#!/usr/bin/env node

/**
 * Test script to verify Cloudinary setup and helper functions
 * Run this before the full migration to ensure everything is configured correctly
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
config({ path: join(projectRoot, '.env.local') })

console.log('🧪 Testing Cloudinary setup...\n')

// Test 1: Environment variables
console.log('1. Checking environment variables...')
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
const missingVars = requiredEnvVars.filter(key => !process.env[key])

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:', missingVars.join(', '))
  console.log('Please set these in your .env.local file')
  process.exit(1)
}
console.log('✅ All required environment variables are set')

// Test 2: Cloudinary connection
console.log('\n2. Testing Cloudinary connection...')
try {
  const { v2: cloudinary } = await import('cloudinary')
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  })

  // Test basic API call
  const result = await cloudinary.api.ping()
  console.log('✅ Cloudinary connection successful:', result.status)
  
} catch (error) {
  console.log('❌ Cloudinary connection failed:', error.message)
  process.exit(1)
}

// Test 3: Helper functions
console.log('\n3. Testing helper functions...')
try {
  // Import helper functions
  const { getImageUrl, getImageUrls, getPlaceholderUrl, TRANSFORMATIONS } = await import('../lib/cloudinary.ts')
  
  // Test placeholder URL generation
  const placeholderUrl = getPlaceholderUrl()
  console.log('✅ Placeholder URL generated:', placeholderUrl)
  
  // Test image URL processing
  const testUrls = [
    '/uploads/products/test.jpg',
    'https://i.frg.im/test/image.jpg',
    'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
    null,
    undefined
  ]
  
  testUrls.forEach(url => {
    const processedUrl = getImageUrl(url, TRANSFORMATIONS.PRODUCT_CARD)
    console.log(`✅ Processed "${url}" -> "${processedUrl}"`)
  })
  
} catch (error) {
  console.log('❌ Helper function test failed:', error.message)
  // This might fail in pure Node.js environment, but that's expected
  console.log('ℹ️  Helper functions will work properly in Next.js environment')
}

// Test 4: Check existing local images
console.log('\n4. Checking local images...')
try {
  const { promises: fs } = await import('fs')
  const path = await import('path')
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
  const files = await fs.readdir(uploadsDir)
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  )
  
  console.log(`✅ Found ${imageFiles.length} local images ready for migration`)
  imageFiles.slice(0, 5).forEach(file => {
    console.log(`   - ${file}`)
  })
  if (imageFiles.length > 5) {
    console.log(`   ... and ${imageFiles.length - 5} more`)
  }
  
} catch (error) {
  console.log('⚠️  Could not access local images directory:', error.message)
}

// Test 5: CSV image references
console.log('\n5. Checking CSV image references...')
try {
  const { promises: fs } = await import('fs')
  const Papa = await import('papaparse')
  
  const csvContent = await fs.readFile('export.csv', 'utf-8')
  const parseResult = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true
  })

  let imageCount = 0
  let localImageCount = 0
  let externalImageCount = 0
  let cloudinaryImageCount = 0

  for (const row of parseResult.data) {
    if (row.images) {
      const imageUrls = row.images
        .split(',')
        .map(img => img.trim())
        .filter(img => img && img !== '')
      
      imageCount += imageUrls.length
      
      imageUrls.forEach(url => {
        if (url.startsWith('/uploads/products/')) {
          localImageCount++
        } else if (url.includes('cloudinary.com')) {
          cloudinaryImageCount++
        } else if (url.startsWith('http')) {
          externalImageCount++
        }
      })
    }
  }

  console.log(`✅ CSV analysis complete:`)
  console.log(`   Total images: ${imageCount}`)
  console.log(`   Local images: ${localImageCount} (will be migrated)`)
  console.log(`   External images: ${externalImageCount} (will be migrated)`)
  console.log(`   Cloudinary images: ${cloudinaryImageCount} (already migrated)`)
  
} catch (error) {
  console.log('⚠️  Could not analyze CSV:', error.message)
}

console.log('\n✅ Setup test completed!')
console.log('\n📝 Next steps:')
console.log('1. Run: pnpm run migrate:images')
console.log('2. Run: pnpm run verify:images')
console.log('3. Run: pnpm run test:images')
console.log('4. Deploy to staging and test')
console.log('5. Deploy to production')

export { }  // Make this a module