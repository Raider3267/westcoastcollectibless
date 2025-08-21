'use client'

import { useState } from 'react'

export interface ProductCTAButtonProps {
  sale_state?: 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED'
  quantity?: number
  price?: number | null
  productId: string
  productName: string
  onAddToCart?: (productId: string) => void
  onNotifyMe?: (productId: string) => void
  className?: string
}

export default function ProductCTAButton({ 
  sale_state,
  quantity = 0,
  price,
  productId,
  productName,
  onAddToCart,
  onNotifyMe,
  className = ''
}: ProductCTAButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      if (sale_state === 'PREVIEW') {
        // PREVIEW → Notify Me
        onNotifyMe?.(productId)
      } else if (sale_state === 'LIVE' && quantity > 0) {
        // LIVE + qty>0 → Add to Cart
        onAddToCart?.(productId)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Determine button content and styling based on product state
  const getButtonData = () => {
    // PREVIEW → Notify Me (outlined button)
    if (sale_state === 'PREVIEW') {
      return {
        text: 'Notify Me',
        ariaLabel: `Get notified when ${productName} becomes available`,
        style: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
        disabled: false,
        onClick: handleClick
      }
    }
    
    // LIVE + qty>0 → Add to Cart (black button)
    if (sale_state === 'LIVE' && quantity > 0) {
      return {
        text: 'Add to Cart',
        ariaLabel: `Add ${productName} to cart${price ? ` for $${price}` : ''}`,
        style: 'bg-black text-white hover:bg-gray-800',
        disabled: false,
        onClick: handleClick
      }
    }
    
    // LIVE + qty=0 → Sold Out (disabled gray button)
    if (sale_state === 'LIVE' && quantity <= 0) {
      return {
        text: 'Sold Out',
        ariaLabel: `${productName} is currently sold out`,
        style: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        disabled: true,
        onClick: undefined
      }
    }
    
    // DRAFT/ARCHIVED → disabled
    if (sale_state === 'DRAFT' || sale_state === 'ARCHIVED') {
      return {
        text: 'Unavailable',
        ariaLabel: `${productName} is currently unavailable`,
        style: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        disabled: true,
        onClick: undefined
      }
    }
    
    // Fallback
    return {
      text: 'Unavailable',
      ariaLabel: `${productName} is currently unavailable`,
      style: 'bg-gray-300 text-gray-500 cursor-not-allowed',
      disabled: true,
      onClick: undefined
    }
  }

  const buttonData = getButtonData()

  return (
    <button
      onClick={buttonData.onClick}
      disabled={buttonData.disabled || isLoading}
      aria-label={isLoading ? `Loading, please wait` : buttonData.ariaLabel}
      aria-live={isLoading ? 'polite' : undefined}
      className={`
        inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg
        transition-colors duration-200 disabled:cursor-not-allowed
        min-h-[44px] min-w-[44px]
        ${buttonData.style}
        ${className}
      `}
      style={{
        minHeight: '44px',
        minWidth: '44px'
      }}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        buttonData.text
      )}
    </button>
  )
}