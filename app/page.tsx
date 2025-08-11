'use client'
// app/page.tsx
import { SITE } from '../lib/products'
import { Listing } from '../lib/listings'
import ProductCard from '../components/ProductCard'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

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
    return () => clearInterval(interval)
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

        {/* Featured Listings */}
        <FeaturedSection items={items} loading={loading} />

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
