'use client'
// app/page.tsx
import { SITE } from '../lib/products'
import { Listing } from '../lib/listings'
import ProductCard from '../components/ProductCard'
import FilterBar, { FilterOptions } from '../components/FilterBar'
import VIPSection from '../components/VIPSection'
import { useEffect, useState, useRef } from 'react'

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
    // Use setTimeout to ensure content is rendered before checking scroll
    const timer = setTimeout(() => {
      checkScroll()
    }, 100)
    
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll)
      
      // Also check on window resize
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
      {/* Left Arrow - small circular positioned outside */}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          ←
        </button>
      )}

      {/* Right Arrow - small circular positioned outside */}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
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

// New Premium Hero Section Component
function HeroSection() {
  const [currentTagline, setCurrentTagline] = useState(0)
  const [nextDrop, setNextDrop] = useState<Listing | null>(null)
  const [spotlightItem, setSpotlightItem] = useState<Listing | null>(null)
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number} | null>(null)
  const [scrollY, setScrollY] = useState(0)

  // Collector-focused taglines
  const taglines = [
    "For serious collectors worldwide.",
    "Curated exclusives. No compromises.",
    "Luxury toys. Limited drops. Legendary finds."
  ]

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    // Fetch preview products for Next Drop countdown
    const fetchNextDrop = async () => {
      try {
        const previewResponse = await fetch('/api/preview')
        const previewItems = await previewResponse.json()
        
        // Find the soonest PREVIEW item with release_at
        const upcomingItems = previewItems
          .filter((item: Listing) => item.release_at)
          .sort((a: Listing, b: Listing) => new Date(a.release_at!).getTime() - new Date(b.release_at!).getTime())
        
        if (upcomingItems.length > 0) {
          setNextDrop(upcomingItems[0])
        } else {
          // Fallback to spotlight collectible
          const featuredResponse = await fetch('/api/featured')
          const featuredItems = await featuredResponse.json()
          if (featuredItems.length > 0) {
            setSpotlightItem(featuredItems[0])
          }
        }
      } catch (error) {
        console.error('Error fetching next drop:', error)
        // Fallback to spotlight
        try {
          const featuredResponse = await fetch('/api/featured')
          const featuredItems = await featuredResponse.json()
          if (featuredItems.length > 0) {
            setSpotlightItem(featuredItems[0])
          }
        } catch (fallbackError) {
          console.error('Error fetching featured items:', error)
        }
      }
    }

    fetchNextDrop()
  }, [])

  // Rotating tagline effect
  useEffect(() => {
    if (prefersReducedMotion) return

    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length)
    }, 4500) // 4.5 seconds

    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  // Countdown timer
  useEffect(() => {
    if (!nextDrop?.release_at) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const dropTime = new Date(nextDrop.release_at!).getTime()
      const difference = dropTime - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        
        setTimeLeft({ days, hours, minutes })
      } else {
        setTimeLeft(null)
        // Item should be live now
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [nextDrop])

  // Parallax scroll effect
  useEffect(() => {
    if (prefersReducedMotion) return

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [prefersReducedMotion])

  return (
    <section style={{ 
      position: 'relative', 
      height: '100vh', 
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center'
    }}>
      {/* Video Background with Parallax */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          zIndex: -1,
          transform: `translate(-50%, -50%) translateY(${prefersReducedMotion ? 0 : scrollY * 0.05}px)`,
          objectFit: 'cover',
          transition: prefersReducedMotion ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <source src="/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for better text readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)',
        zIndex: 0
      }} />

      {/* Bottom vignette for smooth handoff */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '120px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
        zIndex: 1
      }} />

      {/* Big Centered Brand Wordmark */}
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(4rem, 12vw, 16rem)',
          fontWeight: 900,
          color: 'rgba(255,255,255,0.12)',
          letterSpacing: '-0.02em',
          textAlign: 'center',
          zIndex: 0,
          pointerEvents: 'none',
          userSelect: 'none',
          filter: 'blur(0.5px)',
          textShadow: '0 0 40px rgba(255,255,255,0.1)'
        }}
      >
        WestCoastCollectibles
      </div>

      {/* Hero Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        color: 'white', 
        textAlign: 'left', 
        maxWidth: '750px', 
        padding: '0 60px',
        width: '100%'
      }}>
        <div className="luxury-eyebrow" style={{ 
          color: 'rgba(255,255,255,0.9)',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          marginBottom: '20px',
          fontSize: '0.9rem'
        }}>
          Curated • Limited • Authentic
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(2.8rem, 4.5vw, 4.5rem)', 
          margin: '0 0 28px', 
          lineHeight: 1.1, 
          fontWeight: 800,
          color: 'white',
          textShadow: '0 4px 8px rgba(0,0,0,0.4)',
          animation: prefersReducedMotion ? 'none' : 'heroShimmer 12s ease-in-out infinite'
        }}>
          <span className="floating-collectible" style={{ display: 'inline-block' }}>🎯</span> Luxury Designer Toys with Playful Energy
        </h1>
        
        <p style={{ 
          margin: '0 0 16px', 
          fontSize: '1.4rem',
          color: 'rgba(255,255,255,0.95)',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          lineHeight: 1.5,
          fontWeight: 600,
          maxWidth: '620px'
        }}>
          Limited drops. Authentic releases. For serious collectors.
        </p>

        {/* Rotating Collector Tagline */}
        <div 
          aria-live="polite"
          style={{ 
            margin: '0 0 20px', 
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.8)',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            fontWeight: 500,
            height: '1.5rem',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span style={{
            opacity: prefersReducedMotion ? 1 : 0.9,
            transition: prefersReducedMotion ? 'none' : 'opacity 0.5s ease-in-out',
            animation: prefersReducedMotion ? 'none' : 'taglineFade 4.5s ease-in-out infinite'
          }}>
            {taglines[currentTagline]}
          </span>
        </div>

        {/* Micro Trust Line */}
        <div style={{
          margin: '0 0 32px',
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
            </svg>
            Authenticity Verified
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3,4A2,2 0 0,0 1,6V8H23V6A2,2 0 0,0 21,4H3M1,19A2,2 0 0,0 3,21H10.84L15.82,16H23V10H1V19Z"/>
            </svg>
            Fast Shipping
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12,3C17.5,3 22,6.58 22,11C22,15.42 17.5,19 12,19C10.76,19 9.57,18.82 8.47,18.5C5.55,21 2,21 2,21C4.33,18.67 4.7,17.1 4.75,16.5C3.05,15.07 2,13.13 2,11C2,6.58 6.5,3 12,3Z"/>
            </svg>
            Collector Support
          </span>
        </div>

        {/* Purpose Block: Next Drop Countdown OR Spotlight Collectible */}
        {nextDrop && timeLeft ? (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '20px',
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 600 }}>
              Next Drop
            </div>
            <div style={{ fontSize: '1.2rem', color: 'white', marginBottom: '12px', fontWeight: 700 }}>
              {nextDrop.name}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '16px',
              fontSize: '1rem',
              color: 'white',
              fontWeight: 600
            }}>
              <time dateTime={nextDrop.release_at}>
                {timeLeft.days > 0 && `${timeLeft.days}d `}
                {timeLeft.hours}h {timeLeft.minutes}m
              </time>
            </div>
            <button
              onClick={() => {
                // Open notify/signup flow
                const notifyEvent = new CustomEvent('show-auth-modal')
                window.dispatchEvent(notifyEvent)
              }}
              style={{
                background: 'linear-gradient(135deg, var(--wcc-teal), var(--wcc-lilac))',
                color: '#0b0b0f',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Set a reminder
            </button>
          </div>
        ) : spotlightItem ? (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '20px',
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!prefersReducedMotion) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
          >
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginBottom: '12px', fontWeight: 600 }}>
              Spotlight Collectible
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {spotlightItem.image && (
                <img 
                  src={spotlightItem.image.split(',')[0].trim()} 
                  alt={spotlightItem.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.1rem', color: 'white', marginBottom: '4px', fontWeight: 600 }}>
                  {spotlightItem.name}
                </div>
                {spotlightItem.price && (
                  <div style={{ fontSize: '1rem', color: '#5ED0C0', fontWeight: 700 }}>
                    ${spotlightItem.price}
                  </div>
                )}
                <a
                  href={`#product-${spotlightItem.id}`}
                  style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'underline',
                    marginTop: '8px',
                    display: 'inline-block'
                  }}
                >
                  View details
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes heroShimmer {
          0%, 100% { text-shadow: 0 4px 8px rgba(0,0,0,0.4); }
          50% { text-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.1); }
        }

        @keyframes taglineFade {
          0%, 20% { opacity: 0.9; }
          10% { opacity: 1; }
          80%, 100% { opacity: 0.9; }
        }

        @keyframes floatingCollectible {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }

        .floating-collectible {
          animation: floatingCollectible 3s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-collectible {
            animation: none;
          }
        }

        /* Responsive Layout */
        @media (max-width: 1024px) {
          .hero-content {
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .hero-content {
            padding: 0 30px;
          }
          
          .hero-content h1 {
            font-size: clamp(2.2rem, 8vw, 3rem) !important;
          }
          
          .hero-wordmark {
            font-size: clamp(2.5rem, 8vw, 6rem) !important;
            opacity: 0.08 !important;
          }
        }
      `}</style>
    </section>
  )
}

function FeaturedHighlightsSection() {
  const [featuredProducts, setFeaturedProducts] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTagline, setCurrentTagline] = useState(0)

  const taglines = [
    "Rare Finds",
    "Curated Collectibles", 
    "This Week's Highlights",
    "Premium Selection",
    "Exclusive Items"
  ]

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/featured')
        if (response.ok) {
          const data = await response.json()
          setFeaturedProducts(data)
        }
      } catch (error) {
        console.error('Failed to load featured products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeaturedProducts()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])


  // Don't show section if no featured products
  if (!loading && featuredProducts.length === 0) {
    return null
  }

  const cardColors = [
    'from-pop-pink/20 to-pop-orange/20',
    'from-pop-teal/20 to-pop-blue/20', 
    'from-pop-lime/20 to-pop-yellow/20',
    'from-pop-purple/20 to-pop-pink/20'
  ]

  return (
    <section className="featured-showcase-section" id="featured">
      {/* Luxury Fade Background */}
      <div className="featured-luxury-backdrop"></div>
      
      {/* Frosted Panel */}
      <div className="featured-frosted-panel"></div>
      
      {/* Subtle Background Decorations */}
      <div className="featured-bg-decoration featured-bg-1"></div>
      <div className="featured-bg-decoration featured-bg-2"></div>
      
      <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '40px 20px 20px', position: 'relative', zIndex: 2 }}>
        {/* Premium Marquee Header */}
        <div className="featured-marquee-header">
          <h2 className="featured-title">
            <span className="featured-title-text">✨ FEATURED COLLECTION ✨</span>
          </h2>
          <div className="featured-tagline-container">
            <span className="featured-tagline" key={currentTagline}>
              {taglines[currentTagline]}
            </span>
          </div>
        </div>
        
        <p style={{ fontSize: '1rem', color: 'var(--wcc-muted)', margin: '0 0 32px', maxWidth: '600px', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
          Hand-picked premium collectibles and must-have items from our curated collection.
        </p>
        
        <div className="featured-grid-container">
          {/* Elegant sparkling background */}
          <div className="featured-background-accent"></div>
          <div className="featured-sparkles-layer"></div>
          
          {loading ? (
            <div className="featured-grid featured-grid-loading">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="luxury-card accent-teal" style={{ opacity: 0.6 }}>
                  <div className="luxury-thumb">
                    <div className="luxury-thumb-inner" style={{ background: '#f0f0f0' }}></div>
                  </div>
                  <div className="luxury-body">
                    <div style={{ background: '#f0f0f0', height: '20px', borderRadius: '4px', marginBottom: '8px' }}></div>
                    <div style={{ background: '#f0f0f0', height: '16px', borderRadius: '4px', width: '60%' }}></div>
                  </div>
                  <div className="luxury-foot">
                    <div style={{ background: '#f0f0f0', height: '20px', width: '40px', borderRadius: '4px' }}></div>
                    <div style={{ background: '#f0f0f0', height: '32px', width: '60px', borderRadius: '999px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`featured-grid featured-grid-${featuredProducts.length}`}>
              {featuredProducts.map((product, index) => {
                const cardColor = cardColors[index % cardColors.length]
                const featuredEmojis = ['⭐', '🌟', '✨', '💎']
                const randomEmoji = featuredEmojis[index % featuredEmojis.length]

                return (
                  <div 
                    key={product.id}
                    className="featured-card-wrapper"
                  >
                    <ProductCard
                      product={product}
                      cardColor={cardColor}
                      randomEmoji={randomEmoji}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        <style jsx>{`
          /* Featured Showcase Section - Premium Spotlight */
          .featured-showcase-section {
            position: relative;
            overflow: hidden;
            padding: 0px 0 40px;
            background: linear-gradient(180deg, 
              rgba(255, 255, 255, 0.95) 0%, 
              rgba(255, 252, 240, 0.9) 50%, 
              rgba(250, 248, 235, 0.85) 100%
            );
            z-index: 10;
          }

          .featured-luxury-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(180deg, 
              rgba(255, 255, 255, 0.98) 0%, 
              rgba(255, 251, 235, 0.95) 100%
            );
            z-index: 0;
          }

          .featured-frosted-panel {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(20px);
            z-index: 1;
          }

          .featured-bg-decoration {
            position: absolute;
            border-radius: 50%;
            filter: blur(40px);
            z-index: 0;
          }

          .featured-bg-1 {
            top: -10%;
            left: -5%;
            width: 30%;
            height: 120%;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%);
          }

          .featured-bg-2 {
            bottom: -10%;
            right: -5%;
            width: 25%;
            height: 100%;
            background: radial-gradient(circle, rgba(255, 245, 205, 0.1) 0%, transparent 70%);
          }
          
          /* Animated Divider */
          .featured-divider-container {
            display: flex;
            justify-content: center;
            margin-bottom: 40px;
            position: relative;
          }
          
          .featured-divider {
            width: 200px;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
            position: relative;
            overflow: hidden;
          }
          
          .divider-shimmer {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
              transparent 0%, 
              rgba(255, 215, 0, 0.8) 50%, 
              transparent 100%
            );
            animation: shimmerPass 8s ease-in-out infinite;
          }
          
          /* Premium Background Frame */
          .featured-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 0;
          }
          
          .backdrop-gradient {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(180deg, 
              rgba(199, 163, 255, 0.02) 0%,
              rgba(94, 208, 192, 0.015) 50%,
              rgba(247, 231, 195, 0.02) 100%
            );
          }
          
          .backdrop-vignette {
            position: absolute;
            top: -20px;
            left: -20px;
            right: -20px;
            bottom: -20px;
            background: radial-gradient(ellipse at center, 
              transparent 40%, 
              rgba(199, 163, 255, 0.008) 70%, 
              rgba(94, 208, 192, 0.012) 100%
            );
          }
          
          /* Premium Marquee Header */
          .featured-marquee-header {
            text-align: center;
            margin-bottom: 24px;
            position: relative;
          }
          
          .featured-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin: 0 0 20px;
          }
          
          .featured-title-text {
            font-size: clamp(2rem, 3.5vw, 2.8rem);
            font-weight: 900;
            letter-spacing: 0.05em;
            background: linear-gradient(135deg, #b8860b 0%, #daa520 50%, #b8860b 100%);
            background-size: 200% 200%;
            animation: titleShimmer 12s ease-in-out infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 20px rgba(184, 134, 11, 0.2);
            position: relative;
          }
          
          .featured-title-text::before {
            content: '';
            position: absolute;
            top: 0;
            left: -20px;
            right: -20px;
            bottom: 0;
            background: linear-gradient(90deg, 
              transparent 0%, 
              rgba(184, 134, 11, 0.08) 50%, 
              transparent 100%
            );
            opacity: 0;
            animation: titleShimmerPass 12s ease-in-out infinite;
          }
          
          .featured-title-text::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, transparent, #ffd700, transparent);
            border-radius: 2px;
            opacity: 0.6;
          }
          
          .featured-count-badge {
            font-size: 0.8rem;
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            color: #333;
            padding: 8px 12px;
            border-radius: 999px;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
            animation: pulse 2s ease-in-out infinite;
          }
          
          .featured-tagline-container {
            height: 24px;
            overflow: hidden;
            position: relative;
          }
          
          .featured-tagline {
            font-size: 1.1rem;
            font-weight: 600;
            color: #6b7280;
            letter-spacing: 0.02em;
            animation: fadeInUp 0.8s ease-out;
            display: block;
          }
          
          /* Premium Background Treatment */
          .featured-grid-container {
            position: relative;
            padding: 30px 0 30px;
            overflow: visible;
          }
          
          .featured-background-accent {
            position: absolute;
            top: -50px;
            left: -50px;
            right: -50px;
            bottom: -50px;
            background: 
              radial-gradient(circle at 25% 25%, rgba(199, 163, 255, 0.02) 0%, transparent 40%),
              radial-gradient(circle at 75% 75%, rgba(94, 208, 192, 0.02) 0%, transparent 40%),
              linear-gradient(135deg, rgba(247, 231, 195, 0.015) 0%, rgba(199, 163, 255, 0.01) 100%);
            border-radius: 32px;
            pointer-events: none;
            z-index: 0;
            animation: breathe 8s ease-in-out infinite;
          }
          
          /* Elegant Sparkling Layer */
          .featured-sparkles-layer {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
          }
          
          .featured-sparkles-layer::before {
            content: '';
            position: absolute;
            top: 15%;
            left: 12%;
            width: 3px;
            height: 3px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, transparent 70%);
            border-radius: 50%;
            animation: elegantSparkle 4s ease-in-out infinite;
            box-shadow: 0 0 6px rgba(255, 215, 0, 0.3);
          }
          
          .featured-sparkles-layer::after {
            content: '';
            position: absolute;
            top: 65%;
            right: 18%;
            width: 2px;
            height: 2px;
            background: radial-gradient(circle, rgba(192, 192, 192, 0.9) 0%, transparent 70%);
            border-radius: 50%;
            animation: elegantSparkle 5s ease-in-out infinite 1.5s;
            box-shadow: 0 0 4px rgba(192, 192, 192, 0.4);
          }
          
          /* Additional sparkles using container pseudo-elements */
          .featured-grid-container::before {
            content: '';
            position: absolute;
            top: 35%;
            right: 25%;
            width: 2.5px;
            height: 2.5px;
            background: radial-gradient(circle, rgba(245, 245, 220, 0.7) 0%, transparent 70%);
            border-radius: 50%;
            animation: elegantSparkle 6s ease-in-out infinite 2s;
            box-shadow: 0 0 5px rgba(245, 245, 220, 0.3);
            z-index: 0;
          }
          
          .featured-grid-container::after {
            content: '';
            position: absolute;
            bottom: 25%;
            left: 20%;
            width: 1.5px;
            height: 1.5px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%);
            border-radius: 50%;
            animation: elegantSparkle 7s ease-in-out infinite 3.5s;
            box-shadow: 0 0 3px rgba(255, 215, 0, 0.2);
            z-index: 0;
          }
          
          /* Premium Grid */
          .featured-grid {
            display: grid;
            gap: 24px;
            justify-content: center;
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
          }
          
          /* Deluxe Hover Effects for Featured Cards Only */
          .featured-card-wrapper :global(.product-card) {
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            cursor: pointer;
            position: relative;
            will-change: transform, box-shadow;
          }
          
          .featured-card-wrapper :global(.product-card:hover) {
            transform: translateY(-18px) scale(1.035);
            box-shadow: 
              0 35px 70px rgba(0, 0, 0, 0.2),
              0 25px 50px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(184, 134, 11, 0.2),
              0 0 100px rgba(184, 134, 11, 0.15),
              0 0 200px rgba(255, 245, 205, 0.1);
            z-index: 15;
          }
          
          .featured-card-wrapper :global(.product-card::before) {
            content: '';
            position: absolute;
            top: -30px;
            left: -30px;
            right: -30px;
            bottom: -30px;
            background: radial-gradient(circle, 
              rgba(184, 134, 11, 0.06) 0%, 
              rgba(255, 245, 205, 0.04) 40%,
              transparent 70%
            );
            border-radius: 50%;
            opacity: 0;
            transition: all 0.6s ease-out;
            pointer-events: none;
            z-index: -1;
          }
          
          .featured-card-wrapper :global(.product-card:hover::before) {
            opacity: 1;
            animation: deluxeHaloGlow 1s ease-out;
          }

          .featured-card-wrapper :global(.product-card::after) {
            content: '';
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            background: linear-gradient(45deg, 
              rgba(184, 134, 11, 0.1) 0%,
              transparent 30%,
              transparent 70%,
              rgba(184, 134, 11, 0.1) 100%
            );
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.6s ease-out;
            pointer-events: none;
            z-index: -1;
          }
          
          .featured-card-wrapper :global(.product-card:hover::after) {
            opacity: 1;
            animation: deluxeRimGlow 1.2s ease-out;
          }
          
          /* Enhanced badge shimmer for Featured cards */
          .featured-card-wrapper :global(.luxury-badge),
          .featured-card-wrapper :global(.featured-badge) {
            position: relative;
            overflow: hidden;
          }
          
          .featured-card-wrapper :global(.luxury-badge::after),
          .featured-card-wrapper :global(.featured-badge::after) {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
              transparent 0%, 
              rgba(255, 255, 255, 0.3) 50%, 
              transparent 100%
            );
            animation: badgeSweep 12s ease-in-out infinite;
          }
          
          .featured-grid-loading {
            grid-template-columns: repeat(2, 350px);
          }
          
          .featured-grid-4 {
            grid-template-columns: repeat(2, 350px);
            grid-template-rows: repeat(2, auto);
          }
          
          .featured-grid-3 {
            grid-template-columns: repeat(3, 350px);
          }
          
          .featured-grid-2 {
            grid-template-columns: repeat(2, 350px);
          }
          
          .featured-grid-1 {
            grid-template-columns: 350px;
          }
          
          /* Animations */
          @keyframes titleShimmer {
            0%, 90%, 100% { background-position: 0% 50%; }
            95% { background-position: 100% 50%; }
          }
          
          @keyframes titleShimmerPass {
            0%, 90%, 100% { opacity: 0; }
            95% { opacity: 1; }
          }
          
          @keyframes deluxeHaloGlow {
            0% { 
              opacity: 0;
              transform: scale(0.8);
            }
            30% { 
              opacity: 0.6;
              transform: scale(1.1);
            }
            60% { 
              opacity: 0.9;
              transform: scale(1.3);
            }
            100% { 
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes deluxeRimGlow {
            0% { 
              opacity: 0;
              background: linear-gradient(45deg, 
                rgba(184, 134, 11, 0) 0%,
                transparent 50%,
                rgba(184, 134, 11, 0) 100%
              );
            }
            50% { 
              opacity: 0.8;
              background: linear-gradient(45deg, 
                rgba(184, 134, 11, 0.2) 0%,
                transparent 50%,
                rgba(184, 134, 11, 0.2) 100%
              );
            }
            100% { 
              opacity: 1;
              background: linear-gradient(45deg, 
                rgba(184, 134, 11, 0.1) 0%,
                transparent 30%,
                transparent 70%,
                rgba(184, 134, 11, 0.1) 100%
              );
            }
          }
          
          @keyframes shimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes shimmerPass {
            0%, 100% { left: -100%; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
          
          @keyframes badgeShimmer {
            0%, 90%, 100% { opacity: 0; }
            95% { opacity: 1; }
          }
          
          @keyframes sparkleGlow {
            0%, 100% { 
              opacity: 0.4; 
              transform: scale(1); 
            }
            50% { 
              opacity: 0.8; 
              transform: scale(1.1); 
            }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
          }
          
          @keyframes fadeInUp {
            from { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.02); opacity: 0.8; }
          }
          
          @keyframes elegantSparkle {
            0%, 100% { 
              opacity: 0.2;
              transform: scale(1);
              filter: brightness(1);
            }
            20% { 
              opacity: 0.6;
              transform: scale(1.3);
              filter: brightness(1.4);
            }
            40% { 
              opacity: 0.9;
              transform: scale(1.6);
              filter: brightness(1.8);
            }
            60% { 
              opacity: 0.6;
              transform: scale(1.2);
              filter: brightness(1.3);
            }
            80% { 
              opacity: 0.3;
              transform: scale(1);
              filter: brightness(1);
            }
          }
          
          @keyframes haloGlow {
            0% { 
              opacity: 0;
              transform: scale(0.8);
            }
            50% { 
              opacity: 0.6;
              transform: scale(1.1);
            }
            100% { 
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes premiumHaloGlow {
            0% { 
              opacity: 0;
              transform: scale(0.7);
            }
            30% { 
              opacity: 0.4;
              transform: scale(1.0);
            }
            60% { 
              opacity: 0.8;
              transform: scale(1.2);
            }
            100% { 
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes badgeSweep {
            0%, 95%, 100% { left: -100%; }
            97.5% { left: 100%; }
          }
          
          /* Responsive Design */
          @media (max-width: 1200px) {
            .featured-grid-4,
            .featured-grid-3 {
              grid-template-columns: repeat(2, 330px);
              grid-template-rows: auto;
            }
            
            .featured-title-text {
              font-size: clamp(1.8rem, 3vw, 2.4rem);
            }
          }
          
          @media (max-width: 768px) {
            .featured-showcase-section {
              margin: 40px 0;
            }
            
            .featured-divider {
              width: 150px;
            }
            
            .featured-grid {
              grid-template-columns: 1fr !important;
              grid-template-rows: auto !important;
              padding: 0 20px;
              max-width: 400px;
              gap: 20px;
            }
            
            .featured-grid-container {
              padding: 30px 0 20px;
            }
            
            .featured-background-accent {
              opacity: 0.3;
            }
            
            .featured-sparkles-layer::before,
            .featured-sparkles-layer::after,
            .featured-grid-container::before,
            .featured-grid-container::after {
              display: none;
            }
            
            .featured-marquee-header {
              margin-bottom: 30px;
              padding: 0 10px;
            }
            
            .featured-title-text {
              font-size: clamp(1.5rem, 5vw, 2rem);
              letter-spacing: 0.03em;
            }
            
            .featured-placeholder-card {
              width: 100%;
              max-width: 350px;
              height: 400px;
            }
            
            .featured-card-wrapper :global(.product-card:hover) {
              transform: translateY(-8px) scale(1.015);
              box-shadow: 
                0 15px 30px rgba(0, 0, 0, 0.1),
                0 0 40px rgba(255, 215, 0, 0.08),
                0 0 80px rgba(245, 245, 220, 0.04);
            }
            
            .backdrop-gradient,
            .backdrop-vignette {
              opacity: 0.5;
            }
          }
        `}</style>
      </div>
    </section>
  )
}

function ComingSoonProductsSection() {
  const [comingSoonProducts, setComingSoonProducts] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    const fetchComingSoonProducts = async () => {
      try {
        console.log('ComingSoon: Starting fetch...')
        const response = await fetch('/api/preview')
        console.log('ComingSoon: Response received:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('ComingSoon: Data parsed:', data.length, 'products')
          
          if (isMounted) {
            setComingSoonProducts(data)
            setLoading(false)
            console.log('ComingSoon: State updated')
          }
        } else {
          console.error('ComingSoon: Response not ok:', response.status)
          if (isMounted) {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('ComingSoon: Fetch failed:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    // Add a small delay to ensure component is mounted
    const timer = setTimeout(() => {
      fetchComingSoonProducts()
    }, 100)
    
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [])

  // Don't show section if no coming soon products
  if (!loading && comingSoonProducts.length === 0) {
    return null
  }

  const cardColors = [
    'from-pop-pink/20 to-pop-orange/20',
    'from-pop-teal/20 to-pop-blue/20', 
    'from-pop-lime/20 to-pop-yellow/20',
    'from-pop-purple/20 to-pop-pink/20',
    'from-pop-orange/20 to-pop-teal/20',
    'from-pop-blue/20 to-pop-purple/20'
  ]

  return (
    <section className="coming-soon-section">
      {/* Lilac/Indigo gradient background */}
      <div className="coming-soon-backdrop"></div>
      
      {/* Background decorations */}
      <div className="coming-soon-bg-decoration coming-soon-bg-1"></div>
      <div className="coming-soon-bg-decoration coming-soon-bg-2"></div>
      
      <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <div className="luxury-eyebrow" style={{ marginBottom: '8px' }}>🚀 Preview</div>
        <h2 style={{ 
          fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)', 
          margin: '0 0 12px', 
          fontWeight: 800,
          color: 'var(--wcc-ink)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⏰ Coming Soon
          {comingSoonProducts.length > 0 && (
            <span style={{
              fontSize: '0.7rem',
              background: 'linear-gradient(135deg, #8a2be2, #4b0082)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '999px',
              fontWeight: 600
            }}>
              {comingSoonProducts.length} PREVIEW
            </span>
          )}
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--wcc-muted)', margin: '0 0 24px', maxWidth: '600px' }}>
          Get early access to these upcoming releases. Add them to your wishlist and be notified when they launch!
        </p>
        {loading ? (
          <ScrollableSection>
            {[1, 2, 3].map((i) => (
              <div key={i} className="luxury-card accent-teal" style={{ opacity: 0.6 }}>
                <div className="luxury-thumb">
                  <div className="luxury-thumb-inner" style={{ background: '#f0f0f0' }}></div>
                </div>
                <div className="luxury-body">
                  <div style={{ background: '#f0f0f0', height: '20px', borderRadius: '4px', marginBottom: '8px' }}></div>
                  <div style={{ background: '#f0f0f0', height: '16px', borderRadius: '4px', width: '60%' }}></div>
                </div>
                <div className="luxury-foot">
                  <div style={{ background: '#f0f0f0', height: '20px', width: '40px', borderRadius: '4px' }}></div>
                  <div style={{ background: '#f0f0f0', height: '32px', width: '60px', borderRadius: '999px' }}></div>
                </div>
              </div>
            ))}
          </ScrollableSection>
        ) : (
          <ScrollableSection>
            {comingSoonProducts.map((product, index) => {
              const cardColor = cardColors[index % cardColors.length]
              const comingSoonEmojis = ['⏰', '🚀', '🔜', '✨', '🌟', '⭐', '💫', '🎯', '🎪', '🎨']
              const randomEmoji = comingSoonEmojis[index % comingSoonEmojis.length]

              return (
                <div key={product.id} style={{ position: 'relative' }}>
                  <ProductCard
                    product={product}
                    cardColor={cardColor}
                    randomEmoji={randomEmoji}
                  />
                </div>
              )
            })}
          </ScrollableSection>
        )}
      </div>

      <style jsx>{`
        .coming-soon-section {
          position: relative;
          overflow: hidden;
          padding: 44px 0 60px;
          z-index: 5;
        }

        .coming-soon-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            rgba(147, 112, 219, 0.08) 0%, 
            rgba(102, 51, 153, 0.1) 50%, 
            rgba(75, 0, 130, 0.08) 100%
          );
          z-index: 0;
        }

        .coming-soon-bg-decoration {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          z-index: 1;
        }

        .coming-soon-bg-1 {
          top: -15%;
          left: -10%;
          width: 35%;
          height: 130%;
          background: radial-gradient(circle, rgba(147, 112, 219, 0.12) 0%, transparent 70%);
        }

        .coming-soon-bg-2 {
          bottom: -15%;
          right: -10%;
          width: 30%;
          height: 120%;
          background: radial-gradient(circle, rgba(102, 51, 153, 0.1) 0%, transparent 70%);
        }

        .luxury-eyebrow {
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(102, 51, 153, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        /* Anticipation styling for cards */
        .coming-soon-section :global(.product-card) {
          position: relative;
          overflow: hidden;
        }

        .coming-soon-section :global(.product-card::before) {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            rgba(147, 112, 219, 0.02) 0%, 
            rgba(102, 51, 153, 0.03) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
          pointer-events: none;
        }

        .coming-soon-section :global(.product-card:hover::before) {
          opacity: 1;
        }

        .coming-soon-section :global(.product-card:hover) {
          transform: translateY(-8px);
          box-shadow: 
            0 20px 40px rgba(102, 51, 153, 0.15),
            0 10px 20px rgba(147, 112, 219, 0.1);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .coming-soon-section {
            padding: 40px 0 50px;
          }

          .coming-soon-bg-1,
          .coming-soon-bg-2 {
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  )
}


function CollectorAssuranceSection() {
  return (
    <section className="collector-assurance-section">
      {/* Faint gradient backdrop */}
      <div className="assurance-backdrop"></div>
      
      {/* Background decorations */}
      <div className="assurance-bg-decoration assurance-bg-1"></div>
      <div className="assurance-bg-decoration assurance-bg-2"></div>
      <div className="assurance-bg-decoration assurance-bg-3"></div>
      
      <div className="assurance-container">
        {/* Header */}
        <div className="assurance-header">
          <div className="luxury-eyebrow">Trusted by Collectors</div>
          <h2 className="assurance-title">Collector Assurance</h2>
          <p className="assurance-subtitle">
            We're collectors too. Here's how we protect your collection.
          </p>
        </div>
        
        {/* Assurance Cards */}
        <div className="assurance-grid">
          {/* Verified Authenticity */}
          <div className="assurance-card">
            <div className="card-icon-container">
              <svg className="card-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
              </svg>
            </div>
            <h3 className="card-title">Verified Authenticity</h3>
            <p className="card-description">
              Every item is inspected and guaranteed authentic for collectors.
            </p>
          </div>

          {/* Fast & Secure Shipping */}
          <div className="assurance-card">
            <div className="card-icon-container">
              <svg className="card-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5M4 20L21 3m0 13v5h-5M8 4L4 8v5l4 4"></path>
              </svg>
            </div>
            <h3 className="card-title">Fast & Secure Shipping</h3>
            <p className="card-description">
              Tracked shipping and protective packaging so your pieces arrive safe.
            </p>
          </div>

          {/* Trusted by Collectors */}
          <div className="assurance-card">
            <div className="card-icon-container">
              <svg className="card-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            </div>
            <h3 className="card-title">Trusted by Collectors</h3>
            <p className="card-description">
              Secure checkout and buyer protection, trusted by collectors worldwide.
            </p>
          </div>

          {/* Collector Support */}
          <a href="/contact" className="assurance-card support-card">
            <div className="card-icon-container">
              <svg className="card-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="card-title">Collector Support</h3>
            <p className="card-description">
              Have a question or issue? Contact our team for quick, friendly help.
            </p>
            <div className="support-link">
              <span className="contact-text">Contact us</span>
              <span className="contact-helper">We typically respond within 1–2 business days.</span>
            </div>
          </a>
        </div>
      </div>

      <style jsx>{`
        .collector-assurance-section {
          position: relative;
          overflow: hidden;
          padding: 44px 0 60px;
          background: linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%);
        }

        .assurance-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.02) 0%,
            rgba(94, 208, 192, 0.015) 50%,
            rgba(199, 163, 255, 0.02) 100%
          );
          backdrop-filter: blur(1px);
          z-index: 0;
        }

        .assurance-bg-decoration {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          z-index: 0;
        }

        .assurance-bg-1 {
          top: -15%;
          left: -10%;
          width: 40%;
          height: 130%;
          background: radial-gradient(circle, rgba(199,163,255,.06) 0%, transparent 70%);
        }

        .assurance-bg-2 {
          bottom: -15%;
          right: -10%;
          width: 35%;
          height: 130%;
          background: radial-gradient(circle, rgba(94,208,192,.06) 0%, transparent 70%);
        }

        .assurance-bg-3 {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 25%;
          height: 80%;
          background: radial-gradient(circle, rgba(247,231,195,.04) 0%, transparent 70%);
        }

        .assurance-container {
          max-width: 1224px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 2;
        }

        .assurance-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .luxury-eyebrow {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--wcc-teal);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }

        .assurance-title {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 900;
          color: var(--wcc-ink);
          margin: 0 0 16px;
          background: linear-gradient(135deg, var(--wcc-ink) 0%, rgba(94,208,192,0.8) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .assurance-subtitle {
          font-size: 1.1rem;
          color: var(--wcc-muted);
          margin: 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.5;
        }

        .assurance-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .assurance-card {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }

        .assurance-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            rgba(94, 208, 192, 0.03) 0%, 
            rgba(199, 163, 255, 0.03) 100%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 0;
        }

        .assurance-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: linear-gradient(135deg, rgba(94,208,192,0.12), rgba(199,163,255,0.12));
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(94, 208, 192, 0.2),
            0 0 40px rgba(94, 208, 192, 0.15),
            0 0 80px rgba(94, 208, 192, 0.08);
          border-color: rgba(94, 208, 192, 0.3);
        }

        .assurance-card:hover::before {
          opacity: 1;
        }

        .assurance-card:focus {
          outline: 2px solid var(--wcc-teal);
          outline-offset: 2px;
        }

        .card-icon-container {
          width: 56px;
          height: 56px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, rgba(94,208,192,0.15), rgba(199,163,255,0.15));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          transition: all 0.4s ease;
        }

        .assurance-card:hover .card-icon-container {
          background: linear-gradient(135deg, rgba(94,208,192,0.25), rgba(199,163,255,0.25));
          transform: scale(1.1);
        }

        .card-icon {
          width: 28px;
          height: 28px;
          color: var(--wcc-teal);
          transition: all 0.4s ease;
        }

        .assurance-card:hover .card-icon {
          color: #5ED0C0;
          transform: scale(1.1);
          filter: drop-shadow(0 4px 12px rgba(94, 208, 192, 0.4));
        }

        .card-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--wcc-ink);
          margin: 0 0 12px;
          position: relative;
          z-index: 1;
        }

        .card-description {
          font-size: 0.95rem;
          color: var(--wcc-muted);
          margin: 0;
          line-height: 1.5;
          position: relative;
          z-index: 1;
        }

        .support-card {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .support-card:hover {
          background: linear-gradient(135deg, rgba(94,208,192,0.12), rgba(199,163,255,0.12));
          border-color: rgba(94,208,192,0.3);
        }

        .support-link {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
          z-index: 1;
        }

        .contact-text {
          font-weight: 700;
          color: var(--wcc-teal);
          font-size: 0.95rem;
          transition: color 0.3s ease;
        }

        .support-card:hover .contact-text {
          color: #5ED0C0;
          text-decoration: underline;
          text-shadow: 0 2px 8px rgba(94, 208, 192, 0.3);
        }

        .contact-helper {
          font-size: 0.8rem;
          color: var(--wcc-muted);
          font-style: italic;
        }

        /* Micro-shimmer animation on icons */
        @keyframes microShimmer {
          0%, 90%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          95% { 
            opacity: 1.2; 
            transform: scale(1.05);
          }
        }

        .card-icon-container {
          animation: microShimmer 15s ease-in-out infinite;
        }

        .card-icon-container:nth-child(1) { animation-delay: 0s; }
        .card-icon-container:nth-child(2) { animation-delay: 3s; }
        .card-icon-container:nth-child(3) { animation-delay: 6s; }
        .card-icon-container:nth-child(4) { animation-delay: 9s; }

        /* Disable animations for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .card-icon-container {
            animation: none;
          }
          
          .assurance-card {
            transition: none;
          }
          
          .assurance-card:hover {
            transform: none;
          }
        }

        /* Tablet Styles */
        @media (max-width: 1024px) {
          .assurance-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            max-width: 700px;
          }

          .assurance-card {
            padding: 28px 20px;
          }

          .card-icon-container {
            width: 48px;
            height: 48px;
            margin-bottom: 16px;
          }

          .card-icon {
            width: 24px;
            height: 24px;
          }

          .card-title {
            font-size: 1.1rem;
          }
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .collector-assurance-section {
            padding: 40px 0 50px;
          }

          .assurance-container {
            padding: 0 16px;
          }

          .assurance-header {
            margin-bottom: 36px;
          }

          .assurance-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            max-width: 400px;
          }

          .assurance-card {
            padding: 24px 20px;
          }

          .assurance-card:hover {
            transform: translateY(-4px);
          }

          .card-title {
            font-size: 1rem;
          }

          .card-description {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  )
}

export default function HomePage() {
  const [items, setItems] = useState<Listing[]>([])
  const [filteredItems, setFilteredItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showNewReleases, setShowNewReleases] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('showNewReleasesSection') === 'true'
    }
    return false
  })

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/in-stock')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
        setFilteredItems(data)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleFiltersChange = (filters: FilterOptions) => {
    let filtered = [...items]
    
    // Filter by series
    if (filters.series.length > 0) {
      filtered = filtered.filter(item => 
        filters.series.some(series => 
          item.name.toLowerCase().includes(series.toLowerCase())
        )
      )
    }
    
    // Filter by price range
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
      filtered = filtered.filter(item => {
        const price = item.price || 0
        return price >= filters.priceRange.min && price <= filters.priceRange.max
      })
    }
    
    // Filter by rarity (could be enhanced with actual rarity data)
    if (filters.rarity.length > 0) {
      filtered = filtered.filter(item => 
        filters.rarity.some(rarity => 
          item.name.toLowerCase().includes(rarity.toLowerCase()) ||
          item.description?.toLowerCase().includes(rarity.toLowerCase())
        )
      )
    }
    
    // Sort items
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        break
    }
    
    setFilteredItems(filtered)
  }

  useEffect(() => {
    loadProducts()
    
    // Auto-refresh every 30 seconds to pick up new products
    const interval = setInterval(loadProducts, 30000)
    
    // Check for scheduled product launches every minute
    const schedulerInterval = setInterval(async () => {
      try {
        await fetch('/api/scheduler', { method: 'POST' })
      } catch (error) {
        console.error('Scheduler check failed:', error)
      }
    }, 60000) // Check every minute
    
    // Listen for localStorage changes to sync with admin panel
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'showNewReleasesSection') {
        setShowNewReleases(e.newValue === 'true')
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      clearInterval(schedulerInterval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <div>      
      <main>
        <HeroSection />

        {/* Featured Collection - Premium Spotlight */}
        <FeaturedHighlightsSection />

        {/* Coming Soon - Anticipation */}
        <ComingSoonProductsSection />

        {/* In Stock - Catalog Utility */}
        <FeaturedSection items={items} filteredItems={filteredItems} loading={loading} onFiltersChange={handleFiltersChange} />

        {/* VIP Invite - Optional Upgrade */}
        <VIPSection />

        {/* Collector Assurance - Consolidated Trust */}
        <CollectorAssuranceSection />
      </main>
    </div>
  )
}

function FeaturedSection({ items, filteredItems, loading, onFiltersChange }: { 
  items: Listing[], 
  filteredItems: Listing[], 
  loading: boolean, 
  onFiltersChange: (filters: FilterOptions) => void 
}) {
  if (loading) {
    return (
      <section className="luxury-section">
        <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px' }}>
          <div className="luxury-eyebrow">Featured Collection</div>
          <h2 style={{ fontSize: '1.6rem', margin: '0 0 16px', fontWeight: 800 }}>
            Featured Treasures
          </h2>
          <ScrollableSection>
            {[1, 2, 3].map((i) => (
              <div key={i} className="luxury-card accent-teal" style={{ opacity: 0.6 }}>
                <div className="luxury-thumb">
                  <div className="luxury-thumb-inner" style={{ background: '#f0f0f0' }}></div>
                </div>
                <div className="luxury-body">
                  <div style={{ background: '#f0f0f0', height: '20px', borderRadius: '4px', marginBottom: '8px' }}></div>
                  <div style={{ background: '#f0f0f0', height: '16px', borderRadius: '4px', width: '60%' }}></div>
                </div>
                <div className="luxury-foot">
                  <div style={{ background: '#f0f0f0', height: '20px', width: '40px', borderRadius: '4px' }}></div>
                  <div style={{ background: '#f0f0f0', height: '32px', width: '60px', borderRadius: '999px' }}></div>
                </div>
              </div>
            ))}
          </ScrollableSection>
        </div>
      </section>
    )
  }

  if (!items || items.length === 0) {
    return (
      <section className="luxury-section" style={{ 
        background: 'linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          <div className="luxury-eyebrow">Featured Collection</div>
          <h2 style={{ fontSize: '1.8rem', margin: '0 0 12px', fontWeight: 800 }}>
            Featured Treasures
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-500">No products in stock at the moment. Check back soon!</p>
          </div>
        </div>
      </section>
    )
  }
  
  if (filteredItems.length === 0) {
    return (
      <section className="luxury-section" style={{ 
        background: 'linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          <div className="luxury-eyebrow">Featured Collection</div>
          <h2 style={{ fontSize: '1.8rem', margin: '0 0 12px', fontWeight: 800 }}>
            Featured Treasures
          </h2>
          <FilterBar 
            onFiltersChange={onFiltersChange}
            totalItems={filteredItems.length}
          />
          <div className="text-center py-12">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>No matches found</h3>
            <p style={{ color: 'var(--muted)' }}>Try adjusting your filters to see more products.</p>
          </div>
        </div>
      </section>
    )
  }

  const cardColors = [
    'from-pop-pink/20 to-pop-orange/20',
    'from-pop-teal/20 to-pop-blue/20', 
    'from-pop-lime/20 to-pop-yellow/20',
    'from-pop-purple/20 to-pop-pink/20',
    'from-pop-orange/20 to-pop-teal/20',
    'from-pop-blue/20 to-pop-purple/20'
  ]

  return (
    <section className="luxury-section" style={{ 
      background: 'linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '40%',
        height: '130%',
        background: 'radial-gradient(circle, rgba(199,163,255,.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '-10%',
        width: '35%',
        height: '130%',
        background: 'radial-gradient(circle, rgba(94,208,192,.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)'
      }} />
      
      <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <div className="luxury-eyebrow">🛒 Available Now</div>
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 12px', fontWeight: 800 }}>
          Shop Now - In Stock
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', margin: '0 0 24px', maxWidth: '600px' }}>
          Handpicked premium collectibles from top designers. Each piece is authenticated and carefully curated for discerning collectors.
        </p>
        
        {/* Filter Bar */}
        <FilterBar 
          onFiltersChange={onFiltersChange}
          totalItems={filteredItems.length}
        />
        
        <ScrollableSection>
          {filteredItems.map((product, index) => {
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
    </section>
  )
}

function NewReleasesSection() {
  const [newReleases, setNewReleases] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        const response = await fetch('/api/new-releases')
        if (response.ok) {
          const data = await response.json()
          setNewReleases(data)
        }
      } catch (error) {
        console.error('Failed to load new releases:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNewReleases()
  }, [])

  // Don't show section if no new releases
  if (!loading && newReleases.length === 0) {
    return null
  }

  const cardColors = [
    'from-pop-pink/20 to-pop-orange/20',
    'from-pop-teal/20 to-pop-blue/20', 
    'from-pop-lime/20 to-pop-yellow/20',
    'from-pop-purple/20 to-pop-pink/20',
    'from-pop-orange/20 to-pop-teal/20',
    'from-pop-blue/20 to-pop-purple/20'
  ]

  return (
    <section className="luxury-section" style={{ 
      background: 'linear-gradient(135deg, rgba(255,140,0,.05) 0%, rgba(255,20,147,.05) 50%, rgba(255,69,0,.05) 100%)',
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
        background: 'radial-gradient(circle, rgba(255,140,0,.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      
      <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <div className="luxury-eyebrow" style={{ marginBottom: '8px' }}>🔥 Fresh Drops</div>
        <h2 style={{ 
          fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)', 
          margin: '0 0 12px', 
          fontWeight: 800,
          color: 'var(--wcc-ink)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🆕 New Releases
          {newReleases.length > 0 && (
            <span style={{
              fontSize: '0.7rem',
              background: 'linear-gradient(135deg, #ff8c00, #ff1493)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '999px',
              fontWeight: 600
            }}>
              {newReleases.length} NEW
            </span>
          )}
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--wcc-muted)', margin: '0 0 24px', maxWidth: '600px' }}>
          The latest releases from your favorite designers. Get them before they're gone!
        </p>
        
        {loading ? (
          <ScrollableSection>
            {[1, 2, 3].map((i) => (
              <div key={i} className="luxury-card accent-teal" style={{ opacity: 0.6 }}>
                <div className="luxury-thumb">
                  <div className="luxury-thumb-inner" style={{ background: '#f0f0f0' }}></div>
                </div>
                <div className="luxury-body">
                  <div style={{ background: '#f0f0f0', height: '20px', borderRadius: '4px', marginBottom: '8px' }}></div>
                  <div style={{ background: '#f0f0f0', height: '16px', borderRadius: '4px', width: '60%' }}></div>
                </div>
                <div className="luxury-foot">
                  <div style={{ background: '#f0f0f0', height: '20px', width: '40px', borderRadius: '4px' }}></div>
                  <div style={{ background: '#f0f0f0', height: '32px', width: '60px', borderRadius: '999px' }}></div>
                </div>
              </div>
            ))}
          </ScrollableSection>
        ) : (
          <ScrollableSection>
            {newReleases.map((product, index) => {
              const cardColor = cardColors[index % cardColors.length]
              const releaseEmojis = ['🚀', '⭐', '🔥', '✨', '💎', '🎯', '🌟', '💫', '🎪', '🎨']
              const randomEmoji = releaseEmojis[index % releaseEmojis.length]

              return (
                <div key={product.id} style={{ position: 'relative' }}>
                  {/* "NEW" Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'linear-gradient(135deg, #ff8c00, #ff1493)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    NEW
                  </div>
                  <ProductCard
                    product={product}
                    cardColor={cardColor}
                    randomEmoji={randomEmoji}
                  />
                </div>
              )
            })}
          </ScrollableSection>
        )}
      </div>
    </section>
  )
}


function StaffPicksSection() {
  const [staffPicks, setStaffPicks] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStaffPicks = async () => {
      try {
        const response = await fetch('/api/staff-picks')
        if (response.ok) {
          const data = await response.json()
          setStaffPicks(data)
        }
      } catch (error) {
        console.error('Failed to load staff picks:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStaffPicks()
  }, [])

  // Don't show section if no staff picks
  if (!loading && staffPicks.length === 0) {
    return null
  }

  const cardColors = [
    'from-pop-pink/20 to-pop-orange/20',
    'from-pop-teal/20 to-pop-blue/20', 
    'from-pop-lime/20 to-pop-yellow/20',
    'from-pop-purple/20 to-pop-pink/20',
    'from-pop-orange/20 to-pop-teal/20',
    'from-pop-blue/20 to-pop-purple/20'
  ]

  return (
    <section className="luxury-section" style={{
      position: 'relative'
    }}>
      
      <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <div className="luxury-eyebrow" style={{ marginBottom: '8px' }}>⭐ Curator's Choice</div>
        <h2 style={{ 
          fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)', 
          margin: '0 0 12px', 
          fontWeight: 800,
          color: 'var(--wcc-ink)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          👨‍💼 Staff Picks
          {staffPicks.length > 0 && (
            <span style={{
              fontSize: '0.7rem',
              background: 'linear-gradient(135deg, #ffc107, #ffeb3b)',
              color: '#333',
              padding: '4px 8px',
              borderRadius: '999px',
              fontWeight: 600
            }}>
              {staffPicks.length} SELECTED
            </span>
          )}
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--wcc-muted)', margin: '0 0 24px', maxWidth: '600px' }}>
          Our team's personal favorites and hidden gems. These are the pieces we'd buy for our own collections.
        </p>
        
        {loading ? (
          <ScrollableSection>
            {[1, 2, 3].map((i) => (
              <div key={i} className="luxury-card accent-teal" style={{ opacity: 0.6 }}>
                <div className="luxury-thumb">
                  <div className="luxury-thumb-inner" style={{ background: '#f0f0f0' }}></div>
                </div>
                <div className="luxury-body">
                  <div style={{ background: '#f0f0f0', height: '20px', borderRadius: '4px', marginBottom: '8px' }}></div>
                  <div style={{ background: '#f0f0f0', height: '16px', borderRadius: '4px', width: '60%' }}></div>
                </div>
                <div className="luxury-foot">
                  <div style={{ background: '#f0f0f0', height: '20px', width: '40px', borderRadius: '4px' }}></div>
                  <div style={{ background: '#f0f0f0', height: '32px', width: '60px', borderRadius: '999px' }}></div>
                </div>
              </div>
            ))}
          </ScrollableSection>
        ) : (
          <ScrollableSection>
            {staffPicks.map((product, index) => {
              const cardColor = cardColors[index % cardColors.length]
              const staffEmojis = ['⭐', '👑', '💎', '🏆', '🌟', '✨', '🥇', '💫', '🎯', '🔥']
              const randomEmoji = staffEmojis[index % staffEmojis.length]

              return (
                <div key={product.id} style={{ position: 'relative' }}>
                  {/* "STAFF PICK" Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'linear-gradient(135deg, #ffc107, #ffeb3b)',
                    color: '#333',
                    padding: '4px 8px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    STAFF PICK
                  </div>
                  <ProductCard
                    product={product}
                    cardColor={cardColor}
                    randomEmoji={randomEmoji}
                  />
                </div>
              )
            })}
          </ScrollableSection>
        )}
      </div>
    </section>
  )
}

function LimitedEditionsSection() {
  const [limitedEditions, setLimitedEditions] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLimitedEditions = async () => {
      try {
        const response = await fetch('/api/limited-editions')
        if (response.ok) {
          const data = await response.json()
          setLimitedEditions(data)
        }
      } catch (error) {
        console.error('Failed to load limited editions:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchLimitedEditions()
  }, [])

  // Don't show section if no limited editions
  if (!loading && limitedEditions.length === 0) {
    return null
  }

  const cardColors = [
    'from-pop-pink/20 to-pop-orange/20',
    'from-pop-teal/20 to-pop-blue/20', 
    'from-pop-lime/20 to-pop-yellow/20',
    'from-pop-purple/20 to-pop-pink/20',
    'from-pop-orange/20 to-pop-teal/20',
    'from-pop-blue/20 to-pop-purple/20'
  ]

  return (
    <section className="luxury-section" style={{ 
      background: 'linear-gradient(135deg, rgba(220,20,60,.05) 0%, rgba(255,69,0,.05) 50%, rgba(220,20,60,.05) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '40%',
        height: '140%',
        background: 'radial-gradient(circle, rgba(220,20,60,.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      
      <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <div className="luxury-eyebrow" style={{ marginBottom: '8px' }}>🔥 Ultra Rare</div>
        <h2 style={{ 
          fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)', 
          margin: '0 0 12px', 
          fontWeight: 800,
          color: 'var(--wcc-ink)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          💎 Limited Editions
          {limitedEditions.length > 0 && (
            <span style={{
              fontSize: '0.7rem',
              background: 'linear-gradient(135deg, #dc143c, #ff4500)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '999px',
              fontWeight: 600
            }}>
              {limitedEditions.length} RARE
            </span>
          )}
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--wcc-muted)', margin: '0 0 24px', maxWidth: '600px' }}>
          Exclusive pieces with limited production runs. Once they're gone, they're gone forever.
        </p>
        
        {loading ? (
          <ScrollableSection>
            {[1, 2, 3].map((i) => (
              <div key={i} className="luxury-card accent-teal" style={{ opacity: 0.6 }}>
                <div className="luxury-thumb">
                  <div className="luxury-thumb-inner" style={{ background: '#f0f0f0' }}></div>
                </div>
                <div className="luxury-body">
                  <div style={{ background: '#f0f0f0', height: '20px', borderRadius: '4px', marginBottom: '8px' }}></div>
                  <div style={{ background: '#f0f0f0', height: '16px', borderRadius: '4px', width: '60%' }}></div>
                </div>
                <div className="luxury-foot">
                  <div style={{ background: '#f0f0f0', height: '20px', width: '40px', borderRadius: '4px' }}></div>
                  <div style={{ background: '#f0f0f0', height: '32px', width: '60px', borderRadius: '999px' }}></div>
                </div>
              </div>
            ))}
          </ScrollableSection>
        ) : (
          <ScrollableSection>
            {limitedEditions.map((product, index) => {
              const cardColor = cardColors[index % cardColors.length]
              const limitedEmojis = ['💎', '👑', '🏆', '⚡', '🔥', '💫', '✨', '🌟', '🚀', '💯']
              const randomEmoji = limitedEmojis[index % limitedEmojis.length]

              return (
                <div key={product.id} style={{ position: 'relative' }}>
                  {/* "LIMITED" Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'linear-gradient(135deg, #dc143c, #ff4500)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    LIMITED
                  </div>
                  <ProductCard
                    product={product}
                    cardColor={cardColor}
                    randomEmoji={randomEmoji}
                  />
                </div>
              )
            })}
          </ScrollableSection>
        )}
      </div>
    </section>
  )
}
