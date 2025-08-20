'use client'

import { useState, useEffect } from 'react'
import { authService, AuthUser } from '../lib/auth-new'

interface WishlistButtonProps {
  productId: string
  productName: string
  onSignInRequired?: () => void
  className?: string
}

export default function WishlistButton({ 
  productId, 
  productName, 
  onSignInRequired,
  className = '' 
}: WishlistButtonProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe(setUser)
    
    // Set initial user
    setUser(authService.getCurrentUser())
    
    return unsubscribe
  }, [])

  useEffect(() => {
    // Load wishlist status when user changes
    if (user) {
      loadWishlistStatus()
    } else {
      setIsInWishlist(false)
    }
  }, [user, productId])

  const loadWishlistStatus = async () => {
    try {
      const wishlist = await authService.getWishlist()
      setIsInWishlist(wishlist.includes(productId))
    } catch (error) {
      console.error('Failed to load wishlist:', error)
    }
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      // Not signed in - trigger sign-in modal
      onSignInRequired?.()
      return
    }

    if (isLoading) return

    setIsLoading(true)
    
    try {
      const saved = await authService.toggleWishlist(productId)
      setIsInWishlist(saved)
      
      // Show toast notification
      const message = saved 
        ? 'Saved to your wishlist — we\'ll keep you posted.'
        : 'Removed from your wishlist.'
      
      // You can emit an event here for the toast system
      window.dispatchEvent(new CustomEvent('wishlist-toast', {
        detail: { message, type: saved ? 'success' : 'info' }
      }))
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
      window.dispatchEvent(new CustomEvent('wishlist-toast', {
        detail: { 
          message: 'Failed to update wishlist. Please try again.', 
          type: 'error' 
        }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const getTooltipText = () => {
    if (!user) return 'Sign in to save'
    return isInWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'
  }

  const getAriaLabel = () => {
    if (!user) return 'Sign in to save to wishlist'
    return isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-label={getAriaLabel()}
      title={getTooltipText()}
      className={`wishlist-button ${className}`}
      style={{
        position: 'relative',
        padding: '8px',
        border: 'none',
        background: 'none',
        cursor: isLoading ? 'wait' : 'pointer',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        opacity: isLoading ? 0.6 : 1
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          e.currentTarget.style.transform = 'scale(1.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.background = 'none'
          e.currentTarget.style.transform = 'scale(1)'
        }
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isInWishlist ? '#ff4757' : 'none'}
        stroke={isInWishlist ? '#ff4757' : '#666'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'all 0.2s ease',
          filter: isInWishlist ? 'drop-shadow(0 2px 4px rgba(255, 71, 87, 0.3))' : 'none'
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50%'
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              border: '2px solid #666',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .wishlist-button:focus {
          outline: 2px solid #5ED0C0;
          outline-offset: 2px;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .wishlist-button,
          .wishlist-button svg {
            transition: none !important;
          }
        }
      `}</style>
    </button>
  )
}