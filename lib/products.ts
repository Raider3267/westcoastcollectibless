// lib/products.ts
import type { Product, SiteMeta } from './types'

export const SITE: SiteMeta = {
  brand: 'WestCoastCollectibless',
  tagline: 'Collectibles • Designer Toys • 3D-Printed Mods',
  hero: {
    headline: 'Curated drops, West Coast speed',
    sub: 'Collector-first. Authentic goods and accessories from the West Coast.',
  },
  socials: {
    instagram: 'https://instagram.com/westcoastcollectibless',
    ebay: 'https://www.ebay.com/usr/westcoastcollectibless',
  },
  policies: {
    shipping: 'Orders ship within 2–3 business days from Los Angeles. Domestic USPS with tracking.',
    returns: '30-day return window on unused items. Buyer pays return shipping unless item is defective.',
    quality: 'Items may be 3D-printed; micro-layer lines or tiny surface artifacts can be visible—this is normal.',
  },
}

// KEEP your existing PRODUCTS export below.
// If PRODUCTS is missing or not named correctly, ensure it looks like this:
export const PRODUCTS: Product[] = [
  // ...your generated items from the CSV...
]
