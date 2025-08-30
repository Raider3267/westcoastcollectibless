import { NextResponse } from 'next/server'
import { getListingsFromCsv } from '../../../lib/listings'

export async function GET() {
  try {
    const allProducts = await getListingsFromCsv('export.csv', true)
    const previewProducts = allProducts.filter((item: any) => 
      item.sale_state === 'PREVIEW' && item.status === 'live'
    )
    
    console.log(`Found ${previewProducts.length} preview products`)
    return NextResponse.json(previewProducts)
  } catch (error) {
    console.error('Error fetching preview products:', error)
    return NextResponse.json([])
  }
}