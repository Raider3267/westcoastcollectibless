import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Listing } from './listings'

let parse: any
try {
  // Works when subpath exports are available
  ;({ parse } = await import('csv-parse/sync'))
} catch {
  // Fallback: some bundlers only expose the root; this gets the sync export
  const mod: any = await import('csv-parse')
  parse = mod.parse || mod.default?.parse || mod['sync']?.parse
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

export async function getNewReleases(filename = 'export.csv', daysBack = 7): Promise<Listing[]> {
  const filePath = path.join(process.cwd(), filename)
  const text = await readFile(filePath, 'utf8')

  const rows = parse(text, { columns: true, skip_empty_lines: true }) as any[]

  // Calculate the cutoff date for "new" releases
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysBack)

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

      // Get the first image from the comma-separated image URLs
      const imagesString = FIRST<string>(row['images'], row['Images']) || ''
      const imageUrls = imagesString.split(',').map(url => url.trim()).filter(url => url)
      const image = imageUrls[0] || null

      // Clean the HTML description to plain text
      const rawDescription = FIRST<string>(row['description'], row['Description']) || ''
      const description = cleanDescription(rawDescription)

      const ebayUrl = 'https://www.ebay.com/usr/westcoastcollectibless'
      const stripeLink = FIRST<string>(row['Stripe Link'], row['Stripe URL'], row['paymentLink']) || null

      // Get status field
      const statusStr = FIRST<string>(row['status'], row['Status']) || 'live'
      const status = (['live', 'coming-soon', 'draft'].includes(statusStr) ? statusStr : 'live') as 'live' | 'coming-soon' | 'draft'

      // Get drop_date, released_date, and show_in_new_releases fields
      const drop_date = FIRST<string>(row['drop_date'], row['Drop Date']) || null
      const released_date = FIRST<string>(row['released_date'], row['Released Date']) || null
      const show_in_new_releases = FIRST<string>(row['show_in_new_releases'], row['Show In New Releases']) === 'true'

      return { 
        id: String(id), 
        name, 
        price, 
        ebayUrl, 
        image, 
        stripeLink, 
        description,
        quantity,
        status,
        drop_date,
        released_date,
        show_in_new_releases
      }
    })
    // Filter for new releases
    .filter(item => {
      // Filter out items without basic required fields
      if (!item.name || item.name.trim() === '' || item.name === 'Item 1' || item.name.includes('Item ')) return false
      
      // Must be live status
      if (item.status !== 'live') return false
      
      // Must have a released_date within the specified time range
      if (!item.released_date) return false
      
      const releaseDate = new Date(item.released_date)
      if (releaseDate < cutoffDate) return false
      
      // Must be explicitly marked to show in new releases
      if (!item.show_in_new_releases) return false
      
      // Always require a price
      if (!item.price || item.price <= 0) return false
      
      // Filter out items without images
      if (!item.image || item.image.trim() === '') return false
      
      return true
    })
    // Sort by release date (newest first)
    .sort((a, b) => {
      const dateA = new Date(a.released_date!).getTime()
      const dateB = new Date(b.released_date!).getTime()
      return dateB - dateA
    })

  return items
}