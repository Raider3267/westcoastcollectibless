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

    // List of product SKUs that should be PREVIEW (coming soon)
    const previewSkus = [
      'IF_EB0C6000',      // POP MART Labubu Tempura Shrimp Earphone Holder
      'dgfhdfgsdgsdf',    // POP MART Hacipupu Gummy Bear Blind Box  
      'angellll',         // POPMART ANGEL IN CLOUDS Vinyl Face Doll
      'gdcsdfsd',         // POP MART The Monsters Wacky Mart Series Fragrance Blind Box Set
      'beeberg23553',     // Bikini Bottom Buddies Set
      'sadasfdsfsdgs',    // PopMart Wacky Mart Series-Pinch Pendant Blind Box
      'jgscghfd',         // DIMOO Crush on Coffee Series
      'csdgjfssmgndfkg'   // PopMart Labubu The Monsters Mokoko Jumping into Summer Series
    ]

    console.log(`Updating ${previewSkus.length} products to PREVIEW status...`)

    // Update all products in the list to PREVIEW status
    const updateResult = await prisma.product.updateMany({
      where: {
        sku: {
          in: previewSkus
        }
      },
      data: {
        saleState: 'PREVIEW',
        status: 'coming-soon',
        showInComingSoon: true
      }
    })

    console.log(`Successfully updated ${updateResult.count} products to PREVIEW status`)

    return NextResponse.json({
      success: true,
      updated: updateResult.count,
      expectedCount: previewSkus.length,
      skus: previewSkus
    })

  } catch (error) {
    console.error('Bulk update failed:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}