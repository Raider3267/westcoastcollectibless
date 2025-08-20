'use client'

import { useEffect, useState } from 'react'
import NotificationToast from './NotificationToast'

interface ToastData {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function GlobalToastProvider() {
  const [toast, setToast] = useState<ToastData | null>(null)

  useEffect(() => {
    const handleWishlistToast = (event: CustomEvent<ToastData>) => {
      setToast(event.detail)
    }

    // Listen for wishlist toast events
    window.addEventListener('wishlist-toast', handleWishlistToast as EventListener)

    return () => {
      window.removeEventListener('wishlist-toast', handleWishlistToast as EventListener)
    }
  }, [])

  if (!toast) return null

  return (
    <NotificationToast
      isOpen={!!toast}
      onClose={() => setToast(null)}
      message={toast.message}
      type={toast.type}
    />
  )
}