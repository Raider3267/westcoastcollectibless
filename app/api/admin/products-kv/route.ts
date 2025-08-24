import { NextRequest, NextResponse } from 'next/server'

// For now, we'll use in-memory storage as a temporary fix
// In a real implementation, this would use Vercel KV, Redis, or a database
let productsCache: any[] = []
let cacheInitialized = false

// Initialize products from CSV on first load
async function initializeProductsFromCSV() {
  if (cacheInitialized) return
  
  try {
    const { promises: fs } = require('fs')
    const path = require('path')
    const { parse } = require('csv-parse/sync')
    
    const CSV_PATH = path.join(process.cwd(), 'export.csv')
    const csvContent = await fs.readFile(CSV_PATH, 'utf-8')
    const records = parse(csvContent, { 
      columns: true, 
      skip_empty_lines: true,
      trim: true 
    })
    
    productsCache = records.map((product: any) => ({
      sku: product.sku || '',
      title: product.title || '',
      description: product.description || '',
      quantity: parseInt(product.quantity) || 0,
      price: parseFloat(product.price) || 0,
      images: product.images || '',
      status: product.status || 'live',
      sale_state: product.sale_state || null,
      release_at: product.release_at || null,
      featured: product.featured === 'true' || product.featured === 1 || product.featured === '1',
      staff_pick: product.staff_pick === 'true' || product.staff_pick === 1 || product.staff_pick === '1',
      limited_edition: product.limited_edition === 'true' || product.limited_edition === 1 || product.limited_edition === '1',
      drop_date: product.drop_date || '',
      released_date: product.released_date || '',
      show_in_new_releases: product.show_in_new_releases === 'true' || product.show_in_new_releases === 1 || product.show_in_new_releases === '1',
      show_in_featured: product.show_in_featured === 'true' || product.show_in_featured === 1 || product.show_in_featured === '1',
      show_in_coming_soon: product.show_in_coming_soon === 'true' || product.show_in_coming_soon === 1 || product.show_in_coming_soon === '1',
      show_in_staff_picks: product.show_in_staff_picks === 'true' || product.show_in_staff_picks === 1 || product.show_in_staff_picks === '1',
      show_in_limited_editions: product.show_in_limited_editions === 'true' || product.show_in_limited_editions === 1 || product.show_in_limited_editions === '1',
      out_of_stock: product.out_of_stock === 'true' || product.out_of_stock === 1 || product.out_of_stock === '1',
      show_in_featured_while_coming_soon: product.show_in_featured_while_coming_soon === 'true' || product.show_in_featured_while_coming_soon === 1 || product.show_in_featured_while_coming_soon === '1',
      // Cost tracking fields
      purchase_cost: parseFloat(product.purchase_cost) || 0,
      shipping_cost: parseFloat(product.shipping_cost) || 0,
      total_cost: parseFloat(product.total_cost) || 0,
      purchase_date: product.purchase_date || '',
      supplier: product.supplier || '',
      tracking_number: product.tracking_number || '',
      // Shipping information fields
      weight: parseFloat(product.weight) || 0.3,
      length: parseFloat(product.length) || 4,
      width: parseFloat(product.width) || 3,
      height: parseFloat(product.height) || 5,
    }))
    
    cacheInitialized = true
    console.log(`Initialized ${productsCache.length} products from CSV`)
  } catch (error) {
    console.error('Failed to initialize products from CSV:', error)
    productsCache = []
    cacheInitialized = true
  }
}

export async function GET() {
  try {
    await initializeProductsFromCSV()
    return NextResponse.json(productsCache)
  } catch (error) {
    console.error('GET products-kv error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initializeProductsFromCSV()
    
    const body = await request.json()
    const { sku } = body
    
    if (!sku) {
      return NextResponse.json({ error: 'SKU is required' }, { status: 400 })
    }
    
    const productIndex = productsCache.findIndex((product: any) => product.sku === sku)
    
    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Update the product in memory
    const updatedProduct = { 
      ...productsCache[productIndex], 
      ...body,
      // Convert boolean feature flags to proper format
      show_in_new_releases: (body.show_in_new_releases === true || body.show_in_new_releases === 'true' || body.show_in_new_releases === 1 || body.show_in_new_releases === '1'),
      show_in_featured: (body.show_in_featured === true || body.show_in_featured === 'true' || body.show_in_featured === 1 || body.show_in_featured === '1'),
      show_in_coming_soon: (body.show_in_coming_soon === true || body.show_in_coming_soon === 'true' || body.show_in_coming_soon === 1 || body.show_in_coming_soon === '1'),
      show_in_staff_picks: (body.show_in_staff_picks === true || body.show_in_staff_picks === 'true' || body.show_in_staff_picks === 1 || body.show_in_staff_picks === '1'),
      show_in_limited_editions: (body.show_in_limited_editions === true || body.show_in_limited_editions === 'true' || body.show_in_limited_editions === 1 || body.show_in_limited_editions === '1'),
      out_of_stock: (body.out_of_stock === true || body.out_of_stock === 'true' || body.out_of_stock === 1 || body.out_of_stock === '1'),
      show_in_featured_while_coming_soon: (body.show_in_featured_while_coming_soon === true || body.show_in_featured_while_coming_soon === 'true' || body.show_in_featured_while_coming_soon === 1 || body.show_in_featured_while_coming_soon === '1'),
      featured: (body.featured === true || body.featured === 'true' || body.featured === 1 || body.featured === '1'),
      staff_pick: (body.staff_pick === true || body.staff_pick === 'true' || body.staff_pick === 1 || body.staff_pick === '1'),
      limited_edition: (body.limited_edition === true || body.limited_edition === 'true' || body.limited_edition === 1 || body.limited_edition === '1')
    }
    
    productsCache[productIndex] = updatedProduct
    
    console.log(`Updated product ${sku} in memory cache`)
    
    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error) {
    console.error('PUT products-kv error:', error)
    return NextResponse.json({ 
      error: 'Failed to update product', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeProductsFromCSV()
    
    const body = await request.json()
    const { sku, title } = body
    
    if (!sku || !title) {
      return NextResponse.json({ error: 'SKU and title are required' }, { status: 400 })
    }
    
    // Check if product already exists
    const existingProduct = productsCache.find((product: any) => product.sku === sku)
    if (existingProduct) {
      return NextResponse.json({ error: 'Product with this SKU already exists' }, { status: 400 })
    }
    
    const newProduct = {
      sku: body.sku || '',
      title: body.title || '',
      description: body.description || '',
      quantity: body.quantity || 0,
      price: body.price || 0,
      images: body.images || '',
      status: 'live',
      sale_state: '',
      release_at: '',
      featured: false,
      staff_pick: false,
      limited_edition: false,
      drop_date: '',
      released_date: '',
      show_in_new_releases: false,
      show_in_featured: true,
      show_in_coming_soon: true,
      show_in_staff_picks: body.show_in_staff_picks || false,
      show_in_limited_editions: body.show_in_limited_editions || false,
      out_of_stock: body.out_of_stock || false,
      show_in_featured_while_coming_soon: body.show_in_featured_while_coming_soon || false,
      purchase_cost: body.purchase_cost || 0,
      shipping_cost: body.shipping_cost || 0,
      total_cost: (body.purchase_cost || 0) + (body.shipping_cost || 0),
      purchase_date: body.purchase_date || '',
      supplier: body.supplier || '',
      tracking_number: body.tracking_number || '',
      weight: body.weight || 0.3,
      length: body.length || 4,
      width: body.width || 3,
      height: body.height || 5
    }
    
    productsCache.push(newProduct)
    
    console.log(`Added new product ${sku} to memory cache`)
    
    return NextResponse.json({ success: true, product: newProduct })
  } catch (error) {
    console.error('POST products-kv error:', error)
    return NextResponse.json({ 
      error: 'Failed to create product', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await initializeProductsFromCSV()
    
    const body = await request.json()
    const { sku } = body
    
    if (!sku) {
      return NextResponse.json({ error: 'SKU is required' }, { status: 400 })
    }
    
    const initialLength = productsCache.length
    productsCache = productsCache.filter((product: any) => product.sku !== sku)
    
    if (productsCache.length === initialLength) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    console.log(`Deleted product ${sku} from memory cache`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE products-kv error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete product', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}