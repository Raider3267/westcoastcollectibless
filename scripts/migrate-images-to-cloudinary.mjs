#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'
import Papa from 'papaparse'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
config({ path: join(projectRoot, '.env.local') })

// Environment validation
function validateEnvironment() {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    console.error('Please set these in your .env.local file or environment')
    process.exit(1)
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  })

  console.log('✅ Cloudinary configuration validated')
}

// Constants
const FOLDERS = {
  PRODUCTS: 'westcoast/products',
  TEMP: 'westcoast/temp'
}

const UPLOAD_PRESET = 'westcoast_product_gallery'

/**
 * Upload a single image to Cloudinary
 */
async function uploadImageToCloudinary(imagePath, originalUrl) {
  try {
    const fileName = path.basename(imagePath, path.extname(imagePath))
    
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: FOLDERS.PRODUCTS,
      public_id: `migrated_${fileName}`,
      resource_type: 'image',
      use_filename: false,
      unique_filename: true,
      overwrite: false,
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    })

    console.log(`✅ Uploaded: ${originalUrl} -> ${result.secure_url}`)
    
    return {
      original_url: originalUrl,
      cloudinary_public_id: result.public_id,
      cloudinary_url: result.secure_url,
      version: result.version,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      uploaded_at: new Date().toISOString()
    }
  } catch (error) {
    console.error(`❌ Failed to upload ${imagePath}:`, error.message)
    throw error
  }
}

/**
 * Download external image to temp location
 */
async function downloadExternalImage(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Extract filename from URL or create one
    const urlPath = new URL(url).pathname
    const extension = path.extname(urlPath) || '.jpg'
    const fileName = `external_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${extension}`
    const tempPath = path.join(process.cwd(), 'temp', fileName)
    
    // Ensure temp directory exists
    await fs.mkdir(path.dirname(tempPath), { recursive: true })
    await fs.writeFile(tempPath, buffer)
    
    return tempPath
  } catch (error) {
    console.error(`❌ Failed to download ${url}:`, error.message)
    throw error
  }
}

/**
 * Get all images from CSV data
 */
async function getImagesFromCsv() {
  try {
    const csvPath = path.join(process.cwd(), 'export.csv')
    const csvContent = await fs.readFile(csvPath, 'utf-8')
    
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    })

    const allImages = new Set()
    
    for (const row of parseResult.data) {
      if (row.images) {
        const imageUrls = row.images
          .split(',')
          .map(img => img.trim())
          .filter(img => img && img !== '')
        
        imageUrls.forEach(url => allImages.add(url))
      }
    }

    return Array.from(allImages)
  } catch (error) {
    console.error('❌ Failed to parse CSV:', error)
    throw error
  }
}

/**
 * Migrate all local images
 */
async function migrateLocalImages() {
  const localImagesDir = path.join(process.cwd(), 'public', 'uploads', 'products')
  const manifest = {}
  
  try {
    const files = await fs.readdir(localImagesDir)
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    )

    console.log(`\n📁 Found ${imageFiles.length} local images to migrate`)

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const filePath = path.join(localImagesDir, file)
      const originalUrl = `/uploads/products/${file}`
      
      try {
        console.log(`[${i + 1}/${imageFiles.length}] Uploading ${file}...`)
        const manifestEntry = await uploadImageToCloudinary(filePath, originalUrl)
        manifest[originalUrl] = manifestEntry
      } catch (error) {
        console.error(`❌ Failed to migrate ${file}:`, error.message)
        // Continue with other files
      }
    }

    return manifest
  } catch (error) {
    console.error('❌ Failed to access local images directory:', error)
    return {}
  }
}

/**
 * Migrate external images referenced in CSV
 */
async function migrateExternalImages() {
  const allImages = await getImagesFromCsv()
  const manifest = {}
  
  // Filter for external images only
  const externalImages = allImages.filter(url => 
    (url.startsWith('http://') || url.startsWith('https://')) &&
    !url.includes('cloudinary.com')
  )

  console.log(`\n🌐 Found ${externalImages.length} external images to migrate`)

  for (let i = 0; i < externalImages.length; i++) {
    const url = externalImages[i]
    
    try {
      console.log(`[${i + 1}/${externalImages.length}] Processing ${url}...`)
      
      // Download to temp location
      const tempPath = await downloadExternalImage(url)
      
      // Upload to Cloudinary
      const manifestEntry = await uploadImageToCloudinary(tempPath, url)
      manifest[url] = manifestEntry
      
      // Clean up temp file
      await fs.unlink(tempPath)
      
    } catch (error) {
      console.error(`❌ Failed to migrate external image ${url}:`, error.message)
      // Continue with other images
    }
  }

  return manifest
}

/**
 * Create placeholder images
 */
async function createPlaceholders() {
  try {
    console.log('\n🖼️  Creating placeholder images...')
    
    // Upload a simple placeholder (we'll create a simple colored rectangle)
    const placeholderSvg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#f3f4f6"/>
        <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">West Coast</text>
        <text x="200" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">Collectibles</text>
        <text x="200" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#9ca3af">📦</text>
      </svg>
    `
    
    const result = await cloudinary.uploader.upload(`data:image/svg+xml;base64,${Buffer.from(placeholderSvg).toString('base64')}`, {
      public_id: 'westcoast/placeholders/product-placeholder',
      resource_type: 'image',
      overwrite: true,
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    })

    console.log(`✅ Created placeholder: ${result.secure_url}`)
    return result.secure_url
  } catch (error) {
    console.error('❌ Failed to create placeholder:', error)
    return null
  }
}

/**
 * Save manifest to file
 */
async function saveManifest(manifest) {
  try {
    const manifestPath = path.join(process.cwd(), 'image-manifest.json')
    const manifestData = {
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      total_images: Object.keys(manifest).length,
      images: manifest
    }
    
    await fs.writeFile(manifestPath, JSON.stringify(manifestData, null, 2))
    console.log(`\n✅ Saved manifest with ${Object.keys(manifest).length} images to image-manifest.json`)
  } catch (error) {
    console.error('❌ Failed to save manifest:', error)
    throw error
  }
}

/**
 * Clean up temp directory
 */
async function cleanup() {
  try {
    const tempDir = path.join(process.cwd(), 'temp')
    await fs.rmdir(tempDir, { recursive: true })
    console.log('🧹 Cleaned up temporary files')
  } catch (error) {
    // Temp directory might not exist, that's ok
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting image migration to Cloudinary...\n')
  
  try {
    // Validate environment
    validateEnvironment()
    
    // Initialize manifest
    let manifest = {}
    
    // Create placeholders first
    await createPlaceholders()
    
    // Migrate local images
    const localManifest = await migrateLocalImages()
    manifest = { ...manifest, ...localManifest }
    
    // Migrate external images
    const externalManifest = await migrateExternalImages()
    manifest = { ...manifest, ...externalManifest }
    
    // Save manifest
    await saveManifest(manifest)
    
    // Cleanup
    await cleanup()
    
    console.log('\n🎉 Migration completed successfully!')
    console.log(`📊 Total images migrated: ${Object.keys(manifest).length}`)
    console.log('\n📝 Next steps:')
    console.log('1. Update your application to use the new helper functions')
    console.log('2. Test image loading in development')
    console.log('3. Run CI verification scripts')
    console.log('4. Deploy to production')
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error)
    await cleanup()
    process.exit(1)
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as migrateImages }