'use client'

import { useState, useEffect, useRef } from 'react'
import { Listing } from '../lib/listings'
import ProductCard from './ProductCard'

interface RelatedProductsProps {
  currentProduct: Listing
  allProducts: Listing[]
}

interface Bundle {
  id: string
  name: string
  products: Listing[]
  discount: number
  originalPrice: number
  bundlePrice: number
}

// Scrollable section with navigation arrows component
function ScrollableSection({ children, className = "wcc-scroll" }: { children: React.ReactNode, className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll)
      return () => scrollElement.removeEventListener('scroll', checkScroll)
    }
  }, [children])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Responsive scroll amounts based on screen size
      const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768
      const isMobile = window.innerWidth <= 768
      
      let scrollAmount = 352 // Desktop: 350px + 2px gap
      if (isTablet) {
        scrollAmount = 331 // Tablet: 330px + 1px gap
      } else if (isMobile) {
        scrollAmount = 291 // Mobile: 290px + 1px gap
      }
      
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          style={{
            position: 'absolute',
            left: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: 'var(--ink)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          ←
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          style={{
            position: 'absolute',
            right: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: 'var(--ink)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          →
        </button>
      )}

      {/* Scrollable Content */}
      <div ref={scrollRef} className={className}>
        {children}
      </div>
    </div>
  )
}

export default function RelatedProducts({ currentProduct, allProducts }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Listing[]>([])
  const [suggestedBundles, setSuggestedBundles] = useState<Bundle[]>([])

  useEffect(() => {
    // Find related products based on various criteria
    const findRelatedProducts = () => {
      const related: Listing[] = []
      
      // Extract brand/series from current product name
      const currentBrand = extractBrand(currentProduct.name)
      const currentSeries = extractSeries(currentProduct.name)
      
      allProducts.forEach(product => {
        if (product.id === currentProduct.id) return
        
        const productBrand = extractBrand(product.name)
        const productSeries = extractSeries(product.name)
        
        let relevanceScore = 0
        
        // Same brand/series gets highest score
        if (currentBrand && productBrand === currentBrand) relevanceScore += 10
        if (currentSeries && productSeries === currentSeries) relevanceScore += 8
        
        // Similar price range
        if (currentProduct.price && product.price) {
          const priceDiff = Math.abs(currentProduct.price - product.price)
          if (priceDiff < 20) relevanceScore += 5
          else if (priceDiff < 50) relevanceScore += 3
        }
        
        // Similar keywords in name/description
        const currentKeywords = extractKeywords(currentProduct.name + ' ' + (currentProduct.description || ''))
        const productKeywords = extractKeywords(product.name + ' ' + (product.description || ''))
        const commonKeywords = currentKeywords.filter(k => productKeywords.includes(k))
        relevanceScore += commonKeywords.length * 2
        
        if (relevanceScore > 3) {
          related.push({ ...product, relevanceScore } as Listing & { relevanceScore: number })
        }
      })
      
      // Sort by relevance and take top 6
      return related
        .sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore)
        .slice(0, 6)
    }
    
    // Generate bundle suggestions
    const generateBundles = (related: Listing[]) => {
      const bundles: Bundle[] = []
      
      // Create "Complete the Set" bundle
      const sameSeriesProducts = related.filter(p => 
        extractSeries(p.name) === extractSeries(currentProduct.name)
      ).slice(0, 3)
      
      if (sameSeriesProducts.length >= 2) {
        const bundleProducts = [currentProduct, ...sameSeriesProducts]
        const originalPrice = bundleProducts.reduce((sum, p) => sum + (p.price || 0), 0)
        const discount = 15 // 15% discount
        const bundlePrice = originalPrice * (1 - discount / 100)
        
        bundles.push({
          id: 'complete-set',
          name: `Complete the ${extractSeries(currentProduct.name) || 'Collection'} Set`,
          products: bundleProducts,
          discount,
          originalPrice,
          bundlePrice
        })
      }
      
      // Create "Collector's Choice" bundle
      const collectorBundle = related.slice(0, 2)
      if (collectorBundle.length === 2) {
        const bundleProducts = [currentProduct, ...collectorBundle]
        const originalPrice = bundleProducts.reduce((sum, p) => sum + (p.price || 0), 0)
        const discount = 10 // 10% discount
        const bundlePrice = originalPrice * (1 - discount / 100)
        
        bundles.push({
          id: 'collectors-choice',
          name: "Collector's Choice Bundle",
          products: bundleProducts,
          discount,
          originalPrice,
          bundlePrice
        })
      }
      
      return bundles
    }
    
    const related = findRelatedProducts()
    setRelatedProducts(related)
    setSuggestedBundles(generateBundles(related))
  }, [currentProduct, allProducts])
  
  const extractBrand = (name: string): string => {
    const brands = ['POP MART', 'Labubu', 'Skullpanda', 'MOLLY', 'DIMOO', 'Crybaby']
    for (const brand of brands) {
      if (name.toLowerCase().includes(brand.toLowerCase())) {
        return brand
      }
    }
    return name.split(' ')[0] || ''
  }
  
  const extractSeries = (name: string): string => {
    const series = ['fairy tale', 'space', 'halloween', 'christmas', 'summer', 'winter']
    for (const s of series) {
      if (name.toLowerCase().includes(s)) {
        return s
      }
    }
    return ''
  }
  
  const extractKeywords = (text: string): string[] => {
    return text.toLowerCase()
      .split(/[\s,.-]+/)
      .filter(word => word.length > 2 && !['the', 'and', 'for', 'with'].includes(word))
  }
  
  const cardColors = [
    'from-pop-pink/20 to-pop-orange/20',
    'from-pop-teal/20 to-pop-blue/20', 
    'from-pop-lime/20 to-pop-yellow/20',
    'from-pop-purple/20 to-pop-pink/20',
    'from-pop-orange/20 to-pop-teal/20',
    'from-pop-blue/20 to-pop-purple/20'
  ]
  
  if (relatedProducts.length === 0 && suggestedBundles.length === 0) {
    return null
  }
  
  return (
    <section className="luxury-section" style={{ 
      background: 'linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '40%',
        height: '140%',
        background: 'radial-gradient(circle, rgba(247,231,195,.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      
      <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        {/* Bundle Suggestions */}
        {suggestedBundles.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <div className="luxury-eyebrow" style={{ marginBottom: '16px' }}>Special Offers</div>
            <h2 style={{ 
              fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', 
              margin: '0 0 24px', 
              fontWeight: 800,
              color: 'var(--ink)'
            }}>
              🎁 Bundle & Save
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              {suggestedBundles.map(bundle => (
                <div key={bundle.id} className="luxury-card accent-gold" style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>
                      {bundle.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 800, 
                        color: '#ff8b2a' 
                      }}>
                        ${bundle.bundlePrice.toFixed(2)}
                      </span>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        color: 'var(--muted)', 
                        textDecoration: 'line-through' 
                      }}>
                        ${bundle.originalPrice.toFixed(2)}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                        color: 'white',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        Save {bundle.discount}%
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '16px' }}>
                      Get {bundle.products.length} items together and save ${(bundle.originalPrice - bundle.bundlePrice).toFixed(2)}!
                    </p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                    {bundle.products.map((product, index) => (
                      <div key={product.id} style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          background: product.image ? `url(${product.image})` : 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          margin: '0 auto 4px',
                          border: product.id === currentProduct.id ? '2px solid var(--accent-teal)' : '1px solid var(--line)'
                        }} />
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                          {product.name.length > 12 ? product.name.substring(0, 12) + '...' : product.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    className="luxury-btn grad"
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: '999px',
                      border: 'none',
                      background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-teal))',
                      color: '#0b0b0f',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    🛒 Add Bundle to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="luxury-eyebrow" style={{ marginBottom: '16px' }}>You Might Also Like</div>
            <h2 style={{ 
              fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', 
              margin: '0 0 24px', 
              fontWeight: 800,
              color: 'var(--ink)'
            }}>
              🔍 Collectors Also Viewed
            </h2>
            
            <ScrollableSection className="wcc-scroll">
              {relatedProducts.map((product, index) => {
                const cardColor = cardColors[index % cardColors.length]
                const toyEmojis = ['🧸', '🎨', '🎪', '🎭', '🎲', '🚀', '🌟', '💎', '🎯', '⭐']
                const randomEmoji = toyEmojis[index % toyEmojis.length]
                
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cardColor={cardColor}
                    randomEmoji={randomEmoji}
                  />
                )
              })}
            </ScrollableSection>
          </div>
        )}
      </div>
    </section>
  )
}