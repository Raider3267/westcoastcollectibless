import { NextResponse } from 'next/server'
import { getLimitedEditions } from '../../../lib/staff-picks'

export async function GET() {
  try {
    const products = await getLimitedEditions('export.csv')
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/limited-editions error:', error)
    return NextResponse.json({ error: 'Failed to fetch limited editions' }, { status: 500 })
  }
}