import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

const CSV_PATH = path.join(process.cwd(), 'export.csv')

async function readCSV() {
  try {
    const csvContent = await fs.readFile(CSV_PATH, 'utf-8')
    const records = parse(csvContent, { 
      columns: true, 
      skip_empty_lines: true,
      trim: true 
    })
    return records
  } catch (error) {
    console.error('Failed to read CSV:', error)
    return []
  }
}

async function writeCSV(records: any[]) {
  try {
    if (records.length === 0) return
    
    // Get column headers from first record
    const headers = Object.keys(records[0])
    
    // Convert records to CSV format
    const csvContent = stringify(records, { 
      header: true, 
      columns: headers 
    })
    
    await fs.writeFile(CSV_PATH, csvContent, 'utf-8')
  } catch (error) {
    console.error('Failed to write CSV:', error)
    throw error
  }
}

export async function GET() {
  try {
    const products = await readCSV()
    
    // Transform CSV data to match frontend expectations
    const transformedProducts = products.map((product: any) => ({
      sku: product.sku || '',
      title: product.title || '',
      description: product.description || '',
      quantity: parseInt(product.quantity) || 0,
      price: parseFloat(product.price) || 0,
      images: product.images || '',
      status: product.status || 'live',
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
      // Calculated fields
      profit_per_unit: (parseFloat(product.price) || 0) - (parseFloat(product.total_cost) || 0),
      total_inventory_value: (parseInt(product.quantity) || 0) * (parseFloat(product.total_cost) || 0),
      potential_profit: (parseInt(product.quantity) || 0) * ((parseFloat(product.price) || 0) - (parseFloat(product.total_cost) || 0))
    })).filter(product => product.title) // Filter out empty products
    
    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('GET /api/admin/products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sku } = body
    
    if (!sku) {
      return NextResponse.json({ error: 'SKU is required' }, { status: 400 })
    }
    
    const products = await readCSV()
    const productIndex = products.findIndex((product: any) => product.sku === sku)
    
    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Update the product with new data, ensuring booleans are converted to strings for CSV
    const updatedProduct = { 
      ...products[productIndex], 
      ...body,
      // Convert boolean feature flags to strings for CSV storage
      // Handle both boolean and existing string/number values
      show_in_new_releases: (body.show_in_new_releases === true || body.show_in_new_releases === 'true' || body.show_in_new_releases === 1 || body.show_in_new_releases === '1') ? 'true' : 'false',
      show_in_featured: (body.show_in_featured === true || body.show_in_featured === 'true' || body.show_in_featured === 1 || body.show_in_featured === '1') ? 'true' : 'false',
      show_in_coming_soon: (body.show_in_coming_soon === true || body.show_in_coming_soon === 'true' || body.show_in_coming_soon === 1 || body.show_in_coming_soon === '1') ? 'true' : 'false',
      show_in_staff_picks: (body.show_in_staff_picks === true || body.show_in_staff_picks === 'true' || body.show_in_staff_picks === 1 || body.show_in_staff_picks === '1') ? 'true' : 'false',
      show_in_limited_editions: (body.show_in_limited_editions === true || body.show_in_limited_editions === 'true' || body.show_in_limited_editions === 1 || body.show_in_limited_editions === '1') ? 'true' : 'false',
      out_of_stock: (body.out_of_stock === true || body.out_of_stock === 'true' || body.out_of_stock === 1 || body.out_of_stock === '1') ? 'true' : 'false',
      show_in_featured_while_coming_soon: (body.show_in_featured_while_coming_soon === true || body.show_in_featured_while_coming_soon === 'true' || body.show_in_featured_while_coming_soon === 1 || body.show_in_featured_while_coming_soon === '1') ? 'true' : 'false'
    }
    products[productIndex] = updatedProduct
    
    await writeCSV(products)
    
    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error) {
    console.error('PUT /api/admin/products error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { sku } = body
    
    if (!sku) {
      return NextResponse.json({ error: 'SKU is required' }, { status: 400 })
    }
    
    const products = await readCSV()
    const filteredProducts = products.filter((product: any) => product.sku !== sku)
    
    if (filteredProducts.length === products.length) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    await writeCSV(filteredProducts)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/products error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      sku, 
      title, 
      description, 
      quantity = 0, 
      price = 0, 
      images = '',
      show_in_staff_picks = false,
      show_in_limited_editions = false,
      out_of_stock = false,
      show_in_featured_while_coming_soon = false,
      purchase_cost = 0,
      shipping_cost = 0,
      purchase_date = '',
      supplier = '',
      tracking_number = ''
    } = body
    
    if (!sku || !title) {
      return NextResponse.json({ error: 'SKU and title are required' }, { status: 400 })
    }
    
    const products = await readCSV()
    
    // Check if product already exists
    const existingProduct = products.find((product: any) => product.sku === sku)
    if (existingProduct) {
      return NextResponse.json({ error: 'Product with this SKU already exists' }, { status: 400 })
    }
    
    // Calculate total cost
    const totalCost = (parseFloat(purchase_cost) || 0) + (parseFloat(shipping_cost) || 0)
    
    // Create new product with all required CSV columns
    const newProduct = {
      sku,
      title,
      description,
      quantity: quantity.toString(),
      price: price.toString(),
      images,
      optionname1: '',
      optionname2: '',
      optionname3: '',
      optionname4: '',
      optionname5: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      option5: '',
      product_identifier: '',
      product_identifier_type: '',
      brand: '',
      cost: '', // Keep existing cost field for eBay compatibility
      status: 'live',
      drop_date: '',
      released_date: '',
      show_in_new_releases: 'false',
      show_in_featured: 'true',
      show_in_coming_soon: 'true',
      show_in_staff_picks: show_in_staff_picks.toString(),
      show_in_limited_editions: show_in_limited_editions.toString(),
      out_of_stock: out_of_stock.toString(),
      show_in_featured_while_coming_soon: show_in_featured_while_coming_soon.toString(),
      // Cost tracking fields
      purchase_cost: purchase_cost.toString(),
      shipping_cost: shipping_cost.toString(),
      total_cost: totalCost.toString(),
      purchase_date,
      supplier,
      tracking_number
    }
    
    products.push(newProduct)
    await writeCSV(products)
    
    return NextResponse.json({ success: true, product: newProduct })
  } catch (error) {
    console.error('POST /api/admin/products error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}