import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

const SHIPMENTS_PATH = path.join(process.cwd(), 'shipments.csv')
const PURCHASE_ORDERS_PATH = path.join(process.cwd(), 'purchase_orders.csv')

interface Shipment {
  id: string
  shipment_date: string
  total_shipping_cost: number
  tracking_numbers: string
  notes?: string
  allocated: boolean
  created_at: string
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
    return []
  }
}

async function writeCSV(filePath: string, records: any[]) {
  try {
    if (records.length === 0) {
      const headers = ['id', 'shipment_date', 'total_shipping_cost', 'tracking_numbers', 'notes', 'allocated', 'created_at']
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

// GET - Fetch all shipments
export async function GET() {
  try {
    const shipments = await readCSV(SHIPMENTS_PATH)
    
    return NextResponse.json(shipments.map((shipment: any) => ({
      ...shipment,
      total_shipping_cost: parseFloat(shipment.total_shipping_cost) || 0,
      allocated: shipment.allocated === 'true'
    })))
  } catch (error) {
    console.error('GET /api/admin/shipments error:', error)
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 })
  }
}

// POST - Create new shipment and allocate costs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      shipment_date, 
      total_shipping_cost, 
      tracking_numbers = '',
      notes = '',
      allocate_immediately = true
    } = body
    
    if (!shipment_date || !total_shipping_cost || total_shipping_cost <= 0) {
      return NextResponse.json({ 
        error: 'Shipment date and valid shipping cost are required' 
      }, { status: 400 })
    }
    
    // Generate unique ID
    const shipmentId = `SH-${Date.now()}`
    
    // Create shipment record
    const newShipment: Shipment = {
      id: shipmentId,
      shipment_date,
      total_shipping_cost: parseFloat(total_shipping_cost),
      tracking_numbers,
      notes,
      allocated: false,
      created_at: new Date().toISOString()
    }
    
    // Save shipment
    const shipments = await readCSV(SHIPMENTS_PATH)
    shipments.push(newShipment)
    await writeCSV(SHIPMENTS_PATH, shipments)
    
    let allocationResult = null
    
    // Allocate shipping costs if requested
    if (allocate_immediately) {
      allocationResult = await allocateShippingCosts(shipmentId, shipment_date, parseFloat(total_shipping_cost))
    }
    
    return NextResponse.json({ 
      success: true, 
      shipment: newShipment,
      allocation: allocationResult,
      message: `Shipment ${shipmentId} created${allocate_immediately ? ' and costs allocated' : ''}`
    })
  } catch (error) {
    console.error('POST /api/admin/shipments error:', error)
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 })
  }
}

// Allocate shipping costs to purchase orders from the same date
async function allocateShippingCosts(shipmentId: string, shipmentDate: string, shippingCost: number) {
  try {
    // Find purchase orders from the same date
    const purchaseOrders = await readCSV(PURCHASE_ORDERS_PATH)
    const ordersToAllocate = purchaseOrders.filter((order: any) => 
      order.purchase_date === shipmentDate && order.status !== 'cancelled'
    )
    
    if (ordersToAllocate.length === 0) {
      return {
        allocated_orders: 0,
        message: 'No purchase orders found for this date'
      }
    }
    
    // Calculate total product cost for allocation weighting
    const totalProductCost = ordersToAllocate.reduce((sum: number, order: any) => 
      sum + (parseFloat(order.total_product_cost) || 0), 0
    )
    
    if (totalProductCost === 0) {
      return {
        allocated_orders: 0,
        message: 'No product costs found for allocation'
      }
    }
    
    // Allocate shipping cost proportionally based on product cost
    const updatedOrders = purchaseOrders.map((order: any) => {
      if (order.purchase_date === shipmentDate && order.status !== 'cancelled') {
        const orderProductCost = parseFloat(order.total_product_cost) || 0
        const allocationRatio = orderProductCost / totalProductCost
        const allocatedShipping = shippingCost * allocationRatio
        
        return {
          ...order,
          allocated_shipping_cost: allocatedShipping,
          total_cost: orderProductCost + allocatedShipping
        }
      }
      return order
    })
    
    // Save updated purchase orders
    await writeCSV(PURCHASE_ORDERS_PATH, updatedOrders)
    
    // Mark shipment as allocated
    const shipments = await readCSV(SHIPMENTS_PATH)
    const updatedShipments = shipments.map((shipment: any) => 
      shipment.id === shipmentId 
        ? { ...shipment, allocated: 'true' }
        : shipment
    )
    await writeCSV(SHIPMENTS_PATH, updatedShipments)
    
    return {
      allocated_orders: ordersToAllocate.length,
      total_shipping_cost: shippingCost,
      orders_updated: ordersToAllocate.map((order: any) => ({
        id: order.id,
        supplier: order.supplier,
        allocated_shipping: shippingCost * ((parseFloat(order.total_product_cost) || 0) / totalProductCost)
      }))
    }
  } catch (error) {
    console.error('Allocation error:', error)
    throw error
  }
}

// POST endpoint for manual allocation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, shipment_id, shipment_date, shipping_cost } = body
    
    if (action === 'allocate') {
      const result = await allocateShippingCosts(shipment_id, shipment_date, shipping_cost)
      return NextResponse.json({ 
        success: true, 
        allocation: result 
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('PUT /api/admin/shipments error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}