// Temporarily disabled for TypeScript build issues
// TODO: Fix type issues and restore full functionality

export interface Listing {
  id: string
  name: string
  price?: number | null
  ebayUrl?: string
  image?: string | null
  images?: string[]
  stripeLink?: string | null
  description?: string
  quantity?: number
  sale_state?: 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED'
  release_at?: string | null
  featured?: boolean
  staff_pick?: boolean
  limited_edition?: boolean
  status?: 'live' | 'coming-soon' | 'draft'
  drop_date?: string | null
  released_date?: string | null
  show_in_new_releases?: boolean
  show_in_featured?: boolean
  show_in_coming_soon?: boolean
  show_in_staff_picks?: boolean
  show_in_limited_editions?: boolean
  out_of_stock?: boolean
  weight?: number
  length?: number
  width?: number
  height?: number
}

export async function getListingsFromCsv(filename?: string, includeOutOfStock?: boolean): Promise<Listing[]> {
  const fs = await import('fs').then(m => m.promises)
  const path = await import('path')
  const csvFile = filename || 'export.csv'
  const csvPath = path.join(process.cwd(), csvFile)
  
  try {
    const fileContent = await fs.readFile(csvPath, 'utf-8')
    const lines = fileContent.split('\n').filter(line => line.trim())
    
    if (lines.length <= 1) return []
    
    const headers = lines[0].split(',').map(h => h.trim())
    const listings: Listing[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const row: any = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || ''
      })
      
      // Parse the row data
      const quantity = parseInt(row.quantity) || 0
      const shouldInclude = includeOutOfStock || quantity > 0
      
      if (shouldInclude) {
        listings.push({
          id: row.sku || `item-${i}`,
          name: row.title || '',
          price: parseFloat(row.price) || null,
          description: row.description || '',
          quantity: quantity,
          image: row.images?.split(',')[0]?.trim() || null,
          images: row.images?.split(',').map((img: string) => img.trim()).filter(Boolean) || [],
          status: row.status || 'live',
          sale_state: row.sale_state || 'LIVE',
          drop_date: row.drop_date || null,
          released_date: row.released_date || null,
          show_in_new_releases: row.show_in_new_releases === 'true',
          show_in_featured: row.show_in_featured !== 'false',
          show_in_coming_soon: row.show_in_coming_soon === 'true',
          show_in_staff_picks: row.show_in_staff_picks === 'true',
          show_in_limited_editions: row.show_in_limited_editions === 'true',
          out_of_stock: row.out_of_stock === 'true',
          weight: parseFloat(row.weight) || 0.3,
          length: parseFloat(row.length) || 4,
          width: parseFloat(row.width) || 3,
          height: parseFloat(row.height) || 5
        })
      }
    }
    
    return listings
  } catch (error) {
    console.error('Error reading CSV:', error)
    return []
  }
}

export async function getComingSoonProducts(filename?: string): Promise<Listing[]> {
  const allListings = await getListingsFromCsv(filename, true)
  return allListings.filter(listing => 
    listing.status === 'coming-soon' || 
    listing.sale_state === 'PREVIEW'
  )
}