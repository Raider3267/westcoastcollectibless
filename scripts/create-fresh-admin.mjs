#!/usr/bin/env node

// Script to create a fresh admin user for immediate access

const adminEmail = 'admin@westcoastcollectibless.com'
const adminPassword = 'westcoast2025'
const adminName = 'Admin User'

console.log('🔐 Creating fresh admin user...')

try {
  const signupResponse = await fetch('https://westcoastcollectibless.vercel.app/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      marketing_opt_in: false
    }),
  })

  if (signupResponse.ok) {
    const data = await signupResponse.json()
    console.log('✅ Fresh admin user created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('👤 User ID:', data.user.id)
    
    // Test login immediately
    console.log('\n🔍 Testing login...')
    const loginResponse = await fetch('https://westcoastcollectibless.vercel.app/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword
      }),
    })
    
    if (loginResponse.ok) {
      console.log('✅ Login test successful!')
      console.log('\n🎯 You can now login with:')
      console.log('   Email:', adminEmail)
      console.log('   Password:', adminPassword)
    } else {
      const loginError = await loginResponse.json()
      console.log('❌ Login test failed:', loginError.error)
    }
    
  } else {
    const error = await signupResponse.json()
    console.log('❌ Failed to create admin user:', error.error)
  }
  
} catch (error) {
  console.error('❌ Error:', error.message)
}