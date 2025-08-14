'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type Product = {
  id: string
  name: string
  price?: number | null
  ebayUrl?: string | null
  image?: string | null
  stripeLink?: string | null
  description?: string | null
  quantity?: number
  status?: 'live' | 'coming-soon' | 'draft'
  drop_date?: string | null
  released_date?: string | null
  show_in_new_releases?: boolean
}

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
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
          {product.image && (
            <div className="mb-6" style={{ maxWidth: '500px', margin: '0 auto 24px auto' }}>
              {(() => {
                // Check if image contains multiple URLs separated by commas
                const imageUrls = product.image.split(',').map(url => url.trim()).filter(url => url)
                const mainImage = imageUrls[0]
                const additionalImages = imageUrls.slice(1)
                
                return (
                  <div>
                    {/* Main Image */}
                    <div className="mb-4 wcc-thumb">
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="wcc-zoom"
                      />
                    </div>
                    
                    {/* Additional Images Thumbnail Gallery */}
                    {additionalImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {additionalImages.slice(0, 6).map((imgUrl, index) => (
                          <div 
                            key={index} 
                            className="wcc-thumb cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ height: '80px' }}
                            onClick={() => {
                              // Swap clicked image with main image
                              const newMainImage = imgUrl
                              const newImages = [newMainImage, mainImage, ...additionalImages.filter(url => url !== imgUrl)]
                              // Update the product image temporarily for display
                              const imageContainer = document.querySelector('.wcc-thumb img') as HTMLImageElement
                              if (imageContainer) {
                                imageContainer.src = newMainImage
                              }
                            }}
                          >
                            <img
                              src={imgUrl}
                              alt={`${product.name} - Image ${index + 2}`}
                              className="wcc-zoom"
                              style={{ height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ))}
                        {additionalImages.length > 6 && (
                          <div 
                            className="flex items-center justify-center"
                            style={{ 
                              height: '80px',
                              background: 'linear-gradient(135deg, rgba(199,163,255,.15), rgba(94,208,192,.15))',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: 'var(--wcc-muted)'
                            }}
                          >
                            +{additionalImages.length - 6} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}
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
            {product.ebayUrl && (
              <a
                href={product.ebayUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center font-bold text-lg transition-all duration-300 hover:scale-105 text-decoration-none"
                style={{
                  padding: '16px 24px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, var(--wcc-teal), var(--wcc-grad-c))',
                  color: '#0b0b0f',
                  boxShadow: '0 12px 28px rgba(94,208,192,.25)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                🏪 View on eBay
              </a>
            )}
            <button
              onClick={onClose}
              className="font-bold text-lg transition-all duration-300 hover:scale-105"
              style={{
                padding: '16px 24px',
                borderRadius: '999px',
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
    return createPortal(modalContent, document.body)
  }

  return modalContent
}