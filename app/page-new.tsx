'use client'

import { useEffect, useState, useRef } from 'react'
import ProductCard from '../components/ProductCard'
import CountdownTimer from '../components/CountdownTimer'
import RecentlySoldBanner from '../components/RecentlySoldBanner'
import { Listing } from '../lib/listings'

// Scrollable section with navigation arrows component
function ScrollableSection({ children, className = "wcc-scroll" }: { children: React.ReactNode, className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScroll()
    }, 100)
    
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll)
      
      const handleResize = () => checkScroll()
      window.addEventListener('resize', handleResize)
      
      return () => {
        clearTimeout(timer)
        scrollElement.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', handleResize)
      }
    }
    
    return () => clearTimeout(timer)
  }, [children])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
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
            zIndex: 100,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: 'var(--ink)',
            transition: 'all 0.3s ease'
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
            zIndex: 100,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: 'var(--ink)',
            transition: 'all 0.3s ease'
          }}
        >
          →
        </button>
      )}

      <div
        ref={scrollRef}
        className={className}
        style={{
          display: 'flex',
          gap: '2px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Listing[]>([])
  const [inStockProducts, setInStockProducts] = useState<Listing[]>([])
  const [comingSoonProducts, setComingSoonProducts] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const cardColors = ['#FFE5B4', '#E5F3E5', '#E5E5FF', '#FFE5E5', '#F0E5FF']
  const emojis = ['🎁', '✨', '🌟', '💫', '🎈', '🎉', '🎊', '🎀', '💝', '🌈']

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        
        // Fetch all product sections in parallel
        const [featuredRes, inStockRes, comingSoonRes] = await Promise.all([
          fetch('/api/featured'),
          fetch('/api/in-stock'),
          fetch('/api/preview')
        ])

        if (featuredRes.ok) {
          const featured = await featuredRes.json()
          setFeaturedProducts(featured)
        }

        if (inStockRes.ok) {
          const inStock = await inStockRes.json()
          setInStockProducts(inStock)
        }

        if (comingSoonRes.ok) {
          const comingSoon = await comingSoonRes.json()
          setComingSoonProducts(comingSoon)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const getRandomColor = (index: number) => cardColors[index % cardColors.length]
  const getRandomEmoji = (index: number) => emojis[index % emojis.length]

  return (
    <main className="wcc-home">
      {/* Hero Section - Keep as-is */}
      <section className="wcc-hero">
        <div className="wcc-hero-bg">
          <div className="wcc-hero-content">
            <h1 className="wcc-hero-title">
              <span className="wcc-hero-brand">West Coast Collectibles</span>
              <span className="wcc-hero-tagline">Premium Pop Culture Treasures</span>
            </h1>
            <p className="wcc-hero-description">
              Discover rare and authentic collectibles from the world's most beloved franchises. 
              From limited edition figures to exclusive memorabilia, find your next treasure here.
            </p>
            <div className="wcc-hero-cta">
              <a href="#featured" className="wcc-btn wcc-btn--primary">
                Shop Featured Items
              </a>
              <a href="#in-stock" className="wcc-btn wcc-btn--secondary">
                Browse All Products
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="wcc-container">
        {/* Recently Sold Banner */}
        <RecentlySoldBanner />

        {/* Featured Highlights Section */}
        {featuredProducts.length > 0 && (
          <section id="featured" className="wcc-section">
            <div className="wcc-section-header">
              <h2 className="wcc-section-title">
                ⭐ Featured Highlights
              </h2>
              <p className="wcc-section-subtitle">
                Hand-picked premium collectibles and must-have items
              </p>
            </div>
            
            <div className="wcc-grid wcc-grid--featured">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  cardColor={getRandomColor(index)}
                  randomEmoji={getRandomEmoji(index)}
                />
              ))}
            </div>
          </section>
        )}

        {/* In Stock / Shop Now Section */}
        {inStockProducts.length > 0 && (
          <section id="in-stock" className="wcc-section">
            <div className="wcc-section-header">
              <h2 className="wcc-section-title">
                🛒 Shop Now - In Stock
              </h2>
              <p className="wcc-section-subtitle">
                Ready to ship immediately • All items in stock
              </p>
            </div>
            
            <ScrollableSection>
              {inStockProducts.map((product, index) => (
                <div key={product.id} style={{ flexShrink: 0, width: '350px' }}>
                  <ProductCard
                    product={product}
                    cardColor={getRandomColor(index)}
                    randomEmoji={getRandomEmoji(index)}
                  />
                </div>
              ))}
            </ScrollableSection>
          </section>
        )}

        {/* Coming Soon Section */}
        {comingSoonProducts.length > 0 && (
          <section id="coming-soon" className="wcc-section">
            <div className="wcc-section-header">
              <h2 className="wcc-section-title">
                🔮 Coming Soon
              </h2>
              <p className="wcc-section-subtitle">
                Get notified when these exciting new items drop
              </p>
            </div>
            
            <ScrollableSection>
              {comingSoonProducts.map((product, index) => (
                <div key={product.id} style={{ flexShrink: 0, width: '350px' }}>
                  <ProductCard
                    product={product}
                    cardColor={getRandomColor(index)}
                    randomEmoji={getRandomEmoji(index)}
                  />
                </div>
              ))}
            </ScrollableSection>
          </section>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="wcc-loading">
            <div className="wcc-loading-spinner"></div>
            <p>Loading amazing collectibles...</p>
          </div>
        )}

        {/* Why Choose Us / Trust Section - Keep as-is */}
        <section className="wcc-trust wcc-section">
          <div className="wcc-section-header">
            <h2 className="wcc-section-title">Why Choose West Coast Collectibles?</h2>
          </div>
          
          <div className="wcc-trust-grid">
            <div className="wcc-trust-item">
              <div className="wcc-trust-icon">🔒</div>
              <h3>100% Authentic</h3>
              <p>Every item is verified authentic. We guarantee the quality and authenticity of all our collectibles.</p>
            </div>
            <div className="wcc-trust-item">
              <div className="wcc-trust-icon">🚚</div>
              <h3>Fast & Secure Shipping</h3>
              <p>Quick processing and secure packaging from Santa Monica, CA. Your treasures arrive safely.</p>
            </div>
            <div className="wcc-trust-item">
              <div className="wcc-trust-icon">💬</div>
              <h3>Expert Support</h3>
              <p>Our collectibles experts are here to help you find exactly what you're looking for.</p>
            </div>
            <div className="wcc-trust-item">
              <div className="wcc-trust-icon">⭐</div>
              <h3>Collector Approved</h3>
              <p>Trusted by collectors worldwide for rare finds and competitive prices.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}