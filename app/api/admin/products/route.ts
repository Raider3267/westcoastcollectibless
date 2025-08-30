import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '../../../../lib/database'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Format products for admin dashboard
    const formattedProducts = products.map((product) => {
      const imageUrls = product.images ? 
        product.images.split(',').map(img => img.trim()).filter(img => img && img.length > 0)
        : []

      return {
        id: product.id,
        sku: product.sku || '',
        title: product.title || '',
        description: product.description || '',
        quantity: product.quantity || 0,
        price: product.price ? parseFloat(product.price.toString()) : null,
        images: imageUrls,
        brand: product.brand || '',
        status: product.status || 'live',
        sale_state: product.saleState || 'LIVE',
        release_at: product.releaseAt || null,
        featured: !!product.featured,
        staff_pick: !!product.staffPick,
        limited_edition: !!product.limitedEdition,
        show_in_featured: !!product.showInFeatured,
        show_in_coming_soon: !!product.showInComingSoon,
        show_in_staff_picks: !!product.showInStaffPicks,
        show_in_limited_editions: !!product.showInLimitedEditions,
        out_of_stock: !!product.outOfStock,
        drop_date: product.dropDate || null,
        released_date: product.releasedDate || null,
        show_in_new_releases: !!product.showInNewReleases,
        weight: product.weight ? parseFloat(product.weight.toString()) : 0.3,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    })

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const data = await request.json()
    console.log('Creating product with data:', data)

    const product = await prisma.product.create({
      data: {
        sku: data.sku || `PRODUCT_${Date.now()}`,
        title: data.title || 'Untitled Product',
        description: data.description || '',
        price: data.price ? parseFloat(data.price.toString()) : 0,
        quantity: data.quantity || 0,
        images: Array.isArray(data.images) ? data.images.join(',') : (data.images || ''),
        brand: data.brand || '',
        status: data.status || 'live',
        saleState: data.sale_state || 'LIVE',
        featured: !!data.featured,
        staffPick: !!data.staff_pick,
        limitedEdition: !!data.limited_edition,
        showInFeatured: !!data.show_in_featured,
        showInComingSoon: !!data.show_in_coming_soon,
        showInStaffPicks: !!data.show_in_staff_picks,
        showInLimitedEditions: !!data.show_in_limited_editions,
        outOfStock: !!data.out_of_stock,
        releaseAt: data.release_at || null,
        dropDate: data.drop_date || null,
        releasedDate: data.released_date || null,
        showInNewReleases: !!data.show_in_new_releases,
        weight: data.weight ? parseFloat(data.weight.toString()) : 0.3,
        length: data.length ? parseFloat(data.length.toString()) : null,
        width: data.width ? parseFloat(data.width.toString()) : null,
        height: data.height ? parseFloat(data.height.toString()) : null
      }
    })

    console.log('Product created successfully:', product.sku)
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ 
      error: 'Failed to create product',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const data = await request.json()
    console.log('Updating product with data:', data)

    if (!data.sku) {
      return NextResponse.json({ error: 'SKU is required for updates' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { sku: data.sku },
      data: {
        title: data.title || 'Untitled Product',
        description: data.description || '',
        price: data.price ? parseFloat(data.price.toString()) : 0,
        quantity: data.quantity || 0,
        images: Array.isArray(data.images) ? data.images.join(',') : (data.images || ''),
        brand: data.brand || '',
        status: data.status || 'live',
        saleState: data.sale_state || 'LIVE',
        featured: !!data.featured,
        staffPick: !!data.staff_pick,
        limitedEdition: !!data.limited_edition,
        showInFeatured: !!data.show_in_featured,
        showInComingSoon: !!data.show_in_coming_soon,
        showInStaffPicks: !!data.show_in_staff_picks,
        showInLimitedEditions: !!data.show_in_limited_editions,
        outOfStock: !!data.out_of_stock,
        releaseAt: data.release_at || null,
        dropDate: data.drop_date || null,
        releasedDate: data.released_date || null,
        showInNewReleases: !!data.show_in_new_releases,
        weight: data.weight ? parseFloat(data.weight.toString()) : 0.3,
        length: data.length ? parseFloat(data.length.toString()) : null,
        width: data.width ? parseFloat(data.width.toString()) : null,
        height: data.height ? parseFloat(data.height.toString()) : null,
        updatedAt: new Date()
      }
    })

    console.log('Product updated successfully:', product.sku)
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ 
      error: 'Failed to update product',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const sku = searchParams.get('sku')

    if (!sku) {
      return NextResponse.json({ error: 'SKU is required for deletion' }, { status: 400 })
    }

    await prisma.product.delete({
      where: { sku }
    })

    console.log('Product deleted successfully:', sku)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ 
      error: 'Failed to delete product',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}