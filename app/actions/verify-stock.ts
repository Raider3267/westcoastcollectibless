'use server'

import { verifyStockBeforeCheckout } from '../../lib/square-inventory'

export async function verifyCartStock(cartItems: Array<{ id: string; quantity: number }>) {
  try {
    console.log('Verifying stock for cart items:', cartItems)
    const result = await verifyStockBeforeCheckout(cartItems)
    console.log('Stock verification result:', result)
    return result
  } catch (error: any) {
    console.error('Error verifying stock:', error)
    return {
      valid: false,
      errors: ['Unable to verify stock availability'],
      updates: []
    }
  }
}