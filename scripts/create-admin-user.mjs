#!/usr/bin/env node

import { promises as fs } from 'fs'
import bcrypt from 'bcryptjs'

const adminEmail = 'jaydenreyes32@icloud.com'
const adminPassword = 'westcoast2025' // You can change this later
const adminName = 'Jayden Reyes'

console.log('🔐 Creating admin user...')

try {
  // Read existing users
  const usersContent = await fs.readFile('data/users.json', 'utf-8')
  const users = JSON.parse(usersContent)
  
  // Check if admin user already exists
  const existingAdmin = users.find(user => user.email === adminEmail)
  if (existingAdmin) {
    console.log('✅ Admin user already exists:', adminEmail)
    process.exit(0)
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(adminPassword, 10)
  
  // Create admin user
  const adminUser = {
    id: `user_${Date.now()}_admin`,
    email: adminEmail,
    name: adminName,
    password_hash: passwordHash,
    email_verified_at: new Date().toISOString(), // Pre-verify admin
    marketing_opt_in: false,
    terms_accepted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  // Add to users array
  users.push(adminUser)
  
  // Write back to file
  await fs.writeFile('data/users.json', JSON.stringify(users, null, 2))
  
  console.log('✅ Admin user created successfully!')
  console.log('📧 Email:', adminEmail)
  console.log('🔑 Password:', adminPassword)
  console.log('⚠️  Please change the password after first login')
  
} catch (error) {
  console.error('❌ Error creating admin user:', error.message)
  process.exit(1)
}