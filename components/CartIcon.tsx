'use client'

import { useCart } from '../lib/cart'

export default function CartIcon() {
  const { state, toggleCart } = useCart()

  return (
    <button
      onClick={toggleCart}
      style={{
        padding: '10px 14px',
        borderRadius: '999px',
        border: '2px solid transparent',
        background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, var(--accent-start), var(--accent-end)) border-box',
        boxShadow: '0 6px 18px rgba(0,0,0,.08)',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        fontWeight: 600,
        fontSize: '0.95rem',
        color: '#333'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,.08)'
      }}
      aria-label="Shopping cart"
    >
      <svg 
        style={{ width: '20px', height: '20px' }}
        fill="none" 
        stroke="url(#cartGradient)" 
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <defs>
          <linearGradient id="cartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C7A3FF" />
            <stop offset="50%" stopColor="#5ED0C0" />
            <stop offset="100%" stopColor="#F7E7C3" />
          </linearGradient>
        </defs>
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536 1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      
      {/* Show Cart text when empty, hide when items exist */}
      {state.totalItems === 0 && (
        <span style={{ 
          background: 'linear-gradient(135deg, #C7A3FF, #5ED0C0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Cart
        </span>
      )}
      
      {/* Badge */}
      {state.totalItems > 0 && (
        <>
          <span style={{ color: '#333' }}>Cart</span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '24px',
            animation: state.totalItems === 1 ? 'cartPulse 0.5s ease' : undefined
          }}>
            {state.totalItems > 99 ? '99+' : state.totalItems}
          </span>
        </>
      )}
      
      <style jsx>{`
        @keyframes cartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </button>
  )
}