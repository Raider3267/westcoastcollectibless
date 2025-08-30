import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../../lib/database'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const now = new Date()
    
    // Find products with past release dates
    const productsWithPastDates = await prisma.product.findMany({
      where: {
        releaseAt: {
          lt: now  // Release date is less than now (in the past)
        }
      }
    })

    console.log(`Found ${productsWithPastDates.length} products with past release dates`)

    // Clear release dates for products where the date has passed
    const updateResult = await prisma.product.updateMany({
      where: {
        releaseAt: {
          lt: now
        }
      },
      data: {
        releaseAt: null,  // Remove the past release date
        dropDate: null,   // Also clear drop date if it exists
        releasedDate: null // Clear released date
      }
    })

    console.log(`Cleared release dates for ${updateResult.count} products`)

    return NextResponse.json({
      success: true,
      updated: updateResult.count,
      products: productsWithPastDates.map(p => ({
        sku: p.sku,
        title: p.title,
        releaseAt: p.releaseAt
      }))
    })

  } catch (error) {
    console.error('Cleanup dates failed:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}