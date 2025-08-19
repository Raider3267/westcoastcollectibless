#!/usr/bin/env node

/**
 * Square Credentials Tester
 * Run this script to validate your Square API credentials
 * Usage: node test-square-credentials.js
 */

require('dotenv').config({ path: '.env.local' })

async function testSquareCredentials() {
  console.log('🔍 Testing Square API Credentials...\n')
  
  // Check environment variables
  const requiredEnvs = [
    'SQUARE_APP_ID',
    'SQUARE_ACCESS_TOKEN', 
    'SQUARE_LOCATION_ID',
    'SQUARE_ENVIRONMENT'
  ]
  
  const missing = requiredEnvs.filter(env => !process.env[env])
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '))
    console.log('\n💡 Update your .env.local file with Square credentials from:')
    console.log('   https://developer.squareup.com/apps → Your App → Credentials → Production tab\n')
    return
  }
  
  const environment = process.env.SQUARE_ENVIRONMENT
  const baseUrl = environment === 'production' 
    ? 'https://connect.squareup.com' 
    : 'https://connect.squareupsandbox.com'
  
  console.log(`🌍 Environment: ${environment}`)
  console.log(`🔗 API Base URL: ${baseUrl}`)
  console.log(`🆔 App ID: ${process.env.SQUARE_APP_ID}`)
  console.log(`📍 Location ID: ${process.env.SQUARE_LOCATION_ID}`)
  console.log(`🔑 Access Token: ${process.env.SQUARE_ACCESS_TOKEN?.substring(0, 10)}...\n`)
  
  try {
    console.log('🧪 Testing API connection...')
    
    const response = await fetch(`${baseUrl}/v2/locations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18'
      }
    })
    
    const result = await response.json()
    
    if (response.ok && result.locations) {
      console.log('✅ SUCCESS! Square API credentials are valid')
      console.log(`📍 Found ${result.locations.length} location(s):`)
      result.locations.forEach((loc, i) => {
        console.log(`   ${i + 1}. ${loc.name} (${loc.id})`)
        console.log(`      Status: ${loc.status}`)
        console.log(`      Country: ${loc.country}`)
      })
      console.log('\n🚀 Your payment system should work now!')
      
      // Verify the location ID matches
      const configuredLocationId = process.env.SQUARE_LOCATION_ID
      const foundLocation = result.locations.find(loc => loc.id === configuredLocationId)
      
      if (foundLocation) {
        console.log(`✅ Configured location ID (${configuredLocationId}) is valid`)
      } else {
        console.log(`⚠️  Warning: Configured location ID (${configuredLocationId}) not found`)
        console.log('   Available location IDs:', result.locations.map(l => l.id).join(', '))
      }
      
    } else {
      console.error('❌ FAILED! Square API returned error:')
      console.error('Status:', response.status)
      console.error('Error:', JSON.stringify(result, null, 2))
      
      if (result.errors) {
        result.errors.forEach(error => {
          console.error(`\n🚨 ${error.category}: ${error.code}`)
          console.error(`   ${error.detail}`)
          
          if (error.code === 'UNAUTHORIZED') {
            console.log('\n💡 Common fixes for UNAUTHORIZED error:')
            console.log('   1. Check if your access token is correct and not expired')
            console.log('   2. Make sure you\'re using PRODUCTION credentials for production environment')
            console.log('   3. Verify your Square app has payment permissions enabled')
          }
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Network error testing Square API:', error.message)
  }
}

// Run the test
testSquareCredentials()