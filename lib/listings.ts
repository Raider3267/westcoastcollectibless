import path from 'path'
import { readFile } from 'fs/promises'
import { parse } from 'csv-parse/sync'

export type Listing = {
  id: string
  name: string
  price?: number | null
  ebayUrl?: string | null
  image?: string | null
  stripeLink?: string | null
  description?: string | null
}

export async function getListingsFromCsv(
  filename = 'eBay-all-active-listings-report-2025-08-07-12257717404.csv'
): Promise<Listing[]> {
  const filePath = path.join(process.cwd(), 'public', filename)
  let text: string
  try {
    text = await readFile(filePath, 'utf8')
  } catch (err) {
    console.warn(`CSV not found: ${filePath}`)
    return []
  }

  const rows = parse(text, { columns: true, skip_empty_lines: true }) as any[]

  return rows.map((row: any, idx: number) => ({
    id: row['Item ID'] || String(idx),
    name: row['Title'] || `Item ${idx + 1}`,
    price: row['Start Price']
      ? Number(String(row['Start Price']).replace(/[^0-9.]/g, ''))
      : null,
    ebayUrl: row['View Item URL'] || null,
    image: row['Picture URL'] || null,
    stripeLink: row['Stripe Link'] || null,
    description: row['Custom Label'] || null
  })) as Listing[]
}

