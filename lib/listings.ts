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

export async function getListingsFromCsv(filename = 'eBay-all-active-listings-report-2025-08-07-12257717404.csv'): Promise<Listing[]> {
  const filePath = path.join(process.cwd(), 'public', filename)
  const text = await readFile(filePath, 'utf8')

  const rows = parse(text, { columns: true, skip_empty_lines: true }) as any[]

  const items: Listing[] = rows.map((row, idx) => {
    const id = FIRST<string>(row['Item ID'], row['ItemID'], String(idx))!
    const name = FIRST<string>(row['Title'], row['title']) || `Item ${idx + 1}`

    const priceStr = FIRST<string>(row['Start Price'], row['Buy It Now Price'], row['Price'])
    const price = priceStr ? Number(String(priceStr).replace(/[^0-9.]/g, '')) : null

    const ebayUrl = FIRST<string>(row['View Item URL'], row['ViewItemURL'], row['Item URL']) || null
    const image = FIRST<string>(row['Picture URL'], row['Gallery URL'], row['PictureURL'], row['Photo URL']) || null
    const description = FIRST<string>(row['Custom Label'], row['Subtitle']) || null

    const stripeLink = FIRST<string>(row['Stripe Link'], row['Stripe URL'], row['paymentLink']) || null

    return { id: String(id), name, price, ebayUrl, image, stripeLink, description }
  })

  return items
}