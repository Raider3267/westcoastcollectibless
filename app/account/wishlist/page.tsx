'use client'

import { useState, useEffect } from 'react'
import { authService, AuthUser } from '../../../lib/auth-new'
import WishlistButton from '../../../components/WishlistButton'
import AuthLightModal from '../../../components/AuthLightModal'
import { useRouter } from 'next/navigation'
import { getAllProducts } from '../../../lib/products'

interface Product {
  id: string
  name: string
  price?: number | null
  image?: string | null
  sale_state?: 'DRAFT' | 'PREVIEW' | 'LIVE' | 'ARCHIVED'
  release_at?: string | null
  quantity?: number
}

export default function WishlistPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe(setUser)
    
    // Initialize
    initialize()
    
    return unsubscribe
  }, [])

  const initialize = async () => {
    try {
      const currentUser = await authService.initialize()
      
      if (!currentUser) {
        setShowAuthModal(true)
        return
      }
      
      // Load wishlist and products
      await Promise.all([
        loadWishlist(),
        loadProducts()
      ])
    } catch (error) {
      console.error('Failed to initialize:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWishlist = async () => {
    try {
      const wishlist = await authService.getWishlist()
      setWishlistItems(wishlist)
    } catch (error) {
      console.error('Failed to load wishlist:', error)
    }
  }

  const loadProducts = async () => {
    try {
      const allProducts = await getAllProducts()
      setProducts(allProducts)
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const getWishlistProducts = () => {
    return products.filter(product => wishlistItems.includes(product.id))
  }

  const getStatusChip = (product: Product) => {
    const { sale_state, quantity, release_at } = product
    
    if (sale_state === 'PREVIEW') {
      if (release_at) {
        const releaseDate = new Date(release_at)
        return {
          text: `Drops ${releaseDate.toLocaleDateString()}`,
          style: 'bg-purple-100 text-purple-800'
        }
      }
      return {
        text: 'Coming Soon',
        style: 'bg-purple-100 text-purple-800'
      }
    }
    
    if (sale_state === 'LIVE') {
      if (quantity && quantity <= 0) {
        return {
          text: 'Sold Out',
          style: 'bg-red-100 text-red-800'
        }
      }
      return {
        text: 'Live',
        style: 'bg-green-100 text-green-800'
      }
    }
    
    return null
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '1.1rem',
          color: '#666'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #ddd',
            borderTop: '2px solid #5ED0C0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading your wishlist...
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '16px',
            color: '#333'
          }}>
            My Wishlist
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#666',
            marginBottom: '24px'
          }}>
            Sign in to view and manage your saved items.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #5ED0C0, #F7E7C3)',
              color: '#0b0b0f',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        </div>
        
        <AuthLightModal
          isOpen={showAuthModal}
          onClose={() => router.push('/')}
          onSuccess={() => {
            setShowAuthModal(false)
            initialize()
          }}
          title="Sign in to view wishlist"
          subtitle="Access your saved collectibles and get drop alerts."
        />
      </>
    )
  }

  const wishlistProducts = getWishlistProducts()

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      <div style={{
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #5ED0C0, #C7A3FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          My Wishlist
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#666'
        }}>
          {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'linear-gradient(135deg, rgba(199,163,255,.05), rgba(94,208,192,.05))',
          borderRadius: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '16px'
          }}>
            💫
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '12px',
            color: '#333'
          }}>
            Your wishlist is empty
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            marginBottom: '24px'
          }}>
            Browse Featured or Coming Soon to get started.
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => router.push('/#featured')}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #5ED0C0, #F7E7C3)',
                color: '#0b0b0f',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              Browse Featured
            </button>
            <button
              onClick={() => router.push('/#coming-soon')}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '12px',
                border: '2px solid #5ED0C0',
                background: 'white',
                color: '#5ED0C0',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              Coming Soon
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {wishlistProducts.map((product) => {
            const statusChip = getStatusChip(product)
            
            return (
              <div
                key={product.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Wishlist button */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 10,
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <WishlistButton
                    productId={product.id}
                    productName={product.name}
                    onSignInRequired={() => {}}
                  />
                </div>

                {/* Status chip */}
                {statusChip && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 10
                  }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: statusChip.style.includes('purple') ? '#f3e8ff' : 
                                 statusChip.style.includes('red') ? '#fee2e2' : '#ecfdf5',
                      color: statusChip.style.includes('purple') ? '#7c3aed' : 
                             statusChip.style.includes('red') ? '#dc2626' : '#059669'
                    }}>
                      {statusChip.text}
                    </span>
                  </div>
                )}

                {/* Image */}
                <div style={{
                  aspectRatio: '1',
                  background: product.image ? `url(${product.image})` : '#f5f5f5',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {!product.image && (
                    <div style={{
                      fontSize: '3rem'
                    }}>
                      🎁
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{
                  padding: '16px'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#333',
                    lineHeight: 1.4
                  }}>
                    {product.name}
                  </h3>
                  
                  {product.price && (
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#ff8b2a'
                    }}>
                      ${product.price.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}