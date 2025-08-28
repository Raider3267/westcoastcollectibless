'use client'

import { useState, useEffect } from 'react'
import ProductModal from './ProductModal'
import DetailsButton from './DetailsButton'
import ImageCarousel from './ImageCarousel'
import ProductChip from './ProductChip'
import ProductCTAButton from './ProductCTAButton'
import NotifyMeModal from './NotifyMeModal'
import CartConfirmation from './CartConfirmation'
import NotificationToast from './NotificationToast'
import WishlistButton from './WishlistButton'
import AuthLightModal from './AuthLightModal'
import { authService, AuthUser } from '../lib/auth-new'
import { useCart } from '../lib/cart'
import { getImageUrl, TRANSFORMATIONS } from '../lib/cloudinary'

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
  featured?: boolean
  staff_pick?: boolean
  limited_edition?: boolean
  // Legacy fields (still supported)
  status?: 'live' | 'coming-soon' | 'draft'
  drop_date?: string | null
  released_date?: string | null
  show_in_new_releases?: boolean
  show_in_featured?: boolean
  show_in_coming_soon?: boolean
  out_of_stock?: boolean
  weight?: number
}

interface ProductCardProps {
  product: Product
  cardColor: string
  randomEmoji: string
  hideStatusBadges?: boolean // Hide featured/staff pick badges when true
}

export default function ProductCard({ product, cardColor, randomEmoji, hideStatusBadges = false }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false)
  const [showCartConfirmation, setShowCartConfirmation] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const { addItem, openCart, closeCart } = useCart()
  
  // Convert legacy status to new sale_state system
  const getSaleState = (): 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED' => {
    if (product.sale_state) {
      return product.sale_state
    }
    // Legacy conversion
    if (product.status === 'coming-soon') return 'PREVIEW'
    if (product.status === 'live') return 'LIVE'
    if (product.status === 'draft') return 'DRAFT'
    return 'LIVE' // Default fallback
  }
  
  const saleState = getSaleState()
  const releaseAt = product.release_at || product.drop_date
  
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
  }, [])

  useEffect(() => {
    // Load wishlist status when user changes
    if (user) {
      loadWishlistStatus()
    } else {
      setIsInWishlist(false)
    }
  }, [user, product.id])

  const loadWishlistStatus = async () => {
    try {
      const wishlist = await authService.getWishlist()
      setIsInWishlist(wishlist.includes(product.id))
    } catch (error) {
      console.error('Failed to load wishlist:', error)
    }
  }
  
  // This function is replaced by WishlistButton component
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      image: product.image || undefined,
      weight: product.weight || 0.3,
      maxStock: product.quantity || 0
    })
    // Show cart confirmation popup
    setShowCartConfirmation(true)
  }
  
  const handleContinueShopping = () => {
    setShowCartConfirmation(false)
    // Also close the cart if it was automatically opened
    closeCart()
  }
  
  const handleViewCart = () => {
    setShowCartConfirmation(false)
    openCart() // Open the cart sidebar
  }
  
  const handleNotifyMe = async () => {
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
  
  const handleCreateAlert = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      alert('Please sign in to create alerts')
      return
    }
    
    // TODO: Implement alert creation
    // authService.createAlert(product.id, 'restock')
    alert('Alert feature coming soon! You\'ll be notified when this item is restocked.')
  }
  
  const isStripe = Boolean(product.stripeLink)
  
  // Extract brand name from title - simplified approach
  const extractBrand = (title: string) => {
    const brandPatterns = ['POP MART', 'Labubu', 'Skullpanda']
    for (const brand of brandPatterns) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        return {
          brand,
          titleWithoutBrand: title.replace(new RegExp(brand, 'gi'), '').trim().replace(/^[-–—×:]\s*/, '').trim()
        }
      }
    }
    // If no clear brand pattern, just return the full title
    return { brand: '', titleWithoutBrand: title };
  }
  
  const { brand, titleWithoutBrand } = extractBrand(product.name)
  
  // Rotate through accent colors
  const accents = ['accent-lilac', 'accent-teal', 'accent-gold']
  const accentClass = accents[Math.abs(product.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % accents.length]

  return (
    <>
      <article 
        className={`product-card wcc-card ${accentClass} group`} 
        style={{ overflow: 'hidden' }}
        aria-labelledby={`product-title-${product.id}`}
      >
        {/* Product status chip */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 15
        }}>
          <ProductChip 
            sale_state={saleState}
            release_at={releaseAt}
            quantity={product.quantity}
          />
        </div>
        
        {/* Wishlist button - hide for Coming Soon items since Notify Me adds to wishlist */}
        {saleState !== 'PREVIEW' && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            zIndex: 15,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <WishlistButton
              productId={product.id}
              productName={product.name}
              onSignInRequired={() => setShowAuthModal(true)}
            />
          </div>
        )}
        
        <div className="product-thumb wcc-thumb" style={{ position: 'relative' }}>

          {(product.images && product.images.length > 0) || product.image ? (
            <ImageCarousel
              images={product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])}
              productName={product.name}
              className="wcc-zoom"
              showThumbnails={false}
            />
          ) : (
            <div className="wcc-zoom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#f8f9fa' }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{randomEmoji}</div>
              <span style={{ fontSize: '0.9rem', color: '#6c757d', fontWeight: 500 }}>Surprise Inside!</span>
            </div>
          )}
        </div>

        <div className="product-body wcc-body">
          <h3 
            id={`product-title-${product.id}`}
            className="product-title wcc-title"
          >
            <span className="wcc-brand">{brand}</span> {titleWithoutBrand}
          </h3>
        </div>

        <div className="product-foot wcc-foot">
          {typeof product.price === 'number' ? (
            <span className="product-price wcc-price" aria-label={`Price: ${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(product.price)}`}>
              {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(product.price)}
            </span>
          ) : (
            <span className="product-price wcc-price" aria-label="Price available upon request">Price Available</span>
          )}
          
          <div className="wcc-actions" style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', gap: '8px' }}>
            <ProductCTAButton
              sale_state={saleState}
              quantity={product.quantity}
              price={product.price}
              productId={product.id}
              productName={product.name}
              onAddToCart={handleAddToCart}
              onNotifyMe={handleNotifyMe}
              className="flex-1"
            />
            <button 
              type="button"
              className="btn wcc-btn"
              style={{ 
                pointerEvents: 'all',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 11,
                fontSize: '0.9rem',
                fontWeight: 600,
                minHeight: '44px',
                minWidth: '44px'
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsModalOpen(true)
              }}
              aria-label={`View details for ${product.name}`}
            >
              Details
            </button>
          </div>
        </div>

      </article>

      <ProductModal 
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={() => setShowCartConfirmation(true)}
      />
      
      <NotifyMeModal
        isOpen={isNotifyModalOpen}
        productId={product.id}
        productName={product.name}
        onClose={() => setIsNotifyModalOpen(false)}
      />
      
      <CartConfirmation
        isOpen={showCartConfirmation}
        onClose={() => setShowCartConfirmation(false)}
        productName={product.name}
        productImage={product.image ? getImageUrl(product.image, TRANSFORMATIONS.PRODUCT_THUMBNAIL) : undefined}
        onContinueShopping={handleContinueShopping}
        onViewCart={handleViewCart}
      />
      
      <NotificationToast
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        message={notificationMessage}
        type="success"
      />
      
      <AuthLightModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        productId={product.id}
        onSuccess={() => {
          // Refresh wishlist state after successful auth
          setShowAuthModal(false)
        }}
      />
    </>
  )
}