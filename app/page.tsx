'use client'
// app/page.tsx
import { SITE } from '../lib/products'
import { Listing } from '../lib/listings'
import ProductCard from '../components/ProductCard'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/public/products')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
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
    
    return () => {
      clearInterval(interval)
      clearInterval(schedulerInterval)
    }
  }, [])

  return (
    <div>      
      <main>
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
              margin: '0.35em 0 0.3em', 
              lineHeight: 1.07, 
              fontWeight: 800,
              color: 'white',
              textShadow: '0 4px 8px rgba(0,0,0,0.4)'
            }}>
              Luxury Designer Toys with Playful Energy
            </h1>
            <p style={{ 
              margin: '0 0 30px', 
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.95)',
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

        {/* New Releases Section */}
        <NewReleasesSection />

        {/* Featured Listings */}
        <FeaturedSection items={items} loading={loading} />

        {/* Coming Soon Section */}
        <ComingSoonSection />

        {/* Trust + Contact */}
        <section className="luxury-section">
          <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="luxury-card accent-lilac" style={{ padding: '20px' }}>
                <div style={{ fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  🚀 Shipping
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>{SITE.policies.shipping}</p>
              </div>
              <div className="luxury-card accent-teal" style={{ padding: '20px' }}>
                <div style={{ fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  🔄 Returns
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>{SITE.policies.returns}</p>
              </div>
              <div className="luxury-card accent-gold" style={{ padding: '20px' }}>
                <div style={{ fontWeight: 800, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  💬 Support
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>
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


function FeaturedSection({ items, loading }: { items: Listing[], loading: boolean }) {
  if (loading) {
    return (
      <section className="luxury-section">
        <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px' }}>
          <div className="luxury-eyebrow">Featured Collection</div>
          <h2 style={{ fontSize: '1.6rem', margin: '0 0 16px', fontWeight: 800 }}>
            Featured Treasures
          </h2>
          <div className="luxury-grid wcc-scroll">
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
          </div>
        </div>
      </section>
    )
  }

  if (!items || items.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="text-3xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-pop-teal to-pop-purple bg-clip-text text-transparent">
            Featured Treasures
          </span>
        </h2>
        <div className="text-center py-12">
          <p className="text-gray-500">No products in stock at the moment. Check back soon!</p>
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
    <section className="luxury-section">
      <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px' }}>
        <div className="luxury-eyebrow">Featured Collection</div>
        <h2 style={{ fontSize: '1.6rem', margin: '0 0 16px', fontWeight: 800 }}>
          Featured Treasures
        </h2>
        <div className="luxury-grid wcc-scroll">
          {items.map((product, index) => {
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
        </div>
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
          fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', 
          margin: '0 0 20px', 
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
        
        {loading ? (
          <div className="luxury-grid wcc-scroll">
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
          </div>
        ) : (
          <div className="luxury-grid wcc-scroll" style={{
            gridTemplateColumns: newReleases.length === 1 
              ? 'repeat(1, minmax(280px, 320px))' 
              : newReleases.length === 2 
              ? 'repeat(2, minmax(280px, 320px))'
              : 'repeat(auto-fit, minmax(280px, 1fr))',
            justifyContent: newReleases.length <= 2 ? 'center' : 'flex-start'
          }}>
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
          </div>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate with email service (Mailchimp, etc.)
    console.log('Email submitted:', email)
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setEmail('')
    }, 3000)
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
        background: 'radial-gradient(circle, rgba(199,163,255,.15) 0%, transparent 70%)',
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
            margin: '0 0 20px', 
            fontWeight: 800,
            color: 'var(--wcc-ink)',
            lineHeight: 1.2
          }}>
            🔥 Next Drop Coming Soon
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
          
          {/* Countdown */}
          {nextDropDate && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, var(--wcc-lilac), var(--wcc-teal))',
              borderRadius: '999px',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '40px',
              boxShadow: '0 8px 24px rgba(199,163,255,.3)'
            }}>
              ⏰ {timeUntilDrop() === 'Now available!' ? 'Latest drops now live!' : `Next drop in ${timeUntilDrop()}`}
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
            <h3 style={{ 
              fontSize: '1.3rem', 
              fontWeight: 800, 
              color: 'var(--wcc-ink)', 
              margin: '0 0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👀 Sneak Peek
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {comingSoonItems.length > 0 ? (
                comingSoonItems.slice(0, 3).map((item, i) => (
                  <div 
                    key={item.id}
                    className="luxury-card accent-teal"
                    style={{ 
                      padding: '12px',
                      background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,var(--wcc-grad-a),var(--wcc-grad-b),var(--wcc-grad-c)) border-box',
                      border: '2px solid transparent',
                      position: 'relative',
                      overflow: 'hidden'
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
                    className="luxury-card accent-teal"
                    style={{ 
                      padding: '12px',
                      background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,var(--wcc-grad-a),var(--wcc-grad-b),var(--wcc-grad-c)) border-box',
                      border: '2px solid transparent',
                      position: 'relative',
                      overflow: 'hidden'
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

          {/* Right: Email Signup */}
          <div className="luxury-card accent-lilac" style={{ 
            padding: '32px',
            textAlign: 'center',
            background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,var(--wcc-grad-a),var(--wcc-grad-b),var(--wcc-grad-c)) border-box',
            border: '2px solid transparent'
          }}>
            <h3 style={{ 
              fontSize: '1.4rem', 
              fontWeight: 800, 
              color: 'var(--wcc-ink)', 
              margin: '0 0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              📧 Join the VIP List
            </h3>
            
            <p style={{ 
              fontSize: '0.95rem', 
              color: 'var(--wcc-muted)', 
              margin: '0 0 24px',
              lineHeight: 1.5
            }}>
              Be the first to know about new drops, get exclusive previews, and secure early access before items go public.
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
                  🚀 Get Early Access
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
                  Welcome to the VIP List!
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--wcc-muted)' }}>
                  You'll be the first to know about our next drop!
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
