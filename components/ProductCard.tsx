'use client'

import { useState, useEffect } from 'react'
import ProductModal from './ProductModal'
import DetailsButton from './DetailsButton'
import ImageCarousel from './ImageCarousel'
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
  status?: 'live' | 'coming-soon' | 'draft'
  drop_date?: string | null
  released_date?: string | null
  show_in_new_releases?: boolean
  show_in_featured?: boolean
  show_in_coming_soon?: boolean
}

interface ProductCardProps {
  product: Product
  cardColor: string
  randomEmoji: string
}

export default function ProductCard({ product, cardColor, randomEmoji }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [user, setUser] = useState(AuthService.getCurrentUser())
  
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
      <article className={`product-card wcc-card ${accentClass} group`}>
        {/* Enhanced badge for featured/new items */}
        {product.show_in_new_releases && (
          <div className="luxury-badge featured" style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 15
          }}>
            ✨ NEW
          </div>
        )}
        
        {/* Out of stock overlay */}
        {(!product.quantity || product.quantity <= 0) && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(220, 53, 69, 0.9)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            zIndex: 15,
            backdropFilter: 'blur(4px)',
            border: '2px solid white',
            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
          }}>
            🚫 OUT OF STOCK
          </div>
        )}
        
        <div className="product-thumb wcc-thumb" style={{ position: 'relative' }}>
          {/* Wishlist & Alert buttons overlay */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 20
          }}>
            <button
              onClick={handleWishlistToggle}
              title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: isInWishlist ? 'rgba(255, 107, 107, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                color: isInWishlist ? 'white' : 'var(--ink)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isInWishlist ? '❤️' : '🤍'}
            </button>
            
            <button
              onClick={handleCreateAlert}
              title="Get notified when restocked"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.95)',
                color: 'var(--ink)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🔔
            </button>
          </div>

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
            {(!product.quantity || product.quantity <= 0) ? (
              <button
                className="btn wcc-btn"
                style={{ 
                  pointerEvents: 'all',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 11,
                  display: 'inline-flex',
                  flex: 1,
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6c757d, #95a5a6)',
                  color: 'white',
                  border: 'none'
                }}
                onClick={handleCreateAlert}
              >
                🔔 Get Alert
              </button>
            ) : (
              <button
                className="btn wcc-btn wcc-btn--grad"
                style={{ 
                  pointerEvents: 'all',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 11,
                  display: 'inline-flex',
                  flex: 1,
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Add to cart functionality - could integrate with Stripe or cart system
                  alert('Added to cart! (Cart system integration needed)')
                }}
              >
                Add to Cart
              </button>
            )}
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
    </>
  )
}