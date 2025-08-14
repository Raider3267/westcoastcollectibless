import { NextResponse } from 'next/server'
import { getNewReleases } from '../../../lib/new-releases'

export async function GET() {
  try {
    // Get products released in the last 7 days
    const newReleases = await getNewReleases('export.csv', 7)
    
    return NextResponse.json(newReleases)
  } catch (error) {
    console.error('GET /api/new-releases error:', error)
    return NextResponse.json({ error: 'Failed to fetch new releases' }, { status: 500 })
  }
}