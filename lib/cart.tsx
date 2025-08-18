'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  totalItems: number
  totalPrice: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
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
        // Update quantity if item already exists
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Add new item
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
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
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0) // Remove items with 0 quantity
      
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
  addItem: (item: Omit<CartItem, 'quantity'>) => void
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
  
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
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