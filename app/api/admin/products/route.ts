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
      status: product.status || 'live' // Include status field, default to 'live'
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
    
    // Update the product with new data
    const updatedProduct = { ...products[productIndex], ...body }
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
    const { sku, title, description, quantity = 0, price = 0, images = '' } = body
    
    if (!sku || !title) {
      return NextResponse.json({ error: 'SKU and title are required' }, { status: 400 })
    }
    
    const products = await readCSV()
    
    // Check if product already exists
    const existingProduct = products.find((product: any) => product.sku === sku)
    if (existingProduct) {
      return NextResponse.json({ error: 'Product with this SKU already exists' }, { status: 400 })
    }
    
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
      cost: '',
      status: 'live' // Add status field with default value
    }
    
    products.push(newProduct)
    await writeCSV(products)
    
    return NextResponse.json({ success: true, product: newProduct })
  } catch (error) {
    console.error('POST /api/admin/products error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}