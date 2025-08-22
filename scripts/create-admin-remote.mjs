#!/usr/bin/env node

// Script to create admin user directly on production via API

const adminEmail = 'jaydenreyes32@icloud.com'
const adminPassword = 'westcoast2025'
const adminName = 'Jayden Reyes'

console.log('🔐 Creating admin user on production...')

try {
  // First, try to sign up the admin user
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
    console.log('✅ Admin user created successfully on production!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('👤 User ID:', data.user.id)
  } else {
    const error = await signupResponse.json()
    if (error.error && error.error.includes('already exists')) {
      console.log('✅ Admin user already exists on production')
      
      // Test login
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
      } else {
        const loginError = await loginResponse.json()
        console.log('❌ Login test failed:', loginError.error)
      }
    } else {
      console.log('❌ Failed to create admin user:', error.error)
    }
  }
  
} catch (error) {
  console.error('❌ Error:', error.message)
}