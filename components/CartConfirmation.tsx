'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '../lib/cart'

interface CartConfirmationProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  productImage?: string
  onContinueShopping: () => void
  onViewCart: () => void
}

export default function CartConfirmation({ 
  isOpen, 
  onClose, 
  productName, 
  productImage,
  onContinueShopping,
  onViewCart
}: CartConfirmationProps) {
  const { state } = useCart()
  const items = state?.items || []
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const cartTotal = items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return createPortal(
    <div 
      className="cart-confirmation-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
      }}
    >
      <div 
        className="cart-confirmation-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '480px',
          width: '100%',
          position: 'relative',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Success Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          padding: '24px',
          borderRadius: '20px 20px 0 0',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '12px',
            animation: 'bounce 0.5s ease'
          }}>
            ✓
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: '0 0 8px'
          }}>
            Added to Cart!
          </h2>
          <p style={{
            fontSize: '0.95rem',
            opacity: 0.95,
            margin: 0
          }}>
            {productName} has been added to your cart
          </p>
        </div>

        {/* Cart Summary */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{ color: '#6b7280' }}>Items in cart:</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>{cartCount}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: '#6b7280' }}>Cart subtotal:</span>
            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#111827' }}>
              ${cartTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '24px',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onContinueShopping}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              background: 'white',
              color: '#374151',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#9ca3af'
              e.currentTarget.style.background = '#f9fafb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.background = 'white'
            }}
          >
            Continue Shopping
          </button>
          <button
            onClick={onViewCart}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--wcc-teal), var(--wcc-grad-c))',
              color: '#0b0b0f',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 8px 20px rgba(94, 208, 192, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(94, 208, 192, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(94, 208, 192, 0.3)'
            }}
          >
            View Cart ({cartCount})
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          ×
        </button>

        <style jsx>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.2);
            }
          }
        `}</style>
      </div>
    </div>,
    document.body
  )
}