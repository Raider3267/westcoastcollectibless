#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'
import { glob } from 'glob'
import Papa from 'papaparse'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
config({ path: join(projectRoot, '.env.local') })

/**
 * CI script to verify that all images are properly migrated to Cloudinary
 * and no local image references remain in the codebase
 */

const ALLOWED_DOMAINS = [
  'res.cloudinary.com',
  'cloudinary.com',
  'i.frg.im', // External image provider - allowed
  'localhost:3000', // For development
  'vercel.app', // For staging/preview
  'westcoastcollectibless.com' // Production domain
]

const FORBIDDEN_PATTERNS = [
  '/uploads/products/', // Local uploads should be migrated
  'public/uploads/', // Any reference to local uploads
]

const errors = []
const warnings = []

/**
 * Check source code files for forbidden image patterns
 */
async function checkSourceFiles() {
  console.log('🔍 Checking source code files...')
  
  const sourceFiles = await glob('**/*.{ts,tsx,js,jsx,mjs}', {
    ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**', 'scripts/migrate-*']
  })

  for (const file of sourceFiles) {
    const content = await fs.readFile(file, 'utf-8')
    
    // Check for forbidden patterns
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (content.includes(pattern)) {
        const lines = content.split('\n')
        const lineNumbers = lines
          .map((line, index) => line.includes(pattern) ? index + 1 : null)
          .filter(Boolean)
        
        errors.push({
          type: 'FORBIDDEN_PATTERN',
          file,
          pattern,
          lines: lineNumbers,
          message: `File contains forbidden image pattern: ${pattern}`
        })
      }
    }
    
    // Check for hardcoded localhost references in production code
    if (content.includes('localhost:3000') && !file.includes('test') && !file.includes('dev')) {
      warnings.push({
        type: 'LOCALHOST_REFERENCE',
        file,
        message: 'File contains localhost reference - ensure this is intentional'
      })
    }
  }
}

/**
 * Check CSV data for local image references
 */
async function checkCsvData() {
  console.log('🔍 Checking CSV data...')
  
  try {
    const csvPath = path.join(process.cwd(), 'export.csv')
    const csvContent = await fs.readFile(csvPath, 'utf-8')
    
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    })

    const problematicRows = []
    
    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i]
      if (row.images) {
        const imageUrls = row.images
          .split(',')
          .map(img => img.trim())
          .filter(img => img && img !== '')
        
        for (const url of imageUrls) {
          // Check if it's a local upload that hasn't been migrated
          if (url.startsWith('/uploads/products/')) {
            // Check if this URL exists in the manifest
            const manifestExists = await checkImageInManifest(url)
            if (!manifestExists) {
              problematicRows.push({
                row: i + 2, // +2 because of header and 0-based index
                sku: row.sku,
                url,
                issue: 'Local image not found in manifest'
              })
            }
          }
          
          // Validate external URLs
          if (url.startsWith('http')) {
            const domain = new URL(url).hostname
            const isAllowed = ALLOWED_DOMAINS.some(allowed => 
              domain === allowed || domain.endsWith('.' + allowed)
            )
            
            if (!isAllowed) {
              warnings.push({
                type: 'EXTERNAL_DOMAIN',
                row: i + 2,
                sku: row.sku,
                url,
                domain,
                message: `External image from non-whitelisted domain: ${domain}`
              })
            }
          }
        }
      }
    }

    if (problematicRows.length > 0) {
      errors.push({
        type: 'CSV_LOCAL_IMAGES',
        count: problematicRows.length,
        rows: problematicRows,
        message: `Found ${problematicRows.length} products with local images not in manifest`
      })
    }

  } catch (error) {
    warnings.push({
      type: 'CSV_READ_ERROR',
      message: `Could not read CSV file: ${error.message}`
    })
  }
}

/**
 * Check if image exists in manifest
 */
async function checkImageInManifest(imageUrl) {
  try {
    const manifestPath = path.join(process.cwd(), 'image-manifest.json')
    const manifestContent = await fs.readFile(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestContent)
    
    return imageUrl in manifest.images
  } catch (error) {
    return false
  }
}

/**
 * Verify manifest file exists and is valid
 */
async function checkManifest() {
  console.log('🔍 Checking image manifest...')
  
  try {
    const manifestPath = path.join(process.cwd(), 'image-manifest.json')
    const manifestContent = await fs.readFile(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestContent)
    
    if (!manifest.version || !manifest.images) {
      errors.push({
        type: 'INVALID_MANIFEST',
        message: 'Image manifest is missing required fields (version, images)'
      })
      return
    }
    
    console.log(`✅ Found manifest with ${Object.keys(manifest.images).length} images`)
    
    // Verify Cloudinary URLs in manifest
    for (const [originalUrl, entry] of Object.entries(manifest.images)) {
      if (!entry.cloudinary_url || !entry.cloudinary_url.includes('cloudinary.com')) {
        errors.push({
          type: 'INVALID_CLOUDINARY_URL',
          originalUrl,
          cloudinaryUrl: entry.cloudinary_url,
          message: `Invalid Cloudinary URL for ${originalUrl}`
        })
      }
    }
    
  } catch (error) {
    errors.push({
      type: 'MANIFEST_ERROR',
      message: `Could not read or parse image manifest: ${error.message}`
    })
  }
}

/**
 * Check for orphaned local images
 */
async function checkOrphanedImages() {
  console.log('🔍 Checking for orphaned local images...')
  
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    const files = await fs.readdir(uploadsDir)
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    )

    if (imageFiles.length > 0) {
      warnings.push({
        type: 'ORPHANED_IMAGES',
        count: imageFiles.length,
        files: imageFiles.slice(0, 10), // Show first 10
        message: `Found ${imageFiles.length} local images that should be migrated or removed`
      })
    }

  } catch (error) {
    // Directory might not exist, which is actually good
    console.log('✅ No local uploads directory found (expected after migration)')
  }
}

/**
 * Test a sample of Cloudinary URLs to ensure they're accessible
 */
async function testCloudinaryUrls() {
  console.log('🔍 Testing Cloudinary URL accessibility...')
  
  try {
    const manifestPath = path.join(process.cwd(), 'image-manifest.json')
    const manifestContent = await fs.readFile(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestContent)
    
    const urls = Object.values(manifest.images).map(entry => entry.cloudinary_url)
    const sampleUrls = urls.slice(0, Math.min(5, urls.length)) // Test first 5 URLs
    
    const results = await Promise.allSettled(
      sampleUrls.map(async (url) => {
        const response = await fetch(url, { method: 'HEAD' })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return url
      })
    )

    const failed = results.filter(result => result.status === 'rejected')
    if (failed.length > 0) {
      errors.push({
        type: 'CLOUDINARY_ACCESS_ERROR',
        failedUrls: failed.map((result, index) => ({
          url: sampleUrls[index],
          error: result.reason.message
        })),
        message: `${failed.length} out of ${sampleUrls.length} tested Cloudinary URLs are not accessible`
      })
    } else {
      console.log(`✅ All ${sampleUrls.length} tested Cloudinary URLs are accessible`)
    }

  } catch (error) {
    warnings.push({
      type: 'CLOUDINARY_TEST_ERROR',
      message: `Could not test Cloudinary URLs: ${error.message}`
    })
  }
}

/**
 * Print results and exit with appropriate code
 */
function printResults() {
  console.log('\n📊 Verification Results')
  console.log('=======================')
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed! Images are properly configured for Cloudinary.')
    return 0
  }

  if (errors.length > 0) {
    console.log(`\n❌ Found ${errors.length} error(s):`)
    errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.type}: ${error.message}`)
      if (error.file) console.log(`   File: ${error.file}`)
      if (error.lines) console.log(`   Lines: ${error.lines.join(', ')}`)
      if (error.rows) {
        console.log(`   Affected rows: ${error.rows.slice(0, 5).map(r => `${r.sku} (row ${r.row})`).join(', ')}${error.rows.length > 5 ? ` and ${error.rows.length - 5} more` : ''}`)
      }
    })
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Found ${warnings.length} warning(s):`)
    warnings.forEach((warning, index) => {
      console.log(`\n${index + 1}. ${warning.type}: ${warning.message}`)
      if (warning.file) console.log(`   File: ${warning.file}`)
      if (warning.files) console.log(`   Files: ${warning.files.slice(0, 3).join(', ')}${warning.files.length > 3 ? ` and ${warning.files.length - 3} more` : ''}`)
    })
  }

  console.log('\n📝 Next Steps:')
  if (errors.length > 0) {
    console.log('- Fix all errors before deploying')
    console.log('- Run migration script if images are not properly migrated')
    console.log('- Update code to use Cloudinary helper functions')
  }
  if (warnings.length > 0) {
    console.log('- Review warnings and address if necessary')
    console.log('- Remove orphaned local images after successful migration')
  }

  return errors.length > 0 ? 1 : 0
}

/**
 * Main verification function
 */
async function main() {
  console.log('🚀 Starting Cloudinary migration verification...\n')
  
  try {
    await checkSourceFiles()
    await checkCsvData()
    await checkManifest()
    await checkOrphanedImages()
    await testCloudinaryUrls()
    
    const exitCode = printResults()
    process.exit(exitCode)
    
  } catch (error) {
    console.error('\n💥 Verification failed:', error)
    process.exit(1)
  }
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as verifyCloudinaryMigration }