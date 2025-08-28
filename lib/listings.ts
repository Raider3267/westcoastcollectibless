import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

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
  out_of_stock?: boolean
  weight?: number
  length?: number
  width?: number
  height?: number
}

export async function getListingsFromCsv(filename = 'export.csv', includeOutOfStock = false): Promise<Listing[]> {
  try {
    const csvPath = path.join(process.cwd(), filename)
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    const listings: Listing[] = records.map((record: any) => {
      // Parse images array
      let images: string[] = []
      if (record.images) {
        images = record.images.split(',').map((img: string) => img.trim()).filter(Boolean)
      }

      // Convert string booleans to actual booleans
      const parseBool = (val: string) => val === 'true' || val === '1'

      return {
        id: record.sku || record.id,
        name: record.title || record.name,
        description: record.description,
        price: parseFloat(record.price) || 0,
        quantity: parseInt(record.quantity) || 0,
        images,
        image: images[0] || null,
        ebayUrl: record.ebayUrl,
        stripeLink: record.stripeLink,
        sale_state: record.sale_state || 'LIVE',
        release_at: record.release_at || null,
        featured: parseBool(record.featured),
        staff_pick: parseBool(record.staff_pick),
        limited_edition: parseBool(record.limited_edition),
        status: record.status || 'live',
        drop_date: record.drop_date || null,
        released_date: record.released_date || null,
        show_in_new_releases: parseBool(record.show_in_new_releases),
        show_in_featured: parseBool(record.show_in_featured),
        show_in_coming_soon: parseBool(record.show_in_coming_soon),
        out_of_stock: parseBool(record.out_of_stock),
        weight: parseFloat(record.weight) || 0,
        length: parseFloat(record.length) || 0,
        width: parseFloat(record.width) || 0,
        height: parseFloat(record.height) || 0
      }
    })

    // Filter out out-of-stock products if requested
    const filtered = includeOutOfStock 
      ? listings 
      : listings.filter(listing => !listing.out_of_stock && (listing.quantity || 0) > 0)

    console.log(`Loaded ${filtered.length} listings from ${filename}`)
    return filtered
  } catch (error) {
    console.error('Error reading CSV file:', error)
    return []
  }
}

export async function getComingSoonProducts(filename = 'export.csv'): Promise<Listing[]> {
  const allProducts = await getListingsFromCsv(filename, true)
  return allProducts.filter(product => 
    product.sale_state === 'PREVIEW' || product.show_in_coming_soon === true
  )
}