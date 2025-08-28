'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ImageCarousel from './ImageCarousel'
import ProductCTAButton from './ProductCTAButton'
import NotifyMeModal from './NotifyMeModal'
import NotificationToast from './NotificationToast'
import WishlistButton from './WishlistButton'
import AuthLightModal from './AuthLightModal'
import { useCart } from '../lib/cart'
import { authService, AuthUser } from '../lib/auth-new'

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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe(setUser)
    
    // Set initial user
    setUser(authService.getCurrentUser())
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
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
      weight: product.weight || 0.3,
      maxStock: product.quantity || 0
    })
    // Close the product modal immediately
    onClose()
    // Trigger the cart confirmation in the parent component
    if (onAddToCart) {
      setTimeout(() => onAddToCart(), 100)
    }
  }
  
  const handleNotifyMe = async () => {
    if (!product) return
    
    // If user is signed in, add to wishlist automatically
    if (user) {
      try {
        const saved = await authService.toggleWishlist(product.id)
        if (saved) {
          // Show success notification
          setNotificationMessage(`Added to your wishlist — you'll be notified about restocks, drops, and updates for "${product.name}".`)
          setShowNotification(true)
        }
      } catch (error) {
        console.error('Failed to add to wishlist:', error)
        setNotificationMessage('Failed to add to wishlist. Please try again.')
        setShowNotification(true)
      }
    } else {
      // If not signed in, show auth modal which will add to wishlist after signup
      setShowAuthModal(true)
    }
  }
  
  // Close modal on Escape key and manage focus
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      // Store the element that had focus before opening modal
      const activeElement = document.activeElement as HTMLElement
      
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      
      // Focus the modal after a brief delay
      setTimeout(() => {
        const modal = document.querySelector('[role="dialog"]') as HTMLElement
        if (modal) {
          modal.focus()
        }
      }, 100)
      
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
        // Return focus to the element that had focus before
        if (activeElement) {
          activeElement.focus()
        }
      }
    } else {
      // Ensure body overflow is reset when modal is closed
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) {
    // Ensure body overflow is always reset when modal is not open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'unset'
    }
    return null
  }

  const toyEmojis = ['🧸', '🎨', '🎪', '🎭', '🎲', '🚀', '🌟', '💎', '🎯', '⭐']
  const randomEmoji = toyEmojis[Math.floor(Math.random() * toyEmojis.length)]

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4" style={{ zIndex: 999999, position: 'fixed' }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden" 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          zIndex: 999999,
          position: 'relative',
          outline: 'none'
        }}
      >
        {/* Scrollable Content Container */}
        <div className="flex flex-col h-full max-h-[95vh]">
          
          {/* Header - Fixed */}
          <div className="flex-shrink-0 relative px-6 py-5 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold mb-3 leading-tight" style={{ color: '#1a1a1a' }}>
                  {product.name}
                </h2>
                {product.price && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl sm:text-4xl font-black" style={{ color: '#00b894' }}>
                        {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(product.price)}
                      </span>
                      {getSaleState() === 'PREVIEW' ? (
                        <span className="text-sm font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                          Coming Soon
                        </span>
                      ) : (product.quantity && product.quantity > 0) ? (
                        <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      ) : (
                        <span className="text-sm font-medium px-2 py-1 rounded-full bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    {getSaleState() === 'PREVIEW' && product.release_at && (
                      <div className="text-sm text-gray-600">
                        Expected: {new Date(product.release_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Top Right Controls */}
              <div className="flex items-center gap-3">
                {getSaleState() !== 'PREVIEW' && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '50%',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                    <WishlistButton
                      productId={product.id}
                      productName={product.name}
                      onSignInRequired={() => setShowAuthModal(true)}
                    />
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <span className="text-xl font-semibold text-gray-600">✕</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="lg:flex lg:gap-8 p-6">
              
              {/* Left Column - Images */}
              <div className="lg:w-1/2 mb-8 lg:mb-0">
                {((product.images && product.images.length > 0) || product.image) ? (
                  <div className="sticky top-0">
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
                ) : (
                  <div 
                    className="flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200"
                    style={{ aspectRatio: '1', minHeight: '300px' }}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">{randomEmoji}</div>
                      <p className="text-gray-600 font-medium">Product Image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="lg:w-1/2">
                {product.description && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm">📝</span>
                      Product Details
                    </h3>
                    <div 
                      className="prose prose-sm max-w-none"
                      style={{
                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #e2e8f0',
                        lineHeight: '1.7'
                      }}
                    >
                      {product.description.split('\n').map((paragraph, index) => {
                        const trimmed = paragraph.trim();
                        if (trimmed === '') return <div key={index} className="h-3" />;
                        
                        // Handle bullet points and special formatting
                        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                          return (
                            <div key={index} className="flex items-start gap-2 mb-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span className="text-gray-700">{trimmed.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        
                        // Handle emoji bullet points
                        if (/^[🎁✅🐰✨💰🎯⭐🌟💎🚀]/.test(trimmed)) {
                          const emoji = trimmed.charAt(0);
                          const text = trimmed.substring(1).trim();
                          return (
                            <div key={index} className="flex items-start gap-2 mb-2">
                              <span className="mt-1">{emoji}</span>
                              <span className="text-gray-700 font-medium">{text}</span>
                            </div>
                          );
                        }
                        
                        // Handle headers (ALL CAPS or ending with :)
                        if (trimmed === trimmed.toUpperCase() || trimmed.endsWith(':')) {
                          return (
                            <h4 key={index} className="font-bold text-gray-900 mt-4 mb-2 first:mt-0">
                              {trimmed}
                            </h4>
                          );
                        }
                        
                        // Regular paragraph
                        return (
                          <p key={index} className="text-gray-700 mb-3 last:mb-0">
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Product Specs */}
                <div className="grid grid-cols-1 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {getSaleState() === 'PREVIEW' ? '🔜' : '✅'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getSaleState() === 'PREVIEW' ? 'Coming Soon' : 'In Stock'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed Actions */}
          <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <ProductCTAButton
                  sale_state={getSaleState()}
                  quantity={product.quantity}
                  price={product.price}
                  productId={product.id}
                  productName={product.name}
                  onAddToCart={handleAddToCart}
                  onNotifyMe={handleNotifyMe}
                  className="w-full text-lg font-bold py-4 px-8"
                />
              </div>
              <button
                onClick={onClose}
                className="px-8 py-4 font-bold text-lg transition-all duration-200 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50"
                style={{ color: '#374151' }}
              >
                Close
              </button>
            </div>
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
        
        <AuthLightModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          productId={product?.id}
          onSuccess={() => {
            setShowAuthModal(false)
          }}
        />
      </>
    )
  }

  return modalContent
}