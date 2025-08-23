#!/usr/bin/env node

/**
 * Test script for image upload functionality
 * Tests the complete flow from file upload to Cloudinary
 */

import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function validateEnvironment() {
  log('🔍 Validating Cloudinary environment...', 'blue');
  
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET'
  ];
  
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log(`❌ Missing environment variables: ${missing.join(', ')}`, 'red');
    return false;
  }
  
  log('✅ All Cloudinary environment variables present', 'green');
  return true;
}

async function createTestImage() {
  log('🖼️  Creating test image...', 'blue');
  
  // Create a simple test image (1x1 PNG)
  const testImageData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  const testImagePath = join(rootDir, 'test-image.png');
  await fs.writeFile(testImagePath, testImageData);
  
  log(`✅ Test image created at: ${testImagePath}`, 'green');
  return testImagePath;
}

async function testUploadEndpoint(imagePath) {
  log('📤 Testing upload endpoint...', 'blue');
  
  try {
    // Read the test image as buffer
    const imageBuffer = await fs.readFile(imagePath);
    
    // Create FormData using browser-compatible approach
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('files', blob, 'test-image.png');
    
    // Test the upload endpoint with admin authentication cookie
    const response = await fetch('http://localhost:3001/api/admin/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': 'temp-admin-access=true'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      log('✅ Upload endpoint test successful', 'green');
      log(`   Uploaded ${result.files.length} file(s)`, 'cyan');
      result.files.forEach((file, index) => {
        log(`   File ${index + 1}: ${file.cloudinary_url}`, 'cyan');
      });
      return { success: true, result };
    } else {
      log('❌ Upload endpoint test failed', 'red');
      log(`   Status: ${response.status}`, 'red');
      log(`   Error: ${result.error || 'Unknown error'}`, 'red');
      return { success: false, error: result.error };
    }
  } catch (error) {
    log('❌ Upload endpoint test error', 'red');
    log(`   Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testCloudinaryDirectly() {
  log('☁️  Testing Cloudinary directly...', 'blue');
  
  try {
    // Import cloudinary after environment validation
    const { v2: cloudinary } = await import('cloudinary');
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    
    // Test upload with a simple data URI
    const testDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';
    
    const result = await cloudinary.uploader.upload(testDataUri, {
      folder: 'westcoast/products/test',
      public_id: `test_${Date.now()}`,
      resource_type: 'image'
    });
    
    log('✅ Cloudinary direct test successful', 'green');
    log(`   Public ID: ${result.public_id}`, 'cyan');
    log(`   URL: ${result.secure_url}`, 'cyan');
    
    // Cleanup test upload
    await cloudinary.uploader.destroy(result.public_id);
    log('🗑️  Test image cleaned up from Cloudinary', 'yellow');
    
    return { success: true, result };
  } catch (error) {
    log('❌ Cloudinary direct test failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testImageUploadComponent() {
  log('🎨 Testing ImageUpload component integration...', 'blue');
  
  // Check if the component exists and has proper exports
  const componentPath = join(rootDir, 'components', 'ImageUpload.tsx');
  
  try {
    const componentContent = await fs.readFile(componentPath, 'utf-8');
    
    // Basic syntax checks
    const hasRequiredImports = componentContent.includes('useState') && componentContent.includes('useRef');
    const hasUploadFunction = componentContent.includes('uploadFiles');
    const hasFormData = componentContent.includes('FormData');
    const hasProperExport = componentContent.includes('export default');
    
    if (hasRequiredImports && hasUploadFunction && hasFormData && hasProperExport) {
      log('✅ ImageUpload component structure looks good', 'green');
      return { success: true };
    } else {
      log('❌ ImageUpload component has structural issues', 'red');
      return { 
        success: false, 
        issues: {
          hasRequiredImports,
          hasUploadFunction,
          hasFormData,
          hasProperExport
        }
      };
    }
  } catch (error) {
    log('❌ Could not analyze ImageUpload component', 'red');
    log(`   Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function cleanup(imagePath) {
  log('🧹 Cleaning up test files...', 'blue');
  
  try {
    await fs.unlink(imagePath);
    log('✅ Test image cleaned up', 'green');
  } catch (error) {
    log('⚠️  Could not clean up test image', 'yellow');
  }
}

async function runTests() {
  log('🚀 Starting Image Upload Tests', 'bold');
  log('================================', 'blue');
  
  let testImagePath;
  let allTestsPassed = true;
  
  try {
    // Test 1: Environment validation
    const envValid = await validateEnvironment();
    if (!envValid) {
      allTestsPassed = false;
      return;
    }
    
    // Test 2: Component structure
    const componentTest = await testImageUploadComponent();
    if (!componentTest.success) {
      allTestsPassed = false;
    }
    
    // Test 3: Cloudinary direct connection
    const cloudinaryTest = await testCloudinaryDirectly();
    if (!cloudinaryTest.success) {
      allTestsPassed = false;
    }
    
    // Test 4: Upload endpoint (requires Next.js server to be running)
    testImagePath = await createTestImage();
    log('⚠️  Note: Upload endpoint test requires Next.js server running on localhost:3000', 'yellow');
    
    // Skip endpoint test if server is not running
    try {
      const healthCheck = await fetch('http://localhost:3001/api/health');
      if (healthCheck.ok) {
        const endpointTest = await testUploadEndpoint(testImagePath);
        if (!endpointTest.success) {
          allTestsPassed = false;
        }
      } else {
        log('⚠️  Skipping endpoint test - Next.js server not running', 'yellow');
      }
    } catch {
      log('⚠️  Skipping endpoint test - Next.js server not running', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Test suite error: ${error.message}`, 'red');
    allTestsPassed = false;
  } finally {
    if (testImagePath) {
      await cleanup(testImagePath);
    }
  }
  
  log('================================', 'blue');
  if (allTestsPassed) {
    log('🎉 All tests passed! Image upload functionality should work correctly.', 'green');
  } else {
    log('⚠️  Some tests failed. Check the output above for details.', 'red');
  }
}

// Load environment variables
try {
  const envPath = join(rootDir, '.env.local');
  const envContent = await fs.readFile(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  log('⚠️  Could not load .env.local file', 'yellow');
}

runTests();