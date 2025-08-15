import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

const PURCHASE_ORDERS_PATH = path.join(process.cwd(), 'purchase_orders.csv')
const SHIPMENTS_PATH = path.join(process.cwd(), 'shipments.csv')

// Purchase Order interface
interface PurchaseOrder {
  id: string
  purchase_date: string
  supplier: string
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  tracking_number?: string
  total_product_cost: number
  allocated_shipping_cost: number
  total_cost: number
  notes?: string
  created_at: string
}

// Purchase Item interface (products within a purchase order)
interface PurchaseItem {
  id: string
  purchase_order_id: string
  product_sku: string
  product_name: string
  quantity: number
  unit_cost: number
  total_cost: number
}

// Shipment interface (shipping costs by date)
interface Shipment {
  id: string
  shipment_date: string
  total_shipping_cost: number
  tracking_numbers: string // comma-separated
  notes?: string
  allocated: boolean // whether shipping cost has been allocated to purchase orders
}

async function readCSV(filePath: string) {
  try {
    const csvContent = await fs.readFile(filePath, 'utf-8')
    const records = parse(csvContent, { 
      columns: true, 
      skip_empty_lines: true,
      trim: true 
    })
    return records
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

async function writeCSV(filePath: string, records: any[]) {
  try {
    if (records.length === 0) {
      // Create empty file with headers based on the interface
      const headers = filePath.includes('purchase_orders') 
        ? ['id', 'purchase_date', 'supplier', 'status', 'tracking_number', 'total_product_cost', 'allocated_shipping_cost', 'total_cost', 'notes', 'created_at']
        : ['id', 'shipment_date', 'total_shipping_cost', 'tracking_numbers', 'notes', 'allocated']
      
      await fs.writeFile(filePath, headers.join(',') + '\n', 'utf-8')
      return
    }
    
    const headers = Object.keys(records[0])
    const csvContent = stringify(records, { 
      header: true, 
      columns: headers 
    })
    
    await fs.writeFile(filePath, csvContent, 'utf-8')
  } catch (error) {
    console.error('Failed to write CSV:', error)
    throw error
  }
}

// GET - Fetch all purchase orders
export async function GET() {
  try {
    const purchaseOrders = await readCSV(PURCHASE_ORDERS_PATH)
    const shipments = await readCSV(SHIPMENTS_PATH)
    
    return NextResponse.json({ 
      purchase_orders: purchaseOrders,
      shipments: shipments
    })
  } catch (error) {
    console.error('GET /api/admin/purchase-orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 })
  }
}

// POST - Create new purchase order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      purchase_date, 
      supplier, 
      items, // Array of { product_sku, product_name, quantity, unit_cost }
      notes = ''
    } = body
    
    if (!purchase_date || !supplier || !items || items.length === 0) {
      return NextResponse.json({ 
        error: 'Purchase date, supplier, and items are required' 
      }, { status: 400 })
    }
    
    // Generate unique ID
    const purchaseOrderId = `PO-${Date.now()}`
    
    // Calculate total product cost
    const totalProductCost = items.reduce((sum: number, item: any) => {
      if (item.is_set) {
        // For sets: quantity of sets × total_set_price per set
        return sum + (item.quantity * (item.total_set_price || 0))
      } else {
        // For singles: quantity × unit_cost
        return sum + (item.quantity * (item.unit_cost || 0))
      }
    }, 0)
    
    // Create purchase order
    const newPurchaseOrder: PurchaseOrder = {
      id: purchaseOrderId,
      purchase_date,
      supplier,
      status: 'pending',
      tracking_number: '',
      total_product_cost: totalProductCost,
      allocated_shipping_cost: 0, // Will be allocated when shipment is recorded
      total_cost: totalProductCost,
      notes,
      created_at: new Date().toISOString()
    }
    
    // Read existing purchase orders
    const purchaseOrders = await readCSV(PURCHASE_ORDERS_PATH)
    purchaseOrders.push(newPurchaseOrder)
    await writeCSV(PURCHASE_ORDERS_PATH, purchaseOrders)
    
    return NextResponse.json({ 
      success: true, 
      purchase_order: newPurchaseOrder,
      message: `Purchase order ${purchaseOrderId} created successfully`
    })
  } catch (error) {
    console.error('POST /api/admin/purchase-orders error:', error)
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 })
  }
}

// PUT - Update purchase order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Purchase order ID is required' }, { status: 400 })
    }
    
    const purchaseOrders = await readCSV(PURCHASE_ORDERS_PATH)
    const orderIndex = purchaseOrders.findIndex((order: any) => order.id === id)
    
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }
    
    // Update the purchase order
    const updatedOrder = { ...purchaseOrders[orderIndex], ...updates }
    purchaseOrders[orderIndex] = updatedOrder
    
    await writeCSV(PURCHASE_ORDERS_PATH, purchaseOrders)
    
    return NextResponse.json({ 
      success: true, 
      purchase_order: updatedOrder 
    })
  } catch (error) {
    console.error('PUT /api/admin/purchase-orders error:', error)
    return NextResponse.json({ error: 'Failed to update purchase order' }, { status: 500 })
  }
}

// DELETE - Delete purchase order
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Purchase order ID is required' }, { status: 400 })
    }
    
    const purchaseOrders = await readCSV(PURCHASE_ORDERS_PATH)
    const orderIndex = purchaseOrders.findIndex((order: any) => order.id === id)
    
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }
    
    // Remove the purchase order
    const deletedOrder = purchaseOrders[orderIndex]
    purchaseOrders.splice(orderIndex, 1)
    
    await writeCSV(PURCHASE_ORDERS_PATH, purchaseOrders)
    
    return NextResponse.json({ 
      success: true, 
      deleted_order: deletedOrder,
      message: `Purchase order ${id} deleted successfully`
    })
  } catch (error) {
    console.error('DELETE /api/admin/purchase-orders error:', error)
    return NextResponse.json({ error: 'Failed to delete purchase order' }, { status: 500 })
  }
}