import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null

export function getPrismaClient() {
  // Always try to create a client if DATABASE_URL exists
  if (!prisma) {
    try {
      if (process.env.DATABASE_URL) {
        prisma = new PrismaClient()
      } else {
        console.warn('DATABASE_URL not found')
        return null
      }
    } catch (error) {
      console.error('Failed to create Prisma client:', error)
      return null
    }
  }
  return prisma
}

export function isDatabaseAvailable() {
  return !!process.env.DATABASE_URL
}