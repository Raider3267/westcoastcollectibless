import { readFile } from 'node:fs/promises'
import path from 'node:path'
let parse: any
try {
  // Works when subpath exports are available
  ;({ parse } = await import('csv-parse/sync'))
} catch {
  // Fallback: some bundlers only expose the root; this gets the sync export
  const mod: any = await import('csv-parse')
  parse = mod.parse || mod.default?.parse || mod['sync']?.parse
}

export type Listing = {
  id: string
  name: string
  price?: number | null
  ebayUrl?: string | null
  image?: string | null
  images?: string[]
  stripeLink?: string | null
  description?: string | null
  quantity?: number
  status?: 'live' | 'coming-soon' | 'draft'
  drop_date?: string | null
  released_date?: string | null
  show_in_new_releases?: boolean
  show_in_featured?: boolean
  show_in_coming_soon?: boolean
  show_in_staff_picks?: boolean
  show_in_limited_editions?: boolean
  out_of_stock?: boolean
  show_in_featured_while_coming_soon?: boolean
}

const FIRST = <T>(...vals: (T | undefined | null | false | '' )[]) =>
  vals.find(v => typeof v === 'number' || (typeof v === 'string' && v.trim() !== '')) as T | undefined

// Helper function to clean HTML and convert to plain text for descriptions
function cleanDescription(htmlDesc: string): string {
  if (!htmlDesc) return ''
  
  // Remove HTML tags but keep the content, preserve proper line breaks
  const withoutTags = htmlDesc
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
  
  // Remove all shipping location references
  const withoutShipping = withoutTags
    .replace(/🚚\s*Fast shipping from Santa Monica, CA with tracking/gi, '')
    .replace(/Ships from Santa Monica, CA/gi, '')
    .replace(/Shipping from California/gi, '')
    .replace(/Ships securely from the U\.S\./gi, '')
    .replace(/📦\s*Ships securely from the U\.S\./gi, '')
    .replace(/Fast shipping from Santa Monica, CA/gi, '')
    .replace(/from Santa Monica, CA/gi, '')
    .replace(/Santa Monica, CA/gi, '')
    .replace(/with tracking/gi, '')
    .replace(/🚚\s*Fast shipping\s*with tracking/gi, '')
    .replace(/📦\s*Ships securely/gi, '')
  
  // Clean up and format properly with good spacing
  const formatted = withoutShipping
    // Remove excessive newlines first
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    // Convert bullet points and dashes to proper formatting
    .replace(/^\s*[-•]\s*/gm, '• ')
    // Ensure each bullet point or feature is on its own line
    .replace(/([•-])\s*([^•\n]+)/g, '$1 $2\n')
    // Add spacing around key sections
    .replace(/(100% Authentic|Brand‑new|Official|Exclusive|Price:)/g, '\n$1')
    // Clean up multiple spaces
    .replace(/  +/g, ' ')
    // Fix spacing around emojis
    .replace(/(\w)\s*([🎁✅🐰✨🚚📦💰])/g, '$1\n\n$2')
    .replace(/([🎁✅🐰✨🚚📦💰])\s*(\w)/g, '$1 $2')
    // Remove lines that are just spaces or single characters
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 1)
    .join('\n')
    // Add proper paragraph spacing
    .replace(/\n([🎁✅🐰✨💰])/g, '\n\n$1')
    .replace(/\n\n+/g, '\n\n')
  
  return formatted.trim()
}

export async function getListingsFromCsv(filename = 'export.csv', includeOutOfStock = false): Promise<Listing[]> {
  const filePath = path.join(process.cwd(), filename)
  const text = await readFile(filePath, 'utf8')

  const rows = parse(text, { columns: true, skip_empty_lines: true }) as any[]

  const items: Listing[] = rows
    .map((row, idx) => {
      // Extract data from export.csv columns
      const id = FIRST<string>(row['sku'], String(idx)) || String(idx)
      const name = FIRST<string>(row['title'], row['Title']) || `Item ${idx + 1}`
      
      // Get price (export.csv has price as a number)
      const priceStr = FIRST<string>(row['price'], row['Price'])
      const price = priceStr ? Number(String(priceStr).replace(/[^0-9.]/g, '')) : null

      // Get quantity for stock filtering
      const quantityStr = FIRST<string>(row['quantity'], row['Quantity'])
      const quantity = quantityStr ? Number(String(quantityStr).replace(/[^0-9]/g, '')) : 0

      // Get all images from the comma-separated image URLs
      const imagesString = FIRST<string>(row['images'], row['Images']) || ''
      const imageUrls = imagesString.split(',').map(url => url.trim()).filter(url => url)
      const image = imageUrls[0] || null
      const images = imageUrls.length > 0 ? imageUrls : []

      // Clean the HTML description to plain text
      const rawDescription = FIRST<string>(row['description'], row['Description']) || ''
      const description = cleanDescription(rawDescription)

      // For now, we'll use a generic eBay store URL since we don't have item numbers
      // You could enhance this later by mapping SKUs to eBay item numbers
      const ebayUrl = 'https://www.ebay.com/usr/westcoastcollectibless'

      const stripeLink = FIRST<string>(row['Stripe Link'], row['Stripe URL'], row['paymentLink']) || null

      // Get status field, default to 'live' for existing products
      const statusStr = FIRST<string>(row['status'], row['Status']) || 'live'
      const status = (['live', 'coming-soon', 'draft'].includes(statusStr) ? statusStr : 'live') as 'live' | 'coming-soon' | 'draft'

      // Get drop_date field
      const drop_date = FIRST<string>(row['drop_date'], row['Drop Date']) || null
      
      // Get released_date field
      const released_date = FIRST<string>(row['released_date'], row['Released Date']) || null
      
      // Get show_in_new_releases field (handle both string and number values)
      const show_in_new_releases_val = FIRST<string>(row['show_in_new_releases'], row['Show In New Releases'])
      const show_in_new_releases = show_in_new_releases_val === 'true' || show_in_new_releases_val === '1' || show_in_new_releases_val === 1
      
      // Get show_in_featured field (handle both string and number values)
      const show_in_featured_val = FIRST<string>(row['show_in_featured'], row['Show In Featured'])
      const show_in_featured = show_in_featured_val === 'true' || show_in_featured_val === '1' || show_in_featured_val === 1
      
      // Get show_in_coming_soon field (handle both string and number values)
      const show_in_coming_soon_val = FIRST<string>(row['show_in_coming_soon'], row['Show In Coming Soon'])
      const show_in_coming_soon = show_in_coming_soon_val === 'true' || show_in_coming_soon_val === '1' || show_in_coming_soon_val === 1

      // Get special section fields (handle both string and number values)
      const show_in_staff_picks_val = FIRST<string>(row['show_in_staff_picks'], row['Show In Staff Picks'])
      const show_in_staff_picks = show_in_staff_picks_val === 'true' || show_in_staff_picks_val === '1' || show_in_staff_picks_val === 1
      const show_in_limited_editions_val = FIRST<string>(row['show_in_limited_editions'], row['Show In Limited Editions'])
      const show_in_limited_editions = show_in_limited_editions_val === 'true' || show_in_limited_editions_val === '1' || show_in_limited_editions_val === 1
      const out_of_stock_val = FIRST<string>(row['out_of_stock'], row['Out Of Stock'])
      const out_of_stock = out_of_stock_val === 'true' || out_of_stock_val === '1' || out_of_stock_val === 1
      const show_in_featured_while_coming_soon_val = FIRST<string>(row['show_in_featured_while_coming_soon'], row['Show In Featured While Coming Soon'])
      const show_in_featured_while_coming_soon = show_in_featured_while_coming_soon_val === 'true' || show_in_featured_while_coming_soon_val === '1' || show_in_featured_while_coming_soon_val === 1

      return { 
        id: String(id), 
        name, 
        price, 
        ebayUrl, 
        image, 
        images,
        stripeLink, 
        description,
        quantity,
        status,
        drop_date,
        released_date,
        show_in_new_releases,
        show_in_featured,
        show_in_coming_soon,
        show_in_staff_picks,
        show_in_limited_editions,
        out_of_stock,
        show_in_featured_while_coming_soon
      }
    })
    // Filter based on stock, price, and content quality
    .filter(item => {
      // Filter out items without basic required fields
      if (!item.name || item.name.trim() === '' || item.name === 'Item 1' || item.name.includes('Item ')) return false
      
      // Include live products OR coming-soon products with featured toggle enabled
      if (item.status === 'live') {
        // Live products are included
      } else if (item.status === 'coming-soon' && item.show_in_featured_while_coming_soon) {
        // Coming-soon products with featured toggle are included
      } else {
        // Skip draft products and coming-soon without featured toggle
        return false
      }
      
      // Always require a price
      if (!item.price || item.price <= 0) return false
      
      // Filter by stock unless out-of-stock items are specifically requested
      if (!includeOutOfStock && (item.out_of_stock || (!item.quantity || item.quantity <= 0))) return false
      
      // Filter out items without images
      if (!item.image || item.image.trim() === '') return false
      
      return true
    })
    // Mark coming-soon products as out of stock when they appear in Featured
    .map(item => {
      if (item.status === 'coming-soon' && item.show_in_featured_while_coming_soon) {
        return {
          ...item,
          out_of_stock: true  // Force coming-soon items to show as out of stock in Featured
        }
      }
      return item
    })
    // Sort products: in-stock items first, then out-of-stock items last
    .sort((a, b) => {
      const aOutOfStock = a.out_of_stock || (!a.quantity || a.quantity <= 0)
      const bOutOfStock = b.out_of_stock || (!b.quantity || b.quantity <= 0)
      
      // If only one is out of stock, put it last
      if (aOutOfStock && !bOutOfStock) return 1
      if (!aOutOfStock && bOutOfStock) return -1
      
      // If both have same stock status, maintain original order
      return 0
    })

  return items
}

export async function getComingSoonProducts(filename = 'export.csv'): Promise<Listing[]> {
  const filePath = path.join(process.cwd(), filename)
  const text = await readFile(filePath, 'utf8')

  const rows = parse(text, { columns: true, skip_empty_lines: true }) as any[]

  const items: Listing[] = rows
    .map((row, idx) => {
      // Extract data from export.csv columns
      const id = FIRST<string>(row['sku'], String(idx)) || String(idx)
      const name = FIRST<string>(row['title'], row['Title']) || `Item ${idx + 1}`
      
      // Get price (export.csv has price as a number)
      const priceStr = FIRST<string>(row['price'], row['Price'])
      const price = priceStr ? Number(String(priceStr).replace(/[^0-9.]/g, '')) : null

      // Get quantity for stock filtering
      const quantityStr = FIRST<string>(row['quantity'], row['Quantity'])
      const quantity = quantityStr ? Number(String(quantityStr).replace(/[^0-9]/g, '')) : 0

      // Get all images from the comma-separated image URLs
      const imagesString = FIRST<string>(row['images'], row['Images']) || ''
      const imageUrls = imagesString.split(',').map(url => url.trim()).filter(url => url)
      const image = imageUrls[0] || null
      const images = imageUrls.length > 0 ? imageUrls : []

      // Clean the HTML description to plain text
      const rawDescription = FIRST<string>(row['description'], row['Description']) || ''
      const description = cleanDescription(rawDescription)

      const ebayUrl = 'https://www.ebay.com/usr/westcoastcollectibless'
      const stripeLink = FIRST<string>(row['Stripe Link'], row['Stripe URL'], row['paymentLink']) || null

      // Get status field
      const statusStr = FIRST<string>(row['status'], row['Status']) || 'live'
      const status = (['live', 'coming-soon', 'draft'].includes(statusStr) ? statusStr : 'live') as 'live' | 'coming-soon' | 'draft'

      // Get drop_date field
      const drop_date = FIRST<string>(row['drop_date'], row['Drop Date']) || null
      
      // Get released_date field
      const released_date = FIRST<string>(row['released_date'], row['Released Date']) || null
      
      // Get show_in_new_releases field (handle both string and number values)
      const show_in_new_releases_val = FIRST<string>(row['show_in_new_releases'], row['Show In New Releases'])
      const show_in_new_releases = show_in_new_releases_val === 'true' || show_in_new_releases_val === '1' || show_in_new_releases_val === 1
      
      // Get show_in_featured field (handle both string and number values)
      const show_in_featured_val = FIRST<string>(row['show_in_featured'], row['Show In Featured'])
      const show_in_featured = show_in_featured_val === 'true' || show_in_featured_val === '1' || show_in_featured_val === 1
      
      // Get show_in_coming_soon field (handle both string and number values)
      const show_in_coming_soon_val = FIRST<string>(row['show_in_coming_soon'], row['Show In Coming Soon'])
      const show_in_coming_soon = show_in_coming_soon_val === 'true' || show_in_coming_soon_val === '1' || show_in_coming_soon_val === 1

      // Get special section fields (handle both string and number values)
      const show_in_staff_picks_val = FIRST<string>(row['show_in_staff_picks'], row['Show In Staff Picks'])
      const show_in_staff_picks = show_in_staff_picks_val === 'true' || show_in_staff_picks_val === '1' || show_in_staff_picks_val === 1
      const show_in_limited_editions_val = FIRST<string>(row['show_in_limited_editions'], row['Show In Limited Editions'])
      const show_in_limited_editions = show_in_limited_editions_val === 'true' || show_in_limited_editions_val === '1' || show_in_limited_editions_val === 1
      const out_of_stock_val = FIRST<string>(row['out_of_stock'], row['Out Of Stock'])
      const out_of_stock = out_of_stock_val === 'true' || out_of_stock_val === '1' || out_of_stock_val === 1
      const show_in_featured_while_coming_soon_val = FIRST<string>(row['show_in_featured_while_coming_soon'], row['Show In Featured While Coming Soon'])
      const show_in_featured_while_coming_soon = show_in_featured_while_coming_soon_val === 'true' || show_in_featured_while_coming_soon_val === '1' || show_in_featured_while_coming_soon_val === 1

      return { 
        id: String(id), 
        name, 
        price, 
        ebayUrl, 
        image, 
        images,
        stripeLink, 
        description,
        quantity,
        status,
        drop_date,
        released_date,
        show_in_new_releases,
        show_in_featured,
        show_in_coming_soon,
        show_in_staff_picks,
        show_in_limited_editions,
        out_of_stock,
        show_in_featured_while_coming_soon
      }
    })
    // Filter for coming-soon products only
    .filter(item => {
      // Filter out items without basic required fields
      if (!item.name || item.name.trim() === '' || item.name === 'Item 1' || item.name.includes('Item ')) return false
      
      // PRIORITY RULE: Must have show_in_coming_soon set to true
      // This ensures Coming Soon section gets exclusive products
      if (!item.show_in_coming_soon) return false
      
      // Filter out items without images
      if (!item.image || item.image.trim() === '') return false
      
      return true
    })

  return items
}