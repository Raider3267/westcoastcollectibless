'use client'

import { useState, useEffect } from 'react'
import ProductModal from './ProductModal'
import DetailsButton from './DetailsButton'
import ImageCarousel from './ImageCarousel'
import ProductChip from './ProductChip'
import ProductCTAButton from './ProductCTAButton'
import NotifyMeModal from './NotifyMeModal'
import CartConfirmation from './CartConfirmation'
import { AuthService } from '../lib/auth'
import { useCart } from '../lib/cart'

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
}

export default function ProductCard({ product, cardColor, randomEmoji }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false)
  const [showCartConfirmation, setShowCartConfirmation] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [user, setUser] = useState(AuthService.getCurrentUser())
  const { addItem, openCart } = useCart()
  
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
    setUser(AuthService.getCurrentUser())
    setIsInWishlist(AuthService.isInWishlist(product.id))
  }, [])
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      // Could show auth modal here
      alert('Please sign in to add items to your wishlist')
      return
    }
    
    if (isInWishlist) {
      AuthService.removeFromWishlist(product.id)
      setIsInWishlist(false)
    } else {
      AuthService.addToWishlist(product.id)
      setIsInWishlist(true)
    }
  }
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      image: product.image || undefined,
      weight: product.weight || 0.3
    })
    // Show cart confirmation popup
    setShowCartConfirmation(true)
  }
  
  const handleContinueShopping = () => {
    setShowCartConfirmation(false)
  }
  
  const handleViewCart = () => {
    setShowCartConfirmation(false)
    openCart() // Open the cart sidebar
  }
  
  const handleNotifyMe = () => {
    setIsNotifyModalOpen(true)
  }
  
  const handleCreateAlert = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      alert('Please sign in to create alerts')
      return
    }
    
    AuthService.createAlert(product.id, 'restock')
    alert('Alert created! You\'ll be notified when this item is restocked.')
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
      <article className={`product-card wcc-card ${accentClass} group`} style={{ overflow: 'hidden' }}>
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
        
        {/* Featured badge */}
        {product.featured && (
          <div className="luxury-badge featured" style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 15,
            background: 'rgba(255, 215, 0, 0.9)',
            color: '#000',
            padding: '4px 8px',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            backdropFilter: 'blur(4px)',
            border: '2px solid white',
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
          }}>
            ⭐ FEATURED
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
          <h3 className="product-title wcc-title">
            <span className="wcc-brand">{brand}</span> {titleWithoutBrand}
          </h3>
        </div>

        <div className="product-foot wcc-foot">
          {typeof product.price === 'number' ? (
            <span className="product-price wcc-price">
              {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(product.price)}
            </span>
          ) : (
            <span className="product-price wcc-price">Price Available</span>
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
                fontWeight: 600
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsModalOpen(true)
              }}
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
        productImage={product.image || undefined}
        onContinueShopping={handleContinueShopping}
        onViewCart={handleViewCart}
      />
    </>
  )
}