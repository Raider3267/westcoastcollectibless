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
  stripeLink?: string | null
  description?: string | null
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

export async function getListingsFromCsv(filename = 'export.csv'): Promise<Listing[]> {
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

      // Get the first image from the comma-separated image URLs
      const imagesString = FIRST<string>(row['images'], row['Images']) || ''
      const imageUrls = imagesString.split(',').map(url => url.trim()).filter(url => url)
      const image = imageUrls[0] || null

      // Clean the HTML description to plain text
      const rawDescription = FIRST<string>(row['description'], row['Description']) || ''
      const description = cleanDescription(rawDescription)

      // For now, we'll use a generic eBay store URL since we don't have item numbers
      // You could enhance this later by mapping SKUs to eBay item numbers
      const ebayUrl = 'https://www.ebay.com/usr/westcoastcollectibless'

      const stripeLink = FIRST<string>(row['Stripe Link'], row['Stripe URL'], row['paymentLink']) || null

      return { 
        id: String(id), 
        name, 
        price, 
        ebayUrl, 
        image, 
        stripeLink, 
        description 
      }
    })
    // Filter out items with no price or quantity of 0 (if you want to hide out-of-stock items)
    .filter(item => {
      return item.price && item.price > 0
    })

  return items
}