'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ImageCarousel from './ImageCarousel'
import ProductCTAButton from './ProductCTAButton'
import NotifyMeModal from './NotifyMeModal'
import NotificationToast from './NotificationToast'
import { useCart } from '../lib/cart'
import { AuthService } from '../lib/auth'

type Product = {
  id: string
  name: string
  price?: number | null
  ebayUrl?: string | null
  image?: string | null
  images?: string[]
  stripeLink?: string | null
  description?: string | null
  quantity?: number
  // New product state system
  sale_state?: 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED'
  release_at?: string | null
  // Legacy fields (still supported)
  status?: 'live' | 'coming-soon' | 'draft'
  drop_date?: string | null
  released_date?: string | null
  show_in_new_releases?: boolean
  weight?: number
}

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart?: () => void
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const { addItem, openCart } = useCart()
  const [user, setUser] = useState(AuthService.getCurrentUser())
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  
  useEffect(() => {
    setUser(AuthService.getCurrentUser())
  }, [isOpen])
  
  // Convert legacy status to new sale_state system
  const getSaleState = (): 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED' => {
    if (product?.sale_state) {
      return product.sale_state
    }
    // Legacy conversion
    if (product?.status === 'coming-soon') return 'PREVIEW'
    if (product?.status === 'live') return 'LIVE'
    if (product?.status === 'draft') return 'DRAFT'
    return 'LIVE' // Default fallback
  }
  
  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      image: product.image || undefined,
      weight: product.weight || 0.3
    })
    // Close the product modal immediately
    onClose()
    // Trigger the cart confirmation in the parent component
    if (onAddToCart) {
      setTimeout(() => onAddToCart(), 100)
    }
  }
  
  const handleNotifyMe = () => {
    if (!product) return
    
    // If user is signed in, directly create the alert
    if (user) {
      AuthService.createAlert(product.id, 'restock')
      // Show success notification
      setNotificationMessage(`You'll be notified when "${product.name}" is back in stock!`)
      setShowNotification(true)
    } else {
      // If not signed in, show the notify modal
      setShowNotifyModal(true)
    }
  }
  
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  const toyEmojis = ['🧸', '🎨', '🎪', '🎭', '🎲', '🚀', '🌟', '💎', '🎯', '⭐']
  const randomEmoji = toyEmojis[Math.floor(Math.random() * toyEmojis.length)]

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 999999, position: 'fixed' }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto" style={{
        background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,var(--wcc-grad-a),var(--wcc-grad-b),var(--wcc-grad-c)) border-box',
        border: '3px solid transparent',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        zIndex: 999999,
        position: 'relative'
      }}>
        {/* Header */}
        <div className="p-6 border-b" style={{
          background: 'linear-gradient(135deg, rgba(199,163,255,.15), rgba(94,208,192,.15))',
          borderBottom: '2px solid var(--wcc-line)'
        }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 pr-8" style={{ color: 'var(--wcc-ink)' }}>
                {product.name}
              </h2>
              {product.price && (
                <div className="text-3xl font-extrabold" style={{ color: '#ff8b2a' }}>
                  💰 {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(product.price)}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-3xl transition-colors duration-200"
              style={{ color: 'var(--wcc-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--wcc-teal)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--wcc-muted)'}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Gallery */}
          {((product.images && product.images.length > 0) || product.image) && (
            <div className="mb-6" style={{ maxWidth: '500px', margin: '0 auto 24px auto' }}>
              <ImageCarousel
                images={
                  product.images && product.images.length > 0 
                    ? product.images 
                    : product.image 
                    ? product.image.split(',').map(url => url.trim()).filter(url => url)
                    : []
                }
                productName={product.name}
                showThumbnails={true}
                autoHeight={false}
              />
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#7E5AE1' }}>
                📝 Product Details
              </h3>
              <div className="p-6" style={{
                background: 'linear-gradient(135deg, rgba(199,163,255,.08), rgba(94,208,192,.08))',
                borderRadius: '18px',
                borderLeft: '4px solid var(--wcc-teal)'
              }}>
                <div className="leading-relaxed whitespace-pre-line text-base" style={{ color: 'var(--wcc-ink)' }}>
                  {product.description?.split('\n').map((line, index) => (
                    <div key={index} className={line.trim().startsWith('•') || line.trim().startsWith('🎁') || line.trim().startsWith('✅') || line.trim().startsWith('🐰') || line.trim().startsWith('✨') || line.trim().startsWith('💰') ? 'ml-2 mb-1' : 'mb-2'}>
                      {line.trim() === '' ? <br /> : line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <ProductCTAButton
              sale_state={getSaleState()}
              quantity={product.quantity}
              price={product.price}
              productId={product.id}
              productName={product.name}
              onAddToCart={handleAddToCart}
              onNotifyMe={handleNotifyMe}
              className="flex-1 text-lg font-bold py-4"
            />
            <button
              onClick={onClose}
              className="font-bold text-lg transition-all duration-300 hover:scale-105"
              style={{
                padding: '16px 24px',
                borderRadius: '12px',
                border: '2px solid var(--wcc-line)',
                background: '#fff',
                color: 'var(--wcc-ink)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.borderColor = 'var(--wcc-lilac)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.borderColor = 'var(--wcc-line)'
              }}
            >
              ✨ Close
            </button>
          </div>
        </div>

      </div>
    </div>
  )

  // Use createPortal to render modal at document.body level
  if (typeof document !== 'undefined') {
    return (
      <>
        {createPortal(modalContent, document.body)}
        {product && (
          <NotifyMeModal
            isOpen={showNotifyModal}
            productId={product.id}
            productName={product.name}
            onClose={() => setShowNotifyModal(false)}
          />
        )}
        <NotificationToast
          isOpen={showNotification}
          onClose={() => setShowNotification(false)}
          message={notificationMessage}
          type="success"
        />
      </>
    )
  }

  return modalContent
}