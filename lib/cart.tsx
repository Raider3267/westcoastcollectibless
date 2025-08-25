'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
  weight?: number // in lbs
  maxStock?: number // Available stock for this item
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  totalItems: number
  totalPrice: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { maxStock?: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }

const initialState: CartState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      let newItems: CartItem[]
      
      if (existingItem) {
        // Check stock limit before increasing quantity
        const maxStock = action.payload.maxStock || existingItem.maxStock || 999
        const newQuantity = existingItem.quantity < maxStock ? existingItem.quantity + 1 : existingItem.quantity
        
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: newQuantity, maxStock: action.payload.maxStock || item.maxStock }
            : item
        )
      } else {
        // Add new item with stock info
        newItems = [...state.items, { ...action.payload, quantity: 1, maxStock: action.payload.maxStock }]
      }
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        isOpen: true, // Auto-open cart when item is added
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id)
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item => {
        if (item.id === action.payload.id) {
          const maxStock = item.maxStock || 999
          const newQuantity = Math.max(0, Math.min(action.payload.quantity, maxStock))
          return { ...item, quantity: newQuantity }
        }
        return item
      }).filter(item => item.quantity > 0) // Remove items with 0 quantity
      
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      }
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      }
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      }
    
    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      }
    
    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      }
    
    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'> & { maxStock?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  
  const addItem = (item: Omit<CartItem, 'quantity'> & { maxStock?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }
  
  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } })
  }
  
  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }
  
  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }
  
  const openCart = () => {
    dispatch({ type: 'OPEN_CART' })
  }
  
  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' })
  }
  
  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}