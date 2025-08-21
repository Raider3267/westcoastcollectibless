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
  const Papa = await import('papaparse')
  
  const csvFile = filename || 'export.csv'
  const csvPath = path.join(process.cwd(), csvFile)
  
  try {
    const fileContent = await fs.readFile(csvPath, 'utf-8')
    
    // Use PapaParse for proper CSV parsing with quoted field support
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string, field: string) => {
        // Trim whitespace from all fields
        return value?.trim() || ''
      }
    })
    
    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing errors:', parseResult.errors)
    }
    
    const listings: Listing[] = []
    
    for (const row of parseResult.data as any[]) {
      // Parse the row data
      const quantity = parseInt(row.quantity) || 0
      const shouldInclude = includeOutOfStock || quantity > 0
      
      if (shouldInclude && row.sku) { // Only include rows with valid SKU
        // Parse images - handle both comma-separated and single image formats
        let imageUrls: string[] = []
        let primaryImage: string | null = null
        
        if (row.images) {
          imageUrls = row.images
            .split(',')
            .map((img: string) => img.trim())
            .filter((img: string) => img && img !== '')
          primaryImage = imageUrls[0] || null
        }
        
        listings.push({
          id: row.sku,
          name: row.title || '',
          price: row.price ? parseFloat(row.price) : null,
          description: row.description || '',
          quantity: quantity,
          image: primaryImage,
          images: imageUrls,
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
          height: parseFloat(row.height) || 5,
          featured: row.featured === 'true',
          staff_pick: row.staff_pick === 'true',
          limited_edition: row.limited_edition === 'true'
        })
      }
    }
    
    console.log(`Parsed ${listings.length} products from CSV`)
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