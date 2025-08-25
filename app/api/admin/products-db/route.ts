import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '../../../../lib/database'

export async function GET() {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      console.log('Database not available, returning empty array')
      return NextResponse.json([])
    }
    
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // Map database fields to match the format expected by frontend
    const formattedProducts = products.map((product) => ({
      sku: product.sku || '',
      title: product.title || '',
      description: product.description || '',
      quantity: product.quantity || 0,
      price: product.price ? parseFloat(product.price.toString()) : 0,
      images: product.images || '',
      status: product.status || 'live',
      sale_state: product.saleState || '',
      release_at: product.releaseAt || '',
      featured: !!product.featured,
      staff_pick: !!product.staffPick,
      limited_edition: !!product.limitedEdition,
      drop_date: product.dropDate || '',
      released_date: product.releasedDate || '',
      show_in_new_releases: Boolean(product.showInNewReleases),
      show_in_featured: Boolean(product.showInFeatured),
      show_in_coming_soon: Boolean(product.showInComingSoon),
      show_in_staff_picks: Boolean(product.showInStaffPicks),
      show_in_limited_editions: Boolean(product.showInLimitedEditions),
      out_of_stock: !!product.outOfStock,
      show_in_featured_while_coming_soon: !!product.showInFeaturedWhileComingSoon,
      purchase_cost: product.purchaseCost ? parseFloat(product.purchaseCost.toString()) : 0,
      shipping_cost: product.shippingCost ? parseFloat(product.shippingCost.toString()) : 0,
      total_cost: product.totalCost ? parseFloat(product.totalCost.toString()) : 0,
      purchase_date: product.purchaseDate || '',
      supplier: product.supplier || '',
      tracking_number: product.trackingNumber || '',
      weight: product.weight ? parseFloat(product.weight.toString()) : 0.3,
      length: product.length ? parseFloat(product.length.toString()) : 4,
      width: product.width ? parseFloat(product.width.toString()) : 3,
      height: product.height ? parseFloat(product.height.toString()) : 5,
    }))
    
    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('GET products-db error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }
    
    const body = await request.json()
    const { sku } = body
    
    if (!sku) {
      return NextResponse.json({ error: 'SKU is required' }, { status: 400 })
    }
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    })
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Prepare update data
    const updateData: any = {}
    
    // Only update fields that are provided
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.quantity !== undefined) updateData.quantity = parseInt(body.quantity) || 0
    if (body.price !== undefined) updateData.price = parseFloat(body.price) || null
    if (body.images !== undefined) updateData.images = body.images || null
    if (body.status !== undefined) updateData.status = body.status
    if (body.saleState !== undefined) updateData.saleState = body.saleState || null
    if (body.releaseAt !== undefined) updateData.releaseAt = body.releaseAt || null
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured)
    if (body.staffPick !== undefined) updateData.staffPick = Boolean(body.staffPick)
    if (body.limitedEdition !== undefined) updateData.limitedEdition = Boolean(body.limitedEdition)
    if (body.dropDate !== undefined) updateData.dropDate = body.dropDate || null
    if (body.releasedDate !== undefined) updateData.releasedDate = body.releasedDate || null
    if (body.showInNewReleases !== undefined) updateData.showInNewReleases = Boolean(body.showInNewReleases)
    if (body.showInFeatured !== undefined) updateData.showInFeatured = Boolean(body.showInFeatured)
    if (body.showInComingSoon !== undefined) updateData.showInComingSoon = Boolean(body.showInComingSoon)
    if (body.showInStaffPicks !== undefined) updateData.showInStaffPicks = Boolean(body.showInStaffPicks)
    if (body.showInLimitedEditions !== undefined) updateData.showInLimitedEditions = Boolean(body.showInLimitedEditions)
    if (body.outOfStock !== undefined) updateData.outOfStock = Boolean(body.outOfStock)
    if (body.showInFeaturedWhileComingSoon !== undefined) updateData.showInFeaturedWhileComingSoon = Boolean(body.showInFeaturedWhileComingSoon)
    
    // Also support snake_case field names from admin form
    if (body.show_in_new_releases !== undefined) updateData.showInNewReleases = Boolean(body.show_in_new_releases)
    if (body.show_in_featured !== undefined) updateData.showInFeatured = Boolean(body.show_in_featured)
    if (body.show_in_coming_soon !== undefined) updateData.showInComingSoon = Boolean(body.show_in_coming_soon)
    if (body.show_in_staff_picks !== undefined) updateData.showInStaffPicks = Boolean(body.show_in_staff_picks)
    if (body.show_in_limited_editions !== undefined) updateData.showInLimitedEditions = Boolean(body.show_in_limited_editions)
    if (body.out_of_stock !== undefined) updateData.outOfStock = Boolean(body.out_of_stock)
    if (body.show_in_featured_while_coming_soon !== undefined) updateData.showInFeaturedWhileComingSoon = Boolean(body.show_in_featured_while_coming_soon)
    if (body.purchaseCost !== undefined) updateData.purchaseCost = parseFloat(body.purchaseCost) || null
    if (body.shippingCost !== undefined) updateData.shippingCost = parseFloat(body.shippingCost) || null
    if (body.totalCost !== undefined) updateData.totalCost = parseFloat(body.totalCost) || null
    if (body.purchaseDate !== undefined) updateData.purchaseDate = body.purchaseDate || null
    if (body.supplier !== undefined) updateData.supplier = body.supplier || null
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber || null
    if (body.weight !== undefined) updateData.weight = parseFloat(body.weight) || null
    if (body.length !== undefined) updateData.length = parseFloat(body.length) || null
    if (body.width !== undefined) updateData.width = parseFloat(body.width) || null
    if (body.height !== undefined) updateData.height = parseFloat(body.height) || null
    
    const updatedProduct = await prisma.product.update({
      where: { sku },
      data: updateData
    })
    
    console.log(`Updated product ${sku} in database`)
    
    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error) {
    console.error('PUT products-db error:', error)
    return NextResponse.json({ 
      error: 'Failed to update product', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }
    
    const body = await request.json()
    const { sku, title } = body
    
    if (!sku || !title) {
      return NextResponse.json({ error: 'SKU and title are required' }, { status: 400 })
    }
    
    // Check if product already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    })
    
    if (existingProduct) {
      return NextResponse.json({ error: 'Product with this SKU already exists' }, { status: 400 })
    }
    
    const newProduct = await prisma.product.create({
      data: {
        sku: body.sku,
        title: body.title,
        description: body.description || null,
        quantity: parseInt(body.quantity) || 0,
        price: parseFloat(body.price) || null,
        images: body.images || null,
        // Status should respect user input, default to 'live'
        status: body.status || 'live',
        saleState: body.saleState || null,
        releaseAt: body.releaseAt || null,
        featured: Boolean(body.featured),
        staffPick: Boolean(body.staffPick),
        limitedEdition: Boolean(body.limitedEdition),
        dropDate: body.dropDate || null,
        releasedDate: body.releasedDate || null,
        // Support both camelCase and snake_case field names from frontend
        // Default all section flags to false unless explicitly set
        showInNewReleases: Boolean(body.showInNewReleases || body.show_in_new_releases),
        showInFeatured: Boolean(body.showInFeatured || body.show_in_featured),
        showInComingSoon: Boolean(body.showInComingSoon || body.show_in_coming_soon),
        showInStaffPicks: Boolean(body.showInStaffPicks || body.show_in_staff_picks),
        showInLimitedEditions: Boolean(body.showInLimitedEditions || body.show_in_limited_editions),
        // outOfStock should default to false for new products unless explicitly set
        outOfStock: Boolean(body.outOfStock || body.out_of_stock),
        showInFeaturedWhileComingSoon: Boolean(body.showInFeaturedWhileComingSoon || body.show_in_featured_while_coming_soon),
        purchaseCost: parseFloat(body.purchaseCost) || null,
        shippingCost: parseFloat(body.shippingCost) || null,
        totalCost: parseFloat(body.totalCost) || null,
        purchaseDate: body.purchaseDate || null,
        supplier: body.supplier || null,
        trackingNumber: body.trackingNumber || null,
        weight: parseFloat(body.weight) || 0.3,
        length: parseFloat(body.length) || 4,
        width: parseFloat(body.width) || 3,
        height: parseFloat(body.height) || 5,
      }
    })
    
    console.log(`Added new product ${sku} to database`)
    
    return NextResponse.json({ success: true, product: newProduct })
  } catch (error) {
    console.error('POST products-db error:', error)
    return NextResponse.json({ 
      error: 'Failed to create product', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const prisma = getPrismaClient()
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }
    
    const body = await request.json()
    const { sku } = body
    
    if (!sku) {
      return NextResponse.json({ error: 'SKU is required' }, { status: 400 })
    }
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    })
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    await prisma.product.delete({
      where: { sku }
    })
    
    console.log(`Deleted product ${sku} from database`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE products-db error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete product', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}