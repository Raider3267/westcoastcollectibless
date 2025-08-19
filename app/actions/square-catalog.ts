'use server'

import { getSquareProducts, getSquareProductById, type SquareProduct } from '../../lib/square'

export async function fetchSquareProducts(): Promise<{ success: boolean; products?: SquareProduct[]; error?: any }> {
  console.log('Server action: Fetching products from Square Catalog...')
  
  try {
    const result = await getSquareProducts()
    console.log('Server action: Square products result:', result.success ? `${result.products?.length} products` : result.error)
    return result
  } catch (error) {
    console.error('Server action: Error fetching Square products:', error)
    return {
      success: false,
      error: { detail: 'Failed to fetch products from Square' }
    }
  }
}

export async function fetchSquareProduct(productId: string): Promise<{ success: boolean; product?: SquareProduct; error?: any }> {
  console.log('Server action: Fetching product from Square:', productId)
  
  try {
    const result = await getSquareProductById(productId)
    console.log('Server action: Square product result:', result.success ? 'Found' : result.error)
    return result
  } catch (error) {
    console.error('Server action: Error fetching Square product:', error)
    return {
      success: false,
      error: { detail: 'Failed to fetch product from Square' }
    }
  }
}

