// Simple file-based storage for development
// In production, replace with a real database

import fs from 'fs/promises'
import path from 'path'
import bcrypt from 'bcryptjs'
import { User, Wishlist, NotificationSubscription, Session } from './schema'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const WISHLISTS_FILE = path.join(DATA_DIR, 'wishlists.json')
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notification_subscriptions.json')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    // Directory already exists
  }
}

// User operations
export async function createUser(
  email: string,
  password: string,
  name?: string,
  marketing_opt_in: boolean = true
): Promise<User> {
  await ensureDataDir()
  
  const users = await getUsers()
  
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists')
  }
  
  const password_hash = await bcrypt.hash(password, 10)
  
  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    name: name || null,
    password_hash,
    email_verified_at: null,
    marketing_opt_in,
    terms_accepted_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  }
  
  users.push(newUser)
  await saveUsers(users)
  
  return newUser
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers()
  return users.find(u => u.email === email) || null
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers()
  return users.find(u => u.id === id) || null
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash)
}

async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

// Session operations
export async function createSession(userId: string): Promise<Session> {
  await ensureDataDir()
  
  const sessions = await getSessions()
  
  // Generate secure token
  const token = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`
  
  const newSession: Session = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    token,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    created_at: new Date()
  }
  
  sessions.push(newSession)
  await saveSessions(sessions)
  
  return newSession
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  const sessions = await getSessions()
  const session = sessions.find(s => s.token === token && new Date(s.expires_at) > new Date())
  return session || null
}

export async function deleteSession(token: string): Promise<void> {
  const sessions = await getSessions()
  const filtered = sessions.filter(s => s.token !== token)
  await saveSessions(filtered)
}

async function getSessions(): Promise<Session[]> {
  try {
    const data = await fs.readFile(SESSIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function saveSessions(sessions: Session[]): Promise<void> {
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
}

// Wishlist operations
export async function toggleWishlist(userId: string, productId: string): Promise<boolean> {
  await ensureDataDir()
  
  const wishlists = await getWishlists()
  const existingIndex = wishlists.findIndex(
    w => w.user_id === userId && w.product_id === productId
  )
  
  if (existingIndex >= 0) {
    // Remove from wishlist
    wishlists.splice(existingIndex, 1)
    await saveWishlists(wishlists)
    return false // Not saved anymore
  } else {
    // Add to wishlist
    const newWishlist: Wishlist = {
      id: `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      product_id: productId,
      created_at: new Date()
    }
    wishlists.push(newWishlist)
    await saveWishlists(wishlists)
    
    // Also create notification subscription
    await createNotificationSubscription(userId, productId, 'wishlist')
    
    return true // Now saved
  }
}

export async function getUserWishlist(userId: string): Promise<Wishlist[]> {
  const wishlists = await getWishlists()
  return wishlists.filter(w => w.user_id === userId)
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const wishlists = await getWishlists()
  return wishlists.some(w => w.user_id === userId && w.product_id === productId)
}

async function getWishlists(): Promise<Wishlist[]> {
  try {
    const data = await fs.readFile(WISHLISTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function saveWishlists(wishlists: Wishlist[]): Promise<void> {
  await fs.writeFile(WISHLISTS_FILE, JSON.stringify(wishlists, null, 2))
}

// Notification subscription operations
export async function createNotificationSubscription(
  userId: string,
  productId: string,
  source: 'wishlist' | 'notify_me' | 'admin_add' = 'wishlist'
): Promise<NotificationSubscription> {
  await ensureDataDir()
  
  const subscriptions = await getNotificationSubscriptions()
  
  // Check if already exists (dedupe)
  const existing = subscriptions.find(
    s => s.user_id === userId && s.product_id === productId
  )
  
  if (existing) {
    return existing
  }
  
  const newSubscription: NotificationSubscription = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    product_id: productId,
    source,
    created_at: new Date()
  }
  
  subscriptions.push(newSubscription)
  await saveNotificationSubscriptions(subscriptions)
  
  return newSubscription
}

export async function getUserNotificationSubscriptions(userId: string): Promise<NotificationSubscription[]> {
  const subscriptions = await getNotificationSubscriptions()
  return subscriptions.filter(s => s.user_id === userId)
}

async function getNotificationSubscriptions(): Promise<NotificationSubscription[]> {
  try {
    const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function saveNotificationSubscriptions(subscriptions: NotificationSubscription[]): Promise<void> {
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(subscriptions, null, 2))
}