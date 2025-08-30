import { NextResponse } from 'next/server'
import { getPrismaClient } from '../../../../lib/database'
import { getListingsFromCsv } from '../../../../lib/listings'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    console.log('Starting CSV import...')
    const products = await getListingsFromCsv('export.csv', true)
    console.log(`Found ${products.length} products in CSV`)

    let imported = 0
    let errors = []

    for (const product of products) {
      try {
        // Skip if product already exists  
        const existing = await prisma.product.findUnique({
          where: { sku: product.id }
        })

        if (existing) {
          console.log(`Skipping existing product: ${product.id}`)
          continue
        }

        await prisma.product.create({
          data: {
            sku: product.id,
            title: product.name,
            description: product.description || '',
            price: product.price ? parseFloat(product.price.toString()) : 0,
            quantity: product.quantity || 0,
            images: Array.isArray(product.images) ? product.images.join(',') : (product.image || ''),
            brand: '',
            status: product.status || 'live',
            saleState: product.sale_state || 'LIVE',
            featured: !!product.featured,
            staffPick: !!product.staff_pick,
            limitedEdition: !!product.limited_edition,
            showInFeatured: !!product.show_in_featured,
            showInComingSoon: !!product.show_in_coming_soon,
            showInStaffPicks: !!product.staff_pick,
            showInLimitedEditions: !!product.limited_edition,
            outOfStock: !!product.out_of_stock,
            releaseAt: product.release_at || null,
            dropDate: product.drop_date || null,
            releasedDate: product.released_date || null,
            showInNewReleases: !!product.show_in_new_releases,
            showInFeaturedWhileComingSoon: !!product.show_in_coming_soon,
            purchaseCost: 0,
            shippingCost: 0,
            totalCost: 0,
            purchaseDate: null,
            supplier: '',
            trackingNumber: '',
            weight: product.weight ? parseFloat(product.weight.toString()) : 0.3,
            length: product.length ? parseFloat(product.length.toString()) : null,
            width: product.width ? parseFloat(product.width.toString()) : null,
            height: product.height ? parseFloat(product.height.toString()) : null
          }
        })

        imported++
        console.log(`Imported product: ${product.id} - ${product.name}`)
      } catch (error) {
        console.error(`Error importing product ${product.id}:`, error)
        errors.push(`${product.id}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      total: products.length,
      errors: errors.length > 0 ? errors : null
    })
  } catch (error) {
    console.error('CSV import failed:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}