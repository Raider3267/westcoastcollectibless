import { SquareClient, SquareEnvironment } from 'square'
import { randomUUID } from 'crypto'

// Note: Removed BigInt.prototype.toJSON override to let Square SDK handle BigInt properly

// Initialize Square Client
const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENV === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
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
  shippingAddress?: {
    address_line_1: string
    address_line_2?: string
    locality: string // city
    administrative_district_level_1: string // state
    postal_code: string
    country: string
    first_name?: string
    last_name?: string
  }
  lineItems?: Array<{
    name: string
    quantity: string
    item_type: string
    base_price_money: {
      amount: number
      currency: string
    }
    variation_name?: string
  }>
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
      },
      autocomplete: true // This ensures immediate payment processing
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
    if (paymentRequest.shippingAddress) {
      paymentData.shipping_address = paymentRequest.shippingAddress
    }
    
    // Add line items if provided
    if (paymentRequest.lineItems && paymentRequest.lineItems.length > 0) {
      paymentData.order = {
        location_id: process.env.SQUARE_LOCATION_ID,
        line_items: paymentRequest.lineItems
      }
    }
    
    console.log('Clean payment data:', JSON.stringify(paymentData, null, 2))
    
    // Use environment-aware endpoint
    const baseUrl = process.env.SQUARE_ENV === 'production' 
      ? 'https://connect.squareup.com' 
      : 'https://connect.squareupsandbox.com'
    
    const response = await fetch(`${baseUrl}/v2/payments`, {
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
    const response = await customersApi.create({
      emailAddress: customerData.emailAddress,
      givenName: customerData.givenName,
      familyName: customerData.familyName,
      phoneNumber: customerData.phoneNumber,
    })
    
    console.log('Customer creation response:', response)
    
    if (response.customer) {
      return {
        success: true,
        customer: response.customer,
      }
    } else {
      console.error('No customer in response:', response)
      return {
        success: false,
        error: { detail: 'Customer creation failed - no customer returned' },
      }
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
    
    const response = await catalogApi.list({ types: 'ITEM' })
    
    console.log('Square catalog response:', JSON.stringify(response, null, 2))
    
    // Response is a page with data property containing catalog objects
    const objects = response.data || []
    if (objects.length === 0) {
      console.log('No objects found in Square catalog response')
      return { success: true, products: [] }
    }
    
    const products: SquareProduct[] = []
    
    for (const catalogObject of objects) {
      if (catalogObject.type === 'ITEM' && catalogObject.itemData) {
        const item = catalogObject.itemData
        const variations = item.variations || []
        
        // Get the primary variation (usually the first one) for main price
        const primaryVariation = variations[0]
        const basePrice = (primaryVariation as any)?.itemVariationData?.priceMoney?.amount || 0
        const currency = (primaryVariation as any)?.itemVariationData?.priceMoney?.currency || 'USD'
        
        // Get inventory for the primary variation if it exists
        let quantity = 0
        if (primaryVariation?.id) {
          try {
            const inventoryResult = await inventoryApi.get({
              catalogObjectId: primaryVariation.id,
              locationIds: process.env.SQUARE_LOCATION_ID!
            })
            // The response is a page with data property containing inventory counts
            const counts = inventoryResult.data || []
            quantity = Number(counts[0]?.quantity) || 0
          } catch (inventoryError) {
            console.log('Could not fetch inventory for item:', primaryVariation.id)
          }
        }
        
        const product: SquareProduct = {
          id: catalogObject.id!,
          name: item.name || 'Unnamed Product',
          description: item.description || undefined,
          price: Number(basePrice) / 100, // Convert from cents to dollars
          currency,
          imageUrl: item.imageIds?.[0] ? undefined : undefined, // We'll handle images separately
          sku: (primaryVariation as any)?.itemVariationData?.sku,
          quantity,
          isAvailable: quantity > 0,
          variations: variations.map((v: any) => ({
            id: v.id!,
            name: (v as any).itemVariationData?.name || item.name || 'Variation',
            price: Number((v as any).itemVariationData?.priceMoney?.amount || 0) / 100,
            sku: (v as any).itemVariationData?.sku,
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
    const response = await catalogApi.object.get({ objectId: productId, includeRelatedObjects: true })
    
    const catalogObject = response.object
    if (!catalogObject || catalogObject.type !== 'ITEM' || !catalogObject.itemData) {
      return { success: false, error: { detail: 'Product not found' } }
    }
    
    const item = catalogObject.itemData
    const variations = item.variations || []
    const primaryVariation = variations[0]
    const basePrice = (primaryVariation as any)?.itemVariationData?.priceMoney?.amount || 0
    const currency = (primaryVariation as any)?.itemVariationData?.priceMoney?.currency || 'USD'
    
    // Get inventory
    let quantity = 0
    if (primaryVariation?.id) {
      try {
        const inventoryResult = await inventoryApi.get({
          catalogObjectId: primaryVariation.id,
          locationIds: process.env.SQUARE_LOCATION_ID!
        })
        // The response is a page with data property containing inventory counts
        const counts = inventoryResult.data || []
        quantity = Number(counts[0]?.quantity) || 0
      } catch (inventoryError) {
        console.log('Could not fetch inventory for item:', primaryVariation.id)
      }
    }
    
    const product: SquareProduct = {
      id: catalogObject.id!,
      name: item.name || 'Unnamed Product',
      description: item.description || undefined,
      price: Number(basePrice) / 100,
      currency,
      sku: (primaryVariation as any)?.itemVariationData?.sku,
      quantity,
      isAvailable: quantity > 0,
      variations: variations.map((v: any) => ({
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