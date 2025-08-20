'use client'
// app/page.tsx
import { SITE } from '../lib/products'
import { Listing } from '../lib/listings'
import ProductCard from '../components/ProductCard'
import CountdownTimer from '../components/CountdownTimer'
import FilterBar, { FilterOptions } from '../components/FilterBar'
import RecentlySoldBanner from '../components/RecentlySoldBanner'
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

function ComingSoonProductsSection() {
  const [comingSoonProducts, setComingSoonProducts] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    
    const fetchComingSoonProducts = async () => {
      try {
        console.log('ComingSoon: Starting fetch...')
        const response = await fetch('/api/coming-soon/products')
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
    <section className="luxury-section" style={{ 
      background: 'linear-gradient(135deg, rgba(138,43,226,.05) 0%, rgba(75,0,130,.05) 50%, rgba(138,43,226,.05) 100%)',
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
        background: 'radial-gradient(circle, rgba(138,43,226,.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      
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
                  {/* "COMING SOON" Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'linear-gradient(135deg, #8a2be2, #4b0082)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    COMING SOON
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
      const response = await fetch('/api/public/products')
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
        {/* Recently Sold Banner */}
        <RecentlySoldBanner />

        {/* Hero Video Section */}
        <section style={{ 
          position: 'relative', 
          height: '100vh', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Video Background */}
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
              transform: 'translate(-50%, -50%)',
              objectFit: 'cover'
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

          {/* Hero Content */}
          <div style={{ 
            position: 'relative', 
            zIndex: 2, 
            color: 'white', 
            textAlign: 'left', 
            maxWidth: '700px', 
            padding: '0 50px',
            width: '100%'
          }}>
            <div className="luxury-eyebrow" style={{ 
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Curated • Limited • Authentic
            </div>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 4vw, 4rem)', 
              margin: '0.35em 0 0.2em', 
              lineHeight: 1.07, 
              fontWeight: 800,
              color: 'white',
              textShadow: '0 4px 8px rgba(0,0,0,0.4)'
            }}>
              <span className="floating-collectible" style={{ display: 'inline-block' }}>🎯</span> Luxury Designer Toys with Playful Energy
            </h1>
            <p style={{ 
              margin: '0 0 8px', 
              fontSize: '1.3rem',
              color: 'rgba(255,255,255,0.95)',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              lineHeight: 1.4,
              fontWeight: 600
            }}>
              Limited drops. Authentic releases. For serious collectors.
            </p>
            <p style={{ 
              margin: '0 0 30px', 
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.85)',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              lineHeight: 1.6
            }}>
              Chic gradients, elegant cards, and magical hover effects — built for premium collectibles!
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a 
                href="#featured"
                className="luxury-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 20px',
                  fontSize: '1rem',
                  borderRadius: '999px',
                  border: 'none',
                  color: '#0b0b0f',
                  background: 'linear-gradient(135deg, var(--wcc-teal), var(--wcc-grad-c))',
                  boxShadow: '0 12px 28px rgba(94,208,192,.4)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Shop New Arrivals
              </a>
              <a 
                href="#featured"
                className="luxury-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 20px',
                  fontSize: '1rem',
                  borderRadius: '999px',
                  border: '2px solid rgba(255,255,255,0.8)',
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Browse Featured
              </a>
            </div>
          </div>
        </section>

        {/* New Releases Section (toggleable) */}
        {showNewReleases && <NewReleasesSection />}

        {/* Featured Listings */}
        <FeaturedSection items={items} filteredItems={filteredItems} loading={loading} onFiltersChange={handleFiltersChange} />

        {/* Staff Picks Section */}
        <StaffPicksSection />

        {/* Limited Editions Section */}
        <LimitedEditionsSection />

        {/* Coming Soon Products Section */}
        <ComingSoonProductsSection />

        {/* Get Notified / VIP Email Signup Section */}
        <ComingSoonSection />

        {/* Trust & Credibility - Unified Section */}
        <section className="luxury-section" style={{ 
          background: 'linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%)',
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: '60px'
        }}>
          {/* Background decorations */}
          <div style={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: '30%',
            height: '120%',
            background: 'radial-gradient(circle, rgba(199,163,255,.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: '35%',
            height: '120%',
            background: 'radial-gradient(circle, rgba(94,208,192,.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(50px)'
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '25%',
            height: '80%',
            background: 'radial-gradient(circle, rgba(247,231,195,.08) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }} />
          
          <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
            {/* Header */}
            <div className="luxury-eyebrow" style={{ textAlign: 'center', marginBottom: '16px' }}>Trusted by Collectors</div>
            <h2 style={{ 
              fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', 
              margin: '0 0 12px', 
              fontWeight: 800,
              color: 'var(--ink)',
              textAlign: 'center'
            }}>
              Why Choose West Coast Collectibles
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', margin: '0 0 40px', maxWidth: '600px', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}>
              We're passionate collectors ourselves, ensuring every piece meets our high standards.
            </p>
            
            {/* Why Choose Us Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '20px',
              marginBottom: '48px'
            }}>
              <div className="luxury-card accent-lilac" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--accent-lilac), rgba(199,163,255,0.3))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '1.5rem'
                }}>
                  ✨
                </div>
                <h3 style={{ fontWeight: 800, color: 'var(--ink)', marginBottom: '8px', fontSize: '1.1rem' }}>
                  100% Authentic
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                  Every collectible is carefully verified and authenticated before shipping to ensure you receive genuine products.
                </p>
              </div>
              
              <div className="luxury-card accent-teal" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--accent-teal), rgba(94,208,192,0.3))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '1.5rem'
                }}>
                  🚀
                </div>
                <h3 style={{ fontWeight: 800, color: 'var(--ink)', marginBottom: '8px', fontSize: '1.1rem' }}>
                  Lightning Fast
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                  Most orders ship within 24 hours with 2-3 day delivery. Your collectibles arrive quickly and safely.
                </p>
              </div>
              
              <div className="luxury-card accent-gold" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--accent-gold), rgba(201,176,126,0.3))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '1.5rem'
                }}>
                  🛡️
                </div>
                <h3 style={{ fontWeight: 800, color: 'var(--ink)', marginBottom: '8px', fontSize: '1.1rem' }}>
                  Trusted & Secure
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                  U.S.-based seller with secure checkout, buyer protection, and hassle-free returns on all purchases.
                </p>
              </div>
            </div>

            {/* Policies Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div className="luxury-card accent-lilac" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  🚀 Shipping
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{SITE.policies.shipping}</p>
              </div>
              <div className="luxury-card accent-teal" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  🔄 Returns
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{SITE.policies.returns}</p>
              </div>
              <div className="luxury-card accent-gold" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  💬 Support
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                  Questions? Email{' '}
                  <a style={{ color: 'var(--accent-teal)', textDecoration: 'underline' }} href="mailto:support@westcoastcollectibless.com">
                    support@westcoastcollectibless.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
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
        <div className="luxury-eyebrow">Featured Collection</div>
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 12px', fontWeight: 800 }}>
          Featured Treasures
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

function ComingSoonSection() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [comingSoonItems, setComingSoonItems] = useState<Listing[]>([])
  const [nextDropDate, setNextDropDate] = useState<Date | null>(null)

  useEffect(() => {
    const fetchComingSoonItems = async () => {
      try {
        const response = await fetch('/api/coming-soon/products')
        if (response.ok) {
          const data = await response.json()
          setComingSoonItems(data)
          
          // Find the earliest drop date among coming soon items
          const dropDates = data
            .filter((item: any) => item.drop_date)
            .map((item: any) => new Date(item.drop_date))
            .sort((a: Date, b: Date) => a.getTime() - b.getTime())
          
          if (dropDates.length > 0) {
            setNextDropDate(dropDates[0])
          } else {
            setNextDropDate(null)
          }
        }
      } catch (error) {
        console.error('Failed to load coming soon items:', error)
      }
    }
    
    fetchComingSoonItems()
    
    // Refresh coming soon items every 30 seconds to update when products launch
    const interval = setInterval(fetchComingSoonItems, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (response.ok) {
        console.log('Email subscribed successfully:', email)
        setIsSubmitted(true)
        setTimeout(() => {
          setIsSubmitted(false)
          setEmail('')
        }, 5000) // Show success message longer
      } else {
        console.error('Failed to subscribe email')
        // Could show error message here
      }
    } catch (error) {
      console.error('Email subscription error:', error)
      // Could show error message here
    }
  }

  const timeUntilDrop = () => {
    if (!nextDropDate) {
      return 'TBA'
    }
    
    const now = new Date()
    const timeDiff = nextDropDate.getTime() - now.getTime()
    
    if (timeDiff <= 0) {
      return 'Now available!'
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours}h`
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes}m`
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }
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
        right: '-10%',
        width: '40%',
        height: '140%',
        background: 'radial-gradient(circle, rgba(199,163,255,.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: '35%',
        height: '140%',
        background: 'radial-gradient(circle, rgba(247,231,195,.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      
      <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="luxury-eyebrow" style={{ marginBottom: '16px' }}>
            Exclusive • Limited • Weekly
          </div>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 3vw, 2.5rem)', 
            margin: '0 0 12px', 
            fontWeight: 800,
            color: 'var(--wcc-ink)',
            lineHeight: 1.2
          }}>
            🔔 Get Notified - Early Access
          </h2>
          {comingSoonItems.length > 0 ? (
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--wcc-muted)', 
              margin: '0 0 32px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6
            }}>
              Get exclusive access to limited designer toys before they sell out. New drops every week featuring rare collectibles and premium figures.
            </p>
          ) : (
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--wcc-muted)', 
              margin: '0 0 32px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6
            }}>
              No upcoming drops scheduled at the moment. Subscribe to be notified when new products are coming soon!
            </p>
          )}
          
          {/* Enhanced Countdown Timer */}
          {nextDropDate && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CountdownTimer 
                targetDate={nextDropDate}
                onComplete={() => {
                  // Refresh the page or update coming soon items when countdown completes
                  window.location.reload()
                }}
              />
            </div>
          )}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '32px', 
          alignItems: 'center' 
        }}>
          {/* Left: Preview Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="luxury-eyebrow" style={{ marginBottom: '8px' }}>Exclusive Preview</div>
            <h3 style={{ 
              fontSize: '1.4rem', 
              fontWeight: 800, 
              color: 'var(--wcc-ink)', 
              margin: '0 0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👀 Sneak Peek
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--wcc-muted)', margin: '0 0 8px' }}>
              Want to see exactly what's coming? 
            </p>
            <div style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,.1), rgba(168,85,247,.1))',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '2px solid rgba(124,58,237,.2)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--wcc-ink)', marginBottom: '4px' }}>
                🆓 Free VIP Access
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--wcc-muted)' }}>
                Sign up below to unlock clear images and details of all upcoming drops!
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {comingSoonItems.length > 0 ? (
                comingSoonItems.slice(0, 3).map((item, i) => (
                  <div 
                    key={item.id}
                    style={{ 
                      padding: '12px',
                      borderRadius: '18px',
                      background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg, var(--accent-teal), var(--accent-lilac), var(--accent-gold)) border-box',
                      border: '2px solid transparent',
                      boxShadow: `0 8px 24px rgba(0, 0, 0, 0.08), 0 0 20px ${['rgba(94,208,192,0.3)', 'rgba(199,163,255,0.3)', 'rgba(247,231,195,0.3)'][i % 3]}`,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)'
                      e.currentTarget.style.boxShadow = `0 16px 40px rgba(0, 0, 0, 0.12), 0 0 32px ${['rgba(94,208,192,0.5)', 'rgba(199,163,255,0.5)', 'rgba(247,231,195,0.5)'][i % 3]}`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = `0 8px 24px rgba(0, 0, 0, 0.08), 0 0 20px ${['rgba(94,208,192,0.3)', 'rgba(199,163,255,0.3)', 'rgba(247,231,195,0.3)'][i % 3]}`
                    }}
                  >
                    <div style={{ 
                      height: '80px', 
                      borderRadius: '8px', 
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            filter: 'blur(1px) brightness(0.9)'
                          }}
                        />
                      ) : (
                        <div style={{ 
                          background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          filter: 'blur(1px)',
                          height: '100%'
                        }}>
                          🎁
                        </div>
                      )}
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(0,0,0,0.75)',
                      color: 'white',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      backdropFilter: 'blur(4px)'
                    }}>
                      🔥 COMING SOON
                    </div>
                  </div>
                ))
              ) : (
                [1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    style={{ 
                      padding: '12px',
                      borderRadius: '18px',
                      background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg, var(--accent-teal), var(--accent-lilac), var(--accent-gold)) border-box',
                      border: '2px solid transparent',
                      boxShadow: `0 8px 24px rgba(0, 0, 0, 0.08), 0 0 20px ${['rgba(94,208,192,0.3)', 'rgba(199,163,255,0.3)', 'rgba(247,231,195,0.3)'][(i - 1) % 3]}`,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)'
                      e.currentTarget.style.boxShadow = `0 16px 40px rgba(0, 0, 0, 0.12), 0 0 32px ${['rgba(94,208,192,0.5)', 'rgba(199,163,255,0.5)', 'rgba(247,231,195,0.5)'][(i - 1) % 3]}`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = `0 8px 24px rgba(0, 0, 0, 0.08), 0 0 20px ${['rgba(94,208,192,0.3)', 'rgba(199,163,255,0.3)', 'rgba(247,231,195,0.3)'][(i - 1) % 3]}`
                    }}
                  >
                    <div style={{ 
                      height: '80px', 
                      borderRadius: '8px', 
                      background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      filter: 'blur(2px)',
                      position: 'relative'
                    }}>
                      {['🎭', '🎪', '🎨'][i - 1]}
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(0,0,0,0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}>
                      MYSTERY
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ fontSize: '0.9rem', color: 'var(--wcc-muted)', fontStyle: 'italic' }}>
              {comingSoonItems.length > 0 
                ? '* These items are coming soon! Subscribe for early access when they drop.'
                : '* New products coming soon! Subscribe for exclusive previews.'}
            </div>
          </div>

          {/* Right: VIP Signup */}
          <div className="luxury-card accent-lilac" style={{ 
            padding: '32px',
            textAlign: 'center',
            background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,var(--wcc-grad-a),var(--wcc-grad-b),var(--wcc-grad-c)) border-box',
            border: '2px solid transparent'
          }}>
            <div className="luxury-eyebrow" style={{ marginBottom: '8px', textAlign: 'center' }}>Free VIP Membership</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 800, 
              color: 'var(--wcc-ink)', 
              margin: '0 0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              👤 Become a Collector
            </h3>
            
            {/* VIP Benefits List */}
            <div style={{ 
              background: 'rgba(124,58,237,.05)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--wcc-ink)', marginBottom: '8px', textAlign: 'center' }}>
                🆓 What you get for FREE:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'var(--wcc-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#10b981', fontSize: '0.9rem' }}>✓</span>
                  See all upcoming drops (no more blurred images!)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#10b981', fontSize: '0.9rem' }}>✓</span>
                  Email alerts for new releases
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#10b981', fontSize: '0.9rem' }}>✓</span>
                  Personal wishlist & alerts
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#10b981', fontSize: '0.9rem' }}>✓</span>
                  Drop calendar access
                </li>
              </ul>
              <div style={{ 
                fontSize: '0.8rem', 
                color: 'var(--accent-teal)', 
                fontWeight: 600, 
                marginTop: '8px',
                textAlign: 'center'
              }}>
                Want more? <a href="/vip" style={{ textDecoration: 'underline' }}>Upgrade for early access & discounts!</a>
              </div>
            </div>
            
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'var(--wcc-muted)', 
              margin: '0 0 20px',
              lineHeight: 1.4
            }}>
              Join thousands of collectors who never miss a drop.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid var(--wcc-line)',
                    fontSize: '1rem',
                    background: '#fff',
                    color: 'var(--wcc-ink)',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--wcc-teal)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--wcc-line)'}
                />
                <button
                  type="submit"
                  style={{
                    padding: '14px 20px',
                    borderRadius: '999px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--wcc-teal), var(--wcc-grad-c))',
                    color: '#0b0b0f',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 20px rgba(94,208,192,.3)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  🆓 Join Free VIP
                </button>
              </form>
            ) : (
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(94,208,192,.15), rgba(199,163,255,.15))',
                borderRadius: '12px',
                border: '2px solid var(--wcc-teal)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
                <div style={{ fontWeight: 700, color: 'var(--wcc-teal)', marginBottom: '4px' }}>
                  Welcome to VIP Collector Status!
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--wcc-muted)' }}>
                  You can now see all upcoming drops and get early notifications!
                </div>
              </div>
            )}

            <div style={{ 
              fontSize: '0.8rem', 
              color: 'var(--wcc-muted)', 
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span>🔒</span>
              <span>We respect your privacy. Unsubscribe anytime.</span>
            </div>
          </div>
        </div>
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
