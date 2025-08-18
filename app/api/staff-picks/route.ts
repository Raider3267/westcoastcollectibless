import { NextResponse } from 'next/server'
import { getStaffPicks } from '../../../lib/staff-picks'

export async function GET() {
  try {
    const products = await getStaffPicks('export.csv')
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/staff-picks error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff picks' }, { status: 500 })
  }
}