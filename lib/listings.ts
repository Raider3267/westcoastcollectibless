import fs from 'fs/promises'
import path from 'path'
import Papa from 'papaparse'

export type Listing = {
  id: string
  name: string
  price?: number | null
  ebayUrl?: string | null
  image?: string | null
  stripeLink?: string | null
  description?: string | null
}

/**
 * Column mapping assumptions for eBay Active Listings report:
 *  - Title:            "Title"
 *  - Item ID:          "Item ID"
 *  - View URL:         "View Item URL"
 *  - Primary image:    "Picture URL" | "Gallery URL" | "PictureURL"
 *  - Price:            "Start Price" | "Buy It Now Price" | "Price"
 *  - Notes/desc:       "Custom Label" | "Subtitle"
 *
 * Stripe override (optional columns you may add/maintain in your CSV):
 *  - "Stripe Link" | "Stripe URL" | "paymentLink"
 */
const FIRST = <T>(...vals: (T | undefined | null | false | '')[]) =>
  vals.find(v => typeof v === 'number' || (typeof v === 'string' && v.trim() !== '')) as T | undefined

export async function getListingsFromCsv(
  filename = 'eBay-all-active-listings-report-2025-08-07-12257717404.csv'
): Promise<Listing[]> {
  const filePath = path.join(process.cwd(), 'public', filename)
  const text = await fs.readFile(filePath, 'utf8')

  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
  const rows = Array.isArray(parsed.data) ? (parsed.data as any[]) : []

  const items: Listing[] = rows
    .map((row, idx): Listing | null => {
      const id = FIRST<string>(row['Item ID'], row['ItemID'], String(idx))
      const name = FIRST<string>(row['Title'], row['title'])
      if (!id || !name) return null

      const priceStr = FIRST<string>(row['Start Price'], row['Buy It Now Price'], row['Price'])
      const price = priceStr ? Number(String(priceStr).replace(/[^0-9.]/g, '')) : null

      const ebayUrl = FIRST<string>(row['View Item URL'], row['ViewItemURL'], row['Item URL'])
      const image = FIRST<string>(row['Picture URL'], row['Gallery URL'], row['PictureURL'], row['Photo URL'])
      const description = FIRST<string>(row['Custom Label'], row['Subtitle'])

      // Stripe override (prefer these if present)
      const stripeLink = FIRST<string>(row['Stripe Link'], row['Stripe URL'], row['paymentLink'])

      return {
        id: String(id),
        name,
        price,
        ebayUrl: ebayUrl || null,
        image: image || null,
        stripeLink: stripeLink || null,
        description: description || null,
      }
    })
    .filter(Boolean) as Listing[]

  return items
}