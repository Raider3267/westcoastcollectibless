export type Product = {
  id: string
  name: string
  category?: string
  description: string
  price: number
  images: string[]
  variations?: { paymentLink?: string }[]
}

export const SITE = {
  brand: 'West Coast Collectibless',
  policies: {
    shipping: 'Orders ship within 2–3 business days via USPS from Santa Monica, CA.',
    returns: 'Returns accepted within 30 days on unused items. Buyer pays return shipping unless defective.',
  },
}

export const PRODUCTS: Product[] = [
  {
    id: 'sample',
    name: 'Sample Item',
    category: 'Collectible',
    description: 'Placeholder product.',
    price: 25,
    images: [],
    variations: [],
  },
]
