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
          where: { sku: product.sku }
        })

        if (existing) {
          console.log(`Skipping existing product: ${product.sku}`)
          continue
        }

        await prisma.product.create({
          data: {
            sku: product.sku,
            title: product.title,
            description: product.description,
            price: product.price ? parseFloat(product.price.toString()) : 0,
            quantity: product.quantity || 0,
            images: product.images || '',
            brand: product.brand || '',
            status: product.status || 'live',
            saleState: product.sale_state || 'LIVE',
            featured: !!product.featured,
            staffPick: !!product.staff_pick,
            limitedEdition: !!product.limited_edition,
            showInFeatured: !!product.show_in_featured,
            showInComingSoon: !!product.show_in_coming_soon,
            showInStaffPicks: !!product.show_in_staff_picks,
            showInLimitedEditions: !!product.show_in_limited_editions,
            outOfStock: !!product.out_of_stock,
            releaseAt: product.release_at ? new Date(product.release_at) : null,
            dropDate: product.drop_date ? new Date(product.drop_date) : null,
            releasedDate: product.released_date ? new Date(product.released_date) : null,
            showInNewReleases: !!product.show_in_new_releases,
            showInFeaturedWhileComingSoon: !!product.show_in_featured_while_coming_soon,
            purchaseCost: product.purchase_cost ? parseFloat(product.purchase_cost.toString()) : 0,
            shippingCost: product.shipping_cost ? parseFloat(product.shipping_cost.toString()) : 0,
            totalCost: product.total_cost ? parseFloat(product.total_cost.toString()) : 0,
            purchaseDate: product.purchase_date ? new Date(product.purchase_date) : null,
            supplier: product.supplier || '',
            trackingNumber: product.tracking_number || '',
            weight: product.weight ? parseFloat(product.weight.toString()) : 0.3,
            length: product.length ? parseFloat(product.length.toString()) : null,
            width: product.width ? parseFloat(product.width.toString()) : null,
            height: product.height ? parseFloat(product.height.toString()) : null,
            profitPerUnit: product.profit_per_unit ? parseFloat(product.profit_per_unit.toString()) : 0,
            totalInventoryValue: product.total_inventory_value ? parseFloat(product.total_inventory_value.toString()) : 0,
            potentialProfit: product.potential_profit ? parseFloat(product.potential_profit.toString()) : 0
          }
        })

        imported++
        console.log(`Imported product: ${product.sku} - ${product.title}`)
      } catch (error) {
        console.error(`Error importing product ${product.sku}:`, error)
        errors.push(`${product.sku}: ${error.message}`)
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}