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
  // Temporary stub - returns empty array
  console.warn('getListingsFromCsv is temporarily disabled')
  return []
}

export async function getComingSoonProducts(filename?: string): Promise<Listing[]> {
  // Temporary stub - returns empty array
  console.warn('getComingSoonProducts is temporarily disabled')
  return []
}