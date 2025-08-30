import { NextResponse } from 'next/server'
import { getListingsFromCsv } from '../../../lib/listings'

export async function GET() {
  try {
    console.log('Debug: Starting CSV read...')
    const allProducts = await getListingsFromCsv('export.csv', true)
    console.log(`Debug: Found ${allProducts.length} total products`)
    
    // Log first few products to see structure
    console.log('Debug: First product:', allProducts[0])
    
    const previewProducts = allProducts.filter((item: any) => {
      console.log(`Debug: Product ${item.sku} - sale_state: "${item.sale_state}", status: "${item.status}"`)
      return item.sale_state === 'PREVIEW' && item.status === 'live'
    })
    
    console.log(`Debug: Found ${previewProducts.length} preview products`)
    
    return NextResponse.json({
      totalProducts: allProducts.length,
      previewProducts: previewProducts.length,
      previewProductsList: previewProducts.map((p: any) => ({
        sku: p.sku,
        title: p.title,
        sale_state: p.sale_state,
        status: p.status
      }))
    })
  } catch (error) {
    console.error('Debug: Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) })
  }
}