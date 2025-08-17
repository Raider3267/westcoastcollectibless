'use client'

import { useState } from 'react'
import ProductModal from './ProductModal'
import DetailsButton from './DetailsButton'
import ImageCarousel from './ImageCarousel'

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
}

interface ProductCardProps {
  product: Product
  cardColor: string
  randomEmoji: string
}

export default function ProductCard({ product, cardColor, randomEmoji }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const isStripe = Boolean(product.stripeLink)
  
  // Extract brand name from title
  const extractBrand = (title: string) => {
    const brandPatterns = ['POP MART', 'Labubu', 'Skullpanda']
    for (const brand of brandPatterns) {
      if (title.startsWith(brand)) {
        return {
          brand,
          titleWithoutBrand: title.slice(brand.length).trim().replace(/^[-–—×:]/, '').trim()
        }
      }
    }
    // If no brand found, use first word as brand
    const words = title.split(/[\s×\-–—:]/);
    const brand = words[0] || '';
    const titleWithoutBrand = title.slice(brand.length).trim().replace(/^[-–—×:]/, '').trim();
    return { brand, titleWithoutBrand };
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
        
        <div className="product-thumb wcc-thumb">
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
          
          <div className="wcc-actions" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
            <a
              className="btn wcc-btn wcc-btn--grad"
              href={product.ebayUrl || 'https://www.ebay.com/usr/westcoastcollectibless'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                pointerEvents: 'all',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 11,
                textDecoration: 'none',
                display: 'inline-block'
              }}
              onMouseDown={() => console.log('eBay mousedown')}
              onMouseUp={() => console.log('eBay mouseup')} 
              onClick={(e) => {
                console.log('eBay link clicked:', product.ebayUrl)
                window.open(product.ebayUrl || 'https://www.ebay.com/usr/westcoastcollectibless', '_blank')
              }}
            >
              View on eBay
            </a>
            <button 
              type="button"
              className="btn wcc-btn"
              style={{ 
                pointerEvents: 'all',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 11
              }}
              onClick={(e) => {
                console.log('Opening modal for product:', product.name)
                console.log('Product data:', product)
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