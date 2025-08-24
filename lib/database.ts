import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null

export function getPrismaClient() {
  if (!prisma && process.env.DATABASE_URL) {
    prisma = new PrismaClient()
  }
  return prisma
}

export function isDatabaseAvailable() {
  return !!process.env.DATABASE_URL && !!prisma
}