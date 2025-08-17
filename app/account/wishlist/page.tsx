'use client'

import { useState, useEffect } from 'react'
import { AuthService, User } from '../../../lib/auth'
import { Listing } from '../../../lib/listings'
import ProductCard from '../../../components/ProductCard'

export default function WishlistPage() {
  const [user, setUser] = useState<User | null>(null)
  const [wishlistItems, setWishlistItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) {
      window.location.href = '/'
      return
    }
    
    setUser(currentUser)
    loadWishlistItems(currentUser.wishlist)
  }, [])

  const loadWishlistItems = async (wishlistIds: string[]) => {
    try {
      const response = await fetch('/api/public/products')
      if (response.ok) {
        const allProducts = await response.json()
        const wishlistProducts = allProducts.filter((product: Listing) => 
          wishlistIds.includes(product.id)
        )
        setWishlistItems(wishlistProducts)
      }
    } catch (error) {
      console.error('Failed to load wishlist items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = (productId: string) => {
    AuthService.removeFromWishlist(productId)
    setWishlistItems(prev => prev.filter(item => item.id !== productId))
    setUser(AuthService.getCurrentUser())
  }

  if (loading) {
    return (
      <main>
        <section className="luxury-section" style={{ 
          background: 'linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%)',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>❤️</div>
            <div>Loading your wishlist...</div>
          </div>
        </section>
      </main>
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
    <main>
      <section className="luxury-section" style={{ 
        background: 'linear-gradient(135deg, rgba(199,163,255,.08) 0%, rgba(94,208,192,.08) 50%, rgba(247,231,195,.08) 100%)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh'
      }}>
        {/* Background decorations */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '40%',
          height: '140%',
          background: 'radial-gradient(circle, rgba(199,163,255,.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />

        <div style={{ maxWidth: '1224px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="luxury-eyebrow" style={{ marginBottom: '16px' }}>
              My Collection
            </div>
            <h1 style={{ 
              fontSize: 'clamp(2rem, 3vw, 2.5rem)', 
              margin: '0 0 20px', 
              fontWeight: 800,
              color: 'var(--ink)',
              lineHeight: 1.2
            }}>
              ❤️ Your Wishlist
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--muted)', margin: '0 0 32px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              Keep track of your favorite collectibles and get notified when they're back in stock.
            </p>
          </div>

          {/* User Info Card */}
          {user && (
            <div className="luxury-card accent-teal" style={{ 
              padding: '20px', 
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: user.tier === 'collectors_club' 
                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                  : user.tier === 'early_access'
                  ? 'linear-gradient(135deg, #ff6b6b, #feca57)'
                  : 'linear-gradient(135deg, var(--accent-teal), var(--accent-lilac))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'white'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '4px' }}>
                  {user.name || 'Collector'}
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '8px' }}>
                  {user.email} • Member since {new Date(user.joined_date).toLocaleDateString()}
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: user.tier === 'collectors_club' 
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : user.tier === 'early_access'
                    ? 'linear-gradient(135deg, #ff6b6b, #feca57)'
                    : 'linear-gradient(135deg, var(--accent-teal), var(--accent-lilac))',
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {user.tier === 'collectors_club' ? "Collector's Club" : 
                   user.tier === 'early_access' ? 'Early Access' : 'Collector'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                  {wishlistItems.length}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Wishlist Items
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Items */}
          {wishlistItems.length === 0 ? (
            <div className="luxury-card accent-lilac" style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '24px' }}>💔</div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '16px' }}>
                Your wishlist is empty
              </h3>
              <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                Start building your dream collection! Browse our featured items and click the heart icon to add them to your wishlist.
              </p>
              <a 
                href="/"
                className="luxury-btn grad"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 24px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '999px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-lilac))',
                  color: '#0b0b0f',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                🛍️ Browse Collectibles
              </a>
            </div>
          ) : (
            <div className="luxury-grid">
              {wishlistItems.map((product, index) => {
                const cardColor = cardColors[index % cardColors.length]
                const toyEmojis = ['🧸', '🎨', '🎪', '🎭', '🎲', '🚀', '🌟', '💎', '🎯', '⭐']
                const randomEmoji = toyEmojis[index % toyEmojis.length]

                return (
                  <div key={product.id} style={{ position: 'relative' }}>
                    {/* Wishlist badge */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                      color: 'white',
                      padding: '6px 10px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      zIndex: 15,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      ❤️ Wishlist
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
    </main>
  )
}