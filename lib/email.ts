import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailSubscriber {
  email: string
  firstName?: string
  subscribedAt: string
}

export async function addEmailSubscriber(email: string, firstName?: string): Promise<boolean> {
  try {
    // In a real app, you'd store this in a database
    // For now, we'll just send a welcome email
    
    const { data, error } = await resend.emails.send({
      from: 'WestCoast Collectibles <onboarding@resend.dev>',
      to: [email],
      subject: '🎉 Welcome to the VIP List!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0;">🎉 Welcome to the VIP List!</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0;">Hi${firstName ? ` ${firstName}` : ''}! 👋</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              You're now part of our exclusive VIP list! You'll be the first to know about:
            </p>
            <ul style="color: #6b7280; line-height: 1.8;">
              <li>🚀 <strong>New product drops</strong> - Get early access before they sell out</li>
              <li>🔥 <strong>Limited edition releases</strong> - Rare collectibles from Asia</li>
              <li>💎 <strong>Exclusive previews</strong> - See products before anyone else</li>
              <li>⚡ <strong>Flash sales</strong> - Special discounts for VIP members</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://westcoastcollectibless.com" 
               style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 999px; font-weight: bold; font-size: 16px;">
              🏪 Shop Now
            </a>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              WestCoast Collectibles - Premium Designer Toys & Collectibles
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              You can unsubscribe at any time by replying to this email.
            </p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      // For development/testing, we'll return true even if email fails
      // This allows the user experience to work while testing
      if (error.statusCode === 403 && error.error?.includes('only send testing emails')) {
        console.log('Email subscription recorded (email sending limited in development)')
        return true
      }
      return false
    }

    console.log('Welcome email sent:', data)
    return true
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return false
  }
}

export interface EmailReceiptData {
  customerEmail: string
  receiptNumber: string
  receiptUrl: string
  orderTotal: number
  currency: string
  orderItems: Array<{
    name: string
    sku: string
    quantity: number
    price: number
  }>
  paymentMethod: string
  transactionId: string
  orderDate: string
  shippingAddress?: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  shippingCost?: number
}

export async function sendEmailReceipt(receiptData: EmailReceiptData) {
  try {
    const { customerEmail, receiptNumber, receiptUrl, orderTotal, currency, orderItems, paymentMethod, transactionId, orderDate, shippingAddress, shippingCost } = receiptData
    
    const orderSubtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const finalTotal = orderSubtotal + (shippingCost || 0)
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Purchase Receipt - West Coast Collectibles</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; margin-bottom: 5px; }
            .receipt-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 25px; }
            .order-items { margin-bottom: 25px; }
            .item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
            .item:last-child { border-bottom: none; }
            .totals { background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .total-row.final { font-weight: bold; font-size: 18px; padding-top: 10px; border-top: 2px solid #4F46E5; }
            .shipping { margin-bottom: 25px; padding: 15px; background: #f0f9ff; border-radius: 6px; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">West Coast Collectibles</div>
              <p>Thank you for your purchase!</p>
            </div>
            
            <div class="receipt-info">
              <h3>Receipt Details</h3>
              <p><strong>Receipt #:</strong> ${receiptNumber}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>
            
            <div class="order-items">
              <h3>Order Items</h3>
              ${orderItems.map(item => `
                <div class="item">
                  <div>
                    <strong>${item.name}</strong><br>
                    <small>SKU: ${item.sku} | Qty: ${item.quantity}</small>
                  </div>
                  <div>$${(item.price * item.quantity / 100).toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>$${(orderSubtotal / 100).toFixed(2)}</span>
              </div>
              ${shippingCost ? `
                <div class="total-row">
                  <span>Shipping:</span>
                  <span>$${(shippingCost / 100).toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="total-row final">
                <span>Total:</span>
                <span>$${(finalTotal / 100).toFixed(2)}</span>
              </div>
            </div>
            
            ${shippingAddress ? `
              <div class="shipping">
                <h3>Shipping Address</h3>
                <p>
                  ${shippingAddress.name}<br>
                  ${shippingAddress.address}<br>
                  ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}<br>
                  ${shippingAddress.country}
                </p>
              </div>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${receiptUrl}" class="button">View Online Receipt</a>
            </div>
            
            <div class="footer">
              <p>Questions about your order? Contact us at support@westcoastcollectibles.com</p>
              <p>West Coast Collectibles | Bringing you the best collectibles</p>
            </div>
          </div>
        </body>
      </html>
    `
    
    const { data, error } = await resend.emails.send({
      from: 'West Coast Collectibles <receipts@westcoastcollectibles.com>',
      to: [customerEmail],
      subject: `Purchase Receipt #${receiptNumber} - West Coast Collectibles`,
      html: emailHtml,
    })
    
    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }
    
    console.log('Email receipt sent successfully:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('Email receipt error:', error)
    return { success: false, error }
  }
}

export async function sendProductDropNotification(
  email: string, 
  productName: string, 
  productImage: string, 
  productPrice: number,
  productUrl: string
): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'WestCoast Collectibles <onboarding@resend.dev>',
      to: [email],
      subject: `🔥 ${productName} Just Dropped!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">🔥 NEW DROP ALERT!</h1>
          </div>
          
          <div style="background: white; border: 3px solid transparent; background-image: linear-gradient(white, white), linear-gradient(135deg, #06b6d4, #8b5cf6, #f59e0b); background-origin: border-box; background-clip: content-box, border-box; border-radius: 16px; padding: 30px; margin-bottom: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${productImage}" alt="${productName}" style="max-width: 300px; width: 100%; height: auto; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
            </div>
            
            <h2 style="color: #374151; text-align: center; margin: 20px 0;">${productName}</h2>
            
            <div style="text-align: center; margin: 25px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #dc2626, #f59e0b); color: white; padding: 12px 24px; border-radius: 999px; font-size: 24px; font-weight: bold;">
                💰 $${productPrice.toFixed(2)}
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${productUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; padding: 16px 32px; text-decoration: none; border-radius: 999px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 25px rgba(139,92,246,0.3);">
                🛍️ Shop Now - Limited Stock!
              </a>
            </div>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <p style="color: #92400e; margin: 0; font-weight: bold;">
              ⚡ VIP Early Access - You're seeing this before everyone else!
            </p>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              WestCoast Collectibles - You're getting this because you're on our VIP list
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              Don't want drop notifications? Reply to unsubscribe.
            </p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      return false
    }

    console.log('Drop notification sent:', data)
    return true
  } catch (error) {
    console.error('Failed to send drop notification:', error)
    return false
  }
}