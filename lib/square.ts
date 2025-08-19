import { SquareClient, SquareEnvironment } from 'square'
import { randomUUID } from 'crypto'

// Note: Removed BigInt.prototype.toJSON override to let Square SDK handle BigInt properly

// Initialize Square Client
const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
})

export const paymentsApi = client.payments
export const customersApi = client.customers
export const catalogApi = client.catalog
export const inventoryApi = client.inventory

export interface PaymentRequest {
  sourceId: string
  amountMoney: {
    amount: number // Amount in cents (e.g., $10.00 = 1000)
    currency: string
  }
  buyerEmailAddress?: string
  note?: string
  orderId?: string
}

export async function createPayment(paymentRequest: PaymentRequest) {
  try {
    // Ensure amount is a valid integer in cents
    const amountCents = Math.round(paymentRequest.amountMoney.amount)
    
    console.log('Creating payment with amount:', amountCents, 'type:', typeof amountCents)
    
    // Clean payload - remove undefined fields that might cause parsing issues
    const paymentData: any = {
      idempotency_key: randomUUID(),
      source_id: paymentRequest.sourceId,
      amount_money: {
        amount: amountCents,
        currency: paymentRequest.amountMoney.currency
      }
    }
    
    // Only add optional fields if they exist
    if (paymentRequest.buyerEmailAddress) {
      paymentData.buyer_email_address = paymentRequest.buyerEmailAddress
    }
    if (paymentRequest.note) {
      paymentData.note = paymentRequest.note
    }
    if (paymentRequest.orderId) {
      paymentData.order_id = paymentRequest.orderId
    }
    
    console.log('Clean payment data:', JSON.stringify(paymentData, null, 2))
    
    const response = await fetch('https://connect.squareupsandbox.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18'
      },
      body: JSON.stringify(paymentData)
    })
    
    const result = await response.json()
    console.log('Square API response:', result)
    
    if (response.ok && result.payment) {
      return {
        success: true,
        payment: result.payment,
        receipt: {
          id: result.payment.id,
          orderId: result.payment.order_id,
          amountMoney: result.payment.amount_money,
          status: result.payment.status,
          receiptNumber: result.payment.receipt_number,
          receiptUrl: result.payment.receipt_url,
        }
      }
    } else {
      console.error('Square API error:', result)
      return {
        success: false,
        error: result.errors ? result.errors[0] : { detail: 'Payment failed' },
      }
    }
  } catch (error: any) {
    console.error('Square payment error:', error)
    return {
      success: false,
      error: { detail: 'Payment processing failed' },
    }
  }
}

export async function createCustomer(customerData: {
  emailAddress?: string
  givenName?: string
  familyName?: string
  phoneNumber?: string
}) {
  try {
    const { result } = await customersApi.create({
      emailAddress: customerData.emailAddress,
      givenName: customerData.givenName,
      familyName: customerData.familyName,
      phoneNumber: customerData.phoneNumber,
    })
    
    return {
      success: true,
      customer: result.customer,
    }
  } catch (error: any) {
    console.error('Square customer creation error:', error)
    return {
      success: false,
      error: error.errors ? error.errors[0] : { detail: 'Customer creation failed' },
    }
  }
}

// Square Catalog API functions
export interface SquareProduct {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  imageUrl?: string
  sku?: string
  quantity?: number
  isAvailable: boolean
  categoryId?: string
  variations?: SquareProductVariation[]
}

export interface SquareProductVariation {
  id: string
  name: string
  price: number
  sku?: string
  quantity?: number
}

export async function getSquareProducts(): Promise<{ success: boolean; products?: SquareProduct[]; error?: any }> {
  try {
    console.log('Fetching products from Square Catalog API...')
    
    const response = await catalogApi.list({
      types: ['ITEM']
    })
    
    console.log('Square catalog response:', JSON.stringify(response, null, 2))
    
    const result = response.result
    if (!result || !result.objects) {
      console.log('No objects found in Square catalog response')
      return { success: true, products: [] }
    }
    
    const products: SquareProduct[] = []
    
    for (const catalogObject of result.objects) {
      if (catalogObject.type === 'ITEM' && catalogObject.itemData) {
        const item = catalogObject.itemData
        const variations = item.variations || []
        
        // Get the primary variation (usually the first one) for main price
        const primaryVariation = variations[0]
        const basePrice = primaryVariation?.itemVariationData?.priceMoney?.amount || 0
        const currency = primaryVariation?.itemVariationData?.priceMoney?.currency || 'USD'
        
        // Get inventory for the primary variation if it exists
        let quantity = 0
        if (primaryVariation?.id) {
          try {
            const inventoryResult = await inventoryApi.retrieveInventoryCount({
              catalogObjectId: primaryVariation.id,
              locationIds: [process.env.SQUARE_LOCATION_ID!]
            })
            quantity = Number(inventoryResult.result.counts?.[0]?.quantity) || 0
          } catch (inventoryError) {
            console.log('Could not fetch inventory for item:', primaryVariation.id)
          }
        }
        
        const product: SquareProduct = {
          id: catalogObject.id!,
          name: item.name || 'Unnamed Product',
          description: item.description,
          price: Number(basePrice) / 100, // Convert from cents to dollars
          currency,
          imageUrl: item.imageIds?.[0] ? undefined : undefined, // We'll handle images separately
          sku: primaryVariation?.itemVariationData?.sku,
          quantity,
          isAvailable: quantity > 0,
          variations: variations.map(v => ({
            id: v.id!,
            name: v.itemVariationData?.name || item.name || 'Variation',
            price: Number(v.itemVariationData?.priceMoney?.amount || 0) / 100,
            sku: v.itemVariationData?.sku,
            quantity: 0 // We'd need separate inventory calls for each variation
          }))
        }
        
        products.push(product)
      }
    }
    
    console.log(`Successfully fetched ${products.length} products from Square`)
    return { success: true, products }
    
  } catch (error: any) {
    console.error('Error fetching Square products:', error)
    return {
      success: false,
      error: error.errors ? error.errors[0] : { detail: 'Failed to fetch products from Square' }
    }
  }
}

export async function getSquareProductById(productId: string): Promise<{ success: boolean; product?: SquareProduct; error?: any }> {
  try {
    const { result } = await catalogApi.retrieveObject({
      objectId: productId,
      includeRelatedObjects: true
    })
    
    const catalogObject = result.object
    if (!catalogObject || catalogObject.type !== 'ITEM' || !catalogObject.itemData) {
      return { success: false, error: { detail: 'Product not found' } }
    }
    
    const item = catalogObject.itemData
    const variations = item.variations || []
    const primaryVariation = variations[0]
    const basePrice = primaryVariation?.itemVariationData?.priceMoney?.amount || 0
    const currency = primaryVariation?.itemVariationData?.priceMoney?.currency || 'USD'
    
    // Get inventory
    let quantity = 0
    if (primaryVariation?.id) {
      try {
        const inventoryResult = await inventoryApi.retrieveInventoryCount({
          catalogObjectId: primaryVariation.id,
          locationIds: [process.env.SQUARE_LOCATION_ID!]
        })
        quantity = Number(inventoryResult.result.counts?.[0]?.quantity) || 0
      } catch (inventoryError) {
        console.log('Could not fetch inventory for item:', primaryVariation.id)
      }
    }
    
    const product: SquareProduct = {
      id: catalogObject.id!,
      name: item.name || 'Unnamed Product',
      description: item.description,
      price: Number(basePrice) / 100,
      currency,
      sku: primaryVariation?.itemVariationData?.sku,
      quantity,
      isAvailable: quantity > 0,
      variations: variations.map(v => ({
        id: v.id!,
        name: v.itemVariationData?.name || item.name || 'Variation',
        price: Number(v.itemVariationData?.priceMoney?.amount || 0) / 100,
        sku: v.itemVariationData?.sku,
        quantity: 0
      }))
    }
    
    return { success: true, product }
    
  } catch (error: any) {
    console.error('Error fetching Square product:', error)
    return {
      success: false,
      error: error.errors ? error.errors[0] : { detail: 'Failed to fetch product from Square' }
    }
  }
}