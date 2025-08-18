'use client'

import { useCart } from '../lib/cart'

export default function CartIcon() {
  const { state, toggleCart } = useCart()

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      aria-label="Shopping cart"
    >
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3H1m6 10h10M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 004 16v1a1 1 0 001 1h1m5-1v1a1 1 0 001 1h1m-6 0a1 1 0 001 1h1m0 0a1 1 0 001-1v-1h-1z" 
        />
      </svg>
      
      {/* Badge */}
      {state.totalItems > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
          {state.totalItems > 99 ? '99+' : state.totalItems}
        </span>
      )}
    </button>
  )
}